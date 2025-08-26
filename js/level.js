/**
 * 레벨(level) 클래스
 * 게임의 레벨 시스템과 블럭 배치를 담당
 */

class LevelManager {
    constructor() {
        this.currentLevel = 1;
        this.maxLevel = 10;
        this.levels = [];
        this.currentBlocks = [];
        this.blockRows = 8;
        this.blockCols = 12;
        this.blockWidth = 60;
        this.blockHeight = 25;
        this.blockSpacing = 5;
        
        this.initializeLevels();
    }

    /**
     * 레벨 초기화
     */
    initializeLevels() {
        // 레벨 1: 기본 패턴
        this.levels[1] = {
            name: "기본 패턴",
            description: "간단한 블럭 배치로 시작합니다",
            blocks: this.createBasicPattern(),
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            music: 'level1_bgm'
        };

        // 레벨 2: 체크보드 패턴
        this.levels[2] = {
            name: "체크보드",
            description: "체크보드 형태의 블럭 배치",
            blocks: this.createCheckerboardPattern(),
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            music: 'level2_bgm'
        };

        // 레벨 3: 원형 패턴
        this.levels[3] = {
            name: "원형 패턴",
            description: "원형으로 배치된 블럭들",
            blocks: this.createCircularPattern(),
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            music: 'level3_bgm'
        };

        // 레벨 4: 하트 패턴
        this.levels[4] = {
            name: "하트 모양",
            description: "사랑스러운 하트 모양의 블럭 배치",
            blocks: this.createHeartPattern(),
            background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            music: 'level4_bgm'
        };

        // 레벨 5: 스파이럴 패턴
        this.levels[5] = {
            name: "스파이럴",
            description: "나선형으로 배치된 블럭들",
            blocks: this.createSpiralPattern(),
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            music: 'level5_bgm'
        };

        // 레벨 6: 미로 패턴
        this.levels[6] = {
            name: "미로",
            description: "미로처럼 복잡한 블럭 배치",
            blocks: this.createMazePattern(),
            background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            music: 'level6_bgm'
        };

        // 레벨 7: 피라미드 패턴
        this.levels[7] = {
            name: "피라미드",
            description: "피라미드 형태의 블럭 배치",
            blocks: this.createPyramidPattern(),
            background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
            music: 'level7_bgm'
        };

        // 레벨 8: 웨이브 패턴
        this.levels[8] = {
            name: "웨이브",
            description: "물결 모양의 블럭 배치",
            blocks: this.createWavePattern(),
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            music: 'level8_bgm'
        };

        // 레벨 9: 크리스마스 트리
        this.levels[9] = {
            name: "크리스마스 트리",
            description: "크리스마스 트리 모양의 블럭 배치",
            blocks: this.createChristmasTreePattern(),
            background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            music: 'level9_bgm'
        };

        // 레벨 10: 보스 레벨
        this.levels[10] = {
            name: "보스 레벨",
            description: "최종 보스와의 대결!",
            blocks: this.createBossLevelPattern(),
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            music: 'boss_bgm'
        };
    }

    /**
     * 기본 패턴 생성
     */
    createBasicPattern() {
        const blocks = [];
        const startX = 50;
        const startY = 80;

        for (let row = 0; row < this.blockRows; row++) {
            for (let col = 0; col < this.blockCols; col++) {
                const x = startX + col * (this.blockWidth + this.blockSpacing);
                const y = startY + row * (this.blockHeight + this.blockSpacing);
                
                let blockType = 'normal';
                let health = 1;
                let points = 10;

                // 특별한 블럭들 추가
                if (row === 0 && (col === 0 || col === this.blockCols - 1)) {
                    blockType = 'special';
                    health = 2;
                    points = 50;
                } else if (row === 1 && col === Math.floor(this.blockCols / 2)) {
                    blockType = 'hard';
                    health = 3;
                    points = 30;
                }

                blocks.push({
                    x: x,
                    y: y,
                    width: this.blockWidth,
                    height: this.blockHeight,
                    type: blockType,
                    health: health,
                    maxHealth: health,
                    points: points,
                    destroyed: false
                });
            }
        }

        return blocks;
    }

