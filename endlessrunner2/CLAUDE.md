# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Gesture Runner Pro** is a hybrid project combining:
1. A Godot-based 3D endless runner with gesture controls (`roadrunner2/`)
2. A BMAD workflow orchestration system for project management (`bmad/`)

The development workflow integrates **Blender assets → Godot engine → BMAD workflows → Claude Code**.

### Multi-System Architecture
```
endlessrunner2/
├── roadrunner2/              # 🎮 PRIMARY: Godot 4.4 endless runner (gesture-controlled)
│   ├── project.godot         # Engine config (Godot 4.4, mobile renderer)
│   ├── scenes/Main.tscn      # Main scene (1920x1080 viewport)
│   ├── scripts/Main.gd       # Central game controller
│   └── assets/               # 3D models, textures, audio
├── bmad/                     # 🧙 BMAD v6a: Workflow orchestration system
│   ├── core/                 # Core workflows, agents, tasks
│   ├── bmm/                  # BMad Method Module (4-phase SDLC)
│   ├── bmb/                  # BMad Builder (meta-development tools)
│   ├── cis/                  # Creative Innovation Studio
│   └── _cfg/                 # Configuration & manifests
├── endlessrunner2/           # Documentation (readme.md, roadmap.md)
└── .snapshots/               # Screenshot archive
```

## System Selection Guide

### When to Use Each System

**Use Godot/GDScript** (`roadrunner2/`) for:
- Game implementation (player movement, obstacles, levels)
- 3D asset integration and scene setup
- Physics and collision systems
- In-game UI and HUD

**Use BMAD workflows** (`bmad/`) for:
- Project planning and architecture design
- Story/task generation and management
- Technical specification creation
- Retrospectives and process improvement

**Typical Workflow**:
1. Plan features using BMAD workflows (PM, Architect agents)
2. Generate stories/tasks via BMAD
3. Implement in Godot using GDScript
4. Review/retrospective via BMAD workflows

## Critical Development Rules

### Before Starting ANY Work
1. ✅ Identify which subdirectory: `roadrunner2` (game) or `godot-mcp` (server)?
2. ✅ Check roadmap.md for week-specific goals
3. ✅ Verify Godot version: 4.4 (for mobile rendering)
4. ✅ Read section below for that subdirectory

### Godot Workflow (roadrunner2/)
```bash
# START GODOT
godot --path roadrunner2

# In Godot Editor:
# 1. Open res://scenes/Main.tscn (already configured)
# 2. Edit .gd scripts → Auto-save triggers test
# 3. F5 → Play scene (desktop 1920x1080)
# 4. Console output shows debug info

# FROM COMMAND LINE
# Export to web (if needed):
godot --path roadrunner2 --export-release "Web" web_export/index.html
```

### GDScript Best Practices
- **Signals**: Use for event communication (game_started, game_over, level_completed)
- **State Machine**: Main.gd manages game states (IDLE → PLAYING → GAME_OVER)
- **Constants**: Define at top of script (e.g., LANE_POSITIONS = [-2, 0, 2])
- **Object Pooling**: For obstacles/collectibles (pre-allocate ~50 items)
- **Node Structure**: Use `@onready` for node references, `$NodeName` for access

### Critical Architecture Rules
- **Main.gd**: Central controller (only file with game_started signal)
- **Scene Structure**: Flat hierarchy preferred for performance
- **Mobile Rendering**: Use `renderer/rendering_method="mobile"` (already set)
- **3D Viewport**: 1920x1080, 16:9 aspect ratio (never change)

## Project Organization

### Week 1 Goals (Current Phase)
```
✅ Asset-Recherche (PolyHaven, Mixamo, Sketchfab accounts)
✅ Character-Basis finden (Mixamo low-poly model)
❌ Hauptcharakter-Modellierung (Blender)
❌ Level-Module (Neon City Welt 1)
```

### 5 Planned Worlds
1. **Neon City** - Cyberpunk at night (current focus)
2. **Tropical Paradise** - Beach & jungle
3. **Ancient Ruins** - Maya temple
4. **Frozen Kingdom** - Ice landscape
5. **Sakura Dreams** - Japanese garden

### Asset Pipeline
```
1. Mixamo/PolyHaven → Download .glb
2. Blender (Claude assists):
   - Optimize polygon count (~5000-8000 for characters)
   - Adjust UV mapping
   - Apply stylized shader
3. Export .glb → Copy to roadrunner2/assets/
4. Godot: Import .glb → Create scene instance
5. GDScript: Attach scripts for animation/physics
```

