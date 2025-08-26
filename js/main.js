/**
 * 메인(main) JavaScript 파일
 * 게임의 진입점과 초기화를 담당
 */

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 블럭꺠기 게임 초기화 중...');
    
    // 게임 초기화
    initializeGame();
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 설정 로드 및 적용
    loadAndApplySettings();
    
    console.log('✅ 게임 초기화 완료!');
});

/**
 * 게임 초기화
 */
function initializeGame() {
    try {
        // 전역 객체들이 로드되었는지 확인
        if (!window.scoreManager) {
            console.error('ScoreManager가 로드되지 않았습니다.');
            return;
        }
        
        if (!window.soundManager) {
            console.error('SoundManager가 로드되지 않았습니다.');
            return;
        }
        
        if (!window.levelManager) {
            console.error('LevelManager가 로드되지 않았습니다.');
            return;
        }
        
        if (!window.ball) {
            console.error('Ball이 로드되지 않았습니다.');
            return;
        }
        
        if (!window.paddle) {
            console.error('Paddle이 로드되지 않았습니다.');
            return;
        }
        
        if (!window.game) {
            console.error('Game이 로드되지 않았습니다.');
            return;
        }
        
        // 게임 객체들 초기화
        initializeGameObjects();
        
        // UI 초기화
        initializeUI();
        
        // 사운드 시스템 초기화
        initializeSoundSystem();
        
        // 레벨 시스템 초기화
        initializeLevelSystem();
        
        console.log('🎯 게임 객체들 초기화 완료');
        
    } catch (error) {
        console.error('게임 초기화 중 오류 발생:', error);
    }
}

/**
 * 게임 객체들 초기화
 */
function initializeGameObjects() {
    // 공 초기화
    if (window.ball) {
        window.ball.init();
        console.log('⚽ 공 초기화 완료');
    }
    
    // 패들 초기화
    if (window.paddle) {
        window.paddle.reset();
        console.log('🏓 패들 초기화 완료');
    }
    
    // 점수 시스템 초기화
    if (window.scoreManager) {
        window.scoreManager.updateAllDisplays();
        console.log('📊 점수 시스템 초기화 완료');
    }
}

/**
 * UI 초기화
 */
function initializeUI() {
    // 메인 메뉴 표시
    showScreen('mainMenu');
    
    // 버튼 상태 초기화
    updateButtonStates();
    
    // 게임 정보 표시
    updateGameInfo();
    
    console.log('🖥️ UI 초기화 완료');
}

/**
 * 사운드 시스템 초기화
 */
function initializeSoundSystem() {
    if (window.soundManager) {
        // 볼륨 설정
        const volumeSlider = document.getElementById('soundVolume');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', function() {
                const volume = this.value;
                window.soundManager.setVolume(volume);
                
                // 볼륨 값 표시 업데이트
                const volumeValue = document.getElementById('volumeValue');
                if (volumeValue) {
                    volumeValue.textContent = volume + '%';
                }
            });
        }
        
        // 배경음악 시작
        window.soundManager.playMusic('menu_bgm');
        
        console.log('🔊 사운드 시스템 초기화 완료');
    }
}

/**
 * 레벨 시스템 초기화
 */
