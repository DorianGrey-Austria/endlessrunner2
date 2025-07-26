# 🧪 TEST-PLAN.md - Claude's Selbst-Test Workflow

**Erstellt**: 2025-01-24  
**Autor**: Claude AI Assistant  
**Zweck**: Dokumentation des Selbst-Test-Workflows für Wiederverwendung in anderen Projekten

## 📋 Übersicht

Dieses Dokument beschreibt, wie ich (Claude) mich selbst teste, um sicherzustellen, dass Code-Änderungen funktionieren, ohne dass der Entwickler manuell testen muss.

## 🔄 Der Komplette Test-Workflow

### Phase 1: Code-Analyse (Statische Tests)

#### 1.1 Änderungen identifizieren
```bash
# Grep nach geänderten Funktionen/Klassen
Grep("pattern", "file.html", output_mode="content", -n=true, -C=5)

# Beispiele aus diesem Projekt:
Grep("quick-color-picker", "index.html")  # Finde problematischen Code
Grep("menu-size-control", "index.html")   # Lokalisiere UI-Elemente
```

#### 1.2 Code-Kontext verstehen
```bash
# Lese relevante Code-Abschnitte
Read("index.html", offset=4060, limit=20)

# Wichtig: Bei großen Dateien IMMER mit offset/limit arbeiten!
# NIEMALS: Read("index.html") ohne Limits
```

#### 1.3 Syntax-Überprüfung
- Prüfe auf offensichtliche Syntax-Fehler
- Verifiziere, dass alle Klammern geschlossen sind
- Stelle sicher, dass Variablen definiert sind

### Phase 2: Automatisierte Test-Erstellung

#### 2.1 Visual Test Script erstellen
```javascript
// test-app-visual.js - Browser-basierter Test
const { chromium } = require('playwright');

async function runVisualTests() {
  const browser = await chromium.launch({
    headless: false,  // Sichtbarer Browser
    slowMo: 200      // Langsame Aktionen für Sichtbarkeit
  });
  
  // Tests implementieren...
}
```

#### 2.2 Playwright Test Suite
```javascript
// test-drawing-app.spec.js
test.describe('App Tests', () => {
  test('Photo Import', async ({ page }) => {
    await page.goto('http://localhost:8000');
    await page.click('#photo-import');
    // Assertions...
  });
});
```

#### 2.3 Shell Script für einfache Ausführung
```bash
#!/bin/bash
# test-app.sh
echo "🧪 Starting Tests..."
python3 -m http.server 8000 &
SERVER_PID=$!
npx playwright test
kill $SERVER_PID
```

### Phase 3: Visuelle Verifikation

#### 3.1 Screenshots erstellen
```bash
# MCP Screenshot Tool verwenden
mcp__snap-happy__TakeScreenshot()

# Oder in Playwright:
await page.screenshot({ 
  path: 'tests/screenshots/feature-test.png',
  fullPage: true 
});
```

#### 3.2 Screenshot-Analyse
- Vergleiche vorher/nachher Screenshots
- Prüfe ob UI-Elemente sichtbar sind
- Verifiziere Layout-Änderungen

### Phase 4: Dokumentation

#### 4.1 Test-Report erstellen
```markdown
# TEST-REPORT.md
## Test-Durchlauf [Datum]
### Getestete Features:
- [x] Feature 1 - Status
- [x] Feature 2 - Status

### Gefundene Probleme:
- Problem 1: Beschreibung
- Lösung: Was wurde gefixt
```

#### 4.2 TROUBLESHOOTING.md aktualisieren
```markdown
## Known Issues
### Problem: [Beschreibung]
**Status**: ✅ FIXED (Datum)
**Solution**: [Was wurde gemacht]
```

## 🚧 Häufige Test-Herausforderungen

### 1. Server-Port-Konflikte
**Problem**: Port 8000 bereits belegt  
**Lösung**:
```bash
# Prüfe wer Port belegt
lsof -i :8000

# Beende Prozess oder nutze anderen Port
python3 -m http.server 8888
```

### 2. Browser-Automation fehlschlägt
**Problem**: Playwright kann Seite nicht laden  
**Lösung**:
- Server-Start verzögern (setTimeout)
- Explizite Waits verwenden
- Screenshots für Debugging

### 3. Große Dateien (>10k Zeilen)
**Problem**: Read() ohne Limits crasht  
**Lösung**:
```bash
# IMMER mit Limits arbeiten
Read("index.html", offset=1000, limit=500)
# Oder Grep für Suche verwenden
Grep("pattern", "index.html")
```

## 🎯 Best Practices

### 1. Incremental Testing
- Teste nach jeder kleinen Änderung
- Committe funktionierende Zwischenstände
- Rollback bei mehreren Fehlern

### 2. Test-Isolation
- Jeder Test sollte unabhängig sein
- Cleanup nach jedem Test
- Keine Test-Abhängigkeiten

### 3. Dokumentation
- Jeden Test-Durchlauf dokumentieren
- Screenshots als Beweise speichern
- Probleme und Lösungen festhalten

## 📊 Test-Metriken

### Was ich in diesem Projekt getestet habe:
1. **Code-Analyse**: 15+ Grep/Read Operationen
2. **Fixes implementiert**: 4 kritische Bugs
3. **Test-Scripts erstellt**: 3 (visual, playwright, shell)
4. **Screenshots**: Multiple für Verifikation
5. **Dokumentation**: 3 Dateien aktualisiert

## 🔧 Wiederverwendbare Test-Tools

### 1. Universal Visual Test Template
```javascript
// Kopiere test-app-visual.js und passe an:
- URLs ändern
- Test-Cases anpassen
- Selektoren updaten
```

