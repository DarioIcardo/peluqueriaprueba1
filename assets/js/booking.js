/**
 * Peluquería Arxemil - Sistema de Reserva Online (Booking Wizard)
 * Flujo modular de 6 pasos con persistencia real en Supabase (Fase 4).
 */

import {
  getBusiness,
  getServices,
  getWorkers,
  getWorkerServices,
  getBusinessSchedules,
  getWorkerSchedules,
  getScheduleExceptions,
  getAvailableTimeSlots,
  createAppointment
} from './lib/supabaseService.js';
import {
  BUSINESS_DATA,
  SERVICES_DATA,
  BARBERS_DATA
} from './data/mockData.js';

// ==============================================================================
// 1. ESTADO GLOBAL DEL WIZARD (REACTIVO Y LIMPIO)
// ==============================================================================

window.bookingState = {
  currentStep: 1,
  selectedService: null,     // Objeto del servicio elegido en el Paso 1
  selectedBarber: null,      // Objeto del barbero elegido en el Paso 2
  selectedDate: null,        // Texto de fecha legible (ej: "Lunes, 14 de Octubre de 2026")
  selectedDateIso: null,     // Fecha ISO "YYYY-MM-DD" elegida en el Paso 3
  selectedTime: null,        // Hora de inicio legible (ej: "09:00")
  selectedTimeStart: null,   // "09:00:00"
  selectedTimeEnd: null,     // "09:45:00"
  assignedWorkerId: null,    // ID real del profesional asignado
  assignedWorkerName: null,  // Nombre del profesional asignado
  clientData: {
    name: 'Juan Pérez',
    phone: '666 123 456',
    email: 'juan@ejemplo.com'
  },
  currentCalendarViewDate: new Date(),
  business: null,
  services: SERVICES_DATA,
  workers: BARBERS_DATA,
  workerServices: [],
  businessSchedules: [],
  workerSchedules: [],
  scheduleExceptions: [],
  isSubmitting: false         // Control anti doble envío
};

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_NAMES = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

// ==============================================================================
// 2. UTILIDADES DE CÓDIGO ÚNICO Y TIMESTAMPS CON ZONA HORARIA
// ==============================================================================

/**
 * Genera un código de cita único en formato ARX-YYYY-XXXX.
 * @returns {string}
 */
function generateUniqueBookingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const year = new Date().getFullYear();
  return `ARX-${year}-${randomPart}`;
}

/**
 * Muestra un mensaje de alerta/error visual claro al usuario y detiene el envío.
 * @param {string} message 
 * @param {number} [targetStep] 
 */
function showBookingAlert(message, targetStep = null) {
  const existingAlert = document.getElementById('booking-validation-alert');
  if (existingAlert) {
    existingAlert.remove();
  }

  const alertContainer = document.createElement('div');
  alertContainer.id = 'booking-validation-alert';
  alertContainer.className = 'w-full p-4 mb-4 rounded-2xl bg-error-container text-on-error-container border border-error/60 flex items-center justify-between gap-3 shadow-xl transition-all';
  alertContainer.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="material-symbols-outlined text-2xl text-error shrink-0">error</span>
      <span class="font-body-md text-body-md font-bold text-on-error-container">${message}</span>
    </div>
    <button type="button" class="p-1 rounded-lg hover:bg-error-container/80 text-on-error-container transition-colors" onclick="this.parentElement.remove()">
      <span class="material-symbols-outlined text-lg">close</span>
    </button>
  `;

  const stage = document.getElementById('wizard-stage-container') || document.getElementById('step-pane-6');
  if (stage) {
    stage.prepend(alertContainer);
    alertContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  alert(message);

  if (targetStep) {
    window.goToStep(targetStep);
  }
}

/**
 * Limpia por completo el estado local de la reserva tras una confirmación exitosa.
 */
function resetBookingState() {
  window.bookingState.currentStep = 1;
  window.bookingState.selectedService = null;
  window.bookingState.selectedBarber = null;
  window.bookingState.selectedDate = null;
  window.bookingState.selectedDateIso = null;
  window.bookingState.selectedTime = null;
  window.bookingState.selectedTimeStart = null;
  window.bookingState.selectedTimeEnd = null;
  window.bookingState.assignedWorkerId = null;
  window.bookingState.assignedWorkerName = null;
  window.bookingState.clientData = {
    name: '',
    phone: '',
    email: ''
  };
  window.bookingState.isSubmitting = false;

  const nameInput = document.getElementById('client-name');
  const phoneInput = document.getElementById('client-phone');
  const emailInput = document.getElementById('client-email');
  if (nameInput) nameInput.value = '';
  if (phoneInput) phoneInput.value = '';
  if (emailInput) emailInput.value = '';

  const existingAlert = document.getElementById('booking-validation-alert');
  if (existingAlert) existingAlert.remove();

  renderServices();
  renderWorkers();
  renderCalendar();
  renderTimeSlots();
  updateSummaryDetails();
}

/**
 * Muestra el modal de confirmación inyectando los datos completos de la cita.
 * @param {object} app 
 */
function showConfirmationModal(app) {
  const code = app.appointment_code || app.code || 'ARX-2026-0000';
  const displayCode = code.startsWith('#') ? code : `#${code}`;

  const modalCodeElem = document.getElementById('modal-summary-code');
  const modalDatetime = document.getElementById('modal-summary-datetime');
  const modalBarber = document.getElementById('modal-summary-barber');
  const modalService = document.getElementById('modal-summary-service');
  const modalPrice = document.getElementById('modal-summary-price');
  const modalClient = document.getElementById('modal-summary-client');

  if (modalCodeElem) modalCodeElem.innerText = displayCode;
  if (modalDatetime) modalDatetime.innerText = `${app.dateText || app.appointment_date || ''} · ${app.timeText || app.start_time || ''} h`;
  if (modalBarber) modalBarber.innerText = app.barberName || app.worker_name || 'Profesional asignado';
  if (modalService) modalService.innerText = app.serviceName || app.service_name || 'Servicio seleccionado';
  if (modalPrice) modalPrice.innerText = app.servicePrice || (app.total_price ? `${app.total_price} €` : '-- €');
  if (modalClient) modalClient.innerText = app.clientPhone ? `${app.clientName} (${app.clientPhone})` : (app.clientName || 'Cliente');

  const modal = document.getElementById('booking-success-modal');
  if (modal) {
    modal.classList.remove('hidden');
    window.scrollTo({ top: 100, behavior: 'smooth' });
  }
}

/**
 * Convierte fecha "YYYY-MM-DD" y hora "HH:MM:SS" en timestamp ISO con offset Europe/Madrid.
 * @param {string} dateIso 
 * @param {string} timeStr 
 * @returns {string}
 */
function formatTimestamptz(dateIso, timeStr) {
  const dtStr = `${dateIso}T${timeStr}`;
  const d = new Date(`${dateIso}T12:00:00Z`);
  const month = d.getUTCMonth() + 1;
  // Regla general de Horario de Verano en España (+02:00) vs Invierno (+01:00)
  let offset = '+02:00';
  if (month < 3 || month > 10) offset = '+01:00';
  if (month === 3) offset = d.getUTCDate() >= 25 ? '+02:00' : '+01:00';
  if (month === 10) offset = d.getUTCDate() < 25 ? '+02:00' : '+01:00';

  return `${dtStr}${offset}`;
}

// ==============================================================================
// 3. RENDERIZADO DE PASOS (SERVICIOS, PROFESIONALES, CALENDARIO Y HORAS)
// ==============================================================================

