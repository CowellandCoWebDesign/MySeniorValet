#!/usr/bin/env python3
"""
Quick looping lighthouse animation - 12 frames for smooth rotation
"""

import bpy
import math
import os

# Clear all objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Scene settings - ULTRA LOW quality for fast rendering
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 4  # Ultra low for speed
scene.cycles.device = 'CPU'
scene.render.resolution_x = 960
scene.render.resolution_y = 540  
scene.render.fps = 12
scene.frame_start = 1
scene.frame_end = 12  # 12 frames for a perfect loop

# Dark night sky
bpy.data.worlds["World"].node_tree.nodes["Background"].inputs[0].default_value = (0.01, 0.02, 0.05, 1.0)
bpy.data.worlds["World"].node_tree.nodes["Background"].inputs[1].default_value = 0.2

# Add camera
bpy.ops.object.camera_add(location=(10, -10, 5))
camera = bpy.context.object
camera.rotation_euler = (1.3, 0, 0.785)
scene.camera = camera

# Simple materials
def quick_material(name, color, emit=0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs[0].default_value = (*color, 1.0)
    if emit > 0:
        bsdf.inputs[27].default_value = emit
        bsdf.inputs[26].default_value = (*color, 1.0)
    return mat

white_mat = quick_material("White", (0.95, 0.95, 0.95))
red_mat = quick_material("Red", (0.8, 0.1, 0.1))
beacon_mat = quick_material("Beacon", (1, 0.95, 0.6), emit=80)
ocean_mat = quick_material("Ocean", (0.02, 0.04, 0.1))

# Simple island
bpy.ops.mesh.primitive_uv_sphere_add(location=(0, 0, -1), scale=(4, 4, 1.5))
island = bpy.context.object
island.data.materials.append(ocean_mat)

# Lighthouse base
bpy.ops.mesh.primitive_cylinder_add(location=(0, 0, 0.5), vertices=16)
base = bpy.context.object
base.scale = (1.5, 1.5, 1)
base.data.materials.append(white_mat)

# Tower
bpy.ops.mesh.primitive_cylinder_add(location=(0, 0, 3), vertices=16)
tower = bpy.context.object
tower.scale = (1, 1, 3)
tower.data.materials.append(white_mat)

# Red stripe
bpy.ops.mesh.primitive_cylinder_add(location=(0, 0, 3), vertices=16)
stripe = bpy.context.object
stripe.scale = (1.05, 1.05, 0.5)
stripe.data.materials.append(red_mat)

# Lantern
bpy.ops.mesh.primitive_cylinder_add(location=(0, 0, 5.5), vertices=12)
lantern = bpy.context.object
lantern.scale = (0.7, 0.7, 0.8)
lantern.data.materials.append(white_mat)

# Roof
bpy.ops.mesh.primitive_cone_add(location=(0, 0, 6.3), vertices=12)
roof = bpy.context.object
roof.scale = (0.9, 0.9, 0.7)
roof.data.materials.append(red_mat)

# Beacon light sphere
bpy.ops.mesh.primitive_uv_sphere_add(location=(0, 0, 5.5), radius=0.15)
beacon = bpy.context.object
beacon.data.materials.append(beacon_mat)

# Spot lights for beams
bpy.ops.object.light_add(type='SPOT', location=(0, 0, 5.5))
spot1 = bpy.context.object
spot1.data.energy = 2000
spot1.data.spot_size = math.radians(70)
spot1.data.color = (1, 0.95, 0.6)
spot1.rotation_euler = (0, math.radians(90), 0)

bpy.ops.object.light_add(type='SPOT', location=(0, 0, 5.5))
spot2 = bpy.context.object
spot2.data.energy = 2000
spot2.data.spot_size = math.radians(70)
spot2.data.color = (1, 0.95, 0.6)
spot2.rotation_euler = (0, math.radians(-90), 0)

# Animate beacon rotation - perfect loop
for obj in [beacon, spot1, spot2]:
    obj.rotation_euler = (0, 0, 0)
    obj.keyframe_insert(data_path="rotation_euler", frame=1)
    obj.rotation_euler = (0, 0, math.radians(360))
    obj.keyframe_insert(data_path="rotation_euler", frame=13)  # Frame 13 = Frame 1 for perfect loop
    
    if obj.animation_data and obj.animation_data.action:
        for fcurve in obj.animation_data.action.fcurves:
            for kp in fcurve.keyframe_points:
                kp.interpolation = 'LINEAR'

# Ocean plane
bpy.ops.mesh.primitive_plane_add(location=(0, 0, -0.8), size=20)
ocean = bpy.context.object
ocean.data.materials.append(ocean_mat)

# Moonlight
bpy.ops.object.light_add(type='SUN', location=(5, 5, 10))
moon = bpy.context.object
moon.data.energy = 0.2
moon.data.color = (0.7, 0.8, 1)

# Output settings
output_path = os.path.join(os.getcwd(), "client", "public", "lighthouse-loop.mp4")
scene.render.filepath = output_path
scene.render.image_settings.file_format = 'FFMPEG'
scene.render.ffmpeg.format = 'MPEG4'
scene.render.ffmpeg.codec = 'H264'
scene.render.ffmpeg.constant_rate_factor = 'HIGH'

print("Rendering 12-frame lighthouse loop...")
print(f"Output: {output_path}")

# Render animation
bpy.ops.render.render(animation=True)

print("✅ Lighthouse loop complete!")