## BMAD Workflow System

### Core Configuration

**Config Location**: `bmad/core/config.yaml`
- `user_name`: BMad User
- `communication_language`: English
- `output_folder`: `{project-root}/docs`

### Key BMAD Agents

Access agents through BMad Master orchestrator:

- **BMad Master** (`bmad/core/agents/bmad-master.md`) - Main orchestrator
  - Commands: `*help`, `*list-tasks`, `*list-workflows`, `*party-mode`, `*exit`
- **PM** (Product Manager) - Project planning & requirements
- **SM** (Scrum Master) - Sprint & story management
- **Architect** - Technical architecture design
- **DEV** (Developer) - Implementation guidance
- **Game Designer** - Game-specific design patterns
- **Game Architect** - Game engine architecture

### BMAD Workflow Phases

**1. Analysis Phase** (Optional)
```bash
# Available workflows:
- brainstorm-project   # Project ideation
- brainstorm-game      # Game-specific brainstorming
- research             # Market/technical research
- product-brief        # Product strategy
- game-brief           # Game design document
```

**2. Planning Phase** (Required)
```bash
# Scale-adaptive routing:
- plan-project         # Auto-routes based on complexity
- prd                  # Product requirements
- gdd                  # Game design document
- tech-spec            # Technical specifications
- ux                   # UX design
```

**3. Solutioning Phase** (Level 3-4 projects)
```bash
- tech-spec            # Epic-specific architecture
```

**4. Implementation Phase** (Iterative)
```bash
- create-story         # Story generation
- story-context        # Inject technical expertise
- dev-story            # Implementation
- review-story         # Quality validation
- correct-course       # Issue resolution
- retrospective        # Continuous improvement
```

### Scale Levels

BMAD adapts documentation depth automatically:
- **Level 0**: Single atomic change
- **Level 1**: 1-10 stories, minimal docs
- **Level 2**: 5-15 stories, focused PRD
- **Level 3**: 12-40 stories, full architecture
- **Level 4**: 40+ stories, enterprise scale

### Accessing BMAD Workflows

**Entry Point**: BMad Master agent at `bmad/core/agents/bmad-master.md`

To start a BMAD workflow session:
1. Read the BMad Master agent file
2. BMad Master will load `bmad/core/config.yaml` automatically
3. BMad Master presents menu of available workflows
4. Select workflow by number or trigger text

**Critical**: BMad Master MUST load config.yaml before any workflow execution.

### Common BMAD Commands

```bash
# Via BMad Master agent (in Claude Code):
*help                  # Show full menu
*list-workflows        # Show all available workflows
*list-tasks            # Show all task definitions
*party-mode            # Group chat with all agents
*exit                  # Exit BMad Master session
```

### BMAD Output

All workflow outputs go to `docs/` directory:
- PRDs, technical specs, architecture docs
- Story definitions and technical context
- Retrospectives and decisions log

## Commands

### Godot Editor
```bash
cd roadrunner2

# Start editor
godot

# Play specific scene (shortcut: F5)
godot --path . -e -s res://scenes/Main.tscn

# Export to web
godot --export-release "Web" web_export/index.html

# Headless debug (no UI)
godot --headless --script debug_game.gd
```

### Project Structure Commands
```bash
# Check project status
ls -la roadrunner2/
ls -la roadrunner2/scenes/
ls -la roadrunner2/scripts/
ls -la roadrunner2/assets/

# Create new scene
cp roadrunner2/scenes/Main.tscn roadrunner2/scenes/Player.tscn

# Check project.godot config
cat roadrunner2/project.godot | grep -E "config/|renderer/"
```

### Blender Integration (Planned)
```bash
# Export from Blender
# File → Export → glTF Binary (.glb)
# Settings:
#   ✅ Apply Scalings: FBX Units
#   ✅ Forward: -Y Forward
#   ✅ Up: Z Up
#   ✅ Animation: ON
#   ✅ Group by NLA Track: ON

# Verify in Blender
# Assets → Import → roadrunner2/assets/filename.glb
```

## High-Level Architecture

### Main.gd (Central Game Controller)
```
Main (Node3D)
├── signal game_started
├── signal game_over
├── signal level_completed
├── var current_level: int = 1
├── var score: int = 0
├── var high_score: int = 0
└── func _ready() # Initialize all systems
```

