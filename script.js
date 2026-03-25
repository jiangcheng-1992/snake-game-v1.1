const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const finalScoreElement = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");
const gameOverModal = document.getElementById("gameOverModal");
const leaderboardList = document.getElementById("leaderboardList");
const userInfoDisplay = document.getElementById("userInfoDisplay");
const nicknameModal = document.getElementById("nicknameModal");
const userNicknameInput = document.getElementById("userNicknameInput");
const saveNicknameBtn = document.getElementById("saveNicknameBtn");
const shareBtn = document.getElementById("shareBtn");

// 全网排行榜 API 端点 (全新的 JsonBlob)
const API_ENDPOINT = "https://jsonblob.com/api/jsonBlob/019d242b-ee7c-7e1f-8592-8ae4d3734199";

// 获取或初始化昵称
let FEISHU_USER_NAME = localStorage.getItem("snakeUserName");

// 昵称弹窗逻辑
if (FEISHU_USER_NAME) {
    nicknameModal.classList.add("hidden");
}

saveNicknameBtn.addEventListener("click", () => {
    const name = userNicknameInput.value.trim();
    if (name) {
        FEISHU_USER_NAME = name;
        localStorage.setItem("snakeUserName", name);
        nicknameModal.classList.add("hidden");
        // 设置完昵称后立即尝试一次同步
        fetchLeaderboard();
    }
});

userNicknameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveNicknameBtn.click();
    e.stopPropagation();
});

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let dx = 0;
let dy = 0;
let foodX;
let foodY;
let score = 0;
let highScore = localStorage.getItem("snakeHighScore") || 0;
let gameLoopTimeout;
let gameActive = false;
let changingDirection = false;

// 初始化排行榜
let leaderboard = [];

// 从本地备份获取排行榜
try {
    const backup = localStorage.getItem("snakeLeaderboardBackup");
    if (backup) leaderboard = JSON.parse(backup);
} catch (e) {}

// 从云端获取排行榜
async function fetchLeaderboard(retryCount = 0) {
    const originalHeader = document.querySelector('.sidebar-header h2');
    if (!originalHeader) return;
    
    const originalText = "🏆 全球排行榜";
    originalHeader.innerHTML = '🏆 同步中...';
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(API_ENDPOINT, {
            method: 'GET',
            mode: 'cors',
            headers: { 
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
                leaderboard = data;
                localStorage.setItem("snakeLeaderboardBackup", JSON.stringify(data));
                updateLeaderboardUI();
            }
        } else if (retryCount < 2) {
            // 失败重试
            console.log(`获取失败，正在进行第 ${retryCount + 1} 次重试...`);
            setTimeout(() => fetchLeaderboard(retryCount + 1), 2000);
        }
    } catch (e) {
        console.error("同步云端排行榜失败:", e);
    } finally {
        originalHeader.innerHTML = originalText;
    }
}

// 每 60 秒自动刷新一次排行榜
setInterval(fetchLeaderboard, 60000);

// 初始设置
highScoreElement.textContent = highScore;
updateLeaderboardUI();
// 页面加载 1 秒后执行同步
setTimeout(() => fetchLeaderboard(), 1000);

async function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 10, y: 11 },
        { x: 10, y: 12 }
    ];
    dx = 0;
    dy = -1; // 默认向上移动
    score = 0;
    scoreElement.textContent = score;
    gameActive = true;
    gameOverModal.classList.add("hidden");
    placeFood();
    clearTimeout(gameLoopTimeout);
    
    // 每次开始前也拉取一次
    fetchLeaderboard();
    
    gameLoop();
}

function gameLoop() {
    if (!gameActive) return;

    if (hasGameEnded()) {
        endGame();
        return;
    }

    changingDirection = false;
    clearCanvas();
    drawGrid();
    drawFood();
    moveSnake();
    drawSnake();

    const speed = Math.max(70, 150 - score * 2);
    gameLoopTimeout = setTimeout(gameLoop, speed);
}

function drawGrid() {
    ctx.strokeStyle = "rgba(46, 204, 113, 0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= canvas.width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
}

function clearCanvas() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    snake.forEach((part, index) => {
        const isHead = index === 0;
        
        // 增加发光效果
        ctx.shadowBlur = isHead ? 15 : 5;
        ctx.shadowColor = isHead ? "#2ecc71" : "#27ae60";
        
        ctx.fillStyle = isHead ? "#2ecc71" : "#27ae60";
        
        // 绘制圆角矩形
        const r = isHead ? 6 : 4;
        const x = part.x * gridSize + 1;
        const y = part.y * gridSize + 1;
        const w = gridSize - 2;
        const h = gridSize - 2;
        
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        ctx.fill();
        
        // 重置阴影，避免影响其他绘制
        ctx.shadowBlur = 0;
    });
}

function moveSnake() {
    if (dx === 0 && dy === 0) return;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (head.x === foodX && head.y === foodY) {
        score += 10;
        scoreElement.textContent = score;
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem("snakeHighScore", highScore);
        }
        placeFood();
    } else {
        snake.pop();
    }
}

function drawFood() {
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#e74c3c";
    ctx.fillStyle = "#e74c3c";
    
    const centerX = foodX * gridSize + gridSize / 2;
    const centerY = foodY * gridSize + gridSize / 2;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, gridSize / 2 - 3, 0, Math.PI * 2);
    ctx.fill();
    
    // 添加一个小高光
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.arc(centerX - 2, centerY - 2, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
}

function placeFood() {
    foodX = Math.floor(Math.random() * tileCount);
    foodY = Math.floor(Math.random() * tileCount);

    for (let part of snake) {
        if (part.x === foodX && part.y === foodY) {
            placeFood();
            return;
        }
    }
}

