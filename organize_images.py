#!/usr/bin/env python3
"""
Organize images from menu zomato folder to product_images and combo_images
Maps them by catalogue_id for proper display
"""
import os
import shutil
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

def copy_images():
    """Copy and rename images from menu zomato to product/combo directories"""
    
    for category, items in IMAGE_MAPPING.items():
        source_category_dir = os.path.join(SOURCE_DIR, category)
        
        if not os.path.exists(source_category_dir):
            print(f"⚠️  Category dir not found: {source_category_dir}")
            continue
        
        dest_dir = COMBO_DIR if category == "Combo" else PRODUCT_DIR
        
        for display_name, catalogue_id in items.items():
            # Try to find the image file
            for file in os.listdir(source_category_dir):
                if display_name in file or file.replace(" (Penne)", "").replace(" (Fusilli)", "") == display_name:
                    source_file = os.path.join(source_category_dir, file)
                    
                    # Get file extension
                    ext = os.path.splitext(file)[1]
                    dest_file = os.path.join(dest_dir, f"{catalogue_id}{ext}")
                    
                    try:
                        shutil.copy2(source_file, dest_file)
                        print(f"✅ Copied: {file} → {catalogue_id}{ext}")
                    except Exception as e:
                        print(f"❌ Error copying {file}: {e}")
                    break

if __name__ == "__main__":
    copy_images()
    print("\n✅ Image organization complete!")
