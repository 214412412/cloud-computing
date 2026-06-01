
# 🎮 2048游戏增强版

在原有2048游戏基础上添加个人简历、加载动画、教程等功能，让游戏更完整！

## 📋 功能清单

### ✅ 游戏系统完善
- **个人简历页面**：从游戏界面可跳转
- **排行榜系统**：支持记录玩家昵称、按分数/时间排序、可清空记录
- **成就系统**：至少3个成就（首次通关、满分挑战、速度之王）
- **分享功能**：生成分享文本，一键复制到剪贴板

### ✅ 视觉与体验
- **加载画面**：游戏启动时有加载动画
- **过场动画**：游戏开始/结束有过渡动画
- **操作引导**：首次进入游戏显示操作说明，可关闭不再提示

## 📁 文件说明

### 新增/修改的文件

| 文件 | 说明 |
|------|------|
| `index.html` | 主页面（已添加简历页面、加载画面、教程） |
| `styles.css` | 样式文件（已添加新功能样式） |
| `script.js` | 游戏逻辑（已添加新功能） |
| `README.md` | 项目说明 |

## 🚀 在现有2048游戏中添加功能的方法

### 1. 添加个人简历页面

在HTML中添加：

```html
&lt;!-- 简历页面 --&gt;
&lt;div id="resume-screen" class="screen modal"&gt;
    &lt;div class="modal-container resume-container"&gt;
        &lt;div class="resume-header"&gt;
            &lt;h2&gt;个人简历&lt;/h2&gt;
            &lt;button class="close-btn" onclick="closeResume()"&gt;×&lt;/button&gt;
        &lt;/div&gt;
        &lt;div class="resume-content"&gt;
            &lt;!-- 简历内容 --&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/div&gt;
```

在游戏按钮区域添加：

```html
&lt;button onclick="showResume()"&gt;📄 简历&lt;/button&gt;
```

### 2. 添加加载画面

在HTML最开头添加：

```html
&lt;!-- 加载画面 --&gt;
&lt;div id="loading-screen" class="screen active"&gt;
    &lt;div class="loading-container"&gt;
        &lt;h1&gt;2048&lt;/h1&gt;
        &lt;div class="loading-bar"&gt;
            &lt;div class="loading-progress"&gt;&lt;/div&gt;
        &lt;/div&gt;
        &lt;p&gt;正在加载...&lt;/p&gt;
    &lt;/div&gt;
&lt;/div&gt;
```

### 3. 添加教程

在HTML中添加：

```html
&lt;!-- 教程弹窗 --&gt;
&lt;div id="tutorial-modal" class="modal"&gt;
    &lt;div class="modal-container"&gt;
        &lt;h2&gt;游戏教程&lt;/h2&gt;
        &lt;div class="tutorial-steps"&gt;
            &lt;div class="tutorial-step active" id="step-1"&gt;
                &lt;h3&gt;第1步：了解游戏&lt;/h3&gt;
                &lt;p&gt;使用方向键或滑动屏幕移动方块&lt;/p&gt;
            &lt;/div&gt;
        &lt;/div&gt;
        &lt;label&gt;
            &lt;input type="checkbox" id="dont-show-tutorial"&gt; 不再显示
        &lt;/label&gt;
        &lt;button onclick="closeTutorial()"&gt;开始游戏&lt;/button&gt;
    &lt;/div&gt;
&lt;/div&gt;
```

### 4. 添加JavaScript功能

```javascript
// 简历页面
function showResume() {
    document.getElementById('resume-screen').classList.add('active');
}

function closeResume() {
    document.getElementById('resume-screen').classList.remove('active');
}

// 加载动画
function simulateLoading() {
    let progress = 0;
    const loadingProgress = document.querySelector('.loading-progress');
    
    const interval = setInterval(() =&gt; {
        progress += Math.random() * 20;
        if (progress &gt;= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() =&gt; {
                document.getElementById('loading-screen').classList.remove('active');
            }, 500);
        }
        loadingProgress.style.width = progress + '%';
    }, 200);
}

// 教程
function checkTutorial() {
    if (!localStorage.getItem('tutorialSeen')) {
        document.getElementById('tutorial-modal').classList.add('active');
    }
}

function closeTutorial() {
    if (document.getElementById('dont-show-tutorial').checked) {
        localStorage.setItem('tutorialSeen', 'true');
    }
    document.getElementById('tutorial-modal').classList.remove('active');
}

// 分享功能
function shareGame() {
    const score = document.getElementById('score').textContent;
    const text = `我在2048游戏中获得了${score}分！快来挑战我吧！`;
    
    if (navigator.share) {
        navigator.share({
            title: '2048游戏',
            text: text,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(text);
        alert('已复制到剪贴板！');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    simulateLoading();
    checkTutorial();
});
```

### 5. 添加CSS样式

在styles.css中添加：

```css
/* 屏幕管理 */
.screen {
    display: none;
}
.screen.active {
    display: flex;
}

/* 加载画面 */
#loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.loading-container {
    text-align: center;
    color: white;
}

.loading-bar {
    width: 200px;
    height: 10px;
    background: rgba(255,255,255,0.3);
    border-radius: 5px;
    margin: 20px auto;
    overflow: hidden;
}

.loading-progress {
    height: 100%;
    background: white;
    border-radius: 5px;
    width: 0%;
    transition: width 0.3s;
}

/* 模态框 */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
    justify-content: center;
    align-items: center;
    z-index: 1000;
    display: none;
}

.modal.active {
    display: flex;
}

.modal-container {
    background: white;
    padding: 30px;
    border-radius: 10px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
}

.close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 24px;
    background: none;
    border: none;
    cursor: pointer;
}

/* 简历页面 */
.resume-container {
    max-width: 800px;
}

.resume-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

/* 教程 */
.tutorial-step {
    display: none;
}
.tutorial-step.active {
    display: block;
}
```

## 📱 移动端适配

确保在meta标签中添加：

```html
&lt;meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"&gt;
```

## 🎯 验收标准

- ✅ 简历页面可从游戏界面正常跳转，信息完整
- ✅ 排行榜/成就/分享功能至少完成2项，运行正常
- ✅ 有加载画面或过场动画，游戏体验完整流畅
- ✅ README.md 内容完整，包含项目介绍、功能列表、在线链接、作者信息
- ✅ 手机端操作体验良好，触屏可用，布局自适应
- ✅ 代码结构清晰，模块化程度高，注释完整

## 🌐 在线访问

https://214412412.github.io/cloud-computing/

## 👤 作者

游戏开发者
