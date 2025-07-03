# 🎮 SubwayRunner Gesture Control System

## Overview

This is a professional implementation of face-based gesture control for SubwayRunner using MediaPipe Face Landmarks. The system tracks head movements to control game actions without requiring hands.

## Features

### Core Functionality
- **Head Movement Tracking**: Uses 468 face landmarks for precise tracking
- **4 Gesture Types**: 
  - Head tilt left → Move left lane
  - Head tilt right → Move right lane  
  - Head up → Jump
  - Head down → Duck
- **Kalman Filtering**: Smooth gesture detection without jitter
- **Auto-Calibration**: Automatically calibrates to user's neutral position
- **Performance Optimized**: Frame skipping and GPU acceleration

### User Experience
- **Visual Feedback**: Real-time webcam preview with gesture indicators
- **Debug Mode**: Full landmark visualization for testing
- **Adjustable Sensitivity**: Slider control for gesture responsiveness
- **Error Handling**: Graceful fallback when camera unavailable
- **FPS Monitoring**: Real-time performance metrics

## Technical Implementation

### Architecture
```
GestureController
├── MediaPipe Face Landmarks (468 points)
├── Head Pose Estimation (Yaw/Pitch)
├── Kalman Filter Smoothing
├── Gesture Detection Logic
├── Calibration System
└── Performance Optimization
```

### Key Technologies
- **MediaPipe Tasks Vision**: v0.10.0 for face detection
- **GPU Acceleration**: WebGL-based processing
- **Kalman Filtering**: Reduces noise in head tracking
- **Frame Skipping**: Maintains game performance

### Performance Targets
| Device Type | Tracking FPS | Game Impact |
|------------|--------------|-------------|
| High-end   | 30 FPS       | < 5% CPU    |
| Mid-range  | 15-20 FPS    | < 10% CPU   |
| Low-end    | 10-15 FPS    | < 15% CPU   |

## Usage

### Testing the Gesture Control
1. Open `gesture-test.html` in Chrome/Edge/Safari
2. Click "Kamera starten" to enable webcam
3. Wait 2 seconds for auto-calibration
4. Move your head to control the test character

### Integration with Main Game
```javascript
// Import the controller
import { GestureController } from './js/GestureController.js';

// Initialize
const gestureController = new GestureController({
    videoElement: document.getElementById('video'),
    canvasElement: document.getElementById('canvas'),
    onGestureDetected: (gesture) => {
        // Handle gesture in game
        switch(gesture) {
            case 'MOVE_LEFT': movePlayerLeft(); break;
            case 'MOVE_RIGHT': movePlayerRight(); break;
            case 'JUMP': playerJump(); break;
            case 'DUCK': playerDuck(); break;
            case 'NONE': playerNormal(); break;
        }
    }
});

// Start tracking
await gestureController.start();
```

### Configuration Options
```javascript
// Adjust sensitivity (0.1 - 1.0)
gestureController.setSensitivity(0.7);

// Change smoothing frames (1-10)
gestureController.setSmoothingFrames(3);

// Enable debug visualization
gestureController.setDebugMode(true);

// Adjust frame skip rate for performance
gestureController.setFrameSkipRate(2);
```

## Best Practices

### For Optimal Detection
1. **Good Lighting**: Face the light source, avoid backlighting
2. **Camera Position**: Place camera at eye level
3. **Distance**: Stay 40-80cm from camera
4. **Background**: Plain background improves tracking

### Performance Optimization
1. Use frame skipping on weaker devices
2. Reduce video resolution if needed
3. Disable debug mode in production
4. Monitor FPS and adjust settings

### User Onboarding
1. Show tutorial on first use
2. Guide through calibration process
3. Provide visual feedback for gestures
4. Allow sensitivity customization

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 91+ | ✅ Full | Best performance |
| Edge 91+ | ✅ Full | Good performance |
| Safari 15.4+ | ✅ Full | Requires permissions |
| Firefox | ⚠️ Limited | May have issues |

## Known Limitations

1. **Face Accessories**: Glasses OK, masks may interfere
2. **Multiple Faces**: Only tracks primary face
3. **Extreme Angles**: Best within ±45° head rotation
4. **Low Light**: Reduced accuracy in poor lighting

## Troubleshooting

### Camera Not Working
- Check browser permissions
- Ensure HTTPS connection
- Try different browser
- Check camera not in use

### Poor Gesture Detection
- Recalibrate position
- Adjust sensitivity
- Check lighting conditions
- Clean camera lens

### Performance Issues
- Increase frame skip rate
- Reduce video resolution
- Close other tabs
- Check GPU acceleration

## Future Enhancements

- [ ] Eye tracking for fine control
- [ ] Facial expression triggers
- [ ] Multi-face support
- [ ] Offline model caching
- [ ] Mobile optimization
- [ ] Hand gesture combination

## Credits

Built with:
- MediaPipe by Google
- Kalman filter algorithm
- Professional UX/UI design principles
- Performance-first architecture

---

**Version**: 1.0.0  
**Last Updated**: June 30, 2025  
**Author**: SubwayRunner Development Team