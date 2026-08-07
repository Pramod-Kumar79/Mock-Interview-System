import json
from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(180), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    # role is either 'candidate' (person who takes mock interviews)
    # or 'recruiter' (person who reviews candidates' performance history)
    role = db.Column(db.String(20), nullable=False, default="candidate")
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    interviews = db.relationship(
        "Interview", backref="user", lazy=True, cascade="all, delete-orphan"
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Interview(db.Model):
    __tablename__ = "interviews"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)

    job_role = db.Column(db.String(120), nullable=False)
    exp_level = db.Column(db.String(50), nullable=True)

    # Stored as JSON text since these are lists of strings
    questions = db.Column(db.Text, nullable=False, default="[]")
    answers = db.Column(db.Text, nullable=False, default="[]")

    emotion_data = db.Column(db.Text, nullable=True)
    suspicious_count = db.Column(db.Integer, nullable=False, default=0)

    review = db.Column(db.Text, nullable=True)
    score = db.Column(db.Integer, nullable=True)  # 0-100 overall performance score
    category_scores = db.Column(db.Text, nullable=True)  # JSON: {"Communication": 80, ...}

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def set_questions(self, qns):
        self.questions = json.dumps(qns or [])

    def set_answers(self, ans):
        self.answers = json.dumps(ans or [])

    def set_category_scores(self, categories):
        self.category_scores = json.dumps(categories or {})

    def get_questions(self):
        try:
            return json.loads(self.questions or "[]")
        except (TypeError, ValueError):
            return []

    def get_answers(self):
        try:
            return json.loads(self.answers or "[]")
        except (TypeError, ValueError):
            return []

    def get_category_scores(self):
        try:
            return json.loads(self.category_scores or "{}")
        except (TypeError, ValueError):
            return {}

    def to_summary_dict(self):
        """Lightweight version for list views (history table, recruiter table)."""
        return {
            "id": self.id,
            "jobRole": self.job_role,
            "expLevel": self.exp_level,
            "score": self.score,
            "suspiciousCount": self.suspicious_count,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

    def to_detail_dict(self):
        """Full version for the detail / drill-down view."""
        data = self.to_summary_dict()
        data.update(
            {
                "questions": self.get_questions(),
                "answers": self.get_answers(),
                "emotionData": self.emotion_data,
                "review": self.review,
                "categoryScores": self.get_category_scores(),
            }
        )
        return data