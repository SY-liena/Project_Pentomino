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

init();