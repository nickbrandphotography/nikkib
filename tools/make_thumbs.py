"""Re-make the small square thumbnails from the flat scarf photos.
Run after replacing any img/p/<name>-scarf.jpg:   python tools/make_thumbs.py"""
import os, glob
from PIL import Image
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for f in glob.glob(os.path.join(root, "img", "p", "*-scarf.jpg")):
    im = Image.open(f).convert("RGB"); im.thumbnail((360, 360))
    im.save(f.replace("-scarf.jpg", "-thumb.jpg"), quality=84, optimize=True); print("thumb", os.path.basename(f))
