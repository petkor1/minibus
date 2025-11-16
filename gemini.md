# **Project Documentation: Minibus Application (v2)**

Ten dokument (gemini.md) to Twój główny przewodnik ("system prompt") podczas pracy nad aplikacją Minibus. Określa on cele projektu, standardy oraz, co najważniejsze, **wymagany przepływ pracy**.

## **1. Główny Przepływ Pracy (Development Vibe)**

To jest najważniejsza sekcja, która opisuje **jedyny akceptowalny sposób pracy** nad projektem. Proces ten łączy w sobie strategię gałęzi Git (Git Branching) z podejściem Test-Driven Development (TDD), aby zapewnić maksymalną stabilność i kontrolę. **Agent (Ty) jest w pełni odpowiedzialny za realizację tego procesu.**

### **Krok 1: Utworzenie Gałęzi Roboczej (Branch)**

*   **Żadnych zmian w `main`:** Gałąź `main` jest gałęzią chronioną i musi zawsze zawierać stabilną, działającą wersję aplikacji.
*   **Nowe zadanie = nowa gałąź:** Każdą pracę nad nową funkcją, poprawką błędu lub refaktoryzacją rozpoczynasz od utworzenia dedykowanej gałęzi z aktualnej wersji `main`.
*   **Nazewnictwo gałęzi:** Używaj prefiksów `feature/`, `fix/`, `refactor/` itd., np. `feature/user-authentication` lub `fix/price-calculation-error`.

### **Krok 2: Zrozumienie Wymagań**

Na nowo utworzonej gałęzi, przeanalizuj kryteria akceptacji (AC) i dostarczone scenariusze testowe. Jeśli scenariusze są niejasne lub niewystarczające, poproś o ich doprecyzowanie.

### **Krok 3: Pisanie Testów (Test-First - Cykl "Red")**

To jest Twój **pierwszy faktyczny krok kodowania**. Zanim napiszesz jakikolwiek kod implementacyjny, utwórz odpowiednie, **niedziałające** testy w odpowiednim katalogu modułu.

*   **Testy Backendu (API Routes):** Użyj Jest. Przetestuj logikę biznesową, walidację, błędy (4xx, 5xx) i poprawne odpowiedzi (2xx).
*   **Testy Frontendu (React):** Użyj React Testing Library (RTL). Testuj interakcje użytkownika i renderowanie warunkowe.

### **Krok 4: Implementacja Kodu (Cykl "Green")**

Napisz **minimalną** ilość kodu wymaganą do tego, aby testy napisane w Kroku 3 **zakończyły się powodzeniem**.

### **Krok 5: Refaktoryzacja i Commit (Cykl "Refactor")**

Gdy testy przejdą pomyślnie, dokonaj refaktoryzacji kodu, upewniając się, że jest zgodny z wymaganiami jakościowymi (Sekcja 3) i architekturą modułową (Sekcja 4). Po zakończeniu tego etapu:
*   **Weryfikacja końcowa:** Uruchom **wszystkie** testy w projekcie (`npx jest`), aby upewnić się, że Twoje zmiany nie zepsuły istniejących funkcjonalności.
*   **Commit:** Zatwierdź zmiany za pomocą `git add .` i `git commit`, stosując zasady nazewnictwa commitów (Sekcja 6.1).

### **Krok 6: Zakończenie Pracy na Gałęzi**

Po wykonaniu wszystkich commitów w ramach zadania, poinformuj o gotowości gałęzi do przeglądu i scalenia.

![Obraz: a Test-Driven Development (TDD) cycle diagram showing Red-Green-Refactor steps][image1]

Shutterstock

## **2. Cel Biznesowy i Przegląd Projektu (Business Goal & Project Overview)**

### **2.1. Wartość Biznesowa i Użytkownicy Docelowi (Business Value & Target Users)**

**Główny Cel Biznesowy:** Usprawnienie komunikacji między operatorem minibusów a pasażerami poprzez dostarczenie jednego, zawsze aktualnego źródła informacji. Ma to na celu:

1.  Zmniejszenie liczby zapytań telefonicznych do biura.
2.  Zwiększenie satysfakcji i lojalności klientów.
3.  Ułatwienie administracji treścią dla operatora.

**Użytkownicy Docelowi:**

1.  **Użytkownik Publiczny (Pasażer):** Potrzebuje szybkiego, łatwego dostępu do aktualnych rozkładów jazdy, cenników i ogłoszeń (krytyczna jest optymalizacja mobilna).
2.  **Administrator (Operator/Pracownik Biura):** Potrzebuje prostego i bezpiecznego interfejsu do zarządzania treścią (CRUD) bez konieczności edycji bazy danych.

### **2.2. Przegląd Aplikacji (Application Overview)**

Aplikacja Minibus to platforma internetowa do zarządzania i wyświetlania informacji związanych z usługami minibusowymi. Jej głównym celem jest dostarczanie użytkownikom aktualnych rozkładów jazdy, cenników i ważnych ogłoszeń, jednocześnie oferując interfejs administracyjny do łatwego zarządzania treścią.

## **3. Wymagania Jakościowe (NFR)**

Kod musi nie tylko działać, ale także spełniać poniższe standardy.

### **3.1. Bezpieczeństwo (Krytyczne)**

*   **Walidacja Danych Wejściowych:** **Zawsze** waliduj wszystkie dane przychodzące od użytkownika (z formularzy, parametrów URL) zarówno po stronie klienta (dla UX), jak i **po stronie serwera (dla bezpieczeństwa)**.
*   **Ochrona przed SQL Injection:** **Nigdy** nie twórz zapytań SQL przez konkatenację stringów. **Zawsze** używaj zapytań parametryzowanych (np. db.run("INSERT...", ?, ?)) dostarczanych przez bibliotekę sqlite.
*   **Autoryzacja:** Wszystkie endpointy API związane z administracją (POST, PUT, DELETE) muszą być chronione i dostępne tylko dla uwierzytelnionych administratorów.
*   **Ochrona przed XSS:** React domyślnie chroni przed XSS, ale unikaj używania dangerouslySetInnerHTML.
*   **Logowanie Danych Wrażliwych:** **Nigdy** nie loguj haseł, tokenów API ani danych osobowych (PII) w czystym tekście.

### **3.2. Wydajność i Optymalizacja**

*   **Aplikacja (Next.js):**
    *   Używaj komponentu next/image do optymalizacji obrazów.
    *   Stosuj React.lazy lub dynamiczne importy (next/dynamic) dla ciężkich komponentów, które nie są potrzebne od razu.
    *   Wybieraj odpowiednią strategię renderowania (SSR, SSG, ISR) dla każdej strony.
*   **Baza Danych (SQLite):**
    *   **Indeksowanie:** Upewnij się, że kolumny używane w klauzulach WHERE lub JOIN (np. date, route_id) mają założone INDEX.
    *   **Unikanie N+1:** Nie wykonuj zapytań do bazy danych wewnątrz pętli. Pobierz potrzebne dane za jednym razem.
    *   **Optymalizacja Zapytań:** Używaj EXPLAIN QUERY PLAN do analizy skomplikowanych zapytań.

### **3.3. Monitorowanie i Logowanie (Obserwowalność)**

Aplikacja musi być "przezroczysta" pod kątem swojego działania.

*   **Poziomy Logowania:** Używaj semantycznie console.error(), console.warn(), console.info().
*   **Co Logować:**
    *   ERROR: Wszystkie nieobsłużone wyjątki, błędy walidacji po stronie serwera, błędy połączenia z bazą danych. Dołącz ślad stosu (stack trace).
    *   WARN: Próby dostępu do chronionych zasobów bez uprawnień, nieudane logowania.
    *   INFO: Kluczowe zdarzenia biznesowe (np. "Administrator X dodał nowy cennik", "Uruchomiono serwer").
