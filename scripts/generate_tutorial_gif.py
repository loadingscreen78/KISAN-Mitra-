import json
import time
import os
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

os.makedirs('docs/assets/screenshots', exist_ok=True)

steps = [
    {
        'badge': '1. Quick Access · No Passwords',
        'url': 'http://localhost:5000/',
        'setup': None
    },
    {
        'badge': '2. Smart Dashboard & Weather',
        'url': 'http://localhost:5000/home',
        'setup': None
    },
    {
        'badge': '3. AI Plant Disease Scanner',
        'url': 'http://localhost:5000/diagnose',
        'setup': None
    },
    {
        'badge': '4. 98% Accurate AI Diagnosis & Cure',
        'url': 'http://localhost:5000/diagnose/results',
        'setup': '''() => {
            const diag = {
                disease: "Tomato with Late Blight",
                confidence: 98.4,
                affectedArea: "Leaves & stems",
                stage: "Needs immediate attention",
                severity: "high",
                detectedDate: "Today",
                isHealthy: false,
                status: "diagnosed"
            };
            localStorage.setItem("diagnosis_results", JSON.stringify(diag));
            localStorage.setItem("plant_image", "/src/assets/ai-diagnosis.jpg");
        }'''
    },
    {
        'badge': '5. Live Spray & Weather Radar',
        'url': 'http://localhost:5000/weather',
        'setup': None
    },
    {
        'badge': '6. Live Mandi Market Rates',
        'url': 'http://localhost:5000/market-prices',
        'setup': None
    }
]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 390, 'height': 820}, device_scale_factor=1.5)
    page = context.new_page()

    frames = []
    durations = []

    for i, step in enumerate(steps):
        if step['setup']:
            page.goto('http://localhost:5000/home')
            page.evaluate(step['setup'])
        page.goto(step['url'], wait_until='networkidle')
        time.sleep(1.5)

        raw_shot = f'docs/assets/screenshots/frame_{i}.png'
        page.screenshot(path=raw_shot)

        im = Image.open(raw_shot).convert('RGBA')
        
        target_w, target_h = 380, 800
        im_resized = im.resize((target_w, target_h), Image.Resampling.LANCZOS)
        
        # Overlay a clean modern pill badge
        overlay = Image.new('RGBA', im_resized.size, (255, 255, 255, 0))
        draw = ImageDraw.Draw(overlay)
        
        badge_y = 18
        badge_h = 34
        badge_w = 300
        badge_x = (target_w - badge_w) // 2
        
        # Shadow
        draw.rounded_rectangle(
            [badge_x + 1, badge_y + 2, badge_x + badge_w + 1, badge_y + badge_h + 2],
            radius=17,
            fill=(0, 0, 0, 50)
        )
        
        # Pill
        draw.rounded_rectangle(
            [badge_x, badge_y, badge_x + badge_w, badge_y + badge_h],
            radius=17,
            fill=(6, 95, 70, 240),  # emerald-800
            outline=(167, 243, 208, 255),  # emerald-200
            width=2
        )
        
        draw.text((badge_x + 18, badge_y + 9), step['badge'], fill=(255, 255, 255, 255))
        
        composite = Image.alpha_composite(im_resized, overlay)
        frame_rgb = composite.convert('RGB')
        
        # Quantize for clean GIF palette
        frame_p = frame_rgb.quantize(colors=128, method=Image.Resampling.LANCZOS)
        frames.append(frame_p)
        durations.append(1700)

    # Save animated GIF
    frames[0].save(
        'docs/assets/tutorial.gif',
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0,
        optimize=True
    )
    print(f'Successfully generated docs/assets/tutorial.gif with {len(frames)} frames.')
    browser.close()
