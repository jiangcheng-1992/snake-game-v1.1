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
const refreshBoardBtn = document.getElementById("refreshBoardBtn");

// 全网排行榜 API 端点 (全新的 JsonBlob)
const API_ENDPOINT = "https://jsonblob.com/api/jsonBlob/019d2449-f292-7097-8a91-026570e860cf";

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

// 从本地备份加载
try {
    const backup = localStorage.getItem("snakeLeaderboardBackup");
    if (backup) {
        leaderboard = JSON.parse(backup);
        console.log("已加载本地备份数据");
    }
} catch (e) {
    console.error("加载备份失败", e);
}

// 颜色生成函数 (为头像生成固定颜色)
function getAvatarColor(name) {
    const colors = ["#2ecc71", "#3498db", "#9b59b6", "#f1c40f", "#e67e22", "#e74c3c", "#1abc9c"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

// 从云端获取排行榜
async function fetchLeaderboard() {
    console.log("开始同步云端排行榜...");
    const originalHeader = document.querySelector('.sidebar-header h2');
    if (originalHeader) originalHeader.innerHTML = '🏆 同步中...';
    
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'GET',
            mode: 'cors',
            headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log("成功获取云端数据:", data);
            if (Array.isArray(data)) {
                leaderboard = data;
                localStorage.setItem("snakeLeaderboardBackup", JSON.stringify(data));
                updateLeaderboardUI();
            }
        } else {
            console.error("云端获取失败, 状态码:", response.status);
        }
    } catch (e) {
        console.error("网络请求异常:", e);
    } finally {
        if (originalHeader) originalHeader.innerHTML = '🏆 全球排行榜';
    }
}

// 每 60 秒刷新一次
setInterval(fetchLeaderboard, 60000);
refreshBoardBtn.addEventListener("click", fetchLeaderboard);

// 初始设置
highScoreElement.textContent = highScore;
updateLeaderboardUI();
setTimeout(fetchLeaderboard, 500);

async function initGame() {
    snake = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
    dx = 0; dy = -1;
    score = 0;
    scoreElement.textContent = score;
    gameActive = true;
    gameOverModal.classList.add("hidden");
    placeFood();
    clearTimeout(gameLoopTimeout);
    gameLoop();
}

function gameLoop() {
    if (!gameActive) return;
    if (hasGameEnded()) { endGame(); return; }
    changingDirection = false;
    clearCanvas();
    drawGrid();
    drawFood();
    moveSnake();
    drawSnake();
    gameLoopTimeout = setTimeout(gameLoop, Math.max(70, 150 - score * 2));
}

function drawGrid() {
    ctx.strokeStyle = "rgba(46, 204, 113, 0.05)";
    for (let i = 0; i <= canvas.width; i += gridSize) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }
}

function clearCanvas() { ctx.fillStyle = "#000000"; ctx.fillRect(0, 0, canvas.width, canvas.height); }

