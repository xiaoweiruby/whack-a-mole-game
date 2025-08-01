/**
 * 超级打地鼠游戏 - 主要游戏逻辑
 * 包含地鼠管理、锤子动画、爆炸效果、声音系统等功能
 */

class WhackAMoleGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.timeLeft = 60;
        this.combo = 0;
        this.maxCombo = 0;
        this.gameRunning = false;
        this.gameTimer = null;
        
        // 游戏配置
        this.holes = [];
        this.moles = [];
        this.explosions = [];
        this.particles = [];
        
        // 锤子相关
        this.hammer = {
            x: 0,
            y: 0,
            size: 80,
            rotation: 0,
            isSwinging: false,
            swingProgress: 0
        };
        
        // 声音系统
        this.sounds = {
            hit: this.createSound(800, 0.1, 'square'),
            miss: this.createSound(200, 0.1, 'sawtooth'),
            popup: this.createSound(400, 0.05, 'sine'),
            explosion: this.createSound(150, 0.2, 'noise')
        };
        
        this.initGame();
        this.bindEvents();
        this.gameLoop();
    }
    
    /**
     * 初始化游戏
     */
    initGame() {
        // 创建9个洞穴（3x3网格）
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                this.holes.push({
                    x: 150 + col * 200,
                    y: 150 + row * 150,
                    radius: 60,
                    hasMole: false,
                    moleTimer: 0
                });
            }
        }
    }
    
    /**
     * 绑定事件监听器
     */
    bindEvents() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.hammer.x = e.clientX - rect.left;
            this.hammer.y = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('click', (e) => {
            if (this.gameRunning) {
                this.swingHammer();
                this.checkHit();
            }
        });
    }
    
    /**
     * 创建音效
     */
    createSound(frequency, duration, type = 'sine') {
        return () => {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
                oscillator.type = type;
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            } catch (e) {
                console.log('音频播放失败:', e);
            }
        };
    }
    
    /**
     * 开始游戏
     */
    startGame() {
        this.gameRunning = true;
        this.score = 0;
        this.timeLeft = 60;
        this.combo = 0;
        this.maxCombo = 0;
        this.moles = [];
        this.explosions = [];
        this.particles = [];
        
        // 重置洞穴状态
        this.holes.forEach(hole => {
            hole.hasMole = false;
            hole.moleTimer = 0;
        });
        
        // 开始计时器
        this.gameTimer = setInterval(() => {
            this.timeLeft--;
            this.updateUI();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
        
        this.updateUI();
    }
    
    /**
     * 暂停游戏
     */
    pauseGame() {
        this.gameRunning = !this.gameRunning;
        if (!this.gameRunning && this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        } else if (this.gameRunning) {
            this.gameTimer = setInterval(() => {
                this.timeLeft--;
                this.updateUI();
                
                if (this.timeLeft <= 0) {
                    this.endGame();
                }
            }, 1000);
        }
    }
    
    /**
     * 重置游戏
     */
    resetGame() {
        this.gameRunning = false;
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        this.score = 0;
        this.timeLeft = 60;
        this.combo = 0;
        this.maxCombo = 0;
        this.moles = [];
        this.explosions = [];
        this.particles = [];
        
        this.holes.forEach(hole => {
            hole.hasMole = false;
            hole.moleTimer = 0;
        });
        
        this.updateUI();
    }
    
    /**
     * 结束游戏
     */
    endGame() {
        this.gameRunning = false;
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('maxCombo').textContent = this.maxCombo;
        document.getElementById('gameOver').style.display = 'block';
    }
    
    /**
     * 更新UI显示
     */
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('time').textContent = this.timeLeft;
        document.getElementById('combo').textContent = this.combo;
    }
    
    /**
     * 挥舞锤子
     */
    swingHammer() {
        if (!this.hammer.isSwinging) {
            this.hammer.isSwinging = true;
            this.hammer.swingProgress = 0;
        }
    }
    
    /**
     * 检查是否击中地鼠
     */
    checkHit() {
        let hit = false;
        
        this.moles.forEach((mole, index) => {
            const distance = Math.sqrt(
                Math.pow(this.hammer.x - mole.x, 2) + 
                Math.pow(this.hammer.y - mole.y, 2)
            );
            
            if (distance < 80 && mole.visible) {
                // 击中地鼠！
                this.hitMole(mole, index);
                hit = true;
            }
        });
        
        if (!hit) {
            // 未击中，重置连击
            this.combo = 0;
            this.sounds.miss();
        }
    }
    
    /**
     * 击中地鼠处理
     */
    hitMole(mole, index) {
        // 增加分数和连击
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        
        let points = 10 + (this.combo * 2);
        this.score += points;
        
        // 播放击中音效
        this.sounds.hit();
        this.sounds.explosion();
        
        // 创建爆炸效果
        this.createExplosion(mole.x, mole.y);
        
        // 创建粒子效果
        this.createParticles(mole.x, mole.y);
        
        // 移除地鼠
        this.moles.splice(index, 1);
        
        // 重置对应洞穴
        const hole = this.holes.find(h => 
            Math.abs(h.x - mole.x) < 10 && Math.abs(h.y - mole.y) < 10
        );
        if (hole) {
            hole.hasMole = false;
            hole.moleTimer = 0;
        }
        
        this.updateUI();
    }
    
    /**
     * 创建爆炸效果
     */
    createExplosion(x, y) {
        this.explosions.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: 100,
            life: 30,
            maxLife: 30
        });
    }
    
    /**
     * 创建粒子效果
     */
    createParticles(x, y) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 60,
                maxLife: 60,
                color: `hsl(${Math.random() * 60 + 15}, 100%, 50%)`
            });
        }
    }
    
    /**
     * 生成地鼠
     */
    spawnMoles() {
        if (!this.gameRunning) return;
        
        // 随机选择空闲的洞穴
        const availableHoles = this.holes.filter(hole => !hole.hasMole);
        
        if (availableHoles.length > 0 && Math.random() < 0.02) {
            const hole = availableHoles[Math.floor(Math.random() * availableHoles.length)];
            hole.hasMole = true;
            
            this.moles.push({
                x: hole.x,
                y: hole.y,
                visible: true,
                life: 180 + Math.random() * 120, // 3-5秒
                maxLife: 180 + Math.random() * 120,
                popupProgress: 0
            });
            
            this.sounds.popup();
        }
    }
    
    /**
     * 更新游戏状态
     */
    update() {
        if (!this.gameRunning) return;
        
        // 生成地鼠
        this.spawnMoles();
        
        // 更新地鼠
        this.moles.forEach((mole, index) => {
            mole.life--;
            
            // 地鼠弹出动画
            if (mole.popupProgress < 1) {
                mole.popupProgress += 0.05;
            }
            
            // 地鼠消失
            if (mole.life <= 0) {
                this.moles.splice(index, 1);
                
                // 重置洞穴状态
                const hole = this.holes.find(h => 
                    Math.abs(h.x - mole.x) < 10 && Math.abs(h.y - mole.y) < 10
                );
                if (hole) {
                    hole.hasMole = false;
                }
                
                // 错过地鼠，重置连击
                this.combo = 0;
            }
        });
        
        // 更新锤子动画
        if (this.hammer.isSwinging) {
            this.hammer.swingProgress += 0.2;
            this.hammer.rotation = Math.sin(this.hammer.swingProgress) * 45;
            
            if (this.hammer.swingProgress >= Math.PI) {
                this.hammer.isSwinging = false;
                this.hammer.swingProgress = 0;
                this.hammer.rotation = 0;
            }
        }
        
        // 更新爆炸效果
        this.explosions.forEach((explosion, index) => {
            explosion.life--;
            explosion.radius = (1 - explosion.life / explosion.maxLife) * explosion.maxRadius;
            
            if (explosion.life <= 0) {
                this.explosions.splice(index, 1);
            }
        });
        
        // 更新粒子效果
        this.particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // 重力
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
    }
    
    /**
     * 渲染游戏画面
     */
    render() {
        // 清空画布
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制草地纹理
        this.drawGrass();
        
        // 绘制洞穴
        this.holes.forEach(hole => {
            this.drawHole(hole);
        });
        
        // 绘制地鼠
        this.moles.forEach(mole => {
            this.drawMole(mole);
        });
        
        // 绘制爆炸效果
        this.explosions.forEach(explosion => {
            this.drawExplosion(explosion);
        });
        
        // 绘制粒子效果
        this.particles.forEach(particle => {
            this.drawParticle(particle);
        });
        
        // 绘制锤子
        this.drawHammer();
    }
    
    /**
     * 绘制草地纹理
     */
    drawGrass() {
        this.ctx.fillStyle = '#228B22';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            this.ctx.fillRect(x, y, 2, 8);
        }
    }
    
    /**
     * 绘制洞穴
     */
    drawHole(hole) {
        // 洞穴阴影
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 洞穴边缘
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    /**
     * 绘制地鼠
     */
    drawMole(mole) {
        const progress = Math.min(mole.popupProgress, 1);
        const y = mole.y - (progress * 40);
        
        // 地鼠身体
        this.ctx.fillStyle = '#8B4513';
        this.ctx.beginPath();
        this.ctx.arc(mole.x, y, 30, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 地鼠眼睛
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(mole.x - 10, y - 10, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(mole.x + 10, y - 10, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 地鼠鼻子
        this.ctx.fillStyle = '#FF69B4';
        this.ctx.beginPath();
        this.ctx.arc(mole.x, y, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 地鼠耳朵
        this.ctx.fillStyle = '#654321';
        this.ctx.beginPath();
        this.ctx.arc(mole.x - 20, y - 20, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(mole.x + 20, y - 20, 8, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    /**
     * 绘制锤子
     */
    drawHammer() {
        this.ctx.save();
        this.ctx.translate(this.hammer.x, this.hammer.y);
        this.ctx.rotate((this.hammer.rotation * Math.PI) / 180);
        
        // 锤子柄
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(-5, 0, 10, 60);
        
        // 锤子头
        this.ctx.fillStyle = '#C0C0C0';
        this.ctx.fillRect(-25, -30, 50, 25);
        
        // 锤子头高光
        this.ctx.fillStyle = '#E0E0E0';
        this.ctx.fillRect(-20, -25, 15, 5);
        
        this.ctx.restore();
    }
    
    /**
     * 绘制爆炸效果
     */
    drawExplosion(explosion) {
        const alpha = explosion.life / explosion.maxLife;
        
        // 外圈
        this.ctx.globalAlpha = alpha * 0.5;
        this.ctx.fillStyle = '#FF4500';
        this.ctx.beginPath();
        this.ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 内圈
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(explosion.x, explosion.y, explosion.radius * 0.6, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.globalAlpha = 1;
    }
    
    /**
     * 绘制粒子效果
     */
    drawParticle(particle) {
        const alpha = particle.life / particle.maxLife;
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    }
    
    /**
     * 游戏主循环
     */
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 全局游戏实例
let game;

// 游戏控制函数
function startGame() {
    if (!game) {
        game = new WhackAMoleGame();
    }
    game.startGame();
}

function pauseGame() {
    if (game) {
        game.pauseGame();
    }
}

function resetGame() {
    if (game) {
        game.resetGame();
    }
}

// 页面加载完成后初始化游戏
window.addEventListener('load', () => {
    game = new WhackAMoleGame();
});