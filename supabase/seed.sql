-- ==============================================================================
-- PELUQUERÍA ARXEMIL - SEED INICIAL DE DATOS
-- Inserta la sede de Lugo con sus servicios, barberos, horarios y citas iniciales.
-- ==============================================================================

-- 1. Insertar Negocio Principal
INSERT INTO businesses (
    id, name, slug, description, address, phone, email, logo_url, timezone, min_advance_hours, active
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Peluquería Arxemil',
    'arxemil-lugo',
    'Estudio de corte y barbería de vanguardia en pleno casco histórico de Lugo. Urban Precision & Character.',
    'Ronda de las Murallas, 27002 Lugo, Galicia, España',
    '666 666 666',
    'contacto@peluqueriaarchemil.com',
    'https://lh3.googleusercontent.com/aida/AEtjO1W31D7vtAoQVq_o2NvlLraVXD9Kd68CmehJ_prHpwPWeEt8pVoklbGdvZiZg01ZHUARSh0Uej4lymP4NqzgDYZGt3jMIWlmRDTQyqMQh8qp2rlXhr5GYnzSlk5DRnv7xfInHejfGFnex_II1R6B1SDzeglp5YmcbwLaey-DJNANjYJIAwbfjG0ZtBB8kdQzPxKqzi6ejvP67dS1773yygPHJSYx4ePcHaaEjpGl4Nq0R4zhS23qLx-VVq8',
    'Europe/Madrid',
    2,
    true
) ON CONFLICT (slug) DO NOTHING;

-- 2. Insertar Servicios Oficiales
INSERT INTO services (id, business_id, name, slug, description, duration_minutes, price, tag, includes, is_popular, active, display_order) VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Corte de pelo',
    'corte-de-pelo',
    'Incluye asesoramiento morfológico completo, técnica de degradado (skin fade, taper o low fade) o corte a tijera clásico, y peinado finish con producto prémium.',
    45,
    15.00,
    'Básico Studio',
    ARRAY['Lavado y masaje capilar', 'Asesoramiento morfológico', 'Peinado con cera mate/polvos'],
    false,
    true,
    1
),
(
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Corte de pelo con cejas',
    'corte-pelo-cejas',
    'Corte completo personalizado más perfilado, despeje del entrecejo y limpieza natural de cejas con navaja para un marco facial limpio y definido.',
    50,
    17.00,
    'Perfilado & Mirada',
    ARRAY['Corte personalizado completo', 'Perfilado a navaja de cejas', 'Lavado y acabado con cera'],
    false,
    true,
    2
),
(
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'Corte con barba',
    'corte-con-barba',
    'Corte de pelo a medida junto al ritual completo de barba: recorte volumétrico, aplicación de toalla caliente, aceite hidratante y contorneado de precisión.',
    55,
    19.00,
    'Más Solicitado',
    ARRAY['Corte a tijera o máquina', 'Ritual de barba con toalla caliente', 'Aceite nutritivo y bálsamo'],
    true,
    true,
    3
),
(
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'Corte + barba + cejas',
    'corte-barba-cejas',
    'El servicio definitivo de cuidado integral y máxima definición masculina. Corte pulido, barba esculpida con toalla aromática y cejas perfiladas.',
    60,
    20.00,
    'Full Grooming',
    ARRAY['Tratamiento total de imagen', 'Esculpido de barba de autor', 'Limpieza y perfilado de cejas'],
    false,
    true,
    4
) ON CONFLICT DO NOTHING;

-- 3. Insertar Barberos / Trabajadores
INSERT INTO workers (id, business_id, name, slug, role_title, chair_name, photo_url, description, specialties, active, display_order) VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Darío',
    'dario',
    'Co-fundador & Master Barber',
    'Sillón Técnico 01',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAwkWeWeMa_McmQi396wldm_gSErgjAalWIpwqv-EGRMviHNhT3vO_IM7ZbCIioX8OvdvI51o8wmnZ6AuSqfSP71jO6SnxAN6xDLRdC8nsJqrle1USa-qDEKI0eCp72F2g9Rddhb9AWzwgAXbsC83EMx9Jh44gUFYiI5BAImaAkpNecAK0L2aKabrAgDrWzVNyP5c6h2HkBHN40BeVv-NrWTOqVjChwS5M4xLtsn8dEraSgti5RB0ufag',
    'Especialista en degradados skin fade al milímetro, texturizados modernos, crop cuts y transiciones ultra suaves.',
    ARRAY['Skin Fade', 'Texture Crop', 'Diseño de Líneas'],
    true,
    1
),
(
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Reija',
    'reija',
    'Co-fundador & Hair Artist',
    'Sillón Técnico 02',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDk1VafjCAXTrgAVUvv5RUPMydssGs9K5ktTrUfqdQTfYQP7MrKYm84CnEDRt7ww6A8Orqwarm4JZpD9Nbau3jZ2qwasveQsD-3yybZ-vlda_cqTmNqFwqO_lFg6RMJNLgG6wWlfYoormyPQUyEx0inHR5Y2o58gffu_HoNJmCuO4xh5CvhXqFC8tgNROHTK3dLuEtOvq73NYwaRdTvzJRARFwDdML7iucb-GZ-VuCzfhf9BroZu4QhOQ',
    'Especialista en técnica clásica de tijera, estilismo personalizado según caída natural del cabello y afeitado tradicional a navaja.',
    ARRAY['Corte a Tijera', 'Navaja Clásica', 'Styling Editorial'],
    true,
    2
),
(
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'Iago',
    'iago',
    'Senior Stylist & Barber',
    'Sillón Técnico 03',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAj4OI_DAE5VVaWCrIPNZGfqjYIkXLyxw-Mn2tsoyGb8wN0XiM5unemvU1BaeolgqhufqVIrw-laQXXwr3gXZVaLi9HEgRUs_kb_heVpCo_ln4bQCc51lMqvBVzqfCsru95rlxxAxXywV_eCu4O8LsOef52IGc343luz6t7RQMnEW5KwXKRPnqDP0mtMFXPvDZiUFXB_fpQoMNHgjbVKclB3jlZjlHRTaL5M1Yo3UTns1cBR9Nt-39XoA',
    'Especialista en escultura y perfilado de barba, arquitectura de líneas urbanas, tapers afilados y tratamientos de acabado capilar.',
    ARRAY['Ritual Barba', 'Perfilado Navaja', 'Urban Sharp'],
    true,
    3
) ON CONFLICT DO NOTHING;

