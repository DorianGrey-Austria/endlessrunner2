# 🎵 Background Music Setup

## Quick Start

1. **Place your MP3 file** in this directory with one of these names:
   - `background.mp3` (recommended)
   - `game-music.mp3`
   - `subway-theme.mp3`

2. **File Requirements:**
   - Format: MP3
   - Bitrate: 128kbps (recommended)
   - Duration: 2-4 minutes
   - **Must be loop-friendly** (seamless start/end)

3. **Optimization Tips:**
   - Keep file size under 5MB
   - Use 44.1kHz sample rate
   - Normalize audio levels
   - Add fade-in/fade-out for smooth looping

## How It Works

- Music automatically **preloads** when game starts
- **Plays** when "Start Game" is pressed
- **Loops** continuously during gameplay
- **Fades in/out** smoothly
- **Stops** when game ends
- **Graceful fallback** if no music file found

## Testing

1. Place your MP3 file here
2. Refresh the game
3. Check browser console for music loading status:
   - ✅ `Background music loaded: sounds/background/[filename].mp3`
   - ❌ `Failed to load: [filename].mp3`

## Volume Control

- Background music volume: **15%** (automatically balanced)
- Sound effects volume: **30%** (maintains audio hierarchy)
- User can adjust in-game settings (future feature)

Ready to add your epic soundtrack! 🎮🎵