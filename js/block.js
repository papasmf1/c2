/**
 * 블럭 클래스
 */

class Block {
    constructor(x, y, width, height, type = 'normal') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.health = this.getHealthByType(type);
        this.maxHealth = this.health;
        this.isDestroyed = false;
        this.isAnimating = false;
        this.animationFrame = 0;
        this.particles = [];
        this.powerup = null;
        this.score = this.getScoreByType(type);
        
        // 블럭 타입별 속성 설정
        this.setupBlockProperties();
    }

    /**
     * 블럭 타입별 체력 설정
     */
    getHealthByType(type) {
        switch (type) {
            case 'normal':
                return 1;
            case 'hard':
                return 2;
            case 'special':
                return 1;
            case 'boss':
                return 5;
            case 'indestructible':
                return Infinity;
            default:
                return 1;
        }
    }

    /**
     * 블럭 타입별 점수 설정
     */
    getScoreByType(type) {
        switch (type) {
            case 'normal':
                return 100;
            case 'hard':
                return 200;
            case 'special':
                return 300;
            case 'boss':
                return 1000;
            case 'indestructible':
                return 0;
            default:
                return 100;
        }
    }

    /**
     * 블럭 타입별 속성 설정
     */
    setupBlockProperties() {
        switch (this.type) {
            case 'normal':
                this.color = '#3498db';
                this.borderColor = '#2980b9';
                this.glowColor = '#5dade2';
                break;
                
            case 'hard':
                this.color = '#e74c3c';
                this.borderColor = '#c0392b';
                this.glowColor = '#ec7063';
                break;
                
            case 'special':
                this.color = '#f39c12';
                this.borderColor = '#d68910';
                this.glowColor = '#f7dc6f';
                this.powerup = this.generateRandomPowerup();
                break;
                
            case 'boss':
                this.color = '#8e44ad';
                this.borderColor = '#6c3483';
                this.glowColor = '#bb8fce';
                break;
                
            case 'indestructible':
                this.color = '#95a5a6';
                this.borderColor = '#7f8c8d';
                this.glowColor = '#bdc3c7';
                break;
        }
    }

    /**
     * 랜덤 파워업 생성
     */
    generateRandomPowerup() {
        const powerups = ['wide', 'multi', 'slow', 'extraLife', 'scoreBonus'];
        const randomPowerup = powerups[Math.floor(Math.random() * powerups.length)];
        
        return {
            type: randomPowerup,
            duration: 10000, // 10초
            effect: this.getPowerupEffect(randomPowerup)
        };
    }

    /**
     * 파워업 효과 설명
     */
    getPowerupEffect(type) {
        switch (type) {
            case 'wide':
                return '패들 크기 증가';
            case 'multi':
                return '공 여러 개';
            case 'slow':
                return '공 속도 감소';
            case 'extraLife':
                return '생명 추가';
            case 'scoreBonus':
                return '점수 2배';
            default:
                return '알 수 없는 효과';
        }
    }

    /**
     * 블럭 업데이트
     */
    update(deltaTime) {
        // 애니메이션 업데이트
        if (this.isAnimating) {
            this.animationFrame += deltaTime;
            if (this.animationFrame > 10) {
                this.isAnimating = false;
                this.animationFrame = 0;
            }
        }

        // 파티클 업데이트
        this.updateParticles(deltaTime);
    }

    /**
     * 파티클 업데이트
     */
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // 중력 적용
            particle.vy += 0.2 * deltaTime;
            
            // 위치 업데이트
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            
            // 수명 감소
            particle.life -= deltaTime;
            
            // 수명이 다한 파티클 제거
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * 블럭 그리기
     */
    draw(ctx) {
        if (this.isDestroyed) return;

        ctx.save();

        // 블럭 타입별 그리기
        switch (this.type) {
            case 'normal':
                this.drawNormalBlock(ctx);
                break;
            case 'hard':
                this.drawHardBlock(ctx);
                break;
            case 'special':
                this.drawSpecialBlock(ctx);
                break;
            case 'boss':
                this.drawBossBlock(ctx);
                break;
            case 'indestructible':
                this.drawIndestructibleBlock(ctx);
                break;
        }

        // 파티클 그리기
        this.drawParticles(ctx);

        // 파워업 표시
        if (this.powerup) {
            this.drawPowerupIndicator(ctx);
        }

        ctx.restore();
    }

    /**
     * 일반 블럭 그리기
     */
    drawNormalBlock(ctx) {
        // 메인 블럭
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 테두리
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // 하이라이트
        ctx.fillStyle = this.glowColor;
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, 3);
    }

    /**
     * 단단한 블럭 그리기
     */
    drawHardBlock(ctx) {
        // 메인 블럭
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 테두리
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // 체력 표시
        if (this.health < this.maxHealth) {
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${this.health}/${this.maxHealth}`, this.x + this.width / 2, this.y + this.height / 2 + 4);
        }

        // 균열 효과
        if (this.health < this.maxHealth) {
            this.drawCracks(ctx);
        }
    }

    /**
     * 특별한 블럭 그리기
     */
    drawSpecialBlock(ctx) {
        // 메인 블럭
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 테두리
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // 파워업 표시
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('P', this.x + this.width / 2, this.y + this.height / 2 + 3);

        // 반짝이는 효과
        if (this.isAnimating) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    /**
     * 보스 블럭 그리기
     */
    drawBossBlock(ctx) {
        // 메인 블럭
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 테두리
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 4;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // 체력 바
        this.drawHealthBar(ctx);

        // 보스 표시
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('BOSS', this.x + this.width / 2, this.y + this.height / 2 + 5);

        // 위협적인 효과
        if (this.isAnimating) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    /**
     * 파괴 불가능한 블럭 그리기
     */
    drawIndestructibleBlock(ctx) {
        // 메인 블럭
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 테두리
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // 잠금 표시
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🔒', this.x + this.width / 2, this.y + this.height / 2 + 4);
    }

    /**
     * 체력 바 그리기
     */
    drawHealthBar(ctx) {
        const barWidth = this.width - 10;
        const barHeight = 6;
        const barX = this.x + 5;
        const barY = this.y + 5;

        // 배경
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // 체력
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#2ecc71' : healthPercent > 0.25 ? '#f39c12' : '#e74c3c';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

        // 테두리
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }

    /**
     * 균열 효과 그리기
     */
    drawCracks(ctx) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1;

        // 랜덤 균열 그리기
        for (let i = 0; i < 3; i++) {
            const startX = this.x + Math.random() * this.width;
            const startY = this.y + Math.random() * this.height;
            const endX = this.x + Math.random() * this.width;
            const endY = this.y + Math.random() * this.height;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
    }

    /**
     * 파워업 표시 그리기
     */
    drawPowerupIndicator(ctx) {
        const indicatorSize = 8;
        const indicatorX = this.x + this.width - indicatorSize - 2;
        const indicatorY = this.y + 2;

        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(indicatorX + indicatorSize / 2, indicatorY + indicatorSize / 2, indicatorSize / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('P', indicatorX + indicatorSize / 2, indicatorY + indicatorSize / 2 + 2);
    }

    /**
     * 파티클 그리기
     */
    drawParticles(ctx) {
        this.particles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    /**
     * 블럭 피해 처리
     */
    takeDamage(damage = 1) {
        if (this.type === 'indestructible') return false;

        this.health -= damage;
        this.isAnimating = true;
        this.animationFrame = 0;

        // 파티클 생성
        this.createHitParticles();

        if (this.health <= 0) {
            this.destroy();
            return true;
        }

        return false;
    }

    /**
     * 충돌 파티클 생성
     */
    createHitParticles() {
        const particleCount = 5;
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        for (let i = 0; i < particleCount; i++) {
            const particle = {
                x: centerX,
                y: centerY,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                color: this.color,
                size: Math.random() * 3 + 1,
                life: 30,
                maxLife: 30,
                alpha: 1
            };

            this.particles.push(particle);
        }
    }

    /**
     * 블럭 파괴
     */
    destroy() {
        this.isDestroyed = true;
        this.createDestructionParticles();
        
        // 사운드 재생
        if (window.soundManager) {
            window.soundManager.playGameEvent('blockDestroy');
        }
    }

    /**
     * 파괴 파티클 생성
     */
    createDestructionParticles() {
        const particleCount = 15;
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        for (let i = 0; i < particleCount; i++) {
            const particle = {
                x: centerX,
                y: centerY,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                color: this.color,
                size: Math.random() * 4 + 2,
                life: 60,
                maxLife: 60,
                alpha: 1
            };

            this.particles.push(particle);
        }
    }

    /**
     * 충돌 감지
     */
    checkCollision(ball) {
        if (this.isDestroyed) return false;

        return ball.x + ball.radius >= this.x &&
               ball.x - ball.radius <= this.x + this.width &&
               ball.y + ball.radius >= this.y &&
               ball.y - ball.radius <= this.y + this.height;
    }

    /**
     * 블럭 복사
     */
    clone() {
        return new Block(this.x, this.y, this.width, this.height, this.type);
    }

    /**
     * 블럭 정보 가져오기
     */
    getInfo() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            type: this.type,
            health: this.health,
            maxHealth: this.maxHealth,
            isDestroyed: this.isDestroyed,
            powerup: this.powerup,
            score: this.score
        };
    }
}

// 블럭 팩토리 함수
function createBlock(x, y, width, height, type = 'normal') {
    return new Block(x, y, width, height, type);
}

// 블럭 패턴 생성 함수
function createBlockPattern(pattern, blockWidth, blockHeight, startX, startY) {
    const blocks = [];
    
    pattern.forEach((row, rowIndex) => {
        row.forEach((blockType, colIndex) => {
            if (blockType !== 0) {
                const x = startX + colIndex * blockWidth;
                const y = startY + rowIndex * blockHeight;
                blocks.push(new Block(x, y, blockWidth, blockHeight, blockType));
            }
        });
    });
    
    return blocks;
}

// 전역으로 내보내기
window.Block = Block;
window.createBlock = createBlock;
window.createBlockPattern = createBlockPattern;

