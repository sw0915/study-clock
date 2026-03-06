// 学习闹钟提醒 - 主程序（单用户版）

// ========== 全局函数（供HTML onclick调用）==========
function closeSettingsModal() {
    if (window.userSettings) {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
    }
}

function handleSaveSettings() {
    const nameInput = document.getElementById('newUserName');
    const name = nameInput.value.trim();
    const identityElement = document.querySelector('input[name="identity"]:checked');
    const identity = identityElement ? identityElement.value : 'student';

    if (!name) {
        nameInput.style.borderColor = '#ef5350';
        nameInput.placeholder = '请输入名字';
        setTimeout(() => {
            nameInput.style.borderColor = '#667eea';
            nameInput.placeholder = '请输入名字';
        }, 2000);
        return false;
    }

    // 保存设置
    if (!window.savedNames) {
        window.savedNames = JSON.parse(localStorage.getItem('savedNames')) || { student: '', toddler: '' };
    }
    window.savedNames[identity] = name;
    localStorage.setItem('savedNames', JSON.stringify(window.savedNames));

    window.userSettings = { name, identity, customSchedules: null };
    localStorage.setItem('userSettings', JSON.stringify(window.userSettings));

    // 同步本地变量引用
    userSettings = window.userSettings;
    savedNames = window.savedNames;

    // 关闭弹窗
    const modal = document.getElementById('settingsModal');
    modal.classList.remove('show');
    modal.style.display = 'none';

    // 更新页面
    if (typeof updatePageTitle === 'function') updatePageTitle();
    if (typeof renderTasks === 'function') renderTasks();

    return false;
}

// 默认小学生时间表
const defaultStudentSchedules = {
    weekday: [
        { time: '07:00', task: '起床', message: '{name}同学，现在是7点整，准备起床啦！', repeatMessage: '{name}同学，再不起床就迟到啦！', enabled: true },
        { time: '07:15', task: '晨读/背单词', message: '{name}同学，该晨读背单词啦，一天之计在于晨哦！', repeatMessage: '{name}同学，晨读时间快结束了，抓紧时间哦！', enabled: true },
        { time: '07:30', task: '早餐', message: '{name}同学，该吃早餐啦，吃饱才有力气学习！', repeatMessage: '{name}同学，记得吃早餐哦，不然会饿的！', enabled: true },
        { time: '08:00', task: '上学出发', message: '{name}同学，该出发上学啦，检查一下书包带齐了吗？', repeatMessage: '{name}同学，快点出发，不然要迟到啦！', enabled: true },
        { time: '12:00', task: '午餐', message: '{name}同学，该吃午餐啦，好好补充能量！', repeatMessage: '{name}同学，记得按时吃饭哦！', enabled: true },
        { time: '12:30', task: '午休', message: '{name}同学，该午休啦，休息一下下午更有精神！', repeatMessage: '{name}同学，快去休息一下吧！', enabled: true },
        { time: '14:00', task: '下午课程', message: '{name}同学，下午的课程开始啦，加油！', repeatMessage: '{name}同学，专心听课哦！', enabled: true },
        { time: '17:30', task: '放学', message: '{name}同学，放学啦，回家路上注意安全！', repeatMessage: '', enabled: true },
        { time: '18:00', task: '晚餐', message: '{name}同学，该吃晚餐啦！', repeatMessage: '{name}同学，快来吃饭！', enabled: true },
        { time: '19:00', task: '写作业', message: '{name}同学，该写作业啦，先复习今天学的内容哦！', repeatMessage: '{name}同学，作业写完了吗？要按时完成哦！', enabled: true },
        { time: '20:00', task: '阅读名著', message: '{name}同学，该阅读名著啦，书籍是人类进步的阶梯！', repeatMessage: '{name}同学，继续阅读哦，坚持就是胜利！', enabled: true },
        { time: '20:30', task: '听英语', message: '{name}同学，该听英语啦，练习听力很重要哦！', repeatMessage: '{name}同学，英语听力练习要坚持哦！', enabled: true },
        { time: '21:00', task: '背古诗词', message: '{name}同学，该背古诗词啦，腹有诗书气自华！', repeatMessage: '{name}同学，古诗词背得怎么样啦？', enabled: true },
        { time: '21:30', task: '洗漱准备', message: '{name}同学，该洗漱准备睡觉啦，整理好书包哦！', repeatMessage: '{name}同学，快去洗漱吧！', enabled: true },
        { time: '22:00', task: '睡觉', message: '{name}同学，该睡觉啦，早睡早起身体好，晚安！', repeatMessage: '{name}同学，快睡觉吧，明天还要早起呢！', enabled: true }
    ],
    weekend: [
        { time: '08:00', task: '起床', message: '{name}同学，8点啦，虽然是周末也要早起哦！', repeatMessage: '{name}同学，太阳晒屁股啦，快起床！', enabled: true },
        { time: '08:30', task: '早餐', message: '{name}同学，该吃早餐啦！', repeatMessage: '{name}同学，记得吃早餐哦！', enabled: true },
        { time: '09:00', task: '写作业', message: '{name}同学，周末作业该开始写啦！', repeatMessage: '{name}同学，作业进度怎么样啦？', enabled: true },
        { time: '10:30', task: '休息', message: '{name}同学，休息一下，活动活动筋骨！', repeatMessage: '', enabled: true },
        { time: '10:45', task: '继续学习', message: '{name}同学，休息好了继续学习吧！', repeatMessage: '{name}同学，加油完成作业！', enabled: true },
        { time: '12:00', task: '午餐', message: '{name}同学，该吃午餐啦！', repeatMessage: '', enabled: true },
        { time: '12:30', task: '午休', message: '{name}同学，该午休啦！', repeatMessage: '', enabled: true },
        { time: '14:00', task: '阅读/兴趣学习', message: '{name}同学，下午可以读读书或者发展一下兴趣爱好哦！', repeatMessage: '{name}同学，享受学习的乐趣吧！', enabled: true },
        { time: '16:00', task: '自由活动', message: '{name}同学，自由活动时间到，可以出去玩玩啦！', repeatMessage: '', enabled: true },
        { time: '18:00', task: '晚餐', message: '{name}同学，该吃晚餐啦！', repeatMessage: '', enabled: true },
        { time: '19:00', task: '复习/预习', message: '{name}同学，该复习今天学的、预习明天要学的啦！', repeatMessage: '{name}同学，学习要温故知新哦！', enabled: true },
        { time: '21:00', task: '洗漱', message: '{name}同学，该洗漱准备睡觉啦！', repeatMessage: '', enabled: true },
        { time: '21:30', task: '睡觉', message: '{name}同学，该睡觉啦，晚安！', repeatMessage: '{name}同学，快睡觉吧！', enabled: true }
    ]
};

