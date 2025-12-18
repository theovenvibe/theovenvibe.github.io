#!/usr/bin/env python3
"""
Create placeholder 600x400 (3:2) images for missing menu items and add-ons
"""
import subprocess
import os

# Items that need placeholder images
PLACEHOLDERS = {
    "product_images": {
        "751732822": "Mushroom Supreme Pizza",  # Already exists but checking
        "752623129": "Tangy Green Chutney Sandwich",
        "745802387": "Cheesy Garlic Bread Toast",
    },
    "add_on_images": {
        "747584635": "Cheese Dip",
        "747584636": "Cheese",
        "747584637": "Cheesy Garlic Bread Toast (3 pcs)",
        "747584638": "Garlic Butter",
        "747584739": "Sweet Corn",
        "747584740": "Paneer Tikka",
        "747584741": "Oregano",
        "747584970": "Peri Peri Dip",
    }
}

def create_placeholder(code, name, dest_dir):
    """Create a 600x400 placeholder image with text"""
    base_path = os.path.join(dest_dir, code)
    
    # Color palette - bright, food-friendly colors
    colors = {
        "Cheese": "FFCC00",
        "Dip": "8B4513",
        "Corn": "FFD700",
        "Garlic": "F5DEB3",
        "Oregano": "228B22",
        "Paneer": "F0E68C",
        "Sandwich": "D2691E",
        "Pizza": "FF6347",
        "Bread": "DEB887",
    }
    
    # Pick color based on item name
    color = "CCCCCC"  # Default gray
    for key, col in colors.items():
        if key.lower() in name.lower():
            color = col
            break
    
    # Create AVIF
    cmd = f"""convert -size 600x400 \
    xc:{color} \
    -fill '#000000' \
    -pointsize 24 \
    -gravity center \
    -annotate +0+0 '{name}' \
    -format avif \
    '{base_path}.avif'"""
    
    subprocess.run(cmd, shell=True, check=False)
    
    # Create WebP
    cmd = f"""convert -size 600x400 \
    xc:{color} \
    -fill '#000000' \
    -pointsize 24 \
    -gravity center \
    -annotate +0+0 '{name}' \
    -format webp \
    '{base_path}.webp'"""
    
    subprocess.run(cmd, shell=True, check=False)
    
    # Create JXL
    cmd = f"""convert -size 600x400 \
    xc:{color} \
    -fill '#000000' \
    -pointsize 24 \
    -gravity center \
    -annotate +0+0 '{name}' \
    '{base_path}.jxl'"""
    
    subprocess.run(cmd, shell=True, check=False)
    
    print(f"✅ Created placeholder for {name} ({code})")

def main():
    base_dir = "/home/milanbeherazyx/theovenvibe.github.io/static/images"
    
    # Create product placeholders
    print("📁 Creating product image placeholders...\n")
    product_dir = os.path.join(base_dir, "product_images")
    os.makedirs(product_dir, exist_ok=True)
    
    for code, name in PLACEHOLDERS["product_images"].items():
        create_placeholder(code, name, product_dir)
    
    # Create add-on placeholders
    print("\n📁 Creating add-on image placeholders...\n")
    addon_dir = os.path.join(base_dir, "add_on_images")
    os.makedirs(addon_dir, exist_ok=True)
    
    for code, name in PLACEHOLDERS["add_on_images"].items():
        create_placeholder(code, name, addon_dir)
    
    print("\n✅ All placeholder images created!")

if __name__ == "__main__":
    main()
