/**
 * 점수 관리 시스템
 */

class ScoreManager {
    constructor() {
        this.currentScore = 0;
        this.highScores = [];
        this.scoreMultiplier = 1;
        this.comboCount = 0;
        this.maxCombo = 0;
        this.blocksDestroyed = 0;
        this.level = 1;
        this.lives = 3;
        
        this.loadHighScores();
        this.setupScoreDisplay();
    }

    /**
     * 점수 추가
     */
    addScore(points, blockType = 'normal') {
        // 블럭 타입별 보너스 점수
        let bonusMultiplier = 1;
        switch (blockType) {
            case 'hard':
                bonusMultiplier = 3;
                break;
            case 'special':
                bonusMultiplier = 5;
                break;
            case 'boss':
                bonusMultiplier = 10;
                break;
        }

        // 콤보 보너스
        const comboBonus = Math.min(this.comboCount * 0.1, 1.0);
        const totalPoints = Math.floor(points * bonusMultiplier * (1 + comboBonus) * this.scoreMultiplier);
        
        this.currentScore += totalPoints;
        this.blocksDestroyed++;
        this.comboCount++;

        // 최대 콤보 업데이트
        if (this.comboCount > this.maxCombo) {
            this.maxCombo = this.comboCount;
        }

        // 점수 표시 업데이트
        this.updateScoreDisplay();
        
        // 콤보 표시
        this.showComboBonus(totalPoints, this.comboCount);
        
        return totalPoints;
    }

    /**
     * 콤보 리셋
     */
    resetCombo() {
        this.comboCount = 0;
    }

    /**
     * 생명 감소
     */
    loseLife() {
        this.lives--;
        this.resetCombo();
        this.updateLivesDisplay();
        
        if (this.lives <= 0) {
            return 'gameOver';
        }
        return 'continue';
    }

    /**
     * 생명 추가
     */
    addLife() {
        this.lives++;
        this.updateLivesDisplay();
    }

    /**
     * 레벨 증가
     */
    nextLevel() {
        this.level++;
        this.scoreMultiplier += 0.1;
        this.resetCombo();
        this.updateLevelDisplay();
    }

    /**
     * 게임 리셋
     */
    resetGame() {
        this.currentScore = 0;
        this.comboCount = 0;
        this.blocksDestroyed = 0;
        this.scoreMultiplier = 1;
        this.lives = 3;
        this.level = 1;
        
        this.updateAllDisplays();
    }

    /**
     * 하이스코어 저장
     */
    saveHighScore(playerName = 'Player') {
        const highScore = {
            name: playerName,
            score: this.currentScore,
            level: this.level,
            blocksDestroyed: this.blocksDestroyed,
            maxCombo: this.maxCombo,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };

        this.highScores.push(highScore);
        
        // 점수순으로 정렬
        this.highScores.sort((a, b) => b.score - a.score);
        
        // 상위 10개만 유지
        if (this.highScores.length > 10) {
            this.highScores = this.highScores.slice(0, 10);
        }

        // 로컬 스토리지에 저장
        this.saveHighScoresToStorage();
        
        return highScore;
    }

