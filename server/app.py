# from flask import Flask, jsonify, request, g
# import google.generativeai as genai
# from functions.question_generation import generate_questions
# # from functions.emotion_analysis import analyze_fun
# from functions.review_generation import gen_review
# from flask_cors import CORS, cross_origin
# from dotenv import load_dotenv
# import os

# from models import db, User, Interview
# from auth import generate_token, token_required, role_required

# app = Flask(__name__)
# CORS(app)

# load_dotenv()  # Loads the variables from the .env file
# gemini_api_key = os.getenv('GEMINI_API_KEY3')

# # ---------------------------------------------------------------------------
# # Database configuration
# # By default this uses a local SQLite file, which is enough for development
# # and for demoing the app. For a real production deployment (e.g. Vercel,
# # which has a read-only filesystem), set the DATABASE_URL env var to a
# # managed Postgres/MySQL connection string.
# # ---------------------------------------------------------------------------
# database_url = os.getenv('DATABASE_URL', 'sqlite:///' + os.path.join(os.path.dirname(os.path.abspath(__file__)), 'mock_interview.db'))
# app.config['SQLALCHEMY_DATABASE_URI'] = database_url
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# db.init_app(app)

# with app.app_context():
#     db.create_all()

# # Initialize the Generative AI model and chat session globally
# genai.configure(api_key=gemini_api_key)

# model = genai.GenerativeModel(model_name="gemini-2.5-flash")
# @app.before_request
# def before_request():
#     g.model = model

# @app.route("/")
# def home():
#     return "Weclome to Mock-Interview-System/Server", 200

# @app.errorhandler(404)
# def page_not_found(e):
#     return jsonify({"status": 404, "message": "Not Found"}), 404


# # ---------------------------------------------------------------------------
# # Auth routes
# # ---------------------------------------------------------------------------
# @app.route('/api/auth/register', methods=['POST'])
# def register():
#     try:
#         data = request.get_json()
#         name = (data.get('name') or '').strip()
#         email = (data.get('email') or '').strip().lower()
#         password = data.get('password') or ''
#         role = data.get('role') or 'candidate'

#         if role not in ('candidate', 'recruiter'):
#             return jsonify({'errorMsg': 'Role must be either candidate or recruiter'}), 400
#         if not name or not email or not password:
#             return jsonify({'errorMsg': 'Name, email and password are required'}), 400
#         if len(password) < 6:
#             return jsonify({'errorMsg': 'Password must be at least 6 characters'}), 400

#         if User.query.filter_by(email=email).first():
#             return jsonify({'errorMsg': 'An account with this email already exists'}), 400

#         user = User(name=name, email=email, role=role)
#         user.set_password(password)
#         db.session.add(user)
#         db.session.commit()

#         token = generate_token(user)
#         return jsonify({'token': token, 'user': user.to_dict()}), 201
#     except Exception as e:
#         print(f"Error occurred while registering: {e}")
#         return jsonify({'errorMsg': 'Something went wrong'}), 400


# @app.route('/api/auth/login', methods=['POST'])
# def login():
#     try:
#         data = request.get_json()
#         email = (data.get('email') or '').strip().lower()
#         password = data.get('password') or ''

#         user = User.query.filter_by(email=email).first()
#         if not user or not user.check_password(password):
#             return jsonify({'errorMsg': 'Invalid email or password'}), 401

#         token = generate_token(user)
#         return jsonify({'token': token, 'user': user.to_dict()}), 200
#     except Exception as e:
#         print(f"Error occurred while logging in: {e}")
#         return jsonify({'errorMsg': 'Something went wrong'}), 400


# @app.route('/api/auth/me', methods=['GET'])
# @token_required
# def me():
#     return jsonify({'user': g.current_user.to_dict()}), 200


# # ---------------------------------------------------------------------------
# # Interview routes
# # ---------------------------------------------------------------------------
# @app.route('/api/get-questions', methods=['POST'])
# def ask_questions():
#     try:
#         data = request.get_json()
#         job_role = data['job_role']
#         experience_lvl = data['experience_lvl']
#         response = generate_questions(job_role, experience_lvl)

