# Codex-Anweisung: SvelteKit-Prototyp Karteikarten-App

## 1. Projektkontext

Ich entwickle im Rahmen des Moduls **Prototyping** eine Karteikarten-Website fuer Studierende. Die App soll nicht einfach ein Ersatz fuer bestehende Tools wie Anki oder Quizlet sein, sondern einen fokussierten Mehrwert bieten:

> Karteikarten sollen immer mit ihrem urspruenglichen Vorlesungskontext verknuepft sein.

Studierende sollen beim Lernen schnell erkennen, **in welcher Semesterwoche und auf welcher Folie oder Seite** ein Thema behandelt wurde. Dadurch koennen sie bei Unsicherheiten schneller zur Primaerquelle zurueckfinden.

Der Prototyp basiert auf einem bereits erstellten Figma-Mockup. Codex hat keinen direkten Zugriff auf Figma. Deshalb sind die relevanten Design- und Flow-Entscheide in dieser Datei textlich beschrieben und sollen bei der Umsetzung moeglichst eingehalten werden.

Figma-Link fuer mich als Referenz:

```text
https://www.figma.com/design/8ymntmvM2jhG9jjeIZGU9G/Karteikarten-prototyping-Uebung--Kopie-?node-id=0-1
```

## 2. Wichtigste Arbeitsregel

Arbeite nie direkt mit grossen Aenderungen los.

Gehe bei jedem Task zwingend iterativ vor. **Es darf nie direkt umgesetzt werden.**

Verbindlicher Ablauf bei jedem Task:

1. Bestehenden Code und Projektstruktur pruefen.
2. Kurz zusammenfassen, was bereits vorhanden ist.
3. Erklaeren, welche Dateien voraussichtlich betroffen sind.
4. Im **Plan Mode** einen kleinen, konkreten Umsetzungsplan erstellen.
5. Im Plan erklaeren:
   - was angepasst werden soll
   - wo es angepasst werden soll
   - warum es angepasst werden soll
   - wie die Aenderung geprueft werden soll
6. Danach explizit fragen: **"Soll ich diesen Plan so umsetzen?"**
7. Erst wenn ich zustimme, darf die Umsetzung erfolgen.
8. Danach testen oder manuell pruefen.
9. Nach der Anpassung dokumentieren:
   - was umgesetzt wurde
   - wo es umgesetzt wurde
   - warum es umgesetzt wurde
   - wie es geprueft wurde
   - welche Dateien geaendert wurden
10. Einen sauberen Git-Commit mit sprechender Commit Message erstellen oder vorbereiten.
11. Am Ende kurz festhalten:
   - Was wurde umgesetzt?
   - Welche Dateien wurden geaendert?
   - Wie wurde geprueft?
   - Warum wurde diese Aenderung gemacht?
   - Welche Commit Message wurde verwendet oder vorgeschlagen?
   - Was ist der naechste sinnvolle Schritt?

Keine grossen Refactorings, keine Sammelaenderungen und keine unnoetigen Zusatzfunktionen ohne vorherige Begruendung und ohne vorherige Zustimmung zum Plan.

## 3. Technologievorgaben

Die App soll mit **SvelteKit** umgesetzt werden.

Erlaubt:

- SvelteKit
- HTML
- CSS
- JavaScript ohne Typescript
- Bootstrap fuer Layout, Komponenten und Styling
- MongoDB als Datenbank

Wichtig:

- **Navbar, Buttons, Cards, Tabellen, Forms und Feedback-Elemente muessen immer mit Bootstrap umgesetzt werden.**
- Dazu gehoeren insbesondere Bootstrap-Klassen fuer `navbar`, `btn`, `card`, `table`, `form-control`, `form-label`, `alert`, `badge`, `container`, `row`, `col`, `d-flex`, `gap-*`, `mb-*` und verwandte Utility-Klassen. Bootstrap wird per CDN geladen.
- Das Styling soll generell auf Bootstrap basieren.
- Eigene CSS-Regeln sind erlaubt, aber nur fuer projektspezifische Anpassungen, z.B. Dark Theme, Abstaende, Kartenoptik oder kleine visuelle Anpassungen. Eigene CSS-Regeln duerfen Bootstrap nicht ersetzen, sondern nur ergaenzen und eine kleine Ausnahme bilden!
- Keine unnoetigen UI-Libraries hinzufuegen.
- Keine echte Authentifizierung oder komplexe Userverwaltung einbauen, ausser ich fordere es explizit.
- Als Datenbank ist **MongoDB** vorgesehen. Keine andere Datenbank wie SQLite, PostgreSQL, Supabase oder Firebase verwenden, ausser ich fordere es explizit.