function initializeLevelSystem() {
    if (window.levelManager) {
        // 첫 번째 레벨 정보 표시
        const levelInfo = window.levelManager.getLevelInfo();
        console.log(`🎮 레벨 시스템 초기화 완료 - 현재 레벨: ${levelInfo.number}`);
    }
}

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
    // 하이스코어에서 돌아가기
    const backFromHighScoresButton = document.getElementById('backFromHighScores');
    if (backFromHighScoresButton) {
        backFromHighScoresButton.addEventListener('click', function() {
            showScreen('mainMenu');
        });
    }
    
    // 설정에서 돌아가기
    const backFromSettingsButton = document.getElementById('backFromSettings');
    if (backFromSettingsButton) {
        backFromSettingsButton.addEventListener('click', function() {
            showScreen('mainMenu');
        });
    }
    
    // 게임 오버 화면에서 다시 하기
    const playAgainButton = document.getElementById('playAgain');
    if (playAgainButton) {
        playAgainButton.addEventListener('click', function() {
            console.log('다시 하기 버튼 클릭됨');
            if (window.game) {
                window.game.restartGame();
            }
        });
    }
    
    // 게임 오버 화면에서 메인 메뉴로
    const backToMainMenuButton = document.getElementById('backToMainMenu');
    if (backToMainMenuButton) {
        backToMainMenuButton.addEventListener('click', function() {
            console.log('메인 메뉴로 버튼 클릭됨');
            if (window.game) {
                window.game.backToMenu();
            }
        });
    }
    
    // 설정 변경 이벤트
    const difficultySelect = document.getElementById('difficulty');
    if (difficultySelect) {
        difficultySelect.addEventListener('change', function() {
            updateDifficulty(this.value);
        });
    }
    
    const controlsSelect = document.getElementById('controls');
    if (controlsSelect) {
        controlsSelect.addEventListener('change', function() {
            updateControls(this.value);
        });
    }
    
    // 키보드 단축키
    document.addEventListener('keydown', function(e) {
        handleGlobalKeyDown(e);
    });
    
    console.log('🎯 이벤트 리스너 설정 완료');
}

/**
 * 설정 로드 및 적용
 */
function loadAndApplySettings() {
    try {
        const savedSettings = localStorage.getItem('blockBreakerSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            
            // 난이도 설정
            if (settings.difficulty) {
                const difficultySelect = document.getElementById('difficulty');
                if (difficultySelect) {
                    difficultySelect.value = settings.difficulty;
                }
            }
            
            // 조작 방식 설정
            if (settings.controls) {
                const controlsSelect = document.getElementById('controls');
                if (controlsSelect) {
                    controlsSelect.value = settings.controls;
                }
            }
            
            // 사운드 설정
            if (settings.soundEnabled !== undefined) {
                const volumeSlider = document.getElementById('soundVolume');
                if (volumeSlider) {
                    volumeSlider.value = settings.soundEnabled ? 50 : 0;
                }
            }
            
            console.log('⚙️ 설정 로드 완료');
        }
    } catch (error) {
        console.error('설정 로드 중 오류 발생:', error);
    }
}

/**
 * 화면 전환
 */
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        console.log(`화면 전환: ${screenId}`);
        
        // 특정 화면에 대한 추가 처리
        switch (screenId) {
            case 'highScoreScreen':
                if (window.scoreManager) {
                    window.scoreManager.displayHighScores();
                }
                break;
            case 'gameOverScreen':
                if (window.scoreManager) {
                    window.scoreManager.displayFinalScore();
                }
                break;
        }
    } else {
        console.error(`화면을 찾을 수 없습니다: ${screenId}`);
    }
}

/**
 * 버튼 상태 업데이트
 */
function updateButtonStates() {
    // 게임 상태에 따른 버튼 활성화/비활성화
    const gameButtons = document.querySelectorAll('.game-controls button');
    gameButtons.forEach(button => {
        button.disabled = false;
    });
}

/**
 * 게임 정보 업데이트
 */
function updateGameInfo() {
    // 게임 정보 표시 업데이트
    const gameInfo = document.querySelector('.game-info');
    if (gameInfo) {
        gameInfo.innerHTML = `
            <p>방향키 또는 마우스로 패들을 조작하세요!</p>
            <p>공을 받아서 모든 블럭을 깨세요!</p>
            <p>스페이스바 또는 클릭으로 공을 발사하세요!</p>
        `;
    }
}

/**
 * 난이도 업데이트
 */
function updateDifficulty(difficulty) {
    if (window.game) {
        window.game.difficulty = difficulty;
        window.game.adjustDifficulty();
    }
    
    console.log(`🎯 난이도 변경: ${difficulty}`);
}

/**
 * 조작 방식 업데이트
 */
function updateControls(controls) {
    if (window.game) {
        window.game.controls = controls;
    }
    
    console.log(`🎮 조작 방식 변경: ${controls}`);
}

/**
 * 전역 키보드 이벤트 처리
 */
