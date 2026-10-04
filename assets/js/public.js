/**
 * Peluquería Arxemil - Interacciones Públicas & Conexión de Datos
 * Conecta la landing pública con Supabase a través de supabaseService.js
 * con fallback automático a mockData.js.
 */

import { getBusiness, getServices, getWorkers } from './lib/supabaseService.js';
import { BUSINESS_DATA, SERVICES_DATA, BARBERS_DATA } from './data/mockData.js';

// ==============================================================================
// 1. RENDERIZADO DE COMPONENTES VISUALES (ESTRUCTURA EXACTA DE STITCH)
// ==============================================================================

/**
 * Renderiza una tarjeta de servicio respetando el diseño original.
 * @param {object} service 
 * @returns {string}
 */
function renderServiceCard(service) {
  const isPopular = service.is_popular || service.isPopular;
  const duration = service.duration_minutes || service.durationMinutes || 45;
  const price = typeof service.price === 'number' ? service.price : parseFloat(service.price);
  const slug = service.slug || 'corte-de-pelo';
  const name = service.name;
  const description = service.description || '';
  const includes = service.includes || [];
  const firstInclude = includes.length > 0 ? includes[0] : null;

  if (isPopular) {
    return `
      <div class="relative group p-6 rounded-2xl bg-surface-container flex flex-col justify-between gap-space-md shadow-xl transition-all duration-300 hover:bg-surface-container-high hover:-translate-y-1 border border-primary-container/30">
        <div class="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold uppercase tracking-wider shadow-sm">
          ${service.tag || 'Más Popular'}
        </div>
        <div class="flex flex-col gap-space-sm">
          <div class="flex items-center justify-between">
            <span class="px-3 py-1 rounded-full bg-surface-container-highest text-primary font-label-sm text-label-sm flex items-center gap-1.5">
              <span class="material-symbols-outlined text-xs">timer</span>
              <span>${duration} min</span>
            </span>
            <span class="font-headline-lg text-headline-lg font-display text-primary-container">${price} €</span>
          </div>
          <div class="mt-2">
            <h3 class="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors">${name}</h3>
            <p class="font-body-sm text-body-sm text-on-surface-variant mt-2 leading-relaxed">
              ${description}
            </p>
          </div>
        </div>
        <div class="pt-4 flex flex-col gap-2">
          ${firstInclude ? `
          <div class="flex items-center gap-2 text-primary font-body-sm text-body-sm font-medium">
            <span class="material-symbols-outlined text-base">spa</span>
            <span>${firstInclude}</span>
          </div>` : ''}
          <a class="mt-3 w-full py-3 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md uppercase tracking-wider text-center font-bold transition-all duration-200 hover:brightness-110 shadow-sm" href="reservar.html?service=${slug}">
            Reservar este servicio
          </a>
        </div>
      </div>
    `;
  }

  return `
    <div class="group p-6 rounded-2xl bg-surface-container-low flex flex-col justify-between gap-space-md transition-all duration-300 hover:bg-surface-container hover:shadow-xl hover:-translate-y-1">
      <div class="flex flex-col gap-space-sm">
        <div class="flex items-center justify-between">
          <span class="px-3 py-1 rounded-full bg-surface-container-high text-primary-container font-label-sm text-label-sm flex items-center gap-1.5">
            <span class="material-symbols-outlined text-xs">timer</span>
            <span>${duration} min${duration === 60 ? ' (1 h)' : ''}</span>
          </span>
          <span class="font-headline-lg text-headline-lg font-display text-on-surface">${price} €</span>
        </div>
        <div class="mt-2">
          <h3 class="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors">${name}</h3>
          <p class="font-body-sm text-body-sm text-on-surface-variant mt-2 leading-relaxed">
            ${description}
          </p>
        </div>
      </div>
      <div class="pt-4 flex flex-col gap-2">
        ${firstInclude ? `
        <div class="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
          <span class="material-symbols-outlined text-primary text-base">check_circle</span>
          <span>${firstInclude}</span>
        </div>` : ''}
        <a class="mt-3 w-full py-3 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md uppercase tracking-wider text-center transition-all duration-200 group-hover:bg-primary-container group-hover:text-on-primary-container font-bold" href="reservar.html?service=${slug}">
          Reservar este servicio
        </a>
      </div>
    </div>
  `;
}

/**
 * Renderiza una tarjeta de trabajador/barbero respetando el diseño original.
 * @param {object} worker 
 * @returns {string}
 */