function renderServices() {
  const container = document.getElementById('booking-services-container');
  if (!container || window.bookingState.services.length === 0) return;

  container.innerHTML = window.bookingState.services.map(service => {
    const sel = window.bookingState.selectedService;
    const isSelected = Boolean(sel && (
      (sel.id != null && service.id != null && String(sel.id) === String(service.id)) ||
      (sel.slug && service.slug && sel.slug === service.slug) ||
      (sel.name && service.name && sel.name === service.name)
    ));
    const duration = service.duration_minutes || service.durationMinutes || 45;
    const price = typeof service.price === 'number' ? service.price : parseFloat(service.price);
    const isPopular = service.is_popular || service.isPopular;
    const slug = service.slug || 'corte-de-pelo';
    const name = service.name;
    const description = service.description || '';

    if (isSelected) {
      return `
        <div class="service-card active-service group cursor-pointer p-space-md rounded-2xl bg-surface-container-high shadow-[0_0_24px_-4px_rgba(250,204,21,0.3)] transition-all duration-200 flex flex-col justify-between gap-space-md relative overflow-hidden border border-primary-container/40" data-service-slug="${slug}" data-service-id="${service.id}">
          ${isPopular ? `<div class="absolute top-0 right-0 bg-primary-container text-on-primary-container font-label-sm text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl tracking-wider">Más Solicitado</div>` : ''}
          <div class="flex items-start justify-between gap-space-sm">
            <div class="flex flex-col gap-1">
              <span class="font-headline-sm text-headline-sm text-primary-container font-bold">${name}</span>
              <div class="flex items-center gap-1.5 text-on-surface font-label-sm text-label-sm">
                <span class="material-symbols-outlined text-[16px] text-primary-container">schedule</span>
                <span class="font-bold">${duration} min</span>
              </div>
            </div>
            <span class="font-headline-sm text-headline-sm text-primary-container px-3 py-1 bg-surface-container-lowest rounded-xl font-bold">${price} €</span>
          </div>
          <p class="font-body-sm text-body-sm text-on-surface">
            ${description}
          </p>
          <div class="flex items-center justify-between pt-space-xs">
            <span class="font-label-sm text-label-sm text-primary-container font-bold flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">check_circle</span> Seleccionado
            </span>
            <span class="material-symbols-outlined text-primary-container checkmark text-xl fill-active">check_circle</span>
          </div>
        </div>
      `;
    }

    return `
      <div class="service-card group cursor-pointer p-space-md rounded-2xl bg-surface-container transition-all duration-200 hover:bg-surface-container-high flex flex-col justify-between gap-space-md border border-surface-container-high/40" data-service-slug="${slug}" data-service-id="${service.id}">
        <div class="flex items-start justify-between gap-space-sm">
          <div class="flex flex-col gap-1">
            <span class="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary">${name}</span>
            <div class="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm">
              <span class="material-symbols-outlined text-[16px] text-primary">schedule</span>
              <span>${duration} min</span>
            </div>
          </div>
          <span class="font-headline-sm text-headline-sm text-on-surface px-3 py-1 bg-surface-container-lowest rounded-xl font-bold">${price} €</span>
        </div>
        <p class="font-body-sm text-body-sm text-on-surface-variant">
          ${description}
        </p>
        <div class="flex items-center justify-between pt-space-xs">
          <span class="font-label-sm text-label-sm text-outline group-hover:text-on-surface">Click para seleccionar</span>
          <span class="material-symbols-outlined text-outline group-hover:text-primary checkmark text-xl">radio_button_unchecked</span>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', () => {
      const serviceId = card.getAttribute('data-service-id');
      const service = window.bookingState.services.find(s => s.id === serviceId);
      if (service) {
        window.selectService(service);
      }
    });
  });
}

function renderWorkers() {
  const container = document.getElementById('booking-workers-container');
  if (!container) return;

  const selectedService = window.bookingState.selectedService;
  const allWorkers = window.bookingState.workers || [];
  const workerServices = window.bookingState.workerServices || [];

  let eligibleWorkers = allWorkers;
  if (selectedService && workerServices.length > 0) {
    const authorizedWorkerIds = new Set(
      workerServices
        .filter(ws => ws.service_id === selectedService.id)
        .map(ws => ws.worker_id)
    );
    if (authorizedWorkerIds.size > 0) {
      eligibleWorkers = allWorkers.filter(w => authorizedWorkerIds.has(w.id));
    }
  }

  const isAnySelected = window.bookingState.selectedBarber && window.bookingState.selectedBarber.id === 'any';
  
  const anyCardHtml = `
    <div class="barber-card ${isAnySelected ? 'active-barber bg-surface-container-high shadow-[0_0_24px_-4px_rgba(250,204,21,0.35)] border-primary-container/40' : 'bg-surface-container hover:bg-surface-container-high border-surface-container-high/40'} cursor-pointer p-space-md rounded-2xl transition-all flex flex-col items-center text-center gap-space-sm border" data-barber-slug="any" data-barber-id="any" data-prof-slug="any" data-prof-id="any">
      <div class="w-20 h-20 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface mb-2">
        <span class="material-symbols-outlined text-3xl text-primary">bolt</span>
      </div>
      <div class="flex flex-col">
        <span class="font-headline-sm text-headline-sm ${isAnySelected ? 'text-primary-container font-bold' : 'text-on-surface'}">Cualquier profesional</span>
        <span class="font-label-sm text-label-sm text-tertiary-fixed-dim mt-0.5 font-semibold">Mayor disponibilidad horaria</span>
      </div>
      <p class="font-body-sm text-body-sm text-on-surface-variant">
        Te asignamos la silla disponible más temprana de nuestro equipo oficial.
      </p>
      <div class="mt-auto pt-2 w-full flex justify-center">
        <span class="selected-badge ${isAnySelected ? '' : 'hidden'} px-3 py-1 rounded-full bg-primary-container/20 text-primary-container font-label-sm text-[11px] font-bold">Seleccionado</span>
        <span class="badge-hint ${isAnySelected ? 'hidden' : ''} px-3 py-1 rounded-full bg-surface-container-lowest font-label-sm text-[11px] text-outline">Recomendado si tienes prisa</span>
      </div>
    </div>
  `;

  const workerCardsHtml = eligibleWorkers.map(worker => {
    const isSelected = window.bookingState.selectedBarber && window.bookingState.selectedBarber.id === worker.id;
    const photo = worker.photo_url || worker.avatar || '';
    const role = worker.role_title || worker.role || 'Stylist & Barber';
    const name = worker.name;
    const slug = worker.slug || 'barber';
    const description = worker.description || 'Especialista en estilismo y corte de autor.';

    if (isSelected) {
      return `
        <div class="barber-card active-barber cursor-pointer p-space-md rounded-2xl bg-surface-container-high shadow-[0_0_24px_-4px_rgba(250,204,21,0.35)] transition-all flex flex-col items-center text-center gap-space-sm relative border border-primary-container/40" data-barber-slug="${slug}" data-barber-id="${worker.id}" data-prof-slug="${slug}" data-prof-id="${worker.id}">
          <div class="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container-lowest text-primary-container font-label-sm text-[10px]">
            <span class="w-1.5 h-1.5 rounded-full bg-primary-container animate-ping"></span>
            <span>Activo</span>
          </div>
          <div class="w-20 h-20 rounded-full overflow-hidden mb-2 bg-surface-container-lowest ring-2 ring-primary-container">
            <img class="w-full h-full object-cover" alt="Retrato de ${name}" src="${photo}"/>
          </div>
          <div class="flex flex-col">
            <span class="font-headline-sm text-headline-sm text-primary-container font-bold">${name}</span>
            <span class="font-label-sm text-label-sm text-on-surface font-semibold">${role}</span>
          </div>
          <p class="font-body-sm text-body-sm text-on-surface-variant">
            ${description}
          </p>
          <div class="mt-auto pt-2 w-full flex justify-center">
            <span class="selected-badge px-3 py-1 rounded-full bg-primary-container/20 text-primary-container font-label-sm text-[11px] font-bold">Seleccionado</span>
          </div>
        </div>
      `;
    }

    return `
      <div class="barber-card cursor-pointer p-space-md rounded-2xl bg-surface-container hover:bg-surface-container-high transition-all flex flex-col items-center text-center gap-space-sm border border-surface-container-high/40" data-barber-slug="${slug}" data-barber-id="${worker.id}" data-prof-slug="${slug}" data-prof-id="${worker.id}">
        <div class="w-20 h-20 rounded-full overflow-hidden mb-2 bg-surface-container-lowest">
          <img class="w-full h-full object-cover" alt="Retrato de ${name}" src="${photo}"/>
        </div>
        <div class="flex flex-col">
          <span class="font-headline-sm text-headline-sm text-on-surface">${name}</span>
          <span class="font-label-sm text-label-sm text-secondary-fixed-dim font-semibold">${role}</span>
        </div>
        <p class="font-body-sm text-body-sm text-on-surface-variant">
          ${description}
        </p>
        <div class="mt-auto pt-2 w-full flex justify-center">
          <span class="selected-badge hidden px-3 py-1 rounded-full bg-primary-container/20 text-primary-container font-label-sm text-[11px] font-bold">Seleccionado</span>
          <span class="badge-hint px-3 py-1 rounded-full bg-surface-container-lowest font-label-sm text-[11px] text-outline">Disponible</span>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = anyCardHtml + workerCardsHtml;

  container.querySelectorAll('.barber-card').forEach(card => {
    card.addEventListener('click', () => {
      const barberId = card.getAttribute('data-barber-id');
      if (barberId === 'any') {
        window.selectProfessional({
          id: 'any',
          name: 'Cualquier profesional',
          role: 'Disponibilidad inmediata',
          slug: 'any'
        });
      } else {
        const worker = window.bookingState.workers.find(w => w.id === barberId);
        if (worker) {
          window.selectProfessional(worker);
        }
      }
    });
  });
}

function renderCalendar() {
  const monthLabel = document.getElementById('calendar-month-label');
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;

  const viewDate = window.bookingState.currentCalendarViewDate || new Date();
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  if (monthLabel) {
    monthLabel.innerText = `${MONTH_NAMES[month]} ${year}`;
  }

  const firstDayOfMonth = new Date(year, month, 1);
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek < 0) startDayOfWeek = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayYear = today.getFullYear();
  const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
  const todayDay = String(today.getDate()).padStart(2, '0');
  const todayIso = `${todayYear}-${todayMonth}-${todayDay}`;

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 60);
  const maxYear = maxDate.getFullYear();
  const maxMonth = String(maxDate.getMonth() + 1).padStart(2, '0');
  const maxDay = String(maxDate.getDate()).padStart(2, '0');
  const maxIso = `${maxYear}-${maxMonth}-${maxDay}`;

  let html = '';

  const prevMonthLastDate = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const prevDayNum = prevMonthLastDate - i;
    html += `<span class="p-2 text-outline/30 font-body-sm">${prevDayNum}</span>`;
  }

  const bizSchedules = window.bookingState.businessSchedules || [];
  const workerSchedules = window.bookingState.workerSchedules || [];
  const exceptions = window.bookingState.scheduleExceptions || [];
  const selectedBarber = window.bookingState.selectedBarber;

  for (let d = 1; d <= daysInMonth; d++) {
    const currentDate = new Date(year, month, d);
    currentDate.setHours(0, 0, 0, 0);
    
    const dStr = String(d).padStart(2, '0');
    const mStr = String(month + 1).padStart(2, '0');
    const dateIso = `${year}-${mStr}-${dStr}`;

    const dayOfWeek = currentDate.getDay();
    const dayName = DAY_NAMES[dayOfWeek];

    const isPast = dateIso < todayIso;
    const isTooFar = dateIso > maxIso;

    let isOpenDay = true;

    if (selectedBarber && selectedBarber.id !== 'any') {
      const ws = workerSchedules.find(s => s.worker_id === selectedBarber.id && s.day_of_week === dayOfWeek);
      if (ws) {
        isOpenDay = ws.is_active_day;
      } else {
        const bs = bizSchedules.find(s => s.day_of_week === dayOfWeek);
        isOpenDay = bs ? bs.is_open : (dayOfWeek >= 1 && dayOfWeek <= 5);
      }
    } else {
      const bs = bizSchedules.find(s => s.day_of_week === dayOfWeek);
      isOpenDay = bs ? bs.is_open : (dayOfWeek >= 1 && dayOfWeek <= 5);
    }

    const isExceptionClosed = exceptions.some(ex => {
      const matchWorker = !ex.worker_id || (selectedBarber && ex.worker_id === selectedBarber.id);
      return matchWorker && ex.is_closed_all_day && ex.start_date <= dateIso && ex.end_date >= dateIso;
    });

    const isClosed = isPast || isTooFar || !isOpenDay || isExceptionClosed;
    const isSelected = window.bookingState.selectedDateIso === dateIso;
    const labelDateText = `${dayName}, ${d} de ${MONTH_NAMES[month]} de ${year}`;

    if (isClosed) {
      html += `
        <div class="p-2 sm:p-3 rounded-xl bg-surface-container-lowest/60 text-outline-variant flex flex-col items-center justify-center cursor-not-allowed" title="${isPast ? 'Pasado' : 'Cerrado'}">
          <span class="font-label-md text-label-md opacity-40">${d}</span>
          <span class="text-[9px] uppercase tracking-tight text-error/60 font-bold">Cerrado</span>
        </div>
      `;
    } else if (isSelected) {
      html += `
        <button class="cal-day active-date p-2 sm:p-3 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md font-bold shadow-[0_0_18px_#facc15] scale-105 transition-all" data-date-iso="${dateIso}" data-date-label="${labelDateText}" type="button">
          ${d}
        </button>
      `;
    } else {
      html += `
        <button class="cal-day p-2 sm:p-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-colors" data-date-iso="${dateIso}" data-date-label="${labelDateText}" type="button">
          ${d}
        </button>
      `;
    }
  }

  grid.innerHTML = html;

  grid.querySelectorAll('button[data-date-iso]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dateIso = btn.getAttribute('data-date-iso');
      const dateLabel = btn.getAttribute('data-date-label');
      window.selectDateIso(dateIso, dateLabel, btn);
    });
  });
}

