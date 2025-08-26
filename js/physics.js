/**
 * 게임 물리 시스템
 */

class Physics {
    constructor() {
        this.gravity = 0.1;
        this.friction = 0.98;
        this.bounceDamping = 0.8;
        this.maxVelocity = 15;
    }

    /**
     * 공의 물리 업데이트
     */
    updateBall(ball, deltaTime) {
        // 속도 업데이트
        ball.x += ball.vx * deltaTime;
        ball.y += ball.vy * deltaTime;

        // 중력 적용
        ball.vy += this.gravity * deltaTime;

        // 마찰 적용
        ball.vx *= this.friction;
        ball.vy *= this.friction;

        // 최대 속도 제한
        ball.vx = Utils.clamp(ball.vx, -this.maxVelocity, this.maxVelocity);
        ball.vy = Utils.clamp(ball.vy, -this.maxVelocity, this.maxVelocity);

        // 최소 속도 제한 (공이 너무 느려지지 않도록)
        const minSpeed = 2;
        const currentSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        if (currentSpeed < minSpeed && currentSpeed > 0) {
            const factor = minSpeed / currentSpeed;
            ball.vx *= factor;
            ball.vy *= factor;
        }
    }

    /**
     * 벽과의 충돌 처리
     */
    handleWallCollision(ball, canvas) {
        const ballRadius = ball.radius;
        let collision = false;

        // 왼쪽 벽
        if (ball.x - ballRadius <= 0) {
            ball.x = ballRadius;
            ball.vx = Math.abs(ball.vx) * this.bounceDamping;
            collision = true;
        }

        // 오른쪽 벽
        if (ball.x + ballRadius >= canvas.width) {
            ball.x = canvas.width - ballRadius;
            ball.vx = -Math.abs(ball.vx) * this.bounceDamping;
            collision = true;
        }

        // 위쪽 벽
        if (ball.y - ballRadius <= 0) {
            ball.y = ballRadius;
            ball.vy = Math.abs(ball.vy) * this.bounceDamping;
            collision = true;
        }

        // 아래쪽 벽 (게임 오버)
        if (ball.y + ballRadius >= canvas.height) {
            return 'gameOver';
        }

        return collision ? 'wall' : 'none';
    }

    /**
     * 패들과의 충돌 처리
     */
    handlePaddleCollision(ball, paddle) {
        const ballRadius = ball.radius;
        const paddleLeft = paddle.x;
        const paddleRight = paddle.x + paddle.width;
        const paddleTop = paddle.y;
        const paddleBottom = paddle.y + paddle.height;

        // 공이 패들 영역에 있는지 확인
        if (ball.x + ballRadius >= paddleLeft && 
            ball.x - ballRadius <= paddleRight &&
            ball.y + ballRadius >= paddleTop && 
            ball.y - ballRadius <= paddleBottom) {

            // 충돌 위치에 따른 반사각 계산
            const hitPosition = (ball.x - paddle.x) / paddle.width; // 0~1 사이 값
            const angle = (hitPosition - 0.5) * Math.PI / 3; // -π/6 ~ π/6

            // 공의 속도 계산
            const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            ball.vx = Math.sin(angle) * speed;
            ball.vy = -Math.cos(angle) * speed;

            // 패들에 맞았을 때 약간의 속도 증가
            const speedBoost = 1.1;
            ball.vx *= speedBoost;
            ball.vy *= speedBoost;

            // 공을 패들 위로 이동 (겹침 방지)
            ball.y = paddleTop - ballRadius;

            return true;
        }

        return false;
    }

    /**
     * 블럭과의 충돌 처리
     */
    handleBlockCollision(ball, block) {
        const ballRadius = ball.radius;
        const blockLeft = block.x;
        const blockRight = block.x + block.width;
        const blockTop = block.y;
        const blockBottom = block.y + block.height;

        // 공이 블럭 영역에 있는지 확인
        if (ball.x + ballRadius >= blockLeft && 
            ball.x - ballRadius <= blockRight &&
            ball.y + ballRadius >= blockTop && 
            ball.y - ballRadius <= blockBottom) {

            // 충돌 방향 결정
            const ballCenterX = ball.x;
            const ballCenterY = ball.y;
            const blockCenterX = block.x + block.width / 2;
            const blockCenterY = block.y + block.height / 2;

            // 충돌 지점에서의 거리 계산
            const dx = ballCenterX - blockCenterX;
            const dy = ballCenterY - blockCenterY;

            // 충돌 방향에 따른 반사
            if (Math.abs(dx) > Math.abs(dy)) {
                // 좌우 충돌
                if (dx > 0) {
                    // 오른쪽에서 충돌
                    ball.x = blockRight + ballRadius;
                    ball.vx = Math.abs(ball.vx);
                } else {
                    // 왼쪽에서 충돌
                    ball.x = blockLeft - ballRadius;
                    ball.vx = -Math.abs(ball.vx);
                }
            } else {
                // 상하 충돌
                if (dy > 0) {
                    // 아래에서 충돌
                    ball.y = blockBottom + ballRadius;
                    ball.vy = Math.abs(ball.vy);
                } else {
                    // 위에서 충돌
                    ball.y = blockTop - ballRadius;
                    ball.vy = -Math.abs(ball.vy);
                }
            }

            // 속도에 약간의 변화 추가
            ball.vx += (Math.random() - 0.5) * 0.5;
            ball.vy += (Math.random() - 0.5) * 0.5;

            return true;
        }

        return false;
    }

