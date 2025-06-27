# 🎵 SubwayRunner Audio Assets

## Directory Structure

### `/background/`
- **Background music files**
- Format: MP3 (recommended: 128kbps, 44.1kHz)
- Loop-ready tracks
- Target: 2-4 minutes duration

### `/effects/`
- **Sound effects**
- Short audio clips (< 2 seconds)
- Format: MP3 or OGG
- High quality for gameplay feedback

### `/ambient/`
- **Ambient sounds**
- Environmental audio
- City sounds, traffic, etc.
- Loop-ready

## Audio Guidelines

### **File Optimization**
- **Bitrate**: 128kbps for background, 192kbps for effects
- **Sample Rate**: 44.1kHz standard
- **Format**: MP3 (best browser compatibility)
- **File Size**: < 5MB per background track

### **Loading Strategy**
1. **Preload** during game intro
2. **Progressive loading** for large files
3. **Graceful degradation** if audio fails

### **Performance**
- Audio files are cached by browser
- Streaming for files > 2MB
- User can disable audio for better performance

## Usage

Place your MP3 files in the appropriate directory and update the audio configuration in the game code.