## 4. Grundidee und fachlicher Fokus

Die App soll bewusst einfach bleiben.

Sie ist kein vollstaendiger Ersatz fuer Anki, Quizlet, RemNote oder StudySmarter. Der Prototyp fokussiert sich auf einen klaren Anwendungsfall:

- Karteikarten erstellen
- Karteikarten einem Stapel oder Modul zuordnen
- Semesterwoche speichern
- Foliennummer oder Seitennummer speichern
- Karten anzeigen und bearbeiten
- Karten im Lernmodus durchgehen
- bei Unklarheiten schnell zur urspruenglichen Vorlesungsquelle zurueckfinden

Jede Karteikarte enthaelt mindestens:

- Frage
- Antwort
- Modul (Stapel)
- Semesterwoche
- Foliennummer oder Seitennummer

## 5. Begriffsklaerung

In der UI wird hauptsaechlich der Begriff **Stapel** verwendet.

Ein Stapel entspricht inhaltlich einem Modul oder Fach, zum Beispiel:

- Strategisches Management
- Statistik
- Mathematik

Technisch darf die Datenstruktur `deck`, `module` oder `stack` heissen. Wichtig ist aber, dass die UI fuer den User und auch im Code konsistent bleibt.

Empfehlung fuer die UI:

- Hauptnavigation: `Home`, `Dashboard`, `Stapel`
- Uebersicht: `Meine Stapel`
- Detailseite: Name des Stapels, z.B. `Strategisches Management`
- Primaere Aktion: `JETZT LERNEN`
- Weitere Aktion: `Neue Karte erstellen`

## 6. Verbindlicher Figma-Flow in Textform

Der bestehende Figma-Prototyp gefaellt strukturell und inhaltlich bereits weitgehend. Die Umsetzung soll deshalb den vorhandenen Flow moeglichst direkt in SvelteKit uebertragen und nicht frei neu konzipieren.

Folgende Screens und Workflows sollen umgesetzt werden:

### 6.1 Home / Einstieg

Zweck:

- Einstieg in die App
- kurzer Hinweis auf den Nutzen der Karteikarten-App
- Login- oder Anmeldebereich als Prototyp-Element

Wichtig:

- Es muss kein echtes Login-System implementiert werden.
- Ein Button wie `Anmelden` oder `Login` reicht, um in den eigentlichen App-Bereich zu gelangen.
- Die Seite soll minimalistisch bleiben.

### 6.2 Stapeluebersicht / Dashboard

Zweck:

- Uebersicht ueber die vorhandenen Lernstapel
- Einstieg in einzelne Module oder Stapel

Moegliche Inhalte:

- Kartenraster mit Lernstapeln
- Titel des Stapels
- kurze Beschreibung oder Modulname
- Anzahl Karteikarten
- Button `Oeffnen`
- Button `Neuer Stapel`
- Button `CSV importieren` als spaeter zwingend umzusetzende Funktion

Wichtig:

- Der CSV-Import ist eine verbindliche Funktion des Gesamtprojekts, wird aber erst am Ende umgesetzt. Nicht damit anfangen ausser ich verlange es explizit.
- Zu Beginn reicht ein sichtbarer Button oder klarer Platzhalter, damit der Flow und das Design bereits darauf vorbereitet sind.
- Eine echte CSV-Importlogik darf erst umgesetzt werden, wenn der Kernprototyp stabil funktioniert und ich es verlange.

### 6.3 Stapel-Detailseite

Beispiel: `Strategisches Management`

Zweck:

- bestehende Karteikarten eines Stapels anzeigen
- Lernen starten
- neue Karte hinzufuegen
- Karten bearbeiten oder loeschen

Inhalte:

