# MCP Server Setup Guide für Endless Runner Projekt

## 🚀 Quick Setup

Diese Anleitung hilft dir, die MCP Server für das Endless Runner Projekt optimal zu konfigurieren.

## 📋 Voraussetzungen

1. **Node.js 18+** installiert
2. **Docker Desktop** (optional, für erweiterte Features)
3. **GitHub Account** mit Personal Access Token
4. **Claude Desktop** installiert

## 🔧 Installation Schritt für Schritt

### 1. Konfigurationsdatei kopieren

Die `claude_desktop_config.json` aus diesem Repository muss in den Claude Desktop Konfigurationsordner kopiert werden:

**macOS:**
```bash
cp /Users/doriangrey/Desktop/coding/EndlessRunner/claude_desktop_config.json ~/Library/Application\ Support/Claude/
```

**Windows:**
```powershell
copy C:\Users\doriangrey\Desktop\coding\EndlessRunner\claude_desktop_config.json %APPDATA%\Claude\
```

### 2. Tokens und API Keys einfügen

Öffne die kopierte Konfigurationsdatei und ersetze die Platzhalter:

1. **GitHub Token** (erforderlich):
   - Gehe zu https://github.com/settings/tokens
   - Generate new token (classic)
   - Wähle Scopes: `repo`, `workflow`, `read:org`
   - Ersetze `ghp_DEIN_TOKEN_HIER` mit deinem Token

2. **Brave Search API Key** (optional):
   - Registriere dich bei https://brave.com/search/api/
   - Ersetze `DEIN_BRAVE_API_KEY_HIER` mit deinem Key

### 3. Docker Images vorbereiten (optional)

Falls du die Docker-basierten MCPs nutzen möchtest:

```bash
# ImageMagick für Asset-Optimierung
docker pull dpokidov/imagemagick:latest

# Erstelle Assets-Verzeichnis falls nicht vorhanden
mkdir -p /Users/doriangrey/Desktop/coding/EndlessRunner/SubwayRunner/assets
```

### 4. Claude Desktop neu starten

Nach der Konfiguration muss Claude Desktop komplett neu gestartet werden:
1. Claude Desktop beenden (Cmd+Q auf Mac, Alt+F4 auf Windows)
2. Claude Desktop neu starten
3. Im Chat-Input sollte nun ein Hammer-Icon ⚒️ erscheinen

### 5. Funktionstest

Teste die Installation mit folgenden Befehlen im Claude Chat:

```
# Filesystem Test
"Liste alle Dateien im SubwayRunner Ordner"

# Git Test  
"Zeige den aktuellen Git Status"

# GitHub Test (wenn Token konfiguriert)
"Zeige meine letzten GitHub Commits"

# Context7 Test
"use context7 und erkläre Three.js v0.150"
```

## 🎮 Projekt-spezifische MCP Features

### Für Gesture Control Development

- **Playwright MCP**: Automatisierte Tests für MediaPipe Gesture Detection
- **Filesystem MCP**: Direkter Zugriff auf index.html und Test-Dateien
- **Git MCP**: Versionskontrolle mit automatischen Commits

### Für Asset Management

- **ImageMagick MCP**: Sprite-Sheet Generation, Texture-Optimierung
- **Filesystem MCP**: Asset-Upload und -Organisation

### Für Performance Testing

- **Playwright MCP**: Cross-Browser Performance Tests
- **Memory MCP**: Session-übergreifende Performance-Metriken
- **Fetch MCP**: API-Performance Monitoring

## 🛠️ Troubleshooting

### "MCP Server not responding"

**Lösung 1:** Node.js Version prüfen
```bash
node --version  # Sollte v18+ sein
npm --version   # Sollte v9+ sein
```

**Lösung 2:** Pfade in Konfiguration prüfen
- Alle Pfade müssen absolut sein
- Benutzername muss korrekt sein
- Keine Tippfehler in Pfaden

### "Permission denied"

**macOS:** Terminal-Zugriff erlauben
```bash
chmod +x ~/Library/Application\ Support/Claude/
```

**Windows:** Als Administrator ausführen

### "Docker container fails to start"

**Lösung:** Docker Desktop prüfen
1. Docker Desktop muss laufen
2. Ausreichend RAM zugewiesen (min. 4GB)
3. Images vorhanden: `docker images`

### "GitHub token invalid"

**Lösung:** Token-Berechtigungen prüfen
- Token muss `repo` Scope haben
- Token darf nicht abgelaufen sein
- Keine Leerzeichen im Token

## 📊 MCP Server Übersicht für Endless Runner

| Server | Zweck | Status | Priorität |
|--------|-------|--------|-----------|
| filesystem | Dateizugriff | ✅ Aktiv | Kritisch |
| git | Version Control | ✅ Aktiv | Kritisch |
| github | PR/Issue Management | ⚙️ Token nötig | Hoch |
| memory | Session-Daten | ✅ Aktiv | Mittel |
| playwright | Browser-Tests | ✅ Aktiv | Hoch |
| context7 | Doku-Injection | ✅ Aktiv | Mittel |
| brave-search | Web-Suche | ⚙️ API Key nötig | Niedrig |
| fetch | API-Calls | ✅ Aktiv | Mittel |
| imagemagick | Asset-Optimierung | 🐳 Docker nötig | Niedrig |
| godot | Engine-Alternative | ⚙️ Optional | Niedrig |
| sqlite | Spielstatistiken | ✅ Aktiv | Niedrig |

## 🚦 Nächste Schritte

1. **Basis-Setup** (filesystem, git, memory) - Sofort einsatzbereit
2. **GitHub Integration** - Nach Token-Konfiguration
3. **Testing Tools** (playwright) - Für Gesture-Control Tests
4. **Docker Tools** - Bei Bedarf für erweiterte Features

## 💡 Pro Tips

1. **Minimale Konfiguration starten**: Beginne nur mit filesystem, git und memory
2. **Schrittweise erweitern**: Füge Server nach Bedarf hinzu
3. **Logs prüfen**: Bei Problemen in `~/Library/Logs/Claude/` (Mac) schauen
4. **Performance**: Nicht benötigte Server aus Config entfernen
5. **Updates**: Regelmäßig `npm update -g` für aktuelle MCP-Versionen

## 🔗 Weiterführende Links

- [MCP Protocol Dokumentation](https://modelcontextprotocol.org)
- [Claude Desktop Docs](https://claude.ai/docs/desktop)
- [Docker MCP Catalog](https://hub.docker.com/search?q=mcp)
- [GitHub MCP Registry](https://github.com/topics/mcp-server)

---

Bei Fragen oder Problemen, erstelle ein Issue im Repository oder konsultiere die MCP_TIPS.md für detaillierte Informationen.