async function renderTimeSlots() {
  const stage = document.getElementById('time-slots-stage');
  if (!stage) return;

  const { selectedService, selectedBarber, selectedDateIso, business } = window.bookingState;

  if (!selectedService || !selectedBarber || !selectedDateIso) {
    stage.innerHTML = `
      <div class="p-space-lg rounded-2xl bg-surface-container text-center flex flex-col items-center gap-2 border border-surface-container-high">
        <span class="material-symbols-outlined text-3xl text-primary">info</span>
        <p class="font-headline-sm text-headline-sm text-on-surface">Selección incompleta</p>
        <p class="font-body-sm text-body-sm text-on-surface-variant">
          Por favor, selecciona primero un servicio, profesional y fecha antes de elegir la hora.
        </p>
      </div>
    `;
    return;
  }

  stage.innerHTML = `
    <div class="p-space-lg rounded-2xl bg-surface-container text-center flex flex-col items-center gap-2 border border-surface-container-high">
      <span class="material-symbols-outlined text-3xl text-primary animate-spin">progress_activity</span>
      <p class="font-body-md text-body-md text-on-surface">Consultando disponibilidad en tiempo real...</p>
    </div>
  `;

  const businessId = business ? business.id : null;

  const slots = await getAvailableTimeSlots({
    businessId,
    workerId: selectedBarber.id,
    serviceId: selectedService.id,
    date: selectedDateIso
  });

  if (!slots || slots.length === 0) {
    stage.innerHTML = `
      <div class="p-space-lg rounded-2xl bg-surface-container text-center flex flex-col items-center gap-2 border border-surface-container-high">
        <span class="material-symbols-outlined text-3xl text-secondary">event_busy</span>
        <p class="font-headline-sm text-headline-sm text-on-surface">Sin horarios libres</p>
        <p class="font-body-sm text-body-sm text-on-surface-variant">
          No quedan franjas disponibles para la fecha elegida. Por favor, selecciona otro día en el calendario.
        </p>
      </div>
    `;
    return;
  }

  const morningSlots = slots.filter(s => s.period === 'morning');
  const afternoonSlots = slots.filter(s => s.period === 'afternoon');

  let html = '';

  if (morningSlots.length > 0) {
    html += `
      <div class="flex flex-col gap-space-sm">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-xl">wb_sunny</span>
          <span class="font-label-lg text-label-lg text-on-surface uppercase tracking-wider font-bold">Mañana (09:00 - 14:00)</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-space-sm">
          ${morningSlots.map(slot => renderSlotPill(slot)).join('')}
        </div>
      </div>
    `;
  }

  if (afternoonSlots.length > 0) {
    html += `
      <div class="flex flex-col gap-space-sm">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-secondary text-xl">nights_stay</span>
          <span class="font-label-lg text-label-lg text-on-surface uppercase tracking-wider font-bold">Tarde (16:00 - 20:00)</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-space-sm">
          ${afternoonSlots.map(slot => renderSlotPill(slot)).join('')}
        </div>
      </div>
    `;
  }

  stage.innerHTML = html;

  stage.querySelectorAll('button[data-slot-start]').forEach(btn => {
    btn.addEventListener('click', () => {
      const start = btn.getAttribute('data-slot-start');
      const end = btn.getAttribute('data-slot-end');
      const label = btn.getAttribute('data-slot-label');
      const wId = btn.getAttribute('data-worker-id');
      const wName = btn.getAttribute('data-worker-name');

      window.selectTimeSlot({ start, end, label, workerId: wId, workerName: wName }, btn);
    });
  });
}

