/**
 * 게임(game) 클래스
 * 게임의 메인 로직과 게임 루프를 담당
 */

class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isRunning = false;
        this.isPaused = false;
        this.gameState = 'menu'; // menu, playing, paused, gameOver, levelComplete
        
        // 게임 타이밍
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fps = 60;
        this.frameInterval = 1000 / this.fps;
        
        // 게임 객체들
        this.ball = null;
        this.paddle = null;
        this.blocks = [];
        this.powerUps = [];
        this.particles = [];
        
        // 게임 설정
        this.difficulty = 'normal';
        this.controls = 'keyboard';
        this.soundEnabled = true;
        this.musicEnabled = true;
        
        // 게임 통계
        this.gameTime = 0;
        this.blocksDestroyed = 0;
        this.powerUpsCollected = 0;
        
        this.initialize();
    }

    /**
     * 게임 초기화
     */
    initialize() {
        this.setupCanvas();
        this.setupEventListeners();
        this.loadSettings();
        this.reset();
    }

    /**
     * 캔버스 설정
     */
    setupCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        
        // 캔버스 크기 설정
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // 기본 배경 설정
        this.canvas.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 게임 시작 버튼
        const startButton = document.getElementById('startGame');
        if (startButton) {
            startButton.addEventListener('click', () => {
                this.startGame();
            });
        }

        // 일시정지 버튼
        const pauseButton = document.getElementById('pauseGame');
        if (pauseButton) {
            pauseButton.addEventListener('click', () => {
                this.togglePause();
            });
        }

        // 게임 재개 버튼
        const resumeButton = document.getElementById('resumeGame');
        if (resumeButton) {
            resumeButton.addEventListener('click', () => {
                this.resumeGame();
            });
        }

        // 게임 재시작 버튼
        const restartButton = document.getElementById('restartGame');
        if (restartButton) {
            restartButton.addEventListener('click', () => {
                this.restartGame();
            });
        }

        // 게임 종료 버튼
        const quitButton = document.getElementById('quitGame');
        if (quitButton) {
            quitButton.addEventListener('click', () => {
                this.backToMenu();
            });
        }

        // 메뉴로 돌아가기 버튼
        const backToMenuButton = document.getElementById('backToMenu');
        if (backToMenuButton) {
            backToMenuButton.addEventListener('click', () => {
                this.backToMenu();
            });
        }

        // 하이스코어 버튼
        const highScoreButton = document.getElementById('showHighScores');
        if (highScoreButton) {
            highScoreButton.addEventListener('click', () => {
                this.showHighScores();
            });
        }

        // 설정 버튼
        const settingsButton = document.getElementById('showSettings');
        if (settingsButton) {
            settingsButton.addEventListener('click', () => {
                this.showSettings();
            });
        }

        // 설정 저장 버튼
        const saveSettingsButton = document.getElementById('saveSettings');
        if (saveSettingsButton) {
            saveSettingsButton.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        // 키보드 이벤트
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });

        // 윈도우 리사이즈 이벤트
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    /**
     * 설정 로드
     */
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('blockBreakerSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                this.difficulty = settings.difficulty || 'normal';
                this.controls = settings.controls || 'keyboard';
                this.soundEnabled = settings.soundEnabled !== undefined ? settings.soundEnabled : true;
                this.musicEnabled = settings.musicEnabled !== undefined ? settings.musicEnabled : true;
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }

        this.applySettings();
    }

    /**
     * 설정 적용
     */
    applySettings() {
        // 난이도 설정 적용
        const difficultySelect = document.getElementById('difficulty');
        if (difficultySelect) {
            difficultySelect.value = this.difficulty;
        }

        // 조작 방식 설정 적용
        const controlsSelect = document.getElementById('controls');
        if (controlsSelect) {
            controlsSelect.value = this.controls;
        }

        // 사운드 설정 적용
        if (window.soundManager) {
            window.soundManager.setVolume(this.soundEnabled ? 50 : 0);
            window.soundManager.setMusicEnabled(this.musicEnabled);
        }

        // 난이도에 따른 게임 설정 조정
        this.adjustDifficulty();
    }

    /**
     * 난이도에 따른 게임 설정 조정
     */
    adjustDifficulty() {
        switch (this.difficulty) {
            case 'easy':
                if (this.ball) this.ball.setSpeed(4);
                if (this.paddle) this.paddle.setSpeed(10);
                break;
            case 'normal':
                if (this.ball) this.ball.setSpeed(5);
                if (this.paddle) this.paddle.setSpeed(8);
                break;
            case 'hard':
                if (this.ball) this.ball.setSpeed(6);
                if (this.paddle) this.paddle.setSpeed(6);
                break;
        }
    }

    /**
     * 게임 시작
     */
    startGame() {
        this.gameState = 'playing';
        this.isRunning = true;
        this.isPaused = false;
        this.gameTime = 0;
        
        // 게임 객체들 초기화
        this.initializeGameObjects();
        
        // 첫 번째 레벨 로드
        if (window.levelManager) {
            window.levelManager.loadLevel(1);
            this.blocks = window.levelManager.currentBlocks;
        }
        
        // 점수 시스템 리셋
        if (window.scoreManager) {
            window.scoreManager.resetGame();
        }
        
        // 사운드 재생
        if (window.soundManager) {
            window.soundManager.playSound('gameStart');
        }
        
        // 화면 전환
        this.showScreen('gameScreen');
        
        // 게임 루프 시작
        this.gameLoop();
    }

    /**
     * 게임 객체들 초기화
     */
    initializeGameObjects() {
        // 공 초기화
        if (window.ball) {
            this.ball = window.ball;
            this.ball.reset();
        }

        // 패들 초기화
        if (window.paddle) {
            this.paddle = window.paddle;
            this.paddle.reset();
        }

        // 파워업과 파티클 초기화
        this.powerUps = [];
        this.particles = [];
    }

    /**
     * 게임 루프
     */
    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;

        // 델타 타임 계산
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // FPS 제한
        if (this.deltaTime < this.frameInterval) {
            requestAnimationFrame((time) => this.gameLoop(time));
            return;
        }

        // 게임 상태에 따른 업데이트
        if (this.gameState === 'playing' && !this.isPaused) {
            this.update();
            this.render();
        }

        // 게임 시간 업데이트
        this.gameTime += this.deltaTime;

        // 다음 프레임 요청
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    /**
     * 게임 업데이트
     */
    update() {
        // 공 업데이트
        if (this.ball) {
            this.ball.update(this.deltaTime);
        }

        // 패들 업데이트
        if (this.paddle) {
            this.paddle.update(this.deltaTime);
        }

        // 파워업 업데이트
        this.updatePowerUps();

        // 파티클 업데이트
        this.updateParticles();

        // 충돌 검사
        this.checkCollisions();

        // 레벨 완료 확인
        this.checkLevelComplete();

        // 게임 오버 확인
        this.checkGameOver();
    }

    /**
     * 파워업 업데이트
     */
    updatePowerUps() {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.y += powerUp.speed * this.deltaTime;

            // 화면 밖으로 나간 파워업 제거
            if (powerUp.y > this.canvas.height) {
                this.powerUps.splice(i, 1);
                continue;
            }

            // 패들과의 충돌 검사
            if (this.paddle && this.checkPowerUpCollision(powerUp, this.paddle)) {
                this.applyPowerUp(powerUp.type);
                this.powerUps.splice(i, 1);
                this.powerUpsCollected++;
            }
        }
    }

    /**
     * 파티클 업데이트
     */
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.velocityX * this.deltaTime;
            particle.y += particle.velocityY * this.deltaTime;
            particle.life -= this.deltaTime;

            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * 충돌 검사
     */
    checkCollisions() {
        if (!this.ball || !this.paddle) return;

        // 공과 패들 충돌
        if (this.ball.checkPaddleCollision(this.paddle)) {
            // 공이 패들에 맞았을 때의 처리
            this.createParticles(this.ball.x, this.ball.y, '#00ffff', 5);
        }

        // 공과 블럭 충돌
        for (let i = this.blocks.length - 1; i >= 0; i--) {
            const block = this.blocks[i];
            if (!block.destroyed && this.ball.checkBlockCollision(block)) {
                this.handleBlockDestruction(block, i);
            }
        }

        // 공이 화면 밖으로 나갔는지 확인
        const ballStatus = this.ball.checkBoundaryCollision();
        if (ballStatus === 'outOfBounds') {
            this.handleBallOutOfBounds();
        }
    }

    /**
     * 블럭 파괴 처리
     */
    handleBlockDestruction(block, index) {
        block.health--;
        
        if (block.health <= 0) {
            block.destroyed = true;
            this.blocksDestroyed++;
            
            // 점수 추가
            if (window.scoreManager) {
                window.scoreManager.addScore(block.points, block.type);
            }
            
            // 파티클 효과
            this.createParticles(block.x + block.width / 2, block.y + block.height / 2, '#ff6b6b', 8);
            
            // 파워업 생성 (확률적으로)
            if (Math.random() < 0.1) {
                this.createPowerUp(block.x + block.width / 2, block.y + block.height / 2);
            }
            
            // 사운드 재생
            if (window.soundManager) {
                window.soundManager.playSound('blockDestroy');
            }
        } else {
            // 블럭이 아직 살아있음
            if (window.soundManager) {
                window.soundManager.playSound('blockHit');
            }
        }
    }

    /**
     * 공이 화면 밖으로 나간 경우 처리
     */
    handleBallOutOfBounds() {
        // 생명 감소
        if (window.scoreManager) {
            const result = window.scoreManager.loseLife();
            if (result === 'gameOver') {
                this.gameOver();
                return;
            }
        }

        // 공과 패들 리셋
        if (this.ball) {
            this.ball.reset();
        }
        if (this.paddle) {
            this.paddle.reset();
        }

        // 사운드 재생
        if (window.soundManager) {
            window.soundManager.playSound('lifeLost');
        }
    }

    /**
     * 레벨 완료 확인
     */
    checkLevelComplete() {
        if (window.levelManager && window.levelManager.isLevelComplete()) {
            this.levelComplete();
        }
    }

    /**
     * 레벨 완료 처리
     */
    levelComplete() {
        this.gameState = 'levelComplete';
        
        // 점수 보너스
        if (window.scoreManager) {
            window.scoreManager.addScore(1000);
            window.scoreManager.nextLevel();
        }
        
        // 다음 레벨로 진행
        if (window.levelManager) {
            if (window.levelManager.nextLevel()) {
                this.blocks = window.levelManager.currentBlocks;
                this.gameState = 'playing';
                
                // 레벨 완료 사운드
                if (window.soundManager) {
                    window.soundManager.playSound('levelComplete');
                }
                
                // 축하 메시지 표시
                this.showLevelCompleteMessage();
            } else {
                // 모든 레벨 완료
                this.gameComplete();
            }
        }
    }

    /**
     * 게임 완료 처리
     */
    gameComplete() {
        this.gameState = 'gameComplete';
        this.isRunning = false;
        
        // 최종 점수 저장
        if (window.scoreManager) {
            window.scoreManager.saveHighScore();
        }
        
        // 축하 메시지 표시
        this.showGameCompleteMessage();
    }

    /**
     * 게임 오버 확인
     */
    checkGameOver() {
        if (window.scoreManager && window.scoreManager.lives <= 0) {
            this.gameOver();
        }
    }

    /**
     * 게임 오버 처리
     */
    gameOver() {
        this.gameState = 'gameOver';
        this.isRunning = false;
        
        // 최종 점수 저장
        if (window.scoreManager) {
            window.scoreManager.saveHighScore();
        }
        
        // 게임 오버 화면 표시
        this.showScreen('gameOverScreen');
        
        // 사운드 재생
        if (window.soundManager) {
            window.soundManager.playSound('gameOver');
        }
        
        console.log('게임 오버 화면 표시됨');
    }

    /**
     * 게임 렌더링
     */
    render() {
        if (!this.ctx) return;

        // 캔버스 클리어
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 블럭 렌더링
        this.renderBlocks();

        // 파워업 렌더링
        this.renderPowerUps();

        // 파티클 렌더링
        this.renderParticles();

        // 패들 렌더링
        if (this.paddle) {
            this.paddle.render(this.ctx);
        }

        // 공 렌더링
        if (this.ball) {
            this.ball.render(this.ctx);
        }

        // UI 렌더링
        this.renderUI();
    }

    /**
     * 블럭 렌더링
     */
    renderBlocks() {
        this.blocks.forEach(block => {
            if (!block.destroyed) {
                this.renderBlock(block);
            }
        });
    }

    /**
     * 개별 블럭 렌더링
     */
    renderBlock(block) {
        this.ctx.save();

        // 블럭 타입에 따른 색상 설정
        let color = '#3498db';
        let glowColor = '#2980b9';

        switch (block.type) {
            case 'hard':
                color = '#e74c3c';
                glowColor = '#c0392b';
                break;
            case 'special':
                color = '#f39c12';
                glowColor = '#e67e22';
                break;
            case 'boss':
                color = '#9b59b6';
                glowColor = '#8e44ad';
                break;
        }

        // 글로우 효과
        this.ctx.shadowColor = glowColor;
        this.ctx.shadowBlur = 10;

        // 블럭 그리기
        this.ctx.fillStyle = color;
        this.ctx.fillRect(block.x, block.y, block.width, block.height);

        // 테두리
        this.ctx.strokeStyle = glowColor;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(block.x, block.y, block.width, block.height);

        // 체력 표시 (2 이상일 때)
        if (block.health > 1) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                block.health.toString(),
                block.x + block.width / 2,
                block.y + block.height / 2 + 4
            );
        }

        this.ctx.restore();
    }

    /**
     * 파워업 렌더링
     */
    renderPowerUps() {
        this.powerUps.forEach(powerUp => {
            this.ctx.save();
            
            // 파워업 타입에 따른 색상
            let color = '#00ff00';
            switch (powerUp.type) {
                case 'expand':
                    color = '#3498db';
                    break;
                case 'shrink':
                    color = '#e74c3c';
                    break;
                case 'speed':
                    color = '#f39c12';
                    break;
            }
            
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(powerUp.x, powerUp.y, 8, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }

    /**
     * 파티클 렌더링
     */
    renderParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            
            this.ctx.globalAlpha = particle.life / particle.maxLife;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }

    /**
     * UI 렌더링
     */
    renderUI() {
        // 게임 정보 표시
        this.ctx.save();
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        
        const levelInfo = window.levelManager ? window.levelManager.getLevelInfo() : null;
        if (levelInfo) {
            this.ctx.fillText(`레벨 ${levelInfo.number}: ${levelInfo.name}`, 10, 30);
            this.ctx.fillText(`진행률: ${Math.round(levelInfo.progress)}%`, 10, 50);
        }
        
        this.ctx.restore();
    }

    /**
     * 파워업 생성
     */
    createPowerUp(x, y) {
        const types = ['expand', 'shrink', 'speed'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        this.powerUps.push({
            x: x,
            y: y,
            type: type,
            speed: 2
        });
    }

    /**
     * 파워업 충돌 검사
     */
    checkPowerUpCollision(powerUp, paddle) {
        return powerUp.x >= paddle.x && 
               powerUp.x <= paddle.x + paddle.width &&
               powerUp.y >= paddle.y && 
               powerUp.y <= paddle.y + paddle.height;
    }

    /**
     * 파워업 적용
     */
    applyPowerUp(type) {
        switch (type) {
            case 'expand':
                if (this.paddle) this.paddle.expand();
                break;
            case 'shrink':
                if (this.paddle) this.paddle.shrink();
                break;
            case 'speed':
                if (this.ball) this.ball.setSpeed(this.ball.speed + 1);
                break;
        }
        
        // 파워업 효과 사운드
        if (window.soundManager) {
            window.soundManager.playSound('powerUp');
        }
    }

    /**
     * 파티클 생성
     */
    createParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                velocityX: (Math.random() - 0.5) * 4,
                velocityY: (Math.random() - 0.5) * 4,
                color: color,
                size: Math.random() * 3 + 1,
                life: 1000,
                maxLife: 1000
            });
        }
    }

    /**
     * 화면 전환
     */
    showScreen(screenId) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
        
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            console.log(`화면 전환: ${screenId}`);
        } else {
            console.error(`화면을 찾을 수 없습니다: ${screenId}`);
        }
    }

    /**
     * 게임 일시정지/재개
     */
    togglePause() {
        if (this.isPaused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }

    /**
     * 게임 일시정지
     */
    pauseGame() {
        this.isPaused = true;
        this.gameState = 'paused';
        this.showScreen('pauseScreen');
        
        if (window.soundManager) {
            window.soundManager.pauseMusic();
        }
    }

    /**
     * 게임 재개
     */
    resumeGame() {
        this.isPaused = false;
        this.gameState = 'playing';
        this.showScreen('gameScreen');
        
        if (window.soundManager) {
            window.soundManager.resumeMusic();
        }
    }

    /**
     * 게임 재시작
     */
    restartGame() {
        this.reset();
        this.startGame();
    }

    /**
     * 메뉴로 돌아가기
     */
    backToMenu() {
        this.isRunning = false;
        this.gameState = 'menu';
        this.showScreen('mainMenu');
        
        if (window.soundManager) {
            window.soundManager.stopMusic();
        }
    }

    /**
     * 하이스코어 표시
     */
    showHighScores() {
        if (window.scoreManager) {
            window.scoreManager.displayHighScores();
        }
        this.showScreen('highScoreScreen');
    }

    /**
     * 설정 화면 표시
     */
    showSettings() {
        this.showScreen('settingsScreen');
    }

    /**
     * 설정 저장
     */
    saveSettings() {
        const difficulty = document.getElementById('difficulty').value;
        const controls = document.getElementById('controls').value;
        const soundVolume = document.getElementById('soundVolume').value;
        
        this.difficulty = difficulty;
        this.controls = controls;
        this.soundEnabled = soundVolume > 0;
        
        // 로컬 스토리지에 저장
        const settings = {
            difficulty: this.difficulty,
            controls: this.controls,
            soundEnabled: this.soundEnabled,
            musicEnabled: this.musicEnabled
        };
        
        try {
            localStorage.setItem('blockBreakerSettings', JSON.stringify(settings));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
        
        this.applySettings();
        this.backToMenu();
    }

    /**
     * 키보드 이벤트 처리
     */
    handleKeyDown(e) {
        switch (e.key) {
            case 'Escape':
                if (this.gameState === 'playing') {
                    this.togglePause();
                }
                break;
            case ' ':
                if (this.gameState === 'playing' && !this.isPaused) {
                    if (this.ball && !this.ball.isLaunched) {
                        this.ball.launch();
                    }
                }
                break;
        }
    }

    /**
     * 윈도우 리사이즈 처리
     */
    handleResize() {
        // 캔버스 크기 조정 로직
        if (this.canvas) {
            const container = this.canvas.parentElement;
            if (container) {
                const rect = container.getBoundingClientRect();
                this.canvas.width = rect.width;
                this.canvas.height = rect.height;
            }
        }
    }

    /**
     * 게임 리셋
     */
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.gameState = 'menu';
        this.gameTime = 0;
        this.blocksDestroyed = 0;
        this.powerUpsCollected = 0;
        
        this.blocks = [];
        this.powerUps = [];
        this.particles = [];
        
        if (window.levelManager) {
            window.levelManager.reset();
        }
        
        if (window.scoreManager) {
            window.scoreManager.resetGame();
        }
    }

    /**
     * 레벨 완료 메시지 표시
     */
    showLevelCompleteMessage() {
        const message = document.createElement('div');
        message.className = 'level-complete-message';
        message.textContent = '레벨 완료!';
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(46, 204, 113, 0.9);
            color: white;
            padding: 20px 40px;
            border-radius: 15px;
            font-size: 2rem;
            font-weight: bold;
            z-index: 1000;
            animation: levelCompletePulse 2s ease-out forwards;
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 2000);
    }

    /**
     * 게임 완료 메시지 표시
     */
    showGameCompleteMessage() {
        const message = document.createElement('div');
        message.className = 'game-complete-message';
        message.innerHTML = `
            <h2>🎉 축하합니다! 🎉</h2>
            <p>모든 레벨을 완료했습니다!</p>
            <p>최종 점수: ${window.scoreManager ? window.scoreManager.currentScore.toLocaleString() : 0}</p>
        `;
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(52, 152, 219, 0.95);
            color: white;
            padding: 30px 50px;
            border-radius: 20px;
            font-size: 1.5rem;
            text-align: center;
            z-index: 1000;
            animation: gameCompleteFade 3s ease-out forwards;
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
            this.backToMenu();
        }, 3000);
    }
}

// 전역 게임 인스턴스
window.game = new Game();