    /**
     * 체크보드 패턴 생성
     */
    createCheckerboardPattern() {
        const blocks = [];
        const startX = 50;
        const startY = 80;

        for (let row = 0; row < this.blockRows; row++) {
            for (let col = 0; col < this.blockCols; col++) {
                // 체크보드 패턴: 짝수 행과 열의 교차점에만 블럭 배치
                if ((row + col) % 2 === 0) {
                    const x = startX + col * (this.blockWidth + this.blockSpacing);
                    const y = startY + row * (this.blockHeight + this.blockSpacing);
                    
                    blocks.push({
                        x: x,
                        y: y,
                        width: this.blockWidth,
                        height: this.blockHeight,
                        type: 'normal',
                        health: 1,
                        maxHealth: 1,
                        points: 15,
                        destroyed: false
                    });
                }
            }
        }

        return blocks;
    }

    /**
     * 원형 패턴 생성
     */
    createCircularPattern() {
        const blocks = [];
        const centerX = 400;
        const centerY = 200;
        const radius = 150;

        for (let angle = 0; angle < 360; angle += 15) {
            const radian = (angle * Math.PI) / 180;
            const x = centerX + Math.cos(radian) * radius;
            const y = centerY + Math.sin(radian) * radius;
            
            blocks.push({
                x: x - this.blockWidth / 2,
                y: y - this.blockHeight / 2,
                width: this.blockWidth,
                height: this.blockHeight,
                type: 'normal',
                health: 1,
                maxHealth: 1,
                points: 20,
                destroyed: false
            });
        }

        return blocks;
    }

    /**
     * 하트 패턴 생성
     */
    createHeartPattern() {
        const blocks = [];
        const centerX = 400;
        const centerY = 200;
        const scale = 0.8;

        for (let t = 0; t < 2 * Math.PI; t += 0.1) {
            const x = centerX + scale * 16 * Math.pow(Math.sin(t), 3);
            const y = centerY - scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            
            if (y > 0 && y < 500) {
                blocks.push({
                    x: x - this.blockWidth / 2,
                    y: y - this.blockHeight / 2,
                    width: this.blockWidth,
                    height: this.blockHeight,
                    type: 'special',
                    health: 2,
                    maxHealth: 2,
                    points: 25,
                    destroyed: false
                });
            }
        }

        return blocks;
    }

    /**
     * 스파이럴 패턴 생성
     */
    createSpiralPattern() {
        const blocks = [];
        const centerX = 400;
        const centerY = 200;
        const maxRadius = 200;
        const spiralTurns = 3;

        for (let radius = 20; radius < maxRadius; radius += 15) {
            const angle = (radius / maxRadius) * spiralTurns * 2 * Math.PI;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            blocks.push({
                x: x - this.blockWidth / 2,
                y: y - this.blockHeight / 2,
                width: this.blockWidth,
                height: this.blockHeight,
                type: 'normal',
                health: 1,
                maxHealth: 1,
                points: 18,
                destroyed: false
            });
        }

        return blocks;
    }

    /**
     * 미로 패턴 생성
     */
    createMazePattern() {
        const blocks = [];
        const startX = 50;
        const startY = 80;
        const maze = [
            "WWWWWWWWWWWW",
            "W          W",
            "W WWWWWWW W",
            "W W     W W",
            "W W WWW W W",
            "W W   W W W",
            "W WWWWW W W",
            "W         W",
            "WWWWWWWWWWW"
        ];

        for (let row = 0; row < maze.length; row++) {
            for (let col = 0; col < maze[row].length; col++) {
                if (maze[row][col] === 'W') {
                    const x = startX + col * (this.blockWidth + this.blockSpacing);
                    const y = startY + row * (this.blockHeight + this.blockSpacing);
                    
                    blocks.push({
                        x: x,
                        y: y,
                        width: this.blockWidth,
                        height: this.blockHeight,
                        type: 'hard',
                        health: 2,
                        maxHealth: 2,
                        points: 25,
                        destroyed: false
                    });
                }
            }
        }

        return blocks;
    }

