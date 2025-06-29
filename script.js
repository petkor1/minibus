// ===================================================================================
// KOMPLETNY KOD APLIKACJI - script.js (WERSJA FINALNA)
// ===================================================================================
document.addEventListener('DOMContentLoaded', () => {

  // --- SEKCJA: OBSŁUGA NAWIGACJI ---
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
        if (mainNav.classList.contains('active')) {
          mainNav.classList.remove('active');
        }
      }
    });
  });

  if (mobileNavToggle && mainNav) {
    mobileNavToggle.addEventListener('click', () => {
      mainNav.classList.toggle('active');
    });
  }

  // --- SEKCJA: LOGIKA ROZKŁADÓW JAZDY ---
  const selectorContainer = document.getElementById('schedule-selector-container');
  const detailsContainer = document.getElementById('schedule-details-container');
  const placeholderText = document.getElementById('schedule-placeholder-text');

  // Dynamiczne wstawienie informacji o płatności kartą
  const paymentInfoContainer = document.getElementById('payment-info-container');
  if (paymentInfoContainer) {
    paymentInfoContainer.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span>We wszystkich naszych busach zapłacisz kartą.</span>
        `;
  }

  if (typeof schedulesData !== 'undefined' && selectorContainer && detailsContainer) {
    // Generowanie przycisków wyboru trasy
    Object.keys(schedulesData).forEach(routeId => {
      const route = schedulesData[routeId];
      const button = document.createElement('button');
      button.className = 'schedule-selector-btn';
      button.innerHTML = route.routeName;
      button.dataset.routeId = routeId;
      selectorContainer.appendChild(button);
    });

    // Obsługa kliknięcia w trasę
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

  /**
   * Główna funkcja renderująca widok rozkładu.
   */
  function renderSchedule(routeId, isFullView, scrollToDirection = null) {
    const route = schedulesData[routeId];
    const now = new Date();
    const today = getDayType(now);
    const allDayTypes = [
      { key: 'workdays', displayName: 'Dni Robocze' },
      { key: 'saturdays', displayName: 'Soboty' },
      { key: 'sundays', displayName: 'Niedziele i Święta' }
    ];

    let html = ''; // Zaczynamy od pustego stringa (bez daty ważności)

    route.directions.forEach((direction, index) => {
      html += generateDirectionHtml(direction, { routeId, index, now, today, allDayTypes, isFullView });
    });

    detailsContainer.innerHTML = html;
    setupEventListeners(routeId); // Ustawia listenery dla przycisków i tooltipów
    if (isFullView && scrollToDirection) {
      scrollToElement(scrollToDirection);
    }
  }

  /**
   * Funkcja pomocnicza generująca HTML dla pojedynczego kierunku.
   */
  function generateDirectionHtml(direction, context) {
    const { routeId, index, now, today, allDayTypes, isFullView } = context;
    const directionId = `${routeId}-${direction.directionName.replace(/[^a-zA-Z0-9]/g, '-')}-${index}`;
    const notesLegend = direction.notes || {};
    let directionHtml = '';

    if (isFullView) {
      allDayTypes.forEach(dayType => {
        directionHtml += `
                    <p class="mt-6 mb-2 text-gray-700">${dayType.displayName}</p>
                    ${generateTimesGridHtml({ timesArray: direction.times[dayType.key] || [], notesLegend, isShortView: false, now, dayTypeForGrid: dayType })}
                `;
      });
    } else {
      directionHtml += `
                <div class="flex justify-between items-center mt-2 mb-2"><p class="text-gray-700">Najbliższe kursy dzisiaj (${today.displayName})</p></div>
                ${generateTimesGridHtml({ timesArray: direction.times[today.key] || [], notesLegend, isShortView: true, now, dayTypeForGrid: today, limit: 5 })}
            `;
    }

    let legendHtml = '';
    if (Object.keys(notesLegend).length > 0) {
      legendHtml = '<div class="notes-legend mt-4">';
      for (const key in notesLegend) {
        legendHtml += `<p class="text-sm text-gray-600"><span class="font-bold">${key}</span> - ${notesLegend[key]}</p>`;
      }
      legendHtml += '</div>';
    }

    const buttonText = isFullView ? 'Zwiń rozkład' : 'Pełny rozkład ->';
    return `
            ${index > 0 ? '<hr class="my-6 border-gray-300">' : ''}
            <div class="schedule-direction" id="${directionId}">
                <h4 class="font-bold text-xl flex items-center gap-2">
                    <span class="inline-block align-middle text-orange-600" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="5" width="18" height="12" rx="3" fill="#c2410c" stroke="#c2410c" /><rect x="6" y="8" width="4" height="4" rx="1" fill="#fff" /><rect x="14" y="8" width="4" height="4" rx="1" fill="#fff" /><circle cx="7.5" cy="17" r="1.5" fill="#1e293b"/><circle cx="16.5" cy="17" r="1.5" fill="#1e293b"/></svg></span>
                    ${direction.directionName}
                </h4>
                ${directionHtml}
                ${legendHtml}
                <div class="flex justify-start mt-4"><button class="toggle-full-schedule-btn" data-route-id="${routeId}" data-full-view="${isFullView}" data-direction-id="${directionId}">${buttonText}</button></div>
            </div>`;
  }

  /**
   * Podpina eventy do dynamicznie tworzonych elementów.
   */
  function setupEventListeners(routeId) {
    // Listener dla przycisków "Zwiń/Rozwiń"
    detailsContainer.querySelectorAll('.toggle-full-schedule-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const currentIsFull = e.target.dataset.fullView === 'true';
        renderSchedule(routeId, !currentIsFull, e.target.dataset.directionId);
        if (currentIsFull) {
          const schedulesSection = document.getElementById('schedules-section');
          if (schedulesSection) {
            setTimeout(() => schedulesSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
          }
        }
      });
    });

    // Listenery dla niestandardowych tooltipów
    const tooltipElement = document.getElementById('custom-tooltip');
    if (tooltipElement) {
      detailsContainer.querySelectorAll('[data-tooltip]').forEach(el => {
        el.addEventListener('mouseenter', (e) => showTooltip(e.currentTarget));
        el.addEventListener('mouseleave', hideTooltip);
        el.addEventListener('pointerup', (e) => handleMobileTooltip(e.currentTarget));
      });
    }
  }

  /**
   * Przewija do wskazanego elementu.
   */
  function scrollToElement(elementId) {
    const targetElement = document.getElementById(elementId);
    if (targetElement) {
      const y = targetElement.getBoundingClientRect().top + window.pageYOffset - 70;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  /**
   * Formatuje minuty na KRÓTKI tekst (np. "za 5 min", "za 1h 15m") dla etykiety pod godziną.
   */
  function formatMinutesUntilShort(totalMinutes) {
    if (totalMinutes < 0) return '';
    if (totalMinutes < 1) return 'teraz';
    if (totalMinutes === 1) return 'za 1 min';
    if (totalMinutes < 60) return `za ${totalMinutes} min`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (minutes === 0) return `za ${hours}h`;
    return `za ${hours}h ${minutes}m`;
  }

  /**
   * Formatuje minuty na PEŁNY, PRZYJAZNY tekst (np. "Odjazd za 5 minut") dla tooltipa.
   */
  function formatMinutesUntilFriendly(totalMinutes) {
    if (totalMinutes < 0) return '';
    if (totalMinutes < 1) return 'Odjeżdża teraz';
    if (totalMinutes === 1) return 'Odjazd za 1 minutę';

    if (totalMinutes < 60) {
      const lastDigit = totalMinutes % 10;
      const lastTwoDigits = totalMinutes % 100;
      if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwoDigits >= 12 && lastTwoDigits <= 14)) {
        return `Odjazd za ${totalMinutes} minuty`;
      }
      return `Odjazd za ${totalMinutes} minut`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    let hourWord = 'godzin';
    if (hours === 1) hourWord = 'godzinę';
    if (hours >= 2 && hours <= 4) hourWord = 'godziny';

    if (minutes === 0) return `Odjazd za ${hours} ${hourWord}`;

    return `Odjazd za ${hours} ${hourWord} i ${minutes} min`;
  }

  /**
   * Generuje siatkę z godzinami odjazdów.
   */
  function generateTimesGridHtml(options) {
    const { timesArray, notesLegend, isShortView, now, dayTypeForGrid, limit = null } = options;
    if (!timesArray || timesArray.length === 0) {
      return '<p class="text-blue-600 p-4 rounded-lg border border-blue-200 bg-blue-50/50 backdrop-blur-sm shadow-sm">W tym dniu nie ma kursów</p>';
    }

    const today = getDayType(now);
    const isTodaySchedule = dayTypeForGrid.key === today.key;
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

    const departures = timesArray
      .map(timeObj => ({ ...timeObj, totalMinutes: (([h, m]) => h * 60 + m)(timeObj.time.split(':').map(Number)), isPast: isTodaySchedule && (([h, m]) => h * 60 + m)(timeObj.time.split(':').map(Number)) < currentTimeInMinutes }))
      .sort((a, b) => a.totalMinutes - b.totalMinutes);

    const futureDepartures = isTodaySchedule ? departures.filter(dep => !dep.isPast) : [];
    const nextFiveDepartures = futureDepartures.slice(0, 5);
    const nextFiveTimes = new Set(nextFiveDepartures.map(d => d.time));

    let departuresToDisplay = isShortView ? nextFiveDepartures : departures;

    if (departuresToDisplay.length === 0 && isShortView) {
      return '<p class="text-blue-600 p-4 rounded-lg border border-blue-200 bg-blue-50/50 backdrop-blur-sm shadow-sm">W tym dniu nie ma już dostępnych kursów dla tego kierunku.</p>';
    }

    const firstFutureIndex = departuresToDisplay.findIndex(dep => !dep.isPast);

    const timesHtml = departuresToDisplay.map((time, idx) => {
      const isNextFive = nextFiveTimes.has(time.time);
      const bgClass = (idx === firstFutureIndex && isTodaySchedule && isShortView) ? 'bg-light-red' : (time.isPast ? 'bg-no-background' : 'bg-light-gray');
      const noteText = (time.noteKey && notesLegend[time.noteKey]) || '';
      const noteHtml = noteText ? `<span class="time-note">${time.noteKey}</span>` : '';

      let countdownHtml = '';
      let timeBoxContentPrefix = '';
      let tooltipText = noteText;

      if (isTodaySchedule && isNextFive) {
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

      return `<div class="time-box ${bgClass}" ${tooltip}>
                        <div class="time-box-content">${timeBoxContentPrefix}<span class="time-value">${time.time}</span>${noteHtml}</div>
                        <div class="countdown-container">${countdownHtml}</div>
                    </div>`;
    }).join('');

    return `<div class="time-grid">${timesHtml}</div>`;
  }

  // --- SEKCJA NARZĘDZIOWA (Daty, Tooltipy) ---
  function getPublicHolidays(year) {
    const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
    const easterMonday = new Date(year, month - 1, day + 1);
    const corpusChristi = new Date(year, month - 1, day + 60);
    const formatDate = (date) => date.toISOString().slice(0, 10);
    return [`${year}-01-01`, `${year}-01-06`, formatDate(easterMonday), `${year}-05-01`, `${year}-05-03`, formatDate(corpusChristi), `${year}-08-15`, `${year}-11-01`, `${year}-11-11`, `${year}-12-25`, `${year}-12-26`];
  }

  function getDayType(date) {
    const day = date.getDay();
    const holidays = getPublicHolidays(date.getFullYear());
    const dateString = date.toISOString().slice(0, 10);
    if (day === 0 || holidays.includes(dateString)) return { key: 'sundays', displayName: 'Niedziele i Święta' };
    if (day === 6) return { key: 'saturdays', displayName: 'Soboty' };
    return { key: 'workdays', displayName: 'Dni Robocze' };
  }

  const tooltipElement = document.getElementById('custom-tooltip');
  let mobileTooltipTimer = null;

  const showTooltip = (target) => {
    const message = target.dataset.tooltip;
    if (!message || !tooltipElement) return;
    tooltipElement.textContent = message;
    tooltipElement.classList.add('visible');
    const targetRect = target.getBoundingClientRect();
    const tooltipRect = tooltipElement.getBoundingClientRect();
    const centeredLeft = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
    const left = Math.max(10, Math.min(centeredLeft, window.innerWidth - tooltipRect.width - 10));
    tooltipElement.style.left = `${left}px`;
    if (targetRect.top < tooltipRect.height + 15) {
      tooltipElement.style.top = `${targetRect.bottom + 8}px`;
    } else {
      tooltipElement.style.top = `${targetRect.top - tooltipRect.height - 8}px`;
    }
  };

  const hideTooltip = () => {
    if (tooltipElement) tooltipElement.classList.remove('visible');
  };

  const handleMobileTooltip = (target) => {
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      showTooltip(target);
      clearTimeout(mobileTooltipTimer);
      mobileTooltipTimer = setTimeout(hideTooltip, 4000);
    }
  };

  // --- SEKCJA: LOGIKA KOMUNIKATÓW ---
  const announcementsContainer = document.getElementById('announcements-container');

  function formatTextWithMarkdown(text) {
    if (!text) return '';
    return text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  if (announcementsContainer) {
    fetch('announcements.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(announcements => {
        announcementsContainer.innerHTML = '';
        if (!announcements || announcements.length === 0) {
          announcementsContainer.innerHTML = '<p class="col-span-full text-center">Brak dostępnych komunikatów.</p>';
          return;
        }
        announcements.forEach((announcement, index) => {
          const card = document.createElement('div');
          card.className = 'bg-white p-6 rounded-lg shadow-md flex flex-col';
          if (index === 0) {
            card.style.borderLeft = '3px solid #c2410c';
          }
          const formattedFullText = formatTextWithMarkdown(announcement.text);
          const plainText = announcement.text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\n/g, ' ');
          let displayedText = formattedFullText;
          let needsReadMore = false;
          const TRUNCATE_LENGTH = 250;
          if (plainText.length > TRUNCATE_LENGTH) {
            let cutIndex = plainText.lastIndexOf(' ', TRUNCATE_LENGTH);
            if (cutIndex === -1) {
              cutIndex = TRUNCATE_LENGTH;
            }
            displayedText = formatTextWithMarkdown(announcement.text.substring(0, cutIndex)) + '...';
            needsReadMore = true;
          }
          card.innerHTML = `
                        <h3 class="font-bold text-xl mb-1">${announcement.title}</h3>
                        <p class="text-sm text-gray-500 mb-6">${announcement.date}</p>
                        <div class="announcement-content text-gray-700">${displayedText}</div>
                        ${needsReadMore ? `<a class="read-more text-orange-700 hover:underline pt-2 cursor-pointer font-semibold mt-4">Czytaj więcej</a>` : ''}
                    `;
          announcementsContainer.appendChild(card);
          if (needsReadMore) {
            const readMoreBtn = card.querySelector('.read-more');
            const contentDiv = card.querySelector('.announcement-content');
            readMoreBtn.addEventListener('click', function () {
              const isCollapsed = this.textContent === 'Czytaj więcej';
              contentDiv.innerHTML = isCollapsed ? formattedFullText : displayedText;
              this.textContent = isCollapsed ? 'Zwiń' : 'Czytaj więcej';
            });
          }
        });
      })
      .catch(error => {
        console.error("Błąd ładowania komunikatów:", error);
        announcementsContainer.innerHTML = '<p class="col-span-full text-center text-red-600">Niestety, nie udało się załadować komunikatów.</p>';
      });
  }
});