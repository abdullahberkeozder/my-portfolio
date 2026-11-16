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
  playKeyClick(_tone: 'crisp' | 'soft' = 'crisp') {
    // Meaningless click sounds removed per user specification
  }

  playSwitchToggle(_state?: boolean) {
    // Meaningless switch sounds removed per user specification
  }

  playTabSelect() {
    // Meaningless tab select sounds removed per user specification
  }

  playWindowOpen() {
    // Meaningless window open chime removed per user specification
  }

  playSendWhoosh() {
    // Meaningless whoosh sounds removed per user specification
  }
}

export const retroAudio = new RetroAudioEngine();

export const playKeyClick = (tone: 'crisp' | 'soft' = 'crisp') => retroAudio.playKeyClick(tone);
export const playTabSelect = () => retroAudio.playTabSelect();
export const playSwitchToggle = (state?: boolean) => retroAudio.playSwitchToggle(state);
export const playSendWhoosh = () => retroAudio.playSendWhoosh();
export const playWindowOpen = () => retroAudio.playWindowOpen();
