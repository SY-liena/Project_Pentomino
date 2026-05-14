import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

# .env 파일에 저장된 API 키를 불러옵니다.
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Gemini AI 설정
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-pro')

app = Flask(__name__)

# 브라우저에서 서버로의 접근을 허용합니다 (CORS 해결)
CORS(app)

@app.route('/ask-ai', methods=['POST'])
def ask_ai():
    try:
        # 프론트엔드(JS)에서 보낸 JSON 데이터를 받습니다.
        data = request.get_json()
        user_message = data.get("message")

        if not user_message:
            return jsonify({"reply": "질문을 입력해 주세요!"}), 400

        # AI에게 전달할 '페르소나'와 '질문'을 조합합니다.
        # 전공 가이드에 특화된 답변을 하도록 유도합니다.
        prompt = f"""
        너는 대학교 전공 로드맵 가이드 AI야. 학생의 질문에 대해 친절하고 전문적으로 답변해줘.
        질문: {user_message}
        """

        # Gemini AI 응답 생성
        response = model.generate_content(prompt)
        
        # 결과 반환
        return jsonify({"reply": response.text})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"reply": "AI 서비스와 연결하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."}), 500

if __name__ == '__main__':
    # 디버그 모드로 서버 실행 (포트 5000)
    app.run('0.0.0.0', port=5000, debug=True)