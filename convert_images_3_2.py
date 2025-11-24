#!/usr/bin/env python3
"""
Convert menu zomato images to proper 3:2 format AVIF/WebP/JXL without white borders
Crops to 3:2 aspect ratio (width:height = 1.5:1)
"""
import os
import subprocess
from pathlib import Path

SOURCE_DIR = "./static/images/menu zomato"
PRODUCT_DIR = "./static/images/product_images"
COMBO_DIR = "./static/images/combo_images"

IMAGE_MAPPING = {
    "Fried Rice Bowls": {
        "Veg Fried Rice": "751393909",
        "Garlic Fried Rice": "751393910",
        "Schezwan Fried Rice": "751393911",
        "Paneer Fried Rice": "751393912",
        "Mixed Tresure Fried Rice Zomato": "751397746",
    },
    "Pizza": {
        "Zesty Onion Feast Pizza [Regular, 7 inches]": "745802369",
        "Ultimate Cheese Delight Pizza [Regular, 7 inches]": "745802358",
        "Golden Corn Classic Pizza [Regular, 7 inches]": "745802385",
        "Crunchy Capsicum Pizza [Regular, 7 inches]": "745802381",
        "Herb Paneer Delight Pizza [Regular, 7 inches]": "745802364",
        "Paneer Makhni Royale Pizza [Regular, 7 inches]": "752649876",
        "Vegie Onion Capsicum Pizza [Regular, 7 inches]": "745802365",
    },
    "Pasta": {
        "Creamy Alfredo Pasta (Fusilli)": "751793935",
        "Classic Red Sauce Pasta": "752770847",
    },
    "Grilled Sandwiches": {
        "Fiery Cheese Chilli Sandwich": "752623130",
        "Paneer Tikka Grilled Sandwich": "752623131",
    },
    "Sides & Snacks": {
        "Classic French Fries": "745802374",
        "Spicy Peri French Fries": "745802351",
        "Tangy Masala Corn": "745802356",
        "Cheesy Corn Mix": "745802367",
        "Crunchy Peri Makhana [25 g]": "745802352",
    },
    "Combo": {
        "Veg Fried Rice Meal Box Combo": "752694444",
        "Schezwan Fried Rice Meal Box Combo": "752694468",
        "Pasta Treat Combo": "745802384",
        "Sandwich Meal Box Combo": "745802354",
        "Fiesta Pizza Combo": "745802348",
    },
}


def convert_to_formats(source_file, dest_base_path, dest_dir):
    """Convert image to AVIF, WebP, JXL in 3:2 ratio without white borders"""
    try:
        # Use ImageMagick to crop to 3:2 and convert
        # gravity center crops from center, -extent adds canvas (we don't want that)
        # Instead, we'll resize to fit 3:2 ratio

        # First, get image dimensions
        identify_cmd = f"identify -format '%wx%h' '{source_file}'"
        result = subprocess.run(identify_cmd, shell=True,
                                capture_output=True, text=True)
        if result.returncode != 0:
            print(f"  ❌ Could not identify {source_file}")
            return False

        dimensions = result.stdout.strip()
        print(f"  Original: {dimensions}")

        # Convert to AVIF (3:2 ratio, no padding)
        avif_cmd = f"""convert '{source_file}' \
            -auto-orient \
            -resize 600x400 \
            -background none \
            -gravity center \
            -extent 600x400 \
            '{dest_base_path}.avif'"""

        subprocess.run(avif_cmd, shell=True, check=False)

        # Convert to WebP
        webp_cmd = f"""convert '{source_file}' \
            -auto-orient \
            -resize 600x400 \
            -background none \
            -gravity center \
            -extent 600x400 \
            '{dest_base_path}.webp'"""

        subprocess.run(webp_cmd, shell=True, check=False)

        # Convert to JXL
        jxl_cmd = f"""convert '{source_file}' \
            -auto-orient \
            -resize 600x400 \
            -background none \
            -gravity center \
            -extent 600x400 \
            '{dest_base_path}.jxl'"""

        subprocess.run(jxl_cmd, shell=True, check=False)

        print(f"  ✅ Converted to AVIF/WebP/JXL (600x400 - 3:2 ratio)")
        return True

    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False


def process_images():
    """Process all images from menu zomato folder"""

    for category, items in IMAGE_MAPPING.items():
        source_category_dir = os.path.join(SOURCE_DIR, category)

        if not os.path.exists(source_category_dir):
            print(f"⚠️  {category} dir not found")
            continue

        dest_dir = COMBO_DIR if category == "Combo" else PRODUCT_DIR

        print(f"\n📁 Processing {category}...")

        for display_name, catalogue_id in items.items():
            # Find the image file
            found = False
            for file in os.listdir(source_category_dir):
                if display_name in file or file.replace(" (Penne)", "").replace(" (Fusilli)", "") == display_name:
                    source_file = os.path.join(source_category_dir, file)
                    dest_base = os.path.join(dest_dir, catalogue_id)

                    print(f"  🖼️  {display_name}")
                    convert_to_formats(source_file, dest_base, dest_dir)
                    found = True
                    break

            if not found:
                print(f"  ⚠️  Image not found: {display_name}")


if __name__ == "__main__":
    print("🔄 Converting images to 3:2 ratio without white borders...\n")
    process_images()
    print("\n✅ All images converted!")
