# Claude Code Test Workflow - Automatisierte Browser-Tests mit Fehlererfassung

## 🎯 Überblick

Dieses Dokument beschreibt, wie ich als Claude Code eigenständig Browser-basierte Anwendungen testen kann, ohne dass der Benutzer manuell im Browser testen muss. Der Workflow wurde erfolgreich beim SubwayRunner-Projekt eingesetzt.

## 🛠️ Technologie-Stack

### Playwright (Empfohlen)
- **Vorteile**: 
  - Bereits in vielen Projekten installiert
  - Unterstützt headless und headed Mode
  - Exzellente Fehlererfassung
  - Kann mit Browser-DevTools interagieren
  - Cross-Browser Support (Chrome, Firefox, Safari)

### Puppeteer (Alternative)
- Ähnliche Funktionalität wie Playwright
- Fokus auf Chrome/Chromium
- Muss oft erst installiert werden

## 📋 Test-Workflow Schritt für Schritt

### 1. HTTP Server starten
```bash
# Server im Hintergrund starten
python3 -m http.server 8001 > /dev/null 2>&1 & echo "Server started on port 8001"
```

### 2. Automatisierten Error-Capture Test erstellen

```javascript
// automated-error-capture.js
import { chromium } from '@playwright/test';
import fs from 'fs';

async function captureGameErrors() {
    const browser = await chromium.launch({
        headless: false,  // Browser sichtbar für Debugging
        devtools: true    // DevTools automatisch öffnen
    });
    
    const page = await browser.newPage();
    
    // KRITISCH: Console-Nachrichten abfangen
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('❌ Console Error:', msg.text());
            const location = msg.location();
            if (location.url && location.lineNumber) {
                console.log(`   at ${location.url}:${location.lineNumber}`);
            }
        }
    });
    
    // KRITISCH: Uncaught Exceptions abfangen
    page.on('pageerror', error => {
        console.log('🔴 Page Error:', error.toString());
        if (error.stack) {
            console.log('   Stack:', error.stack.split('\n')[0]);
        }
    });
    
    // Seite laden
    await page.goto('http://localhost:8001', {
        waitUntil: 'networkidle'
    });
    
    // Auf Initialisierung warten
    await page.waitForTimeout(3000);
    
    // Game State prüfen
    const gameState = await page.evaluate(() => {
        return {
            hasGameInstance: typeof window.gameInstance !== 'undefined',
            hasRenderer: window.gameInstance?.renderer ? true : false,
            // ... weitere Checks
        };
    });
    
    // Error Report generieren
    const report = {
        timestamp: new Date().toISOString(),
        gameState,
        errors: consoleErrors,
        totalErrors: consoleErrors.length
    };
    
    fs.writeFileSync('error-report.json', JSON.stringify(report, null, 2));
    await page.screenshot({ path: 'game-state.png' });
    
    await browser.close();
}
```

### 3. Button Clicks und Interaktionen

**Ja, ich kann Buttons klicken!** Hier ist wie es funktioniert:

```javascript
// Button finden und klicken
const startButton = await page.$('button:has-text("Challenge starten!")');
if (startButton) {
    await startButton.click();
    console.log('✅ Button clicked!');
}

// Mehrere Buttons analysieren
const buttons = await page.$$('button');
for (let i = 0; i < buttons.length; i++) {
    const text = await buttons[i].textContent();
    console.log(`Button ${i + 1}: "${text}"`);
}

// Button-State prüfen
const buttonInfo = await page.evaluate(() => {
    const btn = document.querySelector('button');
    const rect = btn.getBoundingClientRect();
    return {
        text: btn.textContent,
        visible: rect.width > 0 && rect.height > 0,
        clickable: !btn.disabled,
        bounds: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    };
});
```

### 4. Erweiterte Interaktionen für Drawing Apps

Für Zeichen-Apps sind komplexere Interaktionen möglich:

```javascript
// Canvas-Interaktionen
async function drawOnCanvas(page) {
    // Canvas Element finden
    const canvas = await page.$('canvas');
    const box = await canvas.boundingBox();
    
    // Mausbewegungen simulieren
    await page.mouse.move(box.x + 50, box.y + 50);
    await page.mouse.down();
    
    // Linie zeichnen
    for (let i = 0; i < 100; i++) {
        await page.mouse.move(box.x + 50 + i, box.y + 50 + i);
        await page.waitForTimeout(10); // Smooth movement
    }
    
    await page.mouse.up();
    
    // Touch Events für Mobile
    await page.touchscreen.tap(box.x + 100, box.y + 100);
}

// Tastatur-Eingaben
await page.keyboard.type('Hello World');
await page.keyboard.press('Enter');

// Drag & Drop
await page.dragAndDrop('#source', '#target');

// File Upload
const fileInput = await page.$('input[type="file"]');
await fileInput.setInputFiles('path/to/file.png');
```

