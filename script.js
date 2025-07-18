// ===================================================================================
// KOMPLETNY KOD APLIKACJI - script.js
// Wersja z kalkulatorem cen biletów opartym o priceListId.
// ===================================================================================
document.addEventListener('DOMContentLoaded', () => {

  // --- SEKCJA: OBSŁUGA NAWIGACJI (Bez zmian) ---
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      const targetElement = document.querySelector(href);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth' });
        if (mainNav.classList.contains('active')) mainNav.classList.remove('active');
      }
    });
  });
  if (mobileNavToggle && mainNav) {
    mobileNavToggle.addEventListener('click', () => mainNav.classList.toggle('active'));
  }

  // --- SEKCJA: LOGIKA ROZKŁADÓW JAZDY ---
  const selectorContainer = document.getElementById('schedule-selector-container');
  const detailsContainer = document.getElementById('schedule-details-container');
  const placeholderText = document.getElementById('schedule-placeholder-text');

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
    const specialVariant = activeVariants.find(v => v.type.toLowerCase() !== 'standardowy');
    if (specialVariant) return specialVariant;
    return activeVariants.find(v => v.type.toLowerCase() === 'standardowy') || null;
  }

  if (typeof schedulesData !== 'undefined' && selectorContainer && detailsContainer) {
    Object.keys(schedulesData).forEach(routeId => {
      const route = schedulesData[routeId];
      const button = document.createElement('button');
      button.className = 'schedule-selector-btn';
      button.innerHTML = route.routeName;
      button.dataset.routeId = routeId;
      selectorContainer.appendChild(button);
    });
    selectorContainer.addEventListener('click', (e) => {
      const button = e.target.closest('.schedule-selector-btn');
      if (!button) return;
      const routeId = button.dataset.routeId;
      document.querySelectorAll('.schedule-selector-btn').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      renderSchedule(routeId);
      placeholderText.classList.add('hidden');
      detailsContainer.classList.remove('hidden');
      const targetPosition = detailsContainer.getBoundingClientRect().top + window.pageYOffset - 70;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    });
  } else {
    if (placeholderText) placeholderText.textContent = "Błąd ładowania modułu rozkładów jazdy.";
  }

  function renderSchedule(routeId, options = {}) {
    const { isFullView = false, scrollToDirection = null, activeDirectionIndex = 0, activeDayTypeKey = getDayType(new Date()).key } = options;
    const route = schedulesData[routeId];
    const activeSchedule = getActiveSchedule(route);
    if (!activeSchedule) {
      detailsContainer.innerHTML = '<p class="text-center text-red-600 p-4">Dla tej trasy nie znaleziono aktywnego rozkładu jazdy na dzień dzisiejszy.</p>';
      return;
    }
    const now = new Date();
    const switcherHtml = generateDirectionSwitcherHtml(activeSchedule.directions, routeId, activeDirectionIndex);
    const activeDirection = activeSchedule.directions[activeDirectionIndex];
    if (!activeDirection) return;
    const directionHtml = generateDirectionHtml(activeDirection, route, activeSchedule, { index: activeDirectionIndex, now, activeDayTypeKey, isFullView, routeId });
    let finalHtml = '';
    if (activeSchedule.type.toLowerCase() !== 'standardowy') {
      finalHtml += `<div class="text-blue-600 p-4 mb-6 rounded-lg border border-blue-200 bg-blue-50/50 flex items-start gap-3" role="alert">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>Obowiązuje rozkład: <strong class="capitalize font-semibold">${activeSchedule.type}</strong></p>
                    </div>`;
    }
    finalHtml += switcherHtml;
    finalHtml += directionHtml;
    detailsContainer.innerHTML = finalHtml;
    setupEventListeners(routeId, activeSchedule, { activeDirectionIndex, activeDayTypeKey });
    if (isFullView && scrollToDirection) scrollToElement(scrollToDirection);
  }

  function generateDirectionSwitcherHtml(directions, routeId, activeIndex) {
    if (directions.length <= 1) return '';
    const labelHtml = `<label class="block text-xs font-medium text-gray-500 mb-1">Wybierz kierunek:</label>`;
    if (directions.length > 2) {
      const optionsHtml = directions.map((direction, index) => `<option value="${index}" ${index === activeIndex ? 'selected' : ''}>${direction.directionName}</option>`).join('');
      const selectClasses = "block w-full appearance-none rounded-md border-gray-300 bg-white py-2 pl-3 pr-10 text-base text-gray-800 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500";
      const selectStyle = `background-image: url(&quot;data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e&quot;); background-position: right 0.5rem center; background-repeat: no-repeat; background-size: 1.5em;`;
      return `<div class="direction-switcher-container mb-6">${labelHtml}<select id="direction-select" data-route-id="${routeId}" class="${selectClasses}" style="${selectStyle}">${optionsHtml}</select></div>`;
    }
    const buttonsHtml = directions.map((direction, index) => {
      const isActive = index === activeIndex;
      const activeClasses = 'bg-orange-100 text-orange-700 border-orange-500 z-10';
      const inactiveClasses = 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300';
      const roundingClasses = index === 0 ? 'rounded-l-lg' : 'rounded-r-lg';
      return `<button type="button" class="direction-tab-btn relative -ml-px flex-1 inline-flex items-center justify-center border px-4 py-3 text-sm font-semibold transition-colors focus:z-20 ${isActive ? activeClasses : inactiveClasses} ${roundingClasses}" data-route-id="${routeId}" data-direction-index="${index}">${direction.directionName}</button>`;
    }).join('');
    return `<div class="direction-switcher-container mb-6">${labelHtml}<div class="isolate inline-flex rounded-lg shadow-sm w-full">${buttonsHtml}</div></div>`;
  }

  function generateDirectionHtml(direction, route, activeSchedule, context) {
    const { index, now, activeDayTypeKey, isFullView, routeId } = context;
    const directionId = `${routeId}-${direction.directionName.replace(/[^a-zA-Z0-9]/g, '-')}-${index}`;
    let directionGridsHtml, controlsHtml = '', priceCalculatorHtml = '';

    if (!isFullView) {
      controlsHtml = generateControlsHtml(directionId, now, activeDayTypeKey);

      const priceListId = route.priceListId;
      if (typeof priceListData !== 'undefined' && priceListId && priceListData[priceListId]) {
        priceCalculatorHtml = `
            <div class="price-calculator-wrapper -mt-4 mb-4">
                <button class="toggle-price-calculator-btn flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-800" data-accepts-card="${route.acceptsCard}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8.433 7.418c.158-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-1.162-.328zM11 12.849v-1.698c.22.071.408.164.567.267a2.5 2.5 0 001.162.328z" />
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.5 4.5 0 00-1.831.876a1 1 0 00.707 1.852A2.5 2.5 0 0110 9.5v1.034a2.5 2.5 0 01-1.162.328 1 1 0 00-.707 1.852A4.5 4.5 0 009 14.908V15a1 1 0 102 0v-.092a4.5 4.5 0 001.831-.876a1 1 0 00-.707-1.852A2.5 2.5 0 0110 11.5v-1.034a2.5 2.5 0 011.162-.328 1 1 0 00.707-1.852A4.5 4.5 0 0011 6.092V6z" clip-rule="evenodd" />
                    </svg>
                    <span>Sprawdź cenę biletu</span>
                </button>
                <div class="price-calculator-container hidden bg-gray-50 p-4 rounded-lg border mt-2"></div>
            </div>
        `;
      }

      const selectedDayTimes = direction.times[activeDayTypeKey] || [];
      const isToday = activeDayTypeKey === getDayType(now).key;
      const initialTimes = isToday ? selectedDayTimes.filter(timeObj => {
        const [hour, minute] = timeObj.time.split(':').map(Number);
        return (hour * 60 + minute) >= (now.getHours() * 60 + now.getMinutes());
      }) : selectedDayTimes;

      directionGridsHtml = `<div id="grid-${directionId}">${generateTimesGridHtml({ timesArray: initialTimes, notesLegend: direction.notes || {}, now, dayTypeForGrid: getDayTypeByKey(activeDayTypeKey), isInitialLoad: true })}</div>`;
    } else {
      const allDayTypes = [{ key: 'workdays', displayName: 'Dni Robocze' }, { key: 'saturdays', displayName: 'Soboty' }, { key: 'sundays', displayName: 'Niedziele i Święta' }];
      directionGridsHtml = `<div id="grid-${directionId}">`;
      allDayTypes.forEach(dayType => {
        directionGridsHtml += `<p class="mt-6 mb-2 text-gray-700">${dayType.displayName}</p>${generateTimesGridHtml({ timesArray: direction.times[dayType.key] || [], notesLegend: direction.notes || {}, now, dayTypeForGrid: dayType, isFullDayView: true })}`;
      });
      directionGridsHtml += `</div>`;
    }
    let legendHtml = '';
    if (Object.keys(direction.notes || {}).length > 0) {
      legendHtml = '<div class="notes-legend mt-4">';
      for (const key in direction.notes) legendHtml += `<p class="text-sm text-gray-600"><span class="font-bold">${key}</span> - ${direction.notes[key]}</p>`;
      legendHtml += '</div>';
    }
    return `<div class="schedule-direction" id="${directionId}" data-direction-index="${index}">${priceCalculatorHtml}${controlsHtml}${directionGridsHtml}${legendHtml}<div class="flex justify-start mt-4"><button class="toggle-full-schedule-btn" data-route-id="${routeId}" data-full-view="${isFullView}" data-direction-id="${directionId}">${isFullView ? 'Zwiń rozkład' : 'Pełny rozkład ->'}</button></div></div>`;
  }

  function applyTimeFilter(slider, routeId, activeSchedule, activeDayTypeKey) {
    const directionId = slider.dataset.directionId;
    const fromHour = parseInt(slider.value, 10);
    const directionIndex = parseInt(document.getElementById(directionId).dataset.directionIndex, 10);
    const directionData = activeSchedule.directions[directionIndex];
    if (!directionData) return;
    const now = new Date();
    const allTimesForDay = directionData.times[activeDayTypeKey] || [];
    const gridContainer = document.getElementById(`grid-${directionId}`);
    if (!gridContainer) return;
    const filteredTimes = allTimesForDay.filter(timeObj => {
      const [hour] = timeObj.time.split(':').map(Number);
      return hour >= fromHour;
    });
    gridContainer.innerHTML = generateTimesGridHtml({ timesArray: filteredTimes, notesLegend: directionData.notes || {}, now, dayTypeForGrid: getDayTypeByKey(activeDayTypeKey) });
  }

  function setupEventListeners(routeId, activeSchedule, options) {
    const { activeDirectionIndex, activeDayTypeKey } = options;
    detailsContainer.querySelectorAll('.toggle-full-schedule-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const directionId = e.target.dataset.directionId;
        const currentIsFull = e.target.dataset.fullView === 'true';
        renderSchedule(routeId, { isFullView: !currentIsFull, activeDirectionIndex, activeDayTypeKey, scrollToDirection: directionId });
        if (currentIsFull) {
          const schedulesSection = document.getElementById('schedules-section');
          if (schedulesSection) setTimeout(() => schedulesSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
        }
      });
    });
    detailsContainer.querySelectorAll('.direction-tab-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const newActiveIndex = parseInt(e.currentTarget.dataset.directionIndex, 10);
        renderSchedule(routeId, { activeDirectionIndex: newActiveIndex, activeDayTypeKey });
      });
    });
    const directionSelect = detailsContainer.querySelector('#direction-select');
    if (directionSelect) {
      directionSelect.addEventListener('change', (e) => {
        const newActiveIndex = parseInt(e.currentTarget.value, 10);
        renderSchedule(routeId, { activeDirectionIndex: newActiveIndex, activeDayTypeKey });
      });
    }
    detailsContainer.querySelectorAll('.day-type-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const newDayTypeKey = e.currentTarget.dataset.dayKey;
        renderSchedule(routeId, { activeDirectionIndex, activeDayTypeKey: newDayTypeKey });
      });
    });
    detailsContainer.querySelectorAll('.time-slider').forEach(slider => {
      const labelContainer = document.getElementById(`slider-label-${slider.dataset.directionId}`);
      const timeValue = document.getElementById(`slider-time-${slider.dataset.directionId}`);
      slider.addEventListener('input', () => {
        if (labelContainer) {
          const hint = labelContainer.querySelector('.slider-hint');
          if (hint) hint.style.display = 'none';
          if (timeValue) timeValue.textContent = `${slider.value.padStart(2, '0')}:00`;
        }
        applyTimeFilter(slider, routeId, activeSchedule, activeDayTypeKey);
      });
    });

    detailsContainer.querySelectorAll('.toggle-price-calculator-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const container = e.currentTarget.nextElementSibling;
        container.classList.toggle('hidden');
        if (!container.innerHTML) {
          const priceListId = schedulesData[routeId].priceListId;
          const acceptsCard = e.currentTarget.dataset.acceptsCard === 'true';
          container.id = `price-calc-${routeId}-${activeDirectionIndex}`;
          renderPriceCalculator(container, priceListId, { acceptsCard });
        }
      });
    });

    const tooltipElement = document.getElementById('custom-tooltip');
    if (tooltipElement) {
      detailsContainer.querySelectorAll('[data-tooltip]').forEach(el => {
        el.addEventListener('mouseenter', (e) => showTooltip(e.currentTarget));
        el.addEventListener('mouseleave', hideTooltip);
        el.addEventListener('pointerup', (e) => handleMobileTooltip(e.currentTarget));
      });
    }
  }

  function generateControlsHtml(directionId, now, activeDayTypeKey) {
    const daySwitcherHtml = generateDayTypeSwitcherHtml(activeDayTypeKey);
    const filterHtml = generateFilterHtml(directionId, now, activeDayTypeKey);
    return `<div class="controls-container mb-6 space-y-4">${daySwitcherHtml}${filterHtml}</div>`;
  }

  function generateDayTypeSwitcherHtml(activeDayTypeKey) {
    const allDayTypes = [{ key: 'workdays', displayName: 'Robocze' }, { key: 'saturdays', displayName: 'Soboty' }, { key: 'sundays', displayName: 'Niedziele' }];
    const buttonsHtml = allDayTypes.map(dayType => {
      const isActive = dayType.key === activeDayTypeKey;
      const activeClasses = 'bg-orange-100 text-orange-700 border-orange-500 z-10';
      const inactiveClasses = 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300';
      return `<button type="button" class="day-type-btn relative -ml-px flex-1 inline-flex items-center justify-center border px-3 py-2 text-sm font-semibold transition-colors focus:z-20 first:rounded-l-lg last:rounded-r-lg ${isActive ? activeClasses : inactiveClasses}" data-day-key="${dayType.key}">${dayType.displayName}</button>`;
    }).join('');
    return `<div class="day-type-switcher"><label class="block text-xs font-medium text-gray-500 mb-1">Pokaż rozkład na:</label><div class="isolate inline-flex rounded-lg shadow-sm w-full">${buttonsHtml}</div></div>`;
  }

  function generateFilterHtml(directionId, now, activeDayTypeKey) {
    const currentHour = now.getHours();
    const isToday = activeDayTypeKey === getDayType(now).key;
    const currentTimeFormatted = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const initialLabel = `<span class="block text-sm font-medium text-gray-700">Odjazdy od: <span id="slider-time-${directionId}" class="font-bold text-orange-600">${isToday ? currentTimeFormatted : "04:00"}</span></span><span class="slider-hint block text-xs text-gray-500">(przesuń, aby zmienić)</span>`;
    const sliderClasses = "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-orange-600 [&::-webkit-slider-thumb]:rounded-full [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-orange-600 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none";
    return `<div class="filter-section"><div class="time-slider-container"><div class="mb-2" id="slider-label-${directionId}">${initialLabel}</div><input type="range" id="time-slider-${directionId}" data-direction-id="${directionId}" class="time-slider ${sliderClasses}" min="4" max="23" value="${isToday ? currentHour : 4}"></div></div>`;
  }

  function getDayTypeByKey(key) {
    const dayTypes = { workdays: { key: 'workdays', displayName: 'Dni Robocze' }, saturdays: { key: 'saturdays', displayName: 'Soboty' }, sundays: { key: 'sundays', displayName: 'Niedziele i Święta' } };
    return dayTypes[key];
  }

  function scrollToElement(elementId) { const targetElement = document.getElementById(elementId); if (targetElement) { const y = targetElement.getBoundingClientRect().top + window.pageYOffset - 70; window.scrollTo({ top: y, behavior: 'smooth' }); } }
  function formatMinutesUntilShort(totalMinutes) { if (totalMinutes < 0) return ''; if (totalMinutes < 1) return 'teraz'; if (totalMinutes === 1) return 'za 1 min'; if (totalMinutes < 60) return `za ${totalMinutes} min`; const hours = Math.floor(totalMinutes / 60); const minutes = totalMinutes % 60; if (minutes === 0) return `za ${hours}h`; return `za ${hours}h ${minutes}m`; }
  function formatMinutesUntilFriendly(totalMinutes) { if (totalMinutes < 0) return ''; if (totalMinutes < 1) return 'Odjeżdża teraz'; if (totalMinutes === 1) return 'Odjazd za 1 minutę'; if (totalMinutes < 60) { const lastDigit = totalMinutes % 10; const lastTwoDigits = totalMinutes % 100; if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwoDigits >= 12 && lastTwoDigits <= 14)) { return `Odjazd za ${totalMinutes} minuty`; } return `Odjazd za ${totalMinutes} minut`; } const hours = Math.floor(totalMinutes / 60); const minutes = totalMinutes % 60; let hourWord = 'godzin'; if (hours === 1) hourWord = 'godzinę'; if (hours >= 2 && hours <= 4) hourWord = 'godziny'; if (minutes === 0) return `Odjazd za ${hours} ${hourWord}`; return `Odjazd za ${hours} ${hourWord} i ${minutes} min`; }

  function generateTimesGridHtml(options) {
    const { timesArray, notesLegend, now, dayTypeForGrid, limit = null, isInitialLoad = false, isFullDayView = false } = options;
    const messageBoxHtml = (message) => `<div class="text-blue-600 p-4 rounded-lg border border-blue-200 bg-blue-50/50 flex items-start gap-3"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>${message}</span></div>`;
    if (!timesArray || timesArray.length === 0) {
      if (isFullDayView) return messageBoxHtml('W tym dniu nie ma żadnych kursów.');
      if (isInitialLoad) return messageBoxHtml('Na dziś nie ma już więcej kursów. Sprawdź pełny rozkład.');
      return messageBoxHtml('Brak kursów w wybranym zakresie.');
    }
    const isTodaySchedule = dayTypeForGrid.key === getDayType(new Date()).key;
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
    const departures = timesArray.map(timeObj => ({ ...timeObj, totalMinutes: (([h, m]) => h * 60 + m)(timeObj.time.split(':').map(Number)), isPast: isTodaySchedule && (([h, m]) => h * 60 + m)(timeObj.time.split(':').map(Number)) < currentTimeInMinutes })).sort((a, b) => a.totalMinutes - b.totalMinutes);
    let departuresToDisplay = limit ? departures.slice(0, limit) : departures;
    if (departuresToDisplay.length === 0) {
      if (isInitialLoad) return messageBoxHtml('Na dziś nie ma już więcej kursów. Sprawdź pełny rozkład.');
      return messageBoxHtml('Brak przyszłych kursów w wybranym zakresie.');
    }
    const firstFutureIndex = departures.findIndex(dep => !dep.isPast);
    const timesHtml = departuresToDisplay.map((time, idx) => {
      const isFirstFuture = departures.indexOf(time) === firstFutureIndex;
      const isFuture = !time.isPast && isTodaySchedule;
      const bgClass = time.isPast ? 'bg-no-background' : 'bg-light-gray';
      const noteText = (time.noteKey && notesLegend[time.noteKey]) || '';
      const noteHtml = noteText ? `<span class="time-note">${time.noteKey}</span>` : '';
      let countdownHtml = '', timeBoxContentPrefix = '', tooltipText = noteText;
      if (isFirstFuture) timeBoxContentPrefix = '<span class="time-icon">⏰</span>';
      if (isFuture) {
        const minutesUntil = time.totalMinutes - currentTimeInMinutes;
        if (minutesUntil >= 0) {
          const shortCountdownText = formatMinutesUntilShort(minutesUntil);
          const friendlyCountdownText = formatMinutesUntilFriendly(minutesUntil);
          countdownHtml = `<span class="countdown-text">${shortCountdownText}</span>`;
          tooltipText = noteText ? `${friendlyCountdownText} (${noteText})` : friendlyCountdownText;
        }
      }
      const tooltip = tooltipText ? `data-tooltip="${tooltipText}"` : '';
      return `<div class="time-box ${bgClass}" ${tooltip}><div class="time-box-content">${timeBoxContentPrefix}<span class="time-value">${time.time}</span>${noteHtml}</div><div class="countdown-container">${countdownHtml}</div></div>`;
    }).join('');
    return `<div class="time-grid">${timesHtml}</div>`;
  }

  function getPublicHolidays(year) { const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451); const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1; const easterMonday = new Date(year, month - 1, day + 1); const corpusChristi = new Date(year, month - 1, day + 60); const formatDate = (date) => date.toISOString().slice(0, 10); return [`${year}-01-01`, `${year}-01-06`, formatDate(easterMonday), `${year}-05-01`, `${year}-05-03`, formatDate(corpusChristi), `${year}-08-15`, `${year}-11-01`, `${year}-11-11`, `${year}-12-25`, `${year}-12-26`]; }
  function getDayType(date) { const day = date.getDay(); const holidays = getPublicHolidays(date.getFullYear()); const dateString = date.toISOString().slice(0, 10); if (day === 0 || holidays.includes(dateString)) return { key: 'sundays', displayName: 'Niedziele i Święta' }; if (day === 6) return { key: 'saturdays', displayName: 'Soboty' }; return { key: 'workdays', displayName: 'Dni Robocze' }; }
  const tooltipElement = document.getElementById('custom-tooltip');
  let mobileTooltipTimer = null;
  const showTooltip = (target) => { const message = target.dataset.tooltip; if (!message || !tooltipElement) return; tooltipElement.textContent = message; tooltipElement.classList.add('visible'); const targetRect = target.getBoundingClientRect(); const tooltipRect = tooltipElement.getBoundingClientRect(); const centeredLeft = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2); const left = Math.max(10, Math.min(centeredLeft, window.innerWidth - tooltipRect.width - 10)); tooltipElement.style.left = `${left}px`; if (targetRect.top < tooltipRect.height + 15) { tooltipElement.style.top = `${targetRect.bottom + 8}px`; } else { tooltipElement.style.top = `${targetRect.top - tooltipRect.height - 8}px`; } };
  const hideTooltip = () => { if (tooltipElement) tooltipElement.classList.remove('visible'); };
  const handleMobileTooltip = (target) => { if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) { showTooltip(target); clearTimeout(mobileTooltipTimer); mobileTooltipTimer = setTimeout(hideTooltip, 4000); } };

  // --- SEKCJA: LOGIKA KALKULATORA CEN (NOWA WERSJA) ---

  function renderPriceCalculator(container, priceListId, options = {}) {
    const { acceptsCard = false } = options;
    const priceData = priceListData[priceListId];
    if (!priceData && container.id !== 'main-calc') return;

    const routeOptions = Object.keys(priceListData).map(id => {
      const displayName = priceListData[id].displayName;
      return `<option value="${id}" ${id === priceListId ? 'selected' : ''}>${displayName}</option>`
    }).join('');

    const cardPaymentHtml = acceptsCard ? `
        <div class="flex items-center gap-2 text-sm text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm3 1a1 1 0 100-2h3a1 1 0 100 2H7z" clip-rule="evenodd" />
            </svg>
            <span>Można płacić kartą</span>
        </div>` : '';

    container.innerHTML = `
          <div class="space-y-4">
              ${container.id === 'main-calc' ? `
              <div>
                  <label for="route-select-${container.id}" class="block text-sm font-medium text-gray-700">Wybierz trasę:</label>
                  <select id="route-select-${container.id}" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md">
                      <option value="">-- wybierz --</option>
                      ${routeOptions}
                  </select>
              </div>` : ''}
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label for="from-stop-${container.id}" class="block text-sm font-medium text-gray-700">Skąd:</label>
                      <select id="from-stop-${container.id}" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md" disabled></select>
                  </div>
                  <div>
                      <label for="to-stop-${container.id}" class="block text-sm font-medium text-gray-700">Dokąd:</label>
                      <select id="to-stop-${container.id}" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md" disabled></select>
                  </div>
              </div>
              <div id="price-result-container-${container.id}" class="flex justify-between items-center h-8">
                  <span id="price-result-${container.id}" class="text-lg font-bold text-orange-600"></span>
                  ${cardPaymentHtml}
              </div>
          </div>
      `;

    const routeSelect = document.getElementById(`route-select-${container.id}`);
    const fromSelect = document.getElementById(`from-stop-${container.id}`);
    const toSelect = document.getElementById(`to-stop-${container.id}`);
    const resultDiv = document.getElementById(`price-result-${container.id}`);

    const updateStops = (currentPriceListId) => {
      fromSelect.innerHTML = '<option value="">-- wybierz --</option>';
      toSelect.innerHTML = '<option value="">-- wybierz --</option>';
      toSelect.disabled = true;
      resultDiv.textContent = '';

      const currentPriceData = priceListData[currentPriceListId];
      if (currentPriceData) {
        currentPriceData.stops.forEach((stop, index) => {
          fromSelect.innerHTML += `<option value="${index}">${stop}</option>`;
          toSelect.innerHTML += `<option value="${index}">${stop}</option>`;
        });
        fromSelect.disabled = false;
      } else {
        fromSelect.disabled = true;
      }
    };

    const calculatePrice = () => {
      const currentPriceListId = routeSelect ? routeSelect.value : priceListId;
      const fromIndex = parseInt(fromSelect.value, 10);
      const toIndex = parseInt(toSelect.value, 10);

      if (currentPriceListId && !isNaN(fromIndex) && !isNaN(toIndex)) {
        if (fromIndex === toIndex) {
          resultDiv.textContent = '';
          return;
        }
        const price = priceListData[currentPriceListId].prices[fromIndex][toIndex];
        resultDiv.textContent = `Cena biletu: ${price.toFixed(2)} zł`;
      } else {
        resultDiv.textContent = '';
      }
    };

    if (routeSelect) {
      routeSelect.addEventListener('change', () => updateStops(routeSelect.value));
    }
    fromSelect.addEventListener('change', () => {
      toSelect.disabled = fromSelect.value === '';
      calculatePrice();
    });
    toSelect.addEventListener('change', calculatePrice);

    if (priceListId) {
      updateStops(priceListId);
    }
  }

  const mainCalculatorContainer = document.getElementById('main-price-calculator');
  if (mainCalculatorContainer) {
    mainCalculatorContainer.id = 'main-calc';
    renderPriceCalculator(mainCalculatorContainer);
  }

  const announcementsContainer = document.getElementById('announcements-container');
  function formatTextWithMarkdown(text) { if (!text) return ''; return text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); }
  if (announcementsContainer) {
    fetch('announcements.json')
      .then(r => { if (!r.ok) throw new Error; return r.json(); })
      .then(data => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const activeAnnouncements = data.filter(item => {
          const pubDate = new Date(item.publicationDate);
          const termDate = new Date(item.terminationDate);
          pubDate.setHours(0, 0, 0, 0);
          termDate.setHours(0, 0, 0, 0);
          return now >= pubDate && now <= termDate;
        });
        activeAnnouncements.sort((a, b) => new Date(b.publicationDate) - new Date(a.publicationDate));
        announcementsContainer.innerHTML = '';
        if (!activeAnnouncements || activeAnnouncements.length === 0) {
          announcementsContainer.innerHTML = '<p class="col-span-full text-center">Brak aktualnych komunikatów.</p>';
          return;
        }
        activeAnnouncements.forEach((item, i) => {
          const card = document.createElement('div');
          card.className = 'bg-white p-6 rounded-lg shadow-md flex flex-col';
          if (i === 0) card.style.borderLeft = '3px solid #c2410c';
          const fTxt = formatTextWithMarkdown(item.text), pTxt = item.text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\n/g, ' ');
          let dTxt = fTxt, more = false;
          if (pTxt.length > 250) {
            let cut = pTxt.lastIndexOf(' ', 250);
            if (cut === -1) cut = 250;
            dTxt = formatTextWithMarkdown(item.text.substring(0, cut)) + '...';
            more = true;
          }
          card.innerHTML = `<h3 class="font-bold text-xl mb-1">${item.title}</h3><p class="text-sm text-gray-500 mb-6">${item.displayDate}</p><div class="announcement-content text-gray-700">${dTxt}</div>${more ? `<a class="read-more text-orange-700 hover:underline pt-2 cursor-pointer font-semibold mt-4">Czytaj więcej</a>` : ''}`;
          announcementsContainer.appendChild(card);
          if (more) {
            const btn = card.querySelector('.read-more'), div = card.querySelector('.announcement-content');
            btn.addEventListener('click', function () {
              const coll = this.textContent === 'Czytaj więcej';
              div.innerHTML = coll ? fTxt : dTxt;
              this.textContent = coll ? 'Zwiń' : 'Czytaj więcej';
            });
          }
        });
      })
      .catch(err => {
        console.error(err);
        announcementsContainer.innerHTML = '<p class="text-center text-red-600">Nie udało się załadować komunikatów.</p>';
      });
  }
});