function hasGameEnded() {
    if (dx === 0 && dy === 0) return false;

    if (snake[0].x < 0 || snake[0].x >= tileCount || 
        snake[0].y < 0 || snake[0].y >= tileCount) {
        return true;
    }

    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            return true;
        }
    }
    return false;
}

async function endGame() {
    gameActive = false;
    finalScoreElement.textContent = score;
    gameOverModal.classList.remove("hidden");
    
    // 自动显示飞书姓名并提交分数
    userInfoDisplay.innerHTML = `玩家: <span id="feishuName">${FEISHU_USER_NAME}</span> (正在同步成绩...)`;
    
    // 如果有得分，自动保存
    if (score > 0) {
        try {
            await saveScore(FEISHU_USER_NAME, score);
            userInfoDisplay.innerHTML = `玩家: <span id="feishuName">${FEISHU_USER_NAME}</span> (成绩同步完成 ✅)`;
        } catch (err) {
            console.error("EndGame 同步失败:", err);
            userInfoDisplay.innerHTML = `玩家: <span id="feishuName">${FEISHU_USER_NAME}</span> (同步失败，已保存至本地)`;
        }
    } else {
        userInfoDisplay.innerHTML = `玩家: <span id="feishuName">${FEISHU_USER_NAME}</span> (再接再厉哦)`;
    }
}

async function saveScore(name, score) {
    // 1. 先尝试获取最新云端数据
    try {
        const response = await fetch(API_ENDPOINT, { 
            method: 'GET',
            mode: 'cors',
            headers: { 'Accept': 'application/json' } 
        });
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) leaderboard = data;
        }
    } catch (e) {
        console.warn("保存前同步失败，将使用本地缓存数据提交", e);
    }

    // 2. 更新本地数据
    const existingIndex = leaderboard.findIndex(item => item.name === name);
    if (existingIndex !== -1) {
        if (score > leaderboard[existingIndex].score) {
            leaderboard[existingIndex].score = score;
            leaderboard[existingIndex].date = new Date().toLocaleDateString();
        } else {
            return; // 没打破自己的记录，不提交
        }
    } else {
        leaderboard.push({ name, score, date: new Date().toLocaleDateString() });
    }
    
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    
    // 3. 同步到云端
    const response = await fetch(API_ENDPOINT, {
        method: 'PUT',
        mode: 'cors',
        headers: { 
            'Content-Type': 'application/json', 
            'Accept': 'application/json' 
        },
        body: JSON.stringify(leaderboard)
    });
    
    if (response.ok) {
        localStorage.setItem("snakeLeaderboardBackup", JSON.stringify(leaderboard));
        updateLeaderboardUI();
    } else {
        throw new Error(`PUT 失败，状态码: ${response.status}`);
    }
}

function updateLeaderboardUI() {
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<div class="empty-msg">暂无记录，快来挑战吧！</div>';
        return;
    }

    leaderboardList.innerHTML = leaderboard.map((item, index) => `
        <div class="leaderboard-item">
            <span class="rank">${index + 1}</span>
            <span class="name">${item.name}</span>
            <span class="score">${item.score}</span>
        </div>
    `).join('');
}

function changeDirection(event) {
    const keyPressed = event.keyCode;
    const LEFT_KEY = 37, A_KEY = 65;
    const UP_KEY = 38, W_KEY = 87;
    const RIGHT_KEY = 39, D_KEY = 68;
    const DOWN_KEY = 40, S_KEY = 83;

    if ([37, 38, 39, 40].includes(keyPressed)) event.preventDefault();

    // 如果游戏还没开始，按下方向键即可启动游戏
    if (!gameActive && gameOverModal.classList.contains("hidden")) {
        const validKeys = [LEFT_KEY, A_KEY, UP_KEY, W_KEY, RIGHT_KEY, D_KEY, DOWN_KEY, S_KEY];
        if (validKeys.includes(keyPressed)) {
            initGame();
        }
    }

    if (changingDirection) return;

    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if ((keyPressed === LEFT_KEY || keyPressed === A_KEY) && !goingRight) {
        dx = -1; dy = 0; changingDirection = true;
    }
    if ((keyPressed === UP_KEY || keyPressed === W_KEY) && !goingDown) {
        dx = 0; dy = -1; changingDirection = true;
    }
    if ((keyPressed === RIGHT_KEY || keyPressed === D_KEY) && !goingLeft) {
        dx = 1; dy = 0; changingDirection = true;
    }
    if ((keyPressed === DOWN_KEY || keyPressed === S_KEY) && !goingUp) {
        dx = 0; dy = 1; changingDirection = true;
    }
}

// 事件监听
document.addEventListener("keydown", changeDirection);
restartBtn.addEventListener("click", initGame);

// 分享按钮逻辑
shareBtn.addEventListener("click", () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        const originalText = shareBtn.textContent;
        shareBtn.textContent = "✅ 已复制链接";
        setTimeout(() => {
            shareBtn.textContent = originalText;
        }, 2000);
    });
});

// 初始欢迎画面
clearCanvas();
drawGrid();
ctx.fillStyle = "#2ecc71";
ctx.font = "bold 24px 'Segoe UI'";
ctx.textAlign = "center";
ctx.fillText("准备好了吗？", canvas.width / 2, canvas.height / 2 - 20);
ctx.fillStyle = "white";
ctx.font = "16px 'Segoe UI'";
ctx.fillText("按下方向键开始挑战", canvas.width / 2, canvas.height / 2 + 20);
