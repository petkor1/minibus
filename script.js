document.addEventListener('DOMContentLoaded', () => {

  // Smooth scrolling for navigation links
  document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      const targetElement = document.querySelector(this.getAttribute('href'));
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }

      // Close mobile menu if open
      const mainNav = document.querySelector('.main-nav');
      const body = document.body;
      if (body.classList.contains('mobile-nav-open')) {
        body.classList.remove('mobile-nav-open');
        if (mainNav) {
          mainNav.classList.remove('active');
        }
      }
    });
  });

  // Mobile navigation toggle
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  const body = document.body;

  if (mobileNavToggle && mainNav && body) {
    mobileNavToggle.addEventListener('click', () => {
      mainNav.classList.toggle('active');
      body.classList.toggle('mobile-nav-open'); // Add a class to body for potential overlay
    });
  }

  // Dynamic schedule loading and smooth scrolling
  const scheduleLinksContainer = document.querySelector('.schedule-links-grid');
  const scheduleContentDiv = document.getElementById('schedule-details'); // ID zmienione na 'schedule-details' w index.html

  if (scheduleLinksContainer && scheduleContentDiv) {
    scheduleLinksContainer.addEventListener('click', async (event) => {
      const targetLink = event.target.closest('.schedule-link');
      if (targetLink) {
        event.preventDefault(); // KLUCZOWE: Zapobiega domyślnej nawigacji przeglądarki

        // Usuń klasę 'active' ze wszystkich linków
        document.querySelectorAll('.schedule-link').forEach(link => {
          link.classList.remove('active');
        });

        // Dodaj klasę 'active' do klikniętego linku
        targetLink.classList.add('active');

        const scheduleUrl = targetLink.getAttribute('href'); // Pobierz URL pliku HTML z rozkładem
        
        // Wyświetl komunikat ładowania
        scheduleContentDiv.innerHTML = '<p style="text-align: center; padding: 50px;">Ładowanie rozkładu jazdy...</p>';

        try {
          const response = await fetch(scheduleUrl);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const scheduleHtml = await response.text();
          scheduleContentDiv.innerHTML = scheduleHtml;

          // Przewiń płynnie PO załadowaniu treści
          scheduleContentDiv.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

        } catch (error) {
          console.error('Failed to load schedule:', error);
          scheduleContentDiv.innerHTML = '<p style="text-align: center; padding: 50px; color: red;">Niestety, nie udało się załadować rozkładu jazdy. Spróbuj ponownie później.</p>';
        }
      }
    });
  }

  // Funkcja do prostego formatowania tekstu z Markdownu na HTML
  function formatTextWithMarkdown(text) {
    if (!text) return '';

    let formattedText = text.replace(/\n/g, '<br>');
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return formattedText;
  }

  // "Czytaj więcej" functionality for announcements
  const announcementsContainer = document.getElementById('announcements-container');
  if (announcementsContainer) {
    fetch('announcements.json') // Upewnij się, że ścieżka 'announcements.json' jest poprawna
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(announcements => {
        announcementsContainer.innerHTML = ''; // Wyczyść statyczną zawartość

        if (announcements.length === 0) {
          announcementsContainer.innerHTML = '<p>Brak dostępnych komunikatów w tym momencie.</p>';
        } else {
          const TRUNCATE_LENGTH = 150; // Definiujemy długość przycięcia

          announcements.forEach(announcement => {
            const card = document.createElement('div');
            card.classList.add('announcement-card');

            const formattedFullText = formatTextWithMarkdown(announcement.text);
            let displayedText = formattedFullText;
            let needsReadMore = false;

            const plainText = announcement.text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\n/g, ' ');

            if (plainText.length > TRUNCATE_LENGTH) {
              displayedText = formatTextWithMarkdown(plainText.substring(0, TRUNCATE_LENGTH)) + '...';
              needsReadMore = true;
            }

            card.innerHTML = `
              <h3>${announcement.title}</h3>
              <p class="date">${announcement.date}</p>
              <p class="announcement-content">${displayedText}</p>
              ${needsReadMore ?
                `<a href="#" class="read-more"
                   data-full-text="${formattedFullText.replace(/"/g, '&quot;')}"
                   data-preview-text="${displayedText.replace(/"/g, '&quot;')}"
                   >Czytaj więcej</a>` :
                ''
              }
            `;
            announcementsContainer.appendChild(card);
          });

          // WAŻNE: Po dodaniu wszystkich komunikatów, przypnij event listenery
          document.querySelectorAll('.announcement-card .read-more').forEach(button => {
            button.addEventListener('click', function(e) {
              e.preventDefault();
              const card = this.closest('.announcement-card');
              const contentParagraph = card.querySelector('.announcement-content');

              const fullText = this.getAttribute('data-full-text');
              const previewText = this.getAttribute('data-preview-text');

              if (contentParagraph.innerHTML === fullText) {
                contentParagraph.innerHTML = previewText;
                this.textContent = 'Czytaj więcej';
              } else {
                contentParagraph.innerHTML = fullText;
                this.textContent = 'Zwiń';
              }
            });
          });
        }
      })
      .catch(error => {
        console.error('Błąd podczas ładowania komunikatów:', error);
        announcementsContainer.innerHTML = '<p>Niestety, nie udało się załadować komunikatów. Spróbuj ponownie później.</p>';
      });
  }

});