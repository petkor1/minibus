// ===================================================================================
// GŁÓWNY KOD APLIKACJI
// Cała logika jest zamknięta wewnątrz `DOMContentLoaded` dla pewności,
// że skrypt uruchomi się po załadowaniu całej strony.
// ===================================================================================
document.addEventListener('DOMContentLoaded', () => {
  // --- OBSŁUGA NAWIGACJI ---
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

  // --- LOGIKA ROZKŁADÓW JAZDY ---
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
      if (button) {
        const routeId = button.dataset.routeId;
        document.querySelectorAll('.schedule-selector-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        renderSchedule(routeId, false);
        placeholderText.classList.add('hidden');
        detailsContainer.classList.remove('hidden');
        if (detailsContainer) {
          const targetPosition = detailsContainer.getBoundingClientRect().top + window.pageYOffset - 70;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  } else {
    if (placeholderText) placeholderText.textContent = "Błąd ładowania modułu rozkładów jazdy.";
  }

  /**
   * Główna funkcja renderująca widok rozkładu (skrócony lub pełny)
   */
  function renderSchedule(routeId, isFullView, scrollToDirection = null) {
    const route = schedulesData[routeId];
    const now = new Date();
    const currentDayType = getDayType(now); // Określa typ dnia DZIŚ (np. Sobota)
    const dayTypes = [
      { key: 'workdays', displayName: 'Dni Robocze' },
      { key: 'saturdays', displayName: 'Soboty' },
      { key: 'sundays', displayName: 'Niedziele i Święta' }
    ];

    let html = '';

    route.directions.forEach((direction, index) => {
      const directionId = `${routeId}-${direction.directionName.replace(/[^a-zA-Z0-9]/g, '-')}-${index}`;
      if (index > 0) {
        html += '<hr class="my-6 border-gray-300">';
      }

      html += `<div class="schedule-direction" id="${directionId}" data-direction-name="${direction.directionName}">
                                <h4 class="font-bold text-xl flex items-center gap-2">
                                <span class="inline-block align-middle text-orange-600" aria-hidden="true">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <rect x="3" y="5" width="18" height="12" rx="3" fill="#c2410c" stroke="#c2410c" />
                                        <rect x="6" y="8" width="4" height="4" rx="1" fill="#fff" />
                                        <rect x="14" y="8" width="4" height="4" rx="1" fill="#fff" />
                                        <circle cx="7.5" cy="17" r="1.5" fill="#1e293b"/>
                                        <circle cx="16.5" cy="17" r="1.5" fill="#1e293b"/>
                                    </svg>
                                </span>
                                ${direction.directionName}
                                </h4>`;

      const notesLegend = direction.notes || {};

      if (isFullView) {
        dayTypes.forEach(dayType => {
          html += `<p class="mt-6 mb-2 text-gray-700">${dayType.displayName}</p>`;
          // W pełnym widoku: przekazujemy typ dnia, dla którego generujemy siatkę (dayType)
          html += generateTimesGridHtml(direction.times[dayType.key] || [], notesLegend, false, now, dayType);
        });
      } else {
        html += `<div class="flex justify-between items-center mt-2 mb-2">
                                <p class="text-gray-700">Najbliższe kursy dzisiaj (${currentDayType.displayName})</p>
                            </div>`;
        // W skróconym widoku: zawsze generujemy tylko dla DZISIEJSZEGO typu dnia
        html += generateTimesGridHtml(direction.times[currentDayType.key] || [], notesLegend, true, now, currentDayType, 5);
      }

      if (Object.keys(notesLegend).length > 0) {
        html += '<div class="notes-legend mt-4">';
        for (const key in notesLegend) {
          html += `<p class="text-sm text-gray-600"><span class="font-bold">${key}</span> - ${notesLegend[key]}</p>`;
        }
        html += '</div>';
      }

      const buttonText = isFullView ? 'Zwiń rozkład' : 'Pełny rozkład ->';
      html += `<div class="flex justify-start mt-4">
                               <button class="toggle-full-schedule-btn" data-route-id="${routeId}" data-full-view="${isFullView}" data-direction-id="${directionId}">${buttonText}</button>
                           </div>`;
      html += `</div>`;
    });

    detailsContainer.innerHTML = html;

    detailsContainer.querySelectorAll('.toggle-full-schedule-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const currentIsFull = e.target.dataset.fullView === 'true';
        const targetDirectionId = e.target.dataset.directionId;
        renderSchedule(routeId, !currentIsFull, targetDirectionId);
        if (currentIsFull) {
          const schedulesSection = document.getElementById('schedules-section');
          if (schedulesSection) {
            setTimeout(() => {
              schedulesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }
        }
      });
    });

    if (isFullView && scrollToDirection) {
      const targetElement = document.getElementById(scrollToDirection);
      if (targetElement) {
        const yOffset = -70;
        const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  }

  /**
   * Generuje siatkę z godzinami odjazdów, z odpowiednim stylem tła.
   *
   * @param {Array} timesArray Tablica obiektów z godzinami i opcjonalnymi datami/notatkami.
   * @param {Object} notesLegend Obiekt z legendą dla kluczy notatek.
   * @param {boolean} isShortView Czy to widok skrócony (true) czy pełny (false).
   * @param {Date} now Aktualna data i czas.
   * @param {Object} dayTypeForGrid Typ dnia, dla którego obecnie generujemy siatkę (np. {key: 'workdays', displayName: 'Dni Robocze'}).
   * @param {number|null} limit Opcjonalny limit wyświetlanych kursów w widoku skróconym.
   * @returns {string} HTML siatki z godzinami.
   */
  function generateTimesGridHtml(timesArray, notesLegend, isShortView, now, dayTypeForGrid, limit = null) {
    if (!timesArray || timesArray.length === 0) {
      return '<p class="text-blue-600 p-4 rounded-lg border border-blue-200 bg-blue-50/50 backdrop-blur-sm shadow-sm">W tym dniu nie ma kursów</p>';
    }

    const currentDay = now.getDay(); // Dzień tygodnia dzisiaj (0-6)
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

    // Określenie, czy typ dnia dla generowanej siatki jest TYPEM DNIA DZISIEJSZEGO
    // Np. Jeśli dzisiaj jest sobota (currentDayType.key = 'saturdays')
    // i generujemy siatkę dla 'saturdays', to jest to isCurrentlyGeneratingTodaySchedule = true.
    // Jeśli generujemy dla 'workdays', to isCurrentlyGeneratingTodaySchedule = false.
    const currentDayType = getDayType(now); // Obiekt z kluczem i nazwą typu dnia dzisiaj
    const isCurrentlyGeneratingTodaySchedule = (dayTypeForGrid.key === currentDayType.key);


    let departures = timesArray.map(timeObj => {
      const [h, m] = timeObj.time.split(':').map(Number);
      const totalMinutes = h * 60 + m;

      // "past" ma sens tylko jeśli rozkład dotyczy DNIA DZISIEJSZEGO i czas już minął
      const past = isCurrentlyGeneratingTodaySchedule && (totalMinutes < currentTimeInMinutes);

      return {
        ...timeObj,
        totalMinutes,
        past // Określa, czy kurs już się odbył dzisiaj w kontekście generowanego rozkładu
      };
    });

    let departuresToDisplay = [...departures];

    // LOGIKA SORTOWANIA I FILTROWANIA:
    if (isShortView) { // Widok skrócony: filtrujemy i sortujemy tylko przyszłe kursy dzisiaj
      // W widoku skróconym zawsze interesują nas tylko kursy z bieżącego typu dnia (dnia dzisiejszego)
      // i tylko te, które jeszcze się nie odbyły.
      departuresToDisplay = departuresToDisplay.filter(dep => !dep.past);
      departuresToDisplay.sort((a, b) => a.totalMinutes - b.totalMinutes); // Sortuj chronologicznie
      if (limit) {
        departuresToDisplay = departuresToDisplay.slice(0, limit); // Ogranicz liczbę
      }
    } else { // Pełny widok: zawsze wyświetlaj chronologicznie wszystkie kursy dla danego typu dnia
      departuresToDisplay.sort((a, b) => a.totalMinutes - b.totalMinutes); // Zawsze sortuj chronologicznie
    }

    // Znajdź indeks najbliższego przyszłego kursu dla JASNO-CZERWONEGO tła.
    // Działa to tylko jeśli generujemy rozkład DLA DNIA DZISIEJSZEGO.
    let firstFutureTodayIdx = -1;
    if (isCurrentlyGeneratingTodaySchedule) {
      firstFutureTodayIdx = departuresToDisplay.findIndex(dep => !dep.past);
    }

    const timesHtml = departuresToDisplay.map((time, idx) => {
      let noteHtml = '';
      const tooltip = (time.noteKey && notesLegend[time.noteKey]) ? ` title="${notesLegend[time.noteKey]}"` : '';
      if (time.noteKey && notesLegend[time.noteKey]) {
        noteHtml = `<span class="time-note">${time.noteKey}</span>`;
      }

      let bgClass = '';
      if (isCurrentlyGeneratingTodaySchedule) {
        // Logika dla rozkładu DLA DNIA DZISIEJSZEGO (np. dzisiaj sobota, patrzymy na rozkład sobót)
        if (time.past) {
          bgClass = 'bg-no-background'; // Kurs już się odbył dzisiaj - brak tła
        } else if (idx === firstFutureTodayIdx && firstFutureTodayIdx !== -1) {
          bgClass = 'bg-light-red'; // Najbliższy przyszły kurs dzisiaj - jasnoczerwone tło
        } else {
          bgClass = 'bg-light-gray'; // Pozostałe przyszłe kursy dzisiaj - jasnoszare tło
        }
      } else {
        // Logika dla rozkładu DLA INNEGO DNIA (niż dzisiaj)
        // Np. dzisiaj sobota, a patrzymy na rozkład "Dni Roboczych" lub "Niedziel i Świąt".
        // Wszystkie kursy z tych innych dni ZAWSZE mają jasnoszare tło, bo zakładamy, że się odbędą.
        bgClass = 'bg-light-gray';
      }

      return `<div class="time-box ${bgClass}"${tooltip}>${time.time}${noteHtml}</div>`;
    }).join('');

    return `<div class="time-grid">${timesHtml}</div>`;
  }

  /**
   * Określa typ dnia (roboczy, sobota, niedziela/święta).
   * @param {Date} date Obiekt daty.
   * @returns {{key: string, displayName: string}} Obiekt z kluczem i nazwą typu dnia.
   */
  function getDayType(date) {
    const day = date.getDay();
    // Można tu dodać listę świąt w formacie 'YYYY-MM-DD'
    const holidays = [];
    const dateString = date.toISOString().slice(0, 10); // 'YYYY-MM-DD'

    if (day === 0 || holidays.includes(dateString)) {
      return { key: 'sundays', displayName: 'Niedziele i Święta' };
    }
    if (day === 6) {
      return { key: 'saturdays', displayName: 'Soboty' };
    }
    return { key: 'workdays', displayName: 'Dni Robocze' };
  }


  // --- LOGIKA ŁADOWANIA KOMUNIKATÓW ---
  const announcementsContainer = document.getElementById('announcements-container');

  /**
   * Formatuje tekst Markdown na HTML (pogrubienie, nowe linie).
   * @param {string} text Tekst w formacie Markdown.
   * @returns {string} Sformatowany tekst HTML.
   */
  function formatTextWithMarkdown(text) {
    if (!text) return '';
    let formattedText = text.replace(/\n/g, '<br>'); // Nowe linie
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Pogrubienie
    return formattedText;
  }

  if (announcementsContainer) {
    fetch('announcements.json') // Pobierz dane z pliku JSON
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(announcements => {
        announcementsContainer.innerHTML = '';
        if (!announcements || announcements.length === 0) {
          announcementsContainer.innerHTML = '<p class="col-span-full text-center">Brak dostępnych komunikatów.</p>';
          return;
        }

        const TRUNCATE_LENGTH = 250; // Długość tekstu przed obcięciem
        announcements.forEach((announcement, index) => {
          const card = document.createElement('div');
          card.className = 'bg-white p-6 rounded-lg shadow-md flex flex-col';

          if (index === 0) {
            card.style.borderLeft = '3px solid #c2410c'; // Wyróżnij pierwszy komunikat
          }

          const formattedFullText = formatTextWithMarkdown(announcement.text);
          // Usuń formatowanie Markdown do obliczenia długości tekstu
          const plainText = announcement.text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\n/g, ' ');

          let displayedText = formattedFullText;
          let needsReadMore = false;

          // Sprawdź, czy tekst wymaga obcięcia
          if (plainText.length > TRUNCATE_LENGTH) {
            let cutIndex = plainText.lastIndexOf(' ', TRUNCATE_LENGTH);
            if (cutIndex === -1) cutIndex = TRUNCATE_LENGTH;
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

          // Obsługa przycisku "Czytaj więcej"
          if (needsReadMore) {
            const readMoreBtn = card.querySelector('.read-more');
            const contentDiv = card.querySelector('.announcement-content');

            readMoreBtn.addEventListener('click', function () {
              if (this.textContent === 'Czytaj więcej') {
                contentDiv.innerHTML = formattedFullText;
                this.textContent = 'Zwiń';
              } else {
                contentDiv.innerHTML = displayedText;
                this.textContent = 'Czytaj więcej';
              }
            });
          }
        });
      })
      .catch(error => {
        console.error("Błąd ładowania komunikatów:", error);
        announcementsContainer.innerHTML = '<p class="col-span-full text-center text-red-600">Niestety, nie udało się załadować komunikatów.</p>';
      });
  }

  // Obsługa wyświetlania tooltipów na urządzeniach mobilnych
  document.addEventListener('click', function (e) {
    const box = e.target.closest('.time-box[title]');
    if (!box) return;

    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      const note = box.getAttribute('title');
      if (note) {
        alert(note);
        e.preventDefault();
        e.stopPropagation();
      }
    }
  });
});