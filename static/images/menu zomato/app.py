import os
from PIL import Image
from tqdm import tqdm
import pillow_avif  # noqa: F401 - required for AVIF plugin


TARGET_WIDTH = 1800
TARGET_HEIGHT = 1200
QUALITY = 50  # AVIF quality (lower = smaller file)


def convert_to_avif(root_path):
    supported_ext = (".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff")

    all_files = []
    for root, _, files in os.walk(root_path):
        for file in files:
            if file.lower().endswith(supported_ext):
                all_files.append(os.path.join(root, file))

    print(f"Found {len(all_files)} images to process\n")

    for img_path in tqdm(all_files, desc="Converting to AVIF"):
        output_path = os.path.splitext(img_path)[0] + ".avif"

        if os.path.exists(output_path):
            print(f"Skipping (already exists): {output_path}")
            continue

        try:
            with Image.open(img_path) as img:
                img = img.convert("RGB")
                img = img.resize((TARGET_WIDTH, TARGET_HEIGHT), Image.LANCZOS)
                img.save(output_path, format="AVIF", quality=QUALITY)

            # Delete only if conversion succeeded
            os.remove(img_path)

        except Exception as e:
            print(f"❌ Error converting {img_path} -> {e}")
            if os.path.exists(output_path):
                os.remove(output_path)  # remove corrupted output


if __name__ == "__main__":
    folder = os.getcwd()
    print(f"🔥 Starting conversion in: {folder}")
    convert_to_avif(folder)
    print("\n🎯 Done! All AVIF created successfully.")
