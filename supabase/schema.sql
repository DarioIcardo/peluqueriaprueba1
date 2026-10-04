-- ==============================================================================
-- PELUQUERÍA ARXEMIL & PLATAFORMA MULTI-TENANT DE RESERVAS
-- Esquema de Base de Datos para Supabase (PostgreSQL)
-- Versión IDEMPOTENTE: Ejecutable de forma segura múltiples veces sobre
-- bases de datos nuevas o parcialmente inicializadas sin borrar tablas ni datos.
-- ==============================================================================

-- 1. EXTENSIONES REQUERIDAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ==============================================================================
-- 2. TIPOS ENUM PERSONALIZADOS
-- ==============================================================================
DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('confirmed', 'cancelled', 'completed', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('owner', 'admin', 'staff');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE exception_type AS ENUM ('holiday', 'vacation', 'special_closure', 'sick_leave', 'schedule_override');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 3. FUNCIÓN UTILITARIA PARA TIMESTAMP updated_at
-- ==============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 4. TABLA: businesses (Negocios independientes / Tenants)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150) NOT NULL,
    logo_url TEXT,
    timezone VARCHAR(50) NOT NULL DEFAULT 'Europe/Madrid',
    currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
    currency_symbol VARCHAR(5) NOT NULL DEFAULT '€',
    min_advance_hours INT NOT NULL DEFAULT 2,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_businesses_updated_at ON businesses;
CREATE TRIGGER trg_businesses_updated_at
    BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- 5. TABLA: business_users (Perfiles y permisos de administradores por negocio)
-- Relaciona auth.users de Supabase con el negocio que administra
-- ==============================================================================
CREATE TABLE IF NOT EXISTS business_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_business_user UNIQUE (business_id, user_id)
);

DROP TRIGGER IF EXISTS trg_business_users_updated_at ON business_users;
CREATE TRIGGER trg_business_users_updated_at
    BEFORE UPDATE ON business_users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- 6. TABLA: workers (Trabajadores / Barberos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100),
    role_title VARCHAR(100), -- Ej: "Master Barber", "Co-fundador & Stylist"
    chair_name VARCHAR(50),  -- Ej: "Sillón Técnico 01"
    photo_url TEXT,
    description TEXT,
    specialties TEXT[],      -- Ej: ARRAY['Skin Fade', 'Ritual Barba']
    active BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Restricción única para habilitar claves foráneas compuestas de aislamiento de tenant
    CONSTRAINT uq_workers_id_business UNIQUE (id, business_id)
);

DROP TRIGGER IF EXISTS trg_workers_updated_at ON workers;
CREATE TRIGGER trg_workers_updated_at
    BEFORE UPDATE ON workers
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- 7. TABLA: services (Catálogo de Servicios y Tarifas)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150),
    description TEXT,
    duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    tag VARCHAR(50),         -- Ej: "Más Solicitado", "Básico Studio"
    includes TEXT[],         -- Ej: ARRAY['Lavado', 'Masaje capilar']
    is_popular BOOLEAN NOT NULL DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Restricción única para habilitar claves foráneas compuestas de aislamiento de tenant
    CONSTRAINT uq_services_id_business UNIQUE (id, business_id)
);

DROP TRIGGER IF EXISTS trg_services_updated_at ON services;
CREATE TRIGGER trg_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- 8. TABLA: worker_services (Relación N a N entre Trabajadores y Servicios)
-- Protegida con claves foráneas compuestas: IMPOSIBLE cruzar worker y service de distintos negocios
-- ==============================================================================
CREATE TABLE IF NOT EXISTS worker_services (
    worker_id UUID NOT NULL,
    service_id UUID NOT NULL,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    custom_price DECIMAL(10, 2),        -- Opcional si el barbero cobra tarifa especial
    custom_duration_minutes INT,        -- Opcional si el barbero tarda tiempo diferente
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (worker_id, service_id),
    -- Claves compuestas que garantizan pertenencia al MISMO negocio
    CONSTRAINT fk_worker_services_worker FOREIGN KEY (worker_id, business_id) 
        REFERENCES workers(id, business_id) ON DELETE CASCADE,
    CONSTRAINT fk_worker_services_service FOREIGN KEY (service_id, business_id) 
        REFERENCES services(id, business_id) ON DELETE CASCADE
);

-- ==============================================================================
-- 9. TABLA: business_schedules (Horarios Generales del Negocio)
-- Día de semana: 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
-- ==============================================================================
CREATE TABLE IF NOT EXISTS business_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    is_open BOOLEAN NOT NULL DEFAULT true,
    morning_open TIME,
    morning_close TIME,
    afternoon_open TIME,
    afternoon_close TIME,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_business_day UNIQUE (business_id, day_of_week),
    CONSTRAINT chk_business_schedule_times CHECK (
        (is_open = false) OR 
        (morning_open IS NOT NULL AND morning_close IS NOT NULL AND morning_open < morning_close)
    )
);