*   **Format:** Preferuj logi strukturalne (JSON), np. console.info(JSON.stringify({ level: 'info', timestamp: new Date().toISOString(), message: 'User logged in', userId: '...' }));

## **4. Design Principles**

*   **Architektura Modułowa (Kluczowa Zasada):** Aplikacja **musi** być budowana jako zbiór niezależnych modułów biznesowych (np. "Ogłoszenia", "Cenniki", "Rozkłady Jazdy").
    *   **Niskie Powiązanie (Low Coupling):** Moduły nie powinny być od siebie silnie zależne. Zmiana w module "Ogłoszenia" nie powinna pociągać za sobą konieczności zmian w module "Cenniki".
    *   **Wysoka Spójność (High Cohesion):** Wszystkie pliki w ramach jednego modułu (komponenty, trasy API, testy, typy) powinny służyć jednemu, konkretnemu celowi biznesowemu.
    *   **Współdzielony Rdzeń (Shared Core):** Wspólne elementy (np. design system, komponenty shadcn/ui, konfiguracja DB, funkcje autoryzacji) powinny znajdować się w osobnym, dedykowanym katalogu (np. src/core lub src/shared).
*   **Maintainability:** Kod musi być czysty, dobrze zorganizowany i łatwy do modyfikacji (zgodny z zasadami z Sekcji 1, 3 i 4).
*   **User Experience (UX):** Aplikacja ma być intuicyjna i przyjazna dla użytkownika.
*   **Performance:** Aplikacja musi być szybka i responsywna.
*   **Security:** Bezpieczeństwo jest wbudowane, a nie dodawane na końcu.

## **5. Technologies & Dependencies**

*   **Framework:** Next.js (React framework)
*   **Język:** TypeScript
*   **Styling:** Tailwind CSS
*   **UI Components:** **Shadcn/ui**
*   **Baza Danych:** SQLite (zarządzana przez sqlite i sqlite3)
*   **Testowanie:** Jest, React Testing Library
*   **Package Manager:** npm

## **6. Coding Style & Conventions**