#         # if not list then error
#         if not isinstance(response, list):
#             return jsonify({'errorMsg': response}), 400
#         else: # success
#             return jsonify({'job_role' : job_role, 'exp_level' : experience_lvl, 'qtns': response}), 200
#     except Exception as e:
#         print(f"Error occurred while generating question: {e}")
#         return jsonify({'errorMsg': "Something went wrong"}), 400


# @app.route('/api/get-review', methods=['POST'])
# def get_review():
#     try:
#         data = request.get_json()
#         job_role = data['job_role']
#         # experience_lvl = data['experience_lvl']
#         qns = data['qns']
#         ans = data['ans']
#         emotion = data['emotion']
#         suspiciousCount = data['suspiciousCount']

#         # get review
#         review, score = gen_review(job_role, qns, ans, emotion, suspiciousCount)

#         return jsonify({'review': review, 'score': score})
#     except Exception as e:
#         print(f"Error occurred while generating review: {e}")
#         return jsonify({'errorMsg': "Something went wrong"}), 400


# @app.route('/api/interview/save', methods=['POST'])
# @token_required
# def save_interview():
#     try:
#         data = request.get_json()

#         interview = Interview(
#             user_id=g.current_user.id,
#             job_role=data.get('job_role', ''),
#             exp_level=data.get('exp_level', ''),
#             emotion_data=str(data.get('emotion', '')),
#             suspicious_count=int(data.get('suspiciousCount', 0) or 0),
#             review=data.get('review', ''),
#             score=data.get('score'),
#         )
#         interview.set_questions(data.get('qns', []))
#         interview.set_answers(data.get('ans', []))

#         db.session.add(interview)
#         db.session.commit()

#         return jsonify({'interview': interview.to_summary_dict()}), 201
#     except Exception as e:
#         print(f"Error occurred while saving interview: {e}")
#         return jsonify({'errorMsg': "Something went wrong while saving your interview"}), 400


# @app.route('/api/interview/history', methods=['GET'])
# @token_required
# def my_history():
#     try:
#         interviews = (
#             Interview.query.filter_by(user_id=g.current_user.id)
#             .order_by(Interview.created_at.desc())
#             .all()
#         )
#         return jsonify({'interviews': [i.to_summary_dict() for i in interviews]}), 200
#     except Exception as e:
#         print(f"Error occurred while fetching history: {e}")
#         return jsonify({'errorMsg': "Something went wrong"}), 400


# @app.route('/api/interview/history/<int:interview_id>', methods=['GET'])
# @token_required
# def my_history_detail(interview_id):
#     try:
#         interview = Interview.query.get(interview_id)
#         if not interview:
#             return jsonify({'errorMsg': 'Interview not found'}), 404

#         # Only the owner or a recruiter may view the full detail
#         if interview.user_id != g.current_user.id and g.current_user.role != 'recruiter':
#             return jsonify({'errorMsg': 'You are not authorized to view this interview'}), 403

#         return jsonify({'interview': interview.to_detail_dict()}), 200
#     except Exception as e:
#         print(f"Error occurred while fetching interview detail: {e}")
#         return jsonify({'errorMsg': "Something went wrong"}), 400


# # ---------------------------------------------------------------------------
# # Recruiter routes
# # ---------------------------------------------------------------------------
# @app.route('/api/recruiter/candidates', methods=['GET'])
# @token_required
# @role_required('recruiter')
# def recruiter_candidates():
#     try:
#         candidates = User.query.filter_by(role='candidate').order_by(User.name.asc()).all()

#         result = []
#         for c in candidates:
#             interviews = c.interviews
#             total = len(interviews)
#             scored = [i.score for i in interviews if i.score is not None]
#             avg_score = round(sum(scored) / len(scored)) if scored else None
#             last_interview = max((i.created_at for i in interviews), default=None)

