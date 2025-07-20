// Initialize application
document.addEventListener('DOMContentLoaded', function () {
  // Mobile navigation toggle
  const navToggle = document.querySelector('.mobile-nav-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      mainNav.classList.toggle('active');

      // ---> POPRAWKA 1: DODAJ TĘ LINIĘ <---
      // Ta linia dodaje/usuwa klasę na przycisku, aby uruchomić animację ikony w CSS
      this.classList.toggle('is-active');

      const isActive = mainNav.classList.contains('active');
      this.setAttribute('aria-expanded', isActive);
    });
  }

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      const targetElement = document.querySelector(href);

      if (targetElement) {
        e.preventDefault();
        const offsetTop = targetElement.offsetTop - 70;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });

        // Close mobile menu if open
        if (mainNav && mainNav.classList.contains('active')) {
          mainNav.classList.remove('active');

          // ---> POPRAWKA 2: DODAJ TEŻ TĘ LINIĘ <---
          // Resetuje ikonę z "X" do hamburgera, gdy menu jest zamykane przez kliknięcie linku
          navToggle.classList.remove('is-active');

          navToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  // Load announcements
  loadAnnouncements();

  // Initialize schedules
  initializeSchedules();

  // Initialize price calculator
  initializePriceCalculator();
});


function loadAnnouncements() {
  const container = document.getElementById('announcements-container');
  if (!container) return;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // ---> KROK 1: FILTROWANIE (przywrócona, poprawna logika) <---
  // Najpierw wybieramy tylko te komunikaty, które są aktywne dzisiaj.
  const activeAnnouncements = announcementsData.filter(item => {
    const pubDate = new Date(item.publicationDate);
    const termDate = new Date(item.terminationDate);
    pubDate.setHours(0, 0, 0, 0);
    termDate.setHours(0, 0, 0, 0);
    return now >= pubDate && now <= termDate;
  });

  // ---> KROK 2: SORTOWANIE <---
  // Sortujemy tylko aktywne komunikaty, aby najnowszy był pierwszy.
  activeAnnouncements.sort((a, b) => new Date(b.publicationDate) - new Date(a.publicationDate));

  container.innerHTML = '';

  if (activeAnnouncements.length === 0) {
    container.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">Brak aktualnych komunikatów.</p>';
    return;
  }

  // ---> KROK 3: RENDEROWANIE (z logiką animacji) <---
  // Przechodzimy pętlą tylko po aktywnych komunikatach.
  activeAnnouncements.forEach((announcement, index) => {
    const card = document.createElement('div');
    card.className = `announcement-card ${index === 0 ? 'featured' : ''}`;

    const formattedText = formatTextWithMarkdown(announcement.text);
    const plainText = announcement.text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\n/g, ' ');
    const showReadMore = plainText.length > 250;

    card.innerHTML = `
      <h3>${announcement.title}</h3>
      <p class="date">${announcement.displayDate}</p>
      <div class="announcement-content">${formattedText}</div>
      ${showReadMore ? '<a href="#" class="read-more">Czytaj więcej</a>' : ''}
    `;

    const contentDiv = card.querySelector('.announcement-content');

    if (showReadMore) {
      const readMoreBtn = card.querySelector('.read-more');
      readMoreBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const isNowExpanded = contentDiv.classList.toggle('expanded');
        this.textContent = isNowExpanded ? 'Zwiń' : 'Czytaj więcej';
      });
    } else {
      contentDiv.classList.add('expanded');
    }

    container.appendChild(card);
  });
}

function formatTextWithMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

// Schedules functionality
function initializeSchedules() {
  const selectorContainer = document.getElementById('schedule-selector-container');
  const detailsContainer = document.getElementById('schedule-details-container');
  const placeholderText = document.getElementById('schedule-placeholder-text');

  if (!selectorContainer || !detailsContainer) return;

  // Create route buttons
  Object.keys(schedulesData).forEach(routeId => {
    const route = schedulesData[routeId];
    const button = document.createElement('button');
    button.className = 'schedule-selector-btn';
    button.textContent = route.routeName;
    button.dataset.routeId = routeId;
    button.addEventListener('click', () => selectRoute(routeId));
    selectorContainer.appendChild(button);
  });
}

