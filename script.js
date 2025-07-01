// ===================================================================================
// KOMPLETNY KOD APLIKACJI - script.js
// Wersja z naprawionym błędem #text i zintegrowanym filtrem Tailwind CSS.
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
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (route.variants) {
      const activeVariant = route.variants.find(variant => {
        const from = new Date(variant.validFrom);
        const to = new Date(variant.validTo);
        from.setHours(0, 0, 0, 0);
        to.setHours(0, 0, 0, 0);
        return now >= from && now <= to;
      });
      if (activeVariant) return activeVariant;
    }
    if (route.directions) {
      return { type: 'standardowy', directions: route.directions };
    }
    return null;
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
      renderSchedule(routeId, false);
      placeholderText.classList.add('hidden');
      detailsContainer.classList.remove('hidden');
      const targetPosition = detailsContainer.getBoundingClientRect().top + window.pageYOffset - 70;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    });
  } else {
    if (placeholderText) placeholderText.textContent = "Błąd ładowania modułu rozkładów jazdy.";
  }

  function renderSchedule(routeId, isFullView, scrollToDirection = null) {
    const route = schedulesData[routeId];
    const activeSchedule = getActiveSchedule(route);
    if (!activeSchedule) {
      detailsContainer.innerHTML = '<p class="text-center text-red-600 p-4">Dla tej trasy nie znaleziono aktywnego rozkładu jazdy na dzień dzisiejszy.</p>';
      return;
    }
    const now = new Date();
    const today = getDayType(now);
    const allDayTypes = [{ key: 'workdays', displayName: 'Dni Robocze' }, { key: 'saturdays', displayName: 'Soboty' }, { key: 'sundays', displayName: 'Niedziele i Święta' }];
    let html = '';
    const nonStandardTypes = ['wakacyjny', 'feriowy', 'świąteczny'];
    if (activeSchedule.type && nonStandardTypes.includes(activeSchedule.type.toLowerCase())) {
      html += `<div class="schedule-variant-info-subtle"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><span>Obowiązuje rozkład: <strong>${activeSchedule.type}</strong></span></div>`;
    }
    activeSchedule.directions.forEach((direction, index) => {
      html += generateDirectionHtml(direction, route, activeSchedule, { index, now, today, allDayTypes, isFullView, routeId });
    });
    detailsContainer.innerHTML = html;
    setupEventListeners(routeId, activeSchedule);
    if (isFullView && scrollToDirection) scrollToElement(scrollToDirection);
  }

  // ### ZMIANA 1: Naprawiony szablon HTML - usunięto białe znaki ###
  function generateDirectionHtml(direction, route, activeSchedule, context) {
    const { index, now, today, allDayTypes, isFullView, routeId } = context;
    const directionId = `${routeId}-${direction.directionName.replace(/[^a-zA-Z0-9]/g, '-')}-${index}`;
    let directionGridsHtml, filterHtml = '';

    const currentHour = now.getHours();
    const initialTimes = (direction.times[today.key] || []).filter(timeObj => {
      const [hour] = timeObj.time.split(':').map(Number);
      return hour >= currentHour;
    });

    if (!isFullView) {
      filterHtml = generateFilterHtml(directionId, currentHour);
      directionGridsHtml = `<div id="grid-${directionId}">
                          ${generateTimesGridHtml({ timesArray: initialTimes, notesLegend: direction.notes || {}, isShortView: true, now, dayTypeForGrid: today, limit: 5 })}
                      </div>`;
    } else {
      directionGridsHtml = `<div id="grid-${directionId}">`;
      allDayTypes.forEach(dayType => {
        directionGridsHtml += `<p class="mt-6 mb-2 text-gray-700">${dayType.displayName}</p>${generateTimesGridHtml({ timesArray: direction.times[dayType.key] || [], notesLegend: direction.notes || {}, isShortView: false, now, dayTypeForGrid: dayType })}`;
      });
      directionGridsHtml += `</div>`;
    }
    let legendHtml = '';
    if (Object.keys(direction.notes || {}).length > 0) {
      legendHtml = '<div class="notes-legend mt-4">';
      for (const key in direction.notes) legendHtml += `<p class="text-sm text-gray-600"><span class="font-bold">${key}</span> - ${direction.notes[key]}</p>`;
      legendHtml += '</div>';
    }
    // Usunięto nowe linie i wcięcia po otwarciu diva, aby uniknąć tworzenia węzła #text
    return `${index > 0 ? '<hr class="my-6 border-gray-300">' : ''}<div class="schedule-direction" id="${directionId}" data-direction-index="${index}"><h4 class="font-bold text-xl flex items-center gap-2"><span class="inline-block align-middle text-orange-600" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="5" width="18" height="12" rx="3" fill="#c2410c" stroke="#c2410c" /><rect x="6" y="8" width="4" height="4" rx="1" fill="#fff" /><rect x="14" y="8" width="4" height="4" rx="1" fill="#fff" /><circle cx="7.5" cy="17" r="1.5" fill="#1e293b"/><circle cx="16.5" cy="17" r="1.5" fill="#1e293b"/></svg></span>${direction.directionName}</h4>${filterHtml}${directionGridsHtml}${legendHtml}<div class="flex justify-start mt-4"><button class="toggle-full-schedule-btn" data-route-id="${route.routeName}" data-full-view="${isFullView}" data-direction-id="${directionId}">${isFullView ? 'Zwiń rozkład' : 'Pełny rozkład ->'}</button></div></div>`;
  }

  function applyTimeFilter(form, routeId, activeSchedule) {
    const directionId = form.dataset.directionId;
    const fromHour = parseInt(form.querySelector('select[name="from-hour"]').value, 10);
    const toHourValue = form.querySelector('select[name="to-hour"]').value;
    const toHour = toHourValue ? parseInt(toHourValue, 10) : null;

    const directionData = activeSchedule.directions.find(d => `${routeId}-${d.directionName.replace(/[^a-zA-Z0-9]/g, '-')}-${activeSchedule.directions.indexOf(d)}` === directionId);
    if (!directionData) return;

    const now = new Date();
    const today = getDayType(now);
    const allTimesForToday = directionData.times[today.key] || [];
    const gridContainer = document.getElementById(`grid-${directionId}`);
    if (!gridContainer) return;

    if (toHour !== null) {
      const filteredTimes = allTimesForToday.filter(timeObj => {
        const [hour] = timeObj.time.split(':').map(Number);
        return hour >= fromHour && hour < toHour;
      });
      const customTitle = `Odjazdy (${today.displayName}) od ${fromHour.toString().padStart(2, '0')}:00 do ${toHour.toString().padStart(2, '0')}:00`;
      gridContainer.innerHTML = generateTimesGridHtml({
        timesArray: filteredTimes, notesLegend: directionData.notes || {}, isShortView: false, showAllInRange: true, now, dayTypeForGrid: today, customTitle
      });
    } else {
      const futureTimes = allTimesForToday.filter(timeObj => {
        const [hour] = timeObj.time.split(':').map(Number);
        return hour >= fromHour;
      });
      const customTitle = `Najbliższe kursy (${today.displayName}) od ${fromHour.toString().padStart(2, '0')}:00`;
      gridContainer.innerHTML = generateTimesGridHtml({
        timesArray: futureTimes, notesLegend: directionData.notes || {}, isShortView: true, limit: 5, now, dayTypeForGrid: today, customTitle
      });
    }
  }

  function setupEventListeners(routeId, activeSchedule) {
    detailsContainer.querySelectorAll('.toggle-full-schedule-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const currentIsFull = e.target.dataset.fullView === 'true';
        renderSchedule(routeId, !currentIsFull, e.target.dataset.directionId);
        if (currentIsFull) {
          const schedulesSection = document.getElementById('schedules-section');
          if (schedulesSection) setTimeout(() => schedulesSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
        }
      });
    });

    detailsContainer.querySelectorAll('.time-filter-form').forEach(form => {
      form.addEventListener('change', () => {
        applyTimeFilter(form, routeId, activeSchedule);
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

  // ### ZMIANA 2: Filtr ostylowany klasami Tailwind CSS ###
  function generateFilterHtml(directionId, currentHour) {
    let fromOptionsHtml = '';
    for (let i = 0; i <= 23; i++) {
      const selected = i === currentHour ? 'selected' : '';
      fromOptionsHtml += `<option value="${i}" ${selected}>${i.toString().padStart(2, '0')}:00</option>`;
    }
    let toOptionsHtml = '<option value="" selected>-- wybierz --</option>';
    for (let i = 1; i <= 24; i++) {
      toOptionsHtml += `<option value="${i}">${i > 23 ? '24' : i.toString().padStart(2, '0')}:00</option>`;
    }

    // Użycie klas Tailwind bezpośrednio w HTML. Atrybut `style` jest konieczny dla własnej strzałki.
    const selectClasses = "block w-32 appearance-none rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50";
    const selectStyle = `background-image: url(&quot;data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e&quot;); background-position: right 0.5rem center; background-repeat: no-repeat; background-size: 1.5em;`;

    return `<div class="filter-section mt-4 mb-6">
              <form class="time-filter-form flex items-center flex-wrap gap-x-4 gap-y-3" data-direction-id="${directionId}">
                <div class="filter-group flex items-center gap-x-2">
                  <label for="from-hour-${directionId}" class="text-sm font-medium text-gray-600 whitespace-nowrap">od</label>
                  <select name="from-hour" id="from-hour-${directionId}" class="${selectClasses}" style="${selectStyle}">${fromOptionsHtml}</select>
                </div>
                <div class="filter-group flex items-center gap-x-2">
                  <label for="to-hour-${directionId}" class="text-sm font-medium text-gray-600">do</label>
                  <select name="to-hour" id="to-hour-${directionId}" class="${selectClasses}" style="${selectStyle}">${toOptionsHtml}</select>
                </div>
              </form>
            </div>`;
  }

  function scrollToElement(elementId) { const targetElement = document.getElementById(elementId); if (targetElement) { const y = targetElement.getBoundingClientRect().top + window.pageYOffset - 70; window.scrollTo({ top: y, behavior: 'smooth' }); } }
  function formatMinutesUntilShort(totalMinutes) { if (totalMinutes < 0) return ''; if (totalMinutes < 1) return 'teraz'; if (totalMinutes === 1) return 'za 1 min'; if (totalMinutes < 60) return `za ${totalMinutes} min`; const hours = Math.floor(totalMinutes / 60); const minutes = totalMinutes % 60; if (minutes === 0) return `za ${hours}h`; return `za ${hours}h ${minutes}m`; }
  function formatMinutesUntilFriendly(totalMinutes) { if (totalMinutes < 0) return ''; if (totalMinutes < 1) return 'Odjeżdża teraz'; if (totalMinutes === 1) return 'Odjazd za 1 minutę'; if (totalMinutes < 60) { const lastDigit = totalMinutes % 10; const lastTwoDigits = totalMinutes % 100; if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwoDigits >= 12 && lastTwoDigits <= 14)) { return `Odjazd za ${totalMinutes} minuty`; } return `Odjazd za ${totalMinutes} minut`; } const hours = Math.floor(totalMinutes / 60); const minutes = totalMinutes % 60; let hourWord = 'godzin'; if (hours === 1) hourWord = 'godzinę'; if (hours >= 2 && hours <= 4) hourWord = 'godziny'; if (minutes === 0) return `Odjazd za ${hours} ${hourWord}`; return `Odjazd za ${hours} ${hourWord} i ${minutes} min`; }

  function generateTimesGridHtml(options) {
    const { timesArray, notesLegend, isShortView, now, dayTypeForGrid, limit = null, customTitle = null, showAllInRange = false } = options;
    let titleHtml = '';
    if (customTitle) {
      titleHtml = `<div class="schedule-grid-header"><span class="toolbar-title">${customTitle}</span></div>`;
    } else if (isShortView && limit) {
      const today = getDayType(now);
      titleHtml = `<div class="schedule-grid-header"><span class="toolbar-title">Najbliższe kursy (${today.displayName})</span></div>`;
    }

    if (!timesArray || timesArray.length === 0) {
      return `${titleHtml}<p class="text-blue-600 p-4 rounded-lg border border-blue-200 bg-blue-50/50 backdrop-blur-sm shadow-sm">Brak kursów w wybranym zakresie.</p>`;
    }
    const today = getDayType(now);
    const isTodaySchedule = dayTypeForGrid.key === today.key;
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
    const departures = timesArray.map(timeObj => ({ ...timeObj, totalMinutes: (([h, m]) => h * 60 + m)(timeObj.time.split(':').map(Number)), isPast: isTodaySchedule && (([h, m]) => h * 60 + m)(timeObj.time.split(':').map(Number)) < currentTimeInMinutes })).sort((a, b) => a.totalMinutes - b.totalMinutes);

    let departuresToDisplay = departures;
    if (isShortView && !showAllInRange && limit) {
      departuresToDisplay = departures.slice(0, limit);
    }

    if (departuresToDisplay.length === 0) {
      return `${titleHtml}<p class="text-blue-600 p-4 rounded-lg border border-blue-200 bg-blue-50/50 backdrop-blur-sm shadow-sm">Brak przyszłych kursów w wybranym zakresie.</p>`;
    }

    const futureDepartures = isTodaySchedule ? departures.filter(dep => !dep.isPast) : [];
    const nextFiveDepartures = futureDepartures.slice(0, 5);
    const nextFiveTimes = new Set(nextFiveDepartures.map(d => d.time));
    const firstFutureIndex = departures.findIndex(dep => !dep.isPast);

    const timesHtml = departuresToDisplay.map((time, idx) => {
      const isNextFive = nextFiveTimes.has(time.time);
      const isFirstFutureInDisplay = departures.indexOf(time) === firstFutureIndex;
      const bgClass = (isFirstFutureInDisplay && isTodaySchedule) ? 'bg-light-red' : (time.isPast ? 'bg-no-background' : 'bg-light-gray');
      const noteText = (time.noteKey && notesLegend[time.noteKey]) || '';
      const noteHtml = noteText ? `<span class="time-note">${time.noteKey}</span>` : '';
      let countdownHtml = '', timeBoxContentPrefix = '', tooltipText = noteText;
      if (isTodaySchedule && isNextFive && !time.isPast) {
        timeBoxContentPrefix = '<span class="time-icon">⏰</span>';
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
    return `${titleHtml}<div class="time-grid">${timesHtml}</div>`;
  }

  function getPublicHolidays(year) { const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451); const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1; const easterMonday = new Date(year, month - 1, day + 1); const corpusChristi = new Date(year, month - 1, day + 60); const formatDate = (date) => date.toISOString().slice(0, 10); return [`${year}-01-01`, `${year}-01-06`, formatDate(easterMonday), `${year}-05-01`, `${year}-05-03`, formatDate(corpusChristi), `${year}-08-15`, `${year}-11-01`, `${year}-11-11`, `${year}-12-25`, `${year}-12-26`]; }
  function getDayType(date) { const day = date.getDay(); const holidays = getPublicHolidays(date.getFullYear()); const dateString = date.toISOString().slice(0, 10); if (day === 0 || holidays.includes(dateString)) return { key: 'sundays', displayName: 'Niedziele i Święta' }; if (day === 6) return { key: 'saturdays', displayName: 'Soboty' }; return { key: 'workdays', displayName: 'Dni Robocze' }; }
  const tooltipElement = document.getElementById('custom-tooltip');
  let mobileTooltipTimer = null;
  const showTooltip = (target) => { const message = target.dataset.tooltip; if (!message || !tooltipElement) return; tooltipElement.textContent = message; tooltipElement.classList.add('visible'); const targetRect = target.getBoundingClientRect(); const tooltipRect = tooltipElement.getBoundingClientRect(); const centeredLeft = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2); const left = Math.max(10, Math.min(centeredLeft, window.innerWidth - tooltipRect.width - 10)); tooltipElement.style.left = `${left}px`; if (targetRect.top < tooltipRect.height + 15) { tooltipElement.style.top = `${targetRect.bottom + 8}px`; } else { tooltipElement.style.top = `${targetRect.top - tooltipRect.height - 8}px`; } };
  const hideTooltip = () => { if (tooltipElement) tooltipElement.classList.remove('visible'); };
  const handleMobileTooltip = (target) => { if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) { showTooltip(target); clearTimeout(mobileTooltipTimer); mobileTooltipTimer = setTimeout(hideTooltip, 4000); } };
  const announcementsContainer = document.getElementById('announcements-container');
  function formatTextWithMarkdown(text) { if (!text) return ''; return text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); }
  if (announcementsContainer) { fetch('announcements.json').then(r => { if (!r.ok) throw new Error; return r.json(); }).then(data => { announcementsContainer.innerHTML = ''; if (!data || data.length === 0) { announcementsContainer.innerHTML = '<p class="col-span-full text-center">Brak komunikatów.</p>'; return; } data.forEach((item, i) => { const card = document.createElement('div'); card.className = 'bg-white p-6 rounded-lg shadow-md flex flex-col'; if (i === 0) card.style.borderLeft = '3px solid #c2410c'; const fTxt = formatTextWithMarkdown(item.text), pTxt = item.text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\n/g, ' '); let dTxt = fTxt, more = false; if (pTxt.length > 250) { let cut = pTxt.lastIndexOf(' ', 250); if (cut === -1) cut = 250; dTxt = formatTextWithMarkdown(item.text.substring(0, cut)) + '...'; more = true; } card.innerHTML = `<h3 class="font-bold text-xl mb-1">${item.title}</h3><p class="text-sm text-gray-500 mb-6">${item.date}</p><div class="announcement-content text-gray-700">${dTxt}</div>${more ? `<a class="read-more text-orange-700 hover:underline pt-2 cursor-pointer font-semibold mt-4">Czytaj więcej</a>` : ''}`; announcementsContainer.appendChild(card); if (more) { const btn = card.querySelector('.read-more'), div = card.querySelector('.announcement-content'); btn.addEventListener('click', function () { const coll = this.textContent === 'Czytaj więcej'; div.innerHTML = coll ? fTxt : dTxt; this.textContent = coll ? 'Zwiń' : 'Czytaj więcej'; }); } }); }).catch(err => { console.error(err); announcementsContainer.innerHTML = '<p class="text-center text-red-600">Nie udało się załadować.</p>'; }); }
});