DROP TRIGGER IF EXISTS trg_business_schedules_updated_at ON business_schedules;
CREATE TRIGGER trg_business_schedules_updated_at
    BEFORE UPDATE ON business_schedules
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- 10. TABLA: worker_schedules (Horarios Individuales por Trabajador)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS worker_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    is_active_day BOOLEAN NOT NULL DEFAULT true,
    morning_start TIME,
    morning_end TIME,
    afternoon_start TIME,
    afternoon_end TIME,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_worker_day UNIQUE (worker_id, day_of_week),
    CONSTRAINT fk_worker_schedules_worker FOREIGN KEY (worker_id, business_id) 
        REFERENCES workers(id, business_id) ON DELETE CASCADE,
    CONSTRAINT chk_worker_schedule_times CHECK (
        (is_active_day = false) OR 
        (morning_start IS NOT NULL AND morning_end IS NOT NULL AND morning_start < morning_end)
    )
);

DROP TRIGGER IF EXISTS trg_worker_schedules_updated_at ON worker_schedules;
CREATE TRIGGER trg_worker_schedules_updated_at
    BEFORE UPDATE ON worker_schedules
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- 11. TABLA: schedule_exceptions (Excepciones, Festivos, Cierres y Vacaciones)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS schedule_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    worker_id UUID,                     -- NULL si aplica a todo el negocio
    exception_type exception_type NOT NULL DEFAULT 'holiday',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME,                     -- NULL si es el día completo
    end_time TIME,                       -- NULL si es el día completo
    is_closed_all_day BOOLEAN NOT NULL DEFAULT true,
    reason VARCHAR(200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_exception_date_range CHECK (start_date <= end_date),
    CONSTRAINT fk_schedule_exceptions_worker FOREIGN KEY (worker_id, business_id) 
        REFERENCES workers(id, business_id) ON DELETE CASCADE
);

DROP TRIGGER IF EXISTS trg_schedule_exceptions_updated_at ON schedule_exceptions;
CREATE TRIGGER trg_schedule_exceptions_updated_at
    BEFORE UPDATE ON schedule_exceptions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- 12. TABLA: appointments (Citas y Reservas)
-- Protegida con claves foráneas compuestas anti-cruce de tenant
-- y restricción de exclusión anti doble reserva (EXCLUDE GIST)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL,
    service_id UUID NOT NULL,
    appointment_code VARCHAR(30) NOT NULL, -- Ej: #ARX-2025-984
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
    status appointment_status NOT NULL DEFAULT 'confirmed',
    notes TEXT,
    -- Columnas temporales con zona horaria UTC para indexación y restricción de solapamiento
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_appointment_times CHECK (start_time < end_time AND starts_at < ends_at),
    
    -- Claves foráneas compuestas: El trabajador y el servicio DEBEN pertenecer al business_id de la cita
    CONSTRAINT fk_appointments_worker FOREIGN KEY (worker_id, business_id) 
        REFERENCES workers(id, business_id) ON DELETE RESTRICT,
    CONSTRAINT fk_appointments_service FOREIGN KEY (service_id, business_id) 
        REFERENCES services(id, business_id) ON DELETE RESTRICT,
    
    -- RESTRICCIÓN DE EXCLUSIÓN ANTI DOBLE RESERVA:
    -- Intervalo semiabierto [starts_at, ends_at) que:
    -- 1) Impide solapamientos para el mismo trabajador.
    -- 2) Permite citas adyacentes exactas (ej. 10:00-11:00 y 11:00-12:00).
    -- 3) Ignora citas con status = 'cancelled'.
    CONSTRAINT no_overlapping_appointments EXCLUDE USING gist (
        worker_id WITH =,
        tstzrange(starts_at, ends_at, '[)') WITH &&
    ) WHERE (status != 'cancelled')
);

