extends Node3D

# Roadrunner 2 - Main Game Controller
# 10-Level Progression System mit spielbarer Geschwindigkeit
# Sandbox-Testversion

signal game_started
signal game_over
signal level_completed(level_num)
signal level_started(level_data)
signal score_updated(distance)

# =============================================================================
# LEVEL CONFIGURATION - 10 Levels mit progressiver Schwierigkeit
# =============================================================================
# Design-Philosophie:
# - Level 1-3: Tutorial-Phase (langsam, wenig Hindernisse)
# - Level 4-7: Herausforderung (mittelschnell, mehr Hindernisse)
# - Level 8-10: Expert-Phase (schnell, viele Hindernisse)
#
# Geschwindigkeit: Von 8.0 (Level 1) bis 35.0 (Level 10)
# Die "20 Sekunden vor Ende"-Geschwindigkeit (ca. 35.0) ist jetzt Endgeschwindigkeit

var level_configs = {
	1: {
		"speed": 8.0,           # Sehr langsam für Tests
		"spawn_rate": 2.5,      # Alle 2.5 Sekunden ein Hindernis
		"goal_distance": 300,   # 300 Meter zum Ziel
		"description": "Tutorial - Warm Up",
		"obstacle_density": "low"
	},
	2: {
		"speed": 10.0,
		"spawn_rate": 2.2,
		"goal_distance": 500,
		"description": "Getting Started",
		"obstacle_density": "low"
	},
	3: {
		"speed": 12.0,
		"spawn_rate": 2.0,
		"goal_distance": 700,
		"description": "Picking Up Speed",
		"obstacle_density": "medium"
	},
	4: {
		"speed": 15.0,
		"spawn_rate": 1.8,
		"goal_distance": 1000,
		"description": "City Rush",
		"obstacle_density": "medium"
	},
	5: {
		"speed": 18.0,
		"spawn_rate": 1.6,
		"goal_distance": 1500,
		"description": "Neon Highway",
		"obstacle_density": "medium"
	},
	6: {
		"speed": 22.0,
		"spawn_rate": 1.4,
		"goal_distance": 2000,
		"description": "Traffic Jam",
		"obstacle_density": "high"
	},
	7: {
		"speed": 26.0,
		"spawn_rate": 1.2,
		"goal_distance": 2500,
		"description": "Speed Demon",
		"obstacle_density": "high"
	},
	8: {
		"speed": 30.0,
		"spawn_rate": 1.0,
		"goal_distance": 3000,
		"description": "Chaos Mode",
		"obstacle_density": "very_high"
	},
	9: {
		"speed": 33.0,
		"spawn_rate": 0.8,
		"goal_distance": 3500,
		"description": "Near Impossible",
		"obstacle_density": "very_high"
	},
	10: {
		"speed": 35.0,          # Endgeschwindigkeit (wie "20 Sek vor Ende")
		"spawn_rate": 0.6,
		"goal_distance": 5000,
		"description": "THE FINAL RUN",
		"obstacle_density": "extreme"
	}
}

# =============================================================================
# STATE MANAGEMENT
# =============================================================================
enum GameState { IDLE, PLAYING, PAUSED, LEVEL_COMPLETE, GAME_OVER, VICTORY }

var current_state: GameState = GameState.IDLE
var current_level: int = 1
var distance_traveled: float = 0.0  # Meter im aktuellen Level
var total_distance: float = 0.0     # Gesamte Distanz über alle Level
var current_speed: float = 0.0
var high_score: int = 0
var score: int = 0  # Für Kompatibilität

# Node-Referenzen (werden später verknüpft)
@onready var player_node = null  # TODO: Wird später verknüpft
@onready var spawner_node = null # TODO: Wird später verknüpft

# =============================================================================
# INITIALIZATION
# =============================================================================
func _ready():
	print("╔═══════════════════════════════════════════════╗")
	print("║  🎮 ROADRUNNER 2 - SANDBOX TESTVERSION       ║")
	print("║  10-Level System mit spielbarer Geschwindigkeit║")
	print("╚═══════════════════════════════════════════════╝")
	print("")
	print("⚙️  System Initialized")
	print("📊 Level Configuration:")
	print("   - Total Levels: ", level_configs.size())
	print("   - Speed Range: ", level_configs[1]["speed"], " → ", level_configs[10]["speed"])
	print("")
	print("🎯 Controls:")
	print("   - Leertaste: Start Game / Next Level")
	print("   - ESC: Pause")
	print("")

	# Lade Highscore (später aus Datei)
	high_score = 0

	# Zeige Level 1 Info
	show_level_info(1)

# =============================================================================
# MAIN GAME LOOP
# =============================================================================
func _process(delta):
	if current_state == GameState.PLAYING:
		# 1. Distanz erhöhen basierend auf aktueller Geschwindigkeit
		var distance_this_frame = current_speed * delta
		distance_traveled += distance_this_frame
		total_distance += distance_this_frame

		# 2. Score-UI aktualisieren (alle 0.1 Sekunden)
		if Engine.get_physics_frames() % 6 == 0:  # ~10 FPS Update
			emit_signal("score_updated", int(distance_traveled))

		# 3. Level-Fortschritt prüfen
		check_level_progress()

# Input-Handling
func _input(event):
	if event.is_action_pressed("ui_accept"):  # Leertaste
		match current_state:
			GameState.IDLE:
				start_game()
			GameState.LEVEL_COMPLETE:
				next_level()
			GameState.GAME_OVER:
				restart_game()

	if event.is_action_pressed("ui_cancel"):  # ESC
		if current_state == GameState.PLAYING:
			pause_game()
		elif current_state == GameState.PAUSED:
			resume_game()

