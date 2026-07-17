// Procedural noir soundtrack. WebAudio only, no external assets.
// Structured around a restrained detective motif instead of continuous pitch sweeps.

type Chord = {
  root: number
  shadow: number[]
  arpeggio: number[]
  answer: number[]
}

const TEMPO_BPM = 66
const EIGHTH_MS = (60 / TEMPO_BPM) * 500

const PROGRESSION: Chord[] = [
  // Am(add9), Fmaj7(#11), Cmaj9/G, Em7, Dm9, E7sus, Am6, Bdim color.
  { root: 110.0, shadow: [220.0, 261.63, 329.63, 493.88], arpeggio: [329.63, 261.63, 392.0, 493.88], answer: [392.0, 329.63] },
  { root: 87.31, shadow: [174.61, 220.0, 261.63, 329.63], arpeggio: [329.63, 261.63, 369.99, 440.0], answer: [369.99, 329.63] },
  { root: 98.0, shadow: [196.0, 261.63, 329.63, 493.88], arpeggio: [392.0, 329.63, 493.88, 587.33], answer: [523.25, 493.88] },
  { root: 82.41, shadow: [164.81, 196.0, 246.94, 293.66], arpeggio: [293.66, 246.94, 392.0, 493.88], answer: [392.0, 293.66] },
  { root: 73.42, shadow: [146.83, 220.0, 261.63, 329.63], arpeggio: [329.63, 261.63, 440.0, 523.25], answer: [440.0, 329.63] },
  { root: 82.41, shadow: [164.81, 220.0, 246.94, 329.63], arpeggio: [246.94, 329.63, 369.99, 493.88], answer: [369.99, 329.63] },
  { root: 110.0, shadow: [220.0, 261.63, 329.63, 369.99], arpeggio: [329.63, 369.99, 493.88, 659.25], answer: [493.88, 440.0] },
  { root: 123.47, shadow: [185.0, 246.94, 293.66, 349.23], arpeggio: [293.66, 349.23, 493.88, 587.33], answer: [493.88, 392.0] },
]

export class Soundtrack {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private musicBus: GainNode | null = null
  private ambienceBus: GainNode | null = null
  private sfxBus: GainNode | null = null
  private compositionTimer: ReturnType<typeof setInterval> | null = null
  private thunderTimer: ReturnType<typeof setTimeout> | null = null
  private noiseBuf: AudioBuffer | null = null
  private muted = false
  private volume = 0.7
  private lastTickMinute = -1
  private step = 0