function handleGlobalKeyDown(e) {
    switch (e.key) {
        case 'F1':
            e.preventDefault();
            showScreen('mainMenu');
            break;
        case 'F2':
            e.preventDefault();
            if (window.game && window.game.gameState === 'playing') {
                window.game.togglePause();
            }
            break;
        case 'F3':
            e.preventDefault();
            showScreen('highScoreScreen');
            break;
        case 'F4':
            e.preventDefault();
            showScreen('settingsScreen');
            break;
    }
}

/**
 * 게임 상태 확인
 */
function getGameState() {
    if (window.game) {
        return window.game.gameState;
    }
    return 'unknown';
}

/**
 * 게임 통계 가져오기
 */
function getGameStats() {
    const stats = {};
    
    if (window.scoreManager) {
        Object.assign(stats, window.scoreManager.getScoreStats());
    }
    
    if (window.levelManager) {
        Object.assign(stats, window.levelManager.getLevelStats());
    }
    
    if (window.game) {
        stats.gameTime = window.game.gameTime;
        stats.blocksDestroyed = window.game.blocksDestroyed;
        stats.powerUpsCollected = window.game.powerUpsCollected;
    }
    
    return stats;
}

/**
 * 게임 저장
 */
function saveGame() {
    try {
        const gameData = {
            timestamp: Date.now(),
            scoreManager: window.scoreManager ? window.scoreManager.getScoreStats() : null,
            levelManager: window.levelManager ? window.levelManager.getLevelStats() : null,
            game: window.game ? {
                gameState: window.game.gameState,
                gameTime: window.game.gameTime,
                blocksDestroyed: window.game.blocksDestroyed,
                powerUpsCollected: window.game.powerUpsCollected
            } : null
        };
        
        localStorage.setItem('blockBreakerGameSave', JSON.stringify(gameData));
        console.log('💾 게임 저장 완료');
        return true;
    } catch (error) {
        console.error('게임 저장 실패:', error);
        return false;
    }
}

/**
 * 게임 불러오기
 */
function loadGame() {
    try {
        const savedGame = localStorage.getItem('blockBreakerGameSave');
        if (savedGame) {
            const gameData = JSON.parse(savedGame);
            
            // 저장된 게임 데이터가 너무 오래된 경우 무시
            const saveAge = Date.now() - gameData.timestamp;
            const maxSaveAge = 24 * 60 * 60 * 1000; // 24시간
            
            if (saveAge > maxSaveAge) {
                console.log('저장된 게임이 너무 오래되었습니다.');
                return false;
            }
            
            // 게임 상태 복원
            if (gameData.game && window.game) {
                window.game.gameState = gameData.game.gameState;
                window.game.gameTime = gameData.game.gameTime;
                window.game.blocksDestroyed = gameData.game.blocksDestroyed;
                window.game.powerUpsCollected = gameData.game.powerUpsCollected;
            }
            
            console.log('📂 게임 불러오기 완료');
            return true;
        }
    } catch (error) {
        console.error('게임 불러오기 실패:', error);
    }
    
    return false;
}

/**
 * 게임 리셋
 */
function resetGame() {
    if (window.game) {
        window.game.reset();
    }
    
    if (window.scoreManager) {
        window.scoreManager.resetGame();
    }
    
    if (window.levelManager) {
        window.levelManager.reset();
    }
    
    showScreen('mainMenu');
    console.log('🔄 게임 리셋 완료');
}

/**
 * 디버그 정보 표시
 */