// 默认婴幼儿时间表
const defaultToddlerSchedules = {
    weekday: [
        { time: '07:30', task: '起床', message: '{name}小朋友，太阳公公出来啦，准备伸伸胳膊蹬蹬腿，你的小鱼儿等着你给它们喂食呢！', repeatMessage: '{name}小朋友，小鸟都在唱歌啦，快起床和小鸟一起玩吧！', enabled: true },
        { time: '08:00', task: '早餐', message: '{name}小朋友，香喷喷的早餐准备好啦，今天想吃什么呢？', repeatMessage: '{name}小朋友，肚子饿不饿呀？快来吃早餐！', enabled: true },
        { time: '09:00', task: '听儿歌', message: '{name}小朋友，今天我们来听好听的儿歌吧！', repeatMessage: '{name}小朋友，想听什么儿歌呀？', enabled: true },
        { time: '09:30', task: '户外活动', message: '{name}小朋友，我们去外面玩吧，晒晒太阳身体好！', repeatMessage: '{name}小朋友，外面的花儿在等你呢！', enabled: true },
        { time: '10:30', task: '加餐', message: '{name}小朋友，吃点心时间到啦，来吃点好吃的东西吧！', repeatMessage: '{name}小朋友，点心在等你哦！', enabled: true },
        { time: '11:30', task: '午餐', message: '{name}小朋友，该吃午餐啦，要乖乖吃饭哦！', repeatMessage: '{name}小朋友，快来吃饭，吃完我们去玩！', enabled: true },
        { time: '12:30', task: '午睡', message: '{name}小朋友，该午睡啦，小兔子也要睡觉觉哦！', repeatMessage: '{name}小朋友，闭上眼睛，数羊羊啦！', enabled: true },
        { time: '14:30', task: '起床/吃点心', message: '{name}小朋友，睡醒啦，来吃点好吃的点心吧！', repeatMessage: '{name}小朋友，点心在等你哦！', enabled: true },
        { time: '15:00', task: '看绘本', message: '{name}小朋友，我们来看绘本故事吧！', repeatMessage: '{name}小朋友，这本绘本真好看呀！', enabled: true },
        { time: '16:00', task: '游戏/玩具', message: '{name}小朋友，游戏时间到啦，想玩什么玩具呢？', repeatMessage: '{name}小朋友，积木在等你搭城堡呢！', enabled: true },
        { time: '17:00', task: '看动画片', message: '{name}小朋友，可以看一小会儿动画片啦！', repeatMessage: '', enabled: true },
        { time: '18:00', task: '晚餐', message: '{name}小朋友，该吃晚餐啦！', repeatMessage: '{name}小朋友，快来吃饭饭！', enabled: true },
        { time: '19:00', task: '洗澡', message: '{name}小朋友，该洗澡澡啦，洗得香香的！', repeatMessage: '{name}小朋友，小鸭子在浴缸等你呢！', enabled: true },
        { time: '19:30', task: '听故事', message: '{name}小朋友，故事时间到啦，今天想听什么故事呢？', repeatMessage: '{name}小朋友，妈妈给你讲个好听的故事吧！', enabled: true },
        { time: '20:30', task: '睡觉', message: '{name}小朋友，该睡觉觉啦，月亮姐姐说晚安！', repeatMessage: '{name}小朋友，闭上眼睛，甜甜的梦在等你哦！', enabled: true }
    ],
    weekend: [
        { time: '08:00', task: '起床', message: '{name}小朋友，早上好呀，今天想做什么好玩的事情呢？', repeatMessage: '{name}小朋友，快起床，美好的一天开始啦！', enabled: true },
        { time: '08:30', task: '早餐', message: '{name}小朋友，早餐时间到啦！', repeatMessage: '', enabled: true },
        { time: '09:00', task: '听儿歌', message: '{name}小朋友，我们来听好听的儿歌吧！', repeatMessage: '', enabled: true },
        { time: '09:30', task: '学唱歌', message: '{name}小朋友，今天来学唱一首新歌吧！', repeatMessage: '', enabled: true },
        { time: '10:00', task: '亲子游戏', message: '{name}小朋友，和爸爸妈妈一起玩游戏啦！', repeatMessage: '{name}小朋友，我们来玩捉迷藏吧！', enabled: true },
        { time: '11:00', task: '户外玩耍', message: '{name}小朋友，我们去公园玩吧！', repeatMessage: '{name}小朋友，滑滑梯在等你呢！', enabled: true },
        { time: '12:00', task: '午餐', message: '{name}小朋友，该吃午餐啦！', repeatMessage: '', enabled: true },
        { time: '13:00', task: '午睡', message: '{name}小朋友，该午睡啦！', repeatMessage: '', enabled: true },
        { time: '15:00', task: '看绘本', message: '{name}小朋友，我们来看绘本故事吧！', repeatMessage: '', enabled: true },
        { time: '16:00', task: '手工/绘画', message: '{name}小朋友，我们来画画做手工吧！', repeatMessage: '{name}小朋友，想画什么呀？', enabled: true },
        { time: '17:00', task: '自由活动', message: '{name}小朋友，自由玩耍时间到啦！', repeatMessage: '', enabled: true },
        { time: '18:00', task: '晚餐', message: '{name}小朋友，该吃晚餐啦！', repeatMessage: '', enabled: true },
        { time: '19:00', task: '洗澡', message: '{name}小朋友，该洗澡澡啦！', repeatMessage: '', enabled: true },
        { time: '19:30', task: '听故事', message: '{name}小朋友，故事时间到啦！', repeatMessage: '', enabled: true },
        { time: '20:30', task: '睡觉', message: '{name}小朋友，该睡觉觉啦，晚安！', repeatMessage: '', enabled: true }
    ]
};

// 全局状态 - 单用户（使用window以便全局函数访问）
window.userSettings = JSON.parse(localStorage.getItem('userSettings')) || null;  // {name, identity, customSchedules}
window.savedNames = JSON.parse(localStorage.getItem('savedNames')) || { student: '', toddler: '' };  // 保存各身份的名称
window.completedTasks = JSON.parse(localStorage.getItem('completedTasks') || '{}');
window.inProgressTasks = JSON.parse(localStorage.getItem('inProgressTasks') || '{}');  // 进行中的任务
window.passedTasks = JSON.parse(localStorage.getItem('passedTasks') || '{}');  // 已过期任务（用户未响应）
window.reminderStatus = JSON.parse(localStorage.getItem('reminderStatus') || '{}');
window.selectedVoice = null;
window.editingSchedules = null;

