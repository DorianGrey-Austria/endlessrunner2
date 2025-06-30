## 📋 **GESTURE RUNNER PRO - DETAILLIERTE ROADMAP**


**💡 hake erfolgreiche ie Tasks ab während du arbeitest! 

Die grünen Häkchen in Cursor motivieren enorm! ✅



### **📅 WOCHE 0: PROJEKT-SETUP**
- [x] Projektkonzept definieren
- [x] Roadmap erstellen
- [ ] **Entwicklungsumgebung**
  - [ ] Godot 4.3 Projekt erstellen
  - [ ] Ordnerstruktur anlegen
  - [ ] Git Repository initialisieren
  - [ ] Blender-Godot Pipeline testen
  - [ ] Cursor mit Projekt verbinden

---

### **📅 WOCHE 1: ASSETS & GRUNDLAGEN**

#### **Tag 1-2: Asset-Recherche & Beschaffung**
- [ ] **Kostenlose Asset-Quellen**
  - [ ] PolyHaven Account einrichten
  - [ ] Mixamo Account erstellen
  - [ ] Sketchfab durchsuchen
  - [ ] Quaternius Assets prüfen
  - [ ] OpenGameArt bookmarken
- [ ] **Asset-Liste erstellen**
  - [ ] Character-Basis finden
  - [ ] Stadt-Assets sammeln
  - [ ] Natur-Assets sammeln
  - [ ] Texturen-Bibliothek
  - [ ] HDRI Skyboxes

#### **Tag 3-4: Hauptcharakter**
- [ ] **Character-Modellierung**
  - [ ] Mixamo Basis-Model wählen
  - [ ] In Blender importieren
  - [ ] Polygon-Count optimieren (Ziel: 5000-8000)
  - [ ] UV-Mapping prüfen/anpassen
  - [ ] Proportionen anpassen
- [ ] **Character-Texturierung**
  - [ ] Basis-Farben definieren
  - [ ] Texture Atlas erstellen (2K)
  - [ ] Stylized Shader einrichten
  - [ ] Rim-Light hinzufügen
  - [ ] Test-Render
- [ ] **Character-Rigging**
  - [ ] Mixamo Auto-Rig prüfen
  - [ ] Bone-Namen für Godot anpassen
  - [ ] Weight-Painting verfeinern
  - [ ] IK-Constraints testen
- [ ] **Animationen**
  - [ ] Idle Animation
  - [ ] Run Cycle
  - [ ] Jump (Start, Loop, Land)
  - [ ] Duck/Slide
  - [ ] Strafe Links
  - [ ] Strafe Rechts
  - [ ] Collect Item
  - [ ] Hit/Stumble
  - [ ] Death Animation

#### **Tag 5-7: Level-Module (Welt 1: Neon City)**
- [ ] **Straßen-Module**
  - [ ] Gerade Straße (10m)
  - [ ] Kurve 90° Links
  - [ ] Kurve 90° Rechts
  - [ ] T-Kreuzung
  - [ ] Kreuzung
  - [ ] Rampe Hoch
  - [ ] Rampe Runter
- [ ] **Gebäude-Baukästen**
  - [ ] Basis-Stockwerk (3 Var.)
  - [ ] Mittleres Stockwerk (5 Var.)
  - [ ] Dach-Elemente (4 Var.)
  - [ ] Neon-Schilder (10 Var.)
  - [ ] Fenster-Module
- [ ] **Props & Hindernisse**
  - [ ] Hover-Car (3 Var.)
  - [ ] Energiebarriere
  - [ ] Drohne (animiert)
  - [ ] Müllcontainer
  - [ ] Hydranten
  - [ ] Stromkästen
  - [ ] Werbetafeln

---

### **📅 WOCHE 2: CORE GAMEPLAY**

#### **Tag 8-10: Basis-Mechaniken**
- [ ] **Player Controller**
  - [ ] Character Movement Script
  - [ ] Lane-System (3 Spuren)
  - [ ] Smooth Lane-Wechsel
  - [ ] Jump-Mechanik
  - [ ] Duck/Slide-Mechanik
  - [ ] Kollisions-Detection
  - [ ] Animation State Machine
- [ ] **Kamera-System**
  - [ ] Follow-Camera Setup
  - [ ] Smooth-Damping
  - [ ] Shake-Effekte
  - [ ] FOV-Anpassungen bei Speed
- [ ] **Level-Generation**
  - [ ] Chunk-System
  - [ ] Random Module Spawning
  - [ ] Difficulty Progression
  - [ ] Object Pooling
  - [ ] Cleanup-System

#### **Tag 11-12: UI/HUD**
- [ ] **Main Menu**
  - [ ] Start-Button
  - [ ] Level-Auswahl
  - [ ] Settings-Menu
  - [ ] Credits
  - [ ] Quit-Button
