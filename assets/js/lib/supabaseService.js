/**
 * Peluquería Arxemil - Capa de Servicio / Acceso a Datos Supabase
 * Proporciona métodos desacoplados y seguros para consultar y persistir
 * datos en Supabase respetando el modelo de datos multi-tenant.
 */

import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient.js';
import { BUSINESS_DATA, SERVICES_DATA, BARBERS_DATA } from '../data/mockData.js';

const DEFAULT_BUSINESS_SLUG = 'arxemil-lugo';

/**
 * Obtiene la información del negocio por su slug (con fallback automático al primer negocio activo).
 * @param {string} [slug] 
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function getBusiness(slug = DEFAULT_BUSINESS_SLUG) {
  const client = getSupabaseClient();
  if (!client) {
    return { data: BUSINESS_DATA, error: null };
  }

  try {
    const targetSlug = slug || DEFAULT_BUSINESS_SLUG;
    let { data, error } = await client
      .from('businesses')
      .select('*')
      .eq('slug', targetSlug)
      .eq('active', true)
      .maybeSingle();

    if (!data && !error) {
      const fallbackQuery = await client
        .from('businesses')
        .select('*')
        .eq('active', true)
        .limit(1)
        .maybeSingle();
      data = fallbackQuery.data;
      error = fallbackQuery.error;
    }

    if (!data && !error) {
      return { data: BUSINESS_DATA, error: null };
    }

    return { data, error };
  } catch (err) {
    return { data: BUSINESS_DATA, error: err };
  }
}

/**
 * Obtiene el catálogo de servicios activos para un negocio.
 * @param {string} [businessId] 
 * @returns {Promise<{data: Array|null, error: object|null}>}
 */
export async function getServices(businessId) {
  const client = getSupabaseClient();
  if (!client) {
    return { data: SERVICES_DATA, error: null };
  }

  try {
    let query = client
      .from('services')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true });

    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return { data: SERVICES_DATA, error: null };
    }
    return { data, error };
  } catch (err) {
    return { data: SERVICES_DATA, error: err };
  }
}

/**
 * Obtiene la lista de barberos/trabajadores activos para un negocio.
 * @param {string} [businessId] 
 * @returns {Promise<{data: Array|null, error: object|null}>}
 */
export async function getWorkers(businessId) {
  const client = getSupabaseClient();
  if (!client) {
    return { data: BARBERS_DATA, error: null };
  }

  try {
    let query = client
      .from('workers')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true });

    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return { data: BARBERS_DATA, error: null };
    }
    return { data, error };
  } catch (err) {
    return { data: BARBERS_DATA, error: err };
  }
}

/**
 * Obtiene las relaciones de servicios que realiza cada trabajador.
 * @param {string} [businessId] 
 * @returns {Promise<{data: Array|null, error: object|null}>}
 */
