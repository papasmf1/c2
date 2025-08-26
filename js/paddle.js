/**
 * 패들(paddle) 클래스
 * 게임에서 공을 받는 패들의 움직임과 렌더링을 담당
 */

class Paddle {
    constructor(x, y, width = 100, height = 20) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = 8;
        this.targetX = x;
        this.smoothMovement = true;
        this.movementEasing = 0.1;
        
        // 패들의 시각적 효과
        this.glowIntensity = 0;
        this.pulsePhase = 0;
        this.color = '#3498db';
        this.glowColor = '#00ffff';
        
        // 입력 처리
        this.keys = {
            left: false,
            right: false
        };
        
        // 마우스/터치 입력
        this.mouseX = 0;
        this.isMouseDown = false;
        
        this.setupEventListeners();
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 키보드 이벤트
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });

        document.addEventListener('keyup', (e) => {
            this.handleKeyUp(e);
        });

        // 마우스 이벤트
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.addEventListener('mousemove', (e) => {
                this.handleMouseMove(e);
            });

            canvas.addEventListener('mousedown', (e) => {
                this.handleMouseDown(e);
            });

            canvas.addEventListener('mouseup', (e) => {
                this.handleMouseUp(e);
            });

            // 터치 이벤트
            canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleTouchStart(e);
            });

            canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                this.handleTouchMove(e);
            });

            canvas.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.handleTouchEnd(e);
            });
        }
    }

    /**
     * 키보드 다운 이벤트 처리
     */
    handleKeyDown(e) {
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.keys.left = true;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.keys.right = true;
                break;
            case ' ':
                // 스페이스바로 공 발사
                if (window.ball && !window.ball.isLaunched) {
                    window.ball.launch();
                }
                break;
        }
    }

    /**
     * 키보드 업 이벤트 처리
     */
    handleKeyUp(e) {
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.keys.left = false;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.keys.right = false;
                break;
        }
    }

    /**
     * 마우스 이동 이벤트 처리
     */
    handleMouseMove(e) {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
    }

    /**
     * 마우스 다운 이벤트 처리
     */
    handleMouseDown(e) {
        this.isMouseDown = true;
        // 마우스 클릭으로 공 발사
        if (window.ball && !window.ball.isLaunched) {
            window.ball.launch();
        }
    }

    /**
     * 마우스 업 이벤트 처리
     */
    handleMouseUp(e) {
        this.isMouseDown = false;
    }

    /**
     * 터치 시작 이벤트 처리
     */
    handleTouchStart(e) {
        this.isMouseDown = true;
        const touch = e.touches[0];
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            this.mouseX = touch.clientX - rect.left;
        }
        
        // 터치로 공 발사
        if (window.ball && !window.ball.isLaunched) {
            window.ball.launch();
        }
    }

    /**
     * 터치 이동 이벤트 처리
     */
    handleTouchMove(e) {
        const touch = e.touches[0];
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            this.mouseX = touch.clientX - rect.left;
        }
    }

    /**
     * 터치 종료 이벤트 처리
     */
    handleTouchEnd(e) {
        this.isMouseDown = false;
    }

    /**
     * 패들 업데이트
     */
    update(deltaTime) {
        this.updateMovement(deltaTime);
        this.updateVisualEffects(deltaTime);
        this.checkBoundaries();
    }

    /**
     * 패들 움직임 업데이트
     */
    updateMovement(deltaTime) {
        let targetX = this.x;

        // 키보드 입력 처리
        if (this.keys.left) {
            targetX -= this.speed * deltaTime;
        }
        if (this.keys.right) {
            targetX += this.speed * deltaTime;
        }

        // 마우스/터치 입력 처리
        if (this.isMouseDown) {
            targetX = this.mouseX - this.width / 2;
        }

        // 부드러운 움직임 적용
        if (this.smoothMovement) {
            this.x += (targetX - this.x) * this.movementEasing;
        } else {
            this.x = targetX;
        }
    }

    /**
     * 시각적 효과 업데이트
     */
    updateVisualEffects(deltaTime) {
        // 펄스 효과
        this.pulsePhase += deltaTime * 0.005;
        this.glowIntensity = Math.sin(this.pulsePhase) * 0.2 + 0.8;
    }

    /**
     * 경계 검사
     */
    checkBoundaries() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;

        const canvasWidth = canvas.width;

        // 좌우 경계 제한
        if (this.x < 0) {
            this.x = 0;
        } else if (this.x + this.width > canvasWidth) {
            this.x = canvasWidth - this.width;
        }
    }

    /**
     * 패들 렌더링
     */
    render(ctx) {
        ctx.save();

        // 글로우 효과
        if (this.glowIntensity > 0) {
            ctx.shadowColor = this.glowColor;
            ctx.shadowBlur = 15 * this.glowIntensity;
        }

        // 패들 그리기
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 10);
        
        // 그라데이션 효과
        const gradient = ctx.createLinearGradient(
            this.x, 
            this.y, 
            this.x, 
            this.y + this.height
        );
        gradient.addColorStop(0, '#ffffff);
        gradient.addColorStop(0.3, this.color);
        gradient.addColorStop(0.7, this.color);
        gradient.addColorStop(1, '#2980b9');
        
        ctx.fillStyle = gradient;
        ctx.fill();

        // 테두리
        ctx.strokeStyle = '#1f4e79';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 하이라이트
        ctx.beginPath();
        ctx.roundRect(
            this.x + 2, 
            this.y + 2, 
            this.width - 4, 
            this.height / 2, 
            8
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();

        // 중앙 표시선
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    }

    /**
     * 패들 크기 조정
     */
    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.checkBoundaries();
    }

    /**
     * 패들 속도 조정
     */
    setSpeed(speed) {
        this.speed = speed;
    }

    /**
     * 패들 위치 설정
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.checkBoundaries();
    }

    /**
     * 패들 색상 설정
     */
    setColor(color, glowColor) {
        this.color = color;
        if (glowColor) {
            this.glowColor = glowColor;
        }
    }

    /**
     * 부드러운 움직임 설정
     */
    setSmoothMovement(enabled, easing = 0.1) {
        this.smoothMovement = enabled;
        this.movementEasing = easing;
    }

    /**
     * 패들 상태 가져오기
     */
    getState() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            speed: this.speed
        };
    }

    /**
     * 패들 상태 복원
     */
    setState(state) {
        this.x = state.x;
        this.y = state.y;
        this.width = state.width;
        this.height = state.height;
        this.speed = state.speed;
        this.targetX = state.x;
    }

    /**
     * 패들 리셋
     */
    reset() {
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            this.x = (canvas.width - this.width) / 2;
            this.y = canvas.height - this.height - 20;
        }
        this.targetX = this.x;
        this.keys.left = false;
        this.keys.right = false;
        this.isMouseDown = false;
    }

    /**
     * 패들 확장 (파워업)
     */
    expand(amount = 20) {
        this.width += amount;
        this.checkBoundaries();
        
        // 확장 효과 표시
        this.showPowerUpEffect('expand');
    }

    /**
     * 패들 축소 (파워업)
     */
    shrink(amount = 20) {
        this.width = Math.max(60, this.width - amount);
        this.checkBoundaries();
        
        // 축소 효과 표시
        this.showPowerUpEffect('shrink');
    }

    /**
     * 파워업 효과 표시
     */
    showPowerUpEffect(type) {
        const effectText = document.createElement('div');
        effectText.className = 'powerup-effect';
        effectText.style.cssText = `
            position: absolute;
            top: ${this.y - 30}px;
            left: ${this.x + this.width / 2}px;
            transform: translateX(-50%);
            background: rgba(255, 215, 0, 0.9);
            color: #333;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 0.8rem;
            font-weight: bold;
            z-index: 100;
            animation: powerupFloat 1s ease-out forwards;
        `;

        switch (type) {
            case 'expand':
                effectText.textContent = '확장!';
                break;
            case 'shrink':
                effectText.textContent = '축소!';
                break;
        }

        document.body.appendChild(effectText);

        // 애니메이션 후 제거
        setTimeout(() => {
            if (effectText.parentNode) {
                effectText.parentNode.removeChild(effectText);
            }
        }, 1000);
    }
}

// 전역 패들 인스턴스
window.paddle = new Paddle(350, 550);