function renderSlotPill(slot) {
  const isSelected = window.bookingState.selectedTime === slot.timeLabel;

  if (!slot.available) {
    return `
      <button disabled class="time-slot p-3 rounded-xl bg-surface-container-lowest/60 text-outline-variant font-label-md text-label-md flex flex-col items-center gap-1 cursor-not-allowed border border-surface-container-lowest pointer-events-none opacity-50" title="Horario ya reservado u ocupado" type="button">
        <span class="line-through opacity-50">${slot.timeLabel}</span>
        <span class="text-[10px] text-error/80 font-bold">Ocupado</span>
      </button>
    `;
  }

  if (isSelected) {
    return `
      <button class="time-slot active-slot p-3 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md font-bold shadow-[0_0_20px_#facc15] scale-105 transition-all flex flex-col items-center gap-1 border border-primary-container" data-slot-start="${slot.start}" data-slot-end="${slot.end}" data-slot-label="${slot.timeLabel}" data-worker-id="${slot.workerId || ''}" data-worker-name="${slot.workerName || ''}" type="button">
        <span class="text-base font-extrabold">${slot.timeLabel}</span>
        <span class="text-[10px] uppercase tracking-wider font-bold">Seleccionado</span>
      </button>
    `;
  }

  return `
    <button class="time-slot p-3 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-all flex flex-col items-center gap-1 border border-surface-container-high/30" data-slot-start="${slot.start}" data-slot-end="${slot.end}" data-slot-label="${slot.timeLabel}" data-worker-id="${slot.workerId || ''}" data-worker-name="${slot.workerName || ''}" type="button">
      <span class="font-bold">${slot.timeLabel}</span>
      <span class="text-[10px] text-outline">Libre</span>
    </button>
  `;
}

// ==============================================================================
// 4. CONTROLADORES DE SELECCIÓN Y LIMPIEZA DE ESTADO
// ==============================================================================

window.selectService = function(serviceOrElement, name, inlineDuration, inlinePrice, idOrSlug) {
  if (!serviceOrElement) return;

  let service = null;

  if (typeof name === 'string') {
    const slugOrId = idOrSlug || 'srv-01';
    const found = (window.bookingState.services || []).find(s => 
      s.id === slugOrId || s.slug === slugOrId || s.name === name
    );
    if (found) {
      service = found;
    } else {
      const durMin = parseInt(inlineDuration, 10) || 45;
      const rawPrice = parseFloat(inlinePrice ? inlinePrice.replace('€', '').trim() : '15') || 15;
      service = {
        id: slugOrId,
        name: name,
        duration_minutes: durMin,
        durationMinutes: durMin,
        price: rawPrice,
        slug: slugOrId
      };
    }
  } else {
    service = serviceOrElement;
  }

  const durationMin = service.duration_minutes || service.durationMinutes || parseInt(inlineDuration, 10) || 45;
  const rawPriceNum = typeof service.price === 'number' ? service.price : (parseFloat(service.price) || 15);
  const formattedPrice = `${rawPriceNum} €`;

  window.bookingState.selectedService = {
    id: service.id,
    name: service.name,
    duration: `${durationMin} min`,
    price: formattedPrice,
    durationMinutes: durationMin,
    rawPrice: rawPriceNum,
    slug: service.slug || service.id
  };

  window.bookingState.selectedDate = null;
  window.bookingState.selectedDateIso = null;
  window.bookingState.selectedTime = null;
  window.bookingState.selectedTimeStart = null;
  window.bookingState.selectedTimeEnd = null;
  window.bookingState.assignedWorkerId = null;
  window.bookingState.assignedWorkerName = null;

  if (window.bookingState.selectedBarber && window.bookingState.selectedBarber.id !== 'any') {
    const workerServices = window.bookingState.workerServices || [];
    if (workerServices.length > 0) {
      const canDo = workerServices.some(ws => 
        ws.worker_id === window.bookingState.selectedBarber.id && ws.service_id === service.id
      );
      if (!canDo) {
        window.bookingState.selectedBarber = null;
      }
    }
  }

  renderServices();
  renderWorkers();
  renderCalendar();
  renderTimeSlots();
  updateSummaryDetails();
};