- Titel des Stapels
- Button `JETZT LERNEN`
- Button `Neue Karte erstellen`
- Tabelle oder Liste mit:
  - Frage
  - Woche
  - Folie / Seite
  - Bearbeiten-Aktion
  - Loeschen-Aktion

Wichtig:

- Die Listenansicht soll schlicht und uebersichtlich bleiben.
- Filter nach Modul/Stapel, Woche oder Folie sind eine verbindliche Funktion des Gesamtprojekts.
- Filter muessen aber nicht zu Beginn umgesetzt werden. Sie gehoeren in eine spaetere Projektphase, nachdem der Kernflow stabil funktioniert. Erst umsetzen wenn ich es explizit verlange.
- Wenn Filter umgesetzt werden, dann einfach, nachvollziehbar und mit Bootstrap-Forms.

### 6.4 Neue Karte erstellen

Zweck:

- neue Karteikarte erfassen

Pflichtfelder:

- Frage
- Antwort
- Stapel oder Modul (Es wird zuerst ein Modul angeklickt, somit wird das Modul bzw. der Stapel auf der Karte korrekt hinterlegt, basiertend auf der Auswahl.)
- Woche
- Folie / Seite

Nach dem Speichern:

- eine Bestaetigungsansicht anzeigen
- eine Vorschau der erstellten Karte anzeigen
- Aktionen anbieten:
  - `Bearbeiten`
  - `Weitere Karte hinzufuegen`
  - optional `Zurueck zum Stapel`

### 6.5 Karte bearbeiten

Zweck:

- bestehende Karteikarte bearbeiten

Anforderungen:

- Formular mit vorhandenen Werten vorausfuellen
- Werte anpassen koennen
- Speichern-Button
- nach dem Speichern Feedback anzeigen

### 6.6 Lernmodus

Der Lernmodus besteht aus zwei Zustaenden.

#### Zustand 1: Frageansicht

Anzeigen:

- Frage
- Stapel oder Modul
- Woche
- Folie / Seite
- Fortschritt, z.B. `Frage 1 / 112`
- Button `Antwort anzeigen`

#### Zustand 2: Antwortansicht

Anzeigen:

- Frage
- Antwort
- Stapel oder Modul
- Woche
- Folie / Seite
- Fortschritt, z.B. `Frage 1 / 112`
- Button `Gewusst`
- Button `Repetieren`

Verhalten:

- Nach Klick auf `Antwort anzeigen` wird die Antwort eingeblendet.
- Nach Klick auf `Gewusst` oder `Repetieren` wird die naechste Karte geladen.
- Der Lernstatus `Gewusst` oder `Repetieren` muss in MongoDB gespeichert werden, sobald er dauerhaft relevant ist.
- Kurzfristige UI-Zustaende wie `Antwort ist sichtbar` duerfen nur im Svelte-Component-State gehalten werden und werden nicht gespeichert.
- Wenn der Stapel fertig ist, soll eine einfache Abschlussmeldung angezeigt werden.

## 7. Design- und Stilvorgaben

Codex hat keinen direkten Zugriff auf die Figma-Designentscheidungen. Die folgenden Vorgaben ersetzen deshalb die visuelle Figma-Referenz.

### 7.1 Grundstil

- Desktop-First, aber trodtzem responsiv! (Bootstrap Grid Layout verwenden!)
- Querformat / Laptop-orientiert
- minimalistisches Design
- Dark Theme als Grundstimmung
- dunkler Hintergrund
- helle Inhaltsbereiche oder Cards
- hohe Kontraste
- klare visuelle Hierarchie
- wenig visuelle Ablenkung
- Fokus auf Lerninhalt

### 7.2 Bootstrap-Vorgabe

Bootstrap ist die verbindliche Grundlage fuer das Styling.

Die folgenden UI-Elemente muessen immer mit Bootstrap umgesetzt werden:

- Navbar
- Buttons
- Cards
- Tabellen
- Forms
- Feedback-Elemente wie Alerts, Badges oder Statusmeldungen

Nutze Bootstrap ausserdem fuer:

- Grid/Layout
- Container
- Utility-Klassen fuer Spacing und Flexbox

Beispiele:

