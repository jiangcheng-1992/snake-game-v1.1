const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const finalScoreElement = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");
const reviveBtn = document.getElementById("reviveBtn");
const gameOverModal = document.getElementById("gameOverModal");
const leaderboardList = document.getElementById("leaderboardList");
const userInfoDisplay = document.getElementById("userInfoDisplay");
const nicknameModal = document.getElementById("nicknameModal");
const userNicknameInput = document.getElementById("userNicknameInput");
const saveNicknameBtn = document.getElementById("saveNicknameBtn");
const shareBtn = document.getElementById("shareBtn");
const refreshBoardBtn = document.getElementById("refreshBoardBtn");
const tabScore = document.getElementById("tabScore");
const tabCollection = document.getElementById("tabCollection");

// 🎮 新增：详情弹窗 DOM
const currentLevelElement = document.getElementById("currentLevel");
const totalScoreElement = document.getElementById("totalScore");
const gachaModal = document.getElementById("gachaModal");
const collectionModal = document.getElementById("collectionModal");
const drawBtn = document.getElementById("drawBtn");
const closeGachaBtn = document.getElementById("closeGachaBtn");
const openCollectionBtn = document.getElementById("openCollectionBtn");
const closeCollectionBtn = document.getElementById("closeCollectionBtn");
const collectionGrid = document.getElementById("collectionGrid");
const collectionCountElement = document.getElementById("collectionCount");
const newCard = document.getElementById("newCard");
const pokemonImg = document.getElementById("pokemonImg");
const pokemonName = document.getElementById("pokemonName");
const pokemonType = document.getElementById("pokemonType");
const pokemonDesc = document.getElementById("pokemonDesc");
const pokemonAtk = document.getElementById("pokemonAtk");
const pokemonInt = document.getElementById("pokemonInt");

// 🎮 新增：详情弹窗 DOM
const pokemonDetailModal = document.getElementById("pokemonDetailModal");
const detailImg = document.getElementById("detailImg");
const detailName = document.getElementById("detailName");
const detailType = document.getElementById("detailType");
const detailDesc = document.getElementById("detailDesc");
const detailAttack = document.getElementById("detailAttack");
const detailInt = document.getElementById("detailInt");
const closeDetailBtn = document.getElementById("closeDetailBtn");
const closeGameOverBtn = document.getElementById("closeGameOverBtn");

// 🎮 移动端控制按钮 DOM
const btnUp = document.getElementById("btnUp");
const btnDown = document.getElementById("btnDown");
const btnLeft = document.getElementById("btnLeft");
const btnRight = document.getElementById("btnRight");

// 🎮 新增：皮卡丘宠物 DOM
const petBubble = document.getElementById("petBubble");
const pikachuPet = document.getElementById("pikachuPet");
const attackersList = document.getElementById("attackersList");

// 🏆 全网排行榜 API 端点 (正确的 npoint.io 专属 ID)
const API_ENDPOINT = "https://api.npoint.io/3039805fc7a1717aa687";
const APP_VERSION = "v2026.03.25.Pet_Mode"; // 增加宠物模式版本

// 💾 宠物互动台词 (毒舌版)
const PET_QUOTES = {
    start: ["哟，又来送人头了？", "皮卡...看你这操作我就心慌", "准备好刷新你的最低分了吗？", "去吧！菜鸟贪吃蛇！"],
    eat: ["运气不错，这都能吃到？", "居然还没撞墙，奇迹啊", "呵，吃再多也掩盖不了技术菜", "别高兴太早，前面就是墙", "慢点吃，别噎着你的智商"],
    levelUp: ["Wow! 瞎猫碰上死耗子了？", "这种难度也能升级？服了", "解锁新精灵也救不了你的手残", "行行行，算你厉害一次行了吧？"],
    die: ["噗...我就知道会这样", "这操作，我奶奶上都比你强", "要不还是回家玩消消乐吧？", "菜是原罪，懂吗？Pika!", "求你了，别再折磨这条蛇了"]
};

function showPetTalk(type) {
    const quotes = PET_QUOTES[type];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    petBubble.textContent = randomQuote;
    petBubble.classList.add("show");
    
    // 增加一点点卖萌的缩放效果
    pikachuPet.style.transform = "scale(1.2) rotate(10deg)";
    
    // 3秒后消失
    setTimeout(() => {
        petBubble.classList.remove("show");
        pikachuPet.style.transform = "";
    }, 3000);
}

// 给皮卡丘增加点击互动
pikachuPet.addEventListener("click", () => showPetTalk('start'));