- [ ] **In-Game HUD**
  - [ ] Score-Anzeige
  - [ ] Münzen/Früchte Counter
  - [ ] Combo-Meter
  - [ ] Power-Up Icons
  - [ ] Pause-Menu
- [ ] **Game Over Screen**
  - [ ] Final Score
  - [ ] High Score
  - [ ] Collected Items
  - [ ] Retry Button
  - [ ] Main Menu Button

#### **Tag 13-14: Erste spielbare Version**
- [ ] **Integration**
  - [ ] Alle Systeme verbinden
  - [ ] Erste Tests
  - [ ] Bug-Fixing
  - [ ] Performance-Check
  - [ ] Build erstellen
- [ ] **Basis-Features**
  - [ ] Collectibles funktionieren
  - [ ] Hindernisse töten
  - [ ] Score wird gezählt
  - [ ] Game Over funktioniert
  - [ ] Neustart möglich

---

### **📅 WOCHE 3: CONTENT & POLISH**

#### **Tag 15-17: Weitere Welten**
- [ ] **Welt 2: Tropical Paradise**
  - [ ] Strand-Module
  - [ ] Palmen & Vegetation
  - [ ] Wasser-Shader
  - [ ] Tiki-Statuen
  - [ ] Strand-Hindernisse
- [ ] **Welt 3: Ancient Ruins**
  - [ ] Tempel-Module
  - [ ] Steinblöcke
  - [ ] Lianen
  - [ ] Fallen
  - [ ] Gold-Artefakte
- [ ] **Welt 4: Frozen Kingdom**
  - [ ] Schnee-Module
  - [ ] Eis-Shader
  - [ ] Eiszapfen
  - [ ] Schnee-Partikel
  - [ ] Aurora-Effekt
- [ ] **Welt 5: Sakura Dreams**
  - [ ] Japanische Module
  - [ ] Kirschblüten-Partikel
  - [ ] Pagoden
  - [ ] Brücken
  - [ ] Oni-Masken

#### **Tag 18-20: Effekte & Polish**
- [ ] **Post-Processing**
  - [ ] Bloom einrichten
  - [ ] Color Grading
  - [ ] Vignette
  - [ ] Motion Blur
  - [ ] Chromatic Aberration
- [ ] **Partikel-Effekte**
  - [ ] Lauf-Staub
  - [ ] Collect-Explosionen
  - [ ] Speed-Lines
  - [ ] Umgebungs-Partikel
  - [ ] Power-Up Effekte
- [ ] **Shader-Arbeit**
  - [ ] Toon-Shader verfeinern
  - [ ] Hologramm-Shader
  - [ ] Wasser-Shader
  - [ ] Eis-Shader
  - [ ] Energie-Shader

#### **Tag 21: Audio**
- [ ] **Sound Effects**
  - [ ] Footsteps (verschiedene Untergründe)
  - [ ] Jump/Land
  - [ ] Collect Sounds
  - [ ] Hit/Crash
  - [ ] Power-Up Aktivierung
  - [ ] UI Sounds
- [ ] **Musik**
  - [ ] Hauptmenü Theme
  - [ ] Level 1-5 Tracks
  - [ ] Game Over Jingle
  - [ ] Victory Fanfare

---

### **📅 WOCHE 4: FEATURES & FINALISIERUNG**

#### **Tag 22-24: Gestensteuerung**
- [ ] **Webcam-Setup**
  - [ ] OpenCV Integration
  - [ ] MediaPipe einrichten
  - [ ] Kamera-Zugriff
  - [ ] Preview-Fenster
- [ ] **Basis-Gesten**
  - [ ] Hand-Tracking
  - [ ] Links/Rechts Erkennung
  - [ ] Sprung-Geste
  - [ ] Duck-Geste
  - [ ] Kalibrierung
- [ ] **Erweiterte Gesten**
  - [ ] Combo-Gesten
  - [ ] Special Moves
  - [ ] Pause-Geste
  - [ ] Tutorial-System

#### **Tag 25-26: Balancing & Testing**
- [ ] **Gameplay-Balance**
  - [ ] Schwierigkeitskurve
  - [ ] Power-Up Dauer
  - [ ] Spawn-Raten
  - [ ] Score-Multiplikatoren
  - [ ] Hitbox-Anpassungen
- [ ] **Testing**
  - [ ] Alle Level durchspielen
  - [ ] Edge-Cases testen
  - [ ] Performance auf verschiedenen Systemen
  - [ ] Gesten-Erkennung optimieren
  - [ ] Speicherlecks finden

#### **Tag 27-28: Build & Release**
- [ ] **Final Polish**
  - [ ] Letzte Bug-Fixes
  - [ ] Credits erstellen
  - [ ] Icon & Splash Screen
  - [ ] README schreiben
  - [ ] Screenshots machen
