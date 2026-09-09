/**
 * OccultAudioManager: Gestor de Paisaje Sonoro Diegético y Audio Victoriano
 * Combina síntesis procedural mediante Web Audio API con disparadores de efectos (Howler).
 */

export class OccultAudioManager {
  private static instance: OccultAudioManager | null = null;
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  // Nodos de sonido ambiental procedural
  private rainNode: AudioNode | null = null;
  private rainGain: GainNode | null = null;
  private gasLampNode: AudioNode | null = null;
  private gasLampGain: GainNode | null = null;

  private constructor() {}

  public static getInstance(): OccultAudioManager {
    if (!OccultAudioManager.instance) {
      OccultAudioManager.instance = new OccultAudioManager();
    }
    return OccultAudioManager.instance;
  }

  private initContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Inicia el paisaje sonoro de lluvia y bruma victoriana
   */
  public startAmbientRain(): void {
    const ctx = this.initContext();
    if (this.rainNode) return;

    // Generador de ruido rosa/marrón simulando lluvia constante sobre adoquines
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Filtro de integración para aproximar ruido browniano
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 1.5;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Filtro paso bajo para amortiguar el sonido (smog y lluvia pesada)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, ctx.currentTime);

    this.rainGain = ctx.createGain();
    this.rainGain.gain.setValueAtTime(0.18, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(this.rainGain);
    if (this.masterGain) {
      this.rainGain.connect(this.masterGain);
    }

    noiseSource.start();
    this.rainNode = noiseSource;

    this.startGasLampCrackle();
  }

  /**
   * Genera el sutil zumbido y chisporroteo de una lámpara de gas de carbón
   */
  private startGasLampCrackle(): void {
    if (!this.audioCtx || this.gasLampNode) return;
    const ctx = this.audioCtx;

    // Oscilador de zumbido de frecuencia muy baja (50Hz)
    const humOsc = ctx.createOscillator();
    humOsc.type = 'sine';
    humOsc.frequency.setValueAtTime(55, ctx.currentTime);

    this.gasLampGain = ctx.createGain();
    this.gasLampGain.gain.setValueAtTime(0.04, ctx.currentTime);

    humOsc.connect(this.gasLampGain);
    if (this.masterGain) {
      this.gasLampGain.connect(this.masterGain);
    }

    humOsc.start();
    this.gasLampNode = humOsc;
  }

  /**
   * Detiene el audio ambiental continuo
   */
  public stopAmbient(): void {
    if (this.rainNode) {
      try {
        (this.rainNode as AudioBufferSourceNode).stop();
      } catch (e) {}
      this.rainNode = null;
    }
    if (this.gasLampNode) {
      try {
        (this.gasLampNode as OscillatorNode).stop();
      } catch (e) {}
      this.gasLampNode = null;
    }
  }

  /**
   * Toca una campanada de iglesia distante (San Samuel / Santa Selena)
   */
  public playChurchBell(): void {
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now); // Nota La3
    osc.frequency.exponentialRampToValueAtTime(110, now + 3.0);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

    osc.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 3.3);
  }

  /**
   * Susurros de locura / pérdida de cordura (binaural mist)
   */
  public playSanityLossWhisper(): void {
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    // Frecuencias ligeramente desafinadas para crear batimiento psicoacústico
    osc1.frequency.setValueAtTime(130, now);
    osc1.frequency.linearRampToValueAtTime(80, now + 1.8);

    osc2.frequency.setValueAtTime(136, now);
    osc2.frequency.linearRampToValueAtTime(84, now + 1.8);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

    osc1.connect(gain);
    osc2.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 2.1);
    osc2.stop(now + 2.1);
  }

  /**
   * Efecto de disparo de revólver o bala purificadora
   */
  public playGunshot(): void {
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const bufferSize = Math.floor(ctx.sampleRate * 0.3);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.3);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    noise.connect(filter);
    filter.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);

    noise.start(now);
  }

  /**
   * Tono triunfal de apoteosis / ascenso de secuencia
   */
  public playAscensionHarmonic(): void {
    const ctx = this.initContext();
    const now = ctx.currentTime;
    const chords = [261.63, 329.63, 392.00, 523.25]; // Do Mayor Místico

    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);

      gain.gain.setValueAtTime(0.08, now + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

      osc.connect(gain);
      if (this.masterGain) gain.connect(this.masterGain);

      osc.start(now + idx * 0.15);
      osc.stop(now + 2.8);
    });
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.audioCtx.currentTime);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }
}

