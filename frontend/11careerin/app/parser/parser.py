import re
from collections import defaultdict
from pdf2image import convert_from_path
import pytesseract

# ================= CONFIG =================

POPPLER_PATH = r"C:\poppler-25.12.0\Library\bin"
TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

SECTION_MAP = {
    "profile": ["profile", "summary", "about", "objective"],
    "education": ["education", "academic", "academics"],
    "experience": ["experience", "work experience", "professional experience", "internship", "employment"],
    "projects": ["projects", "personal projects", "academic projects"],
    "skills": ["skills", "technical skills", "technologies"],
    "certifications": ["certifications", "certificates", "licenses"],
    "publications": ["publication", "publications", "research", "papers"],
    "languages": ["languages"],
    "interests": ["interests", "hobbies"],
    "achievements": ["achievements", "awards", "honors"],
    "volunteering": ["volunteering", "community", "service"]
}

def ocr_pdf(pdf_path):
    text = ""
    images = convert_from_path(pdf_path, poppler_path=POPPLER_PATH)
    for img in images:
        text += pytesseract.image_to_string(img) + "\n"
    return text


def clean_ocr_text(text):
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)
    return text

def normalize_lines(text):
    return [
        line.strip()
        for line in text.split("\n")
        if line.strip()
    ]

def extract_basic_info(text):
    email = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
    phone = re.search(r"(\+?\d{1,3}[\s-]?)?\d{10}", text)

    lines = normalize_lines(text)
    name = lines[0] if lines else None

    return {
        "name": name,
        "email": email.group() if email else None,
        "phone": phone.group() if phone else None
    }

def detect_section_positions(lines):
    positions = []

    for idx, line in enumerate(lines):
        clean = line.lower().strip()

        for section, keywords in SECTION_MAP.items():
            if clean in keywords or any(clean.startswith(k + ":") for k in keywords):
                positions.append((idx, section))
                break

    return positions

def extract_sections(lines, section_positions):
    sections = {}

    for i, (start_idx, section) in enumerate(section_positions):
        end_idx = (
            section_positions[i + 1][0]
            if i + 1 < len(section_positions)
            else len(lines)
        )

        content = lines[start_idx + 1 : end_idx]
        sections[section] = content

    return sections

def normalize_list(lines):
    items = []
    for line in lines:
        clean = re.sub(r"^[•\-–e]+", "", line).strip()
        if len(clean) > 2:
            items.append(clean)
    return list(dict.fromkeys(items))


def parse_resume(pdf_path):
    raw_text = ocr_pdf(pdf_path)
    cleaned_text = clean_ocr_text(raw_text)

    lines = normalize_lines(raw_text)

    basic_info = extract_basic_info(cleaned_text)

    section_positions = detect_section_positions(lines)
    raw_sections = extract_sections(lines, section_positions)

    structured_sections = {}

    for section, content_lines in raw_sections.items():
        if section in ["skills", "languages"]:
            structured_sections[section] = normalize_list(content_lines)
        else:
            structured_sections[section] = "\n".join(content_lines).strip()

    return {
        "basic_info": basic_info,
        "sections": structured_sections
    }


if __name__ == "__main__":
    data = parse_resume("sample_resume.pdf")

    print("\n==== STRUCTURED RESUME DATA ====\n")
    print(data)

    for k, v in data["sections"].items():
        print(f"\n==== {k.upper()} ====")
        if isinstance(v, list):
            for item in v:
                print("-", item)
        else:
            print(v[:500])