- [ ] **Build-Erstellung**
  - [ ] Windows Build (64-bit)
  - [ ] Mac Build
  - [ ] Linux Build
  - [ ] Build-Tests
  - [ ] Installer erstellen
- [ ] **Release**
  - [ ] Itch.io Seite erstellen
  - [ ] Steam-Seite vorbereiten
  - [ ] Trailer aufnehmen
  - [ ] Social Media Posts
  - [ ] Launch! 🚀

---

### **📊 BONUS-TASKS (Bei Zeit)**
- [ ] **Zusatz-Features**
  - [ ] Leaderboard-System
  - [ ] Daily Challenges
  - [ ] Achievement-System
  - [ ] Character-Customization
  - [ ] Multiplayer-Modus
- [ ] **Mobile Version**
  - [ ] Touch-Controls
  - [ ] UI-Anpassungen
  - [ ] Performance-Optimierung
  - [ ] App Store Vorbereitung

---

---

## 🚀 **SUBWAY RUNNER - AKTUELLE ENTWICKLUNG**

### **✅ BASISVERSION 1.0 FERTIGGESTELLT** (2025-01-26)
- [x] **Vollständig funktionsfähiges Spiel**
  - [x] Funktionierendes Hauptmenü und Game Loop
  - [x] 3D Spieler mit korrekter Ausrichtung (nach vorne)
  - [x] Lane-System mit flüssiger Bewegung (3 Spuren)
  - [x] Jump- und Duck-Mechaniken
  - [x] Vielfältige Hindernisse (7 verschiedene Typen)
  - [x] Progressiver Schwierigkeitsgrad
  - [x] Score- und Highscore-System
  - [x] Timer-basiertes Gameplay (60 Sekunden)

- [x] **Parallax-System implementiert**
  - [x] Umgebung synchronisiert mit Spielgeschwindigkeit 
  - [x] Smooth Speed Interpolation mit Lerp
  - [x] Environment Object Tracking Arrays
  - [x] Dynamische visuelle Effekte (FOV, Nebel, Camera Shake)
  - [x] Delta Time für framerate-unabhängige Bewegung
  - [x] Mehrschichtige Parallax-Tiefe für Immersion

- [x] **Technische Basis**
  - [x] Vanilla JS + Three.js Implementation
  - [x] Modular aufgebautes Environment System
  - [x] Realistische Stadtumgebung mit Gebäuden, Straßenlaternen
  - [x] Supabase Integration für Highscores
  - [x] Git Versionskontrolle

### **🎯 NÄCHSTE SCHRITTE - Version 2.0**
- [ ] **PHASE 1: Sound System Overhaul**
  - [ ] Realistische Audio-Samples statt einfache Töne
  - [ ] Dynamic Audio basierend auf Geschwindigkeit
  - [ ] 3D Audio und Ambiente-Sounds
  - [ ] Sound-Layering für realistischere Effekte

- [ ] **PHASE 2: Collision Enhancement**
  - [ ] Präzise Bounding-Box Kollisionen
  - [ ] Near-Miss Bonus-System
  - [ ] Verbesserte Collision-Feedback (Partikel, Effects)
  - [ ] Collision Prediction Warnings

- [ ] **PHASE 3: Neue Hindernisse**
  - [ ] Bewegliche/rotierende Hindernisse
  - [ ] Multi-Lane Obstacles
  - [ ] Umwelt-Hazards (Löcher, hängende Schilder)
  - [ ] Sequenz-basierte Hindernis-Patterns

- [ ] **PHASE 4: Visual Effects**
  - [ ] Advanced Particle Systems
  - [ ] Motion Blur und Speed Lines
  - [ ] Impact Effects je Material-Typ
  - [ ] Environmental Destruction

### **✅ AKTUELLER FORTSCHRITT**
- **SubwayRunner Basisversion**: 100% ████████████
- **Sound Verbesserungen**: 0% ░░░░░░░░░░░░
- **Collision Enhancement**: 0% ░░░░░░░░░░░░
- **Neue Hindernisse**: 0% ░░░░░░░░░░░░
- **Visual Effects**: 0% ░░░░░░░░░░░░

**🎮 Spiel läuft auf**: http://localhost:8001

---

### **✅ URSPRÜNGLICHER FORTSCHRITT - GestureRunnerPro**
- **Gesamt**: 2/200+ Tasks ✅
- **Woche 0**: 50% ████░░░░░░
- **Woche 1**: 0% ░░░░░░░░░░
- **Woche 2**: 0% ░░░░░░░░░░
- **Woche 3**: 0% ░░░░░░░░░░
- **Woche 4**: 0% ░░░░░░░░░░

---