function renderWorkerCard(worker) {
  const photo = worker.photo_url || worker.avatar || '';
  const name = worker.name;
  const role = worker.role_title || worker.role || 'Barber & Stylist';
  const slug = worker.slug || 'barber';
  const description = worker.description || '';
  const specialties = worker.specialties || worker.tags || [];

  const isLimited = (slug === 'iago' || worker.status === 'limited_slots');
  const dotColorClass = isLimited ? 'bg-secondary-container' : 'bg-emerald-400';
  const statusText = isLimited ? 'Pocas citas hoy' : 'Disponible hoy';

  const specialtiesHtml = specialties
    .map(spec => `<span class="px-2.5 py-1 rounded-md bg-surface-container-high text-on-surface font-label-sm text-label-sm">${spec}</span>`)
    .join('');

  return `
    <div class="group rounded-2xl bg-surface-container-low overflow-hidden transition-all duration-300 hover:bg-surface-container hover:shadow-xl">
      <div class="relative aspect-[3/4] w-full overflow-hidden bg-surface-container">
        <img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Retrato de ${name}, ${role} en Peluquería Arxemil" src="${photo}"/>
        <div class="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent"></div>
        <div class="absolute top-4 right-4 px-3 py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full ${dotColorClass}"></span>
          <span class="font-label-sm text-label-sm text-on-surface">${statusText}</span>
        </div>
      </div>
      <div class="p-6 flex flex-col gap-space-sm">
        <div>
          <span class="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">${role}</span>
          <h3 class="font-headline-md text-headline-md text-on-surface mt-0.5">${name}</h3>
        </div>
        <p class="font-body-sm text-body-sm text-on-surface-variant">
          ${description}
        </p>
        <div class="pt-2 flex flex-wrap gap-2">
          ${specialtiesHtml}
        </div>
        <a class="mt-4 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md uppercase tracking-wider hover:bg-primary-container hover:text-on-primary-container transition-colors font-bold" href="reservar.html?barber=${slug}">
          <span>Elegir a ${name}</span>
          <span class="material-symbols-outlined text-base">arrow_forward</span>
        </a>
      </div>
    </div>
  `;
}

// ==============================================================================
// 2. CARGA DE DATOS (SUPABASE CON FALLBACK A MOCKDATA)
// ==============================================================================

async function initLandingData() {
  const servicesContainer = document.getElementById('services-container');
  const teamContainer = document.getElementById('team-container');

  try {
    const envSlug = (window.__ENV__ && window.__ENV__.BUSINESS_SLUG) ? window.__ENV__.BUSINESS_SLUG : 'arxemil-lugo';
    
    // Consulta del negocio
    const { data: business, error: busError } = await getBusiness(envSlug);
    
    if (busError || !business) {
      console.info('[Landing] No se pudo cargar el negocio de Supabase. Usando fallback de mockData.js.', busError);
      return; // Los datos por defecto en HTML ya concuerdan con mockData
    }

    // Consulta de servicios y trabajadores activos
    const [servicesRes, workersRes] = await Promise.all([
      getServices(business.id),
      getWorkers(business.id)
    ]);

    // Inyectar Servicios
    if (servicesRes.data && servicesRes.data.length > 0 && servicesContainer) {
      servicesContainer.innerHTML = servicesRes.data.map(renderServiceCard).join('');
    }

    // Inyectar Trabajadores
    if (workersRes.data && workersRes.data.length > 0 && teamContainer) {
      teamContainer.innerHTML = workersRes.data.map(renderWorkerCard).join('');
    }

    console.info(`[Landing] Datos sincronizados con Supabase: Negocio "${business.name}", ${servicesRes.data?.length || 0} servicios, ${workersRes.data?.length || 0} trabajadores.`);

  } catch (err) {
    console.warn('[Landing] Excepción al consultar Supabase. Manteniendo datos estáticos/mock.', err);
  }
}

// ==============================================================================
// 3. INTERACCIONES DEL DOM (DRAWER, SMOOTH SCROLL)
// ==============================================================================

function setupDomInteractions() {
  // Mobile Menu Drawer
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenuCloseBtn = document.getElementById('mobile-menu-close-btn');
  const mobileDrawer = document.getElementById('mobile-menu-drawer');
  const mobileBackdrop = document.getElementById('mobile-menu-backdrop');

  function openMobileMenu() {
    if (mobileDrawer && mobileBackdrop) {
      mobileBackdrop.classList.remove('hidden');
      mobileDrawer.classList.remove('translate-x-full');
      document.body.classList.add('overflow-hidden');
    }
  }

  function closeMobileMenu() {
    if (mobileDrawer && mobileBackdrop) {
      mobileDrawer.classList.add('translate-x-full');
      setTimeout(() => {
        mobileBackdrop.classList.add('hidden');
      }, 200);
      document.body.classList.remove('overflow-hidden');
    }
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', openMobileMenu);
  }

  if (mobileMenuCloseBtn) {
    mobileMenuCloseBtn.addEventListener('click', closeMobileMenu);
  }

  if (mobileBackdrop) {
    mobileBackdrop.addEventListener('click', (e) => {
      if (e.target === mobileBackdrop) {
        closeMobileMenu();
      }
    });
  }

  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const headerOffset = 90;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });
}

function init() {
  setupDomInteractions();
  initLandingData();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