### 2. Playwright Config
```javascript
// playwright.config.js
module.exports = {
  use: {
    headless: false,
    screenshot: 'on',
    video: 'retain-on-failure'
  }
};
```

### 3. Git Hooks für Tests
```bash
# .git/hooks/pre-commit
npm test || exit 1
```

## ⚠️ WICHTIG: Dangerous Skip Permissions Mode

### Was ist `--dangerously-skip-permissions`?
Dieser Flag erlaubt mir (Claude), ALLE Operationen ohne Rückfragen durchzuführen:
- Dateien erstellen/ändern/löschen
- Tests ausführen
- Server starten
- Git commits durchführen

### Verwendung für automatisierte Tests:
```bash
# Normale Ausführung (mit Bestätigungen):
claude

# Automatisierter Test-Modus (GEFÄHRLICH!):
claude --dangerously-skip-permissions

# Mit Timeout für Sicherheit:
./claude-init.sh  # 30min Timeout + Monitoring
```

### Sicherheitsmaßnahmen beim Testing:
1. **Backup VOR dem Test**:
   ```bash
   ./backup-essential.sh
   git stash  # Sichere aktuelle Änderungen
   ```

2. **Monitoring aktivieren**:
   ```bash
   # claude-init.sh macht das automatisch:
   - File change monitoring (warnt bei >30 Änderungen)
   - Session logging
   - Automatic timeout
   ```

3. **Post-Test Check**:
   ```bash
   ./check-session.sh  # Review alle Änderungen
   git diff            # Prüfe was geändert wurde
   ```

## 🚀 Quick Start für neues Projekt

1. **Setup MIT Sicherheit**:
   ```bash
   # Backup first!
   git add -A && git commit -m "Pre-test backup"
   
   # Install test dependencies
   npm init -y
   npm install --save-dev playwright
   cp test-app-visual.js new-project/
   
   # Run Claude in dangerous mode for testing
   claude --dangerously-skip-permissions
   ```

2. **Anpassen**:
   - URLs in Tests ändern
   - Selektoren anpassen
   - Test-Cases definieren

3. **Ausführen**:
   ```bash
   node test-app-visual.js
   # oder
   npx playwright test
   ```

## 💡 Lessons Learned

1. **Automatisierung spart Zeit** - Einmal setup, immer wieder nutzen
2. **Visuelle Tests sind wertvoll** - Screenshots zeigen sofort Probleme
3. **Dokumentation ist kritisch** - Hilft beim nächsten Mal
4. **Server-Management ist tricky** - Ports und Prozesse im Auge behalten
5. **Incremental ist besser** - Kleine Schritte, häufige Tests
6. **Dangerous Mode mit Vorsicht** - IMMER Backups vor `--dangerously-skip-permissions`

## 🔴 WARNUNG: Dangerous Mode Best Practices

### DO's:
- ✅ Immer Backup vor dangerous mode
- ✅ Git commit vor großen Tests
- ✅ Session monitoring aktivieren
- ✅ Timeout setzen (max 30min)
- ✅ Nach Session alle Änderungen reviewen

### DON'Ts:
- ❌ Nie ohne Backup arbeiten
- ❌ Nie in Production verwenden
- ❌ Nie länger als 30min laufen lassen
- ❌ Nie ohne Git-Repository arbeiten
- ❌ Nie kritische Dateien ohne Review committen

## 📝 Checkliste für Selbst-Tests

- [ ] Code-Analyse durchgeführt (Grep/Read)
- [ ] Test-Scripts erstellt/angepasst
- [ ] Server gestartet und verifiziert
- [ ] Tests ausgeführt
- [ ] Screenshots erstellt
- [ ] Ergebnisse dokumentiert
- [ ] TROUBLESHOOTING.md aktualisiert
- [ ] Git commit mit aussagekräftiger Message

## 🤖 Automatisierte Test-Session mit Claude

### Kompletter Workflow für unbeaufsichtigte Tests:

```bash
# 1. Vorbereitung
git add -A && git commit -m "Pre-test checkpoint"
./backup-essential.sh

# 2. Test-Session starten
cat > test-instructions.md << EOF
Bitte führe folgende Tests automatisch durch:
1. Teste alle UI-Komponenten
2. Verifiziere Photo Import
3. Prüfe Canvas-Funktionen
4. Erstelle Test-Report
5. Committe nur bei Erfolg
EOF

# 3. Claude im Dangerous Mode mit Instruktionen
claude --dangerously-skip-permissions < test-instructions.md

# 4. Post-Session Review
./check-session.sh
git diff
git log --oneline -5
```

### Beispiel für automatisierte Test-Instruktionen:

```markdown
# test-instructions.md
1. Führe test-app-visual.js aus
2. Wenn Tests fehlschlagen:
   - Analysiere Fehler mit Grep
   - Fixe identifizierte Probleme
   - Teste erneut
3. Wenn Tests erfolgreich:
   - Erstelle Screenshot-Dokumentation
   - Update TEST-REPORT.md
   - Committe mit Message "test: Automated test run [date]"
4. Stoppe nach max 20 Minuten
```

### Session-Monitoring während Tests:

```bash
# In separatem Terminal:
tail -f claude-session.log

# Oder mit fswatch:
fswatch -o . | while read f; do 
  echo "File changed: $(date)"
  git status --short
done
```

---

Dieser Workflow kann für jedes Web-Projekt adaptiert werden. Die Tools und Methoden sind universell einsetzbar.

**WICHTIG**: Der `--dangerously-skip-permissions` Flag ist mächtig aber gefährlich. Nutze ihn nur mit angemessenen Sicherheitsvorkehrungen!