"""
Course Service — each course tagged with domains, filtered strictly by detected domain.
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from ..models.course import CourseRecommendation
from ..services.ai_service import AIService


class CourseService:
    def __init__(self, db: Session):
        self.db = db
        self.ai_service = AIService()

    # Every course has a "domains" list — only shown if the user's domain matches
    COURSE_DATABASE = [
        # ── DATA ANALYSIS ────────────────────────────────────────────────────
        {"id":1,"title":"Excel for Data Analysis","platform":"YouTube","provider":"Leila Gharani","duration":"6 hours","level":"Beginner","skills_covered":["excel","pivot tables","charts","data analysis"],"rating":4.8,"price":"Free","url":"https://www.youtube.com/playlist?list=PLmejDGrsgFyCn7H-wfBcUAUhGIIAR3RLq","domains":["data_analysis","business_analyst"]},
        {"id":2,"title":"SQL for Data Analysis","platform":"Kaggle","provider":"Kaggle Team","duration":"3 hours","level":"Beginner","skills_covered":["sql","bigquery","data analysis"],"rating":4.9,"price":"Free","url":"https://www.kaggle.com/learn/intro-to-sql","domains":["data_analysis","data_science_ml","data_engineering"]},
        {"id":3,"title":"Data Analysis with Python","platform":"freeCodeCamp","provider":"freeCodeCamp","duration":"4 hours","level":"Beginner","skills_covered":["python","pandas","numpy","matplotlib","data analysis"],"rating":4.8,"price":"Free","url":"https://www.freecodecamp.org/learn/data-analysis-with-python/","domains":["data_analysis","data_science_ml"]},
        {"id":4,"title":"Google Data Analytics Certificate","platform":"Coursera","provider":"Google","duration":"6 months","level":"Beginner","skills_covered":["data analysis","sql","r","tableau","spreadsheets","data visualization"],"rating":4.8,"price":"Free to audit","url":"https://www.coursera.org/professional-certificates/google-data-analytics","domains":["data_analysis"]},
        {"id":5,"title":"Tableau Full Course","platform":"YouTube","provider":"Simplilearn","duration":"7 hours","level":"Beginner","skills_covered":["tableau","data visualization","business intelligence"],"rating":4.6,"price":"Free","url":"https://www.youtube.com/watch?v=aHaOIvR00So","domains":["data_analysis"]},
        {"id":6,"title":"Power BI Full Course","platform":"YouTube","provider":"Guy in a Cube","duration":"8 hours","level":"Beginner","skills_covered":["power bi","dax","data modeling","business intelligence"],"rating":4.7,"price":"Free","url":"https://www.youtube.com/watch?v=AGrl-H87pRU","domains":["data_analysis"]},
        {"id":7,"title":"Statistics for Data Science","platform":"YouTube","provider":"StatQuest with Josh Starmer","duration":"20 hours","level":"Beginner","skills_covered":["statistics","probability","hypothesis testing","regression"],"rating":4.9,"price":"Free","url":"https://www.youtube.com/c/joshstarmer","domains":["data_analysis","data_science_ml"]},
        {"id":8,"title":"Pandas — Kaggle Learn","platform":"Kaggle","provider":"Kaggle Team","duration":"4 hours","level":"Beginner","skills_covered":["pandas","data analysis","python"],"rating":4.9,"price":"Free","url":"https://www.kaggle.com/learn/pandas","domains":["data_analysis","data_science_ml"]},

        # ── DATA SCIENCE & ML ────────────────────────────────────────────────
        {"id":9,"title":"Machine Learning Specialization","platform":"Coursera","provider":"Andrew Ng (DeepLearning.AI)","duration":"3 months","level":"Intermediate","skills_covered":["machine learning","supervised learning","neural networks","scikit-learn"],"rating":4.9,"price":"Free to audit","url":"https://www.coursera.org/specializations/machine-learning-introduction","domains":["data_science_ml"]},
        {"id":10,"title":"Machine Learning A-Z","platform":"Udemy","provider":"Kirill Eremenko & Hadelin de Ponteves","duration":"44 hours","level":"Intermediate","skills_covered":["machine learning","scikit-learn","tensorflow","regression","classification"],"rating":4.5,"price":"~₹499 on sale","url":"https://www.udemy.com/course/machinelearning/","domains":["data_science_ml"]},
        {"id":11,"title":"Intro to Machine Learning","platform":"Kaggle","provider":"Kaggle Team","duration":"3 hours","level":"Beginner","skills_covered":["machine learning","scikit-learn","decision trees"],"rating":4.8,"price":"Free","url":"https://www.kaggle.com/learn/intro-to-machine-learning","domains":["data_science_ml"]},
        {"id":12,"title":"Feature Engineering — Kaggle","platform":"Kaggle","provider":"Kaggle Team","duration":"5 hours","level":"Intermediate","skills_covered":["feature engineering","machine learning","pandas"],"rating":4.8,"price":"Free","url":"https://www.kaggle.com/learn/feature-engineering","domains":["data_science_ml"]},
        {"id":13,"title":"Python for Data Science (IBM)","platform":"Coursera","provider":"IBM","duration":"3 months","level":"Beginner","skills_covered":["python","data science","pandas","numpy","matplotlib"],"rating":4.7,"price":"Free to audit","url":"https://www.coursera.org/learn/python-for-applied-data-science-ai","domains":["data_science_ml","data_analysis"]},

        # ── DEEP LEARNING ────────────────────────────────────────────────────
        {"id":14,"title":"Deep Learning Specialization","platform":"Coursera","provider":"Andrew Ng (DeepLearning.AI)","duration":"5 months","level":"Advanced","skills_covered":["deep learning","neural networks","tensorflow","cnn","rnn","nlp"],"rating":4.9,"price":"Free to audit","url":"https://www.coursera.org/specializations/deep-learning","domains":["deep_learning","data_science_ml"]},
        {"id":15,"title":"PyTorch for Deep Learning — Full Course","platform":"YouTube","provider":"Daniel Bourke","duration":"25 hours","level":"Intermediate","skills_covered":["pytorch","deep learning","neural networks","computer vision"],"rating":4.9,"price":"Free","url":"https://www.youtube.com/watch?v=V_xro1bcAuA","domains":["deep_learning"]},
        {"id":16,"title":"Intro to Deep Learning — Kaggle","platform":"Kaggle","provider":"Kaggle Team","duration":"4 hours","level":"Intermediate","skills_covered":["deep learning","tensorflow","neural networks"],"rating":4.7,"price":"Free","url":"https://www.kaggle.com/learn/intro-to-deep-learning","domains":["deep_learning","data_science_ml"]},
        {"id":17,"title":"NLP Specialization","platform":"Coursera","provider":"DeepLearning.AI","duration":"4 months","level":"Advanced","skills_covered":["nlp","transformers","bert","attention","deep learning"],"rating":4.7,"price":"Free to audit","url":"https://www.coursera.org/specializations/natural-language-processing","domains":["deep_learning"]},
        {"id":18,"title":"Computer Vision with OpenCV","platform":"YouTube","provider":"Nicholas Renotte","duration":"5 hours","level":"Intermediate","skills_covered":["computer vision","opencv","python","deep learning"],"rating":4.7,"price":"Free","url":"https://www.youtube.com/watch?v=01sAkU_NvOY","domains":["deep_learning"]},

        # ── DATA ENGINEERING ─────────────────────────────────────────────────
        {"id":19,"title":"Data Engineering Zoomcamp","platform":"YouTube","provider":"DataTalks.Club","duration":"9 weeks","level":"Intermediate","skills_covered":["data engineering","apache spark","kafka","airflow","bigquery","dbt"],"rating":4.9,"price":"Free","url":"https://github.com/DataTalksClub/data-engineering-zoomcamp","domains":["data_engineering"]},
        {"id":20,"title":"Advanced SQL — Kaggle","platform":"Kaggle","provider":"Kaggle Team","duration":"4 hours","level":"Intermediate","skills_covered":["sql","bigquery","window functions","data engineering"],"rating":4.8,"price":"Free","url":"https://www.kaggle.com/learn/advanced-sql","domains":["data_engineering","data_analysis"]},
        {"id":21,"title":"Apache Spark Full Course","platform":"YouTube","provider":"freeCodeCamp","duration":"5 hours","level":"Intermediate","skills_covered":["apache spark","big data","pyspark","data engineering"],"rating":4.6,"price":"Free","url":"https://www.youtube.com/watch?v=_C8kWso4ne4","domains":["data_engineering"]},

        # ── FRONTEND ─────────────────────────────────────────────────────────
        {"id":22,"title":"HTML & CSS Full Course","platform":"YouTube","provider":"Dave Gray","duration":"11 hours","level":"Beginner","skills_covered":["html","css","flexbox","grid","web development"],"rating":4.9,"price":"Free","url":"https://www.youtube.com/watch?v=mU6anWqZJcc","domains":["frontend","fullstack"]},
        {"id":23,"title":"JavaScript Full Course","platform":"YouTube","provider":"Bro Code","duration":"8 hours","level":"Beginner","skills_covered":["javascript","es6","dom","async","web development"],"rating":4.8,"price":"Free","url":"https://www.youtube.com/watch?v=lfmg-EJ8gm4","domains":["frontend","fullstack"]},
        {"id":24,"title":"React — The Complete Guide","platform":"Udemy","provider":"Maximilian Schwarzmüller","duration":"68 hours","level":"Intermediate","skills_covered":["react","hooks","redux","context api","typescript"],"rating":4.7,"price":"~₹499 on sale","url":"https://www.udemy.com/course/react-the-complete-guide-incl-redux/","domains":["frontend","fullstack"]},
        {"id":25,"title":"React Full Course","platform":"YouTube","provider":"Dave Gray","duration":"9 hours","level":"Beginner","skills_covered":["react","hooks","components","javascript"],"rating":4.8,"price":"Free","url":"https://www.youtube.com/watch?v=RVFAyFWO4go","domains":["frontend"]},
        {"id":26,"title":"TypeScript Full Course","platform":"YouTube","provider":"Hitesh Choudhary","duration":"5 hours","level":"Intermediate","skills_covered":["typescript","javascript","types","interfaces"],"rating":4.7,"price":"Free","url":"https://www.youtube.com/watch?v=30LWjhZzg50","domains":["frontend","fullstack"]},
        {"id":27,"title":"Full Stack Web Development","platform":"freeCodeCamp","provider":"freeCodeCamp","duration":"300 hours","level":"Beginner","skills_covered":["html","css","javascript","react","nodejs","mongodb"],"rating":4.8,"price":"Free","url":"https://www.freecodecamp.org/learn/","domains":["fullstack","frontend","backend"]},

        # ── BACKEND ──────────────────────────────────────────────────────────
        {"id":28,"title":"Node.js, Express & MongoDB Bootcamp","platform":"Udemy","provider":"Jonas Schmedtmann","duration":"42 hours","level":"Intermediate","skills_covered":["nodejs","express","mongodb","rest api","authentication"],"rating":4.8,"price":"~₹499 on sale","url":"https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/","domains":["backend","fullstack"]},
        {"id":29,"title":"FastAPI Full Course","platform":"YouTube","provider":"Amigoscode","duration":"3 hours","level":"Intermediate","skills_covered":["fastapi","python","rest api","sqlalchemy"],"rating":4.7,"price":"Free","url":"https://www.youtube.com/watch?v=7t2alSnE2-I","domains":["backend"]},
        {"id":30,"title":"Django for Beginners","platform":"YouTube","provider":"Dennis Ivy","duration":"4 hours","level":"Beginner","skills_covered":["django","python","web development","rest api"],"rating":4.7,"price":"Free","url":"https://www.youtube.com/watch?v=nGIg40xs9e4","domains":["backend"]},
        {"id":31,"title":"PostgreSQL Full Course","platform":"YouTube","provider":"Amigoscode","duration":"4 hours","level":"Intermediate","skills_covered":["postgresql","sql","database","backend"],"rating":4.7,"price":"Free","url":"https://www.youtube.com/watch?v=5hzZtqCNQKk","domains":["backend","fullstack","data_engineering"]},

        # ── DEVOPS & CLOUD ────────────────────────────────────────────────────
        {"id":32,"title":"Docker Tutorial for Beginners","platform":"YouTube","provider":"TechWorld with Nana","duration":"3 hours","level":"Beginner","skills_covered":["docker","containers","devops"],"rating":4.9,"price":"Free","url":"https://www.youtube.com/watch?v=3c-iBn73dDE","domains":["devops","fullstack","backend"]},
        {"id":33,"title":"Kubernetes Tutorial for Beginners","platform":"YouTube","provider":"TechWorld with Nana","duration":"4 hours","level":"Intermediate","skills_covered":["kubernetes","devops","containers","orchestration"],"rating":4.9,"price":"Free","url":"https://www.youtube.com/watch?v=X48VuDVv0do","domains":["devops"]},
        {"id":34,"title":"AWS Full Course","platform":"YouTube","provider":"freeCodeCamp","duration":"5 hours","level":"Beginner","skills_covered":["aws","cloud computing","ec2","s3","rds"],"rating":4.7,"price":"Free","url":"https://www.youtube.com/watch?v=ubCNZFXGKsI","domains":["devops","data_engineering"]},
        {"id":35,"title":"AWS Certified Solutions Architect","platform":"Udemy","provider":"Stephane Maarek","duration":"27 hours","level":"Intermediate","skills_covered":["aws","cloud","architecture","ec2","s3","lambda"],"rating":4.7,"price":"~₹499 on sale","url":"https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/","domains":["devops"]},
        {"id":36,"title":"Linux Command Line Full Course","platform":"YouTube","provider":"freeCodeCamp","duration":"5 hours","level":"Beginner","skills_covered":["linux","bash","command line","scripting"],"rating":4.8,"price":"Free","url":"https://www.youtube.com/watch?v=ZtqBQ68cfJc","domains":["devops","backend","software_engineering"]},

        # ── MOBILE ───────────────────────────────────────────────────────────
        {"id":37,"title":"Flutter & Dart — The Complete Guide","platform":"Udemy","provider":"Maximilian Schwarzmüller","duration":"42 hours","level":"Intermediate","skills_covered":["flutter","dart","mobile development","ios","android"],"rating":4.7,"price":"~₹499 on sale","url":"https://www.udemy.com/course/learn-flutter-dart-to-build-ios-android-apps/","domains":["mobile"]},
        {"id":38,"title":"Android Development with Kotlin","platform":"YouTube","provider":"Philipp Lackner","duration":"11 hours","level":"Beginner","skills_covered":["android","kotlin","jetpack compose","mobile development"],"rating":4.8,"price":"Free","url":"https://www.youtube.com/watch?v=EExSSotojVI","domains":["mobile"]},
        {"id":39,"title":"iOS App Development Bootcamp","platform":"Udemy","provider":"Dr. Angela Yu","duration":"55 hours","level":"Beginner","skills_covered":["ios","swift","xcode","mobile development"],"rating":4.8,"price":"~₹499 on sale","url":"https://www.udemy.com/course/ios-13-app-development-bootcamp/","domains":["mobile"]},

        # ── GAME DEV ─────────────────────────────────────────────────────────
        {"id":40,"title":"Unity Game Development — Complete Guide","platform":"Udemy","provider":"GameDev.tv Team","duration":"60 hours","level":"Beginner","skills_covered":["unity","c#","game development","2d games","3d games"],"rating":4.7,"price":"~₹499 on sale","url":"https://www.udemy.com/course/unitycourse/","domains":["game_dev"]},
        {"id":41,"title":"Godot Game Engine — Full Course","platform":"YouTube","provider":"GDQuest","duration":"8 hours","level":"Beginner","skills_covered":["godot","gdscript","game development","2d games"],"rating":4.7,"price":"Free","url":"https://www.youtube.com/watch?v=Luf2Kr5s3BM","domains":["game_dev"]},
        {"id":42,"title":"Unreal Engine 5 — Beginner Tutorial","platform":"YouTube","provider":"Unreal Sensei","duration":"6 hours","level":"Beginner","skills_covered":["unreal engine","blueprints","game development","3d games"],"rating":4.7,"price":"Free","url":"https://www.youtube.com/watch?v=k-zMkzmduqI","domains":["game_dev"]},
        {"id":43,"title":"C++ for Game Development","platform":"YouTube","provider":"The Cherno","duration":"30 hours","level":"Intermediate","skills_covered":["c++","game development","programming","memory management"],"rating":4.8,"price":"Free","url":"https://www.youtube.com/playlist?list=PLlrATfBNZ98dudnM48yfGUldqGD0S4FFb","domains":["game_dev"]},
        {"id":44,"title":"Python Game Development with Pygame","platform":"YouTube","provider":"Tech With Tim","duration":"5 hours","level":"Beginner","skills_covered":["python","pygame","game development","2d games"],"rating":4.6,"price":"Free","url":"https://www.youtube.com/playlist?list=PLzMcBGfZo4-lp3jAExUCewBfMx3UZFkh5","domains":["game_dev"]},

        # ── CYBERSECURITY ────────────────────────────────────────────────────
        {"id":45,"title":"Google Cybersecurity Certificate","platform":"Coursera","provider":"Google","duration":"6 months","level":"Beginner","skills_covered":["cybersecurity","networking","linux","siem","python"],"rating":4.8,"price":"Free to audit","url":"https://www.coursera.org/professional-certificates/google-cybersecurity","domains":["cybersecurity"]},
        {"id":46,"title":"Ethical Hacking Full Course","platform":"YouTube","provider":"freeCodeCamp","duration":"15 hours","level":"Intermediate","skills_covered":["cybersecurity","ethical hacking","penetration testing","networking"],"rating":4.7,"price":"Free","url":"https://www.youtube.com/watch?v=3Kq1MIfTWCE","domains":["cybersecurity"]},
        {"id":47,"title":"CompTIA Security+ Exam Prep","platform":"YouTube","provider":"Professor Messer","duration":"20 hours","level":"Intermediate","skills_covered":["cybersecurity","network security","cryptography","risk management"],"rating":4.8,"price":"Free","url":"https://www.youtube.com/playlist?list=PLG49S3nxzAnl4QDVqK-hOnoqcSKEIDDuv","domains":["cybersecurity"]},

        # ── SOFTWARE ENGINEERING / GENERAL ───────────────────────────────────
        {"id":48,"title":"CS50: Intro to Computer Science","platform":"edX","provider":"Harvard University","duration":"12 weeks","level":"Beginner","skills_covered":["computer science","algorithms","c","python","data structures"],"rating":4.9,"price":"Free to audit","url":"https://cs50.harvard.edu/x/","domains":["software_engineering","general"]},
        {"id":49,"title":"Data Structures and Algorithms","platform":"YouTube","provider":"freeCodeCamp","duration":"8 hours","level":"Intermediate","skills_covered":["data structures","algorithms","python","problem solving"],"rating":4.8,"price":"Free","url":"https://www.youtube.com/watch?v=pkYVOmU3MgA","domains":["software_engineering","game_dev","general"]},
        {"id":50,"title":"Git & GitHub Full Course","platform":"YouTube","provider":"Traversy Media","duration":"1.5 hours","level":"Beginner","skills_covered":["git","github","version control","branching"],"rating":4.8,"price":"Free","url":"https://www.youtube.com/watch?v=SWYqp7iY_Tc","domains":["software_engineering","general","fullstack","backend","frontend","devops","data_science_ml","data_engineering"]},
        {"id":51,"title":"System Design Full Course","platform":"YouTube","provider":"Gaurav Sen","duration":"10 hours","level":"Advanced","skills_covered":["system design","architecture","scalability","microservices"],"rating":4.9,"price":"Free","url":"https://www.youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX","domains":["software_engineering","backend","fullstack","devops"]},
        {"id":52,"title":"LeetCode DSA Masterclass","platform":"YouTube","provider":"NeetCode","duration":"15 hours","level":"Intermediate","skills_covered":["data structures","algorithms","leetcode","problem solving","coding interviews"],"rating":4.9,"price":"Free","url":"https://www.youtube.com/@NeetCode","domains":["software_engineering","game_dev","frontend","backend","fullstack","data_science_ml"]},
    ]

    PLATFORM_META = {
        "Coursera":     {"icon": "🎓", "color": "bg-blue-500/10 text-blue-600"},
        "Udemy":        {"icon": "🎯", "color": "bg-purple-500/10 text-purple-600"},
        "YouTube":      {"icon": "▶️",  "color": "bg-red-500/10 text-red-600"},
        "Kaggle":       {"icon": "📊", "color": "bg-cyan-500/10 text-cyan-600"},
        "freeCodeCamp": {"icon": "🔥", "color": "bg-orange-500/10 text-orange-600"},
        "edX":          {"icon": "🏛️", "color": "bg-red-700/10 text-red-700"},
    }

    async def generate_course_recommendations(
        self,
        user_id: int,
        current_skills: List[str],
        target_skills: List[str],
        career_goal: str,
        domain: str = "general",
    ) -> CourseRecommendation:

        current_lower = {s.lower() for s in current_skills}
        all_gap_terms = [s.lower() for s in target_skills]
        goal_words    = career_goal.lower().split()

        # Filter courses to the user's domain FIRST (strict)
        domain_courses = [c for c in self.COURSE_DATABASE if domain in c.get("domains", [])]
        # If no courses for that domain, fall back to general
        if not domain_courses:
            domain_courses = [c for c in self.COURSE_DATABASE if "general" in c.get("domains", [])]

        # Score within domain
        scored = []
        for course in domain_courses:
            skills_covered = [s.lower() for s in course["skills_covered"]]
            matches = [t for t in all_gap_terms if any(t in cs or cs in t for cs in skills_covered)]
            # Also match goal words
            goal_matches = [w for w in goal_words if any(w in cs for cs in skills_covered) and len(w) > 3]
            total_matches = list(set(matches + goal_matches))
            if not total_matches:
                # Still include course if it's in the right domain — relevance = 0.1
                relevance = 0.1
            else:
                relevance = len(total_matches) / max(len(all_gap_terms) + 1, 1)
            entry = {
                **course,
                "matching_skills": total_matches[:5],
                "relevance_score": round(relevance, 2),
                "platform_meta": self.PLATFORM_META.get(course["platform"], {"icon": "📖", "color": ""}),
            }
            scored.append(entry)

        # Sort by relevance then rating
        scored.sort(key=lambda x: (x["relevance_score"], x["rating"]), reverse=True)
        top = scored[:8]

        # AI explanations for top 3
        for course in top[:3]:
            course["reason"] = await self.ai_service.generate_course_explanation(
                current_skills=current_skills,
                target_skills=target_skills,
                course_info=course,
            )
        for course in top[3:]:
            ms = course.get("matching_skills", [])
            course["reason"] = f"Covers {', '.join(ms[:3])} — relevant to your {career_goal} goal." if ms else f"Recommended for {career_goal}."

        recommendation = CourseRecommendation(
            user_id=user_id,
            career_goal=career_goal,
            current_skills=current_skills,
            target_skills=target_skills,
            skill_gaps=target_skills,
            recommended_courses=top,
            metadata_={"domain": domain, "total_analyzed": len(domain_courses)},
        )
        self.db.add(recommendation)
        self.db.commit()
        self.db.refresh(recommendation)
        return recommendation

    def get_user_recommendations(self, user_id: int):
        return self.db.query(CourseRecommendation).filter(CourseRecommendation.user_id == user_id).all()

    def get_recommendation_stats(self, user_id: int) -> dict:
        recs = self.get_user_recommendations(user_id)
        return {"total_recommendations": len(recs)}
