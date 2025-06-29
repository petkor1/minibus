// ===================================================================================
// GŁÓWNY KOD APLIKACJI (WERSJA POPRAWIONA)
// Przywrócono przewijanie przy zwijaniu rozkładu i zweryfikowano logikę toastów.
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
    const now = new Date();
    const today = getDayType(now);
    const allDayTypes = [
      { key: 'workdays', displayName: 'Dni Robocze' },
      { key: 'saturdays', displayName: 'Soboty' },
      { key: 'sundays', displayName: 'Niedziele i Święta' }
    ];

    let html = '';
    route.directions.forEach((direction, index) => {
      const directionId = `${routeId}-${direction.directionName.replace(/[^a-zA-Z0-9]/g, '-')}-${index}`;
      const notesLegend = direction.notes || {};

      html += `
                ${index > 0 ? '<hr class="my-6 border-gray-300">' : ''}
                <div class="schedule-direction" id="${directionId}">
                    <h4 class="font-bold text-xl flex items-center gap-2">
                        <span class="inline-block align-middle text-orange-600" aria-hidden="true">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="5" width="18" height="12" rx="3" fill="#c2410c" stroke="#c2410c" /><rect x="6" y="8" width="4" height="4" rx="1" fill="#fff" /><rect x="14" y="8" width="4" height="4" rx="1" fill="#fff" /><circle cx="7.5" cy="17" r="1.5" fill="#1e293b"/><circle cx="16.5" cy="17" r="1.5" fill="#1e293b"/></svg>
                        </span>
                        ${direction.directionName}
                    </h4>
            `;

      if (isFullView) {
        allDayTypes.forEach(dayType => {
          html += `
                        <p class="mt-6 mb-2 text-gray-700">${dayType.displayName}</p>
                        ${generateTimesGridHtml({
            timesArray: direction.times[dayType.key] || [],
            notesLegend: notesLegend,
            isShortView: false,
            now: now,
            dayTypeForGrid: dayType
          })}
                    `;
        });
      } else {
        html += `
                    <div class="flex justify-between items-center mt-2 mb-2">
                        <p class="text-gray-700">Najbliższe kursy dzisiaj (${today.displayName})</p>
                    </div>
                    ${generateTimesGridHtml({
          timesArray: direction.times[today.key] || [],
          notesLegend: notesLegend,
          isShortView: true,
          now: now,
          dayTypeForGrid: today,
          limit: 5
        })}
                `;
      }

      if (Object.keys(notesLegend).length > 0) {
        html += '<div class="notes-legend mt-4">';
        for (const key in notesLegend) {
          html += `<p class="text-sm text-gray-600"><span class="font-bold">${key}</span> - ${notesLegend[key]}</p>`;
        }
        html += '</div>';
      }

      const buttonText = isFullView ? 'Zwiń rozkład' : 'Pełny rozkład ->';
      html += `
                    <div class="flex justify-start mt-4">
                        <button class="toggle-full-schedule-btn" data-route-id="${routeId}" data-full-view="${isFullView}" data-direction-id="${directionId}">${buttonText}</button>
                    </div>
                </div>
            `;
    });

    detailsContainer.innerHTML = html;

    detailsContainer.querySelectorAll('.toggle-full-schedule-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const currentIsFull = e.target.dataset.fullView === 'true';
        const targetDirectionId = e.target.dataset.directionId;

        renderSchedule(routeId, !currentIsFull, targetDirectionId);

        // =============================================================
        // POPRAWKA: Przywrócenie logiki przewijania przy zwijaniu.
        // =============================================================
        if (currentIsFull) {
          const schedulesSection = document.getElementById('schedules-section'); // Upewnij się, że masz sekcję z takim ID
          if (schedulesSection) {
            setTimeout(() => { // Opóźnienie, by DOM zdążył się przerysować
              schedulesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
          }
        }
      });
    });

    if (isFullView && scrollToDirection) {
      const targetElement = document.getElementById(scrollToDirection);
      if (targetElement) {
        const y = targetElement.getBoundingClientRect().top + window.pageYOffset - 70;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  }

  function getBgClass(departure, index, firstFutureIndex, isTodaySchedule) {
    if (!isTodaySchedule) return 'bg-light-gray';
    if (departure.isPast) return 'bg-no-background';
    if (index === firstFutureIndex) return 'bg-light-red';
    return 'bg-light-gray';
  }

  function generateTimesGridHtml(options) {
    const { timesArray, notesLegend, isShortView, now, dayTypeForGrid, limit = null } = options;

    if (!timesArray || timesArray.length === 0) {
      return '<p class="text-blue-600 p-4 rounded-lg border border-blue-200 bg-blue-50/50 backdrop-blur-sm shadow-sm">W tym dniu nie ma kursów</p>';
    }

    const today = getDayType(now);
    const isTodaySchedule = dayTypeForGrid.key === today.key;
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

    let departures = timesArray
      .map(timeObj => ({
        ...timeObj,
        totalMinutes: (([h, m]) => h * 60 + m)(timeObj.time.split(':').map(Number)),
        isPast: isTodaySchedule && (([h, m]) => h * 60 + m)(timeObj.time.split(':').map(Number)) < currentTimeInMinutes
      }))
      .sort((a, b) => a.totalMinutes - b.totalMinutes);

    if (isShortView) {
      departures = departures.filter(dep => !dep.isPast);
      if (limit) {
        departures = departures.slice(0, limit);
      }
    }

    if (departures.length === 0 && isShortView) {
      return '<p class="text-blue-600 p-4 rounded-lg border border-blue-200 bg-blue-50/50 backdrop-blur-sm shadow-sm">W tym dniu nie ma już dostępnych kursów dla tego kierunku.</p>';
    }

    const firstFutureIndex = isTodaySchedule ? departures.findIndex(dep => !dep.isPast) : -1;

    const timesHtml = departures.map((time, idx) => {
      const bgClass = getBgClass(time, idx, firstFutureIndex, isTodaySchedule);
      const tooltip = (time.noteKey && notesLegend[time.noteKey]) ? `title="${notesLegend[time.noteKey]}"` : '';
      const noteHtml = (time.noteKey && notesLegend[time.noteKey]) ? `<span class="time-note">${time.noteKey}</span>` : '';

      return `<div class="time-box ${bgClass}" ${tooltip}>${time.time}${noteHtml}</div>`;
    }).join('');

    return `<div class="time-grid">${timesHtml}</div>`;
  }

  function getDayType(date) {
    const day = date.getDay();
    const holidays = [];
    const dateString = date.toISOString().slice(0, 10);

    if (day === 0 || holidays.includes(dateString)) return { key: 'sundays', displayName: 'Niedziele i Święta' };
    if (day === 6) return { key: 'saturdays', displayName: 'Soboty' };
    return { key: 'workdays', displayName: 'Dni Robocze' };
  }


  // --- SEKCJA: LOGIKA KOMUNIKATÓW ---
  // Bez zmian
  const announcementsContainer = document.getElementById('announcements-container');

  function formatTextWithMarkdown(text) {
    if (!text) return '';
    return text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  if (announcementsContainer) {
    fetch('announcements.json')
      .then(response => { if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`); return response.json(); })
      .then(announcements => {
        announcementsContainer.innerHTML = '';
        if (!announcements || announcements.length === 0) { announcementsContainer.innerHTML = '<p class="col-span-full text-center">Brak dostępnych komunikatów.</p>'; return; }
        const TRUNCATE_LENGTH = 250;
        announcements.forEach((announcement, index) => {
          const card = document.createElement('div');
          card.className = 'bg-white p-6 rounded-lg shadow-md flex flex-col';
          if (index === 0) card.style.borderLeft = '3px solid #c2410c';
          const formattedFullText = formatTextWithMarkdown(announcement.text);
          const plainText = announcement.text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\n/g, ' ');
          let displayedText = formattedFullText, needsReadMore = false;
          if (plainText.length > TRUNCATE_LENGTH) {
            let cutIndex = plainText.lastIndexOf(' ', TRUNCATE_LENGTH); if (cutIndex === -1) cutIndex = TRUNCATE_LENGTH;
            displayedText = formatTextWithMarkdown(announcement.text.substring(0, cutIndex)) + '...'; needsReadMore = true;
          }
          card.innerHTML = `<h3 class="font-bold text-xl mb-1">${announcement.title}</h3><p class="text-sm text-gray-500 mb-6">${announcement.date}</p><div class="announcement-content text-gray-700">${displayedText}</div>${needsReadMore ? `<a class="read-more text-orange-700 hover:underline pt-2 cursor-pointer font-semibold mt-4">Czytaj więcej</a>` : ''}`;
          announcementsContainer.appendChild(card);
          if (needsReadMore) {
            const readMoreBtn = card.querySelector('.read-more'); const contentDiv = card.querySelector('.announcement-content');
            readMoreBtn.addEventListener('click', function () { const isCollapsed = this.textContent === 'Czytaj więcej'; contentDiv.innerHTML = isCollapsed ? formattedFullText : displayedText; this.textContent = isCollapsed ? 'Zwiń' : 'Czytaj więcej'; });
          }
        });
      })
      .catch(error => { console.error("Błąd ładowania komunikatów:", error); announcementsContainer.innerHTML = '<p class="col-span-full text-center text-red-600">Niestety, nie udało się załadować komunikatów.</p>'; });
  }

  // --- SEKCJA: OBSŁUGA TOOLTIPÓW / TOASTÓW ---
  let activeToastTimer = null;

  function showToast(message) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      console.error('Brak elementu #toast-container w pliku HTML.');
      return;
    }
    if (activeToastTimer) clearTimeout(activeToastTimer);
    toastContainer.textContent = message;
    toastContainer.classList.add('show');
    activeToastTimer = setTimeout(() => { toastContainer.classList.remove('show'); activeToastTimer = null; }, 3000);
  }

  // Zmieniono event z 'click' na 'pointerup' dla lepszej responsywności na mobile.
  document.body.addEventListener('pointerup', function (e) {
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      const timeBox = e.target.closest('.time-box[title]');
      if (timeBox) {
        showToast(timeBox.getAttribute('title'));
      }
    }
  });
});