// 为了兼容现有代码，创建本地引用
let userSettings = window.userSettings;
let savedNames = window.savedNames;
let completedTasks = window.completedTasks;
let inProgressTasks = window.inProgressTasks;
let passedTasks = window.passedTasks;
let reminderStatus = window.reminderStatus;
let selectedVoice = window.selectedVoice;
let editingSchedules = window.editingSchedules;

// 获取用户的时间表
function getSchedules() {
    if (userSettings && userSettings.customSchedules) {
        return userSettings.customSchedules;
    }
    return userSettings && userSettings.identity === 'toddler' ? defaultToddlerSchedules : defaultStudentSchedules;
}

// 获取默认时间表
function getDefaultSchedules() {
    return userSettings && userSettings.identity === 'toddler' ? defaultToddlerSchedules : defaultStudentSchedules;
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    checkSettings();
    initVoices();
    renderTasks();
    updateTime();
    setInterval(updateTime, 1000);
    setInterval(checkReminders, 15000);
    setupEventListeners();
});

// 检查用户设置
function checkSettings() {
    if (!userSettings) {
        // 首次使用，填充默认身份的保存名称
        const defaultIdentity = 'student';
        document.querySelector(`input[name="identity"][value="${defaultIdentity}"]`).checked = true;
        document.getElementById('newUserName').value = savedNames[defaultIdentity] || '';
        document.getElementById('settingsModal').classList.add('show');
    } else {
        document.getElementById('settingsModal').classList.remove('show');
        updatePageTitle();
    }
}

// 更新页面标题
function updatePageTitle() {
    const titleEl = document.getElementById('pageTitle');
    if (userSettings) {
        titleEl.textContent = userSettings.identity === 'toddler'
            ? `${userSettings.name}的作息提醒`
            : `${userSettings.name}的学习闹钟`;
    } else {
        titleEl.textContent = '小贝塔闹钟';
    }
}

// 初始化语音
function initVoices() {
    const voiceSelect = document.getElementById('voiceSelect');

    function populateVoices() {
        const voices = speechSynthesis.getVoices();
        voiceSelect.innerHTML = '';

        const chineseVoices = voices.filter(v => v.lang.includes('zh') || v.lang.includes('CN'));
        const otherVoices = voices.filter(v => !v.lang.includes('zh') && !v.lang.includes('CN'));
        const sortedVoices = [...chineseVoices, ...otherVoices];

        sortedVoices.forEach((voice) => {
            const actualIndex = voices.indexOf(voice);
            const option = document.createElement('option');
            option.value = actualIndex;
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });

        if (sortedVoices.length > 0) {
            selectedVoice = voices[voiceSelect.value ? parseInt(voiceSelect.value) : 0];
        }
    }

    populateVoices();
    speechSynthesis.onvoiceschanged = populateVoices;

    voiceSelect.addEventListener('change', (e) => {
        selectedVoice = speechSynthesis.getVoices()[parseInt(e.target.value)];
    });
}

// 更新时间显示
function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-CN', { hour12: false });
    const dateStr = now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    document.getElementById('currentTime').textContent = timeStr;
    document.getElementById('currentDate').textContent = dateStr;

    // 更新日期类型显示（工作日/周末/节假日）
    const dayType = document.getElementById('dayType');
    const dayTypeText = getDayTypeText();
    dayType.textContent = dayTypeText;

    if (isHolidayOrWeekend()) {
        dayType.className = 'day-badge weekend';
    } else {
        dayType.className = 'day-badge weekday';
    }

    updateTaskStatus();
}

// 获取当前日期字符串
function getTodayKey() {
    return new Date().toISOString().split('T')[0];
}

// 中国节假日数据（格式：'YYYY-MM-DD': '节日名称'）
const chineseHolidays = {
    // 2025年节假日
    '2025-01-01': '元旦',
    '2025-01-28': '春节',
    '2025-01-29': '春节',
    '2025-01-30': '春节',
    '2025-01-31': '春节',
    '2025-02-01': '春节',
    '2025-02-02': '春节',
    '2025-02-03': '春节',
    '2025-02-04': '春节',
    '2025-04-04': '清明节',
    '2025-04-05': '清明节',
    '2025-04-06': '清明节',
    '2025-05-01': '劳动节',
    '2025-05-02': '劳动节',
    '2025-05-03': '劳动节',
    '2025-05-04': '劳动节',
    '2025-05-05': '劳动节',
    '2025-05-31': '端午节',
    '2025-06-01': '端午节',
    '2025-06-02': '端午节',
    '2025-10-01': '国庆节',
    '2025-10-02': '国庆节',
    '2025-10-03': '国庆节',
    '2025-10-04': '国庆节',
    '2025-10-05': '国庆节',
    '2025-10-06': '国庆节',
    '2025-10-07': '国庆节',
    '2025-10-08': '国庆节',
    '2025-10-06': '中秋节',
    // 2026年节假日
    '2026-01-01': '元旦',
    '2026-01-02': '元旦',
    '2026-01-03': '元旦',
    '2026-02-17': '春节',
    '2026-02-18': '春节',
    '2026-02-19': '春节',
    '2026-02-20': '春节',
    '2026-02-21': '春节',
    '2026-02-22': '春节',
    '2026-02-23': '春节',
    '2026-04-05': '清明节',
    '2026-04-06': '清明节',
    '2026-04-07': '清明节',
    '2026-05-01': '劳动节',
    '2026-05-02': '劳动节',
    '2026-05-03': '劳动节',
    '2026-05-04': '劳动节',
    '2026-05-05': '劳动节',
    '2026-06-19': '端午节',
    '2026-06-20': '端午节',
    '2026-06-21': '端午节',
    '2026-10-01': '国庆节',
    '2026-10-02': '国庆节',
    '2026-10-03': '国庆节',
    '2026-10-04': '国庆节',
    '2026-10-05': '国庆节',
    '2026-10-06': '国庆节',
    '2026-10-07': '国庆节',
    '2026-10-08': '国庆节',
    '2026-09-25': '中秋节',
};

