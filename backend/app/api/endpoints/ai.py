from fastapi import APIRouter, Depends, Body
from typing import List, Any, Dict
from pydantic import BaseModel
from app.api.deps import get_current_user, get_current_student
from app.models.user import UserInDB
from app.core.database import get_database
from bson import ObjectId
import random

router = APIRouter()

# ── Pydantic models ──────────────────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str   # "user" | "bot"
    text: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    mode: str = "interview"   # interview | communication | general

class ResumeData(BaseModel):
    skills: List[str]
    projects: List[Dict[str, str]]
    internships: List[Dict[str, str]]
    education: List[Dict[str, str]]
    certifications: List[str]

# ── Question bank ─────────────────────────────────────────────────────────────
TECH_QUESTIONS: Dict[str, List[str]] = {
    "Python": [
        "Explain the difference between list and tuple in Python.",
        "What are Python decorators and how do you use them?",
        "How does Python's GIL affect multi-threading?",
        "Explain list comprehension with an example.",
    ],
    "Java": [
        "What is the difference between JDK, JRE and JVM?",
        "Explain OOPS concepts with real-world examples.",
        "What is the difference between HashMap and Hashtable?",
        "What is a Java interface vs an abstract class?",
    ],
    "React": [
        "What is the Virtual DOM and how does React use it?",
        "Explain useState and useEffect hooks with examples.",
        "What is prop drilling and how do you avoid it?",
        "What is the difference between controlled and uncontrolled components?",
    ],
    "SQL": [
        "What is the difference between INNER JOIN and LEFT JOIN?",
        "Explain normalization and give an example of 3NF.",
        "What are indexes and when should you use them?",
        "Write a query to find the second highest salary from a table.",
    ],
    "Data Structures": [
        "Explain the time complexity of quicksort vs mergesort.",
        "When would you use a hash map vs a binary search tree?",
        "What is a stack overflow? Give a real scenario.",
        "Explain dynamic programming with an example.",
    ],
    "Machine Learning": [
        "What is the bias-variance tradeoff?",
        "Explain overfitting and how to prevent it.",
        "What is the difference between supervised and unsupervised learning?",
        "How does a Random Forest work?",
    ],
    "C++": [
        "Explain the difference between stack and heap memory.",
        "What is a virtual function in C++?",
        "What is the Rule of Three in C++?",
        "Explain templates in C++ with an example.",
    ],
    "Git": [
        "What is the difference between git merge and git rebase?",
        "How do you resolve a merge conflict in Git?",
        "What is git stash and when do you use it?",
        "Explain the Git branching strategy for a team project.",
    ],
}

HR_QUESTIONS: List[str] = [
    "Tell me about yourself.",
    "Why do you want to join our company?",
    "Where do you see yourself in 5 years?",
    "Describe a situation where you faced a challenge and how you resolved it.",
    "What is your greatest strength and weakness?",
    "Why should we hire you over other candidates?",
    "How do you handle pressure and tight deadlines?",
    "Tell me about a time you worked in a team.",
    "What motivates you to do your best work?",
    "Describe a time you showed leadership.",
]

ROLE_QUESTIONS: Dict[str, List[str]] = {
    "Software Engineer": [
        "Design a URL shortener system.",
        "What is REST vs GraphQL?",
        "Explain microservices architecture.",
        "How would you debug a memory leak in production?",
    ],
    "Data Analyst": [
        "How do you handle missing data in a dataset?",
        "Explain the difference between OLAP and OLTP.",
        "What is A/B testing?",
        "Walk me through a data analysis project you've done.",
    ],
    "Data Scientist": [
        "Explain cross-validation.",
        "What is gradient descent?",
        "How do you choose between different ML models?",
        "Explain the ROC curve and AUC.",
    ],
    "Frontend Developer": [
        "What is CSS specificity?",
        "Explain the event loop in JavaScript.",
        "What is lazy loading?",
        "How do you optimize website performance?",
    ],
    "Backend Developer": [
        "What is database indexing?",
        "Explain REST API authentication methods.",
        "What is caching and when do you use Redis?",
        "How do you design a scalable backend?",
    ],
    "DevOps Engineer": [
        "What is CI/CD and how does it work?",
        "Explain Docker vs Kubernetes.",
        "What is infrastructure as code?",
        "How do you monitor a production system?",
    ],
    "VLSI Design Engineer": [
        "What is the difference between FPGA and ASIC?",
        "Explain setup and hold time violations.",
        "What is clock domain crossing?",
        "Describe the VLSI design flow.",
    ],
    "Embedded Systems Engineer": [
        "What is the difference between RISC and CISC?",
        "Explain interrupt handling in embedded systems.",
        "What is a watchdog timer?",
        "How do you handle real-time constraints?",
    ],
}

