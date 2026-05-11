# app.py
import os
from dotenv import load_dotenv

from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

load_dotenv() # .env 파일 로드

app = Flask(__name__)
CORS(app)  # 프론트엔드(JS)에서 서버로 접근 허용



# 환경 변수에서 키를 읽어옴
api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-pro')

@app.route('/ask-ai', methods=['POST'])
def ask_ai():
    data = request.json
    user_message = data.get("message")
    
    if not user_message:
        return jsonify({"error": "메시지가 없습니다."}), 400

    try:
        # Gemini에게 질문 던지기 (전공 상담 컨텍스트 추가 가능)
        prompt = f"너는 부산대학교 전공 상담 가이드야. 다음 질문에 친절하게 답해줘: {user_message}"
        response = model.generate_content(prompt)
        
        return jsonify({"reply": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)