**States**:
- `IDLE`: Game not started (menu)
- `PLAYING`: Active gameplay
- `PAUSED`: Player paused
- `GAME_OVER`: Lost life/game ended
- `LEVEL_COMPLETE`: Beat level goal

### Scene Hierarchy (roadrunner2/scenes/Main.tscn)
```
Main (Node3D)
├── WorldEnvironment (post-processing, HDR)
│   └── environment (Color: #1A0826, glow_enabled: true)
├── DirectionalLight3D (main sun light)
│   └── transform: 45° angle, shadow_enabled: true
├── Player (CharacterBody3D) - TBD
├── LevelGenerator (spawns obstacles) - TBD
├── Camera3D (follows player) - TBD
└── UI/HUD (CanvasLayer) - TBD
```

### Rendering Pipeline
- **Method**: Mobile (GLES3, optimized for lower-end devices)
- **MSAA**: 2x (anti-aliasing)
- **Default Clear Color**: `#1A0826` (dark purple)
- **Post-Processing**: Glow enabled (neon effect for Neon City)

## Implementation Patterns

### Adding a New System (Player Movement Example)
1. **Create Script**: `roadrunner2/scripts/player.gd`
```gdscript
extends CharacterBody3D

var speed: float = 10.0
var jump_force: float = 20.0
var gravity: float = 9.8

func _physics_process(delta):
    # Movement logic
    velocity.y -= gravity * delta
    move_and_slide()
```

2. **Add to Scene**:
   - Right-click Main.tscn → "Instantiate"
   - Select player.gd script
   - Configure in Inspector

3. **Emit Signals** (if relevant):
   - Player.gd emits "player_collected_item"
   - Main.gd listens and updates score

### Obstacle Spawning (Object Pooling Pattern)
```gdscript
# In LevelGenerator.gd
var obstacle_pool: Array = []
var POOL_SIZE: int = 50
var SPAWN_RATE: float = 0.02  # 1-2 per second at base speed

func _ready():
    # Pre-allocate obstacles
    for i in range(POOL_SIZE):
        var obstacle = create_obstacle()
        obstacle.visible = false
        obstacle_pool.append(obstacle)

func spawn_obstacle():
    # Get from pool instead of creating new
    var obs = obstacle_pool.pop_front()
    obs.visible = true
    obstacle_pool.append(obs)
```

### Gesture Control Integration (Phase 2)
```gdscript
# When MediaPipe integration ready:
# roadrunner2/scripts/gesture_controller.gd

func detect_gesture(hand_landmarks):
    # Implement hand tracking logic
    # Emit signals: left_swipe, right_swipe, jump, duck
    pass
```

## Testing & Debugging

### In-Editor Testing
- **Play button** (F5): Runs Main.tscn
- **Console**: Bottom panel shows print() statements
- **Profiler**: Top menu → Debug → Monitor (FPS, memory, draw calls)

### Performance Targets
- **FPS**: 60 minimum, 120 target on M1/M2 iPad
- **Memory**: <200MB at start, <500MB max during gameplay
- **Draw Calls**: <100 per frame

### Common Issues & Fixes
| Issue | Solution |
|-------|----------|
| Scene won't load | Check res:// paths in script references |
| Script not running | Verify node has script attached in Inspector |
| Missing assets | Check roadrunner2/assets/ folder exists |
| Low FPS | Profile with Debug → Monitor, reduce draw calls |
| Asset animation broken | Re-export from Blender with "Animation: ON" |

## File Locations Quick Reference

### Critical Files
- `roadrunner2/project.godot` - Engine configuration (DO NOT EDIT MANUALLY)
- `roadrunner2/scenes/Main.tscn` - Main scene (viewport, lighting, environment)
- `roadrunner2/scripts/Main.gd` - Game controller (where to add game logic)
- `.godot/imported/` - Auto-generated import cache (ignore)

### Asset Directories
```
roadrunner2/assets/
├── models/        # .glb files from Blender
├── textures/      # .png/.jpg materials
├── audio/         # .ogg/.wav sounds
└── characters/    # Character models + animations
```

### NOT IN THIS REPO (Handled Separately)
- Blender project files (.blend)
- Godot MCP node_modules/ (in godot-mcp/)
- Export builds (generated locally)

## Collaboration Workflow

### When Working with Blender Assets
1. **User provides**: Blender file (.blend) or download link
2. **Claude (assisted)**:
   - Review polygon count + UV layout
   - Optimize if needed
   - Export .glb
3. **Claude Code**:
   - Copy .glb to roadrunner2/assets/
   - Import in Godot
   - Create scene/script if needed

