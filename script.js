
document.addEventListener('DOMContentLoaded', () => {
  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      const targetElement = document.querySelector(href);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth' });

        // Close mobile menu if open
        const mainNav = document.querySelector('.main-nav');
        const body = document.body;
        if (body.classList.contains('mobile-nav-open')) {
          body.classList.remove('mobile-nav-open');
          mainNav.classList.remove('active');
        }
      }
    });
  });

  // Mobile navigation toggle
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  const body = document.body;

  if (mobileNavToggle && mainNav) {
    mobileNavToggle.addEventListener('click', () => {
      mainNav.classList.toggle('active');
      body.classList.toggle('mobile-nav-open');
    });
  }

  // Dynamic schedule loading from external HTML files
  const scheduleLinksContainer = document.querySelector('.schedule-links-grid');
  const scheduleContentDiv = document.getElementById('schedule-details');

  if (scheduleLinksContainer && scheduleContentDiv) {
    scheduleLinksContainer.addEventListener('click', async (event) => {
      const targetLink = event.target.closest('.schedule-link');
      if (targetLink) {
        event.preventDefault();

        document.querySelectorAll('.schedule-link').forEach(link => link.classList.remove('active'));
        targetLink.classList.add('active');

        const scheduleUrl = targetLink.getAttribute('href');
        scheduleContentDiv.innerHTML = '<p style="text-align: center; padding: 50px;">Ładowanie rozkładu jazdy...</p>';

        try {
          const response = await fetch(scheduleUrl);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const scheduleHtml = await response.text();
          scheduleContentDiv.innerHTML = scheduleHtml;
        } catch (error) {
          scheduleContentDiv.innerHTML = '<p style="text-align: center; padding: 50px; color: red;">Niestety, nie udało się załadować tego rozkładu jazdy.</p>';
        }
      }
    });
  }

  // Simple Markdown-like formatter for announcements
  function formatTextWithMarkdown(text) {
    if (!text) return '';
    let formattedText = text.replace(/\n/g, '<br>');
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return formattedText;
  }

  // Load announcements from external JSON file
  const announcementsContainer = document.getElementById('announcements-container');
  if (announcementsContainer) {
    fetch('announcements.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(announcements => {
        announcementsContainer.innerHTML = ''; // Clear loading message

        if (!announcements || announcements.length === 0) {
          announcementsContainer.innerHTML = '<p>Brak dostępnych komunikatów.</p>';
        } else {
          const TRUNCATE_LENGTH = 150;

          announcements.forEach(announcement => {
            const card = document.createElement('div');
            card.classList.add('announcement-card');

            const formattedFullText = formatTextWithMarkdown(announcement.text);
            const plainText = announcement.text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\n/g, ' ');

            let displayedText = formattedFullText;
            let needsReadMore = false;

            if (plainText.length > TRUNCATE_LENGTH) {
              // Find a good place to cut the text
              let cutIndex = plainText.lastIndexOf(' ', TRUNCATE_LENGTH);
              if (cutIndex === -1) cutIndex = TRUNCATE_LENGTH;

              displayedText = formatTextWithMarkdown(announcement.text.substring(0, cutIndex)) + '...';
              needsReadMore = true;
            }

            card.innerHTML = `
              <h3>${announcement.title}</h3>
              <p class="date">${announcement.date}</p>
              <div class="announcement-content">${displayedText}</div>
              ${needsReadMore ?
                `<a class="read-more">Czytaj więcej</a>` : ''
              }
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
        }
      })
      .catch(error => {
        announcementsContainer.innerHTML = '<p>Niestety, nie udało się załadować komunikatów. Spróbuj ponownie później.</p>';
      });
  }
});