window.selectProfessional = function(workerOrElement, name, role, idOrSlug) {
  if (!workerOrElement) return;

  let worker = null;

  if (typeof name === 'string') {
    const slugOrId = idOrSlug || 'any';
    if (slugOrId === 'any') {
      worker = {
        id: 'any',
        name: 'Cualquier profesional',
        role_title: 'Disponibilidad inmediata',
        slug: 'any'
      };
    } else {
      const found = (window.bookingState.workers || []).find(w => 
        w.id === slugOrId || w.slug === slugOrId || w.name === name
      );
      if (found) {
        worker = found;
      } else {
        worker = {
          id: slugOrId,
          name: name,
          role_title: role,
          slug: slugOrId
        };
      }
    }
  } else {
    worker = workerOrElement;
  }

  window.bookingState.selectedBarber = {
    id: worker.id,
    name: worker.name,
    role: worker.role_title || worker.role || 'Stylist & Barber',
    slug: worker.slug || worker.id
  };

  window.bookingState.selectedDate = null;
  window.bookingState.selectedDateIso = null;
  window.bookingState.selectedTime = null;
  window.bookingState.selectedTimeStart = null;
  window.bookingState.selectedTimeEnd = null;
  window.bookingState.assignedWorkerId = null;
  window.bookingState.assignedWorkerName = null;

  renderWorkers();
  renderCalendar();
  renderTimeSlots();
  updateSummaryDetails();
};

window.selectDate = function(element, dateLabelText) {
  let dateIso = element && element.getAttribute ? element.getAttribute('data-date-iso') : null;
  if (!dateIso) {
    const today = new Date();
    const year = today.getFullYear();
    const monthStr = String(today.getMonth() + 1).padStart(2, '0');
    const dayMatch = dateLabelText ? dateLabelText.match(/\d+/) : null;
    const dayStr = dayMatch ? String(dayMatch[0]).padStart(2, '0') : '01';
    dateIso = `${year}-${monthStr}-${dayStr}`;
  }
  window.selectDateIso(dateIso, dateLabelText || 'Fecha seleccionada', element);
};

window.selectTime = function(element, timeLabel) {
  const start = (element && element.getAttribute && element.getAttribute('data-slot-start')) || `${timeLabel}:00`;
  const end = (element && element.getAttribute && element.getAttribute('data-slot-end')) || `${timeLabel}:45`;
  window.selectTimeSlot({ start, end, label: timeLabel }, element);
};

window.selectDateIso = function(dateIso, dateLabelText, btnElement) {
  window.bookingState.selectedDateIso = dateIso;
  window.bookingState.selectedDate = dateLabelText;

  window.bookingState.selectedTime = null;
  window.bookingState.selectedTimeStart = null;
  window.bookingState.selectedTimeEnd = null;

  const display = document.getElementById('selected-date-display');
  if (display) display.innerText = dateLabelText;

  renderCalendar();
  renderTimeSlots();
  updateSummaryDetails();
};

window.selectTimeSlot = function(slotData, btnElement) {
  window.bookingState.selectedTime = slotData.label;
  window.bookingState.selectedTimeStart = slotData.start;
  window.bookingState.selectedTimeEnd = slotData.end;

  if (slotData.workerId) {
    window.bookingState.assignedWorkerId = slotData.workerId;
    window.bookingState.assignedWorkerName = slotData.workerName;
  } else if (window.bookingState.selectedBarber && window.bookingState.selectedBarber.id !== 'any') {
    window.bookingState.assignedWorkerId = window.bookingState.selectedBarber.id;
    window.bookingState.assignedWorkerName = window.bookingState.selectedBarber.name;
  }

  renderTimeSlots();
  updateSummaryDetails();
};

// ==============================================================================
// 5. PERSISTENCIA REAL DE LA RESERVA EN SUPABASE (FASE 4)
// ==============================================================================

/**
 * Procesa y confirma la reserva real en Supabase con validaciones estrictas y control anti doble envío.
 */
window.completeBookingModal = async function() {
  const {
    selectedService,
    selectedBarber,
    selectedDateIso,
    selectedDate,
    selectedTime,
    selectedTimeStart,
    selectedTimeEnd,
    assignedWorkerId,
    assignedWorkerName,
    clientData,
    business,
    isSubmitting
  } = window.bookingState;

  // Evitar envíos múltiples concurrentes
  if (isSubmitting) return;

  // Sincronizar campos de entrada del cliente directamente desde el DOM si existen
  const nameInput = document.getElementById('client-name');
  const phoneInput = document.getElementById('client-phone');
  const emailInput = document.getElementById('client-email');

  const clientName = (nameInput ? nameInput.value : (clientData.name || '')).trim();
  const clientPhone = (phoneInput ? phoneInput.value : (clientData.phone || '')).trim();
  const clientEmail = (emailInput ? emailInput.value : (clientData.email || '')).trim();

  // Sincronizar en el estado local
  window.bookingState.clientData.name = clientName;
  window.bookingState.clientData.phone = clientPhone;
  window.bookingState.clientData.email = clientEmail;

  // ==============================================================================
  // VALIDACIÓN ESTRICTA DE REQUISITOS ANTES DE ENVIAR
  // ==============================================================================

  // 1. Validar que haya un servicio seleccionado
  if (!selectedService || (!selectedService.id && !selectedService.slug)) {
    showBookingAlert('Por favor, selecciona un servicio antes de confirmar tu reserva.', 1);
    return;
  }

  // 2. Validar que haya un profesional seleccionado
  if (!selectedBarber || (!selectedBarber.id && !selectedBarber.slug)) {
    showBookingAlert('Por favor, selecciona un profesional antes de confirmar tu reserva.', 2);
    return;
  }

  // 3. Validar que haya fecha y hora seleccionadas
  if (!selectedDateIso || !selectedDate) {
    showBookingAlert('Por favor, selecciona una fecha en el calendario antes de confirmar.', 3);
    return;
  }

  if (!selectedTime || !selectedTimeStart || !selectedTimeEnd) {
    showBookingAlert('Por favor, selecciona un horario disponible antes de confirmar.', 4);
    return;
  }

  // 4. Validar que los campos de nombre y teléfono no estén vacíos
  if (!clientName) {
    if (nameInput) nameInput.focus();
    showBookingAlert('Por favor, indica tu nombre y apellidos para completar la reserva.', 5);
    return;
  }

  if (!clientPhone) {
    if (phoneInput) phoneInput.focus();
    showBookingAlert('Por favor, indica tu teléfono móvil de contacto para completar la reserva.', 5);
    return;
  }

  // ==============================================================================
  // PREPARACIÓN DE PAYLOAD Y ENVÍO A SUPABASE
  // ==============================================================================

  let targetWorkerId = assignedWorkerId;
  let targetWorkerName = assignedWorkerName;

  if (!targetWorkerId || targetWorkerId === 'any') {
    if (selectedBarber.id !== 'any') {
      targetWorkerId = selectedBarber.id;
      targetWorkerName = selectedBarber.name;
    } else {
      const firstWorker = (window.bookingState.workers && window.bookingState.workers.length > 0)
        ? window.bookingState.workers[0]
        : null;
      targetWorkerId = firstWorker ? firstWorker.id : 'c0000000-0000-0000-0000-000000000001';
      targetWorkerName = firstWorker ? firstWorker.name : 'Darío';
    }
  }

  const businessId = business ? business.id : 'a0000000-0000-0000-0000-000000000001';
  const bookingCode = generateUniqueBookingCode(); // Genera código único formato ARX-YYYY-XXXX
  const startsAtIso = formatTimestamptz(selectedDateIso, selectedTimeStart);
  const endsAtIso = formatTimestamptz(selectedDateIso, selectedTimeEnd);

  // Activar estado de procesamiento (deshabilitar botón)
  window.bookingState.isSubmitting = true;
  const confirmBtn = document.getElementById('btn-confirm-booking');
  let originalBtnHtml = '';

  if (confirmBtn) {
    originalBtnHtml = confirmBtn.innerHTML;
    confirmBtn.disabled = true;
    confirmBtn.className = 'w-full sm:w-auto px-space-xl py-4 rounded-xl bg-surface-container-high text-outline-variant font-label-lg text-label-lg uppercase tracking-wider font-bold cursor-not-allowed flex items-center justify-center gap-2';
    confirmBtn.innerHTML = `
      <span class="material-symbols-outlined text-2xl animate-spin">progress_activity</span>
      <span>Guardando Reserva...</span>
    `;
  }

  const payload = {
    business_id: businessId,
    worker_id: targetWorkerId,
    service_id: selectedService.id,
    appointment_code: bookingCode,
    customer_name: clientName,
    customer_phone: clientPhone,
    customer_email: clientEmail,
    appointment_date: selectedDateIso,
    start_time: selectedTimeStart,
    end_time: selectedTimeEnd,
    total_price: selectedService.rawPrice || parseFloat(selectedService.price) || 15.00,
    status: 'confirmed',
    starts_at: startsAtIso,
    ends_at: endsAtIso
  };

  // Copia completa de datos de la cita para inyectar en el modal de confirmación
  const appointmentSummary = {
    appointment_code: bookingCode,
    serviceName: selectedService.name,
    servicePrice: selectedService.price || `${payload.total_price} €`,
    barberName: targetWorkerName || selectedBarber.name,
    dateText: selectedDate,
    timeText: selectedTime,
    clientName: clientName,
    clientPhone: clientPhone,
    clientEmail: clientEmail
  };

  try {
    const { data: createdApp, error } = await createAppointment(payload);

    if (error) {
      console.warn('[Booking] Error al guardar cita en Supabase:', error);
      
      showBookingAlert(`El horario seleccionado (${selectedTime} h) ya ha sido reservado por otro cliente o no está disponible. Por favor, elige otro turno.`, 4);

      window.bookingState.isSubmitting = false;
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.className = 'w-full sm:w-auto px-space-xl py-4 rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg uppercase tracking-wider font-extrabold shadow-[0_0_28px_#facc15] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2';
        confirmBtn.innerHTML = originalBtnHtml;
      }

      window.bookingState.selectedTime = null;
      window.bookingState.selectedTimeStart = null;
      window.bookingState.selectedTimeEnd = null;
      renderTimeSlots();
      return;
    }

    if (createdApp && createdApp.appointment_code) {
      appointmentSummary.appointment_code = createdApp.appointment_code;
    }

    // 1. Limpiar por completo el estado local de la reserva
    resetBookingState();

    // 2. Invocar la pantalla/modal de confirmación pasando los datos completos de la cita
    showConfirmationModal(appointmentSummary);

    console.info(`[Booking] ¡Cita creada con éxito en Supabase! Código: ${appointmentSummary.appointment_code}`);

  } catch (err) {
    console.error('[Booking] Excepción inesperada al crear cita:', err);
    showBookingAlert('Ocurrió un error inesperado al procesar la reserva. Por favor, inténtalo de nuevo.', 6);

    window.bookingState.isSubmitting = false;
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.className = 'w-full sm:w-auto px-space-xl py-4 rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg uppercase tracking-wider font-extrabold shadow-[0_0_28px_#facc15] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2';
      confirmBtn.innerHTML = originalBtnHtml;
    }
  }
};

