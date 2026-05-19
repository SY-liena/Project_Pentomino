import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

# .env 파일에 저장된 API 키를 불러옵니다.
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# API 키 검증
if not GOOGLE_API_KEY:
    raise ValueError("❌ GOOGLE_API_KEY 환경변수가 설정되지 않았습니다. Render 대시보드에서 설정하세요.")

# Gemini AI 설정
genai.configure(api_key=GOOGLE_API_KEY)

# 사용 가능한 모델 확인 및 선택
MODEL_NAME = 'gemini-1.5-flash'  # 기본값
try:
    models = list(genai.list_models())
    text_models = []
    for m in models:
        supported_methods = getattr(m, 'supported_generation_methods', [])
        if supported_methods and 'generateContent' in supported_methods:
            text_models.append(m)

    if text_models:
        selected = None
        # 우선 gemini-1.5-flash가 있으면 선택하고, 없으면 첫 번째 지원 모델을 선택
        for m in text_models:
            if 'gemini-1.5-flash' in getattr(m, 'name', ''):
                selected = m
                break
        if not selected:
            selected = text_models[0]

        MODEL_NAME = selected.name.split('/')[-1]
        print(f"Using model: {MODEL_NAME}")
    else:
        print(f"No supported text generation models found, using fallback: {MODEL_NAME}")
except Exception as e:
    print(f"Failed to list models: {e}, using fallback: {MODEL_NAME}")

model = genai.GenerativeModel(MODEL_NAME)
DEBUG = os.getenv('DEBUG', 'false').lower() in ('1', 'true', 'yes')

app = Flask(__name__)

# CORS 활성화 (모든 출처 허용)
CORS(app)

# OPTIONS 요청에 대한 핸들러
@app.route('/ask-ai', methods=['OPTIONS'])
def handle_options():
    return '', 204

@app.route('/ask-ai', methods=['POST'])
def ask_ai():
    try:
        # 프론트엔드(JS)에서 보낸 JSON 데이터를 받습니다.
        data = request.get_json(silent=True)
        if not data or not isinstance(data, dict):
            print("[ERROR] Invalid JSON format received")
            return jsonify({"reply": "잘못된 요청입니다. JSON 형식으로 다시 시도해 주세요."}), 400

        user_message = (data.get("message") or "").strip()
        if not user_message:
            print("[ERROR] No message provided")
            return jsonify({"reply": "질문을 입력해 주세요!"}), 400

        print(f"[INFO] Processing message: {user_message[:50]}...")

        # 전공 가이드에 특화된 답변을 하도록 유도합니다.
        prompt = f"""
        너는 대학교 전공 로드맵 가이드 AI야. 학생의 질문에 대해 친절하고 전문적으로 답변해줘.
        질문: {user_message}
        """

        # Gemini AI 응답 생성
        print(f"[INFO] Calling Gemini API with model: {MODEL_NAME}")
        response = model.generate_content(prompt=prompt)
        reply_text = getattr(response, 'text', None) or str(response)
        print(f"[INFO] API response received successfully")

        # 결과 반환
        return jsonify({"reply": reply_text})

    except Exception as e:
        import traceback
        error_traceback = traceback.format_exc()
        print(f"[ERROR] Exception occurred: {error_traceback}")
        
        error_message = str(e)
        response_payload = {
            "reply": "AI 서비스와 연결하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
        }
        if DEBUG:
            response_payload["reply"] = f"AI 서비스와 연결하는 중 오류가 발생했습니다: {error_message}"
            response_payload["error"] = error_message
            response_payload["traceback"] = error_traceback
        return jsonify(response_payload), 500

if __name__ == '__main__':
    # Render의 PORT 환경변수 사용, 없으면 로컬 개발용 5000
    port = int(os.getenv('PORT', 5000))
    app.run('0.0.0.0', port=port, debug=False)
