extends Node3D

# Level Generator für Roadrunner 2
# Spawnt Hindernisse und Collectibles mit Object Pooling

# =============================================================================
# SPAWN CONFIGURATION
# =============================================================================
const LANE_POSITIONS = [-2.0, 0.0, 2.0]  # Muss mit Player.gd übereinstimmen
const SPAWN_DISTANCE = 50.0  # Wie weit vor dem Player spawnen
const DESPAWN_DISTANCE = -10.0  # Wann Objekte recycled werden

# =============================================================================
# OBJECT POOLING
# =============================================================================
var obstacle_pool: Array = []
var collectible_pool: Array = []
const POOL_SIZE = 50  # Anzahl vorgenerierter Objekte

# =============================================================================
# SPAWN CONTROL
# =============================================================================
var spawn_interval: float = 2.5  # Sekunden zwischen Spawns (von Main.gd gesetzt)
var density_mode: String = "low"  # low, medium, high, very_high, extreme
var time_since_last_spawn: float = 0.0

var is_spawning: bool = false
var player_ref = null  # Referenz zum Player

# =============================================================================
# INITIALIZATION
# =============================================================================
func _ready():
	print("🏗️  LevelGenerator initialized")
	# Object Pool vorbereiten
	initialize_pools()

func initialize_pools():
	"""Erstellt Pool von wiederverwendbaren Objekten"""
	print("🔧 Creating object pools (size: ", POOL_SIZE, ")...")

	for i in range(POOL_SIZE):
		# Hindernisse erstellen
		var obstacle = create_obstacle()
		obstacle.visible = false
		add_child(obstacle)
		obstacle_pool.append(obstacle)

		# Collectibles erstellen
		var collectible = create_collectible()
		collectible.visible = false
		add_child(collectible)
		collectible_pool.append(collectible)

	print("✅ Object pools ready")

func create_obstacle() -> Node3D:
	"""Erstellt ein neues Hindernis (einfacher Würfel)"""
	var obstacle = MeshInstance3D.new()
	obstacle.name = "Obstacle"

	# Einfacher Würfel als Mesh
	var box_mesh = BoxMesh.new()
	box_mesh.size = Vector3(1.5, 2.0, 1.0)  # Breite x Höhe x Tiefe
	obstacle.mesh = box_mesh

	# Material (Rot für Hindernisse)
	var material = StandardMaterial3D.new()
	material.albedo_color = Color(1.0, 0.2, 0.2)  # Rot
	material.emission_enabled = true
	material.emission = Color(1.0, 0.0, 0.0)
	material.emission_energy = 0.5
	obstacle.set_surface_override_material(0, material)

	# Collision (StaticBody3D für Hindernisse)
	var collision_body = StaticBody3D.new()
	collision_body.add_to_group("obstacles")

	var collision_shape = CollisionShape3D.new()
	var box_shape = BoxShape3D.new()
	box_shape.size = Vector3(1.5, 2.0, 1.0)
	collision_shape.shape = box_shape

	collision_body.add_child(collision_shape)
	obstacle.add_child(collision_body)

	return obstacle

func create_collectible() -> Node3D:
	"""Erstellt ein Collectible (Kugel)"""
	var collectible = MeshInstance3D.new()
	collectible.name = "Collectible"

	# Kugel als Mesh
	var sphere_mesh = SphereMesh.new()
	sphere_mesh.radius = 0.5
	sphere_mesh.height = 1.0
	collectible.mesh = sphere_mesh

	# Material (Grün/Gold für Collectibles)
	var material = StandardMaterial3D.new()
	material.albedo_color = Color(1.0, 0.8, 0.2)  # Gold
	material.emission_enabled = true
	material.emission = Color(1.0, 1.0, 0.0)
	material.emission_energy = 1.0
	material.metallic = 0.8
	collectible.set_surface_override_material(0, material)

	# Collision (Area3D für Collectibles)
	var collision_body = Area3D.new()
	collision_body.add_to_group("collectibles")

	var collision_shape = CollisionShape3D.new()
	var sphere_shape = SphereShape3D.new()
	sphere_shape.radius = 0.5
	collision_shape.shape = sphere_shape

	collision_body.add_child(collision_shape)
	collectible.add_child(collision_body)

	return collectible

# =============================================================================
# MAIN SPAWN LOOP
# =============================================================================
func _process(delta):
	if not is_spawning:
		return

	# 1. Spawn Timer
	time_since_last_spawn += delta

	if time_since_last_spawn >= spawn_interval:
		spawn_random_object()
		time_since_last_spawn = 0.0

	# 2. Cleanup: Recycel Objekte die hinter dem Player sind
	cleanup_old_objects()