window.closeBookingModal = function() {
  const modal = document.getElementById('booking-success-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
  window.goToStep(1);
};

// Aliases y exportación explícita al ámbito global (window)
window.confirmBooking = window.completeBookingModal;
window.resetBookingState = resetBookingState;
window.showConfirmationModal = showConfirmationModal;
window.renderServices = renderServices;
window.renderWorkers = renderWorkers;
window.renderCalendar = renderCalendar;
window.renderTimeSlots = renderTimeSlots;
window.updateSummaryDetails = updateSummaryDetails;

// ==============================================================================
// 6. NAVEGACIÓN ENTRE PASOS Y RESUMEN
// ==============================================================================

window.goToStep = function(step) {
  if (step < 1 || step > 6) return;
  
  // Limpiar cualquier alerta visual previa al cambiar de paso
  const existingAlert = document.getElementById('booking-validation-alert');
  if (existingAlert) {
    existingAlert.remove();
  }

  if (step > 1 && !window.bookingState.selectedService) {
    showBookingAlert('Por favor, selecciona un servicio antes de avanzar.', 1);
    return;
  }

  if (step > 2 && !window.bookingState.selectedBarber) {
    showBookingAlert('Por favor, selecciona un profesional antes de avanzar.', 2);
    return;
  }

  if (step > 3 && !window.bookingState.selectedDateIso) {
    showBookingAlert('Por favor, selecciona una fecha en el calendario antes de avanzar.', 3);
    return;
  }

  if (step > 4 && !window.bookingState.selectedTime) {
    showBookingAlert('Por favor, selecciona un horario disponible antes de avanzar.', 4);
    return;
  }

  if (step === 6) {
    const nameInput = document.getElementById('client-name');
    const phoneInput = document.getElementById('client-phone');
    const emailInput = document.getElementById('client-email');

    const nameVal = nameInput ? nameInput.value.trim() : window.bookingState.clientData.name;
    const phoneVal = phoneInput ? phoneInput.value.trim() : window.bookingState.clientData.phone;
    const emailVal = emailInput ? emailInput.value.trim() : window.bookingState.clientData.email;
    
    if (!nameVal) {
      if (nameInput) nameInput.focus();
      showBookingAlert('Por favor, introduce tu nombre y apellidos.', 5);
      return;
    }
    if (!phoneVal) {
      if (phoneInput) phoneInput.focus();
      showBookingAlert('Por favor, introduce tu teléfono móvil de contacto.', 5);
      return;
    }

    window.bookingState.clientData.name = nameVal;
    window.bookingState.clientData.phone = phoneVal;
    window.bookingState.clientData.email = emailVal;

    updateSummaryDetails();
  }

  window.bookingState.currentStep = step;

  document.querySelectorAll('.wizard-pane').forEach(pane => {
    pane.classList.add('hidden');
  });

  const targetPane = document.getElementById('step-pane-' + step);
  if (targetPane) {
    targetPane.classList.remove('hidden');
  }

  const progressBar = document.getElementById('stepper-progress-bar');
  if (progressBar) {
    const pct = (step / 6) * 100;
    progressBar.style.width = pct + '%';
  }

  document.querySelectorAll('.step-nav-btn').forEach(btn => {
    const btnStep = parseInt(btn.getAttribute('data-step-nav'), 10);
    const badge = btn.querySelector('.step-badge');
    
    if (btnStep === step) {
      btn.className = 'step-nav-btn group flex flex-col items-center gap-1.5 p-2 rounded-xl bg-surface-container-high text-primary-container font-bold';
      if (badge) {
        badge.className = 'step-badge w-7 h-7 rounded-full flex items-center justify-center font-label-md text-label-md bg-primary-container text-on-primary-container font-bold shadow-[0_0_10px_#facc15]';
      }
    } else if (btnStep < step) {
      btn.className = 'step-nav-btn group flex flex-col items-center gap-1.5 p-2 rounded-xl text-primary font-medium hover:bg-surface-container-low transition-all';
      if (badge) {
        badge.className = 'step-badge w-7 h-7 rounded-full flex items-center justify-center font-label-md text-label-md bg-surface-container-highest text-primary font-bold';
      }
    } else {
      btn.className = 'step-nav-btn group flex flex-col items-center gap-1.5 p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low transition-all';
      if (badge) {
        badge.className = 'step-badge w-7 h-7 rounded-full flex items-center justify-center font-label-md text-label-md bg-surface-container text-on-surface-variant';
      }
    }
  });

  const wizardContainer = document.getElementById('wizard-stage-container');
  if (wizardContainer) {
    const topPos = wizardContainer.getBoundingClientRect().top + window.pageYOffset - 90;
    window.scrollTo({ top: topPos, behavior: 'smooth' });
  }
};

function updateSummaryDetails() {
  const serviceElem = document.getElementById('summary-service');
  const durationElem = document.getElementById('summary-duration');
  const priceElem = document.getElementById('summary-price');
  const barberElem = document.getElementById('summary-barber');
  const datetimeElem = document.getElementById('summary-datetime');
  const nameElem = document.getElementById('summary-name');
  const phoneElem = document.getElementById('summary-phone');
  const emailElem = document.getElementById('summary-email');

  if (serviceElem) {
    serviceElem.innerText = window.bookingState.selectedService 
      ? window.bookingState.selectedService.name 
      : 'Sin seleccionar';
  }
  if (durationElem) {
    durationElem.innerText = window.bookingState.selectedService 
      ? window.bookingState.selectedService.duration 
      : '-- min';
  }
  if (priceElem) {
    priceElem.innerText = window.bookingState.selectedService 
      ? window.bookingState.selectedService.price 
      : '-- €';
  }
  if (barberElem) {
    const barberName = window.bookingState.selectedBarber
      ? (window.bookingState.selectedBarber.id === 'any' && window.bookingState.assignedWorkerName
          ? `${window.bookingState.assignedWorkerName} (Asignado)`
          : window.bookingState.selectedBarber.name)
      : 'Sin seleccionar';
    barberElem.innerText = barberName;
  }
  if (datetimeElem) {
    const dateText = window.bookingState.selectedDate || 'Fecha sin seleccionar';
    const timeText = window.bookingState.selectedTime ? ` a las ${window.bookingState.selectedTime} h` : '';
    datetimeElem.innerText = `${dateText}${timeText}`;
  }

  if (nameElem) {
    nameElem.innerHTML = `<span class="material-symbols-outlined text-base text-primary">person</span><span>${window.bookingState.clientData.name}</span>`;
  }
  if (phoneElem) {
    phoneElem.innerHTML = `<span class="material-symbols-outlined text-base text-primary">call</span><span>+34 ${window.bookingState.clientData.phone}</span>`;
  }
  if (emailElem) {
    emailElem.innerHTML = `<span class="material-symbols-outlined text-base text-primary">mail</span><span>${window.bookingState.clientData.email}</span>`;
  }
}

// ==============================================================================
// 6.5. DELEGACIÓN DE EVENTOS Y SINCRONIZACIÓN EN TIEMPO REAL
// ==============================================================================

let isDelegationInitialized = false;

function setupEventDelegation() {
  if (isDelegationInitialized) return;
  isDelegationInitialized = true;

  document.addEventListener('click', (e) => {
    // 1. Delegación para Servicios (Paso 1)
    const serviceCard = e.target.closest('[data-service-id], [data-service-slug], .service-card');
    if (serviceCard && document.getElementById('booking-services-container')?.contains(serviceCard)) {
      const serviceId = serviceCard.getAttribute('data-service-id') || serviceCard.dataset?.serviceId;
      const serviceSlug = serviceCard.getAttribute('data-service-slug') || serviceCard.dataset?.serviceSlug;

      let service = (window.bookingState.services || []).find(s => 
        (serviceId != null && String(s.id) === String(serviceId)) ||
        (serviceSlug != null && s.slug === serviceSlug)
      );

      if (!service) {
        const name = serviceCard.getAttribute('data-service-name') || serviceCard.dataset?.serviceName || 'Servicio';
        const duration = parseInt(serviceCard.getAttribute('data-service-duration') || serviceCard.dataset?.serviceDuration || '45', 10);
        const price = parseFloat(serviceCard.getAttribute('data-service-price') || serviceCard.dataset?.servicePrice || '15');
        service = {
          id: serviceId || serviceSlug || 'srv-custom',
          name: name,
          duration_minutes: duration,
          durationMinutes: duration,
          price: price,
          slug: serviceSlug || serviceId
        };
      }

      const currentSel = window.bookingState.selectedService;
      const isSame = currentSel && (
        (currentSel.id != null && service.id != null && String(currentSel.id) === String(service.id)) ||
        (currentSel.slug && service.slug && currentSel.slug === service.slug)
      );

      if (!isSame) {
        window.selectService(service);
      }
      return;
    }

    // 2. Delegación para Barberos / Profesionales (Paso 2)
    const barberCard = e.target.closest('[data-prof-id], [data-barber-id], [data-prof-slug], [data-barber-slug], .barber-card');
    if (barberCard && document.getElementById('booking-workers-container')?.contains(barberCard)) {
      const barberId = barberCard.getAttribute('data-barber-id') || barberCard.getAttribute('data-prof-id') || barberCard.dataset?.barberId || barberCard.dataset?.profId;
      const barberSlug = barberCard.getAttribute('data-barber-slug') || barberCard.getAttribute('data-prof-slug') || barberCard.dataset?.barberSlug || barberCard.dataset?.profSlug;

      let worker = null;
      if (barberId === 'any' || barberSlug === 'any') {
        worker = {
          id: 'any',
          name: 'Cualquier profesional',
          role_title: 'Disponibilidad inmediata',
          role: 'Disponibilidad inmediata',
          slug: 'any'
        };
      } else {
        worker = (window.bookingState.workers || []).find(w => 
          (barberId != null && String(w.id) === String(barberId)) ||
          (barberSlug != null && w.slug === barberSlug)
        );

        if (!worker) {
          const name = barberCard.getAttribute('data-barber-name') || barberCard.getAttribute('data-prof-name') || barberCard.dataset?.barberName || barberCard.dataset?.profName || 'Profesional';
          const role = barberCard.getAttribute('data-barber-role') || barberCard.getAttribute('data-prof-role') || barberCard.dataset?.barberRole || barberCard.dataset?.profRole || 'Stylist & Barber';
          worker = {
            id: barberId || barberSlug || 'worker-custom',
            name: name,
            role_title: role,
            role: role,
            slug: barberSlug || barberId
          };
        }
      }

      const currentSel = window.bookingState.selectedBarber;
      const isSame = currentSel && currentSel.id === worker.id;

      if (!isSame) {
        window.selectProfessional(worker);
      }
      return;
    }

    // 3. Delegación para Fecha / Calendario (Paso 3)
    const dateBtn = e.target.closest('[data-date-iso], [data-date], .cal-day');
    if (dateBtn && document.getElementById('calendar-grid')?.contains(dateBtn)) {
      if (dateBtn.classList.contains('cursor-not-allowed') || dateBtn.disabled) return;
      const dateIso = dateBtn.getAttribute('data-date-iso') || dateBtn.getAttribute('data-date') || dateBtn.dataset?.dateIso || dateBtn.dataset?.date;
      const dateLabel = dateBtn.getAttribute('data-date-label') || dateBtn.dataset?.dateLabel || dateBtn.innerText.trim();
      
      if (dateIso && window.bookingState.selectedDateIso !== dateIso) {
        window.selectDateIso(dateIso, dateLabel, dateBtn);
      }
      return;
    }

    // 4. Delegación para Horas / Franjas (Paso 4)
    const timeBtn = e.target.closest('[data-slot-start], [data-time], .time-slot');
    if (timeBtn && document.getElementById('time-slots-stage')?.contains(timeBtn)) {
      if (timeBtn.classList.contains('cursor-not-allowed') || timeBtn.disabled) return;
      const start = timeBtn.getAttribute('data-slot-start') || timeBtn.dataset?.slotStart;
      const end = timeBtn.getAttribute('data-slot-end') || timeBtn.dataset?.slotEnd;
      const label = timeBtn.getAttribute('data-slot-label') || timeBtn.getAttribute('data-time') || timeBtn.dataset?.slotLabel || timeBtn.dataset?.time || timeBtn.innerText.trim();
      const workerId = timeBtn.getAttribute('data-worker-id') || timeBtn.dataset?.workerId;
      const workerName = timeBtn.getAttribute('data-worker-name') || timeBtn.dataset?.workerName;

      if (label && window.bookingState.selectedTime !== label) {
        const slotStart = start || (label.includes(':') ? `${label}:00` : `${label}:00:00`);
        const slotEnd = end || (label.includes(':') ? `${label}:45` : `${label}:45:00`);
        window.selectTimeSlot({ start: slotStart, end: slotEnd, label, workerId, workerName }, timeBtn);
      }
      return;
    }

    // 5. Delegación para Stepper Buttons
    const stepBtn = e.target.closest('[data-step-nav], [data-go-to-step], [data-step]');
    if (stepBtn) {
      const stepVal = stepBtn.getAttribute('data-step-nav') || stepBtn.getAttribute('data-go-to-step') || stepBtn.getAttribute('data-step') || stepBtn.dataset?.stepNav || stepBtn.dataset?.goToStep || stepBtn.dataset?.step;
      const stepNum = parseInt(stepVal, 10);
      if (stepNum >= 1 && stepNum <= 6) {
        window.goToStep(stepNum);
      }
      return;
    }

    // 6. Delegación para Botón de Confirmación
    const confirmBtn = e.target.closest('#btn-confirm-booking, [data-action="confirm-booking"], [data-action="complete-booking"]');
    if (confirmBtn) {
      window.confirmBooking();
      return;
    }

    // 7. Delegación para Cerrar Modal
    const closeModalBtn = e.target.closest('[data-action="close-modal"], #btn-close-modal');
    if (closeModalBtn) {
      window.closeBookingModal();
      return;
    }
  });
}

function setupClientInputsSync() {
  const nameInput = document.getElementById('client-name');
  const phoneInput = document.getElementById('client-phone');
  const emailInput = document.getElementById('client-email');

  if (nameInput) {
    nameInput.addEventListener('input', (e) => {
      window.bookingState.clientData.name = e.target.value.trim();
      updateSummaryDetails();
    });
  }
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      window.bookingState.clientData.phone = e.target.value.trim();
      updateSummaryDetails();
    });
  }
  if (emailInput) {
    emailInput.addEventListener('input', (e) => {
      window.bookingState.clientData.email = e.target.value.trim();
      updateSummaryDetails();
    });
  }
}