  /** Must be called from a user gesture at least once. */
  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume()
      return
    }
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    const ctx = new AC()
    this.ctx = ctx

    this.master = ctx.createGain()
    this.master.gain.value = this.outputVolume()

    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.value = -30
    compressor.knee.value = 20
    compressor.ratio.value = 2
    compressor.attack.value = 0.018
    compressor.release.value = 0.36
    this.master.connect(compressor).connect(ctx.destination)

    this.ambienceBus = ctx.createGain()
    this.ambienceBus.gain.value = 0.66
    this.ambienceBus.connect(this.master)

    this.musicBus = ctx.createGain()
    this.musicBus.gain.value = 0.68
    this.musicBus.connect(this.master)

    this.sfxBus = ctx.createGain()
    this.sfxBus.gain.value = 0.56
    this.sfxBus.connect(this.master)

    this.buildSoftDelay(ctx)
    this.startRain(ctx)
    this.playCompositionStep()
    this.compositionTimer = setInterval(() => this.playCompositionStep(), EIGHTH_MS)
    this.scheduleThunder()
  }

  private outputVolume(): number {
    return this.muted ? 0 : Math.min(1, this.volume) * 0.58
  }

  private buildSoftDelay(ctx: AudioContext) {
    if (!this.musicBus || !this.master) return
    const delay = ctx.createDelay(1.2)
    delay.delayTime.value = 0.34
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 1350
    filter.Q.value = 0.28
    const feedback = ctx.createGain()
    feedback.gain.value = 0.13
    const wet = ctx.createGain()
    wet.gain.value = 0.12

    this.musicBus.connect(delay)
    delay.connect(filter)
    filter.connect(wet)
    wet.connect(this.master)
    filter.connect(feedback)
    feedback.connect(delay)
  }

  private startRain(ctx: AudioContext) {
    if (!this.ambienceBus) return
    this.noiseBuf = this.makeSoftNoise(ctx, 5)
    const rain = ctx.createBufferSource()
    rain.buffer = this.noiseBuf
    rain.loop = true

    const low = ctx.createBiquadFilter()
    low.type = 'lowpass'
    low.frequency.value = 1250
    low.Q.value = 0.18

    const high = ctx.createBiquadFilter()
    high.type = 'highpass'
    high.frequency.value = 160
    high.Q.value = 0.25

    const rainGain = ctx.createGain()
    rainGain.gain.value = 0.018

    rain.connect(low).connect(high).connect(rainGain).connect(this.ambienceBus)
    rain.start()
  }

  private makeSoftNoise(ctx: AudioContext, seconds: number): AudioBuffer {
    const len = Math.floor(ctx.sampleRate * seconds)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    let last = 0
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1
      last = last * 0.99 + white * 0.01
      data[i] = last * 2.4
    }
    return buf
  }

  private playCompositionStep() {
    const ctx = this.ctx
    if (!ctx || !this.musicBus) return
    const stepInBar = this.step % 8
    const bar = Math.floor(this.step / 8)
    const chord = PROGRESSION[bar % PROGRESSION.length]

    if (stepInBar === 0) {
      this.playBass(chord.root)
      this.playChordShadow(chord.shadow)
    }

    if (stepInBar === 1 || stepInBar === 3 || stepInBar === 6) {
      const phraseIndex = stepInBar === 1 ? 0 : stepInBar === 3 ? 1 : 2
      this.playMallet(chord.arpeggio[(bar + phraseIndex) % chord.arpeggio.length], 0.038, 1.35)
    }

    if (stepInBar === 5 && bar % 2 === 1) {
      this.playMallet(chord.answer[0], 0.032, 1.1)
      this.playMallet(chord.answer[1] * 0.5, 0.02, 1.6, 0.12)
    }

    if (stepInBar === 7 && bar % 4 === 3) {
      this.playQuestionMark(chord)
    }

    this.step = (this.step + 1) % (PROGRESSION.length * 8)
  }

  private playBass(freq: number) {
    const ctx = this.ctx
    if (!ctx || !this.musicBus) return
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq

    const tone = ctx.createBiquadFilter()
    tone.type = 'lowpass'
    tone.frequency.value = 150
    tone.Q.value = 0.35

    const g = ctx.createGain()
    const t = ctx.currentTime
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.072, t + 0.045)
    g.gain.exponentialRampToValueAtTime(0.02, t + 0.75)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.7)

    osc.connect(tone).connect(g).connect(this.musicBus)
    osc.start(t)
    osc.stop(t + 2.85)
  }

  private playChordShadow(notes: number[]) {
    notes.forEach((freq, i) => {
      const shifted = i === 0 ? freq * 0.5 : freq
      this.playTone(shifted, 0.012, 3.35, 0.18 + i * 0.05, i % 2 === 0 ? -0.26 : 0.24, 520)
    })
  }

  private playMallet(freq: number, peak: number, decay: number, delay = 0) {
    const ctx = this.ctx
    if (!ctx || !this.musicBus) return
    const t = ctx.currentTime + delay

    const body = ctx.createOscillator()
    body.type = 'triangle'
    body.frequency.value = freq
    const shimmer = ctx.createOscillator()
    shimmer.type = 'sine'
    shimmer.frequency.value = freq * 2.01

    const tone = ctx.createBiquadFilter()
    tone.type = 'lowpass'
    tone.frequency.value = 1050
    tone.Q.value = 0.45

    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(peak, t + 0.018)
    g.gain.exponentialRampToValueAtTime(peak * 0.32, t + 0.22)
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay)

    const shimmerGain = ctx.createGain()
    shimmerGain.gain.value = 0.12

    body.connect(tone)
    shimmer.connect(shimmerGain).connect(tone)
    tone.connect(g).connect(this.musicBus)
    body.start(t)
    shimmer.start(t)
    body.stop(t + decay + 0.08)
    shimmer.stop(t + decay + 0.08)
  }

  private playTone(freq: number, peak: number, decay: number, delay: number, pan: number, cutoff: number) {
    const ctx = this.ctx
    if (!ctx || !this.musicBus) return
    const t = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq

    const tone = ctx.createBiquadFilter()
    tone.type = 'lowpass'
    tone.frequency.value = cutoff
    tone.Q.value = 0.38

    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(peak, t + 0.45)
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay)

    if ('StereoPannerNode' in window) {
      const panner = ctx.createStereoPanner()
      panner.pan.value = pan
      osc.connect(tone).connect(g).connect(panner).connect(this.musicBus)
    } else {
      osc.connect(tone).connect(g).connect(this.musicBus)
    }
    osc.start(t)
    osc.stop(t + decay + 0.1)
  }

  private playQuestionMark(chord: Chord) {
    const high = chord.arpeggio.at(-1) ?? chord.shadow.at(-1) ?? 440
    const low = chord.answer[0] ?? high * 0.75
    this.playMallet(high, 0.026, 0.95)
    this.playMallet(low, 0.022, 1.25, 0.16)
  }

  private scheduleThunder() {
    const delay = 26000 + Math.random() * 42000
    this.thunderTimer = setTimeout(() => {
      this.thunder(0.28 + Math.random() * 0.18)
      this.scheduleThunder()
    }, delay)
  }

  /** Distant thunder rumble. intensity 0..1 (1 = close strike). */
  thunder(intensity = 0.38) {
    const ctx = this.ctx
    if (!ctx || !this.sfxBus || !this.noiseBuf) return
    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuf
    src.playbackRate.value = 0.2 + Math.random() * 0.08

    const filt = ctx.createBiquadFilter()
    filt.type = 'lowpass'
    filt.frequency.setValueAtTime(135, ctx.currentTime)
    filt.frequency.exponentialRampToValueAtTime(36, ctx.currentTime + 2.6)
    filt.Q.value = 0.32

    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.085 * intensity + 0.012, ctx.currentTime + 0.18)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.6)

    src.connect(filt).connect(g).connect(this.sfxBus)
    src.start()
    src.stop(ctx.currentTime + 3.8)
  }

  /** Soft clock tick, fired on each in-game hour. */
  tick() {
    const ctx = this.ctx
    if (!ctx || !this.sfxBus) return
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = 760
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.022, ctx.currentTime + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.13)
    osc.connect(g).connect(this.sfxBus)
    osc.start()
    osc.stop(ctx.currentTime + 0.15)
  }

  /** Musical cue for body discovery / accusation / ending. */
  stinger(kind: 'body' | 'accuse' | 'win' | 'lose') {
    const ctx = this.ctx
    if (!ctx || !this.sfxBus) return
    const freqs: number[] =
      kind === 'body' ? [293.66, 246.94, 196.0] :
      kind === 'accuse' ? [220.0, 277.18, 329.63] :
      kind === 'win' ? [261.63, 329.63, 392.0, 523.25] :
      [220.0, 196.0, 164.81]
    const peak = kind === 'win' ? 0.052 : kind === 'accuse' ? 0.045 : 0.04

    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.value = f

      const filt = ctx.createBiquadFilter()
      filt.type = 'lowpass'
      filt.frequency.value = kind === 'win' ? 1350 : 820
      filt.Q.value = 0.38

      const g = ctx.createGain()
      const t = ctx.currentTime + i * (kind === 'win' ? 0.13 : 0.1)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(peak, t + 0.04)
      g.gain.exponentialRampToValueAtTime(0.0001, t + (kind === 'win' ? 1.9 : 1.3))

      osc.connect(filt).connect(g).connect(this.sfxBus!)
      osc.start(t)
      osc.stop(t + 2.1)
    })
  }

  /** Called with current game minute; ticks on hour boundaries. */
  onGameMinute(min: number) {
    const m = Math.floor(min)
    if (m !== this.lastTickMinute) {
      this.lastTickMinute = m
      if (m > 0 && m % 60 === 0) this.tick()
    }
  }

  setMuted(m: boolean) {
    this.muted = m
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(this.outputVolume(), this.ctx.currentTime, 0.14)
    }
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v))
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(this.outputVolume(), this.ctx.currentTime, 0.14)
    }
  }

  dispose() {
    if (this.compositionTimer) clearInterval(this.compositionTimer)
    if (this.thunderTimer) clearTimeout(this.thunderTimer)
    if (this.ctx) void this.ctx.close()
    this.ctx = null
    this.master = null
    this.musicBus = null
    this.ambienceBus = null
    this.sfxBus = null
  }
}