// 💾 游戏数据
let totalScore = parseInt(localStorage.getItem("snakeTotalScore")) || 0;
let currentLevel = parseInt(localStorage.getItem("snakeCurrentLevel")) || 1;
let myCollection = JSON.parse(localStorage.getItem("snakeCollection")) || []; // 已收集的 ID 列表
let pendingDraws = parseInt(localStorage.getItem("snakePendingDraws")) || 0;

// 🐲 宝可梦基础数据 (精选 251 只全图鉴简介)
const POKEMON_DATA = [
    { id: 1, name: "妙蛙种子", type: "草/毒", atk: 49, int: 65, desc: "背上背着一颗奇怪的种子，与它一起成长。" },
    { id: 2, name: "妙蛙草", type: "草/毒", atk: 62, int: 80, desc: "当背上的花苞长大，它就无法再用后脚站立。" },
    { id: 3, name: "妙蛙花", type: "草/毒", atk: 82, int: 100, desc: "背上的大花散发出迷人的香气，能安抚人心。" },
    { id: 4, name: "小火龙", type: "火", atk: 52, int: 60, desc: "尾巴上的火焰象征着它的生命力。" },
    { id: 5, name: "火恐龙", type: "火", atk: 64, int: 80, desc: "性格暴躁，如果遇到强敌尾巴会燃起青白色的火焰。" },
    { id: 6, name: "喷火龙", type: "火/飞行", atk: 84, int: 109, desc: "寻找强敌在空中飞行，能吐出融化岩石的高温火焰。" },
    { id: 7, name: "杰尼龟", type: "水", atk: 48, int: 50, desc: "缩进壳里保护自己，并伺机喷水反击。" },
    { id: 8, name: "卡咪龟", type: "水", atk: 63, int: 65, desc: "长寿的象征，毛茸茸的尾巴深受人们喜爱。" },
    { id: 9, name: "水箭龟", type: "水", atk: 83, int: 85, desc: "甲壳上的喷射口可以精准射穿 50 米外的钢板。" },
    { id: 10, name: "绿毛虫", type: "虫", atk: 30, int: 20, desc: "脚底带有吸盘，不论是墙壁还是树木都能轻松攀爬。" },
    { id: 11, name: "铁甲蛹", type: "虫", atk: 20, int: 25, desc: "身体被坚硬的壳包裹着，静静地等待着进化。" },
    { id: 12, name: "巴大蝶", type: "虫/飞行", atk: 45, int: 90, desc: "寻找花粉的专家，即使是几公里外的花香也能察觉。" },
    { id: 25, name: "皮卡丘", type: "电", atk: 55, int: 90, desc: "两颊有蓄电袋，遇到危险时会放电。" },
    { id: 26, name: "雷丘", type: "电", atk: 90, int: 110, desc: "尾巴像避雷针一样保护自己免受高压电伤害。" },
    { id: 39, name: "胖丁", type: "一般/妖精", atk: 45, int: 75, desc: "圆滚滚的大眼睛会散发魅力，歌声能让人入睡。" },
    { id: 52, name: "喵喵", type: "一般", atk: 45, int: 85, desc: "喜欢闪闪发亮的东西，晚上会四处寻找硬币。" },
    { id: 54, name: "可达鸭", type: "水", atk: 52, int: 95, desc: "一直被头痛困扰，头痛欲裂时会释放出超能力。" },
    { id: 58, name: "卡蒂狗", type: "火", atk: 70, int: 50, desc: "性格忠诚可靠，会为了保护训练家而拼命。" },
    { id: 59, name: "风速狗", type: "火", atk: 110, int: 100, desc: "传说中的宝可梦，奔跑的身姿如飞翔一般轻盈。" },
    { id: 65, name: "胡地", type: "超能力", atk: 50, int: 175, desc: "大脑不断成长，据说智商超过 5000。" },
    { id: 68, name: "怪力", type: "格斗", atk: 130, int: 65, desc: "四只手臂能发动排山倒海般的攻击。" },
    { id: 94, name: "耿鬼", type: "幽灵/毒", atk: 65, int: 130, desc: "潜伏在影子里的调皮鬼，喜欢惊吓路人。" },
    { id: 100, name: "霹雳电球", type: "电", atk: 30, int: 80, desc: "长得像精灵球，稍微受到一点刺激就会爆炸。" },
    { id: 131, name: "拉普拉斯", type: "水/冰", atk: 85, int: 95, desc: "头脑聪明，心肠温柔。喜欢载着人在海上航行。" },
    { id: 133, name: "伊布", type: "一般", atk: 55, int: 65, desc: "拥有极其不稳定的基因，隐藏着各种进化的可能。" },
    { id: 143, name: "卡比兽", type: "一般", atk: 110, int: 110, desc: "每天不吃下 400 公斤食物就不开心。吃饱了就睡。" },
    { id: 149, name: "快龙", type: "龙/飞行", atk: 134, int: 100, desc: "拥有在 16 小时内绕地球一周的惊人飞行能力。" },
    { id: 150, name: "超梦", type: "超能力", atk: 110, int: 154, desc: "由于基因组被重组，导致它变得只有战斗。力量极强。" },
    { id: 151, name: "梦幻", type: "超能力", atk: 100, int: 100, desc: "据说拥有所有宝可梦的基因，因此能学会所有的招式。" },

    // 第二代精选 (152-251)
    { id: 152, name: "菊草叶", type: "草", atk: 49, int: 65, desc: "头上的叶子散发出微甜的香气，能让周围变得平和。" },
    { id: 155, name: "火球鼠", type: "火", atk: 52, int: 60, desc: "性格胆小，如果吃惊的话背上的火焰就会烧得更猛烈。" },
    { id: 158, name: "小锯鳄", type: "水", atk: 65, int: 48, desc: "虽然个子小，但下颚很有力，不管什么都会咬碎。" },
    { id: 175, name: "波克比", type: "妖精", atk: 20, int: 65, desc: "壳里装满了幸福。据说如果温柔对待它，就会分给别人好运。" },
    { id: 181, name: "电龙", type: "电", atk: 75, int: 115, desc: "尾巴尖端发出的亮光能照到很远。过去曾被当作灯塔使用。" },
    { id: 196, name: "太阳伊布", type: "超能力", atk: 65, int: 130, desc: "对认可的训练家极其忠诚，据说为了保护训练家而觉醒了预知能力。" },
    { id: 197, name: "月亮伊布", type: "恶", atk: 65, int: 130, desc: "月光改变了伊布的基因。在黑暗中悄无声息地等待猎物。" },
    { id: 202, name: "果然翁", type: "超能力", atk: 33, int: 33, desc: "为了隐藏漆黑的尾巴而住在漆黑的洞窟里。绝对不会主动进攻。" },
    { id: 212, name: "巨钳螳螂", type: "虫/钢", atk: 130, int: 55, desc: "拥有钢铁般坚硬的身体。有着能夹碎任何东西的巨大钳子。" },
    { id: 214, name: "赫拉克罗斯", type: "虫/格斗", atk: 125, int: 40, desc: "力大无穷，能用引以为傲的角将对手轻松甩飞。" },
    { id: 248, name: "班基拉斯", type: "岩石/恶", atk: 134, int: 95, desc: "拥有就算崩坏一座大山也不在乎的力量。会在山中徘徊寻找对手。" },
    { id: 249, name: "洛奇亚", type: "超能力/飞行", atk: 90, int: 154, desc: "被传为海神。拥有轻轻扇动翅膀就能吹飞房屋的破坏力。" },
    { id: 250, name: "凤王", type: "火/飞行", atk: 130, int: 154, desc: "传说它会一边闪耀着七彩翅膀，一边在空中飞行。看到它的人能获得永恒的幸福。" },
    { id: 251, name: "时拉比", type: "草/超能力", atk: 100, int: 100, desc: "跨越时间在各地徘徊。只有在和平的时代才会现身。" }
];

