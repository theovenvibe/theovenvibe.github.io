#!/usr/bin/env python3
"""
Convert images from menu zomato to 3:2 format AVIF
Places them in product_images and combo_images directories with catalogue_id names
"""
import os
import subprocess
from pathlib import Path

# Mapping of display names to catalogue_ids from Excel data
IMAGE_MAPPING = {
    # Fried Rice Bowls
    "Fried Rice Bowls": {
        "Veg Fried Rice": "751393909",
        "Garlic Fried Rice": "751393910",
        "Schezwan Fried Rice": "751393911",
        "Paneer Fried Rice": "751393912",
        "Mixed Treasure Fried Rice": "751397746",
    },
    # Pizza
    "Pizza": {
        "Zesty Onion Feast Pizza [Regular, 7 inches]": "745802369",
        "Ultimate Cheese Delight Pizza [Regular, 7 inches]": "745802358",
        "Golden Corn Classic Pizza [Regular, 7 inches]": "745802385",
        "Crunchy Capsicum Pizza [Regular, 7 inches]": "745802381",
        "Herb Paneer Delight Pizza [Regular, 7 inches]": "745802364",
        "Paneer Makhni Royale Pizza [Regular, 7 inches]": "752649876",
        "Mushroom Supreme Pizza [Regular, 7 inches]": "751732822",
        "Vegie Onion Capsicum Pizza [Regular, 7 inches]": "745802365",
    },
    # Pasta
    "Pasta": {
        "Creamy Alfredo Pasta (Fusilli)": "751793935",
        "Classic Red Sauce Pasta (Penne)": "752770847",
        "Classic Red Sauce Pasta": "752770847",
    },
    # Grilled Sandwiches
    "Grilled Sandwiches": {
        "Tangy Green Chutney Sandwich": "752623129",
        "Fiery Cheese Chilli Sandwich": "752623130",
        "Paneer Tikka Grilled Sandwich": "752623131",
    },
    # Sides & Snacks
    "Sides & Snacks": {
        "Classic French Fries": "745802374",
        "Spicy Peri French Fries": "745802351",
        "Cheesy Garlic Bread Toast": "745802387",
        "Tangy Masala Corn": "745802356",
        "Cheesy Corn Mix": "745802367",
        "Crunchy Peri Makhana [25 g]": "745802352",
    },
    # Combos
    "Combo": {
        "Veg Fried Rice Meal Box Combo": "752694444",
        "Schezwan Fried Rice Meal Box Combo": "752694468",
        "Pasta Treat Combo": "745802384",
        "Sandwich Meal Box Combo": "745802354",
        "Fiesta Pizza Combo": "745802348",
    },
}

SOURCE_DIR = "/home/milanbeherazyx/theovenvibe.github.io/static/images/menu zomato"
PRODUCT_DIR = "/home/milanbeherazyx/theovenvibe.github.io/static/images/product_images"
COMBO_DIR = "/home/milanbeherazyx/theovenvibe.github.io/static/images/combo_images"

def convert_to_3_2_avif(source_file, dest_file, catalogue_id):
    """Convert image to 3:2 aspect ratio AVIF format"""
    try:
        # Use ImageMagick to convert and resize to 3:2 aspect ratio
        # We'll make it 600x400 (3:2 ratio)
        cmd = [
            'convert',
            source_file,
            '-background', 'white',
            '-gravity', 'center',
            '-resize', '600x400',
            '-extent', '600x400',
            '-quality', '85',
            dest_file
        ]
        
        subprocess.run(cmd, check=True, capture_output=True)
        print(f"✅ Converted {catalogue_id}: {os.path.basename(source_file)} → {os.path.basename(dest_file)}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error converting {source_file}: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error for {catalogue_id}: {e}")
        return False

def process_images():
    """Process all images from menu zomato folder"""
    converted_count = 0
    failed_count = 0
    
    for category, items in IMAGE_MAPPING.items():
        source_category_dir = os.path.join(SOURCE_DIR, category)
        
        if not os.path.exists(source_category_dir):
            print(f"⚠️  Category dir not found: {source_category_dir}")
            continue
        
        dest_dir = COMBO_DIR if category == "Combo" else PRODUCT_DIR
        
        for display_name, catalogue_id in items.items():
            # Try to find the image file in this category
            found = False
            for file in os.listdir(source_category_dir):
                file_path = os.path.join(source_category_dir, file)
                if not os.path.isfile(file_path):
                    continue
                    
                # Check if this is the right file
                if display_name in file or file.replace(" (Penne)", "").replace(" (Fusilli)", "") == display_name:
                    # Convert to AVIF with 3:2 aspect ratio
                    dest_file = os.path.join(dest_dir, f"{catalogue_id}.avif")
                    
                    if convert_to_3_2_avif(file_path, dest_file, catalogue_id):
                        converted_count += 1
                    else:
                        failed_count += 1
                    
                    found = True
                    break
            
            if not found:
                print(f"⚠️  Image not found for: {display_name} ({catalogue_id})")

    print(f"\n✅ Conversion complete! Converted: {converted_count}, Failed: {failed_count}")

if __name__ == "__main__":
    print("🔄 Converting images to 3:2 format AVIF...\n")
    process_images()
