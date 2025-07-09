# 🚀 Feature Re-Integration Plan

## Current Status
- **Rolled back to**: v3.6.1 (stable, working)
- **Three.js**: r158 (global THREE variable works)
- **File size**: ~6,800 lines (manageable)
- **All v4.x code**: Safely backed up in `index_v4.5.9_all_features.html`

## Integration Timeline

### Week 1: Foundation & Testing

#### Day 1-2: Setup & First Feature
- [ ] Deploy v3.6.1 to production
- [ ] Verify game works online
- [ ] Extract Level 2 (Neon Night Run) code
- [ ] Create `levels/level2.js` module
- [ ] Integrate Level 2 with level selection

#### Day 3-4: Character System (Simplified)
- [ ] Extract character selection UI
- [ ] Implement 2 characters first (Jake + NEON-7)
- [ ] Basic character switching
- [ ] Test character-specific abilities

#### Day 5-7: Stabilization
- [ ] Performance testing
- [ ] Bug fixes
- [ ] Deploy if stable
- [ ] Gather user feedback

### Week 2: Core Features

#### Day 1-2: Additional Levels
- [ ] Extract and integrate Level 3 (Sky High)
- [ ] Extract and integrate Level 4 (Underwater)
- [ ] Ensure smooth level transitions

#### Day 3-4: Ghost System (Local)
- [ ] Extract ghost recording logic
- [ ] Implement local storage for ghosts
- [ ] Ghost playback without Supabase
- [ ] Basic leaderboard UI

#### Day 5-7: More Characters
- [ ] Add Commander Void
- [ ] Add Lara Thornwood
- [ ] Character progression system
- [ ] Testing & balancing

### Week 3: Polish & Completion

#### Day 1-3: Remaining Levels
- [ ] Levels 5-10 integration
- [ ] Level-specific mechanics
- [ ] Environmental effects

#### Day 4-5: Visual Effects
- [ ] Particle systems
- [ ] Lighting improvements
- [ ] Performance optimization

#### Day 6-7: Final Polish
- [ ] Sound system fixes
- [ ] UI/UX improvements
- [ ] Final testing
- [ ] Production deployment

## Code Extraction Strategy

### For each feature:
1. Find the feature code in `index_v4.5.9_all_features.html`
2. Extract into a separate module file
3. Remove dependencies on broken systems
4. Test in isolation
5. Integrate into main game
6. Test again
7. Commit with descriptive message

### Example: Extracting Level 2
```javascript
// SubwayRunner/features/levels/level2.js
const Level2NeonCity = {
    name: "Neon Night Run",
    id: 2,
    
    init: function(scene) {
        // Extracted createLevel2Environment code
        this.createEnvironment(scene);
        this.setupLighting(scene);
        this.createObstacles();
    },
    
    createEnvironment: function(scene) {
        // Neon city creation code
    },
    
    // ... more methods
};

// Integration in main game:
// if (currentLevel === 2) Level2NeonCity.init(scene);
```

## Testing Checklist

Before deploying any feature:
- [ ] Game starts without errors
- [ ] FPS stays above 30 on low-end devices
- [ ] No memory leaks
- [ ] All controls work
- [ ] Mobile touch controls functional
- [ ] No console errors
- [ ] Level transitions smooth

## Deployment Strategy

1. **Local Testing**: Full playthrough locally
2. **Staging**: Test on a subdomain if possible
3. **Canary Deploy**: 10% of users first
4. **Full Deploy**: After 24 hours if stable
5. **Rollback Plan**: Keep previous version ready

## Performance Budgets

- Max file size: 15,000 lines (currently 6,800)
- Load time: < 3 seconds
- FPS: Minimum 30, target 60
- Memory: < 500MB usage
- Draw calls: < 1000

## Risk Mitigation

1. **Version Control**: Commit after each successful integration
2. **Feature Flags**: Add toggles for new features
3. **Gradual Rollout**: One feature at a time
4. **User Feedback**: Monitor Discord/forums
5. **Automated Backups**: Daily backups of working versions

## Success Metrics

- Game loads successfully: ✅
- Original features work: ✅
- New features integrate smoothly: 🔄
- Performance maintained: 📊
- User satisfaction: 😊

## Notes

- **DO NOT** update Three.js from r158
- **DO NOT** add all features at once
- **DO** test thoroughly after each addition
- **DO** maintain code modularity
- **DO** document all changes

---

*Plan created: 9. Juli 2025*
*Estimated completion: 3 weeks*
*Priority: Get game working TODAY, features later*