from PIL import Image, ImageDraw, ImageFilter, ImageFont
import random
import os

def create_gradient(width, height, colors):
    """Create a smooth gradient between colors"""
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)
    
    for y in range(height):
        ratio = y / height
        if ratio < 0.5:
            # Gradient from first to second color
            local_ratio = ratio * 2
            r = int(colors[0][0] * (1 - local_ratio) + colors[1][0] * local_ratio)
            g = int(colors[0][1] * (1 - local_ratio) + colors[1][1] * local_ratio)
            b = int(colors[0][2] * (1 - local_ratio) + colors[1][2] * local_ratio)
        else:
            # Gradient from second to third color
            local_ratio = (ratio - 0.5) * 2
            r = int(colors[1][0] * (1 - local_ratio) + colors[2][0] * local_ratio)
            g = int(colors[1][1] * (1 - local_ratio) + colors[2][1] * local_ratio)
            b = int(colors[1][2] * (1 - local_ratio) + colors[2][2] * local_ratio)
        
        draw.rectangle([(0, y), (width, y+1)], fill=(r, g, b))
    
    return img

def add_highlights(img, color=(255, 255, 255, 100)):
    """Add subtle highlights to image"""
    overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Add some light spots
    for _ in range(20):
        x = random.randint(0, img.width)
        y = random.randint(0, img.height // 2)
        radius = random.randint(50, 150)
        for i in range(radius, 0, -5):
            alpha = int(color[3] * (1 - i/radius))
            draw.ellipse([x-i, y-i, x+i, y+i], fill=(color[0], color[1], color[2], alpha))
    
    # Convert and blend
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    return Image.alpha_composite(img, overlay).convert('RGB')

def create_tropical_pool_sunset():
    """Luxury infinity pool at sunset with ocean view"""
    img = create_gradient(1920, 1080, [
        (255, 94, 77),   # Coral sunset top
        (255, 154, 100), # Orange middle
        (100, 180, 220)  # Ocean blue bottom
    ])
    
    draw = ImageDraw.Draw(img)
    
    # Ocean horizon line
    draw.rectangle([(0, 480), (1920, 1080)], fill=(50, 150, 200))
    
    # Infinity pool edge
    draw.rectangle([(0, 600), (1920, 650)], fill=(150, 200, 220))
    draw.rectangle([(0, 650), (1920, 900)], fill=(100, 180, 210))
    
    # Pool reflections
    for i in range(10):
        y = 700 + i * 20
        alpha = 150 - i * 10
        draw.rectangle([(0, y), (1920, y+10)], fill=(200, 230, 250, alpha))
    
    # Palm tree silhouettes
    for x in [100, 300, 1600, 1800]:
        # Trunk
        draw.polygon([(x, 900), (x-20, 400), (x+20, 400)], fill=(40, 30, 20))
        # Fronds
        for angle in range(0, 360, 45):
            x2 = x + 150 * (1 if angle < 180 else -1)
            y2 = 350 + 50 * (1 if angle % 90 == 0 else -1)
            draw.ellipse([x-80, 320, x+80, 420], fill=(30, 50, 30))
    
    # Lounge chairs
    for x in [600, 800, 1000, 1200]:
        draw.rectangle([(x, 850), (x+80, 870)], fill=(240, 240, 240))
        draw.rectangle([(x+10, 840), (x+70, 850)], fill=(250, 250, 250))
    
    # Add sun
    draw.ellipse([850, 280, 1070, 500], fill=(255, 220, 100))
    
    img = add_highlights(img)
    img.save('client/public/generated_images/Tropical_infinity_pool_sunset_a1b2c3d4.png')
    print("Created: Tropical_infinity_pool_sunset_a1b2c3d4.png")
    return img

def create_caribbean_beach_resort():
    """Caribbean beach resort with turquoise water"""
    img = create_gradient(1920, 1080, [
        (135, 206, 235),  # Sky blue
        (255, 255, 200),  # Sandy beach
        (0, 150, 150)     # Turquoise water
    ])
    
    draw = ImageDraw.Draw(img)
    
    # Ocean
    draw.rectangle([(0, 400), (1920, 1080)], fill=(0, 180, 180))
    
    # Beach
    draw.polygon([(0, 700), (1920, 600), (1920, 900), (0, 1080)], fill=(255, 235, 200))
    
    # Waves
    for y in range(400, 700, 40):
        wave_color = (150 + y//10, 220 + y//20, 230 + y//15)
        draw.arc([(0, y), (1920, y+60)], 0, 180, fill=wave_color, width=3)
    
    # Beach umbrellas
    for x in [400, 700, 1000, 1300, 1600]:
        # Pole
        draw.rectangle([(x, 650), (x+5, 750)], fill=(139, 69, 19))
        # Umbrella
        draw.polygon([(x-60, 650), (x+2, 600), (x+65, 650)], fill=(255, 100, 100))
        draw.polygon([(x-60, 650), (x+2, 610), (x+65, 650)], fill=(255, 255, 255))
    
    # Cabanas
    for x in [200, 1500]:
        draw.rectangle([(x, 680), (x+120, 750)], fill=(255, 255, 255))
        draw.polygon([(x-10, 680), (x+60, 630), (x+130, 680)], fill=(200, 150, 100))
    
    # Palm trees
    for x in [100, 1800]:
        draw.rectangle([(x, 500), (x+30, 750)], fill=(101, 67, 33))
        draw.ellipse([x-50, 450, x+80, 550], fill=(34, 139, 34))
    
    img = add_highlights(img, (255, 255, 200, 80))
    img.save('client/public/generated_images/Caribbean_beach_resort_turquoise_e5f6g7h8.png')
    print("Created: Caribbean_beach_resort_turquoise_e5f6g7h8.png")
    return img

def create_maldives_overwater_bungalows():
    """Maldives style overwater bungalows"""
    img = create_gradient(1920, 1080, [
        (180, 230, 255),  # Light sky
        (100, 200, 230),  # Mid ocean
        (0, 120, 180)     # Deep ocean
    ])
    
    draw = ImageDraw.Draw(img)
    
    # Crystal clear water
    draw.rectangle([(0, 350), (1920, 1080)], fill=(0, 150, 200))
    
    # Underwater visibility effect
    for i in range(5):
        y = 400 + i * 100
        alpha = 200 - i * 30
        draw.rectangle([(0, y), (1920, y+80)], fill=(0, 180, 210, alpha))
    
    # Wooden walkway
    draw.rectangle([(800, 500), (1120, 1080)], fill=(139, 90, 43))
    # Planks
    for y in range(500, 1080, 20):
        draw.line([(800, y), (1120, y)], fill=(101, 67, 33), width=2)
    
    # Overwater bungalows
    for y in [400, 600, 800]:
        x = 500 if y % 400 == 0 else 1250
        # Platform
        draw.rectangle([(x, y), (x+200, y+150)], fill=(160, 110, 60))
        # Bungalow
        draw.rectangle([(x+20, y+20), (x+180, y+120)], fill=(210, 180, 140))
        # Roof
        draw.polygon([(x+10, y+20), (x+100, y-20), (x+190, y+20)], fill=(139, 69, 19))
        # Windows
        draw.rectangle([(x+40, y+40), (x+80, y+80)], fill=(180, 220, 240))
        draw.rectangle([(x+120, y+40), (x+160, y+80)], fill=(180, 220, 240))
    
    # Distant islands
    draw.ellipse([100, 340, 300, 360], fill=(34, 139, 34))
    draw.ellipse([1500, 335, 1800, 355], fill=(34, 139, 34))
    
    img = add_highlights(img, (255, 250, 200, 60))
    img.save('client/public/generated_images/Maldives_overwater_bungalows_i9j0k1l2.png')
    print("Created: Maldives_overwater_bungalows_i9j0k1l2.png")
    return img

def create_hawaii_beach_sunrise():
    """Hawaiian beach at sunrise with Diamond Head view"""
    img = create_gradient(1920, 1080, [
        (255, 150, 100),  # Sunrise orange
        (255, 200, 150),  # Light peach
        (100, 150, 200)   # Ocean blue
    ])
    
    draw = ImageDraw.Draw(img)
    
    # Ocean
    draw.rectangle([(0, 450), (1920, 1080)], fill=(50, 120, 180))
    
    # Beach
    draw.polygon([(0, 750), (1920, 700), (1920, 1080), (0, 1080)], fill=(240, 220, 180))
    
    # Diamond Head silhouette
    draw.polygon([(1400, 450), (1500, 350), (1600, 380), (1750, 450)], fill=(60, 60, 80))
    
    # Rising sun
    draw.ellipse([900, 380, 1020, 500], fill=(255, 200, 50))
    
    # Sun rays
    for angle in range(0, 360, 15):
        x1, y1 = 960, 440
        import math
        x2 = x1 + 200 * math.cos(math.radians(angle))
        y2 = y1 + 200 * math.sin(math.radians(angle))
        draw.line([(x1, y1), (x2, y2)], fill=(255, 220, 100, 100), width=2)
    
    # Surfboards on beach
    for x in [300, 350, 400]:
        draw.ellipse([x, 800, x+15, 880], fill=(random.choice([(255, 100, 100), (100, 200, 255), (255, 255, 100)])))
    
    # Beach chairs and umbrella
    draw.rectangle([(600, 820), (680, 840)], fill=(100, 150, 200))
    draw.rectangle([(700, 820), (780, 840)], fill=(100, 150, 200))
    draw.polygon([(640, 780), (690, 750), (740, 780)], fill=(255, 100, 100))
    draw.rectangle([(688, 780), (692, 820)], fill=(139, 90, 43))
    
    # Palm trees
    for x in [100, 200, 1700]:
        draw.rectangle([(x, 600), (x+25, 850)], fill=(101, 67, 33))
        for i in range(5):
            angle = i * 72
            x2 = x + 60 * math.cos(math.radians(angle))
            y2 = 600 + 40 * math.sin(math.radians(angle))
            draw.ellipse([x-30, 570, x+55, 630], fill=(34, 100, 34))
    
    img = add_highlights(img, (255, 240, 200, 70))
    img.save('client/public/generated_images/Hawaii_beach_sunrise_diamondhead_m3n4o5p6.png')
    print("Created: Hawaii_beach_sunrise_diamondhead_m3n4o5p6.png")
    return img

def create_mediterranean_coast():
    """Mediterranean coastal resort with yacht marina"""
    img = create_gradient(1920, 1080, [
        (200, 230, 255),  # Light blue sky
        (150, 200, 230),  # Horizon
        (50, 100, 150)    # Deep blue sea
    ])
    
    draw = ImageDraw.Draw(img)
    
    # Sea
    draw.rectangle([(0, 400), (1920, 1080)], fill=(30, 100, 160))
    
    # Coastal cliffs
    draw.polygon([(0, 300), (200, 250), (400, 350), (0, 600)], fill=(200, 180, 150))
    draw.polygon([(1520, 300), (1720, 280), (1920, 350), (1920, 600), (1520, 550)], fill=(200, 180, 150))
    
    # Marina/Harbor
    draw.rectangle([(600, 500), (1320, 520)], fill=(180, 150, 120))
    
    # Yachts
    for x in [700, 850, 1000, 1150]:
        # Hull
        draw.polygon([(x, 480), (x+80, 480), (x+70, 500), (x+10, 500)], fill=(255, 255, 255))
        # Mast
        draw.rectangle([(x+35, 420), (x+38, 480)], fill=(200, 200, 200))
        # Sail
        draw.polygon([(x+38, 430), (x+75, 460), (x+38, 470)], fill=(250, 250, 250))
    
    # Resort buildings
    for x in [100, 250, 1600, 1750]:
        # Building
        draw.rectangle([(x, 200), (x+100, 350)], fill=(255, 245, 220))
        # Roof
        draw.polygon([(x-10, 200), (x+50, 160), (x+110, 200)], fill=(200, 100, 50))
        # Windows
        for y in [220, 260, 300]:
            draw.rectangle([(x+20, y), (x+40, y+20)], fill=(150, 200, 220))
            draw.rectangle([(x+60, y), (x+80, y+20)], fill=(150, 200, 220))
    
    # Beach umbrellas and loungers along the coast
    for x in range(500, 1400, 150):
        draw.ellipse([x, 550, x+60, 570], fill=(255, 255, 255))
        draw.polygon([(x+10, 540), (x+30, 520), (x+50, 540)], fill=(0, 150, 200))
    
    img = add_highlights(img, (255, 255, 240, 50))
    img.save('client/public/generated_images/Mediterranean_coast_yacht_marina_q7r8s9t0.png')
    print("Created: Mediterranean_coast_yacht_marina_q7r8s9t0.png")
    return img

# Generate all images
print("Generating tropical paradise images...")
create_tropical_pool_sunset()
create_caribbean_beach_resort()
create_maldives_overwater_bungalows()
create_hawaii_beach_sunrise()
create_mediterranean_coast()
print("\n✅ All 5 tropical images generated successfully!")
print("\nImages created:")
print("1. Tropical_infinity_pool_sunset_a1b2c3d4.png - Luxury infinity pool at sunset")
print("2. Caribbean_beach_resort_turquoise_e5f6g7h8.png - Caribbean beach with turquoise water")
print("3. Maldives_overwater_bungalows_i9j0k1l2.png - Overwater bungalows in crystal clear water")
print("4. Hawaii_beach_sunrise_diamondhead_m3n4o5p6.png - Hawaiian beach at sunrise")
print("5. Mediterranean_coast_yacht_marina_q7r8s9t0.png - Mediterranean coastal resort")