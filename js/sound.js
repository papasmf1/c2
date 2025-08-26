/**
 * 사운드 시스템
 */

class SoundManager {
    constructor() {
        this.sounds = {};
        this.music = {};
        this.volume = 0.5;
        this.musicVolume = 0.3;
        this.isMuted = false;
        this.isMusicMuted = false;
        this.currentMusic = null;
        this.audioContext = null;
        
        this.initAudioContext();
        this.loadSounds();
        this.setupVolumeControl();
    }

    /**
     * Web Audio API 초기화
     */
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }

    /**
     * 사운드 로드
     */
    loadSounds() {
        // 효과음 사운드 객체 생성
        this.sounds = {
            paddle: this.createSound('paddle', 200, 0.3),
            block: this.createSound('block', 150, 0.4),
            powerup: this.createSound('powerup', 300, 0.5),
            gameOver: this.createSound('gameOver', 1000, 0.6),
            levelUp: this.createSound('levelUp', 500, 0.5),
            bonus: this.createSound('bonus', 400, 0.4),
            click: this.createSound('click', 100, 0.3),
            explosion: this.createSound('explosion', 800, 0.7)
        };

        // 배경음악 객체 생성
        this.music = {
            menu: this.createMusic('menu', 0.3),
            gameplay: this.createMusic('gameplay', 0.3),
            victory: this.createMusic('victory', 0.4)
        };
    }

    /**
     * 효과음 생성
     */
    createSound(type, duration, baseVolume = 0.5) {
        if (!this.audioContext) {
            return { play: () => {} };
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // 사운드 타입별 설정
        switch (type) {
            case 'paddle':
                oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
                break;
                
            case 'block':
                oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.15);
                break;
                
            case 'powerup':
                oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.3);
                break;
                
            case 'gameOver':
                oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 1.0);
                break;
                
            case 'levelUp':
                oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
                oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.4);
                break;
                
            case 'bonus':
                oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.2);
                oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.4);
                break;
                
            case 'click':
                oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(500, this.audioContext.currentTime + 0.1);
                break;
                
            case 'explosion':
                oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.8);
                break;
        }

        // 볼륨 설정
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(baseVolume * this.volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration / 1000);

        return {
            play: () => {
                if (this.isMuted) return;
                
                const now = this.audioContext.currentTime;
                oscillator.start(now);
                oscillator.stop(now + duration / 1000);
            }
        };
    }

    /**
     * 배경음악 생성
     */
    createMusic(type, baseVolume = 0.3) {
        if (!this.audioContext) {
            return { play: () => {}, stop: () => {} };
        }

        const oscillators = [];
        const gainNodes = [];
        
        // 멜로디 생성
        const createMelody = () => {
            const notes = this.getMelodyNotes(type);
            const noteDuration = 0.2;
            
            notes.forEach((note, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(note, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(baseVolume * this.musicVolume, this.audioContext.currentTime + 0.01);
                gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + noteDuration);
                
                oscillator.start(this.audioContext.currentTime + index * noteDuration);
                oscillator.stop(this.audioContext.currentTime + (index + 1) * noteDuration);
                
                oscillators.push(oscillator);
                gainNodes.push(gainNode);
            });
        };

        return {
            play: () => {
                if (this.isMusicMuted) return;
                
                // 이전 음악 정지
                this.stopCurrentMusic();
                
                this.currentMusic = type;
                createMelody();
                
                // 반복 재생
                this.musicInterval = setInterval(createMelody, notes.length * noteDuration * 1000);
            },
            
            stop: () => {
                if (this.musicInterval) {
                    clearInterval(this.musicInterval);
                    this.musicInterval = null;
                }
                
                oscillators.forEach(osc => {
                    try { osc.stop(); } catch (e) {}
                });
                
                gainNodes.forEach(gain => {
                    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
                });
            }
        };
    }

    /**
     * 멜로디 노트 생성
     */
    getMelodyNotes(type) {
        switch (type) {
            case 'menu':
                return [262, 330, 392, 523, 392, 330, 262]; // C major scale
            case 'gameplay':
                return [440, 494, 523, 587, 659, 587, 523, 494]; // A major scale
            case 'victory':
                return [523, 659, 784, 1047, 784, 659, 523]; // C major arpeggio
            default:
                return [440, 440, 440, 440]; // A note repeated
        }
    }

    /**
     * 효과음 재생
     */
    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].play();
        }
    }

    /**
     * 배경음악 재생
     */
    playMusic(musicName) {
        if (this.music[musicName]) {
            this.music[musicName].play();
        }
    }

    /**
     * 현재 음악 정지
     */
    stopCurrentMusic() {
        if (this.currentMusic && this.music[this.currentMusic]) {
            this.music[this.currentMusic].stop();
        }
    }

    /**
     * 모든 음악 정지
     */
    stopAllMusic() {
        Object.values(this.music).forEach(music => {
            music.stop();
        });
        this.currentMusic = null;
    }

    /**
     * 볼륨 설정
     */
    setVolume(volume) {
        this.volume = Utils.clamp(volume, 0, 1);
        this.updateVolumeDisplay();
    }

    /**
     * 음악 볼륨 설정
     */
    setMusicVolume(volume) {
        this.musicVolume = Utils.clamp(volume, 0, 1);
        this.updateVolumeDisplay();
    }

    /**
     * 음소거 토글
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.updateMuteDisplay();
    }

    /**
     * 음악 음소거 토글
     */
    toggleMusicMute() {
        this.isMusicMuted = !this.isMusicMuted;
        
        if (this.isMusicMuted) {
            this.stopCurrentMusic();
        } else if (this.currentMusic) {
            this.playMusic(this.currentMusic);
        }
        
        this.updateMuteDisplay();
    }

    /**
     * 볼륨 컨트롤 설정
     */
    setupVolumeControl() {
        const volumeSlider = document.getElementById('soundVolume');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                const volume = e.target.value / 100;
                this.setVolume(volume);
            });
        }

        // 볼륨 표시 업데이트
        this.updateVolumeDisplay();
    }

    /**
     * 볼륨 표시 업데이트
     */
    updateVolumeDisplay() {
        const volumeValue = document.getElementById('volumeValue');
        if (volumeValue) {
            volumeValue.textContent = Math.round(this.volume * 100) + '%';
        }
    }

    /**
     * 음소거 표시 업데이트
     */
    updateMuteDisplay() {
        // 음소거 상태에 따른 UI 업데이트
        const muteIcon = document.querySelector('.mute-icon');
        if (muteIcon) {
            muteIcon.textContent = this.isMuted ? '🔇' : '🔊';
        }
    }

    /**
     * 게임 이벤트별 사운드 재생
     */
    playGameEvent(event) {
        switch (event) {
            case 'paddleHit':
                this.playSound('paddle');
                break;
                
            case 'blockDestroy':
                this.playSound('block');
                break;
                
            case 'powerupCollect':
                this.playSound('powerup');
                break;
                
            case 'gameOver':
                this.playSound('gameOver');
                this.stopCurrentMusic();
                break;
                
            case 'levelUp':
                this.playSound('levelUp');
                break;
                
            case 'bonus':
                this.playSound('bonus');
                break;
                
            case 'explosion':
                this.playSound('explosion');
                break;
                
            case 'buttonClick':
                this.playSound('click');
                break;
        }
    }

    /**
     * 게임 상태별 배경음악 재생
     */
    playGameStateMusic(state) {
        switch (state) {
            case 'menu':
                this.playMusic('menu');
                break;
                
            case 'playing':
                this.playMusic('gameplay');
                break;
                
            case 'victory':
                this.playMusic('victory');
                break;
                
            case 'gameOver':
                this.stopCurrentMusic();
                break;
        }
    }

    /**
     * 3D 사운드 효과 (스테레오)
     */
    play3DSound(soundName, x, y, canvasWidth) {
        if (!this.audioContext || this.isMuted) return;
        
        const pan = (x / canvasWidth) * 2 - 1; // -1 (왼쪽) ~ 1 (오른쪽)
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const panner = this.audioContext.createStereoPanner();
        
        oscillator.connect(gainNode);
        gainNode.connect(panner);
        panner.connect(this.audioContext.destination);
        
        // 스테레오 팬 설정
        panner.pan.setValueAtTime(pan, this.audioContext.currentTime);
        
        // 사운드 재생
        const sound = this.sounds[soundName];
        if (sound) {
            sound.play();
        }
    }

    /**
     * 사운드 품질 설정
     */
    setSoundQuality(quality) {
        switch (quality) {
            case 'low':
                this.audioContext.sampleRate = 22050;
                break;
            case 'medium':
                this.audioContext.sampleRate = 44100;
                break;
            case 'high':
                this.audioContext.sampleRate = 48000;
                break;
        }
    }

    /**
     * 사운드 시스템 정리
     */
    cleanup() {
        this.stopAllMusic();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
    }

    /**
     * 사운드 통계
     */
    getSoundStats() {
        return {
            volume: this.volume,
            musicVolume: this.musicVolume,
            isMuted: this.isMuted,
            isMusicMuted: this.isMusicMuted,
            currentMusic: this.currentMusic,
            audioContextState: this.audioContext ? this.audioContext.state : 'not supported'
        };
    }
}

// 전역 사운드 매니저 인스턴스
window.soundManager = new SoundManager();