*   **Struktura Katalogów (Architektura Modułowa):**

    *   **Główna Zasada:** Zamiast grupować pliki według _typu_ (np. /components, /pages/api), grupuj je według _funkcjonalności/modułu_.
    *   **Preferowana Struktura:**  
        /src  
         /modules  
         /announcements  
         /components/AnnouncementList.tsx  
         /lib/api.ts (logika serwerowa, np. funkcje bazy danych)  
         /types.ts (typy specyficzne dla modułu)  
         /tests/api.test.ts (testy dla logiki modułu)  
         /pricelists  
         /components/PriceTable.tsx  
         /lib/api.ts  
         /types.ts  
         /core (lub /shared)  
         /components/ui/ (komponenty shadcn, np. Button.tsx, Card.tsx)  
         /lib/db.ts (instancja i połączenie z bazą)  
         /utils/ (globalne funkcje pomocnicze)  
         /pages  
         /api  
         /announcements.ts (chudy" endpoint, importuje logikę z `modules/announcements/lib/api.ts`)
         /ogloszenia.tsx (strona, importuje `modules/announcements/components/AnnouncementList.tsx`)

    *   **Strony (Pages):** Pliki w /pages (zarówno frontendowe, jak i API) powinny być tak "chude" (thin) jak to możliwe. Powinny jedynie obsługiwać żądanie/widok i delegować całą logikę biznesową do odpowiednich modułów (src/modules/...). 

*   **Formatowanie:** Prettier (automatyczne formatowanie).
*   **Nazewnictwo:** 
    *   Komponenty: PascalCase (np. AnnouncementsManager).
    *   Funkcje/Zmienne: camelCase (np. handleDelete).
    *   Pliki API: kebab-case (w pages/api).
*   **TypeScript:** Preferowane silne typowanie. Unikaj any.
*   **Functional Components:** Standardem są komponenty funkcyjne z Hookami.
*   **Komponenty UI (Shadcn/ui):**
    *   **Preferuj Shadcn/ui:** Zawsze, gdy to możliwe, używaj gotowych komponentów z shadcn/ui (znajdujących się w src/core/components/ui) zamiast tworzyć własne, podstawowe elementy UI od zera.
    *   **Cel:** Zapewnienie spójności wizualnej (UX) i przyspieszenie rozwoju.
    - **Dostosowywanie:** Komponenty shadcn/ui są budowane na Tailwind CSS – dostosuj je, dodając klasy Tailwind zgodnie z potrzebami projektu.

### **6.1. Zarządzanie Wersjami i Commity (Git)**

Agent (Ty) jest w pełni odpowiedzialny za zarządzanie kontrolą wersji.

*   **Strategia Gałęzi:** Wszystkie prace deweloperskie muszą odbywać się na dedykowanych gałęziach (patrz Sekcja 1). Gałąź `main` jest nietykalna.
*   **Konwencja Commitów (Conventional Commits):** Wszystkie commity **muszą** być zgodne ze specyfikacją Conventional Commits. Zapewnia to czytelność i automatyzację.
    *   **Format:** `<typ>(<zakres>): <opis>`
    *   **Przykłady:**
        *   `feat(auth): implement user login endpoint`
        *   `fix(schedule): prevent crash on empty route data`
        *   `docs(readme): update setup instructions`
        *   `refactor(api): simplify database query logic`
        *   `test(announcements): add tests for announcement creation`
    *   **Główne typy:** `feat` (nowa funkcja), `fix` (poprawka błędu), `docs` (zmiany w dokumentacji), `style` (zmiany w formatowaniu), `refactor` (refaktoryzacja kodu), `test` (dodanie lub poprawa testów), `chore` (zmiany w budowie, narzędziach).
*   **Push po Commicie:** Po każdym commicie, zmiany muszą być natychmiast wysłane na zdalne repozytorium (`git push`).

## **7. Testing Strategy**

*   **Unit Tests (Jest):** Do testowania czystej logiki (funkcje pomocnicze w modules/.../lib lub core/utils).
*   **Component Tests (RTL):** Do testowania komponentów React (w modules/.../components).
*   **API Tests (Jest):** Do testowania logiki biznesowej API (w modules/.../tests).
*   **Główna zasada:** Strategia testowania jest fundamentem dla **Głównego Przepływu Pracy (Sekcja 1)**.

## **8. Agent Tooling Guidelines**

### **Preferowany przepływ pracy z narzędziami:**

1.  **Utworzenie Gałęzi:** `run_shell_command` (`git checkout -b feature/nazwa-zadania`)
2.  **Pisanie Testu:** `write_file` (Tworzenie pliku `*.test.ts` w katalogu modułu).
3.  **Weryfikacja Błędów (Red):** `run_shell_command` (`npx jest sciezka/do/testu.test.ts`), aby zobaczyć, że test nie przechodzi.
4.  **Implementacja:** `write_file` / `replace` (Pisanie kodu funkcjonalności w odpowiednich plikach modułu).
5.  **Weryfikacja Poprawności (Green):** `run_shell_command` (`npx jest`), aby zobaczyć, że wszystkie testy przechodzą.
6.  **Zatwierdzenie Zmian (Commit & Push):**
    *   `run_shell_command` (`git add .`)
    *   `run_shell_command` (`git commit -m "typ(zakres): opis"`)
    *   `run_shell_command` (`git push`)

### **Narzędzia używane z ostrożnością:**

*   replace: **Używaj z najwyższą ostrożnością.** Wymaga _dokładnego_ dopasowania old_string. **Zawsze** użyj read_file, aby skopiować _dokładny_ ciąg znaków (wraz z wcięciami i białymi znakami) przed użyciem replace. Preferuj mniejsze, celowe operacje replace.
*   **Zasada 3 prób:** Jeśli nie możesz rozwiązać tego samego problemu więcej niż 3-krotnie, zapytaj użytkownika, czy kontynuować próby naprawy.
*   **Pytaj w razie wątpliwości:** Jeśli masz jakiekolwiek wątpliwości co do wymagań lub sposobu implementacji, zapytaj użytkownika, zanim zaczniesz kodować.

## **9. Deployment/Build Process**

*   npm run dev: Rozwój lokalny.
*   npm run build: Budowanie produkcyjne.
*   npm start: Uruchomienie serwera produkcyjnego.

## **10. Database Management (SQLite)**

*   **Lokalizacja pliku:** (Należy określić, np. /db/minibus.db)
*   **Migracje:** (Należy określić strategię, np. ręczne skrypty SQL lub prosty system migracji).
*   **Zasada:** Wszelkie zmiany schematu muszą być odzwierciedlone w kodzie i, jeśli to możliwe, w skryptach migracyjnych.

## 11. Plan Działania (Action Plan)

Stan na: 2025-11-16

### Faza 0: Inicjalizacja Projektu (Setup)
- [x] Utworzenie nowej aplikacji Next.js z TypeScript (`/app`).
- [x] Konfiguracja Tailwind CSS i Shadcn/ui.
- [x] Instalacja zależności bazy danych (`sqlite`, `sqlite3`).
- [x] Stworzenie podstawowej struktury katalogów (`src/core`, `src/modules`).

### Faza 1: Rdzeń Aplikacji - Baza Danych i Panel Administratora (Moduł Ogłoszeń)
- [ ] **Model Danych i Baza Danych:**
    - [x] Zdefiniowanie schematu i utworzenie pliku bazy danych SQLite.
    - [x] Implementacja logiki połączenia z bazą w `src/core/lib/db.ts`.
- [ ] **Implementacja Modułu `announcements` (TDD):**
    - [x] Utworzenie gałęzi `feature/announcements-crud`.
    - [x] Pisanie testów API (Jest) dla operacji CRUD.
    - [x] Implementacja logiki API w `src/modules/announcements/lib/api.ts`.
    - [x] Pisanie testów UI (RTL) dla komponentu do zarządzania ogłoszeniami.
    - [x] Budowa komponentu UI w `src/modules/announcements/components/`.
    - [x] Refaktoryzacja i commit.

### Faza 2: Rozbudowa Panelu Administratora
- [ ] **Implementacja Modułu `pricelists` (TDD):**
    - [x] Utworzenie gałęzi `feature/pricelists-crud`.
    - [x] Zdefiniowanie schematu bazy danych dla cenników.
    - [x] Pisanie testów API (Jest) dla operacji CRUD na cennikach.
    - [x] Implementacja logiki API w `src/modules/pricelists/lib/api.ts`.
    - [x] Pisanie testów UI (RTL) dla komponentu do zarządzania cennikami.
    - [x] Budowa komponentu UI w `src/modules/pricelists/components/`.
    - [x] Refaktoryzacja i commit.
- [ ] **Implementacja Modułu `schedules` (TDD):**
    - [ ] Utworzenie gałęzi `feature/schedules-crud`.
    - [ ] Zdefiniowanie schematu bazy danych dla rozkładów jazdy.
    - [ ] Pisanie testów API (Jest) dla operacji CRUD na rozkładach jazdy.
    - [ ] Implementacja logiki API w `src/modules/schedules/lib/api.ts`.
    - [ ] Pisanie testów UI (RTL) dla komponentu do zarządzania rozkładami jazdy.
    - [ ] Budowa komponentu UI w `src/modules/schedules/components/`.
    - [ ] Refaktoryzacja i commit.

### Faza 3: Aplikacja Publiczna (dla Pasażerów)
- [ ] Stworzenie strony głównej wyświetlającej ogłoszenia.
- [ ] Stworzenie strony z cennikiem.
- [ ] Stworzenie stron z rozkładami jazdy.