    /**
     * 하이스코어 불러오기
     */
    loadHighScores() {
        try {
            const saved = localStorage.getItem('blockBreakerHighScores');
            if (saved) {
                this.highScores = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load high scores:', error);
            this.highScores = [];
        }
    }

    /**
     * 하이스코어를 로컬 스토리지에 저장
     */
    saveHighScoresToStorage() {
        try {
            localStorage.setItem('blockBreakerHighScores', JSON.stringify(this.highScores));
        } catch (error) {
            console.error('Failed to save high scores:', error);
        }
    }

    /**
     * 점수 표시 설정
     */
    setupScoreDisplay() {
        this.scoreElement = document.getElementById('currentScore');
        this.levelElement = document.getElementById('currentLevel');
        this.livesElement = document.getElementById('currentLives');
    }

    /**
     * 점수 표시 업데이트
     */
    updateScoreDisplay() {
        if (this.scoreElement) {
            this.scoreElement.textContent = this.currentScore.toLocaleString();
        }
    }

    /**
     * 레벨 표시 업데이트
     */
    updateLevelDisplay() {
        if (this.levelElement) {
            this.levelElement.textContent = this.level;
        }
    }

    /**
     * 생명 표시 업데이트
     */
    updateLivesDisplay() {
        if (this.livesElement) {
            this.livesElement.textContent = this.lives;
        }
    }

    /**
     * 모든 표시 업데이트
     */
    updateAllDisplays() {
        this.updateScoreDisplay();
        this.updateLevelDisplay();
        this.updateLivesDisplay();
    }

    /**
     * 콤보 보너스 표시
     */
    showComboBonus(points, combo) {
        // 점수 팝업 생성
        const scorePopup = document.createElement('div');
        scorePopup.className = 'score-popup';
        scorePopup.textContent = `+${points}`;
        
        if (combo > 1) {
            scorePopup.textContent += ` (${combo}x Combo!)`;
            scorePopup.style.color = '#e74c3c';
            scorePopup.style.fontSize = '1.4rem';
        }

        // 랜덤 위치 설정
        const x = Utils.random(100, 700);
        const y = Utils.random(100, 400);
        
        scorePopup.style.left = x + 'px';
        scorePopup.style.top = y + 'px';
        
        document.body.appendChild(scorePopup);
        
        // 애니메이션 후 제거
        setTimeout(() => {
            if (scorePopup.parentNode) {
                scorePopup.parentNode.removeChild(scorePopup);
            }
        }, 1500);
    }

    /**
     * 하이스코어 목록 표시
     */
    displayHighScores() {
        const highScoreList = document.getElementById('highScoreList');
        if (!highScoreList) return;

        highScoreList.innerHTML = '';

        if (this.highScores.length === 0) {
            const noScores = document.createElement('p');
            noScores.textContent = '아직 기록된 점수가 없습니다.';
            noScores.style.textAlign = 'center';
            noScores.style.color = '#666';
            noScores.style.margin = '20px 0';
            highScoreList.appendChild(noScores);
            return;
        }

        this.highScores.forEach((score, index) => {
            const scoreItem = document.createElement('div');
            scoreItem.className = 'high-score-item';

            const rank = document.createElement('span');
            rank.className = 'high-score-rank';
            rank.textContent = `#${index + 1}`;

            const name = document.createElement('span');
            name.className = 'high-score-name';
            name.textContent = score.name;

            const value = document.createElement('span');
            value.className = 'high-score-value';
            value.textContent = score.score.toLocaleString();

            const details = document.createElement('div');
            details.style.fontSize = '0.8rem';
            details.style.color = '#666';
            details.style.marginTop = '5px';
            details.textContent = `Level ${score.level} • ${score.blocksDestroyed} blocks • ${score.maxCombo} max combo`;

            scoreItem.appendChild(rank);
            scoreItem.appendChild(name);
            scoreItem.appendChild(value);
            scoreItem.appendChild(details);

            highScoreList.appendChild(scoreItem);
        });
    }

    /**
     * 최종 점수 표시
     */
    displayFinalScore() {
        const finalScoreElement = document.getElementById('finalScore');
        const highScoreElement = document.getElementById('highScore');
        
        if (finalScoreElement) {
            finalScoreElement.textContent = this.currentScore.toLocaleString();
        }
        
        if (highScoreElement) {
            const highestScore = this.highScores.length > 0 ? this.highScores[0].score : 0;
            highScoreElement.textContent = highestScore.toLocaleString();
        }
    }

    /**
     * 점수 통계 가져오기
     */
    getScoreStats() {
        return {
            currentScore: this.currentScore,
            highScore: this.highScores.length > 0 ? this.highScores[0].score : 0,
            level: this.level,
            lives: this.lives,
            blocksDestroyed: this.blocksDestroyed,
            maxCombo: this.maxCombo,
            currentCombo: this.comboCount,
            scoreMultiplier: this.scoreMultiplier
        };
    }

    /**
     * 점수 보너스 적용
     */
    applyScoreBonus(bonusType, duration = 10000) {
        const originalMultiplier = this.scoreMultiplier;
        
        switch (bonusType) {
            case 'double':
                this.scoreMultiplier *= 2;
                break;
            case 'triple':
                this.scoreMultiplier *= 3;
                break;
            case 'combo':
                this.comboCount += 5;
                break;
        }

        // 보너스 효과 표시
        this.showBonusEffect(bonusType);

        // 일정 시간 후 원래대로 복원
        setTimeout(() => {
            this.scoreMultiplier = originalMultiplier;
            this.showBonusEffect('bonusEnd');
        }, duration);
    }

    /**
     * 보너스 효과 표시
     */
    showBonusEffect(bonusType) {
        const bonusText = document.createElement('div');
        bonusText.className = 'bonus-effect';
        bonusText.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 215, 0, 0.9);
            color: #333;
            padding: 20px 40px;
            border-radius: 15px;
            font-size: 2rem;
            font-weight: bold;
            z-index: 1000;
            animation: bonusPulse 2s ease-out forwards;
        `;

        switch (bonusType) {
            case 'double':
                bonusText.textContent = '2x Score!';
                break;
            case 'triple':
                bonusText.textContent = '3x Score!';
                break;
            case 'combo':
                bonusText.textContent = 'Combo Bonus!';
                break;
            case 'bonusEnd':
                bonusText.textContent = 'Bonus Ended';
                bonusText.style.background = 'rgba(255, 0, 0, 0.9)';
                bonusText.style.color = 'white';
                break;
        }

        document.body.appendChild(bonusText);

        // 애니메이션 후 제거
        setTimeout(() => {
            if (bonusText.parentNode) {
                bonusText.parentNode.removeChild(bonusText);
            }
        }, 2000);
    }

    /**
     * 점수 애니메이션
     */
    animateScoreChange(oldScore, newScore) {
        const duration = 1000; // 1초
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 부드러운 보간
            const currentScore = Math.floor(Utils.lerp(oldScore, newScore, progress));
            
            if (this.scoreElement) {
                this.scoreElement.textContent = currentScore.toLocaleString();
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    /**
     * 점수 내보내기
     */
    exportScores() {
        const data = {
            highScores: this.highScores,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `block-breaker-scores-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    /**
     * 점수 가져오기
     */
    importScores(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.highScores && Array.isArray(data.highScores)) {
                    this.highScores = data.highScores;
                    this.saveHighScoresToStorage();
                    this.displayHighScores();
                    alert('점수가 성공적으로 가져와졌습니다!');
                } else {
                    alert('올바른 점수 파일이 아닙니다.');
                }
            } catch (error) {
                alert('파일을 읽는 중 오류가 발생했습니다.');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    }
}

// 전역 점수 관리자 인스턴스
window.scoreManager = new ScoreManager();
