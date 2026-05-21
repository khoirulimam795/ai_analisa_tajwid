# backend/app/api.py
import sys
from pathlib import Path

# Tambah path agar bisa import src
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import tempfile
import json
import os

from src.pipeline import run_analysis
from src.phoneme_aligner import verify_surah_match, analyze_tajwid_from_audio
from src.ayah_matcher import match_transcript_to_ayahs
from src.tajwid_engine import analyze_tajwid_rules
from src.word import extract_word_timestamps, match_tajwid_with_timestamps

app = FastAPI(title="AI NGAJI API", version="2.0")

# CORS - biar aman, izinkan semua origin untuk development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Ganti dengan ["http://localhost:8000"] jika mau spesifik
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (CSS, JS) dari folder app/static
app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get("/")
async def serve_frontend():
    """Halaman utama UI"""
    return FileResponse("app/static/index.html")

@app.get("/surahs")
def get_surahs():
    base_dir = Path(__file__).parent.parent
    surat_dir = base_dir / "surat"
    
    if not surat_dir.exists():
        return {"surahs": []}
    
    surahs = []
    for f in surat_dir.glob("surah_*.json"):
        try:
            num = int(f.stem.replace("surah_", ""))
            with open(f, "r", encoding="utf-8") as fp:
                data = json.load(fp)
                name = data.get("name", f"Surah {num}")
                total_verses = data.get("count", 0)  # Ambil jumlah ayat dari field 'count'
                
                # Jika tidak ada field 'count', hitung dari verse (tanpa verse_0)
                if total_verses == 0:
                    verses = data.get("verse", {})
                    total_verses = len([k for k in verses.keys() if k != "verse_0"])
                    
            surahs.append({
                "number": num,
                "name": name,
                "total_verses": total_verses
            })
        except Exception as e:
            print(f"Error loading {f}: {e}")
            continue
    # URUTKAN berdasarkan nomor surat (78, 79, 80, ... 114)
    surahs.sort(key=lambda x: x["number"])
    return {"surahs": surahs}
@app.get("/ayat/{surah_number}")
async def get_ayat(surah_number: int):
    """Mengembalikan daftar ayat dari file surah_{surah_number}.json"""
    base_dir = Path(__file__).parent.parent
    json_path = base_dir / "surat" / f"surah_{surah_number}.json"
    if not json_path.exists():
        raise HTTPException(404, f"Data surat {surah_number} tidak ditemukan")
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    verses = data.get("verse", {})
    ayats = []
    for key, text in verses.items():
        if key == "verse_0":
            continue
        nomor = int(key.replace("verse_", ""))
        ayats.append({
            "nomor": nomor,
            "teks_arab": text,
            "transliterasi": "",  
            "terjemahan": "" 
        })
    # Urutkan berdasarkan nomor ayat
    ayats.sort(key=lambda x: x["nomor"])
    return {"ayats": ayats}
@app.post("/analyze")
async def analyze_audio(
    surah: int = Form(...),
    file: UploadFile = File(...)
):
    suffix = Path(file.filename).suffix
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        base_dir = Path(__file__).parent.parent
        json_path = base_dir / "surat" / f"surah_{surah}.json"
        if not json_path.exists():
            raise HTTPException(404, f"Data surat {surah} tidak ditemukan di {json_path}")
        
        with open(json_path, "r", encoding="utf-8") as f:
            surah_data = json.load(f)

        # Verifikasi surat
        is_match, error_msg, detected = verify_surah_match(tmp_path, str(json_path), surah)
        if not is_match:
            return JSONResponse(status_code=400, content={"error": error_msg})

        # Match ayat
        ayah_matches = match_transcript_to_ayahs(detected, str(json_path))

        # Alignment & tajwid from audio
        alignment_result = analyze_tajwid_from_audio(tmp_path, surah_data)
        word_segments = extract_word_timestamps(alignment_result)

        # Tajwid rules from text
        tajwid_results = analyze_tajwid_rules(detected, str(json_path))
        tajwid_results = match_tajwid_with_timestamps(tajwid_results, word_segments)

        correct = sum(1 for r in tajwid_results if r.get("status") == "correct")
        wrong = sum(1 for r in tajwid_results if r.get("status") != "correct")
        accuracy = (correct / (correct + wrong) * 100) if (correct + wrong) > 0 else 0

        for r in tajwid_results:
            r.pop("word_score", None)

        return {
            "status": "success",
            "surah": surah,
            "surah_name": surah_data.get("name", f"Surah {surah}"),
            "detected_text": detected,
            "accuracy": round(accuracy, 1),
            "correct": correct,
            "wrong": wrong,
            "ayah_matches": ayah_matches[:5],
            "tajwid_results": tajwid_results
        }

    except Exception as e:
        raise HTTPException(500, detail=str(e))
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
            
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)