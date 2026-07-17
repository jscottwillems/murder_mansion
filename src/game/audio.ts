// Noir audio mix: an authored looping score plus procedural ambience and cues.

const SOUNDTRACK_URL = new URL('../../Midnight in the Static.mp3', import.meta.url).href

export class Soundtrack {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private musicBus: GainNode | null = null
  private ambienceBus: GainNode | null = null
  private sfxBus: GainNode | null = null
  private soundtrack: HTMLAudioElement | null = null
  private soundtrackSource: MediaElementAudioSourceNode | null = null
  private thunderTimer: ReturnType<typeof setTimeout> | null = null
  private noiseBuf: AudioBuffer | null = null
  private muted = false
  private volume = 0.7
  private lastTickMinute = -1

  /** Must be called from a user gesture at least once. */
  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume()
      if (this.soundtrack?.paused) void this.soundtrack.play().catch(() => undefined)
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
    this.musicBus.gain.value = 0.52
    this.musicBus.connect(this.master)

    this.sfxBus = ctx.createGain()
    this.sfxBus.gain.value = 0.56
    this.sfxBus.connect(this.master)

    this.startSoundtrack(ctx)
    this.startRain(ctx)
    this.scheduleThunder()
  }

  private startSoundtrack(ctx: AudioContext) {
    if (!this.musicBus) return
    const soundtrack = new Audio(SOUNDTRACK_URL)
    soundtrack.loop = true
    soundtrack.preload = 'auto'
    soundtrack.dataset.gameSoundtrack = 'true'
    this.soundtrack = soundtrack
    this.soundtrackSource = ctx.createMediaElementSource(soundtrack)
    this.soundtrackSource.connect(this.musicBus)
    void soundtrack.play().catch(() => {
      // A later user gesture will call ensure() again and retry playback.
    })
  }

  private outputVolume(): number {
    return this.muted ? 0 : Math.min(1, this.volume) * 0.58
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
    if (this.thunderTimer) clearTimeout(this.thunderTimer)
    if (this.ctx) void this.ctx.close()
    if (this.soundtrack) {
      this.soundtrack.pause()
      this.soundtrack.removeAttribute('src')
      this.soundtrack.load()
    }
    this.ctx = null
    this.master = null
    this.musicBus = null
    this.ambienceBus = null
    this.sfxBus = null
    this.soundtrack = null
    this.soundtrackSource = null
  }
}
