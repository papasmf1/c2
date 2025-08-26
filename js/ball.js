/**
 * 공(ball) 클래스
 * 게임의 핵심 요소인 공의 물리적 움직임과 렌더링을 담당
 */

class Ball {
    constructor(x, y, radius = 8) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.isLaunched = false;
        this.isSticky = false;
        this.trail = [];
        this.maxTrailLength = 10;
        
        // 공의 시각적 효과
        this.glowIntensity = 0;
        this.pulsePhase = 0;
        this.color = '#ffffff';
        this.glowColor = '#00ffff';
    }

    /**
     * 공 초기화
     */
    init() {
        this.x = 400; // 캔버스 중앙
        this.y = 500; // 패들 위
        this.velocityX = 0;
        this.velocityY = 0;
        this.isLaunched = false;
        this.trail = [];
        this.glowIntensity = 0;
        this.pulsePhase = 0;
    }

    /**
     * 공 발사
     */
    launch(angle = -Math.PI / 4) {
        if (this.isLaunched) return;
        
        this.isLaunched = true;
        this.velocityX = Math.cos(angle) * this.speed;
        this.velocityY = Math.sin(angle) * this.speed;
        
        // 발사 사운드 재생
        if (window.soundManager) {
            window.soundManager.playSound('ballLaunch');
        }
    }

    /**
     * 공 업데이트
     */
    update(deltaTime) {
        if (!this.isLaunched) return;

        // 위치 업데이트
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;

        // 트레일 업데이트
        this.updateTrail();

        // 시각적 효과 업데이트
        this.updateVisualEffects(deltaTime);

        // 경계 충돌 검사
        this.checkBoundaryCollision();
    }

    /**
     * 트레일 업데이트
     */
    updateTrail() {
        this.trail.push({
            x: this.x,
            y: this.y,
            alpha: 1.0
        });

        // 트레일 길이 제한
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }

        // 트레일 알파값 감소
        this.trail.forEach((point, index) => {
            point.alpha = 1.0 - (index / this.maxTrailLength);
        });
    }

    /**
     * 시각적 효과 업데이트
     */
    updateVisualEffects(deltaTime) {
        // 펄스 효과
        this.pulsePhase += deltaTime * 0.01;
        this.glowIntensity = Math.sin(this.pulsePhase) * 0.3 + 0.7;
    }

    /**
     * 경계 충돌 검사
     */
    checkBoundaryCollision() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        // 좌우 벽 충돌
        if (this.x - this.radius <= 0 || this.x + this.radius >= canvasWidth) {
            this.velocityX = -this.velocityX;
            this.x = Math.max(this.radius, Math.min(canvasWidth - this.radius, this.x));
            
            // 벽 충돌 사운드
            if (window.soundManager) {
                window.soundManager.playSound('wallHit');
            }
        }

        // 상단 벽 충돌
        if (this.y - this.radius <= 0) {
            this.velocityY = -this.velocityY;
            this.y = this.radius;
            
            // 벽 충돌 사운드
            if (window.soundManager) {
                window.soundManager.playSound('wallHit');
            }
        }

        // 하단 경계 (게임 오버 조건)
        if (this.y + this.radius >= canvasHeight) {
            return 'outOfBounds';
        }

        return 'inBounds';
    }

    /**
     * 패들과의 충돌 검사
     */
    checkPaddleCollision(paddle) {
        if (!this.isLaunched) return false;

        const paddleLeft = paddle.x;
        const paddleRight = paddle.x + paddle.width;
        const paddleTop = paddle.y;
        const paddleBottom = paddle.y + paddle.height;

        // 공이 패들 영역에 있는지 확인
        if (this.x + this.radius >= paddleLeft && 
            this.x - this.radius <= paddleRight &&
            this.y + this.radius >= paddleTop && 
            this.y - this.radius <= paddleBottom) {

            // 충돌 위치에 따른 반사 각도 계산
            const hitPosition = (this.x - paddle.x) / paddle.width;
            const angle = (hitPosition - 0.5) * Math.PI * 0.8; // -72도 ~ +72도

            this.velocityX = Math.sin(angle) * this.speed;
            this.velocityY = -Math.cos(angle) * this.speed;

            // 패들 충돌 사운드
            if (window.soundManager) {
                window.soundManager.playSound('paddleHit');
            }

            // 점수 추가
            if (window.scoreManager) {
                window.scoreManager.addScore(10);
            }

            return true;
        }

        return false;
    }

    /**
     * 블럭과의 충돌 검사
     */
    checkBlockCollision(block) {
        if (!this.isLaunched) return false;

        const blockLeft = block.x;
        const blockRight = block.x + block.width;
        const blockTop = block.y;
        const blockBottom = block.y + block.height;

        // 공이 블럭 영역에 있는지 확인
        if (this.x + this.radius >= blockLeft && 
            this.x - this.radius <= blockRight &&
            this.y + this.radius >= blockTop && 
            this.y - this.radius <= blockBottom) {

            // 충돌 방향 결정
            const ballCenterX = this.x;
            const ballCenterY = this.y;
            const blockCenterX = block.x + block.width / 2;
            const blockCenterY = block.y + block.height / 2;

            const dx = ballCenterX - blockCenterX;
            const dy = ballCenterY - blockCenterY;

            // 더 큰 차이를 가진 방향으로 반사
            if (Math.abs(dx) > Math.abs(dy)) {
                this.velocityX = -this.velocityX;
            } else {
                this.velocityY = -this.velocityY;
            }

            // 블럭 충돌 사운드
            if (window.soundManager) {
                window.soundManager.playSound('blockHit');
            }

            return true;
        }

        return false;
    }

    /**
     * 공 렌더링
     */
    render(ctx) {
        // 트레일 렌더링
        this.renderTrail(ctx);

        // 공 렌더링
        ctx.save();

        // 글로우 효과
        if (this.glowIntensity > 0) {
            ctx.shadowColor = this.glowColor;
            ctx.shadowBlur = 20 * this.glowIntensity;
        }

        // 공 그리기
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        // 그라데이션 효과
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3, 
            this.y - this.radius * 0.3, 
            0,
            this.x, 
            this.y, 
            this.radius
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.7, this.color);
        gradient.addColorStop(1, '#cccccc');
        
        ctx.fillStyle = gradient;
        ctx.fill();

        // 테두리
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 하이라이트
        ctx.beginPath();
        ctx.arc(
            this.x - this.radius * 0.3, 
            this.y - this.radius * 0.3, 
            this.radius * 0.4, 
            0, 
            Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();

        ctx.restore();
    }

    /**
     * 트레일 렌더링
     */
    renderTrail(ctx) {
        this.trail.forEach((point, index) => {
            const alpha = point.alpha * 0.3;
            const size = this.radius * (1 - index / this.maxTrailLength) * 0.5;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.glowColor;
            ctx.beginPath();
            ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    /**
     * 공 속도 조정
     */
    setSpeed(speed) {
        this.speed = speed;
        if (this.isLaunched) {
            const currentSpeed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
            const ratio = this.speed / currentSpeed;
            this.velocityX *= ratio;
            this.velocityY *= ratio;
        }
    }

    /**
     * 공 크기 조정
     */
    setSize(radius) {
        this.radius = radius;
    }

    /**
     * 공 위치 설정
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.trail = [];
    }

    /**
     * 공 상태 가져오기
     */
    getState() {
        return {
            x: this.x,
            y: this.y,
            velocityX: this.velocityX,
            velocityY: this.velocityY,
            isLaunched: this.isLaunched,
            speed: this.speed,
            radius: this.radius
        };
    }

    /**
     * 공 상태 복원
     */
    setState(state) {
        this.x = state.x;
        this.y = state.y;
        this.velocityX = state.velocityX;
        this.velocityY = state.velocityY;
        this.isLaunched = state.isLaunched;
        this.speed = state.speed;
        this.radius = state.radius;
    }

    /**
     * 공 리셋
     */
    reset() {
        this.init();
    }
}

// 전역 공 인스턴스
window.ball = new Ball(400, 500);
