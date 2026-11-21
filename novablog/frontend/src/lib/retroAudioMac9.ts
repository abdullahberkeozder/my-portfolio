/**
 * Mac OS 9 Platinum Sound Engine (Pure Web Audio API)
 * Jim Reekes 1999 Sound Palette procedural synthesis - Zero external audio files.
 */

class Mac9SoundEngine {
  private static instance: Mac9SoundEngine;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;

  // 0 to 7 classic Mac OS volume steps
  private volumeLevel: number = 5;
  private isMuted: boolean = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedMute = localStorage.getItem('macos9_sound_muted');
        const savedVol = localStorage.getItem('macos9_sound_volume');
        if (savedMute !== null) this.isMuted = savedMute === 'true';
        if (savedVol !== null) this.volumeLevel = parseInt(savedVol, 10);
      } catch (e) {
        // SSR / localStorage guard
      }

      // Seamless user gesture unlock for Web Audio Autoplay Policy
      const unlockAudio = () => {
        this.ensureContext();
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      };

      window.addEventListener('pointerdown', unlockAudio, { passive: true, once: true });
      window.addEventListener('keydown', unlockAudio, { passive: true, once: true });
    }
  }

  public static getInstance(): Mac9SoundEngine {
    if (!Mac9SoundEngine.instance) {
      Mac9SoundEngine.instance = new Mac9SoundEngine();
    }
    return Mac9SoundEngine.instance;
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();

        // Limiter compressor to prevent audio distortion upon rapid clicking
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-4, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(6, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(10, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.002, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.08, this.ctx.currentTime);

        this.masterGain = this.ctx.createGain();
        this.updateMasterVolume();

        this.compressor.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      } catch (e) {
        console.warn('Web Audio initialization error:', e);
      }
    }
    return this.ctx;
  }

  private updateMasterVolume() {
    if (!this.masterGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.isMuted || this.volumeLevel === 0) {
      this.masterGain.gain.setValueAtTime(0, now);
    } else {
      // Non-linear 8-step Mac logarithmic curve (0..7)
      const gainVal = Math.pow(this.volumeLevel / 7, 1.8) * 0.42;
      this.masterGain.gain.setValueAtTime(gainVal, now);
    }
  }

  public setVolume(level: number) {
    this.volumeLevel = Math.max(0, Math.min(7, Math.round(level)));
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('macos9_sound_volume', this.volumeLevel.toString());
      } catch (e) {}
    }
    this.updateMasterVolume();
  }

  public getVolume(): number {
    return this.volumeLevel;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('macos9_sound_muted', this.isMuted.toString());
      } catch (e) {}
    }
    this.updateMasterVolume();
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  private createNoiseBuffer(durationSec: number): AudioBuffer | null {
    const ctx = this.ensureContext();
    if (!ctx) return null;
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * durationSec));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // --- 1. Efsanevi Mac C-Major Startup Chime ---
  public playMacStartupChime() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.compressor) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const now = ctx.currentTime;
    // C2, C3, G3, C4, E4, G4, C5
    const freqs = [65.41, 130.81, 196.00, 261.63, 329.63, 392.00, 523.25];
    const duration = 3.6;

    freqs.forEach((freq, idx) => {
      [-2.5, 2.5].forEach((detune) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = idx < 2 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime(detune, now);

        filter.type = 'lowpass';
        filter.Q.setValueAtTime(1.8, now);
        filter.frequency.setValueAtTime(4200, now);
        filter.frequency.exponentialRampToValueAtTime(450, now + duration);

        const voiceVol = 0.055 / (idx * 0.4 + 1);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(voiceVol, now + 0.035);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.compressor!);

        osc.start(now);
        osc.stop(now + duration);
      });
    });
  }

  // --- 2. Mekanik Fare Tıklaması - MouseDown (Mikro-anahtar çıtırtısı) ---
  public playMacClickDown() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.compressor) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const now = ctx.currentTime;
    const noiseBuffer = this.createNoiseBuffer(0.012);
    if (noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3400, now);
      filter.Q.setValueAtTime(3.8, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.01);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.compressor);

      noise.start(now);
    }

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.frequency.setValueAtTime(170, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.008);
    oscGain.gain.setValueAtTime(0.1, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.008);

    osc.connect(oscGain);
    oscGain.connect(this.compressor);

    osc.start(now);
    osc.stop(now + 0.01);
  }

  // --- 2. Mekanik Fare Bırakma - MouseUp (Plastik yay gevşemesi) ---
  public playMacClickUp() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.compressor) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(3200, now);
    osc.frequency.exponentialRampToValueAtTime(1600, now + 0.006);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.006);

    osc.connect(gain);
    gain.connect(this.compressor);

    osc.start(now);
    osc.stop(now + 0.007);
  }

  // --- 3. Pencere Açılma (Zoom In) ---
  public playWindowOpen() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.compressor) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.compressor);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  // --- 3. Pencere Kapanma (Zoom Out) ---
  public playWindowClose() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.compressor) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1050, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.045);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(this.compressor);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // --- 4. WindowShade (Stor Perde Rulosu - 6 Kademeli Mikro-Mandal) ---
  public playWindowShade(collapsing: boolean = true) {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.compressor) return;

    const now = ctx.currentTime;
    const steps = 6;
    const interval = 0.015;

    for (let i = 0; i < steps; i++) {
      const clickTime = now + i * interval;
      const pitchRatio = collapsing ? 1 + i * 0.14 : 1.7 - i * 0.14;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800 * pitchRatio, clickTime);
      osc.frequency.exponentialRampToValueAtTime(650 * pitchRatio, clickTime + 0.005);

      gain.gain.setValueAtTime(0.08, clickTime);
      gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.005);

      osc.connect(gain);
      gain.connect(this.compressor);

      osc.start(clickTime);
      osc.stop(clickTime + 0.006);
    }
  }

  // --- 5. Çöp Sepeti Boşaltma Hışırtısı (Trash Paper Crinkle) ---
  public playTrashCrinkle() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.compressor) return;

    const now = ctx.currentTime;
    const crinkleCount = 18;
    const totalDuration = 0.35;

    for (let i = 0; i < crinkleCount; i++) {
      const burstTime = now + Math.random() * totalDuration;
      const burstDuration = 0.008 + Math.random() * 0.012;
      const noiseBuffer = this.createNoiseBuffer(burstDuration);
      if (!noiseBuffer) continue;

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600 + Math.random() * 4000, burstTime);
      filter.Q.setValueAtTime(3.5, burstTime);

      const gain = ctx.createGain();
      const burstGain = (0.04 + Math.random() * 0.06) * (1 - (burstTime - now) / totalDuration);
      gain.gain.setValueAtTime(burstGain, burstTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, burstTime + burstDuration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.compressor);

      noise.start(burstTime);
      noise.stop(burstTime + burstDuration);
    }
  }

  // --- 6. Sistem İkaz Sesi: Sosumi (Ahşap Marimba C6) ---
  public playSosumi() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.compressor) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1046.5, now);
    osc1.frequency.exponentialRampToValueAtTime(970, now + 0.02);

    gain1.gain.setValueAtTime(0.22, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2888, now);
    gain2.gain.setValueAtTime(0.1, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(this.compressor);
    gain2.connect(this.compressor);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.23);
    osc2.stop(now + 0.06);
  }

  // --- 7. Sistem İkaz Sesi: Wild Eep ---
  public playWildEep() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.compressor) return;

    const now = ctx.currentTime;
    const chirp = (startTime: number, startF: number, endF: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(startF, startTime);
      osc.frequency.exponentialRampToValueAtTime(endF, startTime + dur);
      gain.gain.setValueAtTime(0.16, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

      osc.connect(gain);
      gain.connect(this.compressor!);

      osc.start(startTime);
      osc.stop(startTime + dur);
    };

    chirp(now, 720, 1480, 0.04);
    chirp(now + 0.06, 880, 1820, 0.05);
  }

  // --- 8. Sistem İkaz Sesi: Droplet ---
  public playDroplet() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.compressor) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(1360, now + 0.016);
    osc.frequency.exponentialRampToValueAtTime(1280, now + 0.16);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.17);

    osc.connect(gain);
    gain.connect(this.compressor);

    osc.start(now);
    osc.stop(now + 0.18);
  }
}

export const macSound = Mac9SoundEngine.getInstance();