- Navbar mit `navbar`, `navbar-dark`, `bg-dark`
- Cards mit `card`, `card-body`, `card-title`
- Buttons mit `btn`, `btn-primary`, `btn-outline-light`, `btn-success`, `btn-danger`
- Tabellen mit `table`, `table-dark`, `table-hover` oder bewusst hellen Tabellen innerhalb heller Cards
- Forms mit `form-control`, `form-label`, `mb-3`
- Feedback mit `alert`, z.B. `alert-success`

Eigene CSS-Klassen sollen nur ergaenzen (wenige Ausnahmen, nur wenn ich es verlange!), nicht Bootstrap ersetzen. Wenn ein UI-Element mit Bootstrap umsetzbar ist, muss Bootstrap verwendet werden.

### 7.3 Farben und Bedeutung

- Hintergrund: dunkel, ruhig, lernfreundlich
- Inhaltskarten: hell oder deutlich abgesetzt
- Primaere Aktionen: gut sichtbar
- `Gewusst`: gruen / Bootstrap `btn-success`
- `Repetieren`: rot / Bootstrap `btn-danger`
- Loeschen: rot oder dezent als Danger-Action
- Bearbeiten: neutral oder sekundar

### 7.4 Layout

- Verwende einen zentralen Bootstrap-Container.
- Nutze Cards fuer Stapel, Formulare und Lernkarten.
- Halte genug Abstand zwischen Elementen.
- Buttons sollen konsistent gross, ausgerichtet und beschriftet sein.
- Tabellen sollen lesbar und nicht ueberladen sein.
- Die Navigation soll auf allen App-Seiten konsistent erscheinen.

### 7.5 Sprache und UI-Texte

UI-Texte sollen klar und nutzerorientiert sein.

Bevorzugte Labels:

- `Meine Stapel`
- `Strategisches Management`
- `Neue Karte erstellen`
- `Karte bearbeiten`
- `Karte wurde erstellt`
- `Vorschau der Karte`
- `Weitere Karte hinzufuegen`
- `Antwort anzeigen`
- `Gewusst`
- `Repetieren`
- `JETZT LERNEN`
- `CSV importieren`

Technische Titel wie `// Lernmodus` oder `// Neue Karte` sollen nur verwendet werden, wenn sie bewusst als Stilmittel umgesetzt werden. Ansonsten normale Seitentitel verwenden.

## 8. Priorisierung der Umsetzung

### Prioritaet 1: Stabiler Mindestumfang

Zuerst umsetzen:

- SvelteKit-Grundstruktur pruefen
- Bootstrap einbinden
- globale Navigation
- Home / Einstieg
- Stapeluebersicht
- Stapel-Detailseite mit Kartenliste
- Karte erstellen
- Karte bearbeiten
- Lernmodus mit Frageansicht und Antwortansicht
- MongoDB-Datenmodell und einfache MongoDB-Anbindung
- Feedback nach Speichern und Bearbeiten

### Prioritaet 2: Verbindliche Erweiterungen nach stabilem Kernflow

Erst danach umsetzen, aber fuer das Gesamtprojekt verbindlich:

- einfache Suche oder Filterung nach Modul/Stapel, Woche und Folie
- CSV-Import fuer Karteikarten
- Abschlussmeldung im Lernmodus
- kleine visuelle Politur gemaess Designentscheidungen
- bessere Statusmeldungen

Wichtig:

- Filter und CSV-Import sind nicht optional.
- Sie muessen aber erst umgesetzt werden, wenn Prioritaet 1 stabil funktioniert.
- Filter muessen mit Bootstrap-Forms umgesetzt werden.
- CSV-Import soll einfach und robust bleiben und darf den Kernprototyp nicht gefaehrden.

### Prioritaet 3: Optionale Erweiterungen

Nur wenn Prioritaet 1 und 2 stabil funktionieren:

- erweiterter Lernfortschritt
- einfache Statistik
- README-Dokumentation mit Screenshots
- Dokumentation des KI-gestuetzten Vorgehens

Nicht umsetzen, solange der Kernprototyp nicht stabil ist und wenn nicht explizit verlangt von mir:

- echte Authentifizierung
- komplexe Rollen oder Userverwaltung
- vollstaendiger Anki-/Quizlet-Funktionsumfang
- mobile Optimierung als Hauptfokus
- grosse Design- oder Architektur-Refactorings

## 9. Datenhaltung mit MongoDB

Als Datenbank wird **MongoDB** verwendet. Die App soll die Karteikarten, Stapel/Module und Lernstatus ueber MongoDB speichern und laden.

Wichtig:

- MongoDB ist verbindlich.
- Keine andere Datenbank verwenden, ausser ich fordere es explizit.
- Kein localStorage verwenden.
- Wenn Daten gespeichert, geladen, erstellt, bearbeitet oder geloescht werden, muss dies ueber MongoDB erfolgen.
- Auch Lernstatus wie `known` oder `repeat` muessen in MongoDB gespeichert werden, falls sie ueber den aktuellen Seitenzustand hinaus erhalten bleiben sollen.
- Kurzfristige UI-Zustaende duerfen im Svelte-Component-State gehalten werden, z.B. ob im Lernmodus die Antwort gerade sichtbar ist. Diese Zustaende duerfen nicht in localStorage persistiert werden.
- Fuer den Prototyp reicht eine einfache, robuste MongoDB-Anbindung. Keine unnoetig komplexe Backend-Architektur bauen.
- Zugangsdaten und Connection Strings muessen ueber `.env` bzw. Umgebungsvariablen verwaltet werden. Keine Secrets in Git committen.
- Vor jeder Datenbankaenderung zuerst im Plan Mode erklaeren, welche Collection, welches Schema und welche Dateien betroffen sind.

Moegliche Collections:

- `decks` fuer Stapel oder Module
- `cards` fuer Karteikarten

Beispiel fuer ein einfaches Card-Dokument:

```js
{
  _id: ObjectId("..."),
  question: "Was sind Nachteile von Diversifikationen?",
  answer: "Probleme und Kosten der Synergieerschliessung; Principal-Agent-Theorie: Risikoreduktion.",
  deckId: ObjectId("..."),
  deckTitle: "Strategisches Management",
  week: 10,
  slide: 74,
  status: "new",
  createdAt: new Date(),
  updatedAt: new Date()
}
```

Moegliche Statuswerte:

- `new`
- `known`
- `repeat`

Die Datenstruktur soll einfach bleiben. Nur Felder ergaenzen, wenn sie fuer den Prototyp oder die Dokumentation wirklich benoetigt werden.

## 10. Komponentenstruktur

Halte Komponenten klein und nachvollziehbar.

Moegliche Komponenten:

- `Navbar.svelte`
- `DeckCard.svelte`
- `FlashcardTable.svelte`
- `FlashcardForm.svelte`
- `LearningCard.svelte`
- `FeedbackAlert.svelte`

Moegliche Struktur:

```text
src/
  lib/
    components/
    data/
    stores/
  routes/
    +layout.svelte
    +page.svelte
    stapel/
      +page.svelte
      [id]/
        +page.svelte
        lernen/
          +page.svelte
    karten/
      neu/
        +page.svelte
      [id]/
        bearbeiten/
          +page.svelte
```

Diese Struktur ist ein Vorschlag. Bestehende Projektstruktur zuerst pruefen und nur dann anpassen, wenn es sinnvoll ist.

## 11. Dokumentations- und Commit-Regeln

Eine saubere Historie ist wichtig, weil das Vorgehen spaeter im README und im Projektvideo nachvollziehbar sein soll.

Nach jedem sinnvoll abgeschlossenen Mini-Feature oder UI-Schritt muss dokumentiert werden, weshalb die Aenderung gemacht wurde und wie sie umgesetzt wurde.

Pflichtangaben nach jeder Anpassung:

1. Aenderungen kurz zusammenfassen.
2. Begruenden, warum die Aenderung gemacht wurde.
3. Beschreiben, wo die Aenderung umgesetzt wurde.
4. Geaenderte Dateien nennen.
5. Test oder manuelle Pruefung nennen.
6. Commit Message vorschlagen.
7. Commit erstellen oder vorbereiten.

Keine Sammelcommits mit vielen unzusammenhaengenden Aenderungen.

