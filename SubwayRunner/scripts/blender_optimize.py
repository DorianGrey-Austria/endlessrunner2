"""
Blender batch GLB optimizer — reduces poly count and file size.
Run: blender --background --python scripts/blender_optimize.py
"""
import bpy
import os
import sys
import json
from pathlib import Path

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"

# Models to optimize: name → target decimate ratio (0.5 = keep 50% of faces)
OPTIMIZE_TARGETS = {
    "env_building_1.glb": 0.45,
    "env_building_2.glb": 0.45,
    "obstacle_jumpblock.glb": 0.50,
    "obstacle_wallgap.glb": 0.50,
    "obstacle_movingwall.glb": 0.50,
    "obstacle_bouncingball.glb": 0.55,
    "obstacle_lowbarrier.glb": 0.50,
    "broccoli.glb": 0.55,
    "apple.glb": 0.55,
    "env_building_3.glb": 0.50,
    "obstacle_spinninglaser.glb": 0.55,
    "player.glb": 0.60,           # less aggressive — player is always visible
    "env_trafficsign.glb": 0.55,
    "obstacle_duckbeam.glb": 0.55,
    "env_streetlamp.glb": 0.55,
    "env_tunnelpipe.glb": 0.55,
    "obstacle_rotatingblade.glb": 0.55,
    "obstacle_swinghammer.glb": 0.55,
    "obstacle_hurdleset.glb": 0.55,
    "obstacle_spikes.glb": 0.55,
}

results = {}

for filename, ratio in OPTIMIZE_TARGETS.items():
    filepath = MODELS_DIR / filename
    if not filepath.exists():
        print(f"SKIP: {filename} not found")
        continue

    original_size = filepath.stat().st_size
    print(f"\n{'='*60}")
    print(f"Processing: {filename} ({original_size/1024:.0f} KB, ratio={ratio})")

    # Clear scene
    bpy.ops.wm.read_factory_settings(use_empty=True)

    # Import GLB
    bpy.ops.import_scene.gltf(filepath=str(filepath))

    total_verts_before = 0
    total_faces_before = 0
    meshes_processed = 0

    # Process each mesh object
    for obj in bpy.data.objects:
        if obj.type != 'MESH':
            continue

        total_verts_before += len(obj.data.vertices)
        total_faces_before += len(obj.data.polygons)

        # Select object
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)

        # Remove doubles (merge close vertices)
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.remove_doubles(threshold=0.001)
        bpy.ops.object.mode_set(mode='OBJECT')

        # Only decimate if mesh has enough faces
        if len(obj.data.polygons) > 100:
            mod = obj.modifiers.new(name="Decimate", type='DECIMATE')
            mod.decimate_type = 'COLLAPSE'
            mod.ratio = ratio
            mod.use_collapse_triangulate = True
            bpy.ops.object.modifier_apply(modifier="Decimate")

        # Recalculate normals
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.normals_make_consistent(inside=False)
        bpy.ops.object.mode_set(mode='OBJECT')

        # Auto smooth normals for better shading
        if hasattr(obj.data, 'use_auto_smooth'):
            obj.data.use_auto_smooth = True
            obj.data.auto_smooth_angle = 1.0472  # 60 degrees

        obj.select_set(False)
        meshes_processed += 1

    total_verts_after = sum(len(o.data.vertices) for o in bpy.data.objects if o.type == 'MESH')
    total_faces_after = sum(len(o.data.polygons) for o in bpy.data.objects if o.type == 'MESH')

    # Export optimized GLB (with DRACO compression) — Blender 5.0 API
    bpy.ops.export_scene.gltf(
        filepath=str(filepath),
        export_format='GLB',
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_draco_position_quantization=14,
        export_draco_normal_quantization=10,
        export_draco_texcoord_quantization=12,
        export_draco_color_quantization=10,
        export_materials='EXPORT',
        export_vertex_color='MATERIAL',
        export_normals=True,
        export_apply=True,
    )

    new_size = filepath.stat().st_size
    reduction = (1 - new_size / original_size) * 100

    results[filename] = {
        "original_kb": round(original_size / 1024),
        "optimized_kb": round(new_size / 1024),
        "reduction_pct": round(reduction, 1),
        "verts_before": total_verts_before,
        "verts_after": total_verts_after,
        "faces_before": total_faces_before,
        "faces_after": total_faces_after,
        "meshes": meshes_processed,
    }

    print(f"  Verts: {total_verts_before} → {total_verts_after}")
    print(f"  Faces: {total_faces_before} → {total_faces_after}")
    print(f"  Size: {original_size/1024:.0f} KB → {new_size/1024:.0f} KB ({reduction:.1f}% reduction)")

# Summary
print(f"\n{'='*60}")
print("OPTIMIZATION SUMMARY")
print(f"{'='*60}")
total_saved = 0
for name, r in sorted(results.items(), key=lambda x: x[1]['reduction_pct'], reverse=True):
    saved = r['original_kb'] - r['optimized_kb']
    total_saved += saved
    print(f"  {name:40s} {r['original_kb']:>6d} KB → {r['optimized_kb']:>6d} KB  ({r['reduction_pct']:>5.1f}%)")

print(f"\n  TOTAL SAVED: {total_saved} KB ({total_saved/1024:.1f} MB)")

# Save results
results_path = MODELS_DIR / "optimization_results.json"
with open(results_path, 'w') as f:
    json.dump(results, f, indent=2)
print(f"\nResults saved to: {results_path}")