function selectRoute(routeId) {
  document.querySelectorAll('.schedule-selector-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.routeId === routeId);
  });

  renderSchedule(routeId);

  document.getElementById('schedule-placeholder-text')?.classList.add('hidden');
  const detailsContainer = document.getElementById('schedule-details-container');
  detailsContainer?.classList.remove('hidden');

  // ---> DODAJ TĘ LINIĘ <---
  detailsContainer?.classList.add('fade-in-up');

  setTimeout(() => {
    detailsContainer?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

function renderSchedule(routeId, options = {}) {
  const route = schedulesData[routeId];
  const detailsContainer = document.getElementById('schedule-details-container');
  const activeSchedule = getActiveSchedule(route);

  if (!activeSchedule) {
    detailsContainer.innerHTML = '<p class="text-center" style="color: #dc2626; padding: 1rem;">Dla tej trasy nie znaleziono aktywnego rozkładu jazdy.</p>';
    return;
  }

  const {
    activeDirectionIndex = 0,
    activeDayTypeKey = getDayType(new Date()).key,
    isFullView = false
  } = options;

  let html = '';

  if (activeSchedule.type !== 'standardowy') {
    html += `
      <div class="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>Obowiązuje rozkład: <strong>${activeSchedule.type}</strong></p>
      </div>
    `;
  }

  if (activeSchedule.directions.length > 1) {
    html += '<div class="direction-switcher-container">';
    html += '<label>Wybierz kierunek:</label>';

    if (activeSchedule.directions.length === 2) {
      html += '<div style="display: flex; gap: -1px; margin-top: 0.25rem;">';
      activeSchedule.directions.forEach((dir, idx) => {
        html += `
          <button class="direction-tab-btn ${idx === activeDirectionIndex ? 'active' : ''}"
                  data-route-id="${routeId}"
                  data-direction-index="${idx}">
            ${dir.directionName}
          </button>
        `;
      });
      html += '</div>';
    } else {
      html += `<select id="direction-select" data-route-id="${routeId}">`;
      activeSchedule.directions.forEach((dir, idx) => {
        html += `<option value="${idx}" ${idx === activeDirectionIndex ? 'selected' : ''}>${dir.directionName}</option>`;
      });
      html += '</select>';
    }
    html += '</div>';
  }

  const direction = activeSchedule.directions[activeDirectionIndex];

  if (route.priceListId && priceListData[route.priceListId]) {
    html += `
      <div class="price-calculator-wrapper">
        <button class="toggle-price-calculator-btn" data-route-id="${routeId}" data-accepts-card="${route.acceptsCard}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width: 1.25rem; height: 1.25rem;">
            <path d="M8.433 7.418c.158-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-1.162-.328zM11 12.849v-1.698c.22.071.408.164.567.267a2.5 2.5 0 001.162.328z" />
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.5 4.5 0 00-1.831.876a1 1 0 00.707 1.852A2.5 2.5 0 0110 9.5v1.034a2.5 2.5 0 01-1.162.328 1 1 0 00-.707 1.852A4.5 4.5 0 009 14.908V15a1 1 0 102 0v-.092a4.5 4.5 0 001.831-.876a1 1 0 00-.707-1.852A2.5 2.5 0 0110 11.5v-1.034a2.5 2.5 0 011.162-.328 1 1 0 00.707-1.852A4.5 4.5 0 0011 6.092V6z" clip-rule="evenodd" />
          </svg>
          <span>Sprawdź cenę biletu</span>
        </button>
        <div class="price-calculator-container hidden" id="route-price-calc-${routeId}"></div>
      </div>
    `;
  }

  if (!isFullView) {
    html += '<div class="day-type-switcher">';
    html += '<label>Pokaż rozkład na:</label>';
    html += '<div style="display: flex; gap: -1px; margin-top: 0.25rem;">';

    const dayTypes = [
      { key: 'workdays', name: 'Robocze' },
      { key: 'saturdays', name: 'Soboty' },
      { key: 'sundays', name: 'Niedziele' }
    ];

    dayTypes.forEach(dt => {
      html += `
        <button class="day-type-btn ${dt.key === activeDayTypeKey ? 'active' : ''}"
                data-route-id="${routeId}"
                data-day-key="${dt.key}">
          ${dt.name}
        </button>
      `;
    });
    html += '</div></div>';

    const now = new Date();
    const isToday = activeDayTypeKey === getDayType(now).key;
    const currentHour = now.getHours();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    html += `
      <div class="time-slider-container">
        <label>
          Odjazdy od: <strong style="color: var(--color-primary);">
            <span id="slider-time">${isToday ? currentTime : '04:00'}</span>
          </strong>
          <span style="font-size: 0.75rem; color: var(--color-text-muted); margin-left: 0.5rem;">(przesuń, aby zmienić)</span>
        </label>
        <input type="range" class="time-slider" 
               id="time-slider-${routeId}"
               data-route-id="${routeId}"
               min="4" max="23" 
               value="${isToday ? currentHour : 4}">
      </div>
    `;

    html += `<div id="times-grid-${routeId}">`;
    html += generateTimesGrid(direction, activeDayTypeKey, isToday ? currentHour : 4);
    html += '</div>';
  } else {
    // -----> POCZĄTEK POPRAWKI <-----
    // Full schedule view
    html += '<div style="margin-top: 1rem;">';
    ['workdays', 'saturdays', 'sundays'].forEach(dayKey => {
      const dayNames = {
        workdays: 'Dni Robocze',
        saturdays: 'Soboty',
        sundays: 'Niedziele i Święta'
      };

      html += `<h4 style="margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">${dayNames[dayKey]}</h4>`;
      const times = direction.times[dayKey] || [];

      if (times.length === 0) {
        html += '<p style="color: var(--color-text-muted); font-style: italic;">Brak kursów</p>';
      } else {
        html += '<div class="time-grid">';
        times.forEach(t => {
          // Dodano logikę do tworzenia tekstu dla tooltipa
          let tooltipText = '';
          if (t.noteKey && direction.notes && direction.notes[t.noteKey]) {
            tooltipText = direction.notes[t.noteKey];
          }

          html += `<div class="time-box bg-light-gray" 
                        ${tooltipText ? `data-tooltip="${tooltipText}"` : ''}>
                      <div class="time-box-content">
                        <span class="time-value">${t.time}</span>
                        ${t.noteKey ? `<span class="time-note">${t.noteKey}</span>` : ''}
                      </div>
                    </div>`;
        });
        html += '</div>';
      }
    });
    html += '</div>';
    // -----> KONIEC POPRAWKI <-----
  }

  if (direction.notes && Object.keys(direction.notes).length > 0) {
    html += '<div class="notes-legend">';
    Object.entries(direction.notes).forEach(([key, value]) => {
      html += `<p><strong>${key}</strong> - ${value}</p>`;
    });
    html += '</div>';
  }

  html += `
    <button class="toggle-full-schedule-btn" 
            data-route-id="${routeId}" 
            data-full-view="${isFullView}">
      ${isFullView ? 'Zwiń rozkład' : 'Pełny rozkład →'}
    </button>
  `;

  detailsContainer.innerHTML = html;
  attachScheduleEventListeners(routeId, activeDirectionIndex, activeDayTypeKey);
}

function generateTimesGrid(direction, dayTypeKey, fromHour) {
  const times = direction.times[dayTypeKey] || [];
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isToday = dayTypeKey === getDayType(now).key;

  const filteredTimes = times.filter(t => {
    const [h] = t.time.split(':').map(Number);
    return h >= fromHour;
  });

  if (filteredTimes.length === 0) {
    return `
      <div class="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>${isToday && fromHour === now.getHours() ? 'Na dziś nie ma już więcej kursów.' : 'Brak kursów w wybranym zakresie.'}</span>
      </div>
    `;
  }

  let html = '<div class="time-grid">';
  let firstFutureFound = false;

  filteredTimes.forEach(t => {
    const [h, m] = t.time.split(':').map(Number);
    const timeMinutes = h * 60 + m;
    const isFuture = isToday && timeMinutes > currentMinutes;
    const isPast = isToday && timeMinutes <= currentMinutes;
    const isFirstFuture = isFuture && !firstFutureFound;

    if (isFirstFuture) firstFutureFound = true;

    let tooltipText = '';
    let minutesUntil = 0; // <--- POPRAWKA 1: Zmienna jest teraz zdefiniowana na początku.

    if (isFuture) {
      minutesUntil = timeMinutes - currentMinutes; // <--- POPRAWKA 2: Przypisujemy wartość, a nie tworzymy nową zmienną.
      tooltipText = formatMinutesUntil(minutesUntil);
    }
    if (t.noteKey && direction.notes && direction.notes[t.noteKey]) {
      tooltipText = tooltipText ? `${tooltipText} (${direction.notes[t.noteKey]})` : direction.notes[t.noteKey];
    }

    html += `
      <div class="time-box ${isPast ? 'bg-no-background' : 'bg-light-gray'}"
           ${tooltipText ? `data-tooltip="${tooltipText}"` : ''}>
        <div class="time-box-content">
          ${isFirstFuture ? '<span class="time-icon">⏰</span>' : ''}
          <span class="time-value">${t.time}</span>
          ${t.noteKey ? `<span class="time-note">${t.noteKey}</span>` : ''}
        </div>
        ${isFuture ? `<div class="countdown-container"><span class="countdown-text">${formatMinutesShort(minutesUntil)}</span></div>` : ''}
      </div>
    `;
  });

  html += '</div>';
  return html;
}

function attachScheduleEventListeners(routeId, activeDirectionIndex, activeDayTypeKey) {
  // Direction switcher
  document.querySelectorAll('.direction-tab-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const newIndex = parseInt(this.dataset.directionIndex);
      renderSchedule(routeId, { activeDirectionIndex: newIndex, activeDayTypeKey });
    });
  });

  const directionSelect = document.getElementById('direction-select');
  if (directionSelect) {
    directionSelect.addEventListener('change', function () {
      renderSchedule(routeId, { activeDirectionIndex: parseInt(this.value), activeDayTypeKey });
    });
  }

  // Day type switcher
  document.querySelectorAll('.day-type-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const newDayKey = this.dataset.dayKey;
      renderSchedule(routeId, { activeDirectionIndex, activeDayTypeKey: newDayKey });
    });
  });

  // Time slider
  const slider = document.getElementById(`time-slider-${routeId}`);
  if (slider) {
    slider.addEventListener('input', function () {
      const hour = parseInt(this.value);
      document.getElementById('slider-time').textContent = `${hour.toString().padStart(2, '0')}:00`;

      // -----> POCZĄTEK POPRAWKI <-----
      // Używamy tej samej, prostej i poprawnej logiki, co w funkcji renderSchedule
      const activeSchedule = getActiveSchedule(schedulesData[routeId]);
      const direction = activeSchedule.directions[activeDirectionIndex];
      // -----> KONIEC POPRAWKI <-----

      const gridContainer = document.getElementById(`times-grid-${routeId}`);
      gridContainer.innerHTML = generateTimesGrid(direction, activeDayTypeKey, hour);
      attachTooltipListeners();
    });
  }

  // Toggle full schedule
  document.querySelector('.toggle-full-schedule-btn')?.addEventListener('click', function () {
    const isFullView = this.dataset.fullView === 'true';
    renderSchedule(routeId, { activeDirectionIndex, activeDayTypeKey, isFullView: !isFullView });

    if (isFullView) {
      document.getElementById('schedules-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // Price calculator toggle
  document.querySelector('.toggle-price-calculator-btn')?.addEventListener('click', function () {
    const container = document.getElementById(`route-price-calc-${routeId}`);
    container.classList.toggle('hidden');

    // ---> DODAJ TĘ LINIĘ <---
    if (!container.classList.contains('hidden')) {
      container.classList.add('fade-in-up');
    }

    if (!container.innerHTML) {
      const route = schedulesData[routeId];
      renderPriceCalculator(container, route.priceListId, route.acceptsCard);
    }
  });

  // Tooltips
  attachTooltipListeners();
}

function attachTooltipListeners() {
  const tooltip = document.getElementById('custom-tooltip');
  if (!tooltip) return;

  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.addEventListener('mouseenter', function () {
      tooltip.textContent = this.dataset.tooltip;
      tooltip.classList.add('visible');

      const rect = this.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();

      let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
      left = Math.max(10, Math.min(left, window.innerWidth - tooltipRect.width - 10));

      let top = rect.top - tooltipRect.height - 8;
      if (top < 10) {
        top = rect.bottom + 8;
      }

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
    });

    el.addEventListener('mouseleave', function () {
      tooltip.classList.remove('visible');
    });

    // Mobile touch support
    el.addEventListener('touchstart', function (e) {
      e.preventDefault();
      tooltip.textContent = this.dataset.tooltip;
      tooltip.classList.add('visible');

      const rect = this.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();

      let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
      left = Math.max(10, Math.min(left, window.innerWidth - tooltipRect.width - 10));

      let top = rect.top - tooltipRect.height - 8;
      if (top < 10) {
        top = rect.bottom + 8;
      }

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;

      setTimeout(() => tooltip.classList.remove('visible'), 3000);
    });
  });
}

// Price calculator functionality
function initializePriceCalculator() {
  const mainCalc = document.getElementById('main-price-calculator');
  if (mainCalc) {
    renderPriceCalculator(mainCalc, null, false, true);
  }
}

function renderPriceCalculator(container, priceListId, acceptsCard, isMain = false) {
  let html = '<div style="display: flex; flex-direction: column; gap: 1rem;">';

  if (isMain) {
    html += `
                    <div>
                        <label for="route-select">Wybierz trasę:</label>
                        <select id="route-select">
                            <option value="">-- wybierz trasę --</option>
                `;

    Object.entries(priceListData).forEach(([id, data]) => {
      html += `<option value="${id}">${data.displayName}</option>`;
    });

    html += '</select></div>';
  }

  html += `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <label for="from-stop">Skąd:</label>
                        <select id="from-stop" ${!priceListId && isMain ? 'disabled' : ''}>
                            <option value="">-- wybierz przystanek --</option>
                        </select>
                    </div>
                    <div>
                        <label for="to-stop">Dokąd:</label>
                        <select id="to-stop" disabled>
                            <option value="">-- wybierz przystanek --</option>
                        </select>
                    </div>
                </div>
                <div id="price-result-container-${isMain ? 'main' : priceListId}" style="display: flex; justify-content: space-between; align-items: center; min-height: 2rem;">
                    <span class="price-result" id="price-result"></span>
                    ${acceptsCard ? `
                        <div style="display: flex; align-items: center; gap: 0.5rem; color: #16a34a; font-size: 0.875rem;">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width: 1.25rem; height: 1.25rem;">
                                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h3a1 1 0 100-2H9z" clip-rule="evenodd" />
                            </svg>
                            <span>Można płacić kartą</span>
                        </div>
                    ` : ''}
                </div>
            </div>`;

  container.innerHTML = html;

  const routeSelect = container.querySelector('#route-select');
  const fromSelect = container.querySelector('#from-stop');
  const toSelect = container.querySelector('#to-stop');
  const priceResult = container.querySelector('#price-result');

  function updateStops(selectedPriceListId) {
    if (!selectedPriceListId) {
      fromSelect.disabled = true;
      toSelect.disabled = true;
      fromSelect.innerHTML = '<option value="">-- wybierz przystanek --</option>';
      toSelect.innerHTML = '<option value="">-- wybierz przystanek --</option>';
      priceResult.textContent = '';
      return;
    }

    const data = priceListData[selectedPriceListId];
    fromSelect.disabled = false;
    fromSelect.innerHTML = '<option value="">-- wybierz przystanek --</option>';
    toSelect.innerHTML = '<option value="">-- wybierz przystanek --</option>';

    data.stops.forEach((stop, idx) => {
      fromSelect.innerHTML += `<option value="${idx}">${stop}</option>`;
      toSelect.innerHTML += `<option value="${idx}">${stop}</option>`;
    });
  }

  function calculatePrice() {
    const currentPriceListId = isMain ? routeSelect?.value : priceListId;
    const fromIdx = parseInt(fromSelect.value);
    const toIdx = parseInt(toSelect.value);

    if (currentPriceListId && !isNaN(fromIdx) && !isNaN(toIdx) && fromIdx !== toIdx) {
      const price = priceListData[currentPriceListId].prices[fromIdx][toIdx];
      priceResult.textContent = `Cena biletu: ${price.toFixed(2)} zł`;
    } else {
      priceResult.textContent = '';
    }
  }

  if (routeSelect) {
    routeSelect.addEventListener('change', function () {
      updateStops(this.value);
    });
  }

  fromSelect.addEventListener('change', function () {
    toSelect.disabled = !this.value;
    calculatePrice();
  });

  toSelect.addEventListener('change', calculatePrice);

  if (priceListId) {
    updateStops(priceListId);
  }
}

// Helper functions
function getActiveSchedule(route) {
  if (!route || !route.variants) return null;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const activeVariants = route.variants.filter(variant => {
    const from = new Date(variant.validFrom);
    const to = new Date(variant.validTo);
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);
    return now >= from && now <= to;
  });

  // Prefer non-standard variants if active
  const specialVariant = activeVariants.find(v => v.type !== 'standardowy');
  return specialVariant || activeVariants.find(v => v.type === 'standardowy') || null;
}