#             result.append({
#                 'id': c.id,
#                 'name': c.name,
#                 'email': c.email,
#                 'totalInterviews': total,
#                 'avgScore': avg_score,
#                 'lastInterviewAt': last_interview.isoformat() if last_interview else None,
#             })

#         return jsonify({'candidates': result}), 200
#     except Exception as e:
#         print(f"Error occurred while fetching candidates: {e}")
#         return jsonify({'errorMsg': "Something went wrong"}), 400


# @app.route('/api/recruiter/candidates/<int:user_id>/history', methods=['GET'])
# @token_required
# @role_required('recruiter')
# def recruiter_candidate_history(user_id):
#     try:
#         candidate = User.query.get(user_id)
#         if not candidate or candidate.role != 'candidate':
#             return jsonify({'errorMsg': 'Candidate not found'}), 404

#         interviews = (
#             Interview.query.filter_by(user_id=user_id)
#             .order_by(Interview.created_at.desc())
#             .all()
#         )

#         return jsonify({
#             'candidate': candidate.to_dict(),
#             'interviews': [i.to_summary_dict() for i in interviews],
#         }), 200
#     except Exception as e:
#         print(f"Error occurred while fetching candidate history: {e}")
#         return jsonify({'errorMsg': "Something went wrong"}), 400


# # Emotion analysis using backend, not used anymore
# # @app.route('/api/analyze-emotions', methods=['POST'])
# # def analyze_emotions():
# #     try:
# #         data = request.get_json()
# #         frames = data['frames']
# #         response = analyze_fun(frames)

# #         return jsonify({'response': response})
# #     except Exception as e:
# #         print(f"Error occurred while generating emotion analysis data: {e}")
# #         return jsonify({'errorMsg': "Something went wrong"}), 400


# # Not used anymore since emotion analysis done in front end itself
# # @app.route('/api/get-review-old', methods=['POST'])
# # def get_review_old():
# #     try:
# #         data = request.get_json()
# #         job_role = data['job_role']
# #         # experience_lvl = data['experience_lvl']
# #         qns = data['qns']
# #         ans = data['ans']
# #         frames = data['frames']

# #         # get emotion analysis
# #         emotion = analyze_fun(frames)

# #         # get review
# #         review = gen_review(job_role,qns,ans,emotion)

# #         return jsonify({'response': review})
# #     except Exception as e:
# #         print(f"Error occurred while generating review: {e}")
# #         return jsonify({'errorMsg': "Something went wrong"}), 400


# if __name__ == '__main__':
#     app.run(debug=True)


from flask import Flask, jsonify, request, g
import google.generativeai as genai
from functions.question_generation import generate_questions
# from functions.emotion_analysis import analyze_fun
from functions.review_generation import gen_review
from flask_cors import CORS, cross_origin
from dotenv import load_dotenv
import os

from models import db, User, Interview
from auth import generate_token, token_required, role_required

app = Flask(__name__)
CORS(app)

load_dotenv()  # Loads the variables from the .env file
gemini_api_key = os.getenv('GEMINI_API_KEY3')

# ---------------------------------------------------------------------------
# Database configuration
# By default this uses a local SQLite file, which is enough for development
# and for demoing the app. For a real production deployment (e.g. Vercel,
# which has a read-only filesystem), set the DATABASE_URL env var to a
# managed Postgres/MySQL connection string.
# ---------------------------------------------------------------------------
database_url = os.getenv('DATABASE_URL', 'sqlite:///' + os.path.join(os.path.dirname(os.path.abspath(__file__)), 'mock_interview.db'))
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()

# Initialize the Generative AI model and chat session globally
genai.configure(api_key=gemini_api_key)

model = genai.GenerativeModel(model_name="gemini-2.5-flash")
@app.before_request
def before_request():
    g.model = model

@app.route("/")
def home():
    return "Weclome to Mock-Interview-System/Server", 200