-- 4. Asociar Barberos con todos los Servicios (Habilitación 100%)
INSERT INTO worker_services (worker_id, service_id, business_id)
SELECT w.id, s.id, w.business_id
FROM workers w
CROSS JOIN services s
WHERE w.business_id = 'a0000000-0000-0000-0000-000000000001'
  AND s.business_id = 'a0000000-0000-0000-0000-000000000001'
ON CONFLICT (worker_id, service_id) DO NOTHING;

-- 5. Horario General del Negocio (Lunes a Viernes 09:00-14:00 y 16:00-20:00; Sáb-Dom cerrado)
INSERT INTO business_schedules (business_id, day_of_week, is_open, morning_open, morning_close, afternoon_open, afternoon_close) VALUES
('a0000000-0000-0000-0000-000000000001', 1, true,  '09:00:00', '14:00:00', '16:00:00', '20:00:00'), -- Lunes
('a0000000-0000-0000-0000-000000000001', 2, true,  '09:00:00', '14:00:00', '16:00:00', '20:00:00'), -- Martes
('a0000000-0000-0000-0000-000000000001', 3, true,  '09:00:00', '14:00:00', '16:00:00', '20:00:00'), -- Miércoles
('a0000000-0000-0000-0000-000000000001', 4, true,  '09:00:00', '14:00:00', '16:00:00', '20:00:00'), -- Jueves
('a0000000-0000-0000-0000-000000000001', 5, true,  '09:00:00', '14:00:00', '16:00:00', '20:00:00'), -- Viernes
('a0000000-0000-0000-0000-000000000001', 6, false, null, null, null, null),                               -- Sábado
('a0000000-0000-0000-0000-000000000001', 0, false, null, null, null, null)                                -- Domingo
ON CONFLICT (business_id, day_of_week) DO NOTHING;

-- 6. Horarios Individuales para los 3 Barberos
INSERT INTO worker_schedules (worker_id, business_id, day_of_week, is_active_day, morning_start, morning_end, afternoon_start, afternoon_end)
SELECT w.id, 'a0000000-0000-0000-0000-000000000001', d.day, true, '09:00:00'::TIME, '14:00:00'::TIME, '16:00:00'::TIME, '20:00:00'::TIME
FROM workers w
CROSS JOIN (VALUES (1), (2), (3), (4), (5)) AS d(day)
WHERE w.business_id = 'a0000000-0000-0000-0000-000000000001'
ON CONFLICT (worker_id, day_of_week) DO NOTHING;

-- 7. Citas de Ejemplo Iniciales (Demostración de concordancia con mockData.js)
INSERT INTO appointments (
    id, business_id, worker_id, service_id, appointment_code, customer_name, customer_phone, customer_email,
    appointment_date, start_time, end_time, total_price, status, starts_at, ends_at
) VALUES
(
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001', -- Darío
    'b0000000-0000-0000-0000-000000000001', -- Corte de pelo
    '#ARX-2025-981',
    'Alberto R.',
    '611 223 344',
    'alberto.r@example.com',
    '2025-10-24',
    '09:00:00',
    '09:45:00',
    15.00,
    'completed',
    '2025-10-24 09:00:00+02',
    '2025-10-24 09:45:00+02'
),
(
    'd0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002', -- Reija
    'b0000000-0000-0000-0000-000000000003', -- Corte con barba
    '#ARX-2025-982',
    'David Fernández',
    '644 112 233',
    'david.f@example.com',
    '2025-10-24',
    '09:00:00',
    '09:55:00',
    19.00,
    'completed',
    '2025-10-24 09:00:00+02',
    '2025-10-24 09:55:00+02'
),
(
    'd0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000003', -- Iago
    'b0000000-0000-0000-0000-000000000002', -- Corte con cejas
    '#ARX-2025-983',
    'Manuel Soto',
    '688 990 011',
    'manuel.s@example.com',
    '2025-10-24',
    '09:00:00',
    '09:50:00',
    17.00,
    'completed',
    '2025-10-24 09:00:00+02',
    '2025-10-24 09:50:00+02'
),
(
    'd0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001', -- Darío
    'b0000000-0000-0000-0000-000000000004', -- Corte + Barba + Cejas
    '#ARX-2025-984',
    'Marcos L.',
    '660 554 433',
    'marcos.l@example.com',
    '2025-10-24',
    '16:00:00',
    '17:00:00',
    20.00,
    'confirmed',
    '2025-10-24 16:00:00+02',
    '2025-10-24 17:00:00+02'
) ON CONFLICT DO NOTHING;
