# Claude Code Tipps für die Zeichen-App

## 🚀 Auto-Accept Funktionen (um Bestätigungen zu vermeiden)

### 1. **Shift+Tab Toggle** (Empfohlen während der Sitzung)
- Drücke **Shift+Tab** um zwischen Modi zu wechseln:
  - Normal-Modus (mit Bestätigungsaufforderungen)
  - **Auto-accept edit on** (akzeptiert alle Bearbeitungen automatisch)
  - Plan mode on (nur Lesen und Planen)

### 2. **Dangerous Mode** (Beim Start)
```bash
claude --dangerously-skip-permissions
```
⚠️ **Vorsicht:** Nur in isolierten Umgebungen oder Docker-Containern verwenden!

### 3. **Shell Alias erstellen** (für schnellen Zugriff)
Füge zu deiner `.bashrc` oder `.zshrc` hinzu:
```bash
alias cc="claude --dangerously-skip-permissions"
```
Dann kannst du einfach `cc` eingeben.

### 4. **Erlaubte Tools konfigurieren**
In der Konfigurationsdatei:
```json
{
  "allowedTools": [
    "Bash",
    "Create", 
    "Edit",
    "Read",
    "Write"
  ]
}
```

### 5. **Domains zur Allowlist hinzufügen**
Verwende `/permissions` um bestimmte Domains automatisch zu erlauben.

## 📸 Snap Happy - Automatisierte Screenshots

### Installation
```bash
claude mcp add snap-happy npx @mariozechner/snap-happy
```

### Verwendung
```bash
echo "Take a screenshot" | claude -p
echo "Show me the last screenshot" | claude -p
```

### Features
- Listet alle Fenster auf
- Macht Screenshots von spezifischen Fenstern
- Speichert Screenshots automatisch
- Perfekt für UI-Entwicklung und Debugging

## 🔍 Claude Trace - Alles aufzeichnen

### Installation & Verwendung
```bash
npx @mariozechner/claude-trace --include-all-requests
```

### Was es zeigt
- System prompts die Claude versteckt
- Tool outputs
- Raw API data
- Thinking blocks
- Token usage mit Cache hits
- Interaktive HTML Ansicht

### Logs finden
Logs werden gespeichert in: `.claude-trace/log-YYYY-MM-DD-HH-MM-SS.{jsonl,html}`

## 💰 CCUsage - Token-Verbrauch analysieren

### Täglicher Report
```bash
npx ccusage@latest report daily
```

### Session Report
```bash
npx ccusage@latest report session
```

### Features
- Zeigt Token-Verbrauch und Kosten in USD
- Filterung nach Datum möglich
- JSON Export verfügbar
- Gruppierung nach Projekt/Session

## 🧠 Think-Modi für bessere Ergebnisse

Verwende diese magischen Wörter für mehr Denkzeit:
1. **"think"** - 4.000 Token
2. **"think hard"** - 10.000 Token
3. **"think harder"** - 31.999 Token
4. **"ultrathink"** - 31.999 Token (Maximum)
5. **"megathink"** - 10.000 Token

Beispiel:
```
"Ultrathink about the best architecture for our drawing app"
```

## 📁 CLAUDE.md Datei erstellen

Erstelle eine `CLAUDE.md` Datei im Projektverzeichnis mit:
- Projektkontext und Struktur
- Coding Standards
- Häufig verwendete Commands
- Wichtige Hinweise für Claude

Beispiel:
```markdown
# Zeichen-App Projekt

## Projektstruktur
- /src - Hauptcode
- /components - React Komponenten
- /styles - CSS/Tailwind

## Wichtige Commands
- npm run dev - Entwicklungsserver starten
- npm test - Tests ausführen

## Coding Standards
- Verwende TypeScript
- Komponenten in PascalCase
- Hooks beginnen mit "use"

## Logging
Im Debug-Modus werden alle wichtigen Aktionen nach stdout geloggt.
```

## 🌳 Git Worktrees für parallele Arbeit

```bash
# Neuen Worktree erstellen
git worktree add ../zeichen-app-feature-x feature-x

# In verschiedenen Verzeichnissen arbeiten
cd ../zeichen-app-feature-x
claude  # Separater Claude Code Instance

# Worktrees auflisten
git worktree list

# Worktree entfernen
git worktree remove ../zeichen-app-feature-x
```

## 🤖 Headless Mode für Automatisierung

### Einfache Verwendung
```bash
claude -p "Fix all ESLint errors" --json
```