// 调休工作日（周末需要上班的日期）
const workdays = {
    // 2025年调休
    '2025-01-26': true,  // 春节调休
    '2025-02-08': true,  // 春节调休
    '2025-04-27': true,  // 劳动节调休
    '2025-09-28': true,  // 国庆节调休
    '2025-10-11': true,  // 国庆节调休
    // 2026年调休
    '2026-01-25': true,  // 春节调休
    '2026-02-14': true,  // 春节调休
    '2026-04-26': true,  // 劳动节调休
    '2026-09-27': true,  // 国庆节调休
    '2026-10-10': true,  // 国庆节调休
};

// 获取今天的节日名称
function getTodayHoliday() {
    const todayKey = getTodayKey();
    return chineseHolidays[todayKey] || null;
}

// 判断今天是否是节假日或周末
function isHolidayOrWeekend() {
    const todayKey = getTodayKey();
    const day = new Date().getDay();

    // 如果是调休工作日，返回false
    if (workdays[todayKey]) {
        return false;
    }

    // 如果是节假日
    if (chineseHolidays[todayKey]) {
        return true;
    }

    // 如果是周末
    return day === 0 || day === 6;
}

// 判断今天是否是周末（保留原函数兼容性）
function isWeekend() {
    return isHolidayOrWeekend();
}

// 获取今天的时间表类型
function getScheduleType() {
    return isHolidayOrWeekend() ? 'weekend' : 'weekday';
}

// 获取今天类型显示文本
function getDayTypeText() {
    const holiday = getTodayHoliday();
    if (holiday) {
        return holiday;
    }

    const day = new Date().getDay();
    if (day === 0) return '周日';
    if (day === 6) return '周六';

    return '工作日';
}

// 渲染任务列表
function renderTasks() {
    if (!userSettings) return;

    const schedules = getSchedules();
    const todayKey = getTodayKey();
    const currentScheduleType = getScheduleType();
    const isHoliday = isHolidayOrWeekend();

    if (!completedTasks[todayKey]) {
        completedTasks[todayKey] = {};
    }

    // 隐藏切换标签，只显示当天对应的时间表
    const scheduleTabs = document.getElementById('scheduleTabs');
    const weekdayPanel = document.getElementById('weekday');
    const weekendPanel = document.getElementById('weekend');

    if (isHoliday) {
        scheduleTabs.style.display = 'none';
        weekdayPanel.style.display = 'none';
        weekendPanel.style.display = 'block';
    } else {
        scheduleTabs.style.display = 'none';
        weekdayPanel.style.display = 'block';
        weekendPanel.style.display = 'none';
    }

    // 更新时间表标题
    const holiday = getTodayHoliday();
    if (holiday) {
        document.getElementById('weekendTitle').textContent = `🎊 ${holiday}`;
    } else if (isHoliday) {
        document.getElementById('weekendTitle').textContent = '🌞 周末';
    } else {
        document.getElementById('weekdayTitle').textContent = '🏫 工作日';
    }

    ['weekday', 'weekend'].forEach(type => {
        const container = document.getElementById(`${type}Tasks`);
        container.innerHTML = '';

        schedules[type].forEach((item, index) => {
            const taskKey = `${type}-${index}`;
            const isCompleted = completedTasks[todayKey][taskKey];
            const isEnabled = item.enabled !== false;  // 默认开启

            const taskEl = document.createElement('div');
            taskEl.className = 'task-item';
            if (isCompleted) {
                taskEl.classList.add('completed');
            }
            if (!isEnabled) {
                taskEl.classList.add('disabled');
            }

            taskEl.innerHTML = `
                <input type="checkbox" class="task-checkbox"
                    ${isCompleted ? 'checked' : ''}
                    data-type="${type}" data-index="${index}">
                <span class="task-time">${item.time}</span>
                <span class="task-content">${item.task}</span>
                <label class="alarm-toggle">
                    <input type="checkbox" class="alarm-switch"
                        ${isEnabled ? 'checked' : ''}
                        data-type="${type}" data-index="${index}">
                    <span class="alarm-slider"></span>
                </label>
                <span class="task-status"></span>
            `;
            container.appendChild(taskEl);
        });
    });

    updateTaskStatus();
}

// 更新任务状态
function updateTaskStatus() {
    if (!userSettings) return;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const scheduleType = isWeekend() ? 'weekend' : 'weekday';
    const todayKey = getTodayKey();
    const schedules = getSchedules();

    // 找出下一个即将到来的任务
    let nextTask = null;
    let nextTaskIndex = -1;

    schedules[scheduleType].forEach((item, index) => {
        const [hours, minutes] = item.time.split(':').map(Number);
        const taskTime = hours * 60 + minutes;
        const isEnabled = item.enabled !== false;

        if (taskTime > currentTime && isEnabled && nextTaskIndex === -1) {
            nextTask = item;
            nextTaskIndex = index;
        }
    });

    // 更新所有任务的状态
    schedules[scheduleType].forEach((item, index) => {
        const [hours, minutes] = item.time.split(':').map(Number);
        const taskTime = hours * 60 + minutes;
        const taskKey = `${scheduleType}-${index}`;
        const isEnabled = item.enabled !== false;

        const taskEl = document.querySelector(`[data-type="${scheduleType}"][data-index="${index}"].task-checkbox`)?.closest('.task-item');
        const statusEl = taskEl?.querySelector('.task-status');
        const alarmSwitch = taskEl?.querySelector('.alarm-switch');
        const checkbox = taskEl?.querySelector('.task-checkbox');

        if (!taskEl) return;

        // 清除所有状态类
        taskEl.classList.remove('current', 'upcoming', 'passed', 'completed');

        const isCompleted = completedTasks[todayKey]?.[taskKey];
        const isPassed = passedTasks[todayKey]?.[taskKey];  // 用户未响应导致的过期
        const isInProgress = inProgressTasks[todayKey]?.[taskKey];

        // 判断任务状态
        if (isCompleted) {
            // 已完成 - 禁止用户取消勾选
            taskEl.classList.add('completed');
            if (statusEl) {
                statusEl.textContent = '已完成';
                statusEl.className = 'task-status done';
            }
            if (alarmSwitch) {
                alarmSwitch.disabled = true;
                alarmSwitch.checked = false;
            }
            if (checkbox) {
                checkbox.disabled = true;
                checkbox.checked = true;
            }
        } else if (isPassed) {
            // 已过期（用户未在5分钟内响应）- 永久过期，禁止操作
            taskEl.classList.add('passed');
            if (statusEl) {
                statusEl.textContent = '已过期';
                statusEl.className = 'task-status passed';
            }
            if (alarmSwitch) {
                alarmSwitch.disabled = true;
                alarmSwitch.checked = false;
            }
            if (checkbox) {
                checkbox.disabled = true;
            }
        } else if (isInProgress) {
            // 进行中 - 点击了"知道了"，禁止用户操作
            taskEl.classList.add('current');
            if (statusEl) {
                statusEl.textContent = '进行中';
                statusEl.className = 'task-status current';
            }
            if (alarmSwitch) {
                alarmSwitch.disabled = true;
                alarmSwitch.checked = false;
            }
            if (checkbox) {
                checkbox.disabled = false;  // 允许用户勾选完成
                checkbox.checked = false;
            }
        } else if (taskTime <= currentTime) {
            // 时间已过 - 已过期，禁止操作
            taskEl.classList.add('passed');
            if (statusEl) {
                statusEl.textContent = '已过期';
                statusEl.className = 'task-status passed';
            }
            if (alarmSwitch) {
                alarmSwitch.disabled = true;
                alarmSwitch.checked = false;
            }
            if (checkbox) {
                checkbox.disabled = true;
            }
        } else if (index === nextTaskIndex) {
            // 即将到来的任务
            taskEl.classList.add('upcoming');
            if (statusEl) {
                statusEl.textContent = '即将到来';
                statusEl.className = 'task-status upcoming';
            }
            if (checkbox) {
                checkbox.disabled = true;  // 即将到来的任务不允许提前勾选
            }
        } else {
            // 其他未来任务
            if (checkbox) {
                checkbox.disabled = true;  // 未来任务不允许提前勾选
            }
        }
    });

    const nextTaskText = document.getElementById('nextTaskText');
    if (nextTask) {
        nextTaskText.textContent = `${nextTask.time} - ${nextTask.task}`;
    } else {
        nextTaskText.textContent = '今日任务已全部完成';
    }

    updateProgress();
}

