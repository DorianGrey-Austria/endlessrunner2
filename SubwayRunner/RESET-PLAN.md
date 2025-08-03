# 🔄 RESET PLAN - Zurück zu V4.6.11 + Minimale Fixes

## 📅 Datum: 27.07.2025 23:15 CET

## 🎯 **Ziel**
Stabiles Spiel mit korrekt positionierten Collectibles - OHNE Crashes, OHNE Komplexität

## 📊 **Aktuelle Situation**
- **Jetzige Version**: V4.7.6 (crasht bei 32 Sekunden)
- **Ziel-Version**: V4.6.11-PERFORMANCE-FIXED (commit: 84e845b)
- **Grund**: Letzte bekannte stabile Version ohne Crashes

## 🛠️ **Reset-Prozess**

### **Schritt 1: Git Reset** 
```bash
# Sicherheitskopie des aktuellen Standes
git stash

# Reset auf V4.6.11
git reset --hard 84e845b

# Oder alternativ (sicherer):
git checkout 84e845b -b stable-reset
```

### **Schritt 2: Minimale Fixes**

#### **A. Brokkoli-Position (bereits als gut bestätigt)**
```javascript
// In createBroccoli() function:
broccoliGroup.position.set(LANE_POSITIONS[lane], 0.3, z);
// baseY: 0.3 für Animation
```

#### **B. Kiwi-Position (einfache Lösung)**
```javascript
// In createSimpleKiwi() function:
kiwiGroup.position.set(LANE_POSITIONS[lane], 0.3, z);
// KEINE komplexen Berechnungen!
```

#### **C. KEINE weiteren Änderungen!**
- ❌ KEINE neuen Spawn-Patterns
- ❌ KEINE Performance-Optimierungen
- ❌ KEINE neuen Features
- ❌ KEINE komplexen Algorithmen

### **Schritt 3: Testing-Protokoll**

1. **Start-Test**: Spiel muss sofort starten
2. **30-Sekunden-Test**: Kein Crash bei 29-32 Sekunden
3. **60-Sekunden-Test**: Stabiles Gameplay
4. **Collectible-Test**: 
   - Brokkolis auf Y=0.3 sichtbar
   - Kiwis auf Y=0.3 sichtbar
   - Beide einsammelbar
5. **Spawn-Test**: 
   - Normale Spawn-Rate
   - Keine Cluster
   - Faire Verteilung

### **Schritt 4: Versionierung**
```javascript
// Version: 4.6.12-MINIMAL-FIX
// Datum: 27.07.2025
// Changes: ONLY collectible Y positioning
```

## ⚠️ **WICHTIGE REGELN**

### **DO's:**
✅ Minimale, isolierte Änderungen
✅ Nach JEDER Änderung testen
✅ Code-Kommentare für Änderungen
✅ Git commits nach jedem erfolgreichen Test

### **DON'Ts:**
❌ Keine "Verbesserungen" während des Fixes
❌ Keine neuen Features
❌ Keine Refactorings
❌ Keine "cleveren" Lösungen

## 📋 **Checkliste**

- [ ] Git Reset durchgeführt
- [ ] V4.6.11 läuft lokal ohne Fehler
- [ ] Brokkoli Y=0.3 implementiert
- [ ] Kiwi Y=0.3 implementiert
- [ ] 60-Sekunden-Test bestanden
- [ ] Keine Crashes
- [ ] Collectibles einsammelbar
- [ ] Version aktualisiert
- [ ] Dokumentation aktualisiert
- [ ] Git commit erstellt
- [ ] Deployment vorbereitet

## 🎮 **Expected Result**

Ein stabiles Spiel mit:
- Keine Crashes
- Collectibles auf richtiger Höhe
- Normales Spawn-Verhalten
- Spielbares Gameplay
- Happy User! 🎉

## 💡 **Merksatz für die Zukunft**

> "The best code is no code. The second best is simple code."

---

**Status**: Bereit für Reset
**Nächster Schritt**: User-Bestätigung für Git Reset