func spawn_random_object():
	"""Spawnt ein zufälliges Objekt (Hindernis oder Collectible)"""
	# 70% Hindernisse, 30% Collectibles
	var spawn_obstacle_chance = 0.7

	if randf() < spawn_obstacle_chance:
		spawn_obstacle()
	else:
		spawn_collectible()

func spawn_obstacle():
	"""Spawnt ein Hindernis in einer zufälligen Lane"""
	# Hole recyceltes Hindernis aus Pool
	var obstacle = get_pooled_obstacle()
	if obstacle == null:
		print("⚠️  Obstacle pool exhausted!")
		return

	# Zufällige Lane
	var lane = randi() % LANE_POSITIONS.size()
	var spawn_pos = Vector3(
		LANE_POSITIONS[lane],
		1.0,  # Höhe (damit es auf dem Boden steht)
		-SPAWN_DISTANCE
	)

	# Obstacle aktivieren
	obstacle.position = spawn_pos
	obstacle.visible = true

	# Optional: Rotation für Abwechslung
	obstacle.rotation_degrees.y = randf_range(0, 360)

func spawn_collectible():
	"""Spawnt ein Collectible in einer zufälligen Lane"""
	var collectible = get_pooled_collectible()
	if collectible == null:
		print("⚠️  Collectible pool exhausted!")
		return

	# Zufällige Lane
	var lane = randi() % LANE_POSITIONS.size()
	var spawn_pos = Vector3(
		LANE_POSITIONS[lane],
		1.5,  # Etwas höher als Hindernisse
		-SPAWN_DISTANCE
	)

	# Collectible aktivieren
	collectible.position = spawn_pos
	collectible.visible = true

	# Rotation für schwebenden Effekt
	collectible.rotation_degrees.y = randf_range(0, 360)

# =============================================================================
# OBJECT POOL MANAGEMENT
# =============================================================================
func get_pooled_obstacle() -> Node3D:
	"""Holt ein inaktives Hindernis aus dem Pool"""
	for obstacle in obstacle_pool:
		if not obstacle.visible:
			return obstacle
	return null  # Pool leer

func get_pooled_collectible() -> Node3D:
	"""Holt ein inaktives Collectible aus dem Pool"""
	for collectible in collectible_pool:
		if not collectible.visible:
			return collectible
	return null

func cleanup_old_objects():
	"""Deaktiviert Objekte die hinter dem Player sind"""
	# Hindernisse recyceln
	for obstacle in obstacle_pool:
		if obstacle.visible and obstacle.position.z > DESPAWN_DISTANCE:
			obstacle.visible = false

	# Collectibles recyceln
	for collectible in collectible_pool:
		if collectible.visible and collectible.position.z > DESPAWN_DISTANCE:
			collectible.visible = false

# =============================================================================
# GAME FLOW CONTROL (von Main.gd aufgerufen)
# =============================================================================
func start_spawning():
	"""Aktiviert Spawning"""
	is_spawning = true
	time_since_last_spawn = 0.0
	print("▶️  Spawning started (interval: ", spawn_interval, "s)")

func stop_spawning():
	"""Stoppt Spawning"""
	is_spawning = false
	print("⏸️  Spawning stopped")

func clear_all_objects():
	"""Versteckt alle aktiven Objekte (für Level-Reset)"""
	for obstacle in obstacle_pool:
		obstacle.visible = false

	for collectible in collectible_pool:
		collectible.visible = false

	print("🧹 All objects cleared")

func set_spawn_rate(new_rate: float):
	"""Setzt Spawn-Intervall (von Main.gd bei Level-Wechsel aufgerufen)"""
	spawn_interval = new_rate
	print("⏱️  Spawn interval: ", new_rate, "s")

func set_density(mode: String):
	"""Setzt Schwierigkeitsgrad (ändert Spawn-Wahrscheinlichkeit)"""
	density_mode = mode
	# Hier könnte man Spawn-Wahrscheinlichkeiten anpassen
	# z.B. bei "extreme" mehr Hindernisse, weniger Collectibles
	print("🎚️  Density mode: ", mode)

# =============================================================================
# DEBUG FUNCTIONS
# =============================================================================
func get_active_object_count() -> Dictionary:
	"""Zählt aktive Objekte (für Debug-UI)"""
	var active_obstacles = 0
	var active_collectibles = 0

	for obstacle in obstacle_pool:
		if obstacle.visible:
			active_obstacles += 1

	for collectible in collectible_pool:
		if collectible.visible:
			active_collectibles += 1

	return {
		"obstacles": active_obstacles,
		"collectibles": active_collectibles,
		"total": active_obstacles + active_collectibles
	}