// 更新进度
function updateProgress() {
    if (!userSettings) return;

    const todayKey = getTodayKey();
    const scheduleType = isWeekend() ? 'weekend' : 'weekday';
    const schedules = getSchedules();

    // 只统计已启用的任务
    const enabledTasks = schedules[scheduleType].filter(item => item.enabled !== false);
    const total = enabledTasks.length;

    const completed = Object.keys(completedTasks[todayKey] || {}).filter(k => {
        const [, indexStr] = k.split('-');
        const index = parseInt(indexStr);
        return schedules[scheduleType][index]?.enabled !== false;
    }).length;

    const percentage = total > 0 ? (completed / total) * 100 : 0;
    document.getElementById('progressFill').style.width = `${percentage}%`;
    document.getElementById('progressText').textContent = `已完成 ${completed}/${total} 项任务`;
}

// ========== 提醒逻辑 ==========
// 检查提醒
function checkReminders() {
    if (!userSettings) return;

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const scheduleType = isWeekend() ? 'weekend' : 'weekday';
    const todayKey = getTodayKey();
    const schedules = getSchedules();

    schedules[scheduleType].forEach((item, index) => {
        if (item.time === currentTime && item.enabled !== false) {
            const taskKey = `${scheduleType}-${index}`;
            const reminderKey = `${todayKey}-${taskKey}`;

            // 检查是否已完成
            if (completedTasks[todayKey]?.[taskKey]) return;

            if (!reminderStatus[reminderKey]) {
                // 首次提醒
                showReminder(item, taskKey, reminderKey, true);
            } else {
                // 重复提醒检查（2分钟后）
                const elapsed = now.getTime() - reminderStatus[reminderKey].lastTime;
                if (elapsed >= 120000 && item.repeatMessage) {
                    showReminder(item, taskKey, reminderKey, false);
                }
            }
        }
    });
}

// 当前提醒的任务key（用于点击"知道了"后自动完成）
let currentReminderTaskKey = null;
// 语音重复播报相关
let reminderRepeatTimer = null;
let reminderRepeatCount = 0;
const MAX_REMINDER_REPEAT = 5;
const REMINDER_REPEAT_INTERVAL = 8000; // 8秒重复一次
// 5分钟超时自动关闭
let reminderTimeoutTimer = null;
let reminderTimeoutCountdown = null;
const REMINDER_TIMEOUT_MS = 5 * 60 * 1000; // 5分钟
const REMINDER_COUNTDOWN_INTERVAL = 1000; // 1秒更新一次

// 停止所有提醒相关定时器
function stopAllReminderTimers() {
    if (reminderRepeatTimer) {
        clearTimeout(reminderRepeatTimer);
        reminderRepeatTimer = null;
    }
    if (reminderTimeoutTimer) {
        clearTimeout(reminderTimeoutTimer);
        reminderTimeoutTimer = null;
    }
    if (reminderTimeoutCountdown) {
        clearInterval(reminderTimeoutCountdown);
        reminderTimeoutCountdown = null;
    }
    reminderRepeatCount = 0;
    speechSynthesis.cancel();
}

// 显示提醒
function showReminder(item, taskKey, reminderKey, isFirst) {
    const modal = document.getElementById('reminderModal');
    const text = document.getElementById('reminderText');

    const msg = isFirst ? item.message : item.repeatMessage;
    const displayText = msg.replace(/{name}/g, userSettings.name);

    text.textContent = displayText;
    modal.classList.add('show');
    modal.style.display = 'flex'; // 确保modal显示

    // 隐藏倒计时显示
    const countdownEl = document.getElementById('reminderCountdown');
    if (countdownEl) countdownEl.style.display = 'none';

    // 保存当前提醒的taskKey，用于点击"知道了"后自动完成
    currentReminderTaskKey = taskKey;

    // 停止之前的定时器（如果有）
    stopAllReminderTimers();

    // 首次播报
    reminderRepeatCount = 1;
    speak(displayText);
    playNotificationSound();

    // 设置重复播报
    scheduleReminderRepeat(displayText, taskKey);

    // 更新提醒状态
    const now = new Date();
    reminderStatus[reminderKey] = {
        count: (reminderStatus[reminderKey]?.count || 0) + 1,
        lastTime: now.getTime()
    };
    localStorage.setItem('reminderStatus', JSON.stringify(reminderStatus));

    // 更新任务列表显示
    updateTaskStatus();
}

