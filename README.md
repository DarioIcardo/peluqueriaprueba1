# Peluquería Arxemil · Urban Precision Grooming Hub (Lugo)

Aplicación web profesional, limpia y responsive para la barbería **Peluquería Arxemil** (Ronda de las Murallas, Lugo), originada a partir de los diseños de Google Stitch y estructurada con arquitectura modular lista para la integración con **Supabase** y el motor de reservas.

---

## 1. Identidad Visual y Diseño (Google Stitch)
- **Tema:** *Modern Technical Noir* (Dark Mode de alto contraste).
- **Paleta Principal:** Obsidian Slate (`#0f131c`, `#181b25`, `#1c1f29`), Cyber Gold (`#facc15`), Burnished Amber (`#ffb95f`), Titanium White (`#dfe2ef`).
- **Tipografías:**
  - **Display / Titulares:** `Syne` (800 / 700 / 600)
  - **Cuerpo / Lectura:** `Plus Jakarta Sans` (400 / 500 / 600 / 700)
  - **Etiquetas / Números / Horas:** `Space Grotesk` (500 / 600 / 700)
- **Iconografía:** Google Material Symbols Outlined.

---

## 2. Estructura del Proyecto

```
pruebapeluqieria/
├── index.html                      # Página principal (Parte pública)
├── reservar.html                   # Asistente de Reserva Online (6 pasos)
├── admin.html                      # Panel de Administración (Cockpit Backoffice)
├── README.md                       # Documentación técnica y arquitectura
├── assets/
│   ├── css/
│   │   └── main.css                # Estilos base, barras de scroll, efectos y animaciones
│   └── js/
│       ├── public.js               # Menú móvil, smooth scroll y enlaces públicos
│       ├── booking.js              # Controlador reactivo del wizard de reserva (pasos 1 a 6)
│       ├── admin.js                # Tabs de backoffice, agenda en vivo, filtros y modales
│       └── data/
│           └── mockData.js         # Esquemas y datos de prueba desacoplados (preparados para Supabase)
└── [carpetas originales de Stitch] # Respaldos y capturas originales (DESIGN.md, screen.png)
```

---

## 3. Separación de Capas y Arquitectura

1. **Parte Pública (`index.html` + `assets/js/public.js`):**
   - Hero dinámico con titulares y prueba social (4.9 ★ en Google Maps).
   - Filosofía y narrativa de los fundadores (3 años en Ronda de las Murallas).
   - Catálogo exacto de 4 servicios con precios (15 € a 20 €) y duraciones.
   - Perfil de los 3 barberos oficiales (Darío, Reija, Iago).
   - Ubicación en mapa estilizado, horarios de atención y contacto telefónico.
   - Navegación responsive con menú drawer para móviles y tablets.

2. **Sistema de Reservas (`reservar.html` + `assets/js/booking.js`):**
   - Wizard interactivo en 6 pasos sin recarga de página:
     1. **Servicio:** Tarjetas con precio, duración e indicador visual.
     2. **Profesional:** Cualquier profesional, Darío, Reija o Iago.
     3. **Fecha:** Matriz de calendario mensual con fines de semana inhabilitados.
     4. **Hora:** Turnos de mañana (09:00 - 14:00) y tarde (16:00 - 20:00).
     5. **Tus Datos:** Formulario estricto de solo 3 campos (Nombre y Apellidos, Teléfono +34, Email).
     6. **Confirmación:** Ticket detallado con desglose de precios y aviso de cobro en local.
   - Preselección automática por URL (`?service=...` o `?barber=...`).
   - Modal de confirmación de cita con código `#ARX-2025-984`.

3. **Panel de Administración (`admin.html` + `assets/js/admin.js`):**
   - Barra lateral responsive (fija en escritorio, drawer deslizable en móvil).
   - KPIs de negocio: 18/18 citas de hoy, facturación estimada (324 €), 3 sillones activos, jornada técnica.
   - **Pestaña 1 - Agenda en Vivo:** Vista por columnas de sillón/barbero, indicador láser de tiempo actual en vivo, buscador instantáneo de clientes y filtro por profesional.
   - **Pestaña 2 - Gestión de Servicios:** Tarjetas de tarifas y modal de edición/creación rápida.
   - **Pestaña 3 - Equipo & Cuadrantes:** Fichas de los 3 barberos con horario L-V y capacidades.
   - **Pestaña 4 - Configuración:** Parámetros de negocio, sede física, contacto y política anti walk-in.

4. **Capa de Datos y Negocio (`assets/js/data/mockData.js`):**
   - Modelos estructurados para `BUSINESS_DATA`, `SERVICES_DATA`, `BARBERS_DATA` y `MOCK_APPOINTMENTS`.

---

## 4. Preparación para la Siguiente Fase (Supabase & Backend)

El proyecto cuenta con una separación limpia para conectar directamente en la siguiente fase:
- Tablas SQL en Supabase: `businesses`, `workers`, `services`, `schedules`, `worker_schedules`, `appointments`.
- Autenticación Supabase Auth para administradores / barberos.
- Lógica de cálculo dinámico de huecos libres (slots) según duración de servicios y citas existentes.
