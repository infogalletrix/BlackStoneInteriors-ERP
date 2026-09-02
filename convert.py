import sys
from PIL import Image

try:
    img = Image.open('client/public/logo.png')
    img.save('client/public/logo.ico', format='ICO', sizes=[(256, 256)])
    print("Success")
except Exception as e:
    print(f"Error: {e}")