// ==============================================================================
// 7. INICIALIZACIÓN COMPLETA DESDE SUPABASE
// ==============================================================================

async function initBookingData() {
  // Configurar delegación de eventos y sincronización de datos de formulario
  setupEventDelegation();
  setupClientInputsSync();

  // Renderizar inmediatamente la interfaz con los datos iniciales (0ms latency)
  renderServices();
  renderWorkers();
  renderCalendar();
  renderTimeSlots();

  try {
    const envSlug = (window.__ENV__ && window.__ENV__.BUSINESS_SLUG) 
      ? window.__ENV__.BUSINESS_SLUG 
      : 'arxemil-lugo';

    const { data: business } = await getBusiness(envSlug);
    window.bookingState.business = business || BUSINESS_DATA;
    const businessId = window.bookingState.business.id;

    const [servicesRes, workersRes, workerServicesRes, bizSchedRes, workerSchedRes, exceptionsRes] = await Promise.all([
      getServices(businessId),
      getWorkers(businessId),
      getWorkerServices(businessId),
      getBusinessSchedules(businessId),
      getWorkerSchedules(businessId),
      getScheduleExceptions(businessId)
    ]);

    window.bookingState.services = (servicesRes.data && servicesRes.data.length > 0)
      ? servicesRes.data
      : SERVICES_DATA;

    window.bookingState.workers = (workersRes.data && workersRes.data.length > 0)
      ? workersRes.data
      : BARBERS_DATA;

    window.bookingState.workerServices = workerServicesRes.data || [];
    window.bookingState.businessSchedules = bizSchedRes.data || [];
    window.bookingState.workerSchedules = workerSchedRes.data || [];
    window.bookingState.scheduleExceptions = exceptionsRes.data || [];

    const prevBtn = document.getElementById('cal-prev-month');
    const nextBtn = document.getElementById('cal-next-month');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const cur = window.bookingState.currentCalendarViewDate || new Date();
        window.bookingState.currentCalendarViewDate = new Date(cur.getFullYear(), cur.getMonth() - 1, 1);
        renderCalendar();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const cur = window.bookingState.currentCalendarViewDate || new Date();
        window.bookingState.currentCalendarViewDate = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
        renderCalendar();
      });
    }

    // Reconciliar cualquier selección previa con las entidades reales cargadas
    if (window.bookingState.selectedService && window.bookingState.services.length > 0) {
      const currentSel = window.bookingState.selectedService;
      const realService = window.bookingState.services.find(s => 
        (currentSel.id != null && s.id != null && String(currentSel.id) === String(s.id)) ||
        (currentSel.slug && s.slug && currentSel.slug === s.slug) ||
        (currentSel.name && s.name && currentSel.name === s.name)
      );
      if (realService) {
        window.bookingState.selectedService = {
          id: realService.id,
          name: realService.name,
          duration: `${realService.duration_minutes || realService.durationMinutes || 45} min`,
          price: `${typeof realService.price === 'number' ? realService.price : parseFloat(realService.price)} €`,
          durationMinutes: realService.duration_minutes || realService.durationMinutes || 45,
          rawPrice: typeof realService.price === 'number' ? realService.price : parseFloat(realService.price),
          slug: realService.slug || realService.id
        };
      }
    }

    renderServices();
    renderWorkers();
    renderCalendar();
    renderTimeSlots();

    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    const barberParam = urlParams.get('barber');

    if (serviceParam) {
      const matchSrv = window.bookingState.services.find(s => s.slug === serviceParam || s.id === serviceParam);
      if (matchSrv) {
        window.selectService(matchSrv);
      }
    }

    if (barberParam) {
      if (barberParam === 'any') {
        window.selectProfessional({ id: 'any', name: 'Cualquier profesional', role: 'Disponibilidad inmediata', slug: 'any' });
      } else {
        const matchBarber = window.bookingState.workers.find(w => w.slug === barberParam || w.id === barberParam);
        if (matchBarber) {
          window.selectProfessional(matchBarber);
        }
      }
    }

    console.info(`[Booking] Fase 4 lista: Persistencia real de reservas activada.`);

  } catch (err) {
    console.warn('[Booking] Excepción al inicializar datos de Supabase. Usando fallback.', err);
    window.bookingState.services = SERVICES_DATA;
    window.bookingState.workers = BARBERS_DATA;
    renderServices();
    renderWorkers();
    renderCalendar();
    renderTimeSlots();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBookingData, { once: true });
} else {
  initBookingData();
}