function drawSnake() {
    snake.forEach((part, index) => {
        const isHead = index === 0;
        ctx.shadowBlur = isHead ? 15 : 5;
        ctx.shadowColor = isHead ? "#2ecc71" : "#27ae60";
        ctx.fillStyle = isHead ? "#2ecc71" : "#27ae60";
        ctx.beginPath();
        ctx.roundRect(part.x * gridSize + 1, part.y * gridSize + 1, gridSize - 2, gridSize - 2, isHead ? 6 : 4);
        ctx.fill();
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
    } else { snake.pop(); }
}

function drawFood() {
    ctx.shadowBlur = 15; ctx.shadowColor = "#e74c3c"; ctx.fillStyle = "#e74c3c";
    ctx.beginPath();
    ctx.arc(foodX * gridSize + gridSize / 2, foodY * gridSize + gridSize / 2, gridSize / 2 - 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function placeFood() {
    foodX = Math.floor(Math.random() * tileCount);
    foodY = Math.floor(Math.random() * tileCount);
    for (let part of snake) { if (part.x === foodX && part.y === foodY) { placeFood(); return; } }
}

function hasGameEnded() {
    if (dx === 0 && dy === 0) return false;
    if (snake[0].x < 0 || snake[0].x >= tileCount || snake[0].y < 0 || snake[0].y >= tileCount) return true;
    for (let i = 1; i < snake.length; i++) { if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true; }
    return false;
}

async function endGame() {
    gameActive = false;
    finalScoreElement.textContent = score;
    gameOverModal.classList.remove("hidden");
    
    // 立即更新本地 UI
    userInfoDisplay.innerHTML = `玩家: <span id="feishuName">${FEISHU_USER_NAME}</span> (正在保存到本地...)`;
    
    if (score > 0) {
        // 核心改动：采用“本地优先”策略
        // 1. 先更新本地列表
        updateLocalLeaderboard(FEISHU_USER_NAME, score);
        // 2. 立即重绘 UI
        updateLeaderboardUI();
        
        // 3. 异步去尝试同步云端，不阻塞 UI 
        try {
            userInfoDisplay.innerHTML = `玩家: <span id="feishuName">${FEISHU_USER_NAME}</span> (同步全网中...)`;
            await syncToCloud();
            userInfoDisplay.innerHTML = `玩家: <span id="feishuName">${FEISHU_USER_NAME}</span> (全网同步成功 ✅)`;
        } catch (e) {
            console.error("云端同步失败:", e);
            userInfoDisplay.innerHTML = `玩家: <span id="feishuName">${FEISHU_USER_NAME}</span> (同步失败，已保存至本地)`;
        }
    } else {
        userInfoDisplay.innerHTML = `玩家: <span id="feishuName">${FEISHU_USER_NAME}</span> (再接再厉哦)`;
    }
}

function updateLocalLeaderboard(name, score) {
    const idx = leaderboard.findIndex(i => i.name === name);
    if (idx !== -1) {
        if (score > leaderboard[idx].score) {
            leaderboard[idx].score = score;
            leaderboard[idx].date = new Date().toLocaleDateString();
        }
    } else {
        leaderboard.push({ name, score, date: new Date().toLocaleDateString() });
    }
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    // 立即备份到本地存储
    localStorage.setItem("snakeLeaderboardBackup", JSON.stringify(leaderboard));
}

async function syncToCloud() {
    // 增加获取超时处理
    const getRes = await fetch(API_ENDPOINT, { 
        method: 'GET', 
        headers: { 'Accept': 'application/json' } 
    });
    if (getRes.ok) {
        const cloudData = await getRes.json();
        if (Array.isArray(cloudData)) {
            mergeData(cloudData);
        }
    }

    // 推送最终结果，带上完整的 Header
    const putRes = await fetch(API_ENDPOINT, {
        method: 'PUT',
        mode: 'cors',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(leaderboard)
    });
    
    if (!putRes.ok) {
        throw new Error(`Cloud sync failed: ${putRes.status}`);
    }
}

function mergeData(cloudData) {
    cloudData.forEach(cloudItem => {
        const localIdx = leaderboard.findIndex(i => i.name === cloudItem.name);
        if (localIdx === -1) {
            leaderboard.push(cloudItem);
        } else if (cloudItem.score > leaderboard[localIdx].score) {
            leaderboard[localIdx].score = cloudItem.score;
        }
    });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
}

function updateLeaderboardUI() {
    console.log("更新 UI 榜单, 当前数据:", leaderboard);
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<div class="empty-msg">暂无记录，快来抢占沙发！</div>';
        return;
    }

    // 强制清空并重绘
    leaderboardList.innerHTML = "";
    leaderboard.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "leaderboard-item";
        const initial = item.name.charAt(0).toUpperCase();
        const color = getAvatarColor(item.name);
        
        div.innerHTML = `
            <span class="rank">${index + 1}</span>
            <div class="avatar" style="background: ${color}">${initial}</div>
            <span class="name">${item.name}</span>
            <span class="score">${item.score}</span>
        `;
        leaderboardList.appendChild(div);
    });
}

function changeDirection(event) {
    const keyPressed = event.keyCode;
    const KEYS = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, A: 65, W: 87, D: 68, S: 83 };
    if (Object.values(KEYS).includes(keyPressed)) event.preventDefault();
    if (!gameActive && gameOverModal.classList.contains("hidden")) {
        if (Object.values(KEYS).includes(keyPressed)) initGame();
    }
    if (changingDirection) return;
    if ((keyPressed === KEYS.LEFT || keyPressed === KEYS.A) && dx !== 1) { dx = -1; dy = 0; changingDirection = true; }
    if ((keyPressed === KEYS.UP || keyPressed === KEYS.W) && dy !== 1) { dx = 0; dy = -1; changingDirection = true; }
    if ((keyPressed === KEYS.RIGHT || keyPressed === KEYS.D) && dx !== -1) { dx = 1; dy = 0; changingDirection = true; }
    if ((keyPressed === KEYS.DOWN || keyPressed === KEYS.S) && dy !== -1) { dx = 0; dy = 1; changingDirection = true; }
}

document.addEventListener("keydown", changeDirection);
restartBtn.addEventListener("click", initGame);
shareBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
        const old = shareBtn.textContent; shareBtn.textContent = "✅ 已复制";
        setTimeout(() => shareBtn.textContent = old, 2000);
    });
});

clearCanvas(); drawGrid();
ctx.fillStyle = "#2ecc71"; ctx.font = "bold 24px 'Segoe UI'"; ctx.textAlign = "center";
ctx.fillText("准备好了吗？", canvas.width / 2, canvas.height / 2 - 20);
ctx.fillStyle = "white"; ctx.font = "16px 'Segoe UI'";
ctx.fillText("按下方向键开始挑战", canvas.width / 2, canvas.height / 2 + 20);
