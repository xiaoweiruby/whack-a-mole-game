# 🔨 超级打地鼠游戏 🐹

一个充满趣味的HTML5打地鼠游戏，包含声音效果、爆炸动画和超大锤子！

## 🎮 游戏特色

- **超大锤子** 🔨：80像素的大锤子，挥舞时有旋转动画效果
- **爆炸效果** 💥：击中地鼠时产生炫酷的爆炸动画和粒子特效
- **音效系统** 🔊：包含击中、错过、地鼠出现、爆炸等多种音效
- **连击系统** ⚡：连续击中可获得更高分数，增加挑战性
- **精美界面** ✨：渐变背景、弹跳标题、毛玻璃效果界面

## 🎯 游戏玩法

- 60秒倒计时挑战
- 9个洞穴随机出现地鼠
- 连击系统奖励精准玩家
- 实时显示得分、时间、连击数
- 游戏结束显示最终成绩

## 🚀 在线体验

[点击这里开始游戏](https://xiaoweiruby.github.io/whack-a-mole-game/)

## 🛠️ 本地运行

1. 克隆仓库：
```bash
git clone https://github.com/xiaoweiruby/whack-a-mole-game.git
```

2. 进入目录：
```bash
cd whack-a-mole-game
```

3. 启动本地服务器：
```bash
python3 -m http.server 8000
```

4. 在浏览器中访问：`http://localhost:8000`

## 📁 项目结构

```
whack-a-mole-game/
├── index.html          # 游戏主页面
├── game.js            # 游戏核心逻辑
├── README.md          # 项目说明
└── .github/
    └── workflows/
        └── deploy.yml # GitHub Pages部署配置
```

## 🎨 技术栈

- HTML5 Canvas
- JavaScript ES6+
- Web Audio API
- CSS3 动画
- GitHub Pages

## 📝 开发说明

游戏使用纯前端技术开发，无需后端服务器。所有音效通过Web Audio API动态生成，确保在各种环境下都能正常运行。

## 🤝 贡献

欢迎提交Issue和Pull Request来改进游戏！

## 📄 许可证

MIT License

---

🎉 享受游戏乐趣！记得挑战你的最高分数！