### 5. Fehleranalyse-Strategien

#### Gruppierung von Fehlern
```javascript
const errorGroups = {};
consoleErrors.forEach(error => {
    const key = error.text;
    if (!errorGroups[key]) {
        errorGroups[key] = {
            message: error.text,
            count: 0,
            location: error.location,
            firstOccurrence: error.timestamp
        };
    }
    errorGroups[key].count++;
});
```

#### Filtern von unwichtigen Fehlern
```javascript
// 404 Fehler separat behandeln
const non404Errors = errors.filter(e => !e.text.includes('404'));
const criticalErrors = errors.filter(e => 
    e.text.includes('ReferenceError') || 
    e.text.includes('TypeError') ||
    e.text.includes('SyntaxError')
);
```

## 🔍 Debugging-Techniken

### 1. Netzwerk-Analyse
```javascript
// Alle Script-Loads überwachen
page.on('response', async response => {
    const url = response.url();
    if (url.endsWith('.js')) {
        const content = await response.text();
        if (content.includes('export ')) {
            console.log(`Found ES6 export in: ${url}`);
        }
    }
});
```

### 2. DOM-Manipulation Testing
```javascript
// DOM-Änderungen überwachen
await page.evaluate(() => {
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            console.log('DOM changed:', mutation.type);
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
});
```

### 3. Performance Monitoring
```javascript
const metrics = await page.metrics();
console.log('Performance metrics:', {
    timestamp: metrics.Timestamp,
    documents: metrics.Documents,
    jsHeapUsed: metrics.JSHeapUsedSize,
    nodes: metrics.Nodes
});
```

## 🎨 Spezifische Strategien für Drawing Apps

### Canvas Testing
```javascript
async function testDrawingApp(page) {
    // Canvas State erfassen
    const canvasData = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        
        // Canvas als Data URL
        const dataUrl = canvas.toDataURL();
        
        // Pixel-Daten analysieren
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        
        // Check if canvas has content
        let hasContent = false;
        for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i + 3] > 0) { // Alpha channel
                hasContent = true;
                break;
            }
        }
        
        return { dataUrl, hasContent, width: canvas.width, height: canvas.height };
    });
    
    // Screenshot für visuellen Vergleich
    await page.screenshot({ path: 'canvas-state.png' });
}
```

### Tool Selection
```javascript
// Werkzeug auswählen
await page.click('[data-tool="brush"]');

// Farbe ändern
await page.fill('input[type="color"]', '#ff0000');

// Pinselgröße
await page.fill('input[type="range"]', '10');
```

## 📊 Erfolgsmetriken

### Was ich erreicht habe:
1. ✅ **Fehler-Erfassung**: Alle Console-Errors automatisch erfasst
2. ✅ **Button-Interaktion**: Start-Button erfolgreich geklickt
3. ✅ **Fehler-Diagnose**: Exakte Zeilen und Stack-Traces identifiziert
4. ✅ **Automatisierte Fixes**: Fehler ohne manuelle Tests behoben
5. ✅ **Visual Testing**: Screenshots zur Verifikation

### Limitierungen:
- WebGL/3D Rendering nur begrenzt testbar
- Audio-Tests schwierig (aber Fehler erfassbar)
- Komplexe Animationen schwer zu verifizieren

## 🚀 Best Practices

1. **Immer mit sichtbarem Browser testen** (headless: false) für besseres Debugging
2. **Multiple Tool-Calls nutzen** für parallele Tests
3. **Error-Gruppierung** für bessere Übersicht
4. **Screenshots** nach wichtigen Aktionen
5. **Timeouts** zwischen Aktionen für Stabilität
6. **DOM-Ready Checks** vor Interaktionen

## 💡 Zusammenfassung

Dieser Workflow ermöglicht es mir:
- Browser-Apps vollständig automatisiert zu testen
- Fehler aus der Console zu erfassen
- Mit UI-Elementen zu interagieren (Clicks, Typing, Drawing)
- Visuelles Feedback durch Screenshots zu erhalten
- Bugs zu finden und zu beheben ohne manuelle Tests

**Für Drawing Apps**: Ja, ich kann auch zeichnen! Playwright unterstützt Mouse-Events, Touch-Events und Canvas-Interaktionen. Die einzige Einschränkung ist, dass ich nicht "sehen" kann, was gezeichnet wurde, aber ich kann:
- Prüfen ob Canvas Content hat
- Screenshots machen
- Pixel-Daten analysieren
- Tools und Farben wechseln
- Zeichen-Gesten simulieren

Dieser Workflow sollte für alle Browser-basierten Projekte funktionieren!