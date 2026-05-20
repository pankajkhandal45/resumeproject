from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re

app = FastAPI(title="AI Resume Analysis Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResumeData(BaseModel):
    text: str

def parse_resume(text: str):
    text_lower = text.lower()
    words = text.split()
    word_count = len(words)

    # ─── 1. SKILL EXTRACTION ─────────────────────────────────────────────────
    skill_categories = {
        "Languages":    ["python", "javascript", "java", "c++", "c#", "ruby", "golang",
                         "rust", "typescript", "php", "solidity", "kotlin", "swift", "r", "scala"],
        "Frontend":     ["react", "vue", "angular", "next.js", "nuxt", "svelte",
                         "html", "css", "tailwind", "sass", "bootstrap", "jquery", "redux"],
        "Backend":      ["node.js", "express", "django", "flask", "fastapi", "spring boot",
                         "laravel", "rails", "asp.net", "nestjs", "graphql", "rest api"],
        "Database":     ["mongodb", "postgresql", "mysql", "redis", "firebase",
                         "oracle", "sqlite", "cassandra", "dynamodb", "elasticsearch"],
        "Cloud/DevOps": ["aws", "azure", "gcp", "docker", "kubernetes", "jenkins",
                         "terraform", "github actions", "ci/cd", "linux", "nginx", "ansible"],
        "AI/ML":        ["machine learning", "deep learning", "tensorflow", "pytorch",
                         "scikit-learn", "nlp", "computer vision", "pandas", "numpy", "keras"],
        "Blockchain":   ["ethereum", "smart contracts", "web3.js", "ethers.js",
                         "hardhat", "truffle", "solana", "hyperledger", "ipfs", "defi"],
        "Mobile":       ["react native", "flutter", "android", "ios", "xamarin"],
        "Tools":        ["git", "jira", "figma", "postman", "vs code", "linux",
                         "agile", "scrum", "kanban"],
    }

    extracted_skills = {}
    for category, skills in skill_categories.items():
        found = []
        for skill in skills:
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower):
                display = skill.title() if '.' not in skill and '/' not in skill else skill
                found.append(display)
        if found:
            extracted_skills[category] = found

    all_skills = [s for skills in extracted_skills.values() for s in skills]

    # ─── 2. EXPERIENCE EXTRACTION ─────────────────────────────────────────────
    exp_years = []
    patterns = [
        r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?experience',
        r'experience\s*(?:of\s+)?(\d+)\+?\s*(?:years?|yrs?)',
        r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:work|industry|professional)',
    ]
    for p in patterns:
        matches = re.findall(p, text_lower)
        exp_years.extend([int(m) for m in matches])

    max_exp = max(exp_years) if exp_years else None

    # ─── 3. EDUCATION DETECTION ───────────────────────────────────────────────
    education_keywords = {
        "phd":       ["ph.d", "phd", "doctorate"],
        "masters":   ["m.tech", "m.e.", "mtech", "master", "mba", "m.sc", "msc", "m.s."],
        "bachelors": ["b.tech", "b.e.", "btech", "bachelor", "b.sc", "bsc", "b.s.", "be ", "b.e "],
        "diploma":   ["diploma", "polytechnic"],
    }
    detected_edu = []
    for level, kws in education_keywords.items():
        if any(kw in text_lower for kw in kws):
            detected_edu.append(level)

    # ─── 4. CONTACT INFO CHECK ────────────────────────────────────────────────
    has_email   = bool(re.search(r'[\w.+-]+@[\w-]+\.\w+', text))
    has_phone   = bool(re.search(r'[\+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}', text))
    has_linkedin = "linkedin" in text_lower
    has_github   = "github" in text_lower

    # ─── 5. SECTION DETECTION ─────────────────────────────────────────────────
    # Use regex to find headers (usually on their own line or followed by colon)
    def find_section(keywords):
        for kw in keywords:
            # Look for keyword at start of line or with common header symbols
            pattern = rf'(?i)(?:^|\n)(?:\s*|[*#•-]\s*){re.escape(kw)}(?:\s*[:\-|]|\s*\n)'
            if re.search(pattern, text):
                return True
        # Fallback to simple inclusion if regex fails but keyword is prominent
        return any(f" {w} " in f" {text_lower} " for w in keywords)

    sections = {
        "experience":  find_section(["experience", "work history", "employment", "professional background"]),
        "education":   find_section(["education", "qualification", "academic", "scholarship"]),
        "projects":    find_section(["project", "portfolio", "key projects", "notable works"]),
        "skills":      find_section(["skills", "technologies", "tech stack", "technical expertise"]),
        "achievements":find_section(["achievement", "award", "honor", "distinction", "recognition"]),
        "certifications": find_section(["certification", "certified", "certificate", "licenses"]),
    }
    sections_found = [k for k, v in sections.items() if v]

    # ─── 6. RISK FLAG ENGINE ──────────────────────────────────────────────────
    flags = []
    confidence = 100

    # Word Count Flags
    if word_count < 50:
        flags.append("🚨 Minimal Content: Extremely low word count — insufficient for AI analysis")
        confidence -= 40
    elif word_count < 120:
        flags.append("⚠️ Low Detail: Resume is brief; adding more project details can improve score")
        confidence -= 15
    elif word_count > 1500:
        flags.append("⚠️ Excessive Length: Very long resume may suggest irrelevant information")
        confidence -= 5

    # Skill Density Flags
    if len(all_skills) == 0:
        flags.append("🚨 No Technical Skills: No recognizable technologies detected")
        confidence -= 30
    elif len(all_skills) > 35:
        flags.append("🚨 Keyword Stuffing: Unusually high number of skills suggests low expertise in each")
        confidence -= 25
    elif len(all_skills) < 4:
        flags.append("⚠️ Limited Skills: Consider listing more specific tech stack components")
        confidence -= 10

    # Experience Flags
    if max_exp is not None:
        if max_exp > 40:
            flags.append(f"🚨 Implausible Experience: {max_exp} years exceeds standard career length")
            confidence -= 30
        if max_exp > 5 and ("student" in text_lower or "fresher" in text_lower):
            flags.append("🚨 Experience Conflict: Claims seniority but identifies as student/fresher")
            confidence -= 35

    # Structure Flags
    if not sections["experience"]:
        flags.append("⚠️ Missing Work History: No clear 'Experience' section found")
        confidence -= 15
    if not sections["education"]:
        flags.append("⚠️ Missing Education: Academic background section not detected")
        confidence -= 10
    if not sections["projects"] and not sections["experience"]:
        flags.append("🚨 Content Gap: Neither Work Experience nor Projects were found")
        confidence -= 20

    # Formatting Flags
    lines = text.split('\n')
    avg_line_len = word_count / max(1, len(lines))
    if avg_line_len > 25:
        flags.append("⚠️ Formatting: Large blocks of text detected; use bullet points for clarity")
        confidence -= 5

    # ─── 7. COMPLETENESS SCORE ────────────────────────────────────────────────
    completeness = 0
    completeness += 25 if sections["experience"] else 0
    completeness += 15 if sections["education"] else 0
    completeness += 15 if sections["projects"] else 0
    completeness += 10 if sections["skills"] else 0
    completeness += 10 if sections["certifications"] or sections["achievements"] else 0
    completeness += 10 if has_email else 0
    completeness += 5  if has_phone else 0
    completeness += 5  if has_linkedin or has_github else 0
    
    completeness = min(100, completeness)

    return {
        "skills": all_skills,
        "skills_by_category": extracted_skills,
        "confidence_score": max(0, min(100, confidence)),
        "completeness_score": completeness,
        "flags": flags,
        "experience_years": max_exp,
        "education": detected_edu,
        "sections_found": sections_found,
        "contact_info": {
            "email": has_email,
            "phone": has_phone,
            "linkedin": has_linkedin,
            "github": has_github,
        },
        "word_count": word_count,
        "analysis_depth": "Advanced",
    }


@app.post("/analyze-resume")
async def analyze_resume(resume: ResumeData):
    if not resume.text or not resume.text.strip():
        raise HTTPException(status_code=400, detail="Resume text is empty")
    analysis = parse_resume(resume.text)
    return analysis


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "AI Resume Analyzer"}
