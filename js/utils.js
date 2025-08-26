/**
 * 게임 유틸리티 함수들
 */

// 랜덤 숫자 생성 (min ~ max)
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// 랜덤 정수 생성 (min ~ max)
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 두 점 사이의 거리 계산
function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

// 각도 계산 (라디안)
function angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

// 각도를 도(degree)로 변환
function toDegrees(radians) {
    return radians * (180 / Math.PI);
}

// 도(degree)를 라디안으로 변환
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// 값이 범위 내에 있는지 확인
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// 선형 보간 (Linear Interpolation)
function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

// 부드러운 보간 (Smooth Step)
function smoothStep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return t * t * (3.0 - 2.0 * t);
}

// 색상 생성 (hex)
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// RGB를 hex로 변환
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// 색상 밝기 조절
function adjustBrightness(hex, percent) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    
    const factor = 1 + percent / 100;
    const r = clamp(Math.round(rgb.r * factor), 0, 255);
    const g = clamp(Math.round(rgb.g * factor), 0, 255);
    const b = clamp(Math.round(rgb.b * factor), 0, 255);
    
    return rgbToHex(r, g, b);
}

// 파티클 생성
function createParticle(x, y, color, velocityX, velocityY, life = 60) {
    return {
        x: x,
        y: y,
        vx: velocityX,
        vy: velocityY,
        color: color,
        life: life,
        maxLife: life,
        size: random(2, 6),
        alpha: 1
    };
}

// 파티클 업데이트
function updateParticle(particle, deltaTime) {
    particle.x += particle.vx * deltaTime;
    particle.y += particle.vy * deltaTime;
    particle.life -= deltaTime;
    particle.alpha = particle.life / particle.maxLife;
    
    // 중력 효과
    particle.vy += 0.1 * deltaTime;
    
    return particle.life > 0;
}

// 파티클 그리기
function drawParticle(ctx, particle) {
    ctx.save();
    ctx.globalAlpha = particle.alpha;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// 텍스트 중앙 정렬 그리기
function drawCenteredText(ctx, text, x, y, font = '20px Arial', color = 'black') {
    ctx.save();
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    ctx.restore();
}

// 텍스트 그림자와 함께 그리기
function drawTextWithShadow(ctx, text, x, y, font = '20px Arial', color = 'black', shadowColor = 'rgba(0,0,0,0.5)', shadowOffset = 2) {
    ctx.save();
    ctx.font = font;
    ctx.fillStyle = shadowColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + shadowOffset, y + shadowOffset);
    
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
}

// 둥근 사각형 그리기
function drawRoundedRect(ctx, x, y, width, height, radius = 5) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// 그라데이션 원 그리기
function drawGradientCircle(ctx, x, y, radius, startColor, endColor) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

// 화면 흔들림 효과
function createScreenShake(intensity = 5, duration = 10) {
    return {
        intensity: intensity,
        duration: duration,
        currentDuration: duration,
        offsetX: 0,
        offsetY: 0
    };
}

// 화면 흔들림 업데이트
function updateScreenShake(screenShake) {
    if (screenShake.currentDuration > 0) {
        screenShake.currentDuration--;
        const factor = screenShake.currentDuration / screenShake.duration;
        screenShake.offsetX = random(-screenShake.intensity, screenShake.intensity) * factor;
        screenShake.offsetY = random(-screenShake.intensity, screenShake.intensity) * factor;
        return true;
    }
    return false;
}

// 로컬 스토리지 유틸리티
const Storage = {
    // 데이터 저장
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },
    
    // 데이터 불러오기
    get: function(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Storage get error:', e);
            return defaultValue;
        }
    },
    
    // 데이터 삭제
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    },
    
    // 모든 데이터 삭제
    clear: function() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Storage clear error:', e);
            return false;
        }
    }
};

// 디바운스 함수 (연속 호출 방지)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 스로틀 함수 (호출 빈도 제한)
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 성능 측정
const Performance = {
    fps: 0,
    frameCount: 0,
    lastTime: 0,
    
    update: function(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
        
        return this.fps;
    },
    
    getFPS: function() {
        return this.fps;
    }
};

// 게임 상태 관리
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver',
    LEVEL_CLEAR: 'levelClear',
    SETTINGS: 'settings',
    HIGH_SCORES: 'highScores'
};

// 난이도 설정
const Difficulty = {
    EASY: {
        name: 'easy',
        ballSpeed: 3,
        paddleSpeed: 5,
        blockCount: 30,
        lives: 5
    },
    NORMAL: {
        name: 'normal',
        ballSpeed: 4,
        paddleSpeed: 6,
        blockCount: 40,
        lives: 3
    },
    HARD: {
        name: 'hard',
        ballSpeed: 5,
        paddleSpeed: 7,
        blockCount: 50,
        lives: 2
    }
};

// 내보내기
window.Utils = {
    random,
    randomInt,
    distance,
    angle,
    toDegrees,
    toRadians,
    clamp,
    lerp,
    smoothStep,
    hexToRgb,
    rgbToHex,
    adjustBrightness,
    createParticle,
    updateParticle,
    drawParticle,
    drawCenteredText,
    drawTextWithShadow,
    drawRoundedRect,
    drawGradientCircle,
    createScreenShake,
    updateScreenShake,
    Storage,
    debounce,
    throttle,
    Performance,
    GameState,
    Difficulty
};