export async function getWorkerServices(businessId) {
  const client = getSupabaseClient();
  if (!client) {
    return { data: [], error: null };
  }

  try {
    let query = client.from('worker_services').select('*');
    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    const { data, error } = await query;
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Obtiene el horario general del negocio.
 * @param {string} [businessId] 
 * @returns {Promise<{data: Array|null, error: object|null}>}
 */
export async function getBusinessSchedules(businessId) {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: new Error('Supabase client not initialized') };
  }

  try {
    let query = client
      .from('business_schedules')
      .select('*')
      .order('day_of_week', { ascending: true });

    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    const { data, error } = await query;
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Obtiene los horarios configurados por trabajador.
 * @param {string} [businessId] 
 * @param {string} [workerId] 
 * @returns {Promise<{data: Array|null, error: object|null}>}
 */
export async function getWorkerSchedules(businessId, workerId) {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: new Error('Supabase client not initialized') };
  }

  try {
    let query = client
      .from('worker_schedules')
      .select('*')
      .order('day_of_week', { ascending: true });

    if (businessId) {
      query = query.eq('business_id', businessId);
    }
    if (workerId) {
      query = query.eq('worker_id', workerId);
    }

    const { data, error } = await query;
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Obtiene excepciones de calendario (festivos, vacaciones).
 * @param {string} [businessId] 
 * @param {string} [workerId] 
 * @returns {Promise<{data: Array|null, error: object|null}>}
 */
export async function getScheduleExceptions(businessId, workerId) {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: new Error('Supabase client not initialized') };
  }

  try {
    let query = client
      .from('schedule_exceptions')
      .select('*')
      .order('start_date', { ascending: true });

    if (businessId) {
      query = query.eq('business_id', businessId);
    }
    if (workerId) {
      query = query.or(`worker_id.is.null,worker_id.eq.${workerId}`);
    }

    const { data, error } = await query;
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Obtiene citas filtradas por negocio, fecha o trabajador.
 * @param {string} [businessId] 
 * @param {object} [filters]
 * @param {string} [filters.date] - Formato YYYY-MM-DD
 * @param {string} [filters.workerId]
 * @param {string} [filters.status]
 * @returns {Promise<{data: Array|null, error: object|null}>}
 */
export async function getAppointments(businessId, filters = {}) {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: new Error('Supabase client not initialized') };
  }

  try {
    let query = client
      .from('appointments')
      .select(`
        *,
        worker:workers(id, name, role_title, chair_name),
        service:services(id, name, duration_minutes, price)
      `)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (businessId) {
      query = query.eq('business_id', businessId);
    }
    if (filters.date) {
      query = query.eq('appointment_date', filters.date);
    }
    if (filters.workerId) {
      query = query.eq('worker_id', filters.workerId);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Inserta una nueva reserva de cita en Supabase.
 * @param {object} appointmentData 
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function createAppointment(appointmentData) {
  const client = getSupabaseClient();
  if (!client) {
    return { data: appointmentData, error: null };
  }

  try {
    let { data, error } = await client
      .from('appointments')
      .insert([appointmentData])
      .select()
      .maybeSingle();

    if (error) {
      // Si RLS restringe la lectura posterior (SELECT), reintentar solo el INSERT sin .select()
      const insertResult = await client
        .from('appointments')
        .insert([appointmentData]);

      if (!insertResult.error) {
        return { data: appointmentData, error: null };
      }
      return { data: null, error: insertResult.error };
    }

    return { data: data || appointmentData, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Actualiza el estado de una cita.
 * @param {string} appointmentId 
 * @param {'confirmed'|'cancelled'|'completed'|'no_show'} status 
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function updateAppointmentStatus(appointmentId, status) {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: new Error('Supabase client not initialized') };
  }

  try {
    const { data, error } = await client
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId)
      .select()
      .single();

    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

// ==============================================================================
// MOTOR DE DISPONIBILIDAD HORARIA (AVAILABILITY ENGINE)
// ==============================================================================

/**
 * Convierte una cadena de hora "HH:MM" o "HH:MM:SS" a minutos desde la medianoche.
 * @param {string} timeStr 
 * @returns {number}
 */
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

/**
 * Convierte minutos desde medianoche a formato "HH:MM:SS".
 * @param {number} totalMinutes 
 * @returns {string}
 */
function formatMinutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
}

/**
 * Convierte minutos desde medianoche a formato legible "HH:MM".
 * @param {number} totalMinutes 
 * @returns {string}
 */
function formatMinutesToLabel(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Obtiene la fecha y hora actual en la zona horaria 'Europe/Madrid'.
 * @returns {{ currentDateStr: string, currentMinutes: number, currentYear: number }}
 */
function getNowInMadrid() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(new Date());
  const map = {};
  parts.forEach(p => { map[p.type] = p.value; });

  const currentDateStr = `${map.year}-${map.month}-${map.day}`;
  const currentMinutes = parseInt(map.hour, 10) * 60 + parseInt(map.minute, 10);
  const currentYear = parseInt(map.year, 10);

  return { currentDateStr, currentMinutes, currentYear };
}

/**
 * Calcula los huecos de tiempo (slots) disponibles para una fecha, servicio y profesional.
 * 
 * @param {object} params
 * @param {string} [params.businessId] - ID del negocio (opcional, se resuelve por defecto)
 * @param {string} [params.workerId]   - ID del profesional o 'any' para cualquier profesional
 * @param {string} params.serviceId   - ID o slug del servicio
 * @param {string} params.date        - Fecha en formato YYYY-MM-DD
 * @returns {Promise<Array<{ start: string, end: string, timeLabel: string, available: boolean, period: string, workerId?: string, workerName?: string }>>}
 */
export async function getAvailableTimeSlots({ businessId, workerId, serviceId, date }) {
  if (!date || !serviceId) {
    return [];
  }

  // 1. Resolver el ID del Negocio si no se proporcionó
  let resolvedBusinessId = businessId;
  let minAdvanceHours = 2;

  if (!resolvedBusinessId) {
    const busRes = await getBusiness();
    if (busRes.data) {
      resolvedBusinessId = busRes.data.id;
      if (typeof busRes.data.min_advance_hours === 'number') {
        minAdvanceHours = busRes.data.min_advance_hours;
      }
    }
  }

  // 2. Obtener la duración del servicio
  let durationMinutes = 45;
  const servicesRes = await getServices(resolvedBusinessId);
  if (servicesRes.data && servicesRes.data.length > 0) {
    const matchingService = servicesRes.data.find(s => s.id === serviceId || s.slug === serviceId);
    if (matchingService) {
      durationMinutes = matchingService.duration_minutes || matchingService.durationMinutes || 45;
    }
  }

  // 3. Obtener el día de la semana (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
  const [yearStr, monthStr, dayStr] = date.split('-');
  const dateObj = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));
  const dayOfWeek = dateObj.getDay();

  // 4. Resolver lista de trabajadores a evaluar
  const workersRes = await getWorkers(resolvedBusinessId);
  const allActiveWorkers = workersRes.data || [];
  if (allActiveWorkers.length === 0) {
    return [];
  }

  let targetWorkers = [];
  if (!workerId || workerId === 'any' || workerId === 'all') {
    targetWorkers = allActiveWorkers;
  } else {
    targetWorkers = allActiveWorkers.filter(w => w.id === workerId || w.slug === workerId);
    if (targetWorkers.length === 0 && allActiveWorkers.length > 0) {
      targetWorkers = [allActiveWorkers[0]];
    }
  }

  // 5. Consultar excepciones de calendario para la fecha (festivos / vacaciones)
  const exceptionsRes = await getScheduleExceptions(resolvedBusinessId);
  const exceptions = exceptionsRes.data || [];
  
  // Comprobar si todo el negocio está cerrado en esa fecha
  const isBusinessClosed = exceptions.some(ex => {
    return !ex.worker_id && ex.is_closed_all_day && ex.start_date <= date && ex.end_date >= date;
  });

  if (isBusinessClosed) {
    return [];
  }

  // 6. Consultar citas existentes del día (solo confirmadas o completadas)
  const appointmentsRes = await getAppointments(resolvedBusinessId, { date });
  const allAppointments = (appointmentsRes.data || []).filter(app => 
    app.status === 'confirmed' || app.status === 'completed'
  );

  // 7. Consultar horarios generales del negocio y horarios de trabajadores
  const [bizSchedulesRes, workerSchedulesRes] = await Promise.all([
    getBusinessSchedules(resolvedBusinessId),
    getWorkerSchedules(resolvedBusinessId)
  ]);

  const bizSchedules = bizSchedulesRes.data || [];
  const workerSchedules = workerSchedulesRes.data || [];

  const todayBizSchedule = bizSchedules.find(s => s.day_of_week === dayOfWeek);

  // Si el negocio cierra ese día de la semana por horario general y no hay horario especial
  if (todayBizSchedule && !todayBizSchedule.is_open) {
    return [];
  }

  // 8. Determinar restricciones de tiempo presente (Zona Horaria Europe/Madrid)
  const { currentDateStr, currentMinutes } = getNowInMadrid();
  const isPastDate = date < currentDateStr;
  const isToday = date === currentDateStr;
  const minAllowedMinutesToday = currentMinutes + (minAdvanceHours * 60);

  // 9. Generar slots para cada trabajador y consolidar disponibilidad
  // Mapa de slots por clave de tiempo ("HH:MM")
  const slotsMap = new Map();

  for (const worker of targetWorkers) {
    // Verificar si este trabajador específico tiene excepción de cierre para este día
    const isWorkerOnLeave = exceptions.some(ex => {
      return ex.worker_id === worker.id && ex.is_closed_all_day && ex.start_date <= date && ex.end_date >= date;
    });

    if (isWorkerOnLeave) {
      continue;
    }

    // Obtener horario del trabajador para este día de la semana
    const workerSchedule = workerSchedules.find(ws => ws.worker_id === worker.id && ws.day_of_week === dayOfWeek);

    let morningStart = null;
    let morningEnd = null;
    let afternoonStart = null;
    let afternoonEnd = null;

    if (workerSchedule) {
      if (!workerSchedule.is_active_day) {
        continue;
      }
      morningStart = workerSchedule.morning_start;
      morningEnd = workerSchedule.morning_end;
      afternoonStart = workerSchedule.afternoon_start;
      afternoonEnd = workerSchedule.afternoon_end;
    } else if (todayBizSchedule && todayBizSchedule.is_open) {
      morningStart = todayBizSchedule.morning_open;
      morningEnd = todayBizSchedule.morning_close;
      afternoonStart = todayBizSchedule.afternoon_open;
      afternoonEnd = todayBizSchedule.afternoon_close;
    } else {
      // Horario por defecto estándar de la peluquería (L-V 09:00-14:00 y 16:00-20:00)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        morningStart = '09:00:00';
        morningEnd = '14:00:00';
        afternoonStart = '16:00:00';
        afternoonEnd = '20:00:00';
      } else {
        continue;
      }
    }

    // Citas existentes para este trabajador en el día
    const workerAppointments = allAppointments.filter(app => app.worker_id === worker.id);

    // Definir los turnos activos
    const shifts = [];
    if (morningStart && morningEnd) {
      shifts.push({
        startMins: parseTimeToMinutes(morningStart),
        endMins: parseTimeToMinutes(morningEnd),
        period: 'morning'
      });
    }
    if (afternoonStart && afternoonEnd) {
      shifts.push({
        startMins: parseTimeToMinutes(afternoonStart),
        endMins: parseTimeToMinutes(afternoonEnd),
        period: 'afternoon'
      });
    }

    // Generar franjas horarias
    for (const shift of shifts) {
      let slotStartMins = shift.startMins;

      while (slotStartMins + durationMinutes <= shift.endMins) {
        const slotEndMins = slotStartMins + durationMinutes;
        const timeKey = formatMinutesToLabel(slotStartMins);
        const startTimeFormatted = formatMinutesToTime(slotStartMins);
        const endTimeFormatted = formatMinutesToTime(slotEndMins);

        // Comprobar solapamiento con citas existentes
        const hasOverlap = workerAppointments.some(app => {
          const apptStartMins = parseTimeToMinutes(app.start_time);
          const apptEndMins = parseTimeToMinutes(app.end_time);
          return (slotStartMins < apptEndMins) && (slotEndMins > apptStartMins);
        });

        // Comprobar si el hueco está en el pasado o dentro del margen mínimo de antelación
        let isSlotAvailable = !hasOverlap;
        if (isPastDate) {
          isSlotAvailable = false;
        } else if (isToday && slotStartMins < minAllowedMinutesToday) {
          isSlotAvailable = false;
        }

        if (!slotsMap.has(timeKey)) {
          slotsMap.set(timeKey, {
            start: startTimeFormatted,
            end: endTimeFormatted,
            timeLabel: timeKey,
            period: shift.period,
            available: isSlotAvailable,
            workerId: isSlotAvailable ? worker.id : null,
            workerName: isSlotAvailable ? worker.name : null
          });
        } else {
          // Si ya existe la franja y este trabajador está libre, se actualiza a disponible
          const existingSlot = slotsMap.get(timeKey);
          if (isSlotAvailable && !existingSlot.available) {
            existingSlot.available = true;
            existingSlot.workerId = worker.id;
            existingSlot.workerName = worker.name;
          }
        }

        slotStartMins += durationMinutes;
      }
    }
  }

  // 10. Ordenar los slots cronológicamente
  const sortedSlots = Array.from(slotsMap.values()).sort((a, b) => {
    return parseTimeToMinutes(a.timeLabel) - parseTimeToMinutes(b.timeLabel);
  });

  return sortedSlots;
}

export { isSupabaseConfigured };