// 辅助函数：根据 ID 获取宝可梦名称和描述（用于补全 251 只）
function getPokemonName(id) {
    const names = {
        13: "独角虫", 14: "铁壳蛹", 15: "大针蜂", 16: "波波", 17: "比比鸟", 18: "大比鸟",
        19: "小拉达", 20: "拉达", 21: "烈雀", 22: "大嘴雀", 23: "阿柏蛇", 24: "阿柏怪",
        27: "穿山鼠", 28: "穿山王", 29: "尼多兰", 30: "尼多娜", 31: "尼多后", 32: "尼多朗",
        33: "尼多力诺", 34: "尼多王", 35: "皮皮", 36: "皮可西", 37: "六尾", 38: "九尾",
        40: "胖可丁", 41: "超音蝠", 42: "大嘴蝠", 43: "走路草", 44: "臭臭花", 45: "霸王花",
        46: "派拉斯", 47: "派拉斯特", 48: "毛球", 49: "摩鲁蛾", 50: "地鼠", 51: "三地鼠",
        53: "猫老大", 55: "哥达鸭", 56: "猴怪", 57: "火暴猴", 60: "蚊香蝌蚪", 61: "蚊香君",
        62: "蚊香泳士", 63: "凯西", 64: "勇基拉", 66: "腕力", 67: "豪力", 69: "喇叭芽",
        70: "口呆花", 71: "大食花", 72: "玛瑙水母", 73: "毒刺水母", 74: "小拳石", 75: "隆隆石",
        76: "隆隆岩", 77: "小火马", 78: "烈焰马", 79: "呆呆兽", 80: "呆壳兽", 81: "小磁怪",
        82: "三合一磁怪", 83: "大葱鸭", 84: "嘟嘟", 85: "嘟嘟利", 86: "小海狮", 87: "白海狮",
        88: "臭泥", 89: "臭臭泥", 90: "大舌贝", 91: "刺甲贝", 92: "鬼斯", 93: "鬼斯通",
        95: "大岩蛇", 96: "催眠貘", 97: "引梦貘人", 98: "大钳蟹", 99: "巨钳蟹",
        153: "月桂叶", 154: "大竺葵", 156: "火岩鼠", 157: "火暴兽", 159: "蓝鳄", 160: "大力鳄",
        161: "尾立", 162: "大尾立", 163: "咕咕", 164: "猫头夜鹰", 165: "芭瓢虫", 166: "安瓢虫",
        172: "皮丘", 179: "咩利羊", 180: "茸茸羊", 183: "玛力露", 184: "玛力露丽", 191: "向日种子",
        192: "向日花怪", 215: "狃拉", 216: "熊宝宝", 217: "圈圈熊", 243: "雷公", 244: "炎帝", 245: "水君"
    };
    return names[id] || `精灵 #${id}`;
}

