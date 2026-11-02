/**
 * Procedural Web Audio API sound generator for Evangelion effects.
 * 100% synthesized in real-time with zero external audio assets.
 */

interface HangarAmbienceSession {
  masterGain: GainNode;
  nodesToStop: Array<AudioNode & { stop?: (when?: number) => void }>;
  pistonTimer: number | null;
}

class EvaAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentEnv: string = 'hangar';
  private hangarAmbience: HangarAmbienceSession | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.initContext();
        if (this.currentEnv === 'hangar' && !this.hangarAmbience && !this.isMuted) {
          this.startHangarAmbience();
        }
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
      };
      window.addEventListener('pointerdown', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setEnvironment(env: string) {
    this.currentEnv = env;
    if (env === 'hangar') {
      this.startHangarAmbience();
    } else {
      this.stopHangarAmbience();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.hangarAmbience && this.ctx) {
      const t = this.ctx.currentTime;
      if (muted) {
        this.hangarAmbience.masterGain.gain.cancelScheduledValues(t);
        this.hangarAmbience.masterGain.gain.setValueAtTime(this.hangarAmbience.masterGain.gain.value, t);
        this.hangarAmbience.masterGain.gain.linearRampToValueAtTime(0.0001, t + 0.2);
      } else {
        this.hangarAmbience.masterGain.gain.cancelScheduledValues(t);
        this.hangarAmbience.masterGain.gain.setValueAtTime(0.001, t);
        this.hangarAmbience.masterGain.gain.linearRampToValueAtTime(0.24, t + 0.8);
      }
    } else if (!muted && this.currentEnv === 'hangar') {
      this.startHangarAmbience();
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  /**
   * AT Field Deployment sound: crystalline resonant hum + harmonic burst
   */
  public playAtField() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const osc3 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(110, t);
    osc1.frequency.exponentialRampToValueAtTime(880, t + 0.35);
    osc1.frequency.exponentialRampToValueAtTime(440, t + 1.2);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(220, t);
    osc2.frequency.exponentialRampToValueAtTime(1320, t + 0.35);
    osc2.frequency.exponentialRampToValueAtTime(660, t + 1.2);

    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(440, t);
    osc3.frequency.exponentialRampToValueAtTime(1760, t + 0.25);

    // Resonant bandpass filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, t);
    filter.frequency.exponentialRampToValueAtTime(3200, t + 0.35);
    filter.Q.setValueAtTime(6, t);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);

    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc3.start(t);
    osc1.stop(t + 1.45);
    osc2.stop(t + 1.45);
    osc3.stop(t + 1.45);
  }

  /**
   * Mechanical Servo / Armor movement
   */
  public playServo() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(280, t + 0.12);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.3);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.exponentialRampToValueAtTime(1800, t + 0.1);
    filter.frequency.exponentialRampToValueAtTime(400, t + 0.3);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  /**
   * Berserk Roar / Beast Awaken synthesis
   */
  public playBerserk() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(160, t);
    osc1.frequency.exponentialRampToValueAtTime(75, t + 0.6);
    osc1.frequency.exponentialRampToValueAtTime(45, t + 1.8);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(240, t);
    osc2.frequency.exponentialRampToValueAtTime(110, t + 0.5);
    osc2.frequency.exponentialRampToValueAtTime(65, t + 1.8);

    subOsc.type = 'square';
    subOsc.frequency.setValueAtTime(55, t);
    subOsc.frequency.exponentialRampToValueAtTime(32, t + 1.8);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.exponentialRampToValueAtTime(300, t + 1.8);
    filter.Q.setValueAtTime(4, t);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.0);

    osc1.connect(filter);
    osc2.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    subOsc.start(t);
    osc1.stop(t + 2.1);
    osc2.stop(t + 2.1);
    subOsc.stop(t + 2.1);
  }

  /**
   * NERV Klaxon / Alarm Warning
   */
  public playAlarm() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.linearRampToValueAtTime(480, t + 0.35);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.42);
  }

  /**
   * Sync pulse / Telemetry click
   */
  public playSyncPulse() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(960, t);

    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  /**
   * Umbilical cable disconnect / lock sound
   */
  public playCableEject() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.22);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  /**
   * High-impact damage strike with metallic crunch and bass resonance
   */
  public playDamageImpact() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Sub-bass heavy impact
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(140, t);
    subOsc.frequency.exponentialRampToValueAtTime(30, t + 0.5);

    subGain.gain.setValueAtTime(0.4, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 0.65);

    // Metal crash noise buffer
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.35);
    filter.Q.setValueAtTime(3, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + 0.42);
  }

  /**
   * Electric glitch / static interference pulse
   */
  public playGlitchStatic() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450 + Math.random() * 400, t);
    osc.frequency.linearRampToValueAtTime(120, t + 0.08);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  /**
   * Continuous Hangar Ambience:
   * 1. Low-frequency pulsating subterranean / reactor hum (55Hz + 55.7Hz + 110Hz with slow LFO modulation)
   * 2. Massive cavern air vents & ventilation air current
   * 3. Autonomous periodic hydraulic piston strokes & pneumatic release
   */
  public startHangarAmbience() {
    if (this.hangarAmbience) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, t);
    if (!this.isMuted) {
      masterGain.gain.linearRampToValueAtTime(0.22, t + 1.2);
    } else {
      masterGain.gain.setValueAtTime(0.0001, t);
    }
    masterGain.connect(this.ctx.destination);

    const nodesToStop: Array<AudioNode & { stop?: (when?: number) => void }> = [];

    // --- 1. SUBTLE PULSATING SUBTERRANEAN / REACTOR HUM ---
    const hum1 = this.ctx.createOscillator();
    hum1.type = 'sine';
    hum1.frequency.setValueAtTime(55, t);

    // Detuned sine to produce natural acoustic slow pulsing beat (~0.7 Hz)
    const humDetuned = this.ctx.createOscillator();
    humDetuned.type = 'sine';
    humDetuned.frequency.setValueAtTime(55.7, t);

    // Warm sub-harmonic triangle
    const humHarmonic = this.ctx.createOscillator();
    humHarmonic.type = 'triangle';
    humHarmonic.frequency.setValueAtTime(110, t);

    // Lowpass filter to keep it deep, heavy and non-intrusive
    const humFilter = this.ctx.createBiquadFilter();
    humFilter.type = 'lowpass';
    humFilter.frequency.setValueAtTime(160, t);
    humFilter.Q.setValueAtTime(1.4, t);

    // Slow LFO for organic breathing pulse (1 pulse every ~4.5 seconds)
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.22, t);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.025, t);

    const humBaseGain = this.ctx.createGain();
    humBaseGain.gain.setValueAtTime(0.065, t);

    lfo.connect(lfoGain);
    lfoGain.connect(humBaseGain.gain);

    hum1.connect(humFilter);
    humDetuned.connect(humFilter);
    humHarmonic.connect(humFilter);
    humFilter.connect(humBaseGain);
    humBaseGain.connect(masterGain);

    hum1.start(t);
    humDetuned.start(t);
    humHarmonic.start(t);
    lfo.start(t);

    nodesToStop.push(hum1, humDetuned, humHarmonic, lfo);

    // --- 2. DISTANT AIR VENTS / COOLING DUCT AIRFLOW ---
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 2.8;
    }

    const ventSource = this.ctx.createBufferSource();
    ventSource.buffer = buffer;
    ventSource.loop = true;

    // Bandpass filter centered at 320Hz sweeping gently
    const ventFilter = this.ctx.createBiquadFilter();
    ventFilter.type = 'bandpass';
    ventFilter.frequency.setValueAtTime(320, t);
    ventFilter.Q.setValueAtTime(0.8, t);

    const ventLfo = this.ctx.createOscillator();
    ventLfo.type = 'sine';
    ventLfo.frequency.setValueAtTime(0.1, t);
    const ventLfoGain = this.ctx.createGain();
    ventLfoGain.gain.setValueAtTime(50, t);
    ventLfo.connect(ventLfoGain);
    ventLfoGain.connect(ventFilter.frequency);

    const ventGain = this.ctx.createGain();
    ventGain.gain.setValueAtTime(0.04, t);

    ventSource.connect(ventFilter);
    ventFilter.connect(ventGain);
    ventGain.connect(masterGain);

    ventSource.start(t);
    ventLfo.start(t);

    nodesToStop.push(ventSource, ventLfo);

    // --- 3. SCHEDULE PERIODIC HYDRAULIC PISTONS & PNEUMATIC RELIEFS ---
    const session: HangarAmbienceSession = {
      masterGain,
      nodesToStop,
      pistonTimer: null,
    };
    this.hangarAmbience = session;

    const scheduleNextPiston = () => {
      // 8 to 15 second intervals
      const delay = 8000 + Math.random() * 7000;
      session.pistonTimer = window.setTimeout(() => {
        if (this.hangarAmbience !== session) return;
        this.triggerHydraulicPiston();
        scheduleNextPiston();
      }, delay);
    };

    scheduleNextPiston();
  }

  /**
   * Stop Hangar ambience with smooth exponential fade-out
   */
  public stopHangarAmbience() {
    if (!this.hangarAmbience) return;
    const amb = this.hangarAmbience;
    this.hangarAmbience = null;

    if (amb.pistonTimer !== null) {
      clearTimeout(amb.pistonTimer);
    }

    if (this.ctx && this.ctx.state !== 'closed') {
      const t = this.ctx.currentTime;
      amb.masterGain.gain.cancelScheduledValues(t);
      amb.masterGain.gain.setValueAtTime(amb.masterGain.gain.value, t);
      amb.masterGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);

      setTimeout(() => {
        amb.nodesToStop.forEach((n) => {
          try {
            if ('stop' in n && typeof n.stop === 'function') {
              n.stop();
            }
            n.disconnect();
          } catch {
            // Already stopped or disconnected
          }
        });
        amb.masterGain.disconnect();
      }, 750);
    }
  }

  /**
   * Atmospheric hydraulic piston stroke and pneumatic pressure release
   * Simulates heavy gantry clamps, coolant valves, and hydraulic arms shifting
   */
  public triggerHydraulicPiston() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Pneumatic Air Release ("pshhhh-k")
    const ventLen = 0.35 + Math.random() * 0.25;
    const bufferSize = Math.floor(this.ctx.sampleRate * ventLen);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.8);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const hpFilter = this.ctx.createBiquadFilter();
    hpFilter.type = 'highpass';
    hpFilter.frequency.setValueAtTime(850 + Math.random() * 350, t);
    hpFilter.frequency.exponentialRampToValueAtTime(250, t + ventLen);

    const noiseGain = this.ctx.createGain();
    const noiseVol = 0.045 + Math.random() * 0.025;
    noiseGain.gain.setValueAtTime(0.001, t);
    noiseGain.gain.linearRampToValueAtTime(noiseVol, t + 0.03);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + ventLen);

    noise.connect(hpFilter);
    hpFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + ventLen + 0.05);

    // 2. Heavy hydraulic cylinder stroke / mechanical thud
    const cylOsc = this.ctx.createOscillator();
    cylOsc.type = 'triangle';
    const startFreq = 110 + Math.random() * 25;
    cylOsc.frequency.setValueAtTime(startFreq, t);
    cylOsc.frequency.exponentialRampToValueAtTime(32, t + 0.4);

    const cylFilter = this.ctx.createBiquadFilter();
    cylFilter.type = 'lowpass';
    cylFilter.frequency.setValueAtTime(220, t);

    const cylGain = this.ctx.createGain();
    cylGain.gain.setValueAtTime(0.001, t);
    cylGain.gain.linearRampToValueAtTime(0.07, t + 0.04);
    cylGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

    cylOsc.connect(cylFilter);
    cylFilter.connect(cylGain);
    cylGain.connect(this.ctx.destination);
    cylOsc.start(t);
    cylOsc.stop(t + 0.5);

    // 3. Subtle distant metallic acoustic ring
    if (Math.random() > 0.35) {
      const pingOsc = this.ctx.createOscillator();
      pingOsc.type = 'sine';
      pingOsc.frequency.setValueAtTime(540 + Math.random() * 220, t + 0.06);

      const pingGain = this.ctx.createGain();
      pingGain.gain.setValueAtTime(0.012, t + 0.06);
      pingGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);

      pingOsc.connect(pingGain);
      pingGain.connect(this.ctx.destination);
      pingOsc.start(t + 0.06);
      pingOsc.stop(t + 0.65);
    }
  }
}

export const evaAudio = new EvaAudioEngine();