COMMUNICATION_PROMPTS: List[str] = [
    "Practice introducing yourself in under 60 seconds.",
    "How would you explain a technical concept to a non-technical manager?",
    "Describe your college project to an interviewer who doesn't know your domain.",
    "Practice the STAR method: tell me about a team challenge you overcame.",
    "How do you handle constructive criticism from a senior?",
    "Convince me why you're the best candidate for a software role in one minute.",
]

COMMUNICATION_TIPS: List[str] = [
    "💡 **Tip:** Always begin with a confident summary statement before going into details.",
    "💡 **Tip:** Use the STAR method (Situation, Task, Action, Result) for behavioral questions.",
    "💡 **Tip:** Avoid filler words like 'um', 'uh', 'like' — pause instead of filling silence.",
    "💡 **Tip:** Structure technical answers: define → example → trade-offs.",
    "💡 **Tip:** Show enthusiasm — interviewers hire people, not just skills.",
    "💡 **Tip:** If you don't know an answer, say 'I'm not fully sure, but my understanding is...'",
    "💡 **Tip:** End each answer by connecting it to how you'll contribute to the company.",
    "💡 **Tip:** Maintain eye contact and smile — even in video interviews it changes your tone.",
]

def get_question(student_skills: List[str], target_role: str, mode: str) -> str:
    if mode == "communication":
        return random.choice(COMMUNICATION_PROMPTS)
    
    q_type = random.choices(["technical", "hr", "role"], weights=[40, 30, 30])[0]

    if q_type == "hr":
        return "🧑‍💼 **HR Question:** " + random.choice(HR_QUESTIONS)

    if q_type == "role" and target_role in ROLE_QUESTIONS:
        return "🎯 **Role-Specific:** " + random.choice(ROLE_QUESTIONS[target_role])

    # Technical — prefer student's skills if they match the bank
    matched = [s for s in student_skills if s in TECH_QUESTIONS]
    skill = random.choice(matched) if matched else random.choice(list(TECH_QUESTIONS.keys()))
    question = random.choice(TECH_QUESTIONS[skill])
    return f"🔧 **{skill} Technical:** {question}"