    /**
     * 피라미드 패턴 생성
     */
    createPyramidPattern() {
        const blocks = [];
        const startX = 200;
        const startY = 80;
        const pyramidHeight = 8;

        for (let row = 0; row < pyramidHeight; row++) {
            const blocksInRow = pyramidHeight - row;
            const rowStartX = startX + row * (this.blockWidth + this.blockSpacing) / 2;
            
            for (let col = 0; col < blocksInRow; col++) {
                const x = rowStartX + col * (this.blockWidth + this.blockSpacing);
                const y = startY + row * (this.blockHeight + this.blockSpacing);
                
                let blockType = 'normal';
                let health = 1;
                let points = 15;

                // 피라미드 꼭대기는 특별한 블럭
                if (row === 0) {
                    blockType = 'special';
                    health = 3;
                    points = 100;
                }

                blocks.push({
                    x: x,
                    y: y,
                    width: this.blockWidth,
                    height: this.blockHeight,
                    type: blockType,
                    health: health,
                    maxHealth: health,
                    points: points,
                    destroyed: false
                });
            }
        }

        return blocks;
    }

    /**
     * 웨이브 패턴 생성
     */
    createWavePattern() {
        const blocks = [];
        const startX = 50;
        const startY = 80;
        const amplitude = 3;
        const frequency = 0.3;

        for (let row = 0; row < this.blockRows; row++) {
            const waveOffset = Math.sin(row * frequency) * amplitude;
            const blocksInRow = this.blockCols - Math.abs(waveOffset) * 2;
            const rowStartX = startX + Math.abs(waveOffset) * (this.blockWidth + this.blockSpacing);
            
            for (let col = 0; col < blocksInRow; col++) {
                const x = rowStartX + col * (this.blockWidth + this.blockSpacing);
                const y = startY + row * (this.blockHeight + this.blockSpacing);
                
                blocks.push({
                    x: x,
                    y: y,
                    width: this.blockWidth,
                    height: this.blockHeight,
                    type: 'normal',
                    health: 1,
                    maxHealth: 1,
                    points: 20,
                    destroyed: false
                });
            }
        }

        return blocks;
    }

    /**
     * 크리스마스 트리 패턴 생성
     */
    createChristmasTreePattern() {
        const blocks = [];
        const startX = 350;
        const startY = 80;
        const treeHeight = 8;

        for (let row = 0; row < treeHeight; row++) {
            const blocksInRow = row + 1;
            const rowStartX = startX - (blocksInRow - 1) * (this.blockWidth + this.blockSpacing) / 2;
            
            for (let col = 0; col < blocksInRow; col++) {
                const x = rowStartX + col * (this.blockWidth + this.blockSpacing);
                const y = startY + row * (this.blockHeight + this.blockSpacing);
                
                let blockType = 'normal';
                let health = 1;
                let points = 20;

                // 트리 꼭대기는 별 모양
                if (row === 0) {
                    blockType = 'special';
                    health = 5;
                    points = 200;
                } else if (row === treeHeight - 1) {
                    // 트리 기둥
                    blockType = 'hard';
                    health = 3;
                    points = 50;
                }

                blocks.push({
                    x: x,
                    y: y,
                    width: this.blockWidth,
                    height: this.blockHeight,
                    type: blockType,
                    health: health,
                    maxHealth: health,
                    points: points,
                    destroyed: false
                });
            }
        }

        return blocks;
    }

