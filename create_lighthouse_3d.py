#!/usr/bin/env python3
"""
Blender Python script to create a 3D lighthouse scene with animated beacon
Run with: blender --background --python create_lighthouse_3d.py
"""

import bpy
import math
import os

# Clear existing mesh objects
bpy.ops.wm.read_factory_settings(use_empty=True)

# Scene settings
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 128
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.fps = 30
scene.frame_start = 1
scene.frame_end = 60  # 2 seconds at 30fps for quick test

# World settings - Night sky
world = bpy.data.worlds.new(name="NightSky")
scene.world = world
world.use_nodes = True
bg_node = world.node_tree.nodes['Background']
bg_node.inputs[0].default_value = (0.02, 0.02, 0.08, 1.0)  # Dark blue night sky
bg_node.inputs[1].default_value = 0.5

# Add camera
bpy.ops.object.camera_add(location=(15, -15, 8))
camera = bpy.context.object
camera.rotation_euler = (1.2, 0, 0.785)  # Point at lighthouse
scene.camera = camera

# Animate camera slowly orbiting
camera.animation_data_create()
camera.animation_data.action = bpy.data.actions.new(name="CameraOrbit")
fcurve = camera.animation_data.action.fcurves.new(data_path="rotation_euler", index=2)
fcurve.keyframe_points.add(2)
fcurve.keyframe_points[0].co = (1, 0.785)
fcurve.keyframe_points[1].co = (60, 0.785 + math.radians(30))
for kp in fcurve.keyframe_points:
    kp.interpolation = 'LINEAR'

# Create materials
def create_material(name, color, emission=0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    # Set base color
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    if emission > 0:
        bsdf.inputs['Emission Strength'].default_value = emission
        emission_color = bsdf.inputs['Emission']
        emission_color.default_value = (*color, 1.0)
    return mat

# Materials
white_mat = create_material("White", (0.9, 0.9, 0.9))
red_mat = create_material("Red", (0.8, 0.1, 0.1))
glass_mat = create_material("Glass", (1, 1, 1))
glass_mat.node_tree.nodes["Principled BSDF"].inputs['Transmission'].default_value = 0.95
beacon_mat = create_material("Beacon", (1, 0.95, 0.7), emission=50)
ocean_mat = create_material("Ocean", (0.05, 0.1, 0.2))
ocean_mat.node_tree.nodes["Principled BSDF"].inputs['Metallic'].default_value = 0.8
rock_mat = create_material("Rock", (0.3, 0.25, 0.2))

# Create rocky island base
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, location=(0, 0, -1))
island = bpy.context.object
island.name = "Island"
island.scale = (6, 6, 2)
island.data.materials.append(rock_mat)
# Add displacement modifier for rocky texture
modifier = island.modifiers.new(name="Displace", type='DISPLACE')
texture = bpy.data.textures.new(name="RockTexture", type='CLOUDS')
texture.noise_scale = 0.5
modifier.texture = texture
modifier.strength = 0.3

# Create lighthouse base (wider cylinder)
bpy.ops.mesh.primitive_cylinder_add(location=(0, 0, 1), vertices=32)
base = bpy.context.object
base.name = "LighthouseBase"
base.scale = (2, 2, 1)
base.data.materials.append(white_mat)

# Create lighthouse tower (tapered cylinder)
bpy.ops.mesh.primitive_cylinder_add(location=(0, 0, 4), vertices=32)
tower = bpy.context.object
tower.name = "LighthouseTower"
tower.scale = (1.5, 1.5, 4)
# Taper the top
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='DESELECT')
bpy.ops.mesh.select_mode(type='VERT')
bpy.ops.object.mode_set(mode='OBJECT')
for v in tower.data.vertices:
    if v.co.z > 2:
        v.select = True
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.transform.resize(value=(0.7, 0.7, 1))
bpy.ops.object.mode_set(mode='OBJECT')
tower.data.materials.append(white_mat)

