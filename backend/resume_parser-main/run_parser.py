"""
run_parser.py
=============
Example script that calls the resume_parser module from outside its folder.

Place this file one level above the resume_parser/ directory:

    project/
    ├── resume_parser/          ← the module
    └── run_parser.py           ← this file

Run:
    python run_parser.py "path/to/resume.pdf"
"""

import sys
from pathlib import Path

# ── Optional: only needed on Windows when Poppler is not on the system PATH ──
POPPLER_PATH = r"C:\poppler-25.12.0\Library\bin"   # set to None on Linux/macOS
BASE_DIR = Path(__file__).resolve().parent

RESOURCE_DIR = BASE_DIR / "resume_parser" / "Resource files"


def main():
    if len(sys.argv) < 2:
        print('Usage: python run_parser.py "path/to/resume.pdf"')
        sys.exit(1)

    resume_path = sys.argv[1]

    from resume_parser import parse_resume, hash_resume

    # ── Hash first (cheap) ────────────────────────────────────────────────────
    file_hash = hash_resume(resume_path)
    print(f"[INFO] Resume hash (sha256): {file_hash}")

    # TODO: check file_hash against your database here before parsing

    # ── Parse and get JSON ────────────────────────────────────────────────────
    print(f"[INFO] Parsing: {resume_path}")
    json_str = parse_resume(
        path         = resume_path,
        resource_dir = RESOURCE_DIR,
        poppler_path = POPPLER_PATH,
    )

    # ── Inject Native ATS Algorithm Loop ──────────────────────────────────────
    import json
    try:
        from resume_scoring.scorer import resume_score
        parsed_dict = json.loads(json_str)
        
        # Initialize default design metadata baseline
        default_design_meta = {
            "image_count": 0,
            "pages_with_images": 0,
            "low_text_pages": 0
        }
        
        stats = resume_score(
             raw_text=parsed_dict.get("_raw_text", ""),
             extracted_json=parsed_dict,
             resume_type=parsed_dict.get("_resume_type", "text"),
             design_details=default_design_meta
        )
        
        parsed_dict["scoring"] = stats
        
        # Delete heavy internal tracking variables before Node transmission
        if "_raw_text" in parsed_dict: del parsed_dict["_raw_text"]
        if "_resume_type" in parsed_dict: del parsed_dict["_resume_type"]
        
        json_str = json.dumps(parsed_dict, indent=4)
    except Exception as e:
        print(f"[ERROR] Algorithmic ATS Scoring Failed: {str(e)}", file=sys.stderr)

    # ── Print JSON to stdout ──────────────────────────────────────────────────
    print(json_str)


if __name__ == "__main__":
    main()