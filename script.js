const select = document.getElementById('dept-select');
const container = document.getElementById('roadmap-container');

// 페이지 로드 시 JSON 데이터를 가져옴
async function init() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        
        // 1. 드롭다운 메뉴 동적 생성
        select.innerHTML = '<option value="">학과를 선택하세요</option>';
        data.departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.id;
            option.textContent = dept.name;
            select.appendChild(option);
        });

        // 2. 선택 이벤트 리스너
        select.addEventListener('change', (e) => {
            const selectedDept = data.departments.find(d => d.id === e.target.value);
            if (selectedDept) {
                renderRoadmap(selectedDept.curriculum);
            } else {
                container.innerHTML = '<div class="placeholder">학과를 선택하면 커리큘럼 로드맵이 표시됩니다.</div>';
            }
        });

        container.innerHTML = '<div class="placeholder">학과를 선택해주세요.</div>';
    } catch (error) {
        container.innerHTML = '<div class="placeholder">데이터를 불러오는 중 오류가 발생했습니다.</div>';
    }
}

function renderRoadmap(curriculum) {
    container.innerHTML = '';

    for (let i = 1; i <= 4; i++) {
        const column = document.createElement('div');
        column.className = 'year-column';
        column.innerHTML = `<h2 class="year-title">${i}학년</h2>`;

        const subjects = curriculum.filter(s => s.year === i);
        subjects.forEach(sub => {
            const card = document.createElement('div');
            // 전공 구분 매칭
            const typeClass = sub.type.includes('필수') ? 'required' : (sub.type.includes('기초') ? 'base' : 'elective');
            card.className = `course-card ${typeClass}`;
            
            card.innerHTML = `
                <span class="course-name">${sub.name}</span>
                <span class="tag">${sub.type}</span>
                <span class="tag">${sub.credit}학점</span>
            `;
            column.appendChild(card);
        });
        container.appendChild(column);
    }
}


// AI 서버 엔드포인트 (Render 배포 서버)
const AI_ENDPOINT = 'https://project-pentomino.onrender.com/ask-ai';

init();

/* script.js 기존 코드 아래에 추가 */

const chatContainer = document.getElementById('chat-container');
const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// 챗봇 창 토글 함수
function toggleChat() {
    if (chatContainer.style.display === 'none') {
        chatContainer.style.display = 'flex';
    } else {
        chatContainer.style.display = 'none';
    }
}

// 메시지 화면 추가 함수
function addMessage(text, type) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${type}`;
    msgDiv.innerText = text;
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight; // 스크롤 최하단 이동
}

// AI 응답 호출 함수
async function handleChat() {
    const message = userInput.value.trim();
    if (!message) return;

    // 사용자 메시지 추가
    addMessage(message, 'user');
    userInput.value = '';

    // 로딩 표시
    const loadingId = 'loading-' + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'msg bot';
    loadingDiv.id = loadingId;
    loadingDiv.innerText = 'AI가 생각 중입니다...';
    chatWindow.appendChild(loadingDiv);

    try {
        // Flask 서버로 요청 (Render 배포 서버 사용)
        const response = await fetch(AI_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });

        // HTTP 상태 코드 확인
        if (!response.ok) {
            const textBody = await response.text();
            let serverError = textBody;
            try {
                const jsonBody = JSON.parse(textBody);
                serverError = jsonBody.error || jsonBody.reply || textBody;
            } catch (_) {
                serverError = textBody;
            }
            throw new Error(`HTTP Error: ${response.status} ${response.statusText} - ${serverError}`);
        }

        const data = await response.json();
        
        // 로딩 메시지 제거 후 답변 추가
        document.getElementById(loadingId).remove();
        if (data.reply) {
            addMessage(data.reply, 'bot');
        } else {
            addMessage('죄송합니다. 응답을 가져오지 못했습니다.', 'bot');
        }
    } catch (error) {
        document.getElementById(loadingId).remove();
        const errorMsg = error.message.includes('HTTP') 
            ? `서버 오류: ${error.message}`
            : '서버와 연결할 수 없습니다. Flask 서버가 켜져 있는지 확인해 주세요.';
        addMessage(errorMsg, 'bot');
        console.error('Error:', error);
    }
}

// 이벤트 리스너
sendBtn.addEventListener('click', handleChat);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChat();
});