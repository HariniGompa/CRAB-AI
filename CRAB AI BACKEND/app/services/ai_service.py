"""
AI Service for CRAB AI
Uses Groq (primary - free, 30 req/min) with Gemini fallback.
Groq key: https://console.groq.com  (sign up, create API key, free)
Gemini key: https://aistudio.google.com/app/apikey (free)
"""

import json
import re
import logging
from typing import Dict, List, Any, Optional
import httpx
from ..config import settings

logger = logging.getLogger(__name__)

GROQ_API_BASE = "https://api.groq.com/openai/v1/chat/completions"
GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


class AIService:

    def __init__(self):
        self.groq_key = getattr(settings, "groq_api_key", None)
        self.gemini_key = settings.gemini_api_key
        self.gemini_model = settings.gemini_model or "gemini-2.0-flash"

    def _has_groq(self) -> bool:
        return bool(self.groq_key)

    def _has_gemini(self) -> bool:
        return bool(self.gemini_key)

    def _is_available(self) -> bool:
        return self._has_groq() or self._has_gemini()

    async def _generate(self, prompt: str, system: str = "", temperature: float = 0.7) -> Optional[str]:
        """Try Groq first, fall back to Gemini."""
        if self._has_groq():
            result = await self._groq_generate(prompt, system, temperature)
            if result:
                return result
        if self._has_gemini():
            result = await self._gemini_generate(prompt, system, temperature)
            if result:
                return result
        return None

    async def _groq_generate(self, prompt: str, system: str = "", temperature: float = 0.7) -> Optional[str]:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": messages,
            "temperature": temperature,
            "max_tokens": 2000,
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    GROQ_API_BASE,
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {self.groq_key}",
                        "Content-Type": "application/json",
                    },
                )
                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    logger.warning(f"Groq error {response.status_code}: {response.text[:200]}")
                    return None
        except Exception as e:
            logger.warning(f"Groq request failed: {e}")
            return None

    async def _gemini_generate(self, prompt: str, system: str = "", temperature: float = 0.7) -> Optional[str]:
        if not self.gemini_key:
            return None
        
        # Validate key format
        key = self.gemini_key.strip()
        if not key.startswith("AI"):
            logger.error(f"Gemini API key appears invalid (should start with 'AI'): {key[:10]}...")
            return None

        url = f"{GEMINI_API_BASE}/{self.gemini_model}:generateContent?key={key}"
        full_prompt = f"{system}\n\n{prompt}" if system else prompt
        payload = {
            "contents": [{"role": "user", "parts": [{"text": full_prompt}]}],
            "generationConfig": {"temperature": temperature, "maxOutputTokens": 2000},
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    return data["candidates"][0]["content"]["parts"][0]["text"]
                else:
                    logger.error(f"Gemini error {response.status_code}: {response.text[:300]}")
                    return None
        except Exception as e:
            logger.error(f"Gemini request failed: {e}")
            return None

    # ─────────────────────────────────────────────
    # ATS + RESUME MATCHING (combined, most important)
    # ─────────────────────────────────────────────

    async def analyze_resume_job_match(self, resume_text: str, job_description: str) -> Dict[str, Any]:
        """Full AI-powered resume vs job description analysis."""
        if not self._is_available():
            return self._rule_based_match(resume_text, job_description)

        system = (
            "You are an expert ATS resume analyzer and career coach. "
            "Analyze resumes against job descriptions accurately and specifically. "
            "Always respond with valid JSON only — no markdown code blocks, no explanation text."
        )

        prompt = f"""You are a professional ATS system and resume expert. Perform a COMPREHENSIVE evaluation of this resume.

RESUME:
{resume_text[:3000]}

JOB DESCRIPTION:
{job_description[:2000]}

Evaluate ALL of the following dimensions:
1. SKILL MATCH — how many required skills/tools does the candidate have
2. RESUME STRUCTURE — are all key sections present (Summary, Skills, Experience, Education, Contact)
3. CONTENT QUALITY — are achievements quantified with numbers/percentages? Are action verbs used?
4. ATS FORMATTING — is the resume clean, no tables/graphics, standard section headings, proper keywords?
5. GRAMMAR & LANGUAGE — any obvious grammatical errors, passive voice overuse, vague language?
6. SENTENCE QUALITY — are bullet points concise and impactful? Are they results-oriented?
7. LENGTH & DENSITY — is the resume the right length (1-2 pages)? Is content well-distributed?
8. KEYWORD ALIGNMENT — does the resume use the same terminology as the job description?

Return ONLY this JSON (absolutely no markdown, no ```json):
{{
  "match_percentage": <integer 0-100 overall ATS score combining all dimensions>,
  "ats_score": <integer 0-100 specifically for ATS formatting quality>,
  "matched_skills": ["actual technical skills found in both resume and JD"],
  "missing_skills": ["real technical skills/tools in JD but not in resume - NO generic words"],
  "strengths": ["specific strength observed in this resume"],
  "improvements": [
    "specific improvement 1 — be detailed and actionable",
    "specific improvement 2",
    "specific improvement 3",
    "specific improvement 4",
    "specific improvement 5"
  ],
  "structure_feedback": {{
    "missing_sections": ["list any important sections that are missing"],
    "has_quantified_achievements": true/false,
    "action_verb_usage": "good/average/poor",
    "formatting_quality": "good/average/poor"
  }},
  "grammar_feedback": {{
    "issues_found": ["specific grammar/language issue if any"],
    "overall": "good/average/poor"
  }},
  "keyword_alignment": "high/medium/low",
  "summary": "One specific sentence assessing this candidate for this role"
}}

Rules:
- missing_skills: ONLY real tech skills like Python, SQL, React — NEVER 'must', 'have', 'strong', 'experience', 'knowledge'
- improvements: cover structure, content, keywords, grammar, formatting — not just skills
- Be specific and reference actual content from the resume
- All fields required"""

        # temperature=0 ensures consistent, deterministic results for same input
        response = await self._generate(prompt, system, temperature=0.0)
        if response:
            try:
                cleaned = re.sub(r"```json|```", "", response).strip()
                # Find JSON object
                match = re.search(r'\{.*\}', cleaned, re.DOTALL)
                if match:
                    data = json.loads(match.group())
                    # Filter missing_skills to only real tech skills
                    data["missing_skills"] = self._filter_real_skills(data.get("missing_skills", []))
                    data["matched_skills"] = self._filter_real_skills(data.get("matched_skills", []))
                    return data
            except Exception as e:
                logger.warning(f"JSON parse error: {e}, response: {response[:300]}")

        return self._rule_based_match(resume_text, job_description)

    def _filter_real_skills(self, skills: List[str]) -> List[str]:
        """Remove non-skill words from skill lists."""
        junk_words = {
            "must", "have", "will", "work", "with", "from", "that", "this",
            "your", "able", "good", "required", "type", "full", "part", "home",
            "remote", "freshers", "experienced", "candidates", "apply", "basic",
            "knowledge", "plus", "laptop", "mobile", "internet", "connection",
            "collect", "maintain", "organize", "prepare", "accuracy", "records",
            "attention", "detail", "communication", "ability", "independently",
            "responsibilities", "eligibility", "skills", "role", "job", "team",
            "strong", "experience", "understanding", "familiarity", "proficiency",
            "write", "are", "the", "and", "for", "you", "our", "we", "be",
            "can", "may", "should", "would", "could", "all", "any", "use",
            "new", "old", "big", "small", "high", "low", "time", "year",
            "data", "system", "software", "application", "development", "project",
        }
        real_skills = []
        for skill in skills:
            if isinstance(skill, str) and len(skill) > 1:
                # Check if it looks like a real tech skill
                skill_lower = skill.lower().strip()
                words = skill_lower.split()
                # Skip if all words are junk
                if not all(w in junk_words for w in words):
                    # Skip single generic words
                    if len(words) == 1 and skill_lower in junk_words:
                        continue
                    real_skills.append(skill)
        return real_skills[:10]

    def _rule_based_match(self, resume_text: str, job_description: str) -> Dict[str, Any]:
        """Fallback rule-based matching using known tech keywords."""
        tech_keywords = {
            "python", "java", "javascript", "typescript", "react", "angular", "vue",
            "nodejs", "node.js", "express", "django", "flask", "fastapi", "spring",
            "sql", "mysql", "postgresql", "mongodb", "redis", "sqlite", "oracle",
            "aws", "azure", "gcp", "docker", "kubernetes", "git", "github", "linux",
            "machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn",
            "pandas", "numpy", "matplotlib", "seaborn", "tableau", "power bi",
            "html", "css", "bootstrap", "tailwind", "sass", "webpack",
            "rest api", "graphql", "microservices", "devops", "ci/cd",
            "r", "scala", "kotlin", "swift", "flutter", "react native",
            "nlp", "computer vision", "opencv", "hugging face", "openai",
            "hadoop", "spark", "kafka", "airflow", "dbt", "snowflake",
            "elasticsearch", "rabbitmq", "nginx", "ansible", "terraform",
        }

        resume_lower = resume_text.lower()
        job_lower = job_description.lower()

        resume_kw = {kw for kw in tech_keywords if kw in resume_lower}
        job_kw = {kw for kw in tech_keywords if kw in job_lower}

        matched = resume_kw & job_kw
        missing = job_kw - resume_kw

        pct = int(len(matched) / max(len(job_kw), 1) * 100) if job_kw else 50

        return {
            "match_percentage": min(pct, 95),
            "matched_skills": list(matched)[:10],
            "missing_skills": list(missing)[:8],
            "improvements": [
                "Add the missing technical skills listed above to your resume",
                "Quantify your achievements with numbers and percentages",
                "Tailor your professional summary to match this specific role",
            ],
            "summary": f"Your resume matches {pct}% of the technical requirements for this role.",
            "ats_score": self.calculate_ats_score_rule_based(resume_text)["score"],
            "strengths": [f"Has experience with {kw}" for kw in list(matched)[:3]],
        }

    # ─────────────────────────────────────────────
    # ATS RULE-BASED SCORING
    # ─────────────────────────────────────────────

    def calculate_ats_score_rule_based(self, resume_text: str) -> Dict[str, Any]:
        score = 0
        suggestions = []
        resume_lower = resume_text.lower()

        # Section check
        sections = ["experience", "education", "skills", "summary", "objective", "project"]
        found_sections = [s for s in sections if s in resume_lower]
        score += min(len(found_sections) * 12, 50)
        if len(found_sections) < 3:
            suggestions.append("Add more clearly labeled sections (Experience, Skills, Education, Summary)")

        # Contact info
        contact_score = 0
        if re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", resume_text):
            contact_score += 10
        if re.search(r"\b\d{10}\b|\+\d{1,3}[\s-]?\d{10}", resume_text):
            contact_score += 5
        if "linkedin" in resume_lower or "github" in resume_lower:
            contact_score += 5
        score += contact_score
        if contact_score < 10:
            suggestions.append("Add complete contact information (email, phone, LinkedIn/GitHub)")

        # Word count
        word_count = len(resume_text.split())
        if 250 <= word_count <= 800:
            score += 20
        elif word_count < 250:
            suggestions.append("Resume is too short — add more detail about your experience and skills")
        else:
            suggestions.append("Resume may be too long — aim for 1-2 pages")

        # Action verbs
        action_verbs = ["developed","built","created","designed","implemented","led","managed",
                        "improved","optimized","launched","delivered","achieved","increased",
                        "reduced","analyzed","collaborated","coordinated","trained","mentored"]
        verb_count = sum(1 for v in action_verbs if v in resume_lower)
        if verb_count >= 4:
            score += 15
        else:
            suggestions.append("Use strong action verbs: developed, built, achieved, optimized, led")

        # Quantifiable achievements
        if re.search(r"\d+%|\d+\s*(years?|months?|people|users?|projects?|clients?)", resume_text, re.I):
            score += 10
        else:
            suggestions.append("Add quantifiable achievements (e.g., 'improved performance by 30%', 'managed 5-person team')")

        score = min(score, 100)
        return {
            "score": score,
            "suggestions": suggestions,
            "found_sections": found_sections,
            "word_count": word_count,
            "action_verb_count": verb_count,
        }

    def extract_keywords_rule_based(self, text: str) -> List[str]:
        tech_keywords = [
            "python","java","javascript","typescript","react","angular","vue","nodejs",
            "sql","mysql","postgresql","mongodb","redis","aws","azure","gcp","docker",
            "kubernetes","git","linux","machine learning","deep learning","tensorflow",
            "pytorch","scikit-learn","pandas","numpy","tableau","power bi","html","css",
            "django","flask","fastapi","spring","r","scala","kotlin","swift","flutter",
            "nlp","opencv","hadoop","spark","kafka","airflow","elasticsearch","terraform",
            "github","gitlab","rest api","graphql","microservices","devops","ci/cd",
        ]
        text_lower = text.lower()
        return [kw for kw in tech_keywords if kw in text_lower]

    # ─────────────────────────────────────────────
    # INTERVIEW QUESTIONS
    # ─────────────────────────────────────────────

    async def generate_interview_questions(
        self,
        resume_content: str,
        job_role: str,
        company: Optional[str] = None,
        difficulty_level: str = "mid",
        questions_per_round: int = 5,
        include_coding: bool = False,
        session_seed: Optional[str] = None,
    ) -> Dict[str, List[str]]:

        if not self._is_available():
            return self._fallback_interview_questions(job_role, questions_per_round, include_coding)

        n = max(3, min(10, questions_per_round))
        system = (
            "You are a senior interviewer generating realistic, role-specific interview questions. "
            "NEVER repeat the same question with just a different domain name. "
            "Each question must be genuinely different and test a different skill or concept. "
            "Respond with valid JSON only, no markdown."
        )

        resume_section = f"\nCandidate background:\n{resume_content[:1500]}" if resume_content.strip() else ""
        company_str = f" at {company}" if company else ""
        coding_section = f"""
  "coding": ["{n} distinct DSA/coding problems - e.g. arrays, strings, sorting, trees, graphs, dynamic programming - each testing a different concept - include the problem statement clearly"]""" if include_coding else ""

        import random
        import time
        # Use provided seed or generate one — guarantees fresh questions every call
        salt = session_seed or f"{int(time.time())}-{random.randint(10000, 99999)}"
        prompt = f"""Generate EXACTLY {n} UNIQUE questions for each category. Session ID: {salt}

Role: {job_role}{company_str}
Experience Level: {difficulty_level}{resume_section}

STRICT RULES — MUST FOLLOW:
1. EVERY question must be genuinely DIFFERENT — no paraphrasing, no same topic with different wording
2. Technical questions MUST vary: cover different technologies, concepts, problem types specific to {job_role}
3. For {difficulty_level} level: {"focus on basics and learning" if difficulty_level=="entry" else "focus on real project experience and problem solving" if difficulty_level=="mid" else "focus on architecture, leadership, system design, complex tradeoffs"}
4. HR questions: mix of career goals, motivation, salary, culture fit, work style — NOT all about "tell me about yourself"
5. Behavioral: DIFFERENT scenarios — conflict, failure, success, teamwork, deadline pressure, innovation — use STAR method
6. NO generic filler questions like "what are your strengths/weaknesses" unless specifically needed
7. Questions must feel like they come from a REAL interviewer at a company, not an AI template

Return ONLY valid JSON (no markdown, no extra text):
{{
  "technical": ["distinct specific question 1", "distinct specific question 2", ... exactly {n} items],
  "hr": ["distinct hr question 1", "distinct hr question 2", ... exactly {n} items],
  "behavioral": ["distinct behavioral question 1", "distinct behavioral question 2", ... exactly {n} items]{coding_section}
}}"""

        response = await self._generate(prompt, system)
        if response:
            try:
                cleaned = re.sub(r"```json|```", "", response).strip()
                match = re.search(r'\{.*\}', cleaned, re.DOTALL)
                if match:
                    data = json.loads(match.group())
                    result = {
                        "technical": data.get("technical", [])[:n],
                        "hr": data.get("hr", [])[:n],
                        "behavioral": data.get("behavioral", [])[:n],
                        "coding": data.get("coding", [])[:n] if include_coding else [],
                    }
                    return result
            except Exception as e:
                logger.warning(f"Interview Q parse error: {e}")

        return self._fallback_interview_questions(job_role, questions_per_round, include_coding)

    def _fallback_interview_questions(self, job_role: str, n: int = 5, include_coding: bool = False) -> Dict[str, List[str]]:
        import random
        role_lower = job_role.lower()
        
        if any(w in role_lower for w in ["data analyst", "data analysis", "business analyst"]):
            technical_pool = [
                "Walk me through how you would approach a data cleaning project with missing values and outliers.",
                "Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN with real examples.",
                "How would you detect and handle outliers in a large dataset?",
                "Describe how you would build a KPI dashboard from scratch using available tools.",
                "What is the difference between a star schema and a snowflake schema in data warehousing?",
                "How do you decide which chart type to use when visualizing data?",
                "Explain the concept of A/B testing and how you would design one.",
                "What is the difference between correlation and causation? Give an example.",
                "How would you analyze customer churn data to find patterns?",
                "Walk me through how you would validate a dataset before using it for analysis.",
                "What is the difference between OLAP and OLTP systems?",
                "How do you handle duplicate records in a dataset?",
            ]
        elif any(w in role_lower for w in ["data scientist", "ml engineer", "machine learning", "ai engineer"]):
            technical_pool = [
                "Explain the bias-variance tradeoff and how it affects model selection.",
                "How would you handle class imbalance in a classification problem?",
                "What is the difference between bagging and boosting ensemble methods?",
                "How do you evaluate a regression model vs a classification model?",
                "Explain gradient descent and its variants (SGD, Adam, RMSProp).",
                "What is cross-validation and why do we use it?",
                "How would you deploy a machine learning model to production?",
                "Explain the concept of feature importance and how to measure it.",
                "What is the difference between precision and recall? When do you prioritize each?",
                "How would you approach building an NLP pipeline from scratch?",
                "Explain L1 vs L2 regularization and when to use each.",
                "What is transfer learning and when would you use it?",
            ]
        elif any(w in role_lower for w in ["frontend", "react developer", "ui developer"]):
            technical_pool = [
                "Explain the virtual DOM and how React's reconciliation algorithm works.",
                "How do you optimize a React application for performance?",
                "What is the difference between useEffect and useLayoutEffect?",
                "Explain CSS specificity and the box model.",
                "How do you handle state management in large React applications?",
                "What are React hooks and why were they introduced?",
                "Explain the difference between controlled and uncontrolled components.",
                "How would you implement lazy loading in a React app?",
                "What is the purpose of useMemo and useCallback?",
                "Explain how CORS works and how you handle it in frontend development.",
                "What is the difference between localStorage, sessionStorage, and cookies?",
                "How do you handle responsive design across different screen sizes?",
            ]
        elif any(w in role_lower for w in ["backend", "api developer", "python developer", "node developer"]):
            technical_pool = [
                "How would you design a RESTful API for a social media application?",
                "Explain database indexing and when you would use it.",
                "How do you handle authentication and authorization in your APIs?",
                "What strategies do you use for handling concurrent requests?",
                "Explain the CAP theorem in distributed systems.",
                "How would you design a rate limiting system for an API?",
                "What is the difference between SQL and NoSQL databases?",
                "Explain the concept of database transactions and ACID properties.",
                "How would you design a caching strategy for a high-traffic application?",
                "What is message queuing and when would you use it?",
                "How do you handle database migrations in production?",
                "Explain the difference between synchronous and asynchronous processing.",
            ]
        elif any(w in role_lower for w in ["devops", "cloud", "sre", "platform engineer"]):
            technical_pool = [
                "How would you set up a CI/CD pipeline for a microservices application?",
                "Explain the difference between Docker and Kubernetes.",
                "How do you monitor and alert on application health in production?",
                "Describe your approach to infrastructure as code using Terraform.",
                "How do you handle zero-downtime deployments?",
                "What is the difference between horizontal and vertical scaling?",
                "Explain how you would debug a production incident step by step.",
                "What is a service mesh and when would you use one?",
                "How do you handle secrets management in a cloud environment?",
                "Explain the difference between blue-green deployment and canary deployment.",
                "What is Kubernetes autoscaling and how does it work?",
                "How do you design a disaster recovery strategy?",
            ]
        elif any(w in role_lower for w in ["software engineer", "sde", "full stack", "fullstack"]):
            technical_pool = [
                "Explain the SOLID principles and give an example of each.",
                "What is the difference between a process and a thread?",
                "How would you design a URL shortening service like bit.ly?",
                "Explain the difference between REST and GraphQL APIs.",
                "What are design patterns? Explain Observer and Factory patterns.",
                "How do you approach writing unit tests for complex business logic?",
                "What is eventual consistency and when is it acceptable?",
                "Explain the concept of microservices vs monolithic architecture.",
                "How would you design a notification system for millions of users?",
                "What is the time complexity of common sorting algorithms?",
                "Explain SQL vs NoSQL and when to use each.",
                "How do you handle technical debt in a growing codebase?",
            ]
        else:
            technical_pool = [
                f"What specific tools and technologies do you use most in your {job_role} work?",
                "Describe the most complex technical problem you have solved. What was your approach?",
                "How do you stay updated with the latest developments in your field?",
                "What is your systematic approach to debugging a problem you have never seen before?",
                "Describe your experience with version control and collaborative development.",
                "How do you approach code reviews — both giving and receiving feedback?",
                "What does good software design mean to you?",
                "How do you estimate the time required for a task you have never done before?",
                "Describe a time when you had to refactor existing code. What was your approach?",
                "How do you ensure the quality of your work before submitting it?",
            ]

        coding = []
        if include_coding and not any(w in role_lower for w in ["hr","product","marketing","designer"]):
            coding_pool = [
                "Given an array of integers, find two numbers that add up to a target sum. What is the time complexity of your solution?",
                "Implement a function to reverse a linked list iteratively and recursively.",
                "Write a function to check if a string is a palindrome without using extra space.",
                "Find the maximum subarray sum using Kadane's algorithm. Explain your approach.",
                "Implement binary search on a sorted array and handle edge cases.",
                "Given a string, find the first non-repeating character. Optimize for time complexity.",
                "Write a function to detect a cycle in a linked list.",
                "Implement a stack using two queues.",
                "Given a binary tree, find its maximum depth.",
                "Write a function to merge two sorted arrays without using extra space.",
                "Find all pairs in an array with a given difference.",
                "Implement a simple LRU cache with get and put operations.",
            ]
            random.shuffle(coding_pool)
            coding = coding_pool[:n]

        # Shuffle all pools and pick n from each for variety
        random.shuffle(technical_pool)
        hr_pool = [
            f"Why are you specifically interested in the {job_role} role?",
            "Where do you see yourself in 3 years? What does your ideal career path look like?",
            "What motivates you most in your daily work?",
            "How do you keep your skills up to date with the rapidly changing tech landscape?",
            "Describe your ideal work environment and team culture.",
            "What is your approach to work-life balance?",
            "How do you handle constructive criticism from your manager or team?",
            "What is your greatest professional achievement so far?",
            "How do you prioritize tasks when everything feels urgent?",
            "What are your salary expectations for this role?",
            "Why are you leaving your current position?",
            "How do you approach working with people who have very different work styles?",
        ]
        behavioral_pool = [
            "Tell me about a time you had to learn a completely new technology under a tight deadline.",
            "Describe a situation where you disagreed with your team lead. How did you handle it?",
            "Give an example of a project where you had to balance quality with a strict deadline.",
            "Tell me about a time you made a significant mistake at work and how you recovered.",
            "Describe a situation where you went beyond your job description to help the team succeed.",
            "Tell me about a time you had to deal with a difficult team member. What did you do?",
            "Give an example of when you identified a problem before it became a crisis.",
            "Tell me about a time you had to explain a complex technical concept to a non-technical person.",
            "Describe a project you are most proud of and why.",
            "Tell me about a time you received negative feedback. How did you respond?",
            "Give an example of a time you had to make a decision with incomplete information.",
            "Describe a situation where you successfully convinced your team to adopt your idea.",
        ]
        random.shuffle(hr_pool)
        random.shuffle(behavioral_pool)
        
        technical = technical_pool[:n]
        hr = hr_pool[:n]
        behavioral = behavioral_pool[:n]

        return {"technical": technical, "hr": hr, "behavioral": behavioral, "coding": coding}

    # ─────────────────────────────────────────────
    # INTERVIEW ANSWER EVALUATION
    # ─────────────────────────────────────────────

    async def evaluate_interview_answer(self, question: str, answer: str, job_role: str, show_answer: bool = False) -> str:
        if show_answer:
            if not self._is_available():
                return f"💡 **Model Answer:** This question tests your understanding of key concepts in {job_role}. Structure your answer using the STAR method with a real example. Focus on quantifiable impact and lessons learned."
            system = "You are an expert interview coach. Provide a detailed model answer and improvement tips."
            prompt = f"""The candidate does not know the answer to this interview question:

Question: {question}
Role: {job_role}

Provide:
1. A clear, detailed model answer (3-5 sentences) that a strong candidate would give
2. Key points the answer MUST include
3. One specific tip to improve on this type of question

Format: Start with 📖 **Model Answer:** then the answer, then \n\n🎯 **Key Points:** then bullet points, then \n\n💡 **Tip:** then the tip."""
            result = await self._generate(prompt, system)
            return result or f"📖 **Model Answer:** Research the key concepts for {question[:80]}... and practice answering with specific examples from your experience."

        word_count = len(answer.strip().split())
        if word_count < 5:
            return "💡 **Too brief** — Please provide a more detailed answer. Interviewers expect at least 2-3 sentences."

        if not self._is_available():
            return self._static_feedback(answer)

        system = (
            "You are a professional interview coach giving concise, specific feedback. "
            "Be encouraging but honest. Keep feedback to 2-3 sentences. "
            "Reference what the candidate actually said in your feedback."
        )

        prompt = f"""Interview question: {question}

Candidate's answer (for {job_role} role):
{answer[:700]}

Give specific feedback starting with ✅ if strong answer or 💡 if needs improvement.
Mention specifically what was good or missing. Suggest one concrete improvement.
2-3 sentences max. Be direct and actionable."""

        result = await self._generate(prompt, system)
        return result if result else self._static_feedback(answer)

    def _static_feedback(self, answer: str) -> str:
        wc = len(answer.strip().split())
        if wc < 15:
            return "💡 **Needs more detail** — Try to expand your answer with a specific example using the STAR method (Situation, Task, Action, Result)."
        if wc > 200:
            return "✅ **Comprehensive answer!** In a real interview, aim to be this detailed but slightly more concise — around 2 minutes speaking time."
        return "✅ **Good answer!** Make sure to quantify your impact when possible (e.g., 'improved by 30%', 'reduced time by 2 hours')."

    # ─────────────────────────────────────────────
    # SKILL GAP ANALYSIS
    # ─────────────────────────────────────────────

    async def analyze_skill_gap(
        self, current_skills: List[str], career_goal: str, resume_text: str = ""
    ) -> Dict[str, Any]:
        if not self._is_available():
            return self._fallback_skill_gap(current_skills, career_goal)

        system = (
            "You are a career development expert. Provide specific, actionable skill gap analysis. "
            "Respond with valid JSON only, no markdown."
        )

        skills_str = ", ".join(current_skills) if current_skills else "not specified"
        resume_ctx = f"\nResume context:\n{resume_text[:500]}" if resume_text.strip() else ""

        prompt = f"""Career goal: {career_goal}
Current skills: {skills_str}{resume_ctx}

Analyze the skill gap and return ONLY this JSON:
{{
  "skill_gaps": ["specific skill 1", "specific skill 2", "specific skill 3", "specific skill 4", "specific skill 5"],
  "priority_skills": ["most critical skill 1", "most critical skill 2", "most critical skill 3"],
  "career_path_tip": "One specific actionable tip for reaching this career goal",
  "estimated_timeline": "Realistic timeline like '3-6 months with consistent practice'"
}}

Rules: skill_gaps must be REAL technical/professional skills (Python, SQL, React, etc.) NOT generic words."""

        response = await self._generate(prompt, system)
        if response:
            try:
                cleaned = re.sub(r"```json|```", "", response).strip()
                match = re.search(r'\{.*\}', cleaned, re.DOTALL)
                if match:
                    return json.loads(match.group())
            except Exception:
                pass

        return self._fallback_skill_gap(current_skills, career_goal)

    def _fallback_skill_gap(self, current_skills: List[str], career_goal: str) -> Dict[str, Any]:
        goal_lower = career_goal.lower()
        known = {s.lower() for s in current_skills}

        if any(w in goal_lower for w in ["data analyst", "data analysis", "business analyst"]):
            gaps = ["SQL", "Tableau or Power BI", "Python (pandas, numpy)", "Statistical Analysis", "Excel (Advanced)", "Data Storytelling"]
        elif any(w in goal_lower for w in ["machine learning", "ml engineer", "data scientist", "ai"]):
            gaps = ["Python (scikit-learn, pytorch)", "Statistics & Probability", "Feature Engineering", "Model Deployment (MLOps)", "Deep Learning Frameworks", "SQL"]
        elif any(w in goal_lower for w in ["full stack", "web developer", "software engineer"]):
            gaps = ["React.js or Angular", "Node.js / Python Backend", "SQL Databases", "REST API Design", "Docker & CI/CD", "System Design"]
        elif any(w in goal_lower for w in ["frontend", "ui developer", "react developer"]):
            gaps = ["React.js (hooks, context)", "TypeScript", "CSS Frameworks (Tailwind)", "Testing (Jest, RTL)", "Performance Optimization", "Accessibility"]
        elif any(w in goal_lower for w in ["backend", "api developer", "python developer"]):
            gaps = ["FastAPI or Django REST", "PostgreSQL/MySQL", "Redis Caching", "Docker", "Authentication (JWT, OAuth)", "System Design"]
        elif any(w in goal_lower for w in ["devops", "cloud", "sre"]):
            gaps = ["AWS/Azure/GCP", "Docker & Kubernetes", "CI/CD Pipelines", "Terraform (IaC)", "Monitoring (Prometheus)", "Linux Administration"]
        else:
            gaps = ["Domain-specific technical skills", "Project management tools", "Communication & presentation", "Problem-solving frameworks"]

        gaps = [g for g in gaps if g.lower() not in known][:6]
        return {
            "skill_gaps": gaps,
            "priority_skills": gaps[:3],
            "career_path_tip": f"Build 2-3 portfolio projects demonstrating your {career_goal} skills to stand out.",
            "estimated_timeline": "3-6 months with consistent daily practice",
        }

    async def generate_course_explanation(self, current_skills, target_skills, course_info) -> str:
        if not self._is_available():
            skills = course_info.get("skills_covered", [])
            return f"This course covers {', '.join(skills[:3])} which are essential for your career goals."

        prompt = (
            f"In 2 sentences, explain why someone with skills [{', '.join(current_skills[:5])}] "
            f"targeting [{', '.join(target_skills[:5])}] should take "
            f'"{course_info.get("title")}" on {course_info.get("platform")}.'
        )
        result = await self._generate(prompt)
        return result or "This course will help bridge your skill gap effectively."

    async def enhance_portfolio_content(self, content: str, content_type: str = "summary") -> str:
        if not self._is_available():
            return content
        prompts = {
            "summary": "Rewrite this professional summary to be more compelling and achievement-focused:",
            "project": "Enhance this project description to highlight impact and measurable results:",
        }
        prompt = f"{prompts.get(content_type, prompts['summary'])}\n\n{content}"
        return await self._generate(prompt) or content