    /**
     * 파워업 아이템과의 충돌 처리
     */
    handlePowerupCollision(ball, powerup) {
        const ballRadius = ball.radius;
        const powerupSize = powerup.size || 20;

        const distance = Utils.distance(ball.x, ball.y, powerup.x, powerup.y);
        
        if (distance < ballRadius + powerupSize / 2) {
            return true;
        }

        return false;
    }

    /**
     * 파티클 물리 업데이트
     */
    updateParticles(particles, deltaTime) {
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            
            // 중력 적용
            particle.vy += this.gravity * deltaTime;
            
            // 위치 업데이트
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            
            // 수명 감소
            particle.life -= deltaTime;
            
            // 수명이 다한 파티클 제거
            if (particle.life <= 0) {
                particles.splice(i, 1);
            }
        }
    }

    /**
     * 충돌 감지 최적화를 위한 공간 분할
     */
    createSpatialHash(canvas, cellSize = 100) {
        const cols = Math.ceil(canvas.width / cellSize);
        const rows = Math.ceil(canvas.height / cellSize);
        const grid = Array(rows).fill().map(() => Array(cols).fill().map(() => []));

        return {
            grid: grid,
            cellSize: cellSize,
            cols: cols,
            rows: rows,

            // 객체를 그리드에 추가
            add: function(object) {
                const col = Math.floor(object.x / cellSize);
                const row = Math.floor(object.y / cellSize);
                
                if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
                    this.grid[row][col].push(object);
                }
            },

            // 특정 영역의 객체들 가져오기
            getNearby: function(x, y, radius) {
                const startCol = Math.max(0, Math.floor((x - radius) / cellSize));
                const endCol = Math.min(this.cols - 1, Math.floor((x + radius) / cellSize));
                const startRow = Math.max(0, Math.floor((y - radius) / cellSize));
                const endRow = Math.min(this.rows - 1, Math.floor((y + radius) / cellSize));

                const nearby = [];
                for (let row = startRow; row <= endRow; row++) {
                    for (let col = startCol; col <= endCol; col++) {
                        nearby.push(...this.grid[row][col]);
                    }
                }

                return nearby;
            },

            // 그리드 초기화
            clear: function() {
                for (let row = 0; row < this.rows; row++) {
                    for (let col = 0; col < this.cols; col++) {
                        this.grid[row][col] = [];
                    }
                }
            }
        };
    }

    /**
     * 충돌 반응 계산
     */
    calculateCollisionResponse(object1, object2, elasticity = 0.8) {
        const dx = object2.x - object1.x;
        const dy = object2.y - object1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) return;

        // 정규화된 충돌 방향
        const nx = dx / distance;
        const ny = dy / distance;

        // 상대 속도
        const relativeVelocityX = object2.vx - object1.vx;
        const relativeVelocityY = object2.vy - object1.vy;

        // 충돌 방향으로의 속도 성분
        const velocityAlongNormal = relativeVelocityX * nx + relativeVelocityY * ny;

        // 탄성 충돌이 아닌 경우
        if (velocityAlongNormal > 0) return;

        // 충돌 응력 계산
        const restitution = elasticity;
        const j = -(1 + restitution) * velocityAlongNormal;

        // 속도 변화
        const impulseX = j * nx;
        const impulseY = j * ny;

        // 객체 속도 업데이트
        object1.vx -= impulseX;
        object1.vy -= impulseY;
        object2.vx += impulseX;
        object2.vy += impulseY;
    }

    /**
     * 물리 시뮬레이션 업데이트
     */
    updatePhysics(world, deltaTime) {
        // 모든 물리 객체 업데이트
        world.objects.forEach(obj => {
            if (obj.physics) {
                this.updateBall(obj, deltaTime);
            }
        });

        // 파티클 업데이트
        if (world.particles) {
            this.updateParticles(world.particles, deltaTime);
        }

        // 충돌 감지 및 처리
        this.detectCollisions(world);
    }

    /**
     * 충돌 감지
     */
    detectCollisions(world) {
        const objects = world.objects;
        
        for (let i = 0; i < objects.length; i++) {
            for (let j = i + 1; j < objects.length; j++) {
                const obj1 = objects[i];
                const obj2 = objects[j];

                if (obj1.type === 'ball' && obj2.type === 'block') {
                    if (this.handleBlockCollision(obj1, obj2)) {
                        world.onBlockHit(obj2);
                    }
                } else if (obj1.type === 'ball' && obj2.type === 'paddle') {
                    this.handlePaddleCollision(obj1, obj2);
                } else if (obj1.type === 'ball' && obj2.type === 'powerup') {
                    if (this.handlePowerupCollision(obj1, obj2)) {
                        world.onPowerupCollect(obj2);
                    }
                }
            }
        }
    }

    /**
     * 물리 디버그 정보 그리기
     */
    drawPhysicsDebug(ctx, world) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 1;

        // 충돌 박스 그리기
        world.objects.forEach(obj => {
            if (obj.debug) {
                ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
                
                // 속도 벡터 그리기
                if (obj.vx !== undefined && obj.vy !== undefined) {
                    ctx.beginPath();
                    ctx.moveTo(obj.x + obj.width / 2, obj.y + obj.height / 2);
                    ctx.lineTo(
                        obj.x + obj.width / 2 + obj.vx * 5,
                        obj.y + obj.height / 2 + obj.vy * 5
                    );
                    ctx.stroke();
                }
            }
        });

        ctx.restore();
    }
}

// 전역 물리 시스템 인스턴스
window.physics = new Physics();
