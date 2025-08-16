#!/usr/bin/env python3
"""
Simplified Blender script for lighthouse 3D animation
Compatible with Blender 4.1
"""

import bpy
import math
import os

# Clear all objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Scene settings
scene = bpy.context.scene
scene.render.engine = 'CYCLES'  # Use CYCLES for CPU rendering
scene.cycles.samples = 8  # Very low samples for quick test rendering
scene.cycles.device = 'CPU'
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.fps = 24
scene.frame_start = 1
scene.frame_end = 1  # Single frame for testing

# Set dark blue night sky
bpy.data.worlds["World"].node_tree.nodes["Background"].inputs[0].default_value = (0.01, 0.02, 0.05, 1.0)
bpy.data.worlds["World"].node_tree.nodes["Background"].inputs[1].default_value = 0.3

# Add camera
bpy.ops.object.camera_add(location=(12, -12, 6))
camera = bpy.context.object
camera.rotation_euler = (1.3, 0, 0.785)
scene.camera = camera

# Simple material function
def create_simple_material(name, color, emit=0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs[0].default_value = (*color, 1.0)  # Base Color
    if emit > 0:
        bsdf.inputs[27].default_value = emit  # Emission Strength by index
        bsdf.inputs[26].default_value = (*color, 1.0)  # Emission Color
    return mat

# Create materials
white_mat = create_simple_material("White", (0.95, 0.95, 0.95))
red_mat = create_simple_material("Red", (0.8, 0.1, 0.1))
beacon_mat = create_simple_material("Beacon", (1, 0.95, 0.6), emit=100)
ocean_mat = create_simple_material("Ocean", (0.03, 0.06, 0.15))
rock_mat = create_simple_material("Rock", (0.2, 0.18, 0.15))

# Create island base
bpy.ops.mesh.primitive_uv_sphere_add(location=(0, 0, -1.5), scale=(5, 5, 2))
island = bpy.context.object
island.name = "Island"
island.data.materials.append(rock_mat)

# Create lighthouse base
bpy.ops.mesh.primitive_cylinder_add(location=(0, 0, 0.5), vertices=24, radius=1.8, depth=2)
base = bpy.context.object
base.name = "Base"
base.data.materials.append(white_mat)

# Create lighthouse tower
bpy.ops.mesh.primitive_cylinder_add(location=(0, 0, 3.5), vertices=24, radius=1.2, depth=5)
tower = bpy.context.object
tower.name = "Tower"
tower.data.materials.append(white_mat)

# Add red stripes
for i in range(2):
    z = 2 + i * 2.5
    bpy.ops.mesh.primitive_cylinder_add(location=(0, 0, z), vertices=24, radius=1.25, depth=0.8)
    stripe = bpy.context.object
    stripe.name = f"Stripe{i}"
    stripe.data.materials.append(red_mat)

# Create lantern room
bpy.ops.mesh.primitive_cylinder_add(location=(0, 0, 6.5), vertices=16, radius=0.9, depth=1.2)
lantern = bpy.context.object
lantern.name = "Lantern"
# Make it glassy by adjusting alpha
glass_mat = create_simple_material("Glass", (0.8, 0.9, 1))
glass_mat.blend_method = 'BLEND'
glass_mat.node_tree.nodes["Principled BSDF"].inputs[4].default_value = 0  # Alpha
lantern.data.materials.append(glass_mat)

# Create roof
bpy.ops.mesh.primitive_cone_add(location=(0, 0, 7.5), vertices=16, radius1=1.1, depth=1.2)
roof = bpy.context.object
roof.name = "Roof"
roof.data.materials.append(red_mat)

# Create beacon light
bpy.ops.mesh.primitive_uv_sphere_add(location=(0, 0, 6.5), radius=0.2)
beacon = bpy.context.object
beacon.name = "BeaconLight"
beacon.data.materials.append(beacon_mat)

# Add spot lights for beacon beams
bpy.ops.object.light_add(type='SPOT', location=(0, 0, 6.5))
spot1 = bpy.context.object
spot1.data.energy = 3000
spot1.data.spot_size = math.radians(60)
spot1.data.color = (1, 0.95, 0.6)
spot1.rotation_euler = (0, math.radians(90), 0)

# Add second beam
bpy.ops.object.light_add(type='SPOT', location=(0, 0, 6.5))
spot2 = bpy.context.object
spot2.data.energy = 3000
spot2.data.spot_size = math.radians(60)
spot2.data.color = (1, 0.95, 0.6)
spot2.rotation_euler = (0, math.radians(-90), 0)

# Animate beacon rotation
for obj in [beacon, spot1, spot2]:
    obj.rotation_euler = (0, 0, 0)
    obj.keyframe_insert(data_path="rotation_euler", frame=1)
    obj.rotation_euler = (0, 0, math.radians(360))
    obj.keyframe_insert(data_path="rotation_euler", frame=48)
    # Set linear interpolation
    if obj.animation_data and obj.animation_data.action:
        for fcurve in obj.animation_data.action.fcurves:
            for kp in fcurve.keyframe_points:
                kp.interpolation = 'LINEAR'

# Create ocean
bpy.ops.mesh.primitive_plane_add(location=(0, 0, -1), size=30)
ocean = bpy.context.object
ocean.name = "Ocean"
ocean.data.materials.append(ocean_mat)

# Add moonlight
bpy.ops.object.light_add(type='SUN', location=(5, 5, 10))
moon = bpy.context.object
moon.data.energy = 0.3
moon.data.color = (0.7, 0.8, 1)

# Add some ambient light
bpy.ops.object.light_add(type='AREA', location=(0, 0, 10))
ambient = bpy.context.object
ambient.data.energy = 20
ambient.data.size = 15
ambient.data.color = (0.5, 0.6, 0.8)

# Set output
output_path = os.path.join(os.getcwd(), "client", "public", "lighthouse-3d.png")
scene.render.filepath = output_path
scene.render.image_settings.file_format = 'PNG'

print(f"Rendering lighthouse animation to: {output_path}")
print("This will take about 1-2 minutes...")

# Render the animation
bpy.ops.render.render(animation=True)

print(f"✅ Lighthouse animation complete! Video saved to: {output_path}")