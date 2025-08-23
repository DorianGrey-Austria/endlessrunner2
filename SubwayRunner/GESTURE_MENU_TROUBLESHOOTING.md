# 🎮 GESTENSTEUERUNGS-MENÜ TROUBLESHOOTING GUIDE

## 📅 Version: V5.3.39
## 🌐 Live: https://ki-revolution.at/

---

## ✅ VERBESSERUNGEN GEGENÜBER VORHERIGER VERSION

### NEU: Steuerungsauswahl VOR Spielstart
- **3-Schritt Menü**: 
  1. Wahl zwischen Gestensteuerung oder Klassisch
  2. Kamera-Setup bei Gestensteuerung
  3. Spiel startet mit gewählter Steuerung
- **Keine Unterbrechung** während des Spiels nötig
- **Bessere UX** durch klare Auswahl vorab

---

## ⚠️ BEKANNTE PROBLEME & LÖSUNGEN

### 🔴 Problem 1: "Kamera kann nicht initialisiert werden" beim ersten Klick

**Symptome:**
- Erster Klick auf "Mit Gestensteuerung" → Fehlermeldung
- Zweiter Klick funktioniert meistens
- Schwarzes Canvas-Feld statt Kamera-Vorschau

**Root Cause:**
- MediaPipe Camera API braucht manchmal zwei Versuche
- Browser-Permissions werden verzögert erteilt
- DOM nicht vollständig geladen beim ersten Versuch

**Lösungen:**
1. **Automatischer Retry** (bereits implementiert):
   - System versucht automatisch 2x
   - Wartet 500ms zwischen Versuchen
   
2. **Manuelle Lösungen:**
   - Klicken Sie "Zurück" und erneut "Mit Gestensteuerung"
   - Browser-Refresh mit F5
   - Chrome/Edge verwenden (Safari NICHT unterstützt!)
   - Kamera-Berechtigungen in Browser-Settings prüfen

---

### 🔴 Problem 2: Schwarzes Kamera-Feld

**Symptome:**
- Canvas zeigt nur schwarzen Hintergrund
- Keine Video-Vorschau sichtbar
- Aber Gesichtserkennung funktioniert trotzdem

**Root Cause:**
- Video-Element ist minimal (1x1 Pixel) für Performance
- Canvas-Rendering startet verzögert
- MediaPipe rendert direkt auf Canvas, nicht Video

**Lösungen:**
1. **Warten Sie 2-3 Sekunden** - Canvas wird automatisch aktualisiert
2. **"Erneut versuchen" Button** nutzen wenn verfügbar
3. **Zurück → Erneut wählen** für kompletten Neustart

---

### 🔴 Problem 3: Y-Achse (Jump/Duck) reagiert nicht

**Symptome:**
- Horizontale Bewegung (Links/Rechts) funktioniert
- Vertikale Bewegung (Jump/Duck) reagiert nicht
- Console zeigt keine JUMP/DUCK Meldungen

**Root Cause:**
- Y-Achsen Boundaries zu konservativ (45%/55%)
- Kopfposition nicht mittig im Bild
- Schlechte Beleuchtung erschwert Erkennung

**Lösungen:**
1. **Optimale Position einnehmen:**
   - Gesicht mittig im Bild
   - Abstand zur Kamera: 40-80cm
   - Gute, gleichmäßige Beleuchtung
   
2. **Kopfbewegungen verstärken:**
   - Deutlichere Bewegung nach oben/unten
   - Langsamer bewegen für bessere Erkennung
   
3. **Browser-Console checken:**
   - F12 → Console
   - Suchen nach "Y-AXIS:" Meldungen
   - Werte sollten zwischen 0.0 und 1.0 liegen

---

## 🚀 BEST PRACTICES FÜR OPTIMALE FUNKTION

### Browser & System
✅ **Chrome oder Edge verwenden** (Safari funktioniert NICHT!)
✅ **HTTPS ist Pflicht** (ki-revolution.at hat das)
✅ **Aktuelle Browser-Version** verwenden
✅ **Kamera-Permissions** vor Start erlauben

### Setup & Umgebung
✅ **Gute Beleuchtung** - Gleichmäßig, nicht zu dunkel
✅ **Ruhiger Hintergrund** - Keine Bewegung hinter dir
✅ **Richtiger Abstand** - 40-80cm von Kamera
✅ **Kopf mittig** - Gesicht sollte gut sichtbar sein

### Bei Problemen
✅ **F5 drücken** für kompletten Neustart
✅ **Cache leeren** mit Ctrl+Shift+R
✅ **Andere Tabs schließen** die Kamera nutzen
✅ **Browser neu starten** bei hartnäckigen Problemen

---

## 🔧 TECHNISCHE DETAILS

### Initialisierungs-Flow
1. **Menu Step 1**: User wählt Steuerungsart
2. **Menu Step 2**: Kamera-Initialisierung mit Retry
3. **Singleton Pattern**: Nur eine Controller-Instanz
4. **Preview Mode**: Test ohne Spiel-Beeinflussung
5. **Game Start**: Controller bereits aktiv

### Implementierte Fixes (V5.3.39)
- **Video-Element**: Minimal sichtbar (1x1px) statt display:none
- **Retry-Mechanismus**: 2 automatische Versuche
- **Singleton Controller**: Verhindert Mehrfach-Initialisierung
- **Delay vor Start**: 100ms für DOM-Readiness
- **Bessere Fehlerbehandlung**: Klare Meldungen + Retry-Button

### Console Commands für Debugging
```javascript
// Check if controller exists
console.log('Global Controller:', window.globalGestureController);

// Check gesture status
console.log('Gesture Enabled:', gestureEnabled);

// Check video element
document.getElementById('gesturePreview').srcObject

// Force retry
initializeGesturePreview();
```

---

## 📊 STATUS MATRIX

| Feature | Status | Notes |
|---------|--------|-------|
| Horizontale Steuerung | ✅ Funktioniert | 3-Lane System perfekt |
| Vertikale Steuerung | ⚠️ Teilweise | Y-Achse needs tuning |
| Kamera-Init | ⚠️ Mit Retry | 2. Versuch meist OK |
| Canvas-Preview | ⚠️ Verzögert | Schwarzes Bild initial |
| Browser-Support | ✅ Chrome/Edge | Safari nicht unterstützt |

---

## 🆘 SUPPORT

Bei anhaltenden Problemen:
1. Screenshot der Console-Fehler machen (F12)
2. Browser und Version notieren
3. Problem in GitHub Issues melden
4. Alternative: Klassische Steuerung nutzen

---

**Dokumentiert von**: Claude Code Assistant
**Letzte Aktualisierung**: 23.08.2025
**Version**: V5.3.39-MENU-FIX