@app.errorhandler(404)
def page_not_found(e):
    return jsonify({"status": 404, "message": "Not Found"}), 404


# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        name = (data.get('name') or '').strip()
        email = (data.get('email') or '').strip().lower()
        password = data.get('password') or ''
        role = data.get('role') or 'candidate'

        if role not in ('candidate', 'recruiter'):
            return jsonify({'errorMsg': 'Role must be either candidate or recruiter'}), 400
        if not name or not email or not password:
            return jsonify({'errorMsg': 'Name, email and password are required'}), 400
        if len(password) < 6:
            return jsonify({'errorMsg': 'Password must be at least 6 characters'}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({'errorMsg': 'An account with this email already exists'}), 400

        user = User(name=name, email=email, role=role)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        token = generate_token(user)
        return jsonify({'token': token, 'user': user.to_dict()}), 201
    except Exception as e:
        print(f"Error occurred while registering: {e}")
        return jsonify({'errorMsg': 'Something went wrong'}), 400


@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = (data.get('email') or '').strip().lower()
        password = data.get('password') or ''

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return jsonify({'errorMsg': 'Invalid email or password'}), 401

        token = generate_token(user)
        return jsonify({'token': token, 'user': user.to_dict()}), 200
    except Exception as e:
        print(f"Error occurred while logging in: {e}")
        return jsonify({'errorMsg': 'Something went wrong'}), 400


@app.route('/api/auth/me', methods=['GET'])
@token_required
def me():
    return jsonify({'user': g.current_user.to_dict()}), 200


# ---------------------------------------------------------------------------
# Interview routes
# ---------------------------------------------------------------------------
@app.route('/api/get-questions', methods=['POST'])
def ask_questions():
    try:
        data = request.get_json()
        job_role = data['job_role']
        experience_lvl = data['experience_lvl']
        response = generate_questions(job_role, experience_lvl)

        # if not list then error
        if not isinstance(response, list):
            return jsonify({'errorMsg': response}), 400
        else: # success
            return jsonify({'job_role' : job_role, 'exp_level' : experience_lvl, 'qtns': response}), 200
    except Exception as e:
        print(f"Error occurred while generating question: {e}")
        return jsonify({'errorMsg': "Something went wrong"}), 400


@app.route('/api/get-review', methods=['POST'])
def get_review():
    try:
        data = request.get_json()
        job_role = data['job_role']
        # experience_lvl = data['experience_lvl']
        qns = data['qns']
        ans = data['ans']
        emotion = data['emotion']
        suspiciousCount = data['suspiciousCount']

        # get review
        review, score, categories = gen_review(job_role, qns, ans, emotion, suspiciousCount)

        return jsonify({'review': review, 'score': score, 'categoryScores': categories})
    except Exception as e:
        print(f"Error occurred while generating review: {e}")
        return jsonify({'errorMsg': "Something went wrong"}), 400


@app.route('/api/interview/save', methods=['POST'])
@token_required
def save_interview():
    try:
        data = request.get_json()

        interview = Interview(
            user_id=g.current_user.id,
            job_role=data.get('job_role', ''),
            exp_level=data.get('exp_level', ''),
            emotion_data=str(data.get('emotion', '')),
            suspicious_count=int(data.get('suspiciousCount', 0) or 0),
            review=data.get('review', ''),
            score=data.get('score'),
        )
        interview.set_questions(data.get('qns', []))
        interview.set_answers(data.get('ans', []))
        interview.set_category_scores(data.get('categoryScores', {}))

        db.session.add(interview)
        db.session.commit()

        return jsonify({'interview': interview.to_summary_dict()}), 201
    except Exception as e:
        print(f"Error occurred while saving interview: {e}")
        return jsonify({'errorMsg': "Something went wrong while saving your interview"}), 400


@app.route('/api/interview/history', methods=['GET'])
@token_required
def my_history():
    try:
        interviews = (
            Interview.query.filter_by(user_id=g.current_user.id)
            .order_by(Interview.created_at.desc())
            .all()
        )
        return jsonify({'interviews': [i.to_summary_dict() for i in interviews]}), 200
    except Exception as e:
        print(f"Error occurred while fetching history: {e}")
        return jsonify({'errorMsg': "Something went wrong"}), 400


@app.route('/api/interview/history/<int:interview_id>', methods=['GET'])
@token_required
def my_history_detail(interview_id):
    try:
        interview = Interview.query.get(interview_id)
        if not interview:
            return jsonify({'errorMsg': 'Interview not found'}), 404

        # Only the owner or a recruiter may view the full detail
        if interview.user_id != g.current_user.id and g.current_user.role != 'recruiter':
            return jsonify({'errorMsg': 'You are not authorized to view this interview'}), 403

        return jsonify({'interview': interview.to_detail_dict()}), 200
    except Exception as e:
        print(f"Error occurred while fetching interview detail: {e}")
        return jsonify({'errorMsg': "Something went wrong"}), 400


# ---------------------------------------------------------------------------
# Recruiter routes
# ---------------------------------------------------------------------------
@app.route('/api/recruiter/candidates', methods=['GET'])
@token_required
@role_required('recruiter')
def recruiter_candidates():
    try:
        candidates = User.query.filter_by(role='candidate').order_by(User.name.asc()).all()

        result = []
        for c in candidates:
            interviews = c.interviews
            total = len(interviews)
            scored = [i.score for i in interviews if i.score is not None]
            avg_score = round(sum(scored) / len(scored)) if scored else None
            last_interview = max((i.created_at for i in interviews), default=None)

            result.append({
                'id': c.id,
                'name': c.name,
                'email': c.email,
                'totalInterviews': total,
                'avgScore': avg_score,
                'lastInterviewAt': last_interview.isoformat() if last_interview else None,
            })

        return jsonify({'candidates': result}), 200
    except Exception as e:
        print(f"Error occurred while fetching candidates: {e}")
        return jsonify({'errorMsg': "Something went wrong"}), 400


@app.route('/api/recruiter/candidates/<int:user_id>/history', methods=['GET'])
@token_required
@role_required('recruiter')
def recruiter_candidate_history(user_id):
    try:
        candidate = User.query.get(user_id)
        if not candidate or candidate.role != 'candidate':
            return jsonify({'errorMsg': 'Candidate not found'}), 404

        interviews = (
            Interview.query.filter_by(user_id=user_id)
            .order_by(Interview.created_at.desc())
            .all()
        )

        return jsonify({
            'candidate': candidate.to_dict(),
            'interviews': [i.to_summary_dict() for i in interviews],
        }), 200
    except Exception as e:
        print(f"Error occurred while fetching candidate history: {e}")
        return jsonify({'errorMsg': "Something went wrong"}), 400


# Emotion analysis using backend, not used anymore
# @app.route('/api/analyze-emotions', methods=['POST'])
# def analyze_emotions():
#     try:
#         data = request.get_json()
#         frames = data['frames']
#         response = analyze_fun(frames)

#         return jsonify({'response': response})
#     except Exception as e:
#         print(f"Error occurred while generating emotion analysis data: {e}")
#         return jsonify({'errorMsg': "Something went wrong"}), 400


# Not used anymore since emotion analysis done in front end itself
# @app.route('/api/get-review-old', methods=['POST'])
# def get_review_old():
#     try:
#         data = request.get_json()
#         job_role = data['job_role']
#         # experience_lvl = data['experience_lvl']
#         qns = data['qns']
#         ans = data['ans']
#         frames = data['frames']

#         # get emotion analysis
#         emotion = analyze_fun(frames)

#         # get review
#         review = gen_review(job_role,qns,ans,emotion)

#         return jsonify({'response': review})
#     except Exception as e:
#         print(f"Error occurred while generating review: {e}")
#         return jsonify({'errorMsg': "Something went wrong"}), 400


if __name__ == '__main__':
    app.run(debug=True)