    /**
     * 보스 레벨 패턴 생성
     */
    createBossLevelPattern() {
        const blocks = [];
        const startX = 50;
        const startY = 80;

        // 일반 블럭들
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < this.blockCols; col++) {
                const x = startX + col * (this.blockWidth + this.blockSpacing);
                const y = startY + row * (this.blockHeight + this.blockSpacing);
                
                blocks.push({
                    x: x,
                    y: y,
                    width: this.blockWidth,
                    height: this.blockHeight,
                    type: 'hard',
                    health: 3,
                    maxHealth: 3,
                    points: 50,
                    destroyed: false
                });
            }
        }

        // 보스 블럭 (중앙 하단)
        const bossX = startX + (this.blockCols / 2 - 1) * (this.blockWidth + this.blockSpacing);
        const bossY = startY + 4 * (this.blockHeight + this.blockSpacing);
        
        blocks.push({
            x: bossX,
            y: bossY,
            width: this.blockWidth * 2 + this.blockSpacing,
            height: this.blockHeight * 2 + this.blockSpacing,
            type: 'boss',
            health: 10,
            maxHealth: 10,
            points: 500,
            destroyed: false
        });

        return blocks;
    }

    /**
     * 현재 레벨 로드
     */
    loadLevel(levelNumber) {
        if (levelNumber < 1 || levelNumber > this.maxLevel) {
            console.error('Invalid level number:', levelNumber);
            return false;
        }

        this.currentLevel = levelNumber;
        const levelData = this.levels[levelNumber];
        
        if (!levelData) {
            console.error('Level data not found for level:', levelNumber);
            return false;
        }

        // 현재 블럭들 복사
        this.currentBlocks = JSON.parse(JSON.stringify(levelData.blocks));
        
        // 배경 변경
        this.changeBackground(levelData.background);
        
        // 음악 변경
        if (window.soundManager && levelData.music) {
            window.soundManager.playMusic(levelData.music);
        }

        return true;
    }

    /**
     * 배경 변경
     */
    changeBackground(background) {
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.style.background = background;
        }
    }

    /**
     * 다음 레벨으로 진행
     */
    nextLevel() {
        if (this.currentLevel < this.maxLevel) {
            return this.loadLevel(this.currentLevel + 1);
        }
        return false; // 모든 레벨 완료
    }

    /**
     * 레벨 재시작
     */
    restartLevel() {
        return this.loadLevel(this.currentLevel);
    }

    /**
     * 블럭 제거
     */
    removeBlock(blockIndex) {
        if (blockIndex >= 0 && blockIndex < this.currentBlocks.length) {
            this.currentBlocks[blockIndex].destroyed = true;
        }
    }

    /**
     * 모든 블럭 파괴 확인
     */
    isLevelComplete() {
        return this.currentBlocks.every(block => block.destroyed);
    }

    /**
     * 남은 블럭 수 계산
     */
    getRemainingBlocks() {
        return this.currentBlocks.filter(block => !block.destroyed).length;
    }

    /**
     * 레벨 정보 가져오기
     */
    getLevelInfo() {
        const levelData = this.levels[this.currentLevel];
        return {
            number: this.currentLevel,
            name: levelData ? levelData.name : 'Unknown',
            description: levelData ? levelData.description : '',
            totalBlocks: this.currentBlocks.length,
            remainingBlocks: this.getRemainingBlocks(),
            progress: ((this.currentBlocks.length - this.getRemainingBlocks()) / this.currentBlocks.length) * 100
        };
    }

    /**
     * 레벨 통계 가져오기
     */
    getLevelStats() {
        return {
            currentLevel: this.currentLevel,
            maxLevel: this.maxLevel,
            totalBlocks: this.currentBlocks.length,
            destroyedBlocks: this.currentBlocks.filter(block => block.destroyed).length,
            remainingBlocks: this.getRemainingBlocks(),
            completionPercentage: ((this.currentBlocks.length - this.getRemainingBlocks()) / this.currentBlocks.length) * 100
        };
    }

    /**
     * 레벨 리셋
     */
    reset() {
        this.currentLevel = 1;
        this.currentBlocks = [];
    }
}

// 전역 레벨 매니저 인스턴스
window.levelManager = new LevelManager();