Gute Commit Messages:

- `Initialisiere SvelteKit-Projektstruktur`
- `Binde Bootstrap fuer UI-Styling ein`
- `Erstelle Navigation gemaess Prototyp`
- `Erstelle Stapeluebersicht mit Bootstrap Cards`
- `Fuege Detailseite fuer Karteikarten hinzu`
- `Fuege Formular fuer neue Karteikarten hinzu`
- `Implementiere Vorschau nach Kartenerstellung`
- `Ermoegliche Bearbeiten bestehender Karten`
- `Implementiere Lernmodus mit Antwortanzeige`
- `Ergaenze Bewertung mit Gewusst und Repetieren`
- `Binde MongoDB fuer Karteikarten ein`
- `Dokumentiere Designentscheidungen im README`

Nach jedem Commit soll kurz dokumentiert werden:

```text
Umgesetzt:
- ...

Geaenderte Dateien:
- ...

Pruefung:
- ...

Begruendung:
- ...

Commit:
- ...

Naechster sinnvoller Schritt:
- ...
```

## 12. Vorgehen bei jedem neuen Auftrag

Wenn ich einen neuen Auftrag gebe, gilt zwingend dieses Muster:

1. Auftrag kurz in eigenen Worten verstehen.
2. Relevante bestehende Dateien pruefen.
3. Zusammenfassen, was bereits vorhanden ist.
4. Betroffene Dateien nennen.
5. Im **Plan Mode** einen kleinen Umsetzungsplan erstellen und mir den Plan zeigen.
6. Im Plan genau beschreiben:
   - was geaendert werden soll
   - in welchen Dateien oder Bereichen es geaendert werden soll
   - warum diese Aenderung sinnvoll ist
   - wie danach geprueft wird, ob es funktioniert
7. Danach explizit fragen: **"Soll ich diesen Plan so umsetzen?"**
8. **Nicht umsetzen, bevor ich zugestimmt habe.**
9. Nach meiner Zustimmung genau den geplanten kleinen Schritt umsetzen.
10. Testen oder manuell pruefen.
11. Nach erfolgter Anpassung dokumentieren:
    - was angepasst wurde
    - wo es angepasst wurde
    - warum es angepasst wurde
    - wie es geprueft wurde
    - welche Dateien betroffen waren
12. Commit Message vorschlagen und Commit erstellen oder vorbereiten.
13. Abschlussbericht mit Umsetzung, Dateien, Pruefung, Begruendung, Commit und naechstem Schritt geben.

Dieser Ablauf gilt immer, auch bei kleinen Aenderungen.

## 13. Einschränkungen

Bitte nicht:

- das ganze Projekt auf einmal umbauen
- unnoetige Libraries hinzufuegen
- Bootstrap durch ein anderes UI-Framework ersetzen
- Funktionen implementieren, die nicht zum Prototyp passen
- Design komplett vom beschriebenen Figma-Stil entfernen
- grosse Dateien erzeugen
- bestehende Struktur ohne Begruendung veraendern
- ohne Plan mehrere Features gleichzeitig umsetzen
- andere externe Datenbanken oder Datenbankservices statt MongoDB einbauen
- echte Authentifizierung implementieren
- komplexe Statistiken vor dem Kernflow umsetzen
- Filter oder CSV-Import vor dem stabilen Kernflow umsetzen, obwohl beide spaeter verbindlich sind

## 14. Ziel

Ziel ist ein sauberer, funktionsfaehiger und dokumentierbarer Prototyp einer Karteikarten-App fuer Studierende.

Die Umsetzung soll:

- den bestehenden Figma-Flow respektieren
- Bootstrap zwingend fuer Navbar, Buttons, Cards, Tabellen, Forms und Feedback nutzen
- Filter und CSV-Import als verbindliche, aber spaeter umzusetzende Funktionen enthalten
- den dunklen, minimalistischen Stil beibehalten
- Karteikarten mit Vorlesungskontext klar in den Mittelpunkt stellen
- iterativ und nachvollziehbar entstehen
- eine saubere Git-Historie mit dokumentierten, nachvollziehbaren Commits haben
- spaeter gut im README und Projektvideo erklaerbar sein