DROP TRIGGER IF EXISTS trg_appointments_updated_at ON appointments;
CREATE TRIGGER trg_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- 13. ÍNDICES DE ALTO RENDIMIENTO
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
CREATE INDEX IF NOT EXISTS idx_business_users_user ON business_users(user_id);
CREATE INDEX IF NOT EXISTS idx_workers_business ON workers(business_id) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_services_business ON services(business_id) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_appointments_business_date ON appointments(business_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_worker_date ON appointments(worker_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_exceptions_business_dates ON schedule_exceptions(business_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_exceptions_worker_dates ON schedule_exceptions(worker_id, start_date, end_date);

-- ==============================================================================
-- 14. SEGURIDAD: ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Función helper blindada: Comprueba si auth.uid() administra un negocio específico
CREATE OR REPLACE FUNCTION is_business_admin(target_business_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM business_users 
        WHERE business_id = target_business_id 
          AND user_id = auth.uid()
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- POLÍTICAS: businesses
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view active businesses" ON businesses;
CREATE POLICY "Public can view active businesses"
    ON businesses FOR SELECT
    USING (active = true);

DROP POLICY IF EXISTS "Admins can update their own business" ON businesses;
CREATE POLICY "Admins can update their own business"
    ON businesses FOR UPDATE
    USING (is_business_admin(id))
    WITH CHECK (is_business_admin(id));

-- ------------------------------------------------------------------------------
-- POLÍTICAS: business_users
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own business user memberships" ON business_users;
CREATE POLICY "Users can view their own business user memberships"
    ON business_users FOR SELECT
    USING (user_id = auth.uid() OR is_business_admin(business_id));

-- ------------------------------------------------------------------------------
-- POLÍTICAS: workers
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view active workers" ON workers;
CREATE POLICY "Public can view active workers"
    ON workers FOR SELECT
    USING (active = true);

DROP POLICY IF EXISTS "Admins can manage workers of their business" ON workers;
CREATE POLICY "Admins can manage workers of their business"
    ON workers FOR ALL
    USING (is_business_admin(business_id))
    WITH CHECK (is_business_admin(business_id));

-- ------------------------------------------------------------------------------
-- POLÍTICAS: services
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view active services" ON services;
CREATE POLICY "Public can view active services"
    ON services FOR SELECT
    USING (active = true);

DROP POLICY IF EXISTS "Admins can manage services of their business" ON services;
CREATE POLICY "Admins can manage services of their business"
    ON services FOR ALL
    USING (is_business_admin(business_id))
    WITH CHECK (is_business_admin(business_id));

-- ------------------------------------------------------------------------------
-- POLÍTICAS: worker_services
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view active worker services" ON worker_services;
CREATE POLICY "Public can view active worker services"
    ON worker_services FOR SELECT
    USING (
        EXISTS (
            SELECT 1 
            FROM workers w
            JOIN services s ON s.id = worker_services.service_id AND s.active = true
            WHERE w.id = worker_services.worker_id 
              AND w.active = true
        )
    );

DROP POLICY IF EXISTS "Admins can manage worker services" ON worker_services;
CREATE POLICY "Admins can manage worker services"
    ON worker_services FOR ALL
    USING (is_business_admin(business_id))
    WITH CHECK (is_business_admin(business_id));

-- ------------------------------------------------------------------------------
-- POLÍTICAS: business_schedules & worker_schedules
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view business schedules" ON business_schedules;
CREATE POLICY "Public can view business schedules"
    ON business_schedules FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can manage business schedules" ON business_schedules;
CREATE POLICY "Admins can manage business schedules"
    ON business_schedules FOR ALL
    USING (is_business_admin(business_id))
    WITH CHECK (is_business_admin(business_id));

DROP POLICY IF EXISTS "Public can view worker schedules" ON worker_schedules;
CREATE POLICY "Public can view worker schedules"
    ON worker_schedules FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can manage worker schedules" ON worker_schedules;
CREATE POLICY "Admins can manage worker schedules"
    ON worker_schedules FOR ALL
    USING (is_business_admin(business_id))
    WITH CHECK (is_business_admin(business_id));

-- ------------------------------------------------------------------------------
-- POLÍTICAS: schedule_exceptions
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view schedule exceptions" ON schedule_exceptions;
CREATE POLICY "Public can view schedule exceptions"
    ON schedule_exceptions FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can manage schedule exceptions" ON schedule_exceptions;
CREATE POLICY "Admins can manage schedule exceptions"
    ON schedule_exceptions FOR ALL
    USING (is_business_admin(business_id))
    WITH CHECK (is_business_admin(business_id));

-- ------------------------------------------------------------------------------
-- POLÍTICAS: appointments (Citas)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can create appointments" ON appointments;
CREATE POLICY "Public can create appointments"
    ON appointments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM businesses b
            JOIN workers w ON w.id = appointments.worker_id AND w.business_id = b.id AND w.active = true
            JOIN services s ON s.id = appointments.service_id AND s.business_id = b.id AND s.active = true
            WHERE b.id = appointments.business_id 
              AND b.active = true
        )
    );

DROP POLICY IF EXISTS "Admins can manage appointments of their business" ON appointments;
CREATE POLICY "Admins can manage appointments of their business"
    ON appointments FOR ALL
    USING (is_business_admin(business_id))
    WITH CHECK (is_business_admin(business_id));

-- PRIVACIDAD TOTAL: Los clientes públicos NO tienen SELECT sobre appointments.
-- La disponibilidad de slots se calcula sin exponer datos de clientes.
