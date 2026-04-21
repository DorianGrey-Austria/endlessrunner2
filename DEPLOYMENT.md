# 🚀 Deployment Guide: EndlessRunner mit Head Tracking auf endlessrunner.vibecoding.company

## 📋 Übersicht

Dieses Dokument beschreibt, wie das EndlessRunner-MVP Spiel mit der neuen Head Tracking Funktion auf endlessrunner.vibecoding.company deployed wird.

## 🔧 Vorbereitung

### 1. GitHub Repository erstellen

```bash
# Im EndlessRunner-MVP Verzeichnis
git init
git add .
git commit -m "Initial commit: EndlessRunner with Head Tracking"

# GitHub Repository erstellen und verbinden
git remote add origin https://github.com/[your-username]/endless-runner-mobile.git
git branch -M main
git push -u origin main
```

### 2. GitHub Secrets konfigurieren

Gehe zu: `https://github.com/[your-username]/endless-runner-mobile/settings/secrets/actions`

Erstelle folgende Secrets (Werte aus Hostinger hPanel):

#### FTP_SERVER
```
Name: FTP_SERVER
Value: [IP-Adresse aus Hostinger, z.B. 145.223.112.234]
```

#### FTP_USERNAME
```
Name: FTP_USERNAME
Value: [FTP-Username aus Hostinger, z.B. u265545399.endlessrunner.vibecoding.company]
```

#### FTP_PASSWORD
```
Name: FTP_PASSWORD
Value: [Dein FTP-Passwort]
```

## 🚀 Deployment

### Automatisches Deployment

Jeder Push zum `main` Branch triggert automatisch das Deployment:

```bash
git add .
git commit -m "Update: Neue Features"
git push origin main
```

### Manuelles Deployment

1. Gehe zu GitHub Actions
2. Wähle "Deploy EndlessRunner to endlessrunner.vibecoding.company"
3. Klicke "Run workflow"

## 🌐 Live URLs

Nach erfolgreichem Deployment:

- **Hauptspiel**: https://endlessrunner.vibecoding.company/endless-runner-mobile/
- **Head Tracking Demo**: https://endlessrunner.vibecoding.company/endless-runner-mobile/head-tracking-demo.html
- **README**: https://endlessrunner.vibecoding.company/endless-runner-mobile/HEAD_TRACKING_README.md

## 📱 Head Tracking Features

### Aktivierung im Spiel

1. Öffne das Spiel auf einem mobilen Gerät
2. Gehe zu Settings (⚙️)
3. Aktiviere "Head Tracking (Beta)"
4. Erlaube Kamera-Zugriff
5. Optional: Kalibriere für beste Ergebnisse

### Steuerung

- **Kopf hoch/Augenbrauen** → Springen
- **Kopf runter** → Ducken
- **Kopf gerade** → Normal laufen

## 🔍 Troubleshooting

### Kamera funktioniert nicht

- Stelle sicher, dass HTTPS verwendet wird
- Prüfe Browser-Berechtigungen
- Verwende Chrome oder Safari (neueste Version)

### Head Tracking reagiert nicht

- Sorge für gute Beleuchtung
- Halte das Gerät stabil
- Nutze die Kalibrierung
- Falls Probleme bestehen, nutze Touch-Controls

### Deployment schlägt fehl

1. Prüfe GitHub Secrets
2. Stelle sicher, dass alle Dateien vorhanden sind
3. Checke GitHub Actions Logs

## 📊 Performance

### Mobile Optimierungen

- Frame Skipping auf 15 FPS für Low-End Geräte
- Adaptive Auflösung (320x240 bis 640x480)
- Automatischer Fallback auf Touch bei schlechter Performance

### Akku-Verbrauch

- Head Tracking: ~10% zusätzlicher Verbrauch
- Empfehlung: Nutze Head Tracking für kurze Sessions

## 🛠️ Wartung

### Updates deployen

```bash
# Lokale Änderungen
git add .
git commit -m "Fix: Verbesserte Gesten-Erkennung"
git push origin main

# Deployment läuft automatisch
```

### Rollback bei Problemen

```bash
# Zu vorherigem Stand zurück
git log --oneline
git revert [commit-hash]
git push origin main
```

## 📝 Wichtige Dateien

- `headTrackingController.js` - Head Tracking Logik
- `head-tracking-demo.html` - Standalone Demo
- `index.html` - Hauptspiel mit UI für Head Tracking
- `style.css` - Styles inkl. Head Tracking UI
- `script.js` - Game Integration

## ✅ Deployment Checklist

- [ ] GitHub Repository erstellt
- [ ] GitHub Secrets konfiguriert (FTP_SERVER, FTP_USERNAME, FTP_PASSWORD)
- [ ] GitHub Actions Workflow vorhanden (.github/workflows/deploy-to-hostinger.yml)
- [ ] Erster Push durchgeführt
- [ ] Deployment in GitHub Actions grün
- [ ] Live-URL funktioniert
- [ ] HTTPS aktiv
- [ ] Head Tracking Demo getestet

## 🎉 Fertig!

Das Spiel mit Head Tracking ist jetzt live auf endlessrunner.vibecoding.company!

Bei Fragen oder Problemen, siehe die ausführliche Dokumentation in `github.hostinger.connection.md`.