# ── Chatbot endpoint ──────────────────────────────────────────────────────────
@router.post("/chatbot")
async def chatbot(request: ChatRequest, current_user: UserInDB = Depends(get_current_user)) -> Any:
    db = get_database()
    msg = request.message.strip()
    msg_lower = msg.lower()

    # Fetch student context from DB
    profile = await db["student_profiles"].find_one({"user_id": str(current_user.id)})
    student_skills: List[str] = profile.get("skills", []) if profile else []

    # Determine target role from most recent application drive
    target_role = "Software Engineer"
    apps = await db["applications"].find({"student_id": str(current_user.id)}).to_list(10)
    if apps:
        drive_id = apps[-1].get("drive_id")
        if drive_id:
            try:
                drive = await db["drives"].find_one({"_id": ObjectId(drive_id)})
                if drive:
                    target_role = drive.get("role", target_role)
            except Exception:
                pass

    occasional_tip = random.choice(COMMUNICATION_TIPS) if random.random() < 0.35 else ""

    # ── Intent routing ────────────────────────────────────────────────────────
    if any(w in msg_lower for w in ["next", "next question", "another", "give me a question",
                                      "ask me", "start", "begin", "ready", "go", "continue"]):
        q = get_question(student_skills, target_role, request.mode)
        reply = f"{q}\n\n_Take your time to think, then type your answer._"
        if occasional_tip:
            reply += f"\n\n{occasional_tip}"

    elif any(w in msg_lower for w in ["hr", "hr question", "behavioural", "behavioral", "soft skill"]):
        q = "🧑‍💼 **HR Question:** " + random.choice(HR_QUESTIONS)
        reply = f"{q}\n\n_Use the STAR method: Situation → Task → Action → Result._"

    elif any(w in msg_lower for w in ["technical", "technical question", "coding question", "tech"]):
        q = get_question(student_skills, target_role, "technical")
        reply = q + "\n\n_Think out loud and explain your approach step by step._"

    elif any(w in msg_lower for w in ["communication", "speak", "language", "confidence",
                                       "tips", "improve", "english", "vocabulary"]):
        tips_text = "\n".join(COMMUNICATION_TIPS[:5])
        reply = (
            "📢 **Communication Improvement Tips:**\n\n"
            f"{tips_text}\n\n"
            "**Practice Exercise:** Introduce yourself in exactly 60 seconds covering your name, "
            "branch, skills, and career goal. Type your response below — I'll give feedback!"
        )

    elif any(w in msg_lower for w in ["my skill", "my profile", "what skill", "my details"]):
        if student_skills:
            reply = (
                f"📋 **Your Profile**\n\n"
                f"• **Skills:** {', '.join(student_skills)}\n"
                f"• **Target Role (from drives):** {target_role}\n\n"
                f"I'll personalize your questions based on this! Type **'next question'** to begin."
            )
        else:
            reply = (
                "⚠️ I couldn't find any skills in your profile. "
                "Please go to your **Dashboard → Edit Profile** and add your skills — "
                "then come back for personalized interview questions!"
            )

    elif any(w in msg_lower for w in ["help", "what can", "menu", "options", "commands", "hi", "hello", "hey"]):
        reply = (
            f"👋 Hi **{current_user.name}**! I'm your **PlacementPro Interview Coach** 🎓\n\n"
            "Here's what I can help you with:\n\n"
            "| Command | What happens |\n"
            "|---|---|\n"
            "| `next question` | Get a question tailored to your skills & role |\n"
            "| `HR question` | Practice behavioral questions |\n"
            "| `technical question` | Get a domain-specific tech question |\n"
            "| `communication tips` | Improve your communication skills |\n"
            "| `my skills` | See your profile & target role |\n\n"
            f"📌 _Your target role: **{target_role}** | Profile skills: **{len(student_skills)}**_\n\n"
            "Type **'next question'** to start your mock interview! 🚀"
        )

    else:
        # Treat the message as an answer — give adaptive feedback
        word_count = len(msg.split())
        if word_count < 5:
            reply = (
                "That's quite short! 🤔 A strong interview answer needs at least 3–5 sentences.\n\n"
                "Try elaborating: **what** you know + **how** you'd apply it + **an example**.\n\n"
                "Type **'next question'** to continue or try answering in more detail."
            )
        elif word_count < 25:
            reply = (
                f"Good start! 🌟 You covered the basics. To impress interviewers, add:\n"
                "• A **real example** from a project or course\n"
                "• The **outcome** or what you learned\n\n"
                f"{occasional_tip}\n\nType **'next question'** to continue!"
            )
        else:
            reply = (
                f"Excellent response! 🎉 You gave a detailed, thoughtful answer.\n\n"
                f"{occasional_tip if occasional_tip else '💡 **Tip:** Practice delivering this answer in under 90 seconds without reading — that builds real interview confidence.'}\n\n"
                "Type **'next question'** to keep going!"
            )

    return {
        "reply": reply,
        "target_role": target_role,
        "student_skills": student_skills,
    }


# ── Resume scoring ────────────────────────────────────────────────────────────
@router.post("/resume-score")
async def score_resume(data: ResumeData, current_user: UserInDB = Depends(get_current_student)) -> Any:
    score = 40
    score += min(len(data.skills) * 5, 25)
    score += min(len(data.projects) * 10, 20)
    score += min(len(data.internships) * 10, 10)
    score += 5 if data.education else 0

    feedback = []
    if len(data.skills) < 3:
        feedback.append("Add more skills (aim for at least 5–8 relevant skills).")
    if not data.projects:
        feedback.append("Projects help you stand out — add at least one with impact metrics.")
    if not data.internships:
        feedback.append("Internships add credibility. Mention any freelance or academic projects.")
    if len(data.certifications) == 0:
        feedback.append("Add certifications (Coursera, NPTEL, AWS etc.) to boost ATS score.")

    return {"score": min(score, 100), "feedback": feedback}


