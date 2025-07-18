// ===================================================================================
// DANE CENNIKÓW (Struktura ostateczna)
// Jedno źródło danych dla połączonych tras.
// ===================================================================================
const priceListData = {
    "poreba-myslenice-biertowice": {
        // Nazwa wyświetlana w głównym kalkulatorze
        displayName: "Poręba <-> Biertowice (przez Myślenice)",
        // Uporządkowana, kompletna lista 12 przystanków
        stops: [
            "Poręba", "Trzemeśnia", "Trzemeśnia Skrzyż.", "Łęki", "Droginia",
            "Osieczany", "Myślenice D.A.", "Myślenice Górne Przedm.", "Bysina",
            "Jasienica", "Sułkowice", "Biertowice"
        ],
        // Kompletna macierz cen
        prices: [
            [0.00, 6.00, 6.00, 6.00, 6.00, 6.50, 7.00, 7.50, 7.50, 8.00, 8.50, 9.00], // Poręba
            [6.00, 0.00, 6.00, 6.00, 6.00, 6.00, 6.50, 7.00, 7.00, 7.50, 8.00, 8.50], // Trzemeśnia
            [6.00, 6.00, 0.00, 6.00, 6.00, 6.00, 6.00, 6.50, 6.50, 7.00, 7.50, 8.00], // Trzemeśnia Skrzyż.
            [6.00, 6.00, 6.00, 0.00, 6.00, 6.00, 6.00, 6.50, 6.50, 7.00, 7.50, 8.00], // Łęki
            [6.00, 6.00, 6.00, 6.00, 0.00, 6.00, 6.00, 6.50, 6.50, 7.00, 7.50, 8.00], // Droginia
            [6.50, 6.00, 6.00, 6.00, 6.00, 0.00, 6.00, 6.50, 6.50, 7.00, 7.50, 8.00], // Osieczany
            [7.00, 6.50, 6.00, 6.00, 6.00, 6.00, 0.00, 6.00, 6.00, 6.50, 7.00, 7.50], // Myślenice D.A.
            [7.50, 7.00, 6.50, 6.50, 6.50, 6.50, 6.00, 0.00, 6.00, 6.50, 7.00, 7.50], // Myślenice Górne Przedm.
            [7.50, 7.00, 6.50, 6.50, 6.50, 6.50, 6.00, 6.00, 0.00, 6.00, 6.50, 7.00], // Bysina
            [8.00, 7.50, 7.00, 7.00, 7.00, 7.00, 6.50, 6.50, 6.00, 0.00, 6.00, 6.50], // Jasienica
            [8.50, 8.00, 7.50, 7.50, 7.50, 7.50, 7.00, 7.00, 6.50, 6.00, 0.00, 6.00], // Sułkowice
            [9.00, 8.50, 8.00, 8.00, 8.00, 8.00, 7.50, 7.50, 7.00, 6.50, 6.00, 0.00]  // Biertowice
        ]
    }
    // W przyszłości możesz tu dodać cenniki dla innych tras, np. "myslenice-dobczyce": { ... }
};
