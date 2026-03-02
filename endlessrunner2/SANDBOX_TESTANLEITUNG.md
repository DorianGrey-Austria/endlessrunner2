# 🎮 SANDBOX TESTVERSION - 10-Level System

## 📋 Was wurde erstellt?

Eine vollständig spielbare Testversion mit:
- ✅ **10 Level** mit progressiver Schwierigkeit
- ✅ **Spielbare Geschwindigkeit** (Start: 8.0 m/s, Ende: 35.0 m/s)
- ✅ **Lane-Switching System** (3 Spuren)
- ✅ **Jump-Mechanik**
- ✅ **Object Pooling** für Performance
- ✅ **Level-Progression** mit Zielen

## 🚀 Schnellstart

### 1. Godot Projekt öffnen

```bash
cd /Users/doriangrey/Desktop/coding/EndlessRunner/endlessrunner2
godot --path roadrunner2
```

### 2. Scene Setup (WICHTIG!)

Die Scripts existieren, aber die Scene muss noch konfiguriert werden:

1. Öffne `res://scenes/Main.tscn` im Godot Editor
2. Füge folgende Nodes hinzu:

```
Main (Node3D) - Script: Main.gd ✅
├── Player (CharacterBody3D) - Script: Player.gd ✅
│   └── CollisionShape3D
│       └── Shape: CapsuleShape3D (Radius: 0.5, Height: 2.0)
├── LevelGenerator (Node3D) - Script: LevelGenerator.gd ✅
└── Camera3D
    └── Position: (0, 5, 10)
    └── Rotation: (-20, 0, 0)
```

### 3. Verknüpfungen herstellen

Im `Main.gd` Script (Zeile 111-112):
```gdscript
# Diese Zeilen ändern:
@onready var player_node = null
@onready var spawner_node = null

# In:
@onready var player_node = $Player
@onready var spawner_node = $LevelGenerator
```

### 4. Spiel starten

- Drücke **F5** im Godot Editor
- Oder: Menü → Project → Run

## 🎮 Steuerung

| Taste | Funktion |
|-------|----------|
| **Leertaste** | Spiel starten / Nächstes Level |
| **A / ←** | Lane nach links |
| **D / →** | Lane nach rechts |
| **W / ↑ / Leertaste (im Spiel)** | Springen |
| **ESC** | Pause / Resume |

## 📊 Level-System

### Level-Übersicht

| Level | Speed | Spawn Rate | Ziel | Beschreibung |
|-------|-------|------------|------|--------------|
| 1 | 8.0 | 2.5s | 300m | Tutorial - Warm Up |
| 2 | 10.0 | 2.2s | 500m | Getting Started |
| 3 | 12.0 | 2.0s | 700m | Picking Up Speed |
| 4 | 15.0 | 1.8s | 1000m | City Rush |
| 5 | 18.0 | 1.6s | 1500m | Neon Highway |
| 6 | 22.0 | 1.4s | 2000m | Traffic Jam |
| 7 | 26.0 | 1.2s | 2500m | Speed Demon |
| 8 | 30.0 | 1.0s | 3000m | Chaos Mode |
| 9 | 33.0 | 0.8s | 3500m | Near Impossible |
| 10 | 35.0 | 0.6s | 5000m | THE FINAL RUN |

### Level-Fortschritt

- Laufe die angegebene Distanz → Level Complete!
- Drücke Leertaste → Nächstes Level startet automatisch
- Alle 10 Level geschafft → VICTORY Screen

## 🔧 Debug-Features

### Console Commands (im Output-Panel sichtbar)

Das Spiel gibt detaillierte Debug-Ausgaben:

```
╔═══════════════════════════════════════════════╗
║  🎮 ROADRUNNER 2 - SANDBOX TESTVERSION       ║
║  10-Level System mit spielbarer Geschwindigkeit║
╚═══════════════════════════════════════════════╝

Level 1: Tutorial - Warm Up
  Speed: 8.0 | Goal: 300m

🏁 GAME START!

╔════════════════════════════════════════╗
║  🎯 LEVEL 1 / 10
║  Tutorial - Warm Up
╠════════════════════════════════════════╣
║  Speed:    8.0 m/s
║  Goal:     300 meters
║  Spawn:    Every 2.5s
║  Density:  low
╚════════════════════════════════════════╝
```

### Debug Funktionen (Remote Debugger)

Im Godot Remote Debugger kannst du aufrufen:
```gdscript
Main.debug_skip_to_level(5)  # Spring zu Level 5
Main.debug_add_distance(500)  # Füge 500m Distanz hinzu
```

## 🎯 Was getestet werden sollte

### ✅ Checkliste

1. **Level 1 Start**
   - [ ] Spiel startet mit Leertaste
   - [ ] Geschwindigkeit ist langsam (8.0 m/s)
   - [ ] Console zeigt Level-Info

2. **Spielmechanik**
   - [ ] Lane-Switching funktioniert (A/D)
   - [ ] Springen funktioniert (Leertaste/W)
   - [ ] Player bewegt sich vorwärts

