// ===================================================================================
// DANE ROZKŁADÓW JAZDY
// To jest jedyne miejsce, w którym musisz edytować rozkłady.
//
// INSTRUKCJA:
// 1. Aby dodać nową trasę, skopiuj cały blok `myslenice-dobczyce: { ... }`
//    i wklej go poniżej, zmieniając "myslenice-dobczyce" na unikalny identyfikator
//    (np. "krakow-wieliczka") oraz aktualizując dane w środku.
//
// 2. Godziny odjazdów wpisuj w formacie "GG:MM" w odpowiednich tablicach
//    (workdays, saturdays, sundays).
//
// 3. Upewnij się, że godziny są w cudzysłowach i oddzielone przecinkami.
// ===================================================================================

const schedulesData = {
    "myslenice-dobczyce": {
        routeName: "Myślenice &lt;–&gt; Dobczyce",
        validFrom: "01.07.2025",
        directions: [
            {
                directionName: "Myślenice Dworzec → Dobczyce",
                // Godziny odjazdów w dni robocze
                times: {
                    workdays: [
                        "05:30", "05:45", "06:00", "06:15", "06:30", "06:45",
                        "07:00", "07:15", "07:30", "07:45", "08:00", "08:15",
                        "08:30", "08:45", "09:00", "09:15", "09:45", "10:00",
                        "10:15", "10:30", "10:45", "11:00", "11:15", "11:30",
                        "11:45", "12:00", "12:15", "12:30", "12:45", "13:00",
                        "13:15", "13:45", "14:00", "14:15", "14:45", "15:00",
                        "15:15", "15:30", "15:45", "16:00", "16:15", "16:45",
                        "17:00", "17:15", "17:30", "17:45", "18:00", "18:15",
                        "19:00", "19:30", "20:15", "22:15"
                    ],
                    // Godziny odjazdów w soboty
                    saturdays: [
                        "05:45", "06:45", "07:45", "08:45", "09:45", "10:45",
                        "11:45", "12:45", "13:45", "14:45", "15:45", "16:45",
                        "17:15", "18:00", "20:00"
                    ],
                    // Godziny odjazdów w niedziele i święta
                    sundays: []
                }
            },
            {
                directionName: "Dobczyce → Myślenice Dworzec",
                times: {
                    workdays: [
                        "05:15", "05:30", "05:45", "06:15", "06:30", "06:45",
                        "07:15", "07:30", "07:45", "08:15", "08:45", "09:15",
                        "09:45", "10:15", "10:30", "10:45", "11:15", "11:45",
                        "12:15", "12:45", "13:15", "13:45", "14:15", "14:45",
                        "15:15", "15:45", "16:15", "16:45", "17:15", "17:30",
                        "18:30", "19:30", "21:15"
                    ],
                    saturdays: [
                        "05:15", "06:15", "07:15", "08:15", "09:15", "10:15",
                        "11:15", "12:15", "13:15", "14:15", "15:15", "16:15",
                        "17:30", "18:30", "19:30"
                    ],
                    sundays: [] // Pusta tablica oznacza brak kursów
                }
            }
        ]
    },
    "myslenice-gdow1": {
        routeName: "Myślenice &lt;–&gt; Gdów",
        validFrom: "01.09.2024",
        directions: [
            {
                directionName: "Myślenice Dworzec → Gdów",
                times: {
                    workdays: ["06:30", "08:30", "10:30", "12:30", "14:30", "16:30"],
                    saturdays: ["07:30", "11:30", "15:30"],
                    sundays: []
                }
            },
            {
                directionName: "Gdów → Myślenice Dworzec",
                times: {
                    workdays: ["07:30", "09:30", "11:30", "13:30", "15:30", "17:30"],
                    saturdays: ["08:30", "12:30", "16:30"],
                    sundays: []
                }
            }
        ]
    },
    "myslenice-gdow2": {
        routeName: "Myślenice &lt;–&gt; Gdów",
        validFrom: "01.09.2024",
        directions: [
            {
                directionName: "Myślenice Dworzec → Gdów",
                times: {
                    workdays: ["06:30", "08:30", "10:30", "12:30", "14:30", "16:30"],
                    saturdays: ["07:30", "11:30", "15:30"],
                    sundays: []
                }
            },
            {
                directionName: "Gdów → Myślenice Dworzec",
                times: {
                    workdays: ["07:30", "09:30", "11:30", "13:30", "15:30", "17:30"],
                    saturdays: ["08:30", "12:30", "16:30"],
                    sundays: []
                }
            }
        ]
    },
    "myslenice-gdow3": {
        routeName: "Myślenice &lt;–&gt; Gdów",
        validFrom: "01.09.2024",
        directions: [
            {
                directionName: "Myślenice Dworzec → Gdów",
                times: {
                    workdays: ["06:30", "08:30", "10:30", "12:30", "14:30", "16:30"],
                    saturdays: ["07:30", "11:30", "15:30"],
                    sundays: []
                }
            },
            {
                directionName: "Gdów → Myślenice Dworzec",
                times: {
                    workdays: ["07:30", "09:30", "11:30", "13:30", "15:30", "17:30"],
                    saturdays: ["08:30", "12:30", "16:30"],
                    sundays: []
                }
            }
        ]
    },
    "myslenice-gdow4": {
        routeName: "Myślenice &lt;–&gt; Gdów",
        validFrom: "01.09.2024",
        directions: [
            {
                directionName: "Myślenice Dworzec → Gdów",
                times: {
                    workdays: ["06:30", "08:30", "10:30", "12:30", "14:30", "16:30"],
                    saturdays: ["07:30", "11:30", "15:30"],
                    sundays: []
                }
            },
            {
                directionName: "Gdów → Myślenice Dworzec",
                times: {
                    workdays: ["07:30", "09:30", "11:30", "13:30", "15:30", "17:30"],
                    saturdays: ["08:30", "12:30", "16:30"],
                    sundays: []
                }
            }
        ]
    },
    "myslenice-gdow5": {
        routeName: "Myślenice &lt;–&gt; Gdów",
        validFrom: "01.09.2024",
        directions: [
            {
                directionName: "Myślenice Dworzec → Gdów",
                times: {
                    workdays: ["06:30", "08:30", "10:30", "12:30", "14:30", "16:30"],
                    saturdays: ["07:30", "11:30", "15:30"],
                    sundays: []
                }
            },
            {
                directionName: "Gdów → Myślenice Dworzec",
                times: {
                    workdays: ["07:30", "09:30", "11:30", "13:30", "15:30", "17:30"],
                    saturdays: ["08:30", "12:30", "16:30"],
                    sundays: []
                }
            }
        ]
    },
    "myslenice-gdow6": {
        routeName: "Myślenice &lt;–&gt; Gdów",
        validFrom: "01.09.2024",
        directions: [
            {
                directionName: "Myślenice Dworzec → Gdów",
                times: {
                    workdays: ["06:30", "08:30", "10:30", "12:30", "14:30", "16:30"],
                    saturdays: ["07:30", "11:30", "15:30"],
                    sundays: []
                }
            },
            {
                directionName: "Gdów → Myślenice Dworzec",
                times: {
                    workdays: ["07:30", "09:30", "11:30", "13:30", "15:30", "17:30"],
                    saturdays: ["08:30", "12:30", "16:30"],
                    sundays: []
                }
            }
        ]
    }
    // Tutaj możesz dodać kolejną trasę, np. "krakow-wieliczka": { ... }
};