function getPokemonDesc(id) {
    const descs = {
        13: "头上的毒针非常危险，颜色鲜艳是为了警告敌人。",
        16: "性格温顺，即使受到攻击也只会拍打翅膀飞走。",
        19: "为了寻找食物，一整天都在四处奔走，非常勤奋。",
        23: "悄无声息地游走，会用长长的身体紧紧缠绕猎物。",
        27: "身体能缩成一个球，在沙地上快速滚动躲避攻击。",
        35: "由于长相可爱深受人们喜爱，但非常稀有，不容易见到。",
        37: "刚出生时只有一条白色的尾巴，随着成长会裂成六条。",
        41: "虽然没有眼睛，但能通过发射超声波来探知前方障碍物。",
        43: "白天会把身体埋在土里，晚上才会四处游走散播种子。",
        50: "一直生活在地底下。如果它经过，地表会微微隆起。",
        53: "性格高傲且容易暴躁，额头上的红宝石散发着光芒。",
        56: "稍微一点小事就会让它生气，一旦发怒就会追到天涯海角。",
        60: "肚子上的螺旋纹路其实是它半透明的内脏。",
        63: "一天有 18 个小时都在睡觉，即使在梦中也能瞬间移动。",
        66: "全身都是肌肉，即使是人类的成年男子也无法在力气上胜过它。",
        69: "身体像柳树一样柔软，能躲开任何强力的攻击。",
        74: "长得像圆滚滚的石头，在山路上行走时要小心别踩到它。",
        77: "刚出生时跑得很慢，但通过追逐父母，腿部肌肉会变得强壮。",
        79: "反应非常迟钝，即使尾巴被咬了，也要过半天才会感到痛。",
        81: "会从左右两侧的磁铁中发出强力的电磁波，让仪器失灵。",
        86: "全身覆盖着雪白的皮毛，在极寒的海水中也能自由游动。",
        88: "由于生活在下水道中，全身散发着令人难以忍受的恶臭。",
        90: "外壳极其坚硬，即使是钻石也无法在上面留下划痕。",
        92: "身体有 95% 是由瓦斯组成的，如果不小心被缠住会晕倒。",
        95: "在土里挖掘前进的速度极快，据说能达到时速 80 公里。",
        153: "脖子上的叶子发出的香味能让人充满活力，想去战斗。",
        156: "会用背上喷出的火焰热浪来威慑敌人，保护自己。",
        159: "性格非常粗暴，一旦咬住猎物就绝对不会松口。",
        161: "警戒心很强，总是站起来四处张望，寻找敌人的踪迹。",
        163: "体内有感知地球自转的器官，每天都会准时鸣叫。",
        172: "虽然个子小但能释放强电，只是还无法很好地控制自己。",
        179: "身上的毛由于摩擦产生静电，摸它时要小心被电到。",
        183: "尾巴像气球一样浮在水面上，在激流中也能稳定游泳。",
        191: "会突然从天而降，落在草丛中寻找清晨的露水。",
        215: "性格阴险狡诈，会趁父母不在家时偷走鸟巢里的蛋。",
        216: "喜欢在森林里寻找蜂蜜，找到后会一直舔舐沾满蜜的手掌。",
        243: "伴随着雷鸣降临。背上的云状长毛能释放出雷电。",
        244: "火山爆发时诞生的宝可梦。奔跑时会喷出熔岩般的火焰。",
        245: "据说它出现的地方水源会变清澈，能在大地上自由奔驰。"
    };
    return descs[id] || "这只神秘的宝可梦还没有被详细记录，等待你的发现。";
}

