# Styleguide PT-Karteikarten

## Grundprinzip

Die App verwendet Bootstrap als verbindliche Grundlage für Farben, Komponenten und Layout. Eigene CSS-Regeln bleiben die Ausnahme und dienen nur dazu, projektweite Akzente zu ergänzen.

Die Farbpalette orientiert sich an:

```text
#000000  #F2F2F2  #FF670F  #D90000  #239C1A
```

Wichtig: Bootstrap bleibt die Grundlage für alle UI- und Statusfarben. Kleine projektspezifische Basisregeln wie der schwarze Body-Hintergrund, die helle Textfarbe und einzelne Card-Abstände liegen in `src/style.css`. Orange `#FF670F` ist die einzige projektspezifische Akzentfarbe und ist dort als `--color-accent` definiert.

## Farbrollen

| Rolle | Palette | Umsetzung | Verwendung |
|---|---:|---|---|
| App-Hintergrund | `#000000` | `body`, `bg-black`, `navbar bg-black` | Grundfläche der App, Navbar, dunkle Kontrastbereiche |
| Helle Inhaltsflächen | `#F2F2F2` | Bootstrap `bg-light text-dark`, `card bg-light` | Cards, Formulare, Tabellenbereiche, Lernkarten |
| Orange Akzent | `#FF670F` | `text-accent`, `bg-accent`, `border-accent`, `btn-accent`, `text-bg-accent` | Nicht-statusbezogene Hervorhebungen, Vorlesungskontext, zentrale Lern-CTA, aktive Fokusbereiche |
| Rot / Repetieren | `#D90000` | Bootstrap `danger` | Löschen, Fehler, Wiederholen/Repetieren |
| Grün / Gewusst | `#239C1A` | Bootstrap `success` | Erfolg, Gewusst, positive Rückmeldungen, neue Inhalte |
| Neutral | Bootstrap `secondary` | `text-secondary`, `btn-outline-secondary`, `text-bg-secondary` | Metadaten, Hilfetexte, inaktive oder zweitrangige UI-Elemente |
| Primär dunkel | Bootstrap `dark` | `btn-dark`, `text-bg-dark`, `bg-dark` | Standardaktionen, Kontext-Badges, starke Kontraste |

## Orange als Akzentfarbe

Orange wird sparsam eingesetzt, damit die Farbe ihre Wirkung behält. Orange bedeutet nicht Erfolg, Fehler oder Gefahr. Orange markiert Kontext, Fokus oder Besonderheiten.

Sinnvolle Verwendung:

- Hervorhebung des zentralen Produktnutzens, z.B. `Vorlesungskontext` auf der Home-Seite.
- Akzente in Karteikarten-Komponenten, z.B. für Woche, Datei/Skript, Folie/Seite oder aktive Kontextbereiche.
- Zentrale Lern-CTA `JETZT LERNEN`, weil sie der wichtigste Einstieg in den Lernflow ist und keine Erfolgs- oder Fehlerbedeutung hat.
- Dashboard-Akzente für wichtige, aber nicht kritische Bereiche.
- Border oder Badge, wenn ein Bereich visuell hervorgehoben werden soll, ohne Statuslogik zu vermitteln.

Nicht verwenden:

- Nicht für `Gewusst` oder Erfolg. Dafür Bootstrap `success`.
- Nicht für `Repetieren`, Löschen oder Fehler. Dafür Bootstrap `danger`.
- Nicht für Standardbuttons, wenn `btn-dark`, `btn-light`, `btn-success` oder `btn-danger` semantisch klarer passen. Ausnahme: `JETZT LERNEN` darf als zentrale Lern-CTA bewusst `btn-accent` verwenden.
- Nicht als grosse Flächenfarbe auf vielen Cards gleichzeitig.

## Komponentenregeln

### Buttons