function showDebugInfo() {
    const debugInfo = {
        gameState: getGameState(),
        gameStats: getGameStats(),
        userAgent: navigator.userAgent,
        screenSize: `${screen.width}x${screen.height}`,
        windowSize: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: new Date().toISOString()
    };
    
    console.log('🐛 디버그 정보:', debugInfo);
    
    // 디버그 정보를 화면에 표시 (개발 모드에서만)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const debugDiv = document.createElement('div');
        debugDiv.id = 'debugInfo';
        debugDiv.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            max-width: 300px;
        `;
        
        debugDiv.innerHTML = `
            <strong>디버그 정보</strong><br>
            게임 상태: ${debugInfo.gameState}<br>
            점수: ${debugInfo.gameStats.currentScore || 0}<br>
            레벨: ${debugInfo.gameStats.level || 1}<br>
            생명: ${debugInfo.gameStats.lives || 3}<br>
            <button onclick="this.parentElement.remove()">닫기</button>
        `;
        
        document.body.appendChild(debugDiv);
    }
}

/**
 * 성능 모니터링
 */
function startPerformanceMonitoring() {
    let frameCount = 0;
    let lastTime = performance.now();
    
    function measureFPS() {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - lastTime >= 1000) {
            const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
            console.log(`🎯 FPS: ${fps}`);
            
            frameCount = 0;
            lastTime = currentTime;
        }
        
        requestAnimationFrame(measureFPS);
    }
    
    requestAnimationFrame(measureFPS);
}

/**
 * 에러 핸들링
 */
function setupErrorHandling() {
    window.addEventListener('error', function(e) {
        console.error('게임 오류 발생:', e.error);
        
        // 사용자에게 오류 알림
        const errorMessage = document.createElement('div');
        errorMessage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(231, 76, 60, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 10000;
            text-align: center;
        `;
        errorMessage.innerHTML = `
            <h3>오류가 발생했습니다</h3>
            <p>게임을 새로고침해주세요.</p>
            <button onclick="location.reload()">새로고침</button>
        `;
        
        document.body.appendChild(errorMessage);
    });
    
    // Promise 오류 처리
    window.addEventListener('unhandledrejection', function(e) {
        console.error('처리되지 않은 Promise 오류:', e.reason);
    });
}

/**
 * 게임 준비 완료 체크
 */
function checkGameReady() {
    const requiredComponents = [
        'scoreManager',
        'soundManager', 
        'levelManager',
        'ball',
        'paddle',
        'game'
    ];
    
    const missingComponents = requiredComponents.filter(component => !window[component]);
    
    if (missingComponents.length > 0) {
        console.error('누락된 게임 컴포넌트:', missingComponents);
        return false;
    }
    
    return true;
}

/**
 * 게임 시작 준비
 */
function prepareGameStart() {
    if (!checkGameReady()) {
        console.error('게임 시작 준비가 완료되지 않았습니다.');
        return false;
    }
    
    // 게임 객체들 초기화
    initializeGameObjects();
    
    // 설정 적용
    loadAndApplySettings();
    
    // 사운드 시스템 준비
    if (window.soundManager) {
        window.soundManager.setVolume(50);
    }
    
    console.log('🚀 게임 시작 준비 완료');
    return true;
}

// 개발 모드에서만 디버그 기능 활성화
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // 디버그 정보 표시 (F12 키)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12') {
            e.preventDefault();
            showDebugInfo();
        }
    });
    
    // 성능 모니터링 시작
    startPerformanceMonitoring();
    
    console.log('🔧 개발 모드 활성화');
}

// 에러 핸들링 설정
setupErrorHandling();

// 게임 준비 완료 후 초기화
if (checkGameReady()) {
    console.log('🎮 모든 게임 컴포넌트가 로드되었습니다.');
} else {
    console.warn('⚠️ 일부 게임 컴포넌트가 로드되지 않았습니다.');
}

// 윈도우 로드 완료 후 최종 초기화
window.addEventListener('load', function() {
    console.log('🌐 페이지 로드 완료');
    
    // 게임 시작 준비
    if (prepareGameStart()) {
        console.log('✅ 게임이 성공적으로 초기화되었습니다!');
        console.log('🎯 게임을 시작하려면 "게임 시작" 버튼을 클릭하세요.');
    } else {
        console.error('❌ 게임 초기화에 실패했습니다.');
    }
});

// 게임 종료 시 정리 작업
window.addEventListener('beforeunload', function() {
    // 게임 상태 저장
    saveGame();
    
    // 사운드 정리
    if (window.soundManager) {
        window.soundManager.stopAll();
    }
    
    console.log('👋 게임 종료 - 정리 작업 완료');
});