// 为没有定义的宝可梦生成模拟数据 (直到 251)
for (let i = 1; i <= 251; i++) {
    if (!POKEMON_DATA.find(p => p.id === i)) {
        POKEMON_DATA.push({
            id: i,
            name: getPokemonName(i),
            type: i > 151 ? "城都地区" : "关都地区",
            atk: 40 + Math.floor(Math.random() * 60),
            int: 40 + Math.floor(Math.random() * 60),
            desc: getPokemonDesc(i)
        });
    }
}
POKEMON_DATA.sort((a, b) => a.id - b.id);

// 初始化显示
currentLevelElement.textContent = currentLevel;
totalScoreElement.textContent = totalScore;

// 获取关卡目标分数
function getLevelTarget(level) {
    return 50 + (level - 1) * 30; // 每一关增加 30 分难度
}

// 获取或初始化昵称
let FEISHU_USER_NAME = localStorage.getItem("snakeUserName");

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
let hasRevived = false;
let changingDirection = false;
let currentTab = 'score'; // 当前选中的排行榜标签

let leaderboard = [];

try {
    const backup = localStorage.getItem("snakeLeaderboardBackup");
    if (backup) leaderboard = JSON.parse(backup);
} catch (e) {}

function getAvatarColor(name) {
    const colors = ["#2ecc71", "#3498db", "#9b59b6", "#f1c40f", "#e67e22", "#e74c3c", "#1abc9c"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

async function fetchLeaderboard() {
    console.log(`[${APP_VERSION}] 正在同步全网排行...`);
    const originalHeader = document.querySelector('.sidebar-header h2');
    if (originalHeader) originalHeader.innerHTML = '🏆 同步中...';
    
    try {
        const response = await fetch(API_ENDPOINT, { cache: 'no-store' });
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
                leaderboard = data;
                localStorage.setItem("snakeLeaderboardBackup", JSON.stringify(data));
                updateLeaderboardUI();
                console.log("✅ 数据拉取成功");
            }
        }
    } catch (e) {
        console.warn("⚠️ 同步失败，显示本地数据");
    } finally {
        if (originalHeader) originalHeader.innerHTML = '🏆 全球排行榜';
    }
}

setInterval(fetchLeaderboard, 60000);
refreshBoardBtn.addEventListener("click", fetchLeaderboard);

tabScore.addEventListener("click", () => {
    currentTab = 'score';
    tabScore.classList.add('active');
    tabCollection.classList.remove('active');
    updateLeaderboardUI();
});

tabCollection.addEventListener("click", () => {
    currentTab = 'collection';
    tabCollection.classList.add('active');
    tabScore.classList.remove('active');
    updateLeaderboardUI();
});

// highScoreElement.textContent = highScore;
currentLevelElement.textContent = currentLevel;
totalScoreElement.textContent = totalScore;
updateLeaderboardUI();
updateTopAttackersUI();
setTimeout(fetchLeaderboard, 1000);

async function initGame() {
    snake = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
    dx = 0; dy = -1;
    score = 0;
    hasRevived = false;
    scoreElement.textContent = score;
    gameActive = true;
    gameOverModal.classList.add("hidden");
    showPetTalk('start'); // 游戏开始皮卡丘说话
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
        const isTail = index === snake.length - 1;
        
        // 大岩蛇的岩石灰色调
        const rockColor = isHead ? "#95a5a6" : "#7f8c8d";
        const shadowColor = isHead ? "#bdc3c7" : "#34495e";
        
        ctx.shadowBlur = isHead ? 10 : 4;
        ctx.shadowColor = shadowColor;
        ctx.fillStyle = rockColor;
        
        // 计算每一节的大小，使其产生从头到尾逐渐缩小的“岩石链”效果
        const scale = isHead ? 1.1 : Math.max(0.6, 1 - (index / snake.length) * 0.4);
        const size = (gridSize - 2) * scale;
        const offset = (gridSize - size) / 2;

        ctx.beginPath();
        // 使用圆角矩形模拟不规则岩石形状
        ctx.roundRect(
            part.x * gridSize + offset, 
            part.y * gridSize + offset, 
            size, 
            size, 
            isHead ? 8 : 6
        );
        ctx.fill();
        
        // 给蛇头（大岩蛇）加上眼睛和独角特征
        if (isHead) {
            ctx.shadowBlur = 0;
            // 眼睛
            ctx.fillStyle = "white";
            const eyeSize = 4;
            // 根据移动方向调整眼睛位置
            let eyeX1, eyeY1, eyeX2, eyeY2;
            if (dx === 1) { // 向右
                eyeX1 = eyeX2 = part.x * gridSize + gridSize - 8;
                eyeY1 = part.y * gridSize + 6; eyeY2 = part.y * gridSize + gridSize - 10;
            } else if (dx === -1) { // 向左
                eyeX1 = eyeX2 = part.x * gridSize + 4;
                eyeY1 = part.y * gridSize + 6; eyeY2 = part.y * gridSize + gridSize - 10;
            } else if (dy === 1) { // 向下
                eyeY1 = eyeY2 = part.y * gridSize + gridSize - 8;
                eyeX1 = part.x * gridSize + 6; eyeX2 = part.x * gridSize + gridSize - 10;
            } else { // 向上或初始
                eyeY1 = eyeY2 = part.y * gridSize + 4;
                eyeX1 = part.x * gridSize + 6; eyeX2 = part.x * gridSize + gridSize - 10;
            }
            ctx.beginPath(); ctx.arc(eyeX1 + eyeSize/2, eyeY1 + eyeSize/2, eyeSize/2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(eyeX2 + eyeSize/2, eyeY2 + eyeSize/2, eyeSize/2, 0, Math.PI * 2); ctx.fill();
            
            // 黑瞳孔
            ctx.fillStyle = "black";
            ctx.beginPath(); ctx.arc(eyeX1 + eyeSize/2, eyeY1 + eyeSize/2, 1, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(eyeX2 + eyeSize/2, eyeY2 + eyeSize/2, 1, 0, Math.PI * 2); ctx.fill();
        }

        ctx.shadowBlur = 0;
    });
}

function moveSnake() {
    if (dx === 0 && dy === 0) return;
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    if (head.x === foodX && head.y === foodY) {
        score += 10;
        totalScore += 10; // 累计总分
        scoreElement.textContent = score;
        totalScoreElement.textContent = totalScore;
        localStorage.setItem("snakeTotalScore", totalScore);

        if (score % 30 === 0) showPetTalk('eat'); // 偶尔吃果子说话
        
        // 检查是否达到关卡目标
        if (score >= getLevelTarget(currentLevel)) {
            levelUp();
        }

        if (score > highScore) {
            highScore = score;
            localStorage.setItem("snakeHighScore", highScore);
        }
        placeFood();
    } else { snake.pop(); }
}

function levelUp() {
    currentLevel++;
    currentLevelElement.textContent = currentLevel;
    localStorage.setItem("snakeCurrentLevel", currentLevel);
    
    // 获得一次抽卡机会
    pendingDraws++;
    localStorage.setItem("snakePendingDraws", pendingDraws);
    showPetTalk('levelUp'); // 升级说话
    
    // 暂停游戏，弹出抽卡界面
    gameActive = false;
    showGachaModal();
}

// --- 抽卡逻辑 ---
function showGachaModal() {
    gachaModal.classList.remove("hidden");
    newCard.classList.add("hidden");
    newCard.classList.remove("flipped");
    drawBtn.classList.remove("hidden");
    closeGachaBtn.classList.add("hidden");
}

drawBtn.addEventListener("click", () => {
    if (pendingDraws <= 0) return;
    
    // 随机抽取一只 (1-251)
    const randomIndex = Math.floor(Math.random() * POKEMON_DATA.length);
    const pokemon = POKEMON_DATA[randomIndex];
    
    // 更新 UI
    pokemonImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
    pokemonName.textContent = pokemon.name;
    pokemonType.textContent = pokemon.type;
    pokemonDesc.textContent = pokemon.desc;
    pokemonAtk.textContent = pokemon.atk;
    pokemonInt.textContent = pokemon.int;
    
    // 翻牌动画
    newCard.classList.remove("hidden");
    setTimeout(() => {
        newCard.classList.add("flipped");
        
        // 加入收集
        if (!myCollection.includes(pokemon.id)) {
            myCollection.push(pokemon.id);
            localStorage.setItem("snakeCollection", JSON.stringify(myCollection));
            updateTopAttackersUI(); // 更新战力前三展示
        }
        
        pendingDraws--;
        localStorage.setItem("snakePendingDraws", pendingDraws);
        
        drawBtn.classList.add("hidden");
        closeGachaBtn.classList.remove("hidden");
    }, 100);
});