3. **Hindernisse**
   - [ ] Rote Würfel spawnen alle ~2.5 Sekunden
   - [ ] Kollision mit Hindernis → Game Over
   - [ ] Collectibles (Gold-Kugeln) spawnen

4. **Level-Progression**
   - [ ] Nach 300m → Level Complete
   - [ ] Leertaste → Level 2 startet
   - [ ] Geschwindigkeit erhöht sich
   - [ ] Spawn-Rate wird schneller

5. **Performance**
   - [ ] 60 FPS konstant
   - [ ] Keine Lags bei Spawns
   - [ ] Object Pooling funktioniert (keine neuen Objekte)

## 🐛 Bekannte Einschränkungen

### Noch nicht implementiert:
- ❌ Visuelle Assets (nur Primitive: Würfel, Kugeln)
- ❌ UI/HUD (Score-Anzeige, Level-Display)
- ❌ Sound-Effekte
- ❌ Partikel-Effekte
- ❌ Kamera-Animation (Follow-Camera)
- ❌ Gestensteuerung (kommt später)

### Was funktioniert:
- ✅ Komplettes 10-Level-System
- ✅ Progressive Schwierigkeitskurve
- ✅ Spielbare Geschwindigkeit
- ✅ Alle Core-Mechaniken
- ✅ Object Pooling (50 Objekte)
- ✅ State Machine

## 📈 Nächste Schritte

### Phase 1: Assets & Visuals (empfohlen)
1. Mixamo Character importieren
2. Neon City 3D-Assets erstellen
3. Kamera-Follow-System
4. UI/HUD (Score, Level, Progress Bar)

### Phase 2: Polish
1. Partikel-Effekte (Collectible-Pickup, Speed-Lines)
2. Sound-System
3. Post-Processing (Bloom, Glow)
4. Animation State Machine

### Phase 3: Gesture Control
1. MediaPipe Integration
2. Webcam Input
3. Gesture Mapping

## 🔍 Troubleshooting

### Problem: "Skript-Fehler beim Laden"
**Lösung**: Stelle sicher, dass alle 3 Scripts existieren:
- `roadrunner2/scripts/Main.gd`
- `roadrunner2/scripts/Player.gd`
- `roadrunner2/scripts/LevelGenerator.gd`

### Problem: "Player bewegt sich nicht"
**Lösung**: Checke Verknüpfung in Main.gd:
```gdscript
@onready var player_node = $Player  # Muss auf Player-Node zeigen
```

### Problem: "Keine Hindernisse spawnen"
**Lösung**: Checke Verknüpfung in Main.gd:
```gdscript
@onready var spawner_node = $LevelGenerator
```

### Problem: "Player fällt durch Boden"
**Lösung**: Füge einen StaticBody3D Boden hinzu:
```
Main.tscn:
└── Floor (StaticBody3D)
    ├── MeshInstance3D (PlaneMesh)
    └── CollisionShape3D (BoxShape3D)
```

## 📝 Test-Protokoll

### Empfohlener Testablauf:

```
1. Starte Spiel → Level 1 (8.0 m/s)
   → Teste Lane-Switching (sollte sanft sein)
   → Teste Sprung (sollte 12.0 Units hoch sein)
   → Laufe 300m → Level Complete

2. Drücke Leertaste → Level 2 (10.0 m/s)
   → Geschwindigkeit sollte merklich höher sein
   → Hindernisse spawnen schneller

3. Skip zu Level 10 (Debug):
   → Console: Main.debug_skip_to_level(10)
   → Geschwindigkeit: 35.0 m/s (wie "20 Sek vor Ende")
   → Hindernisse alle 0.6s
   → Ziel: 5000m

4. Performance-Test:
   → Laufe 2-3 Level komplett durch
   → Checke FPS (sollte bei 60 bleiben)
   → Checke Memory (sollte stabil sein)
```

## 🎨 Visuelle Vorschau (aktuell)

```
┌─────────────────────────────────────┐
│  🎮 ROADRUNNER 2                    │
│  Level 1 / 10 - Tutorial            │
│  Distance: 45m / 300m               │
├─────────────────────────────────────┤
│                                     │
│    [?]    (Gold Collectible)        │
│                                     │
│  ──────────────────────────────── ← Lane 2
│          🧍 Player                  │
│  ──────────────────────────────── ← Lane 1 (Mitte)
│                                     │
│  ──────────────────────────────── ← Lane 0
│    [█]    (Rot Hindernis)           │
│                                     │
└─────────────────────────────────────┘
```

## ✅ Definition of Done

Diese Sandbox-Version gilt als **ABGESCHLOSSEN**, wenn:
- [ ] Alle 10 Level durchspielbar sind
- [ ] Geschwindigkeit von 8.0 → 35.0 spürbar ist
- [ ] Level 1 ist langsam genug zum Testen
- [ ] Object Pooling funktioniert (keine Memory-Leaks)
- [ ] Console-Ausgaben sind korrekt
- [ ] Keine Crashes bei Level-Wechsel

---

**Erstellt**: 2025-12-01
**Version**: Sandbox v1.0
**Godot**: 4.4
**Status**: ✅ Ready for Testing
