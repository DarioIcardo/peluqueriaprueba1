/**
 * Peluquería Arxemil - Capa de Datos Estructurada (Mock Data & Schemas)
 * Preparado para conectarse directamente con Supabase en la siguiente fase.
 */

export const BUSINESS_DATA = {
  id: 'arxemil-lugo-001',
  name: 'Peluquería Arxemil',
  tagline: 'Urban Precision & Character',
  address: 'Ronda de las Murallas, 27002 Lugo, Galicia, España',
  phone: '666 666 666',
  email: 'contacto@peluqueriaarchemil.com',
  instagram: '@peluqueria_arxemil',
  tiktok: '@peluqueria_arxemil',
  currency: 'EUR',
  symbol: '€',
  rules: {
    minAdvanceHours: 2,
    allowWalkIns: false,
    payOnSite: true,
    freeCancellation: true
  },
  generalSchedule: {
    weekdays: {
      morning: { start: '09:00', end: '14:00' },
      breakTime: { start: '14:00', end: '16:00' },
      afternoon: { start: '16:00', end: '20:00' },
      isOpen: true
    },
    saturday: { isOpen: false, note: 'Cerrado' },
    sunday: { isOpen: false, note: 'Cerrado' }
  }
};

export const SERVICES_DATA = [
  {
    id: 'srv-01',
    name: 'Corte de pelo',
    slug: 'corte-de-pelo',
    price: 15,
    durationMinutes: 45,
    tag: 'Básico Studio',
    description: 'Incluye asesoramiento morfológico completo, técnica de degradado (skin fade, taper o low fade) o corte a tijera clásico, y peinado finish con producto prémium.',
    includes: ['Lavado y masaje capilar', 'Asesoramiento morfológico', 'Peinado con cera mate/polvos'],
    isPopular: false
  },
  {
    id: 'srv-02',
    name: 'Corte de pelo con cejas',
    slug: 'corte-pelo-cejas',
    price: 17,
    durationMinutes: 50,
    tag: 'Perfilado & Mirada',
    description: 'Corte completo personalizado más perfilado, despeje del entrecejo y limpieza natural de cejas con navaja para un marco facial limpio y definido.',
    includes: ['Corte personalizado completo', 'Perfilado a navaja de cejas', 'Lavado y acabado con cera'],
    isPopular: false
  },
  {
    id: 'srv-03',
    name: 'Corte con barba',
    slug: 'corte-con-barba',
    price: 19,
    durationMinutes: 55,
    tag: 'Más Solicitado',
    description: 'Corte de pelo a medida junto al ritual completo de barba: recorte volumétrico, aplicación de toalla caliente, aceite hidratante y contorneado de precisión.',
    includes: ['Corte a tijera o máquina', 'Ritual de barba con toalla caliente', 'Aceite nutritivo y bálsamo'],
    isPopular: true
  },
  {
    id: 'srv-04',
    name: 'Corte + barba + cejas',
    slug: 'corte-barba-cejas',
    price: 20,
    durationMinutes: 60,
    tag: 'Full Grooming',
    description: 'El servicio definitivo de cuidado integral y máxima definición masculina. Corte pulido, barba esculpida con toalla aromática y cejas perfiladas.',
    includes: ['Tratamiento total de imagen', 'Esculpido de barba de autor', 'Limpieza y perfilado de cejas'],
    isPopular: false
  }
];

