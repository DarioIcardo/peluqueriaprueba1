/**
 * Peluquería Arxemil - Panel de Administración & Backoffice Cockpit
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Sidebar Drawer Toggle
  const adminSidebarToggle = document.getElementById('admin-sidebar-toggle');
  const adminSidebarClose = document.getElementById('admin-sidebar-close');
  const adminSidebar = document.getElementById('admin-sidebar');
  const adminSidebarBackdrop = document.getElementById('admin-sidebar-backdrop');

  function openAdminSidebar() {
    if (adminSidebar && adminSidebarBackdrop) {
      adminSidebarBackdrop.classList.remove('hidden');
      adminSidebar.classList.remove('-translate-x-full');
      document.body.classList.add('overflow-hidden');
    }
  }

  function closeAdminSidebar() {
    if (adminSidebar && adminSidebarBackdrop) {
      adminSidebar.classList.add('-translate-x-full');
      setTimeout(() => {
        adminSidebarBackdrop.classList.add('hidden');
      }, 200);
      document.body.classList.remove('overflow-hidden');
    }
  }

  if (adminSidebarToggle) {
    adminSidebarToggle.addEventListener('click', openAdminSidebar);
  }

  if (adminSidebarClose) {
    adminSidebarClose.addEventListener('click', closeAdminSidebar);
  }

  if (adminSidebarBackdrop) {
    adminSidebarBackdrop.addEventListener('click', (e) => {
      if (e.target === adminSidebarBackdrop) {
        closeAdminSidebar();
      }
    });
  }

  // Backoffice Tab Switcher
  window.switchTab = function(tabId) {
    const tabs = ['agenda', 'servicios', 'equipo', 'config'];
    
    tabs.forEach(t => {
      const content = document.getElementById('content-' + t);
      const btn = document.getElementById('tab-btn-' + t);
      const sidebarNav = document.getElementById('sidebar-nav-' + t);

      if (content) {
        content.classList.add('hidden');
        content.classList.remove('flex');
      }
      
      if (btn) {
        btn.classList.remove('bg-primary-container', 'text-on-primary-container', 'font-bold');
        btn.classList.add('text-on-surface-variant', 'font-semibold');
      }

      if (sidebarNav) {
        sidebarNav.classList.remove('bg-primary-container', 'text-on-primary-container', 'font-bold');
        sidebarNav.classList.add('text-on-surface-variant');
      }
    });

    // Show active tab
    const activeContent = document.getElementById('content-' + tabId);
    const activeBtn = document.getElementById('tab-btn-' + tabId);
    const activeSidebarNav = document.getElementById('sidebar-nav-' + tabId);

    if (activeContent) {
      activeContent.classList.remove('hidden');
      activeContent.classList.add('flex');
    }

    if (activeBtn) {
      activeBtn.classList.remove('text-on-surface-variant', 'font-semibold');
      activeBtn.classList.add('bg-primary-container', 'text-on-primary-container', 'font-bold');
    }

    if (activeSidebarNav) {
      activeSidebarNav.classList.remove('text-on-surface-variant');
      activeSidebarNav.classList.add('bg-primary-container', 'text-on-primary-container', 'font-bold');
    }

    // If mobile, close sidebar on nav click
    if (window.innerWidth < 1024) {
      closeAdminSidebar();
    }
  };

  // Service Edit / Create Modal
  window.editService = function(name, price, duration) {
    const modalTitle = document.getElementById('modal-service-title');
    const inputName = document.getElementById('modal-input-name');
    const inputPrice = document.getElementById('modal-input-price');
    const inputDuration = document.getElementById('modal-input-duration');
    const modal = document.getElementById('service-modal');

    if (modalTitle) modalTitle.innerText = 'Modificar ' + name;
    if (inputName) inputName.value = name;
    if (inputPrice) inputPrice.value = price;
    if (inputDuration) inputDuration.value = duration;

    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  };

  window.openModal = function(type) {
    const modalTitle = document.getElementById('modal-service-title');
    const inputName = document.getElementById('modal-input-name');
    const inputPrice = document.getElementById('modal-input-price');
    const inputDuration = document.getElementById('modal-input-duration');
    const modal = document.getElementById('service-modal');

    if (modalTitle) modalTitle.innerText = 'Nuevo Servicio Especial';
    if (inputName) inputName.value = '';
    if (inputPrice) inputPrice.value = '25';
    if (inputDuration) inputDuration.value = '45';

    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  };

  window.closeModal = function() {
    const modal = document.getElementById('service-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  // Agenda Search Filter
  const agendaSearchInput = document.getElementById('agenda-search-input');
  if (agendaSearchInput) {
    agendaSearchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      document.querySelectorAll('.appointment-card').forEach(card => {
        const text = card.innerText.toLowerCase();
        if (text.includes(term)) {
          card.style.opacity = '1';
          card.style.filter = 'none';
        } else {
          card.style.opacity = '0.3';
          card.style.filter = 'grayscale(1)';
        }
      });
    });
  }

  // Barber Column Filter Pills
  window.filterBarber = function(barberName, btn) {
    document.querySelectorAll('.barber-filter-btn').forEach(b => {
      b.classList.remove('bg-surface-container-highest', 'text-primary-fixed', 'font-bold');
      b.classList.add('bg-surface-container', 'text-on-surface-variant');
    });

    if (btn) {
      btn.classList.add('bg-surface-container-highest', 'text-primary-fixed', 'font-bold');
      btn.classList.remove('bg-surface-container', 'text-on-surface-variant');
    }

    const cols = document.querySelectorAll('.barber-schedule-col');
    cols.forEach(col => {
      const colBarber = col.getAttribute('data-barber');
      if (barberName === 'all' || colBarber === barberName) {
        col.classList.remove('hidden');
      } else {
        col.classList.add('hidden');
      }
    });
  };
});
