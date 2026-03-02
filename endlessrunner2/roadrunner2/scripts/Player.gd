extends CharacterBody3D

# Player Controller für Roadrunner 2
# Einfacher 3-Spuren Endless Runner mit Lane-Switching und Jump

# =============================================================================
# LANE SYSTEM
# =============================================================================
const LANE_POSITIONS = [-2.0, 0.0, 2.0]  # Links, Mitte, Rechts
var current_lane: int = 1  # Startet in der Mitte (Index 1)
var target_position: Vector3 = Vector3.ZERO
var lane_switch_speed: float = 10.0  # Geschwindigkeit beim Spurwechsel

# =============================================================================
# MOVEMENT
# =============================================================================
var base_speed: float = 8.0  # Wird von Main.gd gesetzt
var forward_speed: float = 8.0
var gravity: float = 20.0

# =============================================================================
# JUMP SYSTEM
# =============================================================================
var jump_force: float = 12.0
var is_jumping: bool = false
var can_jump: bool = true

# =============================================================================
# STATE
# =============================================================================
var is_alive: bool = true
var is_playing: bool = false

func _ready():
	print("🏃 Player initialized")
	# Setze Startposition
	position = Vector3(LANE_POSITIONS[current_lane], 0, 0)
	target_position = position

func _physics_process(delta):
	if not is_playing or not is_alive:
		return

	# 1. Bewegung nach vorne (konstante Geschwindigkeit)
	velocity.z = -forward_speed  # Negative Z = vorwärts in Godot

	# 2. Lane-Switching (links/rechts Input)
	handle_lane_input()

	# 3. Sanfter Übergang zur Ziel-Lane
	var current_x = position.x
	var target_x = LANE_POSITIONS[current_lane]
	position.x = lerp(current_x, target_x, lane_switch_speed * delta)

	# 4. Jump-Input
	handle_jump_input()

	# 5. Schwerkraft anwenden
	if not is_on_floor():
		velocity.y -= gravity * delta
	else:
		is_jumping = false
		can_jump = true

	# 6. Bewegung ausführen
	move_and_slide()

func handle_lane_input():
	"""Behandelt Lane-Switching Input (A/D oder Pfeiltasten)"""
	if Input.is_action_just_pressed("ui_left"):  # A oder ←
		switch_lane(-1)  # Eine Spur nach links
	elif Input.is_action_just_pressed("ui_right"):  # D oder →
		switch_lane(1)   # Eine Spur nach rechts

func switch_lane(direction: int):
	"""Wechselt die Spur (-1 = links, +1 = rechts)"""
	var new_lane = current_lane + direction

	# Begrenzung auf 3 Spuren (0, 1, 2)
	if new_lane >= 0 and new_lane < LANE_POSITIONS.size():
		current_lane = new_lane
		print("🔄 Lane Switch: ", current_lane, " (X: ", LANE_POSITIONS[current_lane], ")")

func handle_jump_input():
	"""Behandelt Sprung-Input (Leertaste oder W)"""
	if Input.is_action_just_pressed("ui_accept") and can_jump and is_on_floor():
		velocity.y = jump_force
		is_jumping = true
		can_jump = false
		print("🦘 Jump!")

# =============================================================================
# GAME FLOW FUNCTIONS (von Main.gd aufgerufen)
# =============================================================================
func start_playing():
	"""Aktiviert Player-Steuerung (wird von Main.gd aufgerufen)"""
	is_playing = true
	is_alive = true
	print("▶️  Player: Playing")

func stop_playing():
	"""Deaktiviert Player-Steuerung"""
	is_playing = false
	velocity = Vector3.ZERO
	print("⏸️  Player: Stopped")

func reset_position():
	"""Setzt Player zurück zur Startposition"""
	position = Vector3(LANE_POSITIONS[1], 0, 0)
	current_lane = 1
	velocity = Vector3.ZERO
	print("🔄 Player: Reset to start")

func set_speed(new_speed: float):
	"""Setzt Geschwindigkeit (wird von Main.gd bei Level-Wechsel aufgerufen)"""
	base_speed = new_speed
	forward_speed = new_speed
	print("⚡ Player Speed: ", new_speed, " m/s")

func die():
	"""Player stirbt (z.B. bei Kollision mit Hindernis)"""
	if not is_alive:
		return

	is_alive = false
	is_playing = false
	velocity = Vector3.ZERO
	print("💀 Player died!")

	# Informiere Main.gd über Game Over
	get_parent().end_game()

# =============================================================================
# COLLISION DETECTION
# =============================================================================
func _on_body_entered(body):
	"""Wird aufgerufen wenn Player mit etwas kollidiert"""
	if body.is_in_group("obstacles"):
		print("💥 Hit obstacle!")
		die()
	elif body.is_in_group("collectibles"):
		print("✨ Collected item!")
		body.queue_free()  # Entfernt Collectible

# =============================================================================
# DEBUG FUNCTIONS
# =============================================================================
func get_debug_info() -> String:
	"""Gibt Debug-Info zurück (für UI)"""
	return "Lane: %d | Speed: %.1f | Y: %.2f | Alive: %s" % [
		current_lane,
		forward_speed,
		position.y,
		is_alive
	]
