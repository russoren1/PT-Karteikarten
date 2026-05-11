# System-Architektur: PT Karteikarten

## Überblick

PT Karteikarten ist eine webbasierte Karteikarten-App für Studierende. Der Fokus liegt auf der Verknüpfung von Lernkarten mit dem Vorlesungskontext (Semesterwoche, Folie/Seite, Quelldatei). Screenshots aus OneNote oder Vorlesungsfolien können direkt mit einer Karte verknüpft werden.

```
Browser
  │
  ▼
SvelteKit (Netlify)
  ├── Auth-Check (hooks.server.js → Supabase Auth)
  ├── Seiten & Formulare (Bootstrap 5)
  ├── Inhaltsdaten (MongoDB Atlas)
  └── Bild-Uploads (Supabase Storage)
```

---

## Technologie-Stack

| Schicht | Technologie | Zweck |
|---------|-------------|-------|
| Frontend | SvelteKit 2 / Svelte 5 | UI, Routing, Server-Side Rendering |
| Styling | Bootstrap 5.3 (CDN) | Navbar, Cards, Forms, Buttons |
| Authentifizierung | Supabase Auth | Login, Registrierung, Session-Management |
| Datei-Storage | Supabase Storage | Bild-Uploads pro Karteikarte |
| Datenbank | MongoDB Atlas | Karteikarten, Stapel, Lernstatus |
| Deployment | Netlify (adapter-netlify) | Hosting, SSR via Serverless Functions |

---

## Datenbank: MongoDB Atlas

**Collection:** `Karteikarten` (eine Collection für alle Dokumente, unterschieden via `type`-Feld)

### Deck-Dokument

```js
{
  _id: ObjectId,
  type: "deck",
  deckSlug: "strategisches-management",   // URL-sicherer Bezeichner
  deckTitle: "Strategisches Management",
  semester: "HS24",
  userId: "uuid-aus-supabase",             // Supabase Auth User ID (optional bei Altdaten)
  createdAt: Date,
  updatedAt: Date
}
```

### Card-Dokument

```js
{
  _id: ObjectId,
  type: "card",
  question: "Was sind Nachteile von Diversifikationen?",
  answer: "Probleme und Kosten der Synergieerschliessung...",
  deckSlug: "strategisches-management",
  deckTitle: "Strategisches Management",
  semester: "HS24",
  week: 10,                              // Semesterwoche der Vorlesung
  slide: 74,                             // Folien- oder Seitennummer
  sourceName: "Vorlesung 10.pdf",        // Quelldatei (optional)
  imageUrl: "https://...supabase.co/...", // Bild-URL aus Supabase Storage (optional)
  status: "new" | "known" | "repeat",
  leitnerBox: 1–5,                       // Leitner-Box (Spaced Repetition)
  repeatCount: 0,                        // Anzahl Wiederholungen
  knownCount: 0,                         // Anzahl "Gewusst"-Bewertungen
  lastReviewedAt: Date | null,
  nextReviewAt: Date,                    // Nächstes Fälligkeitsdatum
  userId: "uuid-aus-supabase",           // Supabase Auth User ID (optional bei Altdaten)
  createdAt: Date,
  updatedAt: Date
}
```

---

## Authentifizierung: Supabase Auth

- **Methode:** E-Mail + Passwort
- **Session-Management:** Cookie-basiert via `@supabase/ssr`
- **Route-Guard:** `src/hooks.server.js` — prüft Session bei jedem Request; leitet `/stapel/*` und `/dashboard` ohne Session zu `/login` weiter
- **User-Kontext:** `event.locals.user` ist in allen `+page.server.js` verfügbar
- **Rückwärtskompatibilität:** Dokumente ohne `userId`-Feld sind für alle eingeloggten User sichtbar (Altdaten)

---

## Datei-Storage: Supabase Storage

- **Bucket:** `card-images` (public)
- **Pfad-Schema:** `{deckSlug}/{cardId}-{timestamp}.{ext}`
- **Upload:** Server-seitig via Service-Role-Key in `+page.server.js`
- **Verknüpfung:** `imageUrl`-Feld im MongoDB-Dokument speichert die öffentliche URL
- **Löschen:** Beim Löschen einer Karte wird das Bild automatisch aus dem Bucket entfernt

---

## Leitner-Box-System (Spaced Repetition)

Karten durchlaufen 5 Leitner-Boxen mit unterschiedlichen Wiederholungsintervallen:

| Box | Intervall |
|-----|-----------|
| 1 | 0 Tage (sofort) |
| 2 | 1 Tag |
| 3 | 3 Tage |
| 4 | 7 Tage |
| 5 | 14 Tage |

- **Gewusst** → Box +1, `nextReviewAt` = jetzt + Intervall
- **Repetieren** → Box 1 zurück, `nextReviewAt` = jetzt

Die Lernqueue wird gewichtet befüllt: Karten in niedrigen Boxen oder mit vielen Wiederholungen erscheinen häufiger (`getLearningWeight()` in `src/lib/db.js`).

---

## Routing-Übersicht

```
/                          → Home (Einstieg)
/login                     → Anmelden
/registrieren              → Konto erstellen
/logout                    → Abmelden (POST Action)
/stapel                    → Stapelübersicht (geschützt)
/stapel/[slug]             → Stapel-Detailseite
/stapel/[slug]/lernen      → Lernmodus
/stapel/[slug]/bearbeiten  → Stapel bearbeiten
/stapel/[slug]/loeschen    → Stapel löschen
/stapel/[slug]/karten/neu  → Neue Karte erstellen
/stapel/[slug]/karten/[id] → Karten-Detailansicht
/stapel/[slug]/karten/[id]/bearbeiten → Karte bearbeiten
/stapel/[slug]/karten/[id]/loeschen   → Karte löschen
/dashboard                 → Lernstatistik (geschützt)
```

---

## Umgebungsvariablen

```
DB_URI                   MongoDB Atlas Connection String
PUBLIC_SUPABASE_URL      Supabase Projekt-URL (öffentlich)
PUBLIC_SUPABASE_ANON_KEY Supabase Anon Key (öffentlich)
SUPABASE_SERVICE_ROLE_KEY Supabase Service Role Key (privat, nur Server)
```