# Add red stripes to lighthouse
for i in range(3):
    bpy.ops.mesh.primitive_cylinder_add(location=(0, 0, 2.5 + i * 2.5), vertices=32)
    stripe = bpy.context.object
    stripe.name = f"Stripe{i}"
    stripe.scale = (1.52 - i * 0.15, 1.52 - i * 0.15, 0.5)
    stripe.data.materials.append(red_mat)

# Create lantern room (glass cylinder)
bpy.ops.mesh.primitive_cylinder_add(location=(0, 0, 8.5), vertices=16)
lantern = bpy.context.object
lantern.name = "LanternRoom"
lantern.scale = (1, 1, 0.8)
lantern.data.materials.append(glass_mat)

# Create lantern roof (cone)
bpy.ops.mesh.primitive_cone_add(location=(0, 0, 9.5), vertices=16)
roof = bpy.context.object
roof.name = "LanternRoof"
roof.scale = (1.2, 1.2, 0.8)
roof.data.materials.append(red_mat)

# Create beacon light source
bpy.ops.mesh.primitive_uv_sphere_add(location=(0, 0, 8.5), radius=0.3)
beacon = bpy.context.object
beacon.name = "BeaconLight"
beacon.data.materials.append(beacon_mat)

# Add spot lights for beacon effect
bpy.ops.object.light_add(type='SPOT', location=(0, 0, 8.5))
spot1 = bpy.context.object
spot1.name = "BeaconSpot1"
spot1.data.energy = 5000
spot1.data.spot_size = math.radians(45)
spot1.data.color = (1, 0.95, 0.7)
spot1.rotation_euler = (0, math.radians(90), 0)

# Duplicate for opposite beam
bpy.ops.object.duplicate()
spot2 = bpy.context.object
spot2.name = "BeaconSpot2"
spot2.rotation_euler = (0, math.radians(-90), 0)

# Animate beacon rotation
for obj in [beacon, spot1, spot2]:
    obj.animation_data_create()
    obj.animation_data.action = bpy.data.actions.new(name=f"{obj.name}Rotation")
    fcurve = obj.animation_data.action.fcurves.new(data_path="rotation_euler", index=2)
    fcurve.keyframe_points.add(2)
    fcurve.keyframe_points[0].co = (1, 0)
    fcurve.keyframe_points[1].co = (60, math.radians(360))
    for kp in fcurve.keyframe_points:
        kp.interpolation = 'LINEAR'

# Create ocean plane with wave modifier
bpy.ops.mesh.primitive_plane_add(location=(0, 0, -0.5), size=50)
ocean = bpy.context.object
ocean.name = "Ocean"
ocean.data.materials.append(ocean_mat)
# Subdivide for wave effect
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.subdivide(number_cuts=50)
bpy.ops.object.mode_set(mode='OBJECT')
# Add wave modifier
wave_mod = ocean.modifiers.new(name="Wave", type='WAVE')
wave_mod.height = 0.3
wave_mod.width = 2
wave_mod.speed = 0.5
wave_mod.start_position_object = ocean

# Add moonlight
bpy.ops.object.light_add(type='SUN', location=(10, 10, 20))
moon = bpy.context.object
moon.name = "Moonlight"
moon.data.energy = 0.5
moon.data.color = (0.8, 0.8, 1)
moon.rotation_euler = (math.radians(-45), math.radians(-45), 0)

# Add ambient light
bpy.ops.object.light_add(type='AREA', location=(0, 0, 15))
ambient = bpy.context.object
ambient.name = "AmbientLight"
ambient.data.energy = 50
ambient.data.color = (0.6, 0.7, 1)
ambient.data.size = 20

# Set output path
output_path = os.path.join(os.getcwd(), "client", "public", "lighthouse-3d.mp4")
scene.render.filepath = output_path
scene.render.image_settings.file_format = 'FFMPEG'
scene.render.ffmpeg.format = 'MPEG4'
scene.render.ffmpeg.codec = 'H264'
scene.render.ffmpeg.constant_rate_factor = 'HIGH'

print(f"Rendering 3D lighthouse animation to: {output_path}")
print("This will take a few minutes...")

# Render animation
bpy.ops.render.render(animation=True)

print(f"✅ 3D lighthouse animation complete! Saved to: {output_path}")
print("You can now use this video as your background in the React app.")