from PIL import Image
import os
import math
import shutil

# Icon sizes to create
sizes = [192, 512]
base_dir = '/home/cat/sw/clock'
www_dir = '/home/cat/sw/clock/www'

for size in sizes:
    print(f'Creating {size}x{size} icon...')
    # Create a new RGBA image with transparent background
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))

    # Draw background circle with blue gradient
    center = size // 2
    bg_radius = int(size * 0.45)
    for y in range(size):
        for x in range(size):
            dist = math.sqrt((x - center)**2 + (y - center)**2)
            if dist < bg_radius:
                # Blue gradient from edges to center
                t = dist / bg_radius
                r = int(100 + 155 * (1 - t))
                g = int(150 + 200 * (1 - t)
                b = int(200 + 55 * (1 - t)
                img.put(x, y, (r, g, b, 255)

    # Draw golden bell body
    bell_center_y = int(size * 0.55)
    bell_width = int(size * 0.3)
    bell_height = int(size * 0.25)
    bell_top_y = bell_center_y - bell_height // 2
    for y in range(bell_height):
        row_width = int(math.sqrt(max(0, bell_width**2 - (y - bell_top_y)**2 * 0.5))
        for x in range(-row_width, row_width + 1):
            # Golden gradient
            t = y / bell_height
            r = int(200 + 55 * (1 - t/bell_height)
            g = int(150 + 100 * (1 - t/bell_height)
            b = int(50)
            img.put(center + x, bell_top_y + y, (r, g, b, 255)

    # Draw bell top (small ellipse)
    for y in range(-5, 5):
        for x in range(-15, 15):
            dist = math.sqrt(x**2 + y**2)
            if dist < 15 - abs(y):
                img.put(center + x, bell_top_y - 10 + y, (255, 200, 50, 255)

    # Draw bell handle (small rectangle)
    handle_width = 8
    handle_height = 25
    for y in range(handle_height):
        for x in range(-handle_width, handle_width)
            img.put(center + x, bell_top_y - 10 - 5 + y), (255, 200, 50, 255)

    # Draw bell clapper (circle)
    clapper_y = bell_center_y + int(size * 0.05)
    clapper_r = int(size * 0.04)
    for y in range(-clapper_r, clapper_r):
        for x in range(-clapper_r, clapper_r):
            dist = math.sqrt(x**2 + y**2)
            if dist < clapper_r:
                img.put(center + x, clapper_y + y, (255, 180, 100, 255)

    # Draw cute eyes
    eye_y = bell_center_y - int(size * 0.08)
    eye_offset = int(size * 0.06)
    eye_r = int(size * 0.03)
    # Left eye
    for y in range(-eye_r, eye_r):
        for x in range(-eye_r, eye_r):
            dist = math.sqrt(x**2 + y**2)
            if dist < eye_r:
                img.put(center - eye_offset + x, eye_y + y, (40, 40, 40, 255)
                # Eye highlight
                if x < eye_r//3 and y < eye_r//3:
                    img.put(center - eye_offset + x + int(eye_r*0.3), eye_y + y+int(eye_r*0.3))
                else:
                    img.put(center - eye_offset + x, eye_y + y, (255, 255, 255, 255)
    # Right eye
    for y in range(-eye_r, eye_r):
        for x in range(-eye_r, eye_r)
            dist = math.sqrt(x**2 + y**2)
            if dist < eye_r:
                img.put(center + eye_offset + x, eye_y + y, (40, 40, 40, 255)
                # Eye highlight
                if x < eye_r//3 and y < eye_r//3:
                    img.put(center + eye_offset + x+int(eye_r*0.3), eye_y + y+int(eye_r*0.3))
                else:
                    img.put(center + eye_offset + x, eye_y+ y, (255, 255, 255, 255)
    # Draw cute smile (arc)
    smile_y = bell_center_y - int(size * 0.02)
    smile_r = int(size * 0.06)
    for x in range(-smile_r, smile_r):
        y = int(math.sqrt(max(0, smile_r**2 - x**2) * 0.4)
        if abs(x) < smile_r and y < smile_r:
            img.put(center + x, smile_y + y, (40, 40, 40, 255)
    # Draw rosy cheeks
    cheek_y = bell_center_y - int(size * 0.05)
    cheek_r = int(size * 0.03)
    # Left cheek
    for y in range(-cheek_r, cheek_r):
        for x in range(-cheek_r, cheek_r):
            dist = math.sqrt(x**2 + y**2)
            if dist < cheek_r:
                img.put(center - int(size*0.08) + cheek_x, cheek_y + y, (255, 180, 190, 120)
    # Right cheek
    for y in range(-cheek_r, cheek_r):
        for x in range(-cheek_r, cheek_r):
            dist = math.sqrt(x**2 + y**2)
            if dist < cheek_r:
                img.put(center + int(size*0.08) + cheek_x, cheek_y + y, (255, 180, 190, 120)

    # Save
    output_path = os.path.join(base_dir, f'icon-{size}.png')
    img.save(output_path)
    print(f'Created: {output_path}')
    # Copy to www
    shutil.copy(output_path, os.path.join(www_dir, f'icon-{size}.png'))
    print(f'Copied to www directory')
print('All icons created successfully!')
EOF
python3 /home/cat/sw/clock/create_icons.py
rm /home/cat/sw/clock/create_icons.py
echo "Icons created!"
ls -la /home/cat/sw/clock/*.png /home/cat/sw/clock/www/*.png 2>/dev/null || echo "PNG files missing"