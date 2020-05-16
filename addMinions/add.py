import os
import json

firstFreeId = int(input('First free ID: '))
files = os.listdir()
newMinions = []

for file in files:
    if file not in ['desktop.ini', 'add.py']:
        newMinions.append({
            "id": firstFreeId,
            "url": file,
            "tags": [],
            "comments": []
        })
        firstFreeId += 1

with open("newMinions.json", mode='w') as f:
    f.write(json.dumps(newMinions))
