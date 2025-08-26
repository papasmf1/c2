/**
 * 충돌 감지 시스템
 */

class CollisionSystem {
    constructor() {
        this.collisionTypes = {
            NONE: 'none',
            WALL: 'wall',
            PADDLE: 'paddle',
            BLOCK: 'block',
            POWERUP: 'powerup',
            GAME_OVER: 'gameOver'
        };
    }

    /**
     * AABB (Axis-Aligned Bounding Box) 충돌 감지
     */
    checkAABBCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    /**
     * 원과 사각형 충돌 감지
     */
    checkCircleRectCollision(circle, rect) {
        // 원의 중심에서 사각형까지의 가장 가까운 점 찾기
        const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

        // 가장 가까운 점과 원의 중심 사이의 거리 계산
        const distanceX = circle.x - closestX;
        const distanceY = circle.y - closestY;
        const distanceSquared = distanceX * distanceX + distanceY * distanceY;

        return distanceSquared < circle.radius * circle.radius;
    }

    /**
     * 원과 원 충돌 감지
     */
    checkCircleCircleCollision(circle1, circle2) {
        const dx = circle2.x - circle1.x;
        const dy = circle2.y - circle1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < circle1.radius + circle2.radius;
    }

    /**
     * 점과 사각형 충돌 감지
     */
    checkPointRectCollision(point, rect) {
        return point.x >= rect.x &&
               point.x <= rect.x + rect.width &&
               point.y >= rect.y &&
               point.y <= rect.y + rect.height;
    }

    /**
     * 공과 벽 충돌 감지
     */
    checkBallWallCollision(ball, canvas) {
        const collisions = [];

        // 왼쪽 벽
        if (ball.x - ball.radius <= 0) {
            collisions.push({
                type: this.collisionTypes.WALL,
                side: 'left',
                penetration: ball.radius - ball.x
            });
        }

        // 오른쪽 벽
        if (ball.x + ball.radius >= canvas.width) {
            collisions.push({
                type: this.collisionTypes.WALL,
                side: 'right',
                penetration: ball.x + ball.radius - canvas.width
            });
        }

        // 위쪽 벽
        if (ball.y - ball.radius <= 0) {
            collisions.push({
                type: this.collisionTypes.WALL,
                side: 'top',
                penetration: ball.radius - ball.y
            });
        }

        // 아래쪽 벽 (게임 오버)
        if (ball.y + ball.radius >= canvas.height) {
            collisions.push({
                type: this.collisionTypes.GAME_OVER,
                side: 'bottom',
                penetration: 0
            });
        }

        return collisions;
    }

    /**
     * 공과 패들 충돌 감지
     */
    checkBallPaddleCollision(ball, paddle) {
        if (!this.checkCircleRectCollision(ball, paddle)) {
            return null;
        }

        // 충돌 위치 계산 (0~1 사이 값)
        const hitPosition = (ball.x - paddle.x) / paddle.width;
        
        // 충돌 깊이 계산
        const ballBottom = ball.y + ball.radius;
        const paddleTop = paddle.y;
        const penetration = ballBottom - paddleTop;

        return {
            type: this.collisionTypes.PADDLE,
            hitPosition: hitPosition,
            penetration: penetration,
            side: 'top'
        };
    }

    /**
     * 공과 블럭 충돌 감지
     */
    checkBallBlockCollision(ball, block) {
        if (!this.checkCircleRectCollision(ball, block)) {
            return null;
        }

        // 충돌 방향 결정
        const ballCenterX = ball.x;
        const ballCenterY = ball.y;
        const blockCenterX = block.x + block.width / 2;
        const blockCenterY = block.y + block.height / 2;

        // 충돌 지점에서의 거리
        const dx = ballCenterX - blockCenterX;
        const dy = ballCenterY - blockCenterY;

        let collisionSide;
        let penetration;

        if (Math.abs(dx) > Math.abs(dy)) {
            // 좌우 충돌
            if (dx > 0) {
                collisionSide = 'right';
                penetration = ball.radius - (block.x + block.width - ball.x);
            } else {
                collisionSide = 'left';
                penetration = ball.radius - (ball.x - block.x);
            }
        } else {
            // 상하 충돌
            if (dy > 0) {
                collisionSide = 'bottom';
                penetration = ball.radius - (block.y + block.height - ball.y);
            } else {
                collisionSide = 'top';
                penetration = ball.radius - (ball.y - block.y);
            }
        }

        return {
            type: this.collisionTypes.BLOCK,
            block: block,
            side: collisionSide,
            penetration: penetration,
            hitPosition: {
                x: (ball.x - block.x) / block.width,
                y: (ball.y - block.y) / block.height
            }
        };
    }

    /**
     * 공과 파워업 충돌 감지
     */
    checkBallPowerupCollision(ball, powerup) {
        if (this.checkCircleCircleCollision(ball, powerup)) {
            return {
                type: this.collisionTypes.POWERUP,
                powerup: powerup
            };
        }
        return null;
    }

    /**
     * 마우스/터치와 UI 요소 충돌 감지
     */
    checkMouseUICollision(mouseX, mouseY, uiElement) {
        return this.checkPointRectCollision(
            { x: mouseX, y: mouseY },
            uiElement
        );
    }

