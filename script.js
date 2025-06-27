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
      if (button) {
        const routeId = button.dataset.routeId;

        // Remove 'active' class from all buttons and add to the clicked one
        document.querySelectorAll('.schedule-selector-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Render the schedule
        renderSchedule(routeId, false); // Zawsze pokazuj początkowo widok skrócony

        // Show schedule details and hide placeholder
        placeholderText.classList.add('hidden');
        detailsContainer.classList.remove('hidden');

        // Scroll to 60px above the schedule-details-container
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
  function renderSchedule(routeId, isFullView) {
    const route = schedulesData[routeId];
    const now = new Date();
    const currentDayType = getDayType(now);
    const dayTypes = [
      { key: 'workdays', displayName: 'Dni Robocze' },
      { key: 'saturdays', displayName: 'Soboty' },
      { key: 'sundays', displayName: 'Niedziele i Święta' }
    ];

    let html = '';

    route.directions.forEach(direction => {
      html += `<div class="schedule-direction" data-direction-name="${direction.directionName}">
                      <h4 class="font-bold text-xl">${direction.directionName}</h4>`;

      if (isFullView) {
        // Pełny widok: iteruj po wszystkich typach dni
        dayTypes.forEach(dayType => {
          html += `<p class="font-semibold mt-4 mb-2 text-gray-700">${dayType.displayName}</p>`;
          html += generateTimesGridHtml(direction.times[dayType.key] || [], false, now);
        });
      } else {
        // Skrócony widok: pokaż tylko bieżący typ dnia
        html += `<p class="mt-2 mb-2 text-gray-700">Najbliższe kursy</p>`;
        html += generateTimesGridHtml(direction.times[currentDayType.key] || [], true, now, 5);
      }
      html += `</div>`;
    });

    const buttonText = isFullView ? 'Zwiń rozkład' : 'Pokaż pełny rozkład';
    html += `<button class="toggle-full-schedule-btn" data-route-id="${routeId}" data-full-view="${isFullView}">${buttonText}</button>`;

    detailsContainer.innerHTML = html;

    // Ponowne podpięcie eventu do nowego przycisku
    detailsContainer.querySelector('.toggle-full-schedule-btn').addEventListener('click', (e) => {
      const currentIsFull = e.target.dataset.fullView === 'true';
      renderSchedule(routeId, !currentIsFull);
    });
  }

  /**
   * Generuje siatkę z godzinami odjazdów
   */
  function generateTimesGridHtml(timesArray, useNextDepartureLogic, now, limit = null) {
    if (timesArray.length === 0) {
      return '<p class="text-gray-500">Brak kursów.</p>';
    }

    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
    let foundNext = false;

    let departures = timesArray.map(timeStr => {
      const [h, m] = timeStr.split(':').map(Number);
      return { time: timeStr, totalMinutes: h * 60 + m };
    });

    if (useNextDepartureLogic) {
      departures = departures
        .filter(timeObj => timeObj.totalMinutes >= currentTimeInMinutes)
        .map(timeObj => {
          let isNext = false;
          if (!foundNext && timeObj.totalMinutes >= currentTimeInMinutes) {
            isNext = true;
            foundNext = true;
          }
          return { ...timeObj, isNext };
        });
      if (limit) {
        departures = departures.slice(0, limit);
      }
    }

    if (departures.length === 0) {
      return '<p class="text-gray-500">Brak kolejnych kursów w tym dniu.</p>';
    }

    const timesHtml = departures.map(time =>
      `<div class="time-box ${time.isNext ? 'next-departure' : ''}">${time.time}</div>`
    ).join('');

    return `<div class="time-grid">${timesHtml}</div>`;
  }

  /**
   * Określa typ dnia
   */
  function getDayType(date) {
    const day = date.getDay();
    if (day === 0) return { key: 'sundays', displayName: 'Niedziele i Święta' };
    if (day === 6) return { key: 'saturdays', displayName: 'Soboty' };
    return { key: 'workdays', displayName: 'Dni Robocze' };
  }

  // --- PRZYWRÓCONA LOGIKA ŁADOWANIA KOMUNIKATÓW ---
  const announcementsContainer = document.getElementById('announcements-container');

  function formatTextWithMarkdown(text) {
    if (!text) return '';
    let formattedText = text.replace(/\n/g, '<br>');
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return formattedText;
  }

  if (announcementsContainer) {
    fetch('announcements.json')
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

        const TRUNCATE_LENGTH = 250;
        announcements.forEach((announcement, index) => {
          const card = document.createElement('div');
          card.className = 'bg-white p-6 rounded-lg shadow-md flex flex-col';

          // Add red border to first announcement
          if (index === 0) {
            card.style.borderLeft = '3px solid red';
          }

          const formattedFullText = formatTextWithMarkdown(announcement.text);
          const plainText = announcement.text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\n/g, ' ');

          let displayedText = formattedFullText;
          let needsReadMore = false;

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
                ${needsReadMore ? `<a class="read-more text-blue-600 hover:underline pt-2 cursor-pointer font-semibold mt-4">Czytaj więcej</a>` : ''}
            `;
          announcementsContainer.appendChild(card);

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
});
