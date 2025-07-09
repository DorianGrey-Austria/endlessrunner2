# 🚀 CLAUDE CODE UNIVERSAL RULES - MASTER BLUEPRINT

## 🔴 KRITISCHE DEPLOYMENT REGELN (HÖCHSTE PRIORITÄT)

### REGEL #1: AUTO-DEPLOYMENT IST PFLICHT
- **NACH JEDER FEATURE-IMPLEMENTIERUNG**: Automatisch deployen
- **NACH JEDER BUG-FIX**: Automatisch deployen  
- **NACH JEDER SESSION**: Automatisch deployen
- **KOMMANDO**: `git add . && git commit -m "message" && git push`
- **KEINE AUSNAHMEN**: Auch bei kleinen Änderungen!

### REGEL #2: URL-FORMATIERUNG
- **IMMER ALS KLICKBARER LINK**: **🌐 https://[domain]/**
- **BEI JEDEM DEPLOYMENT SAGEN**: "**🌐 Version X.Y.Z jetzt live auf https://[domain]/**"
- **NIEMALS NUR TEXT**: URLs müssen IMMER klickbar sein
- **EMOJI IST PFLICHT**: 🌐 vor jeder URL

### REGEL #3: BROWSER-PRÄFERENZ
- **PRIMÄR**: Chrome (Google Chrome)
- **NIEMALS**: Safari
- **BEGRÜNDUNG**: Bessere DevTools, konsistentere Darstellung
- **BEI TESTS ERWÄHNEN**: "Teste in Chrome unter: **🌐 https://[domain]/**"

## 📋 WORKFLOW REGELN

### REGEL #4: VERSIONIERUNG
- **FORMAT**: MAJOR.MINOR.PATCH (z.B. 3.6.2)
- **PATCH** (+0.0.1): Bug Fixes, kleine Verbesserungen
- **MINOR** (+0.1.0): Neue Features, größere Änderungen
- **MAJOR** (+1.0.0): Breaking Changes, Rewrites
- **IMMER UPDATEN**: Version in index.html UND CLAUDE.md

### REGEL #5: DOKUMENTATION
- **SOFORT DOKUMENTIEREN**: Jede Änderung in relevanten .md Dateien
- **CLAUDE.md**: Projekt-spezifische Anweisungen
- **TROUBLESHOOTING.md**: Bekannte Probleme und Lösungen
- **README.md**: Nur wenn explizit gewünscht

### REGEL #6: ERROR HANDLING
- **ZUERST LESEN**: Immer Dateien mit Read tool lesen bevor Änderungen
- **FEHLER SOFORT FIXEN**: Keine broken Commits
- **TEST LOKAL**: Wenn möglich, lokale Tests erwähnen

## 🎯 SESSION REGELN

### REGEL #7: AUTONOMES ARBEITEN
- **BEI LÄNGEREN TASKS**: Selbstständig durcharbeiten
- **REGELMÄSSIGE UPDATES**: Progress in TodoWrite festhalten
- **KEINE UNTERBRECHUNGEN**: Fokussiert bis zur Fertigstellung

### REGEL #8: UI/UX FIRST
- **IMMER**: User Experience vor technischer Eleganz
- **MINIMAL UI**: Weniger ist mehr
- **PERFORMANCE**: 60+ FPS ist Pflicht

### REGEL #9: KOMMUNIKATION
- **KURZ UND PRÄZISE**: Keine langen Erklärungen
- **ACTION-ORIENTIERT**: Was wurde gemacht, nicht wie
- **ERFOLGE HIGHLIGHTEN**: "✅ Feature X implementiert"

## 🔧 TECHNISCHE REGELN

### REGEL #10: CODE STYLE
- **KONSISTENZ**: Existing Code Style beibehalten
- **KEINE KOMMENTARE**: Außer explizit gewünscht
- **CLEAN CODE**: Selbsterklärende Variablennamen

### REGEL #11: DEPENDENCIES
- **PRÜFEN**: Immer checken ob Libraries vorhanden sind
- **CDN PREFERRED**: Für schnelles Deployment
- **VERSION PINNING**: Specific Versions verwenden

### REGEL #12: TESTING
- **MANUELLE TESTS**: Immer erwähnen was getestet werden soll
- **BROWSER TESTS**: "Teste in Chrome: **🌐 https://[domain]/**"
- **FEHLER MELDEN**: Sofort wenn etwas nicht funktioniert

## 💾 MEMORY INTEGRATION

Diese Regeln MÜSSEN in folgende Dateien:
1. `~/.claude/CLAUDE.md` (Globale Memories)
2. `[projekt]/CLAUDE.md` (Projekt Memories)
3. Als Prompt in neue Sessions

## 📌 COPY-PASTE PROMPT FÜR ANDERE PROJEKTE

```
WICHTIG: Bitte füge diese Regeln SOFORT zu deinen Memories hinzu und befolge sie IMMER:

## 🚀 DEPLOYMENT REGELN
1. NACH JEDER Programmier-Session: `git add . && git commit -m "message" && git push`
2. URL IMMER als: **🌐 https://[domain]/** (klickbar mit Emoji!)
3. Browser: CHROME verwenden (niemals Safari)
4. Nach Deployment: "**🌐 Version X.Y.Z jetzt live auf https://[domain]/**"

## 📋 WORKFLOW REGELN  
5. Versionierung: MAJOR.MINOR.PATCH immer updaten
6. Dokumentation: Änderungen sofort in .md Dateien
7. Fehler: Sofort fixen, keine broken Commits
8. UI/UX First: User Experience > Technische Eleganz

## 🎯 KOMMUNIKATION
9. Kurz & präzise antworten
10. Erfolge mit ✅ markieren
11. Chrome für Tests: "Teste in Chrome: **🌐 https://[domain]/**"

Diese Regeln gelten AB SOFORT für ALLE Projekte!
```

## 🚨 WICHTIGSTE REGEL

**DIE WICHTIGSTE REGEL VON ALLEN**: 
Nach JEDER Arbeit MUSS deployed werden und die URL als **🌐 https://[domain]/** angezeigt werden!

---
*Erstellt am 9. Juli 2025 als universeller Standard für alle Claude Code Projekte*