function getDayType(date) {
  const day = date.getDay();
  const holidays = getPolishHolidays(date.getFullYear());
  const dateStr = date.toISOString().slice(0, 10);

  if (day === 0 || holidays.includes(dateStr)) {
    return { key: 'sundays', name: 'Niedziele i Święta' };
  } else if (day === 6) {
    return { key: 'saturdays', name: 'Soboty' };
  } else {
    return { key: 'workdays', name: 'Dni Robocze' };
  }
}

function getPolishHolidays(year) {
  // Calculate Easter
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  const easter = new Date(year, month - 1, day);
  const easterMonday = new Date(year, month - 1, day + 1);
  const corpusChristi = new Date(year, month - 1, day + 60);

  return [
    `${year}-01-01`, // New Year
    `${year}-01-06`, // Epiphany
    easterMonday.toISOString().slice(0, 10), // Easter Monday
    `${year}-05-01`, // May Day
    `${year}-05-03`, // Constitution Day
    corpusChristi.toISOString().slice(0, 10), // Corpus Christi
    `${year}-08-15`, // Assumption
    `${year}-11-01`, // All Saints
    `${year}-11-11`, // Independence Day
    `${year}-12-25`, // Christmas
    `${year}-12-26`  // Boxing Day
  ];
}

function formatMinutesUntil(minutes) {
  if (minutes < 1) return 'Odjeżdża teraz';
  if (minutes === 1) return 'Odjazd za 1 minutę';
  if (minutes < 60) {
    const lastDigit = minutes % 10;
    const lastTwo = minutes % 100;
    if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) {
      return `Odjazd za ${minutes} minuty`;
    }
    return `Odjazd za ${minutes} minut`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  let hourWord = 'godzin';

  if (hours === 1) hourWord = 'godzinę';
  else if (hours >= 2 && hours <= 4) hourWord = 'godziny';

  if (mins === 0) return `Odjazd za ${hours} ${hourWord}`;
  return `Odjazd za ${hours} ${hourWord} i ${mins} min`;
}

function formatMinutesShort(minutes) {
  if (minutes < 1) return 'teraz';
  if (minutes === 1) return 'za 1 min';
  if (minutes < 60) return `za ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) return `za ${hours}h`;
  return `za ${hours}h ${mins}m`;
}