closeGachaBtn.addEventListener("click", () => {
    gachaModal.classList.add("hidden");
    // 重置本关分数，继续游戏
    score = 0;
    scoreElement.textContent = score;
    initGame(); 
});

// --- 弹窗关闭逻辑 ---
closeGameOverBtn.addEventListener("click", () => gameOverModal.classList.add("hidden"));
closeDetailBtn.addEventListener("click", () => pokemonDetailModal.classList.add("hidden"));

// --- 图鉴逻辑 ---
function updateTopAttackersUI() {
    if (myCollection.length === 0) {
        attackersList.innerHTML = '<div class="empty-attacker">暂无强力精灵</div>';
        return;
    }

    // 获取已收集精灵的完整数据
    const collectedData = myCollection.map(id => POKEMON_DATA.find(p => p.id === id)).filter(Boolean);
    
    // 按攻击力排序
    const sorted = collectedData.sort((a, b) => b.atk - a.atk).slice(0, 3);

    attackersList.innerHTML = "";
    sorted.forEach((p, index) => {
        const item = document.createElement("div");
        item.className = "attacker-item";
        item.title = `${p.name} - 攻击力: ${p.atk}`;
        item.onclick = () => showPokemonDetail(p.id);

        item.innerHTML = `
            <span class="attacker-rank">${index + 1}</span>
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${p.id}.gif" class="attacker-img" alt="${p.name}">
            <span class="attacker-atk">⚔️ ${p.atk}</span>
        `;
        attackersList.appendChild(item);
    });
}

function updateCollectionUI() {
    collectionGrid.innerHTML = "";
    collectionCountElement.textContent = myCollection.length;
    
    POKEMON_DATA.forEach(p => {
        const isUnlocked = myCollection.includes(p.id);
        const item = document.createElement("div");
        item.className = `collection-item ${isUnlocked ? 'unlocked' : ''}`;
        
        item.innerHTML = `
            <span class="id-badge">#${p.id}</span>
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png" alt="${p.name}">
        `;

        if (isUnlocked) {
            item.addEventListener("click", () => showPokemonDetail(p.id));
        }
        collectionGrid.appendChild(item);
    });
}