### Godot MCP Server (godot-mcp/)
- **Purpose**: AI integration layer for Godot editor
- **Status**: Experimental
- **Usage**: Connect Godot to Claude for code suggestions
- **Setup**: `npm install && npm run build` in godot-mcp/

## Known Limitations & Workarounds

### Current State
- ✅ Godot project skeleton created
- ✅ Main scene + script template ready
- ❌ No player/obstacle/camera systems yet
- ❌ No animations imported
- ❌ No gesture control (Phase 2)
- ❌ No UI/HUD (Phase 2)

### Browser Export Strategy (Future)
When ready to publish:
```bash
godot --export-release "Web" web_export/index.html
# Generates: web_export/index.html + .wasm + .js files
# Deploy as static files to web server
```

## Version Management

**Current**: Project skeleton (roadmap: 2/200+ tasks complete)
**Format**: `Phase-Week_V#.#` (e.g., "Phase1-Week1_V1.0")

Track changes in roadmap.md (auto-updated via git commits).

## Critical Lessons Learned

1. **Mobile Rendering First** - Set renderer to "mobile" BEFORE major development
2. **3D Asset Optimization** - Keep characters <8000 vertices, use atlased textures
3. **Blender Export Settings** - Wrong Y-up/Z-up causes rotation issues in Godot
4. **GDScript Signals** - Don't use direct node references, emit signals instead
5. **Object Pooling Essential** - Spawning 100 obstacles per game causes stutters without pooling

## Emergency Commands

### If Godot Won't Open
```bash
# Reset editor cache
rm -rf roadrunner2/.godot/
godot --path roadrunner2

# Reset import cache
rm -rf roadrunner2/.godot/imported/
```

### If Script Has Syntax Error
```bash
# Check syntax without opening editor
gdscript_checker roadrunner2/scripts/*.gd
# Or manually review in console window
```

### Rollback to Last Known Good
```bash
git log --oneline roadrunner2/
git checkout <commit-hash> -- roadrunner2/
```

## Hybrid Development Workflow Example

### Planning a New Feature (Complete Flow)

```bash
# 1. BMAD Planning Phase
# Talk to BMad Master agent
"*list-workflows"
# Select appropriate planning workflow (e.g., brainstorm-game)

# 2. BMad Master generates:
# - docs/feature-spec.md
# - docs/technical-approach.md
# - Story definitions

# 3. Godot Implementation
cd roadrunner2
godot  # Open editor

# 4. Implement in GDScript
# - Create scripts/new_feature.gd
# - Update Main.gd
# - Test with F5

# 5. BMAD Review
# Run review-story workflow
# Generate retrospective

# 6. Iterate
# Use BMAD's correct-course if issues found
```

### Essential Reading

**For BMAD workflows**: Read `bmad/bmm/workflows/README.md` - explains the complete v6a methodology

**For Godot development**: This CLAUDE.md + `endlessrunner2/roadmap.md`

## Critical Integration Points

### BMAD ↔ Godot Handoff

1. **Design → Implementation**: BMAD creates specs in `docs/`, Godot implements in `roadrunner2/`
2. **Story Context**: BMAD generates technical guidance for each story
3. **Retrospectives**: Feed Godot learnings back into BMAD workflows
4. **Architecture Decisions**: Documented by BMAD, implemented in Godot

### File Organization Rules

- **Game code**: `roadrunner2/scripts/*.gd`
- **Game assets**: `roadrunner2/assets/`
- **BMAD outputs**: `docs/` (never in `roadrunner2/`)
- **Project docs**: `endlessrunner2/` (readme.md, roadmap.md)

## Next Steps (From Roadmap)

**Immediate (Week 1)**:
- [ ] Finalize character base model (Mixamo download + optimize)
- [ ] Create character-related scenes in Godot
- [ ] Model first level modules (Neon City streets)

**Short-term (Week 2)**:
- [ ] Implement player movement controller
- [ ] Add lane-switching mechanics
- [ ] Create obstacle spawning system

**Medium-term (Week 3-4)**:
- [ ] Implement gesture recognition
- [ ] Build additional world biomes
- [ ] Add audio + particle effects

**Workflow Note**: Use BMAD planning workflows before starting each phase, then implement in Godot.

---

**Last Updated**: 2025-12-01
**Godot Version**: 4.4
**BMAD Version**: v6a (6.0.0-alpha.0)
**Project Status**: Phase 1 (Assets & Fundamentals)