# ── Skill gap analysis ────────────────────────────────────────────────────────
@router.post("/skill-gap")
async def skill_gap(role: str = Body(embed=True), current_user: UserInDB = Depends(get_current_student)) -> Any:
    db = get_database()
    profile = await db["student_profiles"].find_one({"user_id": str(current_user.id)})
    student_skills: List[str] = profile.get("skills", []) if profile else []

    role_skill_map: Dict[str, List[str]] = {
        "Software Engineer": ["Java", "Python", "Data Structures", "Algorithms", "System Design", "Git"],
        "Frontend Developer": ["React", "JavaScript", "HTML", "CSS", "TypeScript", "REST APIs"],
        "Backend Developer": ["Python", "Java", "SQL", "REST APIs", "Docker", "Redis"],
        "Full Stack Developer": ["React", "Node.js", "Python", "SQL", "Docker", "Git"],
        "Data Analyst": ["Python", "SQL", "Tableau", "Machine Learning", "Excel", "Statistics"],
        "Data Scientist": ["Python", "Machine Learning", "Deep Learning", "SQL", "Statistics", "TensorFlow"],
        "AI / ML Engineer": ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Statistics"],
        "DevOps Engineer": ["Docker", "Kubernetes", "CI/CD", "Python", "Bash", "AWS"],
        "Cloud Engineer (AWS / Azure / GCP)": ["AWS", "Python", "Docker", "Terraform", "Linux", "Networking"],
        "Cybersecurity Analyst": ["Networking", "Linux", "Python", "Cryptography", "SIEM", "Penetration Testing"],
        "VLSI Design Engineer": ["Verilog", "SystemVerilog", "FPGA", "Cadence", "Digital Design", "VLSI"],
        "Embedded Systems Engineer": ["C", "C++", "RTOS", "Microcontrollers", "Assembly", "Embedded Linux"],
        "Mechanical Design Engineer": ["AutoCAD", "SolidWorks", "CATIA", "FEA", "GD&T", "CFD"],
    }

    required = role_skill_map.get(role, ["Communication", "Problem Solving", "Teamwork", "Excel"])
    matched = [s for s in required if any(s.lower() in sk.lower() for sk in student_skills)]
    missing = [s for s in required if s not in matched]
    score = max(10, int(len(matched) / len(required) * 100)) if required else 50

    return {
        "missing_skills": missing,
        "matched_skills": matched,
        "suggested_path": f"Focus on: {', '.join(missing[:3])} to strengthen your profile for a {role} role. "
                          f"Start with free courses on NPTEL, Coursera, or YouTube.",
        "recommendation_score": score,
    }


# ── Placement prediction ──────────────────────────────────────────────────────
@router.get("/predict-placement")
async def predict_placement(current_user: UserInDB = Depends(get_current_student)) -> Any:
    db = get_database()
    profile = await db["student_profiles"].find_one({"user_id": str(current_user.id)})
    if not profile:
        return {"probability": 50, "message": "Please complete your profile to get a prediction."}

    cgpa = profile.get("cgpa", 0)
    backlogs = profile.get("backlogs", 0)
    skills_count = len(profile.get("skills", []))

    prob = int((cgpa - 5) * 15) + (skills_count * 2) - (backlogs * 10)
    prob = min(max(prob, 10), 99)

    if prob > 75:
        msg = "🟢 Excellent! You have a strong placement profile. Focus on mock interviews and communication."
    elif prob > 50:
        msg = "🟡 Good profile! Improve your CGPA and add more projects to boost your chances."
    else:
        msg = "🔴 Profile needs work. Clear backlogs, add skills, and practice aptitude tests."

    return {"probability": prob, "message": msg}


# ── Skill heatmap ─────────────────────────────────────────────────────────────
@router.get("/skill-heatmap")
async def skill_heatmap(current_user: UserInDB = Depends(get_current_user)) -> Any:
    return [
        {"skill": "React", "demand": random.randint(70, 100)},
        {"skill": "Python", "demand": random.randint(80, 100)},
        {"skill": "Java", "demand": random.randint(60, 90)},
        {"skill": "AWS", "demand": random.randint(70, 95)},
        {"skill": "Node.js", "demand": random.randint(60, 85)},
        {"skill": "Docker", "demand": random.randint(50, 80)},
        {"skill": "SQL", "demand": random.randint(65, 90)},
        {"skill": "Machine Learning", "demand": random.randint(70, 95)},
    ]