function showPokemonDetail(id) {
    const p = POKEMON_DATA.find(item => item.id === id);
    if (!p) return;

    detailImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`;
    detailName.textContent = p.name;
    detailType.textContent = p.type;
    detailDesc.textContent = p.desc;
    detailAttack.textContent = p.atk;
    detailInt.textContent = p.int;

    pokemonDetailModal.classList.remove("hidden");
}

openCollectionBtn.addEventListener("click", () => {
    updateCollectionUI();
    collectionModal.classList.remove("hidden");
});

closeCollectionBtn.addEventListener("click", () => {
    collectionModal.classList.add("hidden");
});

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
    
    if (!hasRevived) {
        reviveBtn.style.display = "inline-block";
    } else {
        reviveBtn.style.display = "none";
    }
    
    gameOverModal.classList.remove("hidden");
    showPetTalk('die'); // 死亡说话
    userInfoDisplay.innerHTML = `玩家: <span id="feishuName">${FEISHU_USER_NAME}</span> (正在本地保存...)`;
    
    // 无论分数是否为 0，都尝试同步一次（因为可能有新的收集）
    updateLocalLeaderboard(FEISHU_USER_NAME, score, myCollection.length);
    updateLeaderboardUI();
    
    try {
        userInfoDisplay.innerHTML = `玩家: <span id="feishuName">${FEISHU_USER_NAME}</span> (正在全网同步...)`;
        await syncToCloud();
        userInfoDisplay.innerHTML = `玩家: <span id="feishuName">${FEISHU_USER_NAME}</span> (全网同步成功 ✅)`;
    } catch (e) {
        console.error("同步失败:", e);
        userInfoDisplay.innerHTML = `玩家: <span id="feishuName">${FEISHU_USER_NAME}</span> (全网同步失败，已暂存本地)`;
    }
}

function updateLocalLeaderboard(name, score, collCount) {
    const idx = leaderboard.findIndex(i => i.name === name);
    if (idx !== -1) {
        // 更新最高分和最高收集数
        if (score > (leaderboard[idx].score || 0)) {
            leaderboard[idx].score = score;
        }
        if (collCount > (leaderboard[idx].coll || 0)) {
            leaderboard[idx].coll = collCount;
        }
        leaderboard[idx].date = new Date().toLocaleDateString();
    } else {
        leaderboard.push({ 
            name, 
            score: score, 
            coll: collCount, 
            date: new Date().toLocaleDateString() 
        });
    }
    // 排序逻辑在 UI 渲染时处理，保持原始数据完整
    localStorage.setItem("snakeLeaderboardBackup", JSON.stringify(leaderboard));
}

async function syncToCloud() {
    // 1. 获取最新云端
    const getRes = await fetch(API_ENDPOINT);
    if (getRes.ok) {
        const cloudData = await getRes.json();
        if (Array.isArray(cloudData)) mergeData(cloudData);
    }

    // 2. 推送更新
    const putRes = await fetch(API_ENDPOINT, {
        method: 'POST', // npoint.io 使用 POST 更新数据
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leaderboard)
    });
    
    if (!putRes.ok) throw new Error("npoint Sync failed");
}

function mergeData(cloudData) {
    cloudData.forEach(cloudItem => {
        const localIdx = leaderboard.findIndex(i => i.name === cloudItem.name);
        if (localIdx === -1) {
            leaderboard.push(cloudItem);
        } else {
            // 合并逻辑：保留最高分和最高收集
            leaderboard[localIdx].score = Math.max(leaderboard[localIdx].score || 0, cloudItem.score || 0);
            leaderboard[localIdx].coll = Math.max(leaderboard[localIdx].coll || 0, cloudItem.coll || 0);
        }
    });
}

function updateLeaderboardUI() {
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<div class="empty-msg">暂无记录，快来抢占沙发！</div>';
        return;
    }

    // 根据当前选中的标签进行排序
    let displayList = [...leaderboard];
    if (currentTab === 'score') {
        displayList.sort((a, b) => (b.score || 0) - (a.score || 0));
    } else {
        displayList.sort((a, b) => (b.coll || 0) - (a.coll || 0));
    }

    // 仅显示前 10 名
    displayList = displayList.slice(0, 10);

    leaderboardList.innerHTML = "";
    displayList.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "leaderboard-item";
        const initial = item.name.charAt(0).toUpperCase();
        const color = getAvatarColor(item.name);
        
        // 根据类型显示数值
        const val = currentTab === 'score' ? (item.score || 0) : `${item.coll || 0} 只`;
        
        div.innerHTML = `
            <span class="rank">${index + 1}</span>
            <div class="avatar" style="background: ${color}">${initial}</div>
            <span class="name">${item.name}</span>
            <span class="score">${val}</span>
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

// 移动端控制
btnUp.addEventListener("click", () => handleMobileClick('UP'));
btnDown.addEventListener("click", () => handleMobileClick('DOWN'));
btnLeft.addEventListener("click", () => handleMobileClick('LEFT'));
btnRight.addEventListener("click", () => handleMobileClick('RIGHT'));

function handleMobileClick(dir) {
    if (!gameActive && gameOverModal.classList.contains("hidden") && nicknameModal.classList.contains("hidden")) {
        initGame();
        return;
    }
    // 如果游戏未激活且不是在暂停等待复活的状态，则不响应方向键
    if (!gameActive) return;
    
    const KEYS = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40 };
    changeDirection({ keyCode: KEYS[dir], preventDefault: () => {} });
}

// 阻止移动端浏览器默认滚动（在 Canvas 区域）
canvas.addEventListener("touchstart", (e) => e.preventDefault(), { passive: false });
canvas.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });
restartBtn.addEventListener("click", initGame);

reviveBtn.addEventListener("click", () => {
    // 模拟观看广告
    const confirmWatch = confirm("观看穿山甲激励视频广告即可原地复活，是否观看？");
    if (confirmWatch) {
        alert("模拟播放穿山甲激励视频广告中...\n\n播放完毕！感谢观看，获得一次复活机会！");
        
        hasRevived = true;
        gameOverModal.classList.add("hidden");
        
        // 原地复活逻辑：
        // 1. 移除当前撞击死亡的蛇头，后退一步
        snake.shift();
        
        // 如果蛇已经没有身体了（比如长度很短的情况），给一个默认安全的蛇头
        if (snake.length === 0) {
            snake = [{ x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) }];
        }
        
        // 2. 清除当前运动方向，等待玩家重新输入方向（游戏暂停状态）
        dx = 0; dy = 0; 
        
        gameActive = true;
        
        // 宠物鼓励
        petBubble.textContent = "Pika! 满血复活，别再死了！";
        petBubble.classList.add("show");
        setTimeout(() => petBubble.classList.remove("show"), 3000);
        
        clearTimeout(gameLoopTimeout);
        gameLoop();
    }
});

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
