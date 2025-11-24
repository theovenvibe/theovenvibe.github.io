#!/usr/bin/env python3
"""
Generate WebP and JXL versions from AVIF images
"""
import os
import subprocess
from pathlib import Path

PRODUCT_DIR = "./static/images/product_images"
COMBO_DIR = "./static/images/combo_images"


def convert_images(directory):
    """Convert AVIF images to WebP and JXL"""
    webp_count = 0
    jxl_count = 0

    for file in os.listdir(directory):
        if file.endswith('.avif'):
            avif_path = os.path.join(directory, file)
            base_name = file.replace('.avif', '')
            webp_path = os.path.join(directory, f"{base_name}.webp")
            jxl_path = os.path.join(directory, f"{base_name}.jxl")

            # Create WebP
            if not os.path.exists(webp_path):
                try:
                    subprocess.run(
                        ['convert', avif_path, '-quality', '85', webp_path],
                        check=True,
                        capture_output=True
                    )
                    webp_count += 1
                    print(f"✅ WebP: {base_name}.webp")
                except Exception as e:
                    print(f"❌ WebP error {base_name}: {e}")

            # Create JXL
            if not os.path.exists(jxl_path):
                try:
                    subprocess.run(
                        ['convert', avif_path, '-quality', '85', jxl_path],
                        check=True,
                        capture_output=True
                    )
                    jxl_count += 1
                    print(f"✅ JXL: {base_name}.jxl")
                except Exception as e:
                    print(f"⚠️  JXL error {base_name} (optional): {e}")

    return webp_count, jxl_count


if __name__ == "__main__":
    print("🔄 Creating WebP and JXL versions...\n")

    print("📦 Product Images:")
    w1, j1 = convert_images(PRODUCT_DIR)

    print("\n🎁 Combo Images:")
    w2, j2 = convert_images(COMBO_DIR)

    print(f"\n✅ Complete! WebP: {w1+w2}, JXL: {j1+j2}")