export const BARBERS_DATA = [
  {
    id: 'barber-01',
    name: 'Darío',
    slug: 'dario',
    role: 'Co-fundador & Master Barber',
    chair: 'Sillón Técnico 01',
    specialty: 'Fade Master',
    status: 'available_today',
    statusLabel: 'Disponible hoy',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwkWeWeMa_McmQi396wldm_gSErgjAalWIpwqv-EGRMviHNhT3vO_IM7ZbCIioX8OvdvI51o8wmnZ6AuSqfSP71jO6SnxAN6xDLRdC8nsJqrle1USa-qDEKI0eCp72F2g9Rddhb9AWzwgAXbsC83EMx9Jh44gUFYiI5BAImaAkpNecAK0L2aKabrAgDrWzVNyP5c6h2HkBHN40BeVv-NrWTOqVjChwS5M4xLtsn8dEraSgti5RB0ufag',
    description: 'Especialista en degradados skin fade al milímetro, texturizados modernos, crop cuts y transiciones ultra suaves.',
    tags: ['Skin Fade', 'Texture Crop', 'Diseño de Líneas'],
    enabledServices: ['srv-01', 'srv-02', 'srv-03', 'srv-04']
  },
  {
    id: 'barber-02',
    name: 'Reija',
    slug: 'reija',
    role: 'Co-fundador & Hair Artist',
    chair: 'Sillón Técnico 02',
    specialty: 'Beard Specialist',
    status: 'available_today',
    statusLabel: 'Disponible hoy',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDk1VafjCAXTrgAVUvv5RUPMydssGs9K5ktTrUfqdQTfYQP7MrKYm84CnEDRt7ww6A8Orqwarm4JZpD9Nbau3jZ2qwasveQsD-3yybZ-vlda_cqTmNqFwqO_lFg6RMJNLgG6wWlfYoormyPQUyEx0inHR5Y2o58gffu_HoNJmCuO4xh5CvhXqFC8tgNROHTK3dLuEtOvq73NYwaRdTvzJRARFwDdML7iucb-GZ-VuCzfhf9BroZu4QhOQ',
    description: 'Especialista en técnica clásica de tijera, estilismo personalizado según caída natural del cabello y afeitado tradicional a navaja.',
    tags: ['Corte a Tijera', 'Navaja Clásica', 'Styling Editorial'],
    enabledServices: ['srv-01', 'srv-02', 'srv-03', 'srv-04']
  },
  {
    id: 'barber-03',
    name: 'Iago',
    slug: 'iago',
    role: 'Senior Stylist & Barber',
    chair: 'Sillón Técnico 03',
    specialty: 'Texture & Sculpt',
    status: 'limited_slots',
    statusLabel: 'Pocas citas hoy',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAj4OI_DAE5VVaWCrIPNZGfqjYIkXLyxw-Mn2tsoyGb8wN0XiM5unemvU1BaeolgqhufqVIrw-laQXXwr3gXZVaLi9HEgRUs_kb_heVpCo_ln4bQCc51lMqvBVzqfCsru95rlxxAxXywV_eCu4O8LsOef52IGc343luz6t7RQMnEW5KwXKRPnqDP0mtMFXPvDZiUFXB_fpQoMNHgjbVKclB3jlZjlHRTaL5M1Yo3UTns1cBR9Nt-39XoA',
    description: 'Especialista en escultura y perfilado de barba, arquitectura de líneas urbanas, tapers afilados y tratamientos de acabado capilar.',
    tags: ['Ritual Barba', 'Perfilado Navaja', 'Urban Sharp'],
    enabledServices: ['srv-01', 'srv-02', 'srv-03', 'srv-04']
  }
];

export const MOCK_APPOINTMENTS = [
  {
    id: 'apt-001',
    code: '#ARX-2025-981',
    barberId: 'barber-01',
    serviceId: 'srv-01',
    serviceName: 'Corte de pelo',
    clientName: 'Alberto R.',
    clientPhone: '611 223 344',
    clientEmail: 'alberto.r@example.com',
    date: '2025-10-24',
    time: '09:00',
    durationMinutes: 45,
    price: 15,
    status: 'completed'
  },
  {
    id: 'apt-002',
    code: '#ARX-2025-982',
    barberId: 'barber-02',
    serviceId: 'srv-03',
    serviceName: 'Corte con barba',
    clientName: 'David Fernández',
    clientPhone: '644 112 233',
    clientEmail: 'david.f@example.com',
    date: '2025-10-24',
    time: '09:00',
    durationMinutes: 55,
    price: 19,
    status: 'completed'
  },
  {
    id: 'apt-003',
    code: '#ARX-2025-983',
    barberId: 'barber-03',
    serviceId: 'srv-02',
    serviceName: 'Corte con cejas',
    clientName: 'Manuel Soto',
    clientPhone: '688 990 011',
    clientEmail: 'manuel.s@example.com',
    date: '2025-10-24',
    time: '09:00',
    durationMinutes: 50,
    price: 17,
    status: 'completed'
  },
  {
    id: 'apt-004',
    code: '#ARX-2025-984',
    barberId: 'barber-01',
    serviceId: 'srv-04',
    serviceName: 'Corte + Barba + Cejas',
    clientName: 'Marcos L.',
    clientPhone: '660 554 433',
    clientEmail: 'marcos.l@example.com',
    date: '2025-10-24',
    time: '16:00',
    durationMinutes: 60,
    price: 20,
    status: 'in_progress'
  },
  {
    id: 'apt-005',
    code: '#ARX-2025-985',
    barberId: 'barber-01',
    serviceId: 'srv-03',
    serviceName: 'Corte con barba',
    clientName: 'Juan Pérez',
    clientPhone: '610 998 877',
    clientEmail: 'juan@ejemplo.com',
    date: '2025-10-24',
    time: '17:50',
    durationMinutes: 55,
    price: 19,
    status: 'scheduled'
  }
];