| Zweck | Klasse |
|---|---|
| Primäre neutrale Aktion | `btn btn-dark` |
| Zentrale Lern-CTA | `btn btn-accent` |
| Helle Navigation / Einstieg | `btn btn-light` |
| Positive Aktion | `btn btn-success` |
| Destruktive Aktion | `btn btn-danger` |
| Sekundäre Aktion | `btn btn-outline-secondary` |
| Reiner Akzent ohne Status | `btn btn-accent` |

Beispiele:

- `JETZT LERNEN`: zukünftig `btn-accent`, weil es die zentrale Lern-CTA ist und gezielt auffallen soll.
- `Gewusst`: `btn-success`, weil es ein positiver Lernstatus ist.
- `Repetieren`: `btn-danger`, weil es eine negative Selbstbewertung ist.
- `Löschen`: `btn-danger`, weil es destruktiv ist.
- Zukünftiger Spezialfokus in Karten-Komponente: `btn-accent`, falls die Aktion Kontext oder Lernfokus betont und nicht Erfolg, Fehler oder Löschen bedeutet.

### Cards und Flächen

- Inhaltsbereiche bleiben hell: `card bg-light text-dark shadow-sm`.
- Der Seitenhintergrund bleibt schwarz.
- Cards sollen nicht über Orange eingefärbt werden.
- Orange kann als `border-accent` oder kleines `text-bg-accent` Badge genutzt werden.

### Badges

| Zweck | Klasse |
|---|---|
| Kontext, Woche, Folie | `badge text-bg-dark` oder bei gezieltem Fokus `badge text-bg-accent` |
| Neue Inhalte | `badge text-bg-success rounded-pill` |
| Repetitions- oder Fehlerstatus | `badge text-bg-danger` |
| Neutrale Metadaten | `badge text-bg-secondary` oder `badge text-bg-light text-dark` |

### Alerts

- Erfolg: `alert-success`.
- Fehler: `alert-danger`.
- Hinweise: `alert-secondary` oder `alert-light`.
- Orange wird nicht für Alerts verwendet, ausser ein zukünftiger Hinweis braucht bewusst einen nicht-statusbezogenen Akzent. Dann nur mit klarer Begründung.

### Tabellen und Dashboard

- Tabellen bleiben Bootstrap-basiert: `table`, `table-hover`, `table-responsive`.
- Fortschrittsbalken verwenden Bootstrap-Statusfarben:
  - gelernt: `bg-success`
  - zu wiederholen: `bg-danger`
  - offen / neutral: `bg-secondary`
- Orange darf im Dashboard für Hervorhebungen verwendet werden, die keine Lernstatus-Bedeutung haben, z.B. markierter Fokusbereich oder visuelle Trennung einzelner Bereiche.

## Do / Don’t

| Do | Don’t |
|---|---|
| Bootstrap-Farben zuerst verwenden | Eigene Rot- oder Grünwerte definieren |
| Orange sparsam für Kontext, Fokus und `JETZT LERNEN` nutzen | Orange für Fehler, Löschen oder Repetieren verwenden |
| Cards hell und lesbar halten | Ganze Seitenbereiche orange einfärben |
| Statusfarben semantisch einsetzen | Farben nur nach Optik austauschen |
| Custom CSS zentral in `src/style.css` halten | Inline-Styles oder lokale Sonderlösungen ergänzen |

## Technische Grundlage

Die zentrale technische Definition liegt in `src/style.css`:

```css
:root {
	--color-accent: #FF670F;
	--color-accent-rgb: 255, 103, 15;
}

.text-accent { color: var(--color-accent); }
.bg-accent { background-color: rgba(var(--color-accent-rgb), var(--bs-bg-opacity, 1)); }
.border-accent { --bs-border-color: var(--color-accent); border-color: var(--color-accent); }
.btn-accent { --bs-btn-bg: var(--color-accent); --bs-btn-border-color: var(--color-accent); --bs-btn-color: #fff; }
.text-bg-accent { background-color: var(--color-accent); color: #fff; }
```

Neue Farbregeln sollen nur ergänzt werden, wenn Bootstrap oder diese Akzent-Utilities nicht ausreichen.
