export function createAmbientScore() {
  const BPM = 56;
  const BEAT_SEC = 60 / BPM;
  const BEATS_PER_MEASURE = 8;
  const PROGRESSION = [
    {
      name: "D minor 9",
      pad: [50, 57, 60, 64],
      bass: [38, 45],
      motif: [62, 64, 65, 69, 72],
    },
    {
      name: "B-flat major 7",
      pad: [46, 53, 57, 60],
      bass: [34, 41],
      motif: [60, 62, 65, 69, 72],
    },
    {
      name: "G minor 9",
      pad: [43, 50, 55, 58],
      bass: [31, 38],
      motif: [58, 60, 62, 65, 67],
    },
    {
      name: "A suspended 2",
      pad: [45, 52, 57, 59],
      bass: [33, 40],
      motif: [57, 59, 62, 64, 69],
    },
  ];

  const SCENE_SETTINGS = {
    intro: {
      masterGain: 0.34,
      filterHz: 1500,
      label: "Standby cue",
    },
    investigation: {
      masterGain: 0.48,
      filterHz: 2050,
      label: "Investigation loop",
    },
    focus: {
      masterGain: 0.32,
      filterHz: 1450,
      label: "Questioning hush",
    },
    coda: {
      masterGain: 0.24,
      filterHz: 1150,
      label: "Closing cadence",
    },
  };

  class MansionMusicEngine {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.musicBus = null;
      this.lowpass = null;
      this.delay = null;
      this.delayWet = null;
      this.delayFeedback = null;
      this.compressor = null;
      this.loopBuffer = null;
      this.loopSource = null;
      this.scene = "intro";
      this.userMuted = false;
      this.unlocked = false;
      this.unsupported = false;
      this.unlockCuePlayed = false;
    }

    ensureContext() {
      if (this.ctx || this.unsupported) return this.ctx;
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) {
        this.unsupported = true;
        return null;
      }

      const ctx = new AudioCtor({ latencyHint: "interactive" });

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.0001;

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -20;
      compressor.knee.value = 18;
      compressor.ratio.value = 2.4;
      compressor.attack.value = 0.02;
      compressor.release.value = 0.18;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = 1700;
      lowpass.Q.value = 0.45;

      const musicBus = ctx.createGain();
      musicBus.gain.value = 1;

      const delay = ctx.createDelay(1.4);
      delay.delayTime.value = 0.38;

      const delayFeedback = ctx.createGain();
      delayFeedback.gain.value = 0.24;

      const delayWet = ctx.createGain();
      delayWet.gain.value = 0.18;

      musicBus.connect(lowpass);
      musicBus.connect(delay);
      delay.connect(delayFeedback);
      delayFeedback.connect(delay);
      delay.connect(delayWet);
      lowpass.connect(compressor);
      delayWet.connect(compressor);
      compressor.connect(masterGain);
      masterGain.connect(ctx.destination);

      this.ctx = ctx;
      this.masterGain = masterGain;
      this.musicBus = musicBus;
      this.lowpass = lowpass;
      this.delay = delay;
      this.delayWet = delayWet;
      this.delayFeedback = delayFeedback;
      this.compressor = compressor;
      this.syncScene();
      return ctx;
    }

    activate() {
      if (this.userMuted) return;
      const ctx = this.ensureContext();
      if (!ctx) return;
      this.unlocked = true;
      void ctx.resume();
      this.ensureLoopSource();
      if (!this.unlockCuePlayed) {
        this.playUnlockCue(ctx.currentTime + 0.04);
        this.unlockCuePlayed = true;
      }
      this.syncScene();
    }

    setScene(scene) {
      this.scene = SCENE_SETTINGS[scene] ? scene : "investigation";
      this.syncScene();
    }

    toggleMute() {
      this.userMuted = !this.userMuted;
      if (!this.userMuted) {
        this.activate();
      } else {
        this.syncScene();
      }
      return this.userMuted;
    }

    ensureLoopSource() {
      if (!this.ctx || !this.musicBus) return;
      if (!this.loopBuffer) {
        this.loopBuffer = this.buildLoopBuffer();
      }
      if (this.loopSource) return;

      const source = this.ctx.createBufferSource();
      source.buffer = this.loopBuffer;
      source.loop = true;
      source.connect(this.musicBus);
      source.start();
      source.addEventListener("ended", () => {
        if (this.loopSource === source) {
          this.loopSource = null;
        }
      }, { once: true });
      this.loopSource = source;
    }

    buildLoopBuffer() {
      const sampleRate = this.ctx.sampleRate;
      const durationSec = PROGRESSION.length * BEATS_PER_MEASURE * BEAT_SEC;
      const length = Math.max(1, Math.floor(durationSec * sampleRate));
      const buffer = this.ctx.createBuffer(2, length, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      PROGRESSION.forEach((chord, measureIndex) => {
        const startSec = measureIndex * BEATS_PER_MEASURE * BEAT_SEC;
        const measureSec = BEATS_PER_MEASURE * BEAT_SEC;

        chord.pad.forEach((midi, noteIndex) => {
          const pan = -0.34 + noteIndex * 0.22;
          this.addPad(left, right, sampleRate, startSec, measureSec + 0.35, midiToHz(midi), 0.048, pan);
        });

        this.addBass(left, right, sampleRate, startSec, 5.5 * BEAT_SEC, midiToHz(chord.bass[0]), 0.13);
        this.addBass(left, right, sampleRate, startSec + 4 * BEAT_SEC, 3.2 * BEAT_SEC, midiToHz(chord.bass[1]), 0.104);
        this.addPulse(left, right, sampleRate, startSec, 0.058);
        this.addPulse(left, right, sampleRate, startSec + 4 * BEAT_SEC, 0.046);

        const motifOffsets = measureIndex % 2 === 0
          ? [1.5, 3.5, 5.25, 6.75]
          : [1.0, 2.75, 4.5, 6.5];
        motifOffsets.forEach((offset, motifIndex) => {
          const midi = chord.motif[(measureIndex + motifIndex * 2) % chord.motif.length];
          const octave = motifIndex === 3 && measureIndex % 3 === 0 ? 12 : 0;
          const pan = motifIndex % 2 === 0 ? -0.18 : 0.18;
          this.addBell(
            left,
            right,
            sampleRate,
            startSec + offset * BEAT_SEC,
            2.8,
            midiToHz(midi + octave),
            motifIndex === 0 ? 0.09 : 0.072,
            pan,
          );
        });
      });

      for (let i = 0; i < length; i++) {
        left[i] = softClip(left[i] * 0.82);
        right[i] = softClip(right[i] * 0.82);
      }

      return buffer;
    }

    addPad(left, right, sampleRate, startSec, durationSec, freq, amp, pan) {
      const start = Math.max(0, Math.floor(startSec * sampleRate));
      const end = Math.min(left.length, Math.floor((startSec + durationSec) * sampleRate));
      const attack = 1.8;
      const release = 1.4;
      const leftGain = 0.5 * (1 - pan);
      const rightGain = 0.5 * (1 + pan);
      for (let i = start; i < end; i++) {
        const t = i / sampleRate;
        const local = t - startSec;
        const env = envelope(local, durationSec, attack, release);
        const wobble = 0.84 + 0.16 * Math.sin(local * Math.PI * 0.2 + pan * 3);
        const value =
          (Math.sin(2 * Math.PI * freq * local) * 0.55) +
          (Math.sin(2 * Math.PI * freq * 0.5 * local + 0.9) * 0.28) +
          (Math.sin(2 * Math.PI * freq * 1.5 * local + 0.4) * 0.12);
        const sample = value * amp * env * wobble;
        left[i] += sample * leftGain;
        right[i] += sample * rightGain;
      }
    }

    addBass(left, right, sampleRate, startSec, durationSec, freq, amp) {
      const start = Math.max(0, Math.floor(startSec * sampleRate));
      const end = Math.min(left.length, Math.floor((startSec + durationSec) * sampleRate));
      for (let i = start; i < end; i++) {
        const t = i / sampleRate;
        const local = t - startSec;
        const decay = Math.exp(-local * 1.4);
        const sweep = freq * (1 - 0.1 * Math.min(1, local / 0.5));
        const sample =
          (Math.sin(2 * Math.PI * sweep * local) * 0.78) +
          (Math.sin(2 * Math.PI * sweep * 0.5 * local + 0.3) * 0.22);
        const value = sample * amp * decay;
        left[i] += value * 0.52;
        right[i] += value * 0.48;
      }
    }

    addPulse(left, right, sampleRate, startSec, amp) {
      const durationSec = 0.9;
      const start = Math.max(0, Math.floor(startSec * sampleRate));
      const end = Math.min(left.length, Math.floor((startSec + durationSec) * sampleRate));
      for (let i = start; i < end; i++) {
        const t = i / sampleRate;
        const local = t - startSec;
        const decay = Math.exp(-local * 5.4);
        const pulse = Math.sin(2 * Math.PI * (74 - local * 18) * local);
        const value = pulse * amp * decay;
        left[i] += value * 0.5;
        right[i] += value * 0.5;
      }
    }

    addBell(left, right, sampleRate, startSec, durationSec, freq, amp, pan) {
      const start = Math.max(0, Math.floor(startSec * sampleRate));
      const end = Math.min(left.length, Math.floor((startSec + durationSec) * sampleRate));
      const leftGain = 0.5 * (1 - pan);
      const rightGain = 0.5 * (1 + pan);
      for (let i = start; i < end; i++) {
        const t = i / sampleRate;
        const local = t - startSec;
        const decay = Math.exp(-local * 2.2);
        const shimmer = 1 + 0.004 * Math.sin(local * 7.5);
        const tone =
          Math.sin(2 * Math.PI * freq * shimmer * local) * 0.68 +
          Math.sin(2 * Math.PI * freq * 2.01 * local + 0.3) * 0.21 +
          Math.sin(2 * Math.PI * freq * 3.11 * local + 1.1) * 0.11;
        const sample = tone * amp * decay;
        left[i] += sample * leftGain;
        right[i] += sample * rightGain;
      }
    }

    playUnlockCue(when) {
      if (!this.ctx || !this.musicBus) return;
      this.playUnlockTone(when, midiToHz(74), 0.11, -0.15);
      this.playUnlockTone(when + 0.16, midiToHz(77), 0.08, 0.15);
    }

    playUnlockTone(when, freq, volume, pan) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      const panner = maybePanner(this.ctx, pan);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, when);
      filter.type = "highpass";
      filter.frequency.value = 220;

      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.linearRampToValueAtTime(volume, when + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + 1.6);

      osc.connect(filter);
      filter.connect(gain);
      if (panner) {
        gain.connect(panner);
        panner.connect(this.musicBus);
      } else {
        gain.connect(this.musicBus);
      }

      osc.start(when);
      osc.stop(when + 1.8);
      osc.addEventListener("ended", () => {
        try {
          osc.disconnect();
          filter.disconnect();
          gain.disconnect();
          if (panner) panner.disconnect();
        } catch {
          // Ignore disconnect races during unlock cue cleanup.
        }
      }, { once: true });
    }

    syncScene() {
      if (!this.masterGain || !this.lowpass || !this.delayWet || !this.delayFeedback) return;
      const settings = SCENE_SETTINGS[this.scene] || SCENE_SETTINGS.investigation;
      const now = this.ctx.currentTime;
      const targetGain = this.userMuted || !this.unlocked ? 0.0001 : settings.masterGain;

      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(Math.max(0.0001, this.masterGain.gain.value), now);
      this.masterGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, targetGain), now + 0.9);

      this.lowpass.frequency.cancelScheduledValues(now);
      this.lowpass.frequency.setValueAtTime(this.lowpass.frequency.value, now);
      this.lowpass.frequency.linearRampToValueAtTime(settings.filterHz, now + 1.1);

      this.delayWet.gain.cancelScheduledValues(now);
      this.delayWet.gain.setValueAtTime(this.delayWet.gain.value, now);
      this.delayWet.gain.linearRampToValueAtTime(this.userMuted ? 0.0001 : 0.18, now + 0.6);

      this.delayFeedback.gain.cancelScheduledValues(now);
      this.delayFeedback.gain.setValueAtTime(this.delayFeedback.gain.value, now);
      this.delayFeedback.gain.linearRampToValueAtTime(this.userMuted ? 0.0001 : 0.24, now + 0.6);
    }

    getSnapshot() {
      const sceneSettings = SCENE_SETTINGS[this.scene] || SCENE_SETTINGS.investigation;
      return {
        supported: !this.unsupported,
        unlocked: this.unlocked,
        muted: this.userMuted,
        scene: this.scene,
        sceneLabel: sceneSettings.label,
        chord: PROGRESSION[1].name,
        state: this.unsupported ? "unsupported" : (this.ctx ? this.ctx.state : "idle"),
      };
    }

    describeStatus() {
      if (this.unsupported) return "Unavailable in this browser";
      if (this.userMuted) return "Muted | Press M to resume";
      if (!this.unlocked) return "Click anywhere or press any key to start";
      const snapshot = this.getSnapshot();
      const label = snapshot.state === "running" ? snapshot.sceneLabel : "Waking audio";
      return `${label} | ${snapshot.chord}`;
    }
  }

  function maybePanner(ctx, pan) {
    if (typeof ctx.createStereoPanner !== "function") return null;
    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;
    return panner;
  }

  function midiToHz(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function envelope(time, duration, attack, release) {
    if (time <= 0 || time >= duration) return 0;
    if (time < attack) return time / attack;
    if (time > duration - release) return (duration - time) / release;
    return 1;
  }

  function softClip(value) {
    return Math.tanh(value * 1.15);
  }

  return new MansionMusicEngine();
}
