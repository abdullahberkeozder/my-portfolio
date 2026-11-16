/**
 * RetroAudioEngine
 * Procedural Web Audio API sound synthesizer for authentic 2010-2016 Apple UI tactile feedback.
 * Operates with ZERO external audio files (.mp3/.wav) and zero bandwidth overhead.
 */

class RetroAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {
        // Ignore browser auto-play policy blocks until user gesture
      });
    }

    return this.ctx;
  }

  /**
   * Toggle mute state for all retro audio feedback
   */
  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * 1. Classic Mechanical Plastic Key Click
   * Simulates the iconic iPhone keyboard / button tap.
   */
  playKeyClick(tone: 'crisp' | 'soft' = 'crisp') {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Component A: Short white noise pop
      const bufferSize = Math.floor(ctx.sampleRate * 0.018);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(tone === 'crisp' ? 3600 : 2200, now);
      filter.Q.setValueAtTime(3.0, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      // Component B: Pitched resonant decay
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(tone === 'crisp' ? 340 : 200, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.022);

      oscGain.gain.setValueAtTime(0.25, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.02);
      osc.start(now);
      osc.stop(now + 0.025);
    } catch {
      // Graceful fallback if Web Audio is unsupported or restricted
    }
  }

  /**
   * 2. Mechanical Relay / Rocker Switch Sound (UISwitch Toggle)
   * Simulates the physical slider latching into place.
   */
  playSwitchToggle(state?: boolean) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const startFreq = state ? 220 : 160;
      const endFreq = state ? 90 : 60;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.035);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // ignore
    }
  }

  /**
   * 3. Segmented Control & Tab Switch Sound
   * Metallic subtle click when switching between tabs.
   */
  playTabSelect() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.025);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch {
      // ignore
    }
  }

  /**
   * 4. Mac OS X Window Sheet Open Chime
   * Soft resonant harmonic pop simulating an Aqua sheet sliding down.
   */
  playWindowOpen() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.11);
    } catch {
      // ignore
    }
  }

  /**
   * 5. iOS Mail / Post Published "Whoosh"
   * Filtered airy noise ramp simulating a sent message.
   */
  playSendWhoosh() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const bufferSize = Math.floor(ctx.sampleRate * 0.18);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.15);
      filter.Q.setValueAtTime(2.0, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.19);
    } catch {
      // ignore
    }
  }
}

export const retroAudio = new RetroAudioEngine();

export const playKeyClick = (tone: 'crisp' | 'soft' = 'crisp') => retroAudio.playKeyClick(tone);
export const playTabSelect = () => retroAudio.playTabSelect();
export const playSwitchToggle = (state?: boolean) => retroAudio.playSwitchToggle(state);
export const playSendWhoosh = () => retroAudio.playSendWhoosh();
export const playWindowOpen = () => retroAudio.playWindowOpen();
