# 🎮 START MENU V2 - KOMPLETTER NEUANFANG

## ❌ PROBLEM MIT AKTUELLER VERSION
- Zu viele Screens (welcomeScreen, gestureConfigScreen, etc.)
- Kein funktionierendes Audio-Preview
- Zu kompliziert, nicht modern
- User verwirrt

## ✅ NEUE LÖSUNG: SINGLE SCREEN DESIGN

### Screen-Struktur:
```
┌─────────────────────────────────────────┐
│     🏃 SUBWAY RUNNER                     │
│                                          │
│  🎵 WÄHLE DEINE MUSIK                    │
│  [🔥] [😌] [⛏️] [🎮] [👾]               │
│  [🌃] [⚡] [⚔️] [🎸] [🔇] [🎲]          │
│                                          │
│  🔊 Volume: [────●────]                  │
│                                          │
│  🎮 Steuerung:                           │
│  ( ) Classic    ( ) Gesture             │
│                                          │
│     [ ▶️  SPIEL STARTEN ]               │
│                                          │
│  ℹ️  Sammle 30 Kiwis in 60 Sekunden!    │
└─────────────────────────────────────────┘
```

## 🎨 DESIGN NACH BEST PRACTICES 2025
1. **Warm Colors**: Orange (#FF6B35) + Dark Navy (#1a1a2e)
2. **Glassmorphism**: backdrop-filter: blur(20px)
3. **Micro-Animations**: hover scale + glow
4. **One-Column Layout**: Mobile-first
5. **Clear hierarchy**: Title > Music > Controls > CTA

## 🎵 AUDIO-PREVIEW SYSTEM
```javascript
const musicTracks = {
    aggressive: { file: 'aggressive-gaming-music-343503.mp3', emoji: '🔥', name: 'Aggressive' },
    calm: { file: 'calm-gaming-flow-325508.mp3', emoji: '😌', name: 'Calm' },
    // ... etc
};

function previewTrack(trackKey) {
    // Stop current preview
    if (currentPreview) {
        currentPreview.pause();
        currentPreview.currentTime = 0;
    }

    // Play 3-second preview
    const audio = new Audio(`sounds/${musicTracks[trackKey].file}`);
    audio.volume = volumeSlider.value;
    audio.play();
    currentPreview = audio;

    // Auto-stop after 3 seconds
    setTimeout(() => {
        audio.pause();
    }, 3000);

    // Visual feedback
    button.classList.add('previewing');
    setTimeout(() => button.classList.remove('previewing'), 3000);
}
```

## ✅ TEST-CHECKLIST
1. [ ] Music buttons clickable
2. [ ] Audio preview plays (3 seconds)
3. [ ] Volume slider works
4. [ ] Control selection works
5. [ ] SPIEL STARTEN button works
6. [ ] Game actually starts after click
7. [ ] No console errors

## 📝 IMPLEMENTATION STEPS
1. Backup current index.html
2. Create minimal HTML structure
3. Add modern CSS (from _INFO/ guides)
4. Implement audio preview logic
5. Test THOROUGHLY before commit
6. Write automated test script