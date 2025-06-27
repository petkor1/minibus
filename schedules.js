// // ===================================================================================
// // DANE ROZKŁADÓW JAZDY
// // To jest jedyne miejsce, w którym musisz edytować rozkłady.
// //
// // INSTRUKCJA:
// // 1. Aby dodać nową trasę, skopiuj cały blok `myslenice-dobczyce: { ... }`
// //    i wklej go poniżej, zmieniając "myslenice-dobczyce" na unikalny identyfikator
// //    (np. "krakow-wieliczka") oraz aktualizując dane w środku.
// //
// // 2. Godziny odjazdów wpisuj w formacie "GG:MM" w odpowiednich tablicach
// //    (workdays, saturdays, sundays).
// //
// // 3. Upewnij się, że godziny są w cudzysłowach i oddzielone przecinkami.
// // ===================================================================================

// const schedulesData = {
//     "myslenice-dobczyce": {
//         routeName: "Myślenice &lt;–&gt; Dobczyce",
//         validFrom: "01.07.2025",
//         directions: [
//             {
//                 directionName: "Myślenice → Dobczyce",
//                 // Godziny odjazdów w dni robocze
//                 times: {
//                     workdays: [
//                         "05:30", "05:45", "06:00", "06:15", "06:30", "06:45",
//                         "07:00", "07:15", "07:30", "07:45", "08:00", "08:15",
//                         "08:30", "08:45", "09:00", "09:15", "09:45", "10:00",
//                         "10:15", "10:30", "10:45", "11:00", "11:15", "11:30",
//                         "11:45", "12:00", "12:15", "12:30", "12:45", "13:00",
//                         "13:15", "13:45", "14:00", "14:15", "14:45", "15:00",
//                         "15:15", "15:30", "15:45", "16:00", "16:15", "16:45",
//                         "17:00", "17:15", "17:30", "17:45", "18:00", "18:15",
//                         "19:00", "19:30", "20:15", "22:15"
//                     ],
//                     // Godziny odjazdów w soboty
//                     saturdays: [
//                         "05:45", "06:45", "07:45", "08:45", "09:45", "10:45",
//                         "11:45", "12:45", "13:45", "14:45", "15:45", "16:45",
//                         "17:15", "18:00", "20:00"
//                     ],
//                     // Godziny odjazdów w niedziele i święta
//                     sundays: []
//                 }
//             },
//             {
//                 directionName: "Dobczyce → Myślenice",
//                 times: {
//                     workdays: [
//                         "05:15", "05:30", "05:45", "06:15", "06:30", "06:45",
//                         "07:15", "07:30", "07:45", "08:15", "08:45", "09:15",
//                         "09:45", "10:15", "10:30", "10:45", "11:15", "11:45",
//                         "12:15", "12:45", "13:15", "13:45", "14:15", "14:45",
//                         "15:15", "15:45", "16:15", "16:45", "17:15", "17:30",
//                         "18:30", "19:30", "21:15"
//                     ],
//                     saturdays: [
//                         "05:15", "06:15", "07:15", "08:15", "09:15", "10:15",
//                         "11:15", "12:15", "13:15", "14:15", "15:15", "16:15",
//                         "17:30", "18:30", "19:30"
//                     ],
//                     sundays: [] // Pusta tablica oznacza brak kursów
//                 }
//             }
//         ]
//     },
//     "myslenice-gdowek": {
//         routeName: "Myślenice &lt;–&gt; Gdówek",
//         validFrom: "01.09.2024",
//         directions: [
//             {
//                 directionName: "Myślenice Dworzec → Gdów",
//                 times: {
//                     workdays: ["06:30", "08:30", "10:30", "12:30"],
//                     saturdays: ["07:30", "11:30", "15:30"],
//                     sundays: []
//                 }
//             },
//             {
//                 directionName: "Gdów → Myślenice Dworzec",
//                 times: {
//                     workdays: ["07:30", "09:30", "11:30", "13:30", "15:30", "17:30"],
//                     saturdays: ["08:30", "12:30", "16:30"],
//                     sundays: []
//                 }
//             }
//         ]
//     },
//     "myslenice-gdow2": {
//         routeName: "Myślenice &lt;–&gt; Gdów",
//         validFrom: "01.09.2024",
//         directions: [
//             {
//                 directionName: "Myślenice Dworzec → Gdów",
//                 times: {
//                     workdays: ["06:30", "08:30", "10:30", "12:30", "14:30", "16:30"],
//                     saturdays: ["07:30", "11:30", "15:30"],
//                     sundays: []
//                 }
//             },
//             {
//                 directionName: "Gdów → Myślenice Dworzec",
//                 times: {
//                     workdays: ["07:30", "09:30", "11:30", "13:30", "15:30", "17:30"],
//                     saturdays: ["08:30", "12:30", "16:30"],
//                     sundays: []
//                 }
//             }
//         ]
//     },
//     "myslenice-gdow3": {
//         routeName: "Myślenice &lt;–&gt; Gdów",
//         validFrom: "01.09.2024",
//         directions: [
//             {
//                 directionName: "Myślenice Dworzec → Gdów",
//                 times: {
//                     workdays: ["06:30", "08:30", "10:30", "12:30", "14:30", "16:30"],
//                     saturdays: ["07:30", "11:30", "15:30"],
//                     sundays: []
//                 }
//             },
//             {
//                 directionName: "Gdów → Myślenice Dworzec",
//                 times: {
//                     workdays: ["07:30", "09:30", "11:30", "13:30", "15:30", "17:30"],
//                     saturdays: ["08:30", "12:30", "16:30"],
//                     sundays: []
//                 }
//             }
//         ]
//     },
//     "myslenice-gdow4": {
//         routeName: "Myślenice &lt;–&gt; Gdów",
//         validFrom: "01.09.2024",
//         directions: [
//             {
//                 directionName: "Myślenice Dworzec → Gdów",
//                 times: {
//                     workdays: ["06:30", "08:30", "10:30", "12:30", "14:30", "16:30"],
//                     saturdays: ["07:30", "11:30", "15:30"],
//                     sundays: []
//                 }
//             },
//             {
//                 directionName: "Gdów → Myślenice Dworzec",
//                 times: {
//                     workdays: ["07:30", "09:30", "11:30", "13:30", "15:30", "17:30"],
//                     saturdays: ["08:30", "12:30", "16:30"],
//                     sundays: []
//                 }
//             }
//         ]
//     },
//     "myslenice-gdow5": {
//         routeName: "Myślenice &lt;–&gt; Gdów",
//         validFrom: "01.09.2024",
//         directions: [
//             {
//                 directionName: "Myślenice Dworzec → Gdów",
//                 times: {
//                     workdays: ["06:30", "08:30", "10:30", "12:30", "14:30", "16:30"],
//                     saturdays: ["07:30", "11:30", "15:30"],
//                     sundays: []
//                 }
//             },
//             {
//                 directionName: "Gdów → Myślenice Dworzec",
//                 times: {
//                     workdays: ["07:30", "09:30", "11:30", "13:30", "15:30", "17:30"],
//                     saturdays: ["08:30", "12:30", "16:30"],
//                     sundays: []
//                 }
//             }
//         ]
//     },
//     "myslenice-gdow6": {
//         routeName: "Myślenice &lt;–&gt; Gdów",
//         validFrom: "01.09.2024",
//         directions: [
//             {
//                 directionName: "Myślenice Dworzec → Gdów",
//                 times: {
//                     workdays: ["06:30", "08:30", "10:30", "12:30", "14:30", "16:30"],
//                     saturdays: ["07:30", "11:30", "15:30"],
//                     sundays: []
//                 }
//             },
//             {
//                 directionName: "Gdów → Myślenice Dworzec",
//                 times: {
//                     workdays: ["07:30", "09:30", "11:30", "13:30", "15:30", "17:30"],
//                     saturdays: ["08:30", "12:30", "16:30"],
//                     sundays: []
//                 }
//             }
//         ]
//     }
//     // Tutaj możesz dodać kolejną trasę, np. "krakow-wieliczka": { ... }
// };
const schedulesData = {
    "myslenice-dobczyce": {
        routeName: "Myślenice <–> Dobczyce",
        validFrom: "01.07.2025",
        directions: [
            {
                directionName: "Myślenice → Dobczyce",
                times: {
                    workdays: [
                        "05:30", "05:45", "06:00", "06:15", "06:30", "06:45",
                        "07:00", "07:15", "07:30", "07:45", "08:00", "08:15",
                        "08:30", "08:45", "09:00", "09:15", "09:30", "09:45",
                        "10:00", "10:15", "10:30", "10:45", "11:00", "11:15",
                        "11:30", "11:45", "12:00", "12:15", "12:30", "12:45",
                        "13:00", "13:15", "13:30", "13:45", "14:00", "14:15",
                        "14:30", "14:45", "15:00", "15:15", "15:30", "15:45",
                        "16:00", "16:15", "17:00", "17:15", "17:30", "17:45",
                        "18:00", "18:15", "18:30", "18:45", "19:00", "19:15",
                        "20:15", "22:15"
                    ],
                    saturdays: [
                        "05:45", "06:45", "07:45", "08:45", "09:45", "10:45",
                        "11:45", "12:45", "13:45", "14:45", "15:45", "16:45",
                        "17:45", "18:00", "19:00", "20:00"
                    ],
                    sundays: []
                }
            },
            {
                directionName: "Dobczyce → Myślenice",
                times: {
                    workdays: [
                        "05:15", "05:30", "05:45", "06:00", "06:15", "06:30", "06:45", "07:00",
                        "07:15", "07:30", "07:45", "08:00", "08:15", "08:30",
                        "08:45", "09:00", "09:15", "09:30", "09:45", "10:00",
                        "10:15", "10:30", "10:45", "11:00", "11:15", "11:30",
                        "11:45", "12:00", "12:15", "12:30", "12:45", "13:00",
                        "13:15", "13:30", "13:45", "14:00", "14:15", "14:30",
                        "14:45", "15:00", "15:15", "15:30", "15:45", "16:00",
                        "16:15", "16:45", "17:00", "17:15", "17:30", "18:00",
                        "18:15", "18:30", "19:00", "19:30", "21:15"
                    ],
                    saturdays: [
                        "05:15", "06:15", "06:45", "07:15", "07:45", "08:15", "08:45", "09:15", "10:15",
                        "11:15", "12:15", "13:15", "14:15", "15:15", "16:15",
                        "17:30", "18:30", "19:30"
                    ],
                    sundays: []
                }
            }
        ]
    },
    "myslenice-biertowice": {
        routeName: "Myślenice <–> Biertowice",
        validFrom: "01.07.2025",
        directions: [
            {
                directionName: "Myślenice → Biertowice",
                times: {
                    workdays: [
                        "05:35", "06:35", "07:35", "08:35", "09:35", "10:35",
                        "11:35", "12:35", "13:35", "14:35", "15:35", "16:35",
                        "17:35", "18:35", "19:05", "20:05"
                    ],
                    saturdays: [
                        "05:35", "06:35", "07:35", "08:35", "09:35", "10:35",
                        "12:05", "13:05", "14:05", "15:05", "16:05", "17:05",
                        "18:05", "19:05", "20:05"
                    ],
                    sundays: [
                        "05:35", "06:35", "07:35", "09:35", "12:05", "13:05",
                        "14:05", "16:05", "18:05"
                    ]
                }
            },
            {
                directionName: "Biertowice → Myślenice",
                times: {
                    workdays: [
                        "05:00", "05:45", "06:15", "07:45", "08:15", "09:45",
                        "10:45", "11:45", "12:45", "13:45", "14:45", "15:45",
                        "16:45", "17:45", "18:45", "19:45", "20:45"
                    ],
                    saturdays: [
                        "05:00", "06:15", "07:15", "08:15", "09:15", "10:15",
                        "11:45", "12:45", "13:45", "14:45", "15:45", "16:45",
                        "17:45", "18:45", "19:45", "20:45"
                    ],
                    sundays: [
                        "06:15", "07:15", "08:15", "09:45", "10:45", "11:45",
                        "12:45", "13:45", "14:45", "15:45", "16:45", "17:45",
                        "18:45"
                    ]
                }
            }
        ]
    },
    "gdow-dobczyce": {
        routeName: "Gdów <–> Dobczyce",
        validFrom: "01.07.2025",
        directions: [
            {
                directionName: "Gdów → Dobczyce",
                times: {
                    workdays: [
                        "05:30", "06:30", "07:30", "08:30", "09:30", "10:30",
                        "11:30", "12:30", "13:30", "14:30", "15:00", "16:00",
                        "17:00", "18:00", "19:00"
                    ],
                    saturdays: [
                        "07:30", "08:30", "09:30", "10:30", "12:30", "14:30",
                        "16:30"
                    ],
                    sundays: []
                }
            },
            {
                directionName: "Dobczyce → Gdów",
                times: {
                    workdays: [
                        "06:35", "07:05", "08:35", "09:35", "10:35", "11:05",
                        "12:35", "13:35", "14:05", "15:35", "16:35", "17:35",
                        "18:35", "19:35"
                    ],
                    saturdays: [
                        "07:05", "08:05", "09:05", "10:05", "12:05", "14:05",
                        "16:05"
                    ],
                    sundays: []
                }
            }
        ]
    },
    "myslenice-krzywaczka": {
        routeName: "Myślenice <–> Krzyszkowice",
        validFrom: "01.07.2025",
        directions: [
            {
                directionName: "Myślenice → Krzyszkowice",
                times: {
                    workdays: [
                        "05:00", "06:55", "08:30", "10:00", "12:00", "13:30",
                        "14:30", "15:30", "17:15", "18:15", "19:30"
                    ],
                    saturdays: [],
                    sundays: []
                },
                notes: "s - kursuje w dni szkolne"
            },
            {
                directionName: "Krzyszkowice → Myślenice",
                times: {
                    workdays: [
                        "05:22", "06:22", "07:17", "08:52", "10:22", "12:22",
                        "13:52", "14:52", "15:52", "17:37", "18:37", "19:00"
                    ],
                    saturdays: [],
                    sundays: []
                },
                notes: "s - kursuje w dni szkolne"
            }
        ]
    },
    "myslenice-gdow": {
        routeName: "Myślenice <–> Gdów",
        validFrom: "01.07.2025",
        directions: [
            {
                directionName: "Myślenice → Gdów",
                times: {
                    workdays: [
                        "06:15", "06:45", "07:45", "10:15", "11:45", "12:15",
                        "13:15", "15:15", "18:15"
                    ],
                    saturdays: [
                        "06:45", "09:45", "13:45"
                    ],
                    sundays: []
                }
            },
            {
                directionName: "Gdów → Myślenice",
                times: {
                    workdays: [
                        "05:30", "07:00", "08:30", "11:00", "12:30", "13:00",
                        "14:30", "16:00", "19:00"
                    ],
                    saturdays: [
                        "07:30", "10:30", "14:30"
                    ],
                    sundays: [
                        "07:00", "08:30", "12:30", "14:30"
                    ]
                },
                notes: "D - kurs do Dobczyc"
            }
        ]
    },
    "myslenice-poreba": {
        routeName: "Myślenice <–> Poręba",
        validFrom: "01.07.2025",
        directions: [
            {
                directionName: "Myślenice → Poręba",
                times: {
                    workdays: [
                        "05:30", "06:45", "07:45", "08:45", "09:45", "11:45",
                        "12:45", "13:45", "14:45", "15:45", "16:45", "17:45",
                        "18:45", "19:15", "20:15", "21:15", "22:15"
                    ],
                    saturdays: [
                        "05:30", "06:45", "07:45", "08:45", "09:45", "12:15",
                        "13:15", "14:15", "15:15", "16:15", "17:15", "18:15",
                        "19:15", "20:15", "21:15"
                    ],
                    sundays: [
                        "05:15", "06:45", "07:45", "08:45", "09:45", "11:15",
                        "12:15", "13:15", "14:15", "15:15", "16:15", "17:15",
                        "18:15", "19:15", "20:15"
                    ]
                },
                notes: "s - kursuje w dni szkolne, g - kursuje do Górnej Poręby"
            },
            {
                directionName: "Poręba → Myślenice",
                times: {
                    workdays: [
                        "05:15", "05:45", "06:45", "07:45", "08:45", "09:45",
                        "10:45", "11:45", "12:45", "13:45", "14:45", "15:45",
                        "16:45", "17:45", "18:45", "19:45", "20:45", "21:35"
                    ],
                    saturdays: [
                        "05:45", "06:15", "07:15", "08:15", "09:15", "10:15",
                        "11:15", "12:15", "13:15", "14:15", "15:15", "16:15",
                        "17:15", "18:15", "19:15", "20:15"
                    ],
                    sundays: [
                        "05:15", "06:15", "07:15", "08:15", "09:15", "10:45",
                        "11:45", "12:45", "13:45", "14:45", "15:45", "16:45",
                        "17:45", "18:45", "19:45", "20:45"
                    ]
                },
                notes: "s - kursuje w dni szkolne, g - kursuje do Górnej Poręby"
            }
        ]
    },
    "myslenice-jasienica": {
        routeName: "Myślenice <–> Jasienica",
        validFrom: "01.07.2025",
        directions: [
            {
                directionName: "Myślenice → Jasienica",
                times: {
                    workdays: [
                        "05:35", "06:35", "07:35", "08:35", "09:35", "10:35",
                        "11:35", "12:35", "13:35", "14:35", "15:35", "16:35",
                        "17:35", "18:05", "19:05", "20:05", "21:15"
                    ],
                    saturdays: [
                        "05:35", "06:35", "07:35", "08:35", "09:35", "10:35",
                        "11:05", "12:05", "13:05", "14:05", "15:05", "16:05",
                        "17:05", "18:05", "19:05", "20:05", "21:15"
                    ],
                    sundays: [
                        "05:35", "06:35", "07:35", "08:35", "09:35", "10:35",
                        "11:05", "12:05", "13:05", "14:05", "15:05", "16:05"
                    ]
                }
            },
            {
                directionName: "Jasienica → Myślenice",
                times: {
                    workdays: [
                        "05:12", "06:27", "07:27", "08:27", "09:27", "10:57",
                        "11:57", "12:57", "13:57", "14:57", "15:57", "16:57",
                        "17:57", "18:57", "19:57", "20:57"
                    ],
                    saturdays: [
                        "05:12", "06:27", "07:27", "08:27", "09:27", "10:57",
                        "11:57", "12:57", "13:57", "14:57", "15:57", "16:57",
                        "17:57", "18:57", "19:57", "20:57"
                    ],
                    sundays: [
                        "05:12", "06:27", "07:27", "08:27", "09:27", "10:57",
                        "11:57", "12:57", "13:57", "14:57", "15:57", "16:57"
                    ]
                }
            }
        ]
    },
    "bienkowice-sierakow-dobczyce-skrzynka-kedzierzynka": {
        routeName: "Bieńkowice - Sieraków - Dobczyce - Skrzynka - Kędzierzynka",
        validFrom: "01.07.2025",
        directions: [
            {
                directionName: "Bieńkowice → Dobczyce",
                times: {
                    workdays: [
                        "06:05", "07:15", "09:05", "11:30", "13:00", "14:10",
                        "15:40"
                    ],
                    saturdays: [
                        "07:15", "09:05", "11:30", "13:00"
                    ],
                    sundays: []
                },
                notes: "f- kursuje w dni robocze, s- kursuje w sobotę"
            },
            {
                directionName: "Dobczyce → Kędzierzynka",
                times: {
                    workdays: [
                        "06:25", "07:35", "09:25", "11:50", "13:20", "14:30",
                        "16:00"
                    ],
                    saturdays: [
                        "07:35", "09:25", "11:50", "13:20"
                    ],
                    sundays: []
                },
                notes: "f- kursuje w dni robocze, s- kursuje w sobotę"
            },
            {
                directionName: "Kędzierzynka → Dobczyce",
                times: {
                    workdays: [
                        "06:40", "08:10", "10:10", "12:05", "13:35", "14:50",
                        "16:20"
                    ],
                    saturdays: [
                        "08:10", "10:10", "12:05", "13:35"
                    ],
                    sundays: []
                },
                notes: "f- kursuje w dni robocze, s- kursuje w sobotę"
            },
            {
                directionName: "Dobczyce → Bieńkowice",
                times: {
                    workdays: [
                        "06:52", "08:22", "10:22", "12:17", "13:47", "15:02",
                        "16:32"
                    ],
                    saturdays: [
                        "08:22", "10:22", "12:17", "13:47"
                    ],
                    sundays: []
                },
                notes: "f- kursuje w dni robocze, s- kursuje w sobotę"
            }
        ]
    }
};