import base64
import json
import os
import sys


def main():
    json_path = sys.argv[1] if len(sys.argv) > 1 else "a.json"
    out_dir = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(os.path.abspath(json_path))

    with open(json_path, "r", encoding="utf-8") as f:
        payload = json.load(f)

    items = payload["data"]
    os.makedirs(out_dir, exist_ok=True)

    base = os.path.splitext(os.path.basename(json_path))[0]
    for i, item in enumerate(items):
        b64 = item["b64_json"]
        out_path = os.path.join(out_dir, f"{base}_{i}.png")
        with open(out_path, "wb") as f:
            f.write(base64.b64decode(b64))
        print(f"saved: {out_path}")


if __name__ == "__main__":
    main()