// 安排语音重复播报
function scheduleReminderRepeat(displayText, taskKey) {
    reminderRepeatTimer = setTimeout(() => {
        // 检查是否还在显示提醒弹窗
        const modal = document.getElementById('reminderModal');
        if (!modal.classList.contains('show') || modal.style.display === 'none') {
            stopAllReminderTimers();
            return;
        }

        // 检查是否达到最大重复次数
        if (reminderRepeatCount >= MAX_REMINDER_REPEAT) {
            // 开始5分钟倒计时
            startReminderTimeout(taskKey);
            return;
        }

        // 继续播报
        reminderRepeatCount++;
        speak(displayText);
        playNotificationSound();

        // 继续安排下一次重复
        scheduleReminderRepeat(displayText, taskKey);
    }, REMINDER_REPEAT_INTERVAL);
}

// 开始5分钟超时倒计时
function startReminderTimeout(taskKey) {
    // 显示倒计时
    const countdownEl = document.getElementById('reminderCountdown');
    if (countdownEl) {
        countdownEl.style.display = 'block';
    }

    let remainingSeconds = REMINDER_TIMEOUT_MS / 1000;

    // 更新倒计时显示
    function updateCountdown() {
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        if (countdownEl) {
            countdownEl.textContent = `请在 ${minutes}:${seconds.toString().padStart(2, '0')} 内点击"知道了"，否则任务将标记为已过期`;
        }
    }

    updateCountdown();

    // 每秒更新倒计时
    reminderTimeoutCountdown = setInterval(() => {
        remainingSeconds--;
        if (remainingSeconds <= 0) {
            // 超时，自动关闭并标记为已过期
            autoExpireTask(taskKey);
        } else {
            updateCountdown();
        }
    }, REMINDER_COUNTDOWN_INTERVAL);

    // 设置超时定时器（备用）
    reminderTimeoutTimer = setTimeout(() => {
        autoExpireTask(taskKey);
    }, REMINDER_TIMEOUT_MS);
}

// 超时自动标记任务为已过期
function autoExpireTask(taskKey) {
    stopAllReminderTimers();

    // 关闭弹窗
    const modal = document.getElementById('reminderModal');
    modal.classList.remove('show');
    modal.style.display = 'none';

    // 标记任务为已过期（通过不添加到inProgressTasks，让它自然成为passed状态）
    // 同时添加到passedTasks以明确标记
    const todayKey = getTodayKey();
    if (!window.passedTasks) {
        window.passedTasks = JSON.parse(localStorage.getItem('passedTasks') || '{}');
    }
    if (!window.passedTasks[todayKey]) {
        window.passedTasks[todayKey] = {};
    }
    window.passedTasks[todayKey][taskKey] = true;
    localStorage.setItem('passedTasks', JSON.stringify(window.passedTasks));

    // 清除当前任务key
    currentReminderTaskKey = null;

    // 更新任务列表显示
    updateTaskStatus();
}

// 播放提示音
function playNotificationSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);

        setTimeout(() => {
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            osc2.frequency.value = 1000;
            osc2.type = 'sine';
            gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            osc2.start(audioContext.currentTime);
            osc2.stop(audioContext.currentTime + 0.5);
        }, 200);
    } catch (e) {
        console.log('Audio not supported');
    }
}

// 语音播报
function speak(text) {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.9;
        utterance.volume = parseFloat(document.getElementById('volumeSlider').value);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        speechSynthesis.speak(utterance);
    }
}

// ========== 编辑时间表功能 ==========
// 打开编辑弹窗
function openEditModal() {
    if (!userSettings) return;
    editingSchedules = JSON.parse(JSON.stringify(getSchedules()));
    renderEditForm();
    document.getElementById('editModal').classList.add('show');
}

// 关闭编辑弹窗
function closeEditModal() {
    document.getElementById('editModal').classList.remove('show');
    editingSchedules = null;
}

// 渲染编辑表单
function renderEditForm() {
    ['weekday', 'weekend'].forEach(type => {
        const editor = document.getElementById(`${type}Editor`);
        editor.innerHTML = '';

        editingSchedules[type].forEach((item, index) => {
            const taskEl = createTaskEditItem(type, index, item);
            editor.appendChild(taskEl);
        });
    });
}

// 创建任务编辑项
function createTaskEditItem(type, index, item) {
    const div = document.createElement('div');
    div.className = 'task-edit-item';
    div.dataset.type = type;
    div.dataset.index = index;

    div.innerHTML = `
        <input type="time" class="time-input" value="${item.time}" data-field="time">
        <input type="text" class="task-input" value="${item.task}" placeholder="任务名称" data-field="task">
        <button class="btn-delete-task">删除</button>
        <input type="text" class="message-input" value="${item.message}" placeholder="语音提示内容（使用{name}代表名字）" data-field="message">
        <input type="text" class="repeat-input" value="${item.repeatMessage || ''}" placeholder="重复提醒内容（可选）" data-field="repeatMessage">
    `;

    // 绑定输入事件
    div.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', (e) => {
            const field = e.target.dataset.field;
            editingSchedules[type][index][field] = e.target.value;
        });
    });

    // 绑定删除事件
    div.querySelector('.btn-delete-task').addEventListener('click', () => {
        editingSchedules[type].splice(index, 1);
        renderEditForm();
    });

    return div;
}

// 添加新任务
function addTask(type) {
    const newTask = {
        time: '12:00',
        task: '新任务',
        message: '{name}，该做新任务啦！',
        repeatMessage: '',
        enabled: true
    };
    editingSchedules[type].push(newTask);
    renderEditForm();

    const editor = document.getElementById(`${type}Editor`);
    editor.scrollTop = editor.scrollHeight;
}

// 保存时间表
function saveSchedule() {
    if (!userSettings) return;

    // 按时间排序
    ['weekday', 'weekend'].forEach(type => {
        editingSchedules[type].sort((a, b) => a.time.localeCompare(b.time));
    });

    // 保存到用户设置
    userSettings.customSchedules = editingSchedules;
    localStorage.setItem('userSettings', JSON.stringify(userSettings));

    // 同步全局变量
    window.userSettings = userSettings;

    // 清除今日完成状态、进行中状态和提醒状态
    const todayKey = getTodayKey();
    delete completedTasks[todayKey];
    delete inProgressTasks[todayKey];
    delete passedTasks[todayKey];
    Object.keys(reminderStatus).forEach(key => {
        if (key.startsWith(todayKey)) {
            delete reminderStatus[key];
        }
    });
    localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
    localStorage.setItem('inProgressTasks', JSON.stringify(inProgressTasks));
    localStorage.setItem('passedTasks', JSON.stringify(passedTasks));
    localStorage.setItem('reminderStatus', JSON.stringify(reminderStatus));

    renderTasks();
    closeEditModal();
    speak('时间表已保存');
}