### In Scripts
```bash
# Alle Tests fixen
for test in tests/*.js; do
  claude -p "Fix failing test in $test" --json
done
```

### Mit Python
```python
from claude_code_sdk import query, ClaudeCodeOptions

options = ClaudeCodeOptions(
    max_turns=3,
    permission_mode="acceptEdits"
)

async for message in query(prompt="Refactor this component", options=options):
    print(message)
```

## 🎯 Best Practices für die Zeichen-App

### 1. **Visuelle Inputs nutzen**
- Screenshots von UI-Problemen direkt einfügen
- Mockups als Referenz verwenden
- Claude kann Bilder mit dem aktuellen Stand vergleichen

### 2. **Logging ist König**
- Alle wichtigen Aktionen loggen
- Debug-Modus mit ausführlichem Logging
- Claude kann Logs automatisch lesen mit `/logs` command

### 3. **Context Management**
- `/clear` zwischen verschiedenen Tasks verwenden
- Nicht zu viele Dateien auf einmal öffnen
- Fokussiert auf eine Aufgabe bleiben

### 4. **Sichere Permissions**
- Nur Read-Only Commands automatisch erlauben
- "Yes" zu: `git status`, `ls`, `cat`
- "No" zu: `git commit`, `rm`, `git push`

### 5. **Plan First Approach**
```
"Think hard and create a detailed plan for implementing the new drawing tool. 
Don't start coding until I approve the plan."
```

### 6. **MCP Server sparsam einsetzen**
- Nur verwenden wenn normale Tools nicht ausreichen
- Playwright MCP für Browser-Automation
- Für Datenbank reicht meist `psql`

### 7. **Interruption & Correction**
- **Escape** - Claude unterbrechen
- **Double Escape** - Zur vorherigen Eingabe zurück
- Bei Fehlern: "Undo the last changes and try a different approach"

### 8. **Checkpoint häufig**
```bash
# Nach guten Änderungen
git add .
git stash  # Als Backup

# Oder mit Git Worktrees arbeiten
```

## ⚡ Performance Optimierungen

### 1. **Token-Effizienz**
- Screenshots vermeiden wenn möglich
- Große Dateien in Chunks bearbeiten
- Sonnet statt Opus verwenden (gleich gut, günstiger)

### 2. **Parallel arbeiten**
- Mehrere Claude Code Instanzen
- Eine für Coding, eine für Testing
- Git Worktrees für verschiedene Features

### 3. **Caching nutzen**
- Häufig verwendete Befehle in Makefile
- Scripts statt MCP wenn möglich
- CLAUDE.md für wiederkehrende Infos

## 🔧 Nützliche Slash Commands

- `/permissions` - Domain Allowlist verwalten
- `/config` - Konfiguration anpassen
- `/clear` - Context zurücksetzen
- `/logs` - Logs anzeigen
- `/model` - Zwischen Sonnet/Opus wechseln
- `/continue` - Letzte Konversation fortsetzen
- `/vim` - Vim Keybindings aktivieren
- `/terminal-setup` - Terminal optimieren (z.B. Shift+Enter für Linebreaks)

## 💡 Spezialtipps für die Zeichen-App

1. **UI Entwicklung**
   - Snap Happy für regelmäßige Screenshots
   - "Compare this screenshot with the current UI and fix differences"
   - Visuelle Regression Tests

2. **Performance Monitoring**
   - CCUsage täglich checken
   - Bei hohen Kosten: Workflow optimieren
   - Mehr Sonnet, weniger Opus

3. **Debugging**
   - Claude Trace für komplexe Probleme
   - "Show me your thinking process" hinzufügen
   - Logs immer im Auge behalten

4. **Automatisierung**
   - GitHub Actions mit Claude Code SDK
   - Automatische PR Reviews
   - Issue Triage mit Headless Mode

## 🚨 Wichtige Warnungen

1. **Niemals** Produktions-Credentials in Claude Code
2. **Vorsicht** bei `git add .` - kann sensitive Daten hinzufügen
3. **Backup** vor großen Refactorings
4. **Docker** für dangerous mode verwenden
5. **Rate Limits** beachten - Max plan hat 5x mehr als Pro

---

Diese Tipps sollten dir helfen, Claude Code optimal für die Zeichen-App zu nutzen. Denk daran: Claude Code ist wie ein sehr schneller Praktikant mit perfektem Gedächtnis - gib klare Anweisungen und überprüfe die Arbeit!