    /**
     * 충돌 반응 처리
     */
    resolveCollision(collision, ball, game) {
        switch (collision.type) {
            case this.collisionTypes.WALL:
                this.resolveWallCollision(collision, ball);
                break;
                
            case this.collisionTypes.PADDLE:
                this.resolvePaddleCollision(collision, ball);
                break;
                
            case this.collisionTypes.BLOCK:
                this.resolveBlockCollision(collision, ball, game);
                break;
                
            case this.collisionTypes.POWERUP:
                this.resolvePowerupCollision(collision, ball, game);
                break;
                
            case this.collisionTypes.GAME_OVER:
                return 'gameOver';
        }
        
        return 'collision';
    }

    /**
     * 벽 충돌 해결
     */
    resolveWallCollision(collision, ball) {
        const damping = 0.8;
        
        switch (collision.side) {
            case 'left':
                ball.x = ball.radius;
                ball.vx = Math.abs(ball.vx) * damping;
                break;
                
            case 'right':
                ball.x = 800 - ball.radius; // canvas width
                ball.vx = -Math.abs(ball.vx) * damping;
                break;
                
            case 'top':
                ball.y = ball.radius;
                ball.vy = Math.abs(ball.vy) * damping;
                break;
        }
    }

    /**
     * 패들 충돌 해결
     */
    resolvePaddleCollision(collision, ball) {
        // 충돌 위치에 따른 반사각 계산
        const hitPosition = collision.hitPosition; // 0~1 사이 값
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
        ball.y = 550 - ball.radius; // paddle y position
    }

    /**
     * 블럭 충돌 해결
     */
    resolveBlockCollision(collision, ball, game) {
        const block = collision.block;
        const penetration = collision.penetration;
        
        // 충돌 방향에 따른 위치 조정
        switch (collision.side) {
            case 'left':
                ball.x = block.x - ball.radius;
                ball.vx = -Math.abs(ball.vx);
                break;
                
            case 'right':
                ball.x = block.x + block.width + ball.radius;
                ball.vx = Math.abs(ball.vx);
                break;
                
            case 'top':
                ball.y = block.y - ball.radius;
                ball.vy = -Math.abs(ball.vy);
                break;
                
            case 'bottom':
                ball.y = block.y + block.height + ball.radius;
                ball.vy = Math.abs(ball.vy);
                break;
        }

        // 속도에 약간의 변화 추가
        ball.vx += (Math.random() - 0.5) * 0.5;
        ball.vy += (Math.random() - 0.5) * 0.5;

        // 블럭 파괴 처리
        if (game && game.onBlockHit) {
            game.onBlockHit(block);
        }
    }

    /**
     * 파워업 충돌 해결
     */
    resolvePowerupCollision(collision, ball, game) {
        const powerup = collision.powerup;
        
        // 파워업 효과 적용
        if (game && game.onPowerupCollect) {
            game.onPowerupCollect(powerup);
        }
    }

    /**
     * 충돌 최적화를 위한 공간 분할
     */
    createSpatialGrid(canvas, cellSize = 100) {
        const cols = Math.ceil(canvas.width / cellSize);
        const rows = Math.ceil(canvas.height / cellSize);
        
        return {
            grid: Array(rows).fill().map(() => Array(cols).fill().map(() => [])),
            cellSize: cellSize,
            cols: cols,
            rows: rows,

            // 객체를 그리드에 추가
            addObject: function(object) {
                const col = Math.floor(object.x / cellSize);
                const row = Math.floor(object.y / cellSize);
                
                if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
                    this.grid[row][col].push(object);
                }
            },

            // 특정 영역의 객체들 가져오기
            getObjectsInArea: function(x, y, radius) {
                const startCol = Math.max(0, Math.floor((x - radius) / cellSize));
                const endCol = Math.min(this.cols - 1, Math.floor((x + radius) / cellSize));
                const startRow = Math.max(0, Math.floor((y - radius) / cellSize));
                const endRow = Math.min(this.rows - 1, Math.floor((y + radius) / cellSize));

                const objects = [];
                for (let row = startRow; row <= endRow; row++) {
                    for (let col = startCol; col <= endCol; col++) {
                        objects.push(...this.grid[row][col]);
                    }
                }

                return objects;
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
     * 충돌 디버그 정보 그리기
     */
    drawCollisionDebug(ctx, collisions) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.font = '12px Arial';
        ctx.fillStyle = 'red';

        collisions.forEach((collision, index) => {
            if (collision.type === this.collisionTypes.BLOCK) {
                const block = collision.block;
                ctx.strokeRect(block.x, block.y, block.width, block.height);
                ctx.fillText(`Block ${index}`, block.x, block.y - 5);
            }
        });

        ctx.restore();
    }

    /**
     * 충돌 통계
     */
    getCollisionStats() {
        return {
            totalCollisions: 0,
            wallCollisions: 0,
            paddleCollisions: 0,
            blockCollisions: 0,
            powerupCollisions: 0
        };
    }
}

// 전역 충돌 시스템 인스턴스
window.collisionSystem = new CollisionSystem();