// 重置为默认时间表
function resetSchedule() {
    if (!userSettings) return;

    if (confirm('确定要恢复默认时间表吗？你的自定义设置将被清除。')) {
        userSettings.customSchedules = null;
        localStorage.setItem('userSettings', JSON.stringify(userSettings));
        // 同步全局变量
        window.userSettings = userSettings;
        editingSchedules = JSON.parse(JSON.stringify(getDefaultSchedules()));
        renderEditForm();
    }
}

// 切换闹钟开关
function toggleAlarm(type, index, enabled) {
    const schedules = getSchedules();
    if (userSettings.customSchedules) {
        userSettings.customSchedules[type][index].enabled = enabled;
    } else {
        // 如果没有自定义时间表，需要创建一个
        userSettings.customSchedules = JSON.parse(JSON.stringify(getDefaultSchedules()));
        userSettings.customSchedules[type][index].enabled = enabled;
    }
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
    // 同步全局变量
    window.userSettings = userSettings;
    updateTaskStatus();
}

// 设置事件监听
function setupEventListeners() {
    // 身份切换时自动填充保存的名称
    document.querySelectorAll('input[name="identity"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const identity = e.target.value;
            const nameInput = document.getElementById('newUserName');
            nameInput.value = savedNames[identity] || '';
        });
    });

    // 保存设置函数 - 使用window变量确保全局同步
    function saveUserSettings() {
        const nameInput = document.getElementById('newUserName');
        const name = nameInput.value.trim();
        const identityElement = document.querySelector('input[name="identity"]:checked');
        const identity = identityElement ? identityElement.value : 'student';

        if (!name) {
            nameInput.style.borderColor = '#ef5350';
            nameInput.placeholder = '请输入名字';
            setTimeout(() => {
                nameInput.style.borderColor = '#667eea';
                nameInput.placeholder = '请输入名字';
            }, 2000);
            return;
        }

        // 保存该身份的名称 - 使用window变量
        if (!window.savedNames) {
            window.savedNames = JSON.parse(localStorage.getItem('savedNames')) || { student: '', toddler: '' };
        }
        window.savedNames[identity] = name;
        localStorage.setItem('savedNames', JSON.stringify(window.savedNames));

        // 更新全局设置
        window.userSettings = { name, identity, customSchedules: null };
        localStorage.setItem('userSettings', JSON.stringify(window.userSettings));

        // 同步本地变量引用
        userSettings = window.userSettings;
        savedNames = window.savedNames;

        // Android兼容：使用多种方式关闭弹窗
        const settingsModal = document.getElementById('settingsModal');
        settingsModal.classList.remove('show');
        settingsModal.style.display = 'none';

        updatePageTitle();
        renderTasks();

        // Android兼容：延迟播放语音，需要用户交互
        const welcomeMsg = identity === 'toddler'
            ? `${name}小朋友你好，我是你的小助手，会提醒你该做什么事情啦！`
            : `${name}同学你好，我是你的学习小助手，会提醒你学习和休息的时间！`;
        setTimeout(() => {
            try {
                speak(welcomeMsg);
            } catch(e) {
                console.log('语音播放需要用户交互');
            }
        }, 500);
    }

    // 保存设置 - 支持click和touchend事件（Android兼容）
    const saveSettingsBtn = document.getElementById('saveSettings');
    saveSettingsBtn.addEventListener('click', saveUserSettings);
    saveSettingsBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        saveUserSettings();
    });

    // 打开设置（编辑当前用户）
    document.getElementById('openSettings').addEventListener('click', () => {
        if (userSettings) {
            document.getElementById('newUserName').value = userSettings.name;
            document.querySelector(`input[name="identity"][value="${userSettings.identity}"]`).checked = true;
        } else {
            // 如果没有设置，使用默认身份并填充保存的名称
            const defaultIdentity = 'student';
            document.querySelector(`input[name="identity"][value="${defaultIdentity}"]`).checked = true;
            document.getElementById('newUserName').value = savedNames[defaultIdentity] || '';
        }
        // Android兼容：使用多种方式打开弹窗
        const settingsModal = document.getElementById('settingsModal');
        settingsModal.classList.add('show');
        settingsModal.style.display = 'flex';
    });

    // 关闭设置弹窗
    document.getElementById('closeSettingsModal').addEventListener('click', () => {
        // 只有已设置用户时才能关闭
        if (userSettings) {
            const settingsModal = document.getElementById('settingsModal');
            settingsModal.classList.remove('show');
            settingsModal.style.display = 'none';
        }
    });

    // 点击背景关闭设置弹窗
    document.getElementById('settingsModal').addEventListener('click', (e) => {
        if (e.target.id === 'settingsModal' && userSettings) {
            const settingsModal = document.getElementById('settingsModal');
            settingsModal.classList.remove('show');
            settingsModal.style.display = 'none';
        }
    });

    // 任务勾选
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('task-checkbox')) {
            const type = e.target.dataset.type;
            const index = e.target.dataset.index;
            const todayKey = getTodayKey();
            const taskKey = `${type}-${index}`;

            if (!completedTasks[todayKey]) {
                completedTasks[todayKey] = {};
            }

            if (e.target.checked) {
                completedTasks[todayKey][taskKey] = true;
            } else {
                delete completedTasks[todayKey][taskKey];
            }

            localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
            renderTasks();
        }

        // 闹钟开关
        if (e.target.classList.contains('alarm-switch')) {
            const type = e.target.dataset.type;
            const index = parseInt(e.target.dataset.index);
            toggleAlarm(type, index, e.target.checked);
        }
    });

    // 测试语音
    document.getElementById('voiceTest').addEventListener('click', () => {
        if (userSettings) {
            const msg = userSettings.identity === 'toddler'
                ? `${userSettings.name}小朋友，语音测试成功啦！`
                : `${userSettings.name}同学，语音测试成功！`;
            speak(msg);
        }
    });

    // 重置今日
    document.getElementById('resetToday').addEventListener('click', () => {
        if (confirm('确定要重置今日所有任务吗？')) {
            const todayKey = getTodayKey();
            completedTasks[todayKey] = {};
            inProgressTasks[todayKey] = {};
            passedTasks[todayKey] = {};
            Object.keys(reminderStatus).forEach(key => {
                if (key.startsWith(todayKey)) {
                    delete reminderStatus[key];
                }
            });
            localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
            localStorage.setItem('inProgressTasks', JSON.stringify(inProgressTasks));
            localStorage.setItem('passedTasks', JSON.stringify(passedTasks));
            localStorage.setItem('reminderStatus', JSON.stringify(reminderStatus));
            renderTasks();
        }
    });

    // 关闭提醒弹窗 - 点击"知道了"标记任务为"进行中"
    document.getElementById('reminderClose').addEventListener('click', () => {
        const reminderModal = document.getElementById('reminderModal');
        reminderModal.classList.remove('show');
        reminderModal.style.display = 'none';
        stopAllReminderTimers(); // 停止所有定时器

        // 标记任务为"进行中"
        if (currentReminderTaskKey) {
            const todayKey = getTodayKey();
            if (!inProgressTasks[todayKey]) {
                inProgressTasks[todayKey] = {};
            }
            inProgressTasks[todayKey][currentReminderTaskKey] = true;
            localStorage.setItem('inProgressTasks', JSON.stringify(inProgressTasks));
            updateTaskStatus();
            currentReminderTaskKey = null;
        }
    });

    document.getElementById('reminderModal').addEventListener('click', (e) => {
        if (e.target.id === 'reminderModal') {
            const reminderModal = document.getElementById('reminderModal');
            reminderModal.classList.remove('show');
            reminderModal.style.display = 'none';
            stopAllReminderTimers(); // 停止所有定时器

            // 点击背景也标记任务为"进行中"
            if (currentReminderTaskKey) {
                const todayKey = getTodayKey();
                if (!inProgressTasks[todayKey]) {
                    inProgressTasks[todayKey] = {};
                }
                inProgressTasks[todayKey][currentReminderTaskKey] = true;
                localStorage.setItem('inProgressTasks', JSON.stringify(inProgressTasks));
                updateTaskStatus();
                currentReminderTaskKey = null;
            }
        }
    });

    // ========== 编辑时间表事件 ==========
    document.getElementById('editSchedule').addEventListener('click', openEditModal);
    document.getElementById('closeEditModal').addEventListener('click', closeEditModal);

    document.getElementById('editModal').addEventListener('click', (e) => {
        if (e.target.id === 'editModal') {
            closeEditModal();
        }
    });

    // 编辑 Tab 切换
    document.querySelectorAll('.edit-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.edit-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.edit-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const tabId = `edit${btn.dataset.editTab.charAt(0).toUpperCase() + btn.dataset.editTab.slice(1)}`;
            document.getElementById(tabId).classList.add('active');
        });
    });

    // 添加任务
    document.querySelectorAll('.btn-add-task').forEach(btn => {
        btn.addEventListener('click', () => {
            addTask(btn.dataset.type);
        });
    });

    // 保存时间表
    document.getElementById('saveSchedule').addEventListener('click', saveSchedule);

    // 重置时间表
    document.getElementById('resetSchedule').addEventListener('click', resetSchedule);

    // ========== 今日进度详情功能 ==========
    // 显示进度详情
    document.getElementById('showProgressDetail').addEventListener('click', showProgressDetail);

    // 关闭进度详情
    document.getElementById('closeProgressDetail').addEventListener('click', () => {
        document.getElementById('progressDetailModal').style.display = 'none';
    });

    document.getElementById('closeProgressDetailBtn').addEventListener('click', () => {
        document.getElementById('progressDetailModal').style.display = 'none';
    });

    document.getElementById('progressDetailModal').addEventListener('click', (e) => {
        if (e.target.id === 'progressDetailModal') {
            document.getElementById('progressDetailModal').style.display = 'none';
        }
    });
}