# =============================================================================
# GAME STATE FUNCTIONS
# =============================================================================
func start_game():
	"""Startet das Spiel mit Level 1"""
	print("\n🏁 GAME START!")
	current_level = 1
	total_distance = 0.0
	setup_level(current_level)
	current_state = GameState.PLAYING
	emit_signal("game_started")

func setup_level(level_idx: int):
	"""Bereitet ein Level vor und setzt alle Werte"""
	if not level_configs.has(level_idx):
		print("❌ Level ", level_idx, " existiert nicht!")
		return

	var config = level_configs[level_idx]
	current_speed = config["speed"]
	distance_traveled = 0.0  # Reset für neues Level

	print("\n╔════════════════════════════════════════╗")
	print("║  🎯 LEVEL ", level_idx, " / 10")
	print("║  ", config["description"])
	print("╠════════════════════════════════════════╣")
	print("║  Speed:    ", config["speed"], " m/s")
	print("║  Goal:     ", config["goal_distance"], " meters")
	print("║  Spawn:    Every ", config["spawn_rate"], "s")
	print("║  Density:  ", config["obstacle_density"])
	print("╚════════════════════════════════════════╝\n")

	# WICHTIG: Werte an Subsysteme verteilen
	# TODO: Sobald Player und Spawner existieren:
	# if player_node:
	#     player_node.base_speed = current_speed
	# if spawner_node:
	#     spawner_node.spawn_interval = config["spawn_rate"]
	#     spawner_node.density_mode = config["obstacle_density"]

	emit_signal("level_started", config)

func check_level_progress():
	"""Prüft ob Level-Ziel erreicht wurde"""
	var goal = level_configs[current_level]["goal_distance"]

	if distance_traveled >= goal:
		complete_level()

func complete_level():
	"""Level erfolgreich abgeschlossen"""
	print("\n✅ LEVEL ", current_level, " COMPLETE!")
	print("   Distance: ", int(distance_traveled), " / ", level_configs[current_level]["goal_distance"])

	current_state = GameState.LEVEL_COMPLETE
	emit_signal("level_completed", current_level)

	# Highscore Update
	if total_distance > high_score:
		high_score = int(total_distance)
		print("🏆 NEW HIGH SCORE: ", high_score, " meters!")

	# Automatischer Übergang (kann auch per UI-Button gemacht werden)
	if current_level < 10:
		print("\n⏸️  Drücke LEERTASTE für Level ", current_level + 1)
	else:
		game_won()

func next_level():
	"""Geht zum nächsten Level"""
	current_level += 1

	if current_level <= 10:
		setup_level(current_level)
		current_state = GameState.PLAYING
	else:
		game_won()

func pause_game():
	"""Pausiert das Spiel"""
	current_state = GameState.PAUSED
	print("\n⏸️  PAUSED (ESC to resume)")

func resume_game():
	"""Setzt das Spiel fort"""
	current_state = GameState.PLAYING
	print("▶️  RESUMED")

func end_game():
	"""Game Over (von außen aufgerufen z.B. bei Kollision)"""
	print("\n💀 GAME OVER!")
	print("   Level Reached: ", current_level)
	print("   Total Distance: ", int(total_distance), " meters")

	current_state = GameState.GAME_OVER
	emit_signal("game_over")

	print("\n🔄 Drücke LEERTASTE zum Neustart")

func game_won():
	"""Alle 10 Level geschafft!"""
	print("\n╔════════════════════════════════════════╗")
	print("║  🏆 VICTORY! ALL 10 LEVELS COMPLETE!  ║")
	print("╠════════════════════════════════════════╣")
	print("║  Total Distance: ", int(total_distance), " meters")
	print("║  High Score:     ", high_score, " meters")
	print("╚════════════════════════════════════════╝\n")

	current_state = GameState.VICTORY
	# Hier könnte Credits-Screen oder Victory-Animation kommen

func restart_game():
	"""Startet das Spiel komplett neu"""
	print("\n🔄 RESTART...")
	start_game()

# =============================================================================
# DEBUG & HELPER FUNCTIONS
# =============================================================================
func show_level_info(level_idx: int):
	"""Zeigt Infos zu einem Level (für UI/Debug)"""
	if level_configs.has(level_idx):
		var cfg = level_configs[level_idx]
		print("Level ", level_idx, ": ", cfg["description"])
		print("  Speed: ", cfg["speed"], " | Goal: ", cfg["goal_distance"], "m")

func get_current_progress() -> float:
	"""Gibt Fortschritt im aktuellen Level zurück (0.0 - 1.0)"""
	if current_state != GameState.PLAYING:
		return 0.0

	var goal = level_configs[current_level]["goal_distance"]
	return clamp(distance_traveled / goal, 0.0, 1.0)

func get_level_config(level_idx: int) -> Dictionary:
	"""Gibt Konfiguration für ein Level zurück"""
	if level_configs.has(level_idx):
		return level_configs[level_idx]
	return {}

# =============================================================================
# DEBUGGING CONSOLE COMMANDS (für Entwicklung)
# =============================================================================
# Kann im Godot-Remote-Debugger aufgerufen werden:
func debug_skip_to_level(level_idx: int):
	"""Springt direkt zu einem Level (nur für Tests)"""
	if level_idx >= 1 and level_idx <= 10:
		current_level = level_idx
		setup_level(level_idx)
		current_state = GameState.PLAYING
		print("🔧 DEBUG: Jumped to Level ", level_idx)
	else:
		print("❌ Invalid level: ", level_idx)

func debug_add_distance(amount: float):
	"""Fügt Distanz hinzu (nur für Tests)"""
	distance_traveled += amount
	print("🔧 DEBUG: Added ", amount, "m distance")