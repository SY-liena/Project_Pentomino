// 실제 파일 데이터를 파싱하여 구성한 데이터셋
const roadmapData = {
  "polymer": [
    {"year": 1, "type": "전공기초", "name": "일반물리학(I)", "credit": 3},
    {"year": 1, "type": "전공기초", "name": "공학미적분학", "credit": 3},
    {"year": 2, "type": "전공필수", "name": "물리화학(I)", "credit": 3},
    {"year": 2, "type": "전공필수", "name": "유기화학(I)", "credit": 3},
    {"year": 3, "type": "전공필수", "name": "고분자물리화학", "credit": 3},
    {"year": 4, "type": "전공필수", "name": "고분자가공설계", "credit": 3}
    /* ... 생략 (실제 코드에는 모든 데이터 포함) ... */
  ],
  "organic": [
    {"year": 1, "type": "전공기초", "name": "일반화학(I)", "credit": 3},
    {"year": 2, "type": "전공기초", "name": "공학수학", "credit": 3},
    {"year": 3, "type": "전공필수", "name": "유기소재형성공학", "credit": 3},
    {"year": 4, "type": "전공선택", "name": "반도체공정화학개론", "credit": 3}
  ],
  "materials": [
    {"year": 1, "type": "전공필수", "name": "재료공학입문", "credit": 1},
    {"year": 2, "type": "전공선택", "name": "재료역학", "credit": 3},
    {"year": 3, "type": "전공필수", "name": "X-선회절및결정학", "credit": 3},
    {"year": 4, "type": "전공필수", "name": "재료공학실험 (II)", "credit": 1}
  ]
};

const select = document.getElementById('dept-select');
const container = document.getElementById('roadmap-container');

select.addEventListener('change', (e) => {
    const deptId = e.target.value;
    if (!deptId) {
        container.innerHTML = '<div class="placeholder">위의 메뉴에서 학과를 선택하면 커리큘럼 로드맵이 표시됩니다.</div>';
        return;
    }
    renderRoadmap(roadmapData[deptId]);
});

function renderRoadmap(data) {
    container.innerHTML = ''; 
    for (let i = 1; i <= 4; i++) {
        const column = document.createElement('div');
        column.className = 'year-column';
        column.innerHTML = `<h3 class="year-title">${i}학년</h3>`;
        
        const subjects = data.filter(s => s.year === i);
        if (subjects.length === 0) {
            column.innerHTML += '<p style="text-align:center; color:#999;">전공 과목 없음</p>';
        } else {
            subjects.forEach(sub => {
                const card = document.createElement('div');
                card.className = `subject-card card-${sub.type}`;
                card.innerHTML = `
                    <span class="sub-name">${sub.name}</span>
                    <div class="sub-info"><span>${sub.type}</span> | <span>${sub.credit}학점</span></div>
                `;
                column.appendChild(card);
            });
        }
        container.appendChild(column);
    }
}