// 显示今日进度详情
function showProgressDetail() {
    if (!userSettings) return;

    const todayKey = getTodayKey();
    const scheduleType = isWeekend() ? 'weekend' : 'weekday';
    const schedules = getSchedules();
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const completedList = document.getElementById('completedTaskList');
    const inProgressList = document.getElementById('inProgressTaskList');
    const pendingList = document.getElementById('pendingTaskList');
    const passedList = document.getElementById('passedTaskList');

    completedList.innerHTML = '';
    inProgressList.innerHTML = '';
    pendingList.innerHTML = '';
    passedList.innerHTML = '';

    let completedCount = 0;
    let inProgressCount = 0;
    let pendingCount = 0;
    let passedCount = 0;

    schedules[scheduleType].forEach((item, index) => {
        const [hours, minutes] = item.time.split(':').map(Number);
        const taskTime = hours * 60 + minutes;
        const taskKey = `${scheduleType}-${index}`;
        const isCompleted = completedTasks[todayKey]?.[taskKey];
        const isPassed = passedTasks[todayKey]?.[taskKey];  // 用户未响应导致的过期
        const isInProgress = inProgressTasks[todayKey]?.[taskKey];
        const isEnabled = item.enabled !== false;

        if (!isEnabled) return;  // 跳过已禁用的任务

        const detailItem = document.createElement('div');
        detailItem.className = 'detail-item';
        detailItem.innerHTML = `
            <span class="detail-time">${item.time}</span>
            <span class="detail-task">${item.task}</span>
        `;

        if (isCompleted) {
            detailItem.classList.add('completed');
            completedList.appendChild(detailItem);
            completedCount++;
        } else if (isPassed) {
            // 用户未响应导致的过期
            detailItem.classList.add('passed');
            passedList.appendChild(detailItem);
            passedCount++;
        } else if (isInProgress) {
            detailItem.classList.add('inprogress');
            inProgressList.appendChild(detailItem);
            inProgressCount++;
        } else if (taskTime <= currentTime) {
            detailItem.classList.add('passed');
            passedList.appendChild(detailItem);
            passedCount++;
        } else {
            detailItem.classList.add('pending');
            pendingList.appendChild(detailItem);
            pendingCount++;
        }
    });

    // 如果某类别为空，显示提示
    if (completedCount === 0) {
        completedList.innerHTML = '<div class="detail-empty">暂无已完成的任务</div>';
    }
    if (inProgressCount === 0) {
        inProgressList.innerHTML = '<div class="detail-empty">暂无进行中的任务</div>';
    }
    if (pendingCount === 0) {
        pendingList.innerHTML = '<div class="detail-empty">暂无待完成的任务</div>';
    }
    if (passedCount === 0) {
        passedList.innerHTML = '<div class="detail-empty">暂无已过期的任务</div>';
    }

    document.getElementById('progressDetailModal').style.display = 'block';
}
