/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.{html,js}", // To pozostaje bez zmian
  ],
  // NOWA SEKCJA: Dodaj tę listę bezpiecznych klas
  safelist: [
    'bg-orange-100',
    'text-orange-700',
    'border-orange-500',
    'z-10',
    'focus:z-20',
    // Klasy dla listy rozwijanej (na wszelki wypadek)
    'focus:border-orange-500',
    'focus:ring-1',
    'focus:ring-orange-500',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}