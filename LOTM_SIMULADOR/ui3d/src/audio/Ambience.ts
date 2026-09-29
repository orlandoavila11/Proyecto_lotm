/**
 * Ambiente sonoro procedimental: todo se sintetiza con WebAudio a partir de ruido filtrado, sin archivos.
 *  - lluvia: cortina de ruido en banda; en interiores, amortiguada tras el cristal
 *  - goteo: chasquidos cortos y agudos sobre charcos o alféizares
 *  - brasas / vela: crepitar esporádico
 *  - sala: rumor grave de la casa o de la calle
 * El navegador sólo permite sonar tras un gesto del jugador; se arranca en el primer clic.
 */
export interface AmbienceProfile {
  rain: number;
  interior: boolean;
  fire: number;
  room: number;
}

export const SILENCE: AmbienceProfile = { rain: 0, interior: true, fire: 0, room: 0 };

class AmbienceEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private rainGain!: GainNode;
  private rainFilter!: BiquadFilterNode;
  private dripGain!: GainNode;
  private roomGain!: GainNode;
  private fireGain!: GainNode;
  private noise!: AudioBuffer;
  private profile: AmbienceProfile = SILENCE;
  private enabled = true;
  private crackleTimer: number | null = null;
  private dripTimer: number | null = null;

  /** se llama desde un gesto del usuario */
  start() {
    if (this.ctx || !this.enabled) return;
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);
    this.master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 3);

    const len = ctx.sampleRate * 3;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    const loop = () => {
      const src = ctx.createBufferSource();
      src.buffer = this.noise;
      src.loop = true;
      src.start(0, Math.random() * 2);
      return src;
    };

    // lluvia
    this.rainFilter = ctx.createBiquadFilter();
    this.rainFilter.type = 'bandpass';
    this.rainFilter.Q.value = 0.5;
    const rainShelf = ctx.createBiquadFilter();
    rainShelf.type = 'highshelf';
    rainShelf.frequency.value = 3000;
    rainShelf.gain.value = -6;
    this.rainGain = ctx.createGain();
    this.rainGain.gain.value = 0;
    loop().connect(this.rainFilter).connect(rainShelf).connect(this.rainGain).connect(this.master);

    // sala: ruido marrón aproximado con paso bajo
    const roomLp = ctx.createBiquadFilter();
    roomLp.type = 'lowpass';
    roomLp.frequency.value = 160;
    this.roomGain = ctx.createGain();
    this.roomGain.gain.value = 0;
    loop().connect(roomLp).connect(this.roomGain).connect(this.master);

    // goteo y crepitar comparten salida propia
    this.dripGain = ctx.createGain();
    this.dripGain.connect(this.master);
    this.fireGain = ctx.createGain();
    this.fireGain.connect(this.master);

    this.apply(0.1);
    this.scheduleCrackle();
    this.scheduleDrip();
  }

  setEnabled(v: boolean) {
    this.enabled = v;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.linearRampToValueAtTime(v ? 0.9 : 0, t + 0.8);
  }

  setProfile(p: AmbienceProfile) {
    this.profile = p;
    this.apply(2.2);
  }

  private apply(fade: number) {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    const p = this.profile;
    const ramp = (g: AudioParam, v: number) => {
      g.cancelScheduledValues(t);
      g.setValueAtTime(g.value, t);
      g.linearRampToValueAtTime(v, t + fade);
    };
    ramp(this.rainGain.gain, p.rain * (p.interior ? 0.09 : 0.2));
    ramp(this.rainFilter.frequency, p.interior ? 700 : 1600);
    ramp(this.roomGain.gain, p.room * 0.35);
    ramp(this.dripGain.gain, p.rain * (p.interior ? 0.25 : 0.5));
    ramp(this.fireGain.gain, p.fire * 0.5);
  }

  private burst(out: GainNode, freq: number, dur: number, level: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = freq;
    bp.Q.value = 3;
    const env = ctx.createGain();
    const t = ctx.currentTime;
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(level, t + 0.002);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp).connect(env).connect(out);
    src.start(t, Math.random() * 2, dur + 0.05);
  }

  private scheduleCrackle() {
    const next = 120 + Math.random() * 900;
    this.crackleTimer = window.setTimeout(() => {
      if (this.ctx && this.profile.fire > 0) {
        const n = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < n; i++) window.setTimeout(() => this.burst(this.fireGain, 1800 + Math.random() * 2500, 0.03 + Math.random() * 0.05, 0.5 + Math.random() * 0.5), i * 40);
      }
      this.scheduleCrackle();
    }, next);
  }

  private scheduleDrip() {
    const next = 60 + Math.random() * 380;
    this.dripTimer = window.setTimeout(() => {
      if (this.ctx && this.profile.rain > 0) this.burst(this.dripGain, 3500 + Math.random() * 3000, 0.015 + Math.random() * 0.02, 0.2 + Math.random() * 0.4);
      this.scheduleDrip();
    }, next);
  }

  /** trueno lejano: ruido grave con ataque lento y cola larga, tras el retardo de la distancia */
  thunder(delay: number) {
    const ctx = this.ctx;
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(260, t0);
    lp.frequency.exponentialRampToValueAtTime(70, t0 + 3);
    const env = ctx.createGain();
    const peak = (this.profile.interior ? 0.35 : 0.8) * (0.6 + Math.random() * 0.4);
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(peak, t0 + 0.25);
    env.gain.exponentialRampToValueAtTime(peak * 0.4, t0 + 1.2);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + 4.5);
    src.connect(lp).connect(env).connect(this.master);
    src.start(t0, 0);
    src.stop(t0 + 4.6);
  }

  dispose() {
    if (this.crackleTimer) clearTimeout(this.crackleTimer);
    if (this.dripTimer) clearTimeout(this.dripTimer);
    this.ctx?.close();
    this.ctx = null;
  }
}

export const ambience = new AmbienceEngine();

/** perfiles por lugar (la lámina decide el sonido) */
export const PLACE_AMBIENCE: Record<string, AmbienceProfile> = {
  desvan: { rain: 0.7, interior: true, fire: 0.25, room: 0.5 },
  title: { rain: 0.6, interior: true, fire: 0.2, room: 0.4 },
  origin: { rain: 0.8, interior: true, fire: 0.25, room: 0.5 },
  journal: { rain: 0.8, interior: true, fire: 0.25, room: 0.5 },
  prologue: { rain: 0.9, interior: true, fire: 0.2, room: 0.6 },
  ascension: { rain: 0.9, interior: true, fire: 0.2, room: 0.6 },
  board: { rain: 0.6, interior: true, fire: 0.25, room: 0.5 },
  bazaar: { rain: 0.6, interior: true, fire: 0.1, room: 0.6 },
  location: { rain: 0.8, interior: true, fire: 0.9, room: 0.5 },
  cherwood: { rain: 1, interior: false, fire: 0, room: 0.7 },
  combat: { rain: 1, interior: false, fire: 0, room: 0.8 }
};
