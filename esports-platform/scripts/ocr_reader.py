import sys
import json
import re
from pathlib import Path

try:
    from PIL import Image
    import pytesseract
except ImportError as e:
    print(json.dumps({"error": f"Missing dependency: {e}"}))
    sys.exit(1)

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def extract_scores(image_path: str) -> dict:
    if not Path(image_path).exists():
        return {"error": "Image file not found", "team1_score": None, "team2_score": None, "confidence": 0}

    def ocr_variants(img: Image.Image):
        configs = ['--psm 6 --oem 3', '--psm 7 --oem 3']
        results = set()
        for config in configs:
            try:
                raw_text = pytesseract.image_to_string(img, config=config)
            except Exception:
                continue
            for line in raw_text.splitlines():
                line = line.strip()
                match = re.search(r'(\d{1,2})\s*[-:]\s*(\d{1,2})', line)
                if match:
                    try:
                        t1, t2 = int(match.group(1)), int(match.group(2))
                        if 0 <= t1 <= 99 and 0 <= t2 <= 99:
                            results.add((t1, t2))
                    except ValueError:
                        continue
        return list(results)

    try:
        img = Image.open(image_path)
    except Exception as e:
        return {"error": f"Image open failed: {str(e)}", "team1_score": None, "team2_score": None, "confidence": 0}

    scores = ocr_variants(img)

    if not scores:
        for config in ['--psm 6 --oem 3', '--psm 7 --oem 3']:
            try:
                raw_text = pytesseract.image_to_string(img, config=config)
            except Exception:
                continue
            numbers = [int(n) for n in re.findall(r'\b\d{1,2}\b', raw_text) if 0 <= int(n) <= 30]
            if len(numbers) >= 2:
                scores.append((numbers[0], numbers[1]))
                break

    if scores:
        best = max(scores, key=lambda x: (x[0] + x[1], abs(x[0] - x[1])))
        return {
            "team1_score": best[0],
            "team2_score": best[1],
            "confidence": min(100, max(0, 100 - (len(scores) - 1) * 15)),
            "error": None
        }

    return {"error": "No score pattern detected", "team1_score": None, "team2_score": None, "confidence": 0}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python ocr_reader.py <image_path>"}))
        sys.exit(1)

    result = extract_scores(sys.argv[1])
    print(json.dumps(result))
