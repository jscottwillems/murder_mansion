// Noir audio mix: an authored looping score plus procedural ambience and cues.

const SOUNDTRACK_URL = new URL('../../Midnight in the Static.mp3', import.meta.url).href
const CLOCK_URL = new URL('../../ticktock.mp3', import.meta.url).href
const BODY_DISCOVERY_URL = new URL('../../chord.mp3', import.meta.url).href
const RAIN_URL = new URL('../../rain.mp3', import.meta.url).href

export class Soundtrack {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private musicBus: GainNode | null = null
  private ambienceBus: GainNode | null = null
  private sfxBus: GainNode | null = null
  private soundtrack: HTMLAudioElement | null = null
  private soundtrackSource: MediaElementAudioSourceNode | null = null
  private clockLoop: HTMLAudioElement | null = null
  private clockSource: MediaElementAudioSourceNode | null = null
  private bodyCue: HTMLAudioElement | null = null
  private bodyCueSource: MediaElementAudioSourceNode | null = null
  private rainLoop: HTMLAudioElement | null = null
  private rainSource: MediaElementAudioSourceNode | null = null
  private thunderTimer: ReturnType<typeof setTimeout> | null = null
  private noiseBuf: AudioBuffer | null = null
  private muted = false
  private volume = 0.7
  private thunderHasPlayed = false
  private clockShouldRun = false

  /** Must be called from a user gesture at least once. */
  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume()
      if (this.soundtrack?.paused) void this.soundtrack.play().catch(() => undefined)
      if (this.rainLoop?.paused) void this.rainLoop.play().catch(() => undefined)
      if (this.clockShouldRun && this.clockLoop?.paused) void this.clockLoop.play().catch(() => undefined)
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
    this.ambienceBus.gain.value = 0.9
    this.ambienceBus.connect(this.master)

    this.musicBus = ctx.createGain()
    this.musicBus.gain.value = 0.36
    this.musicBus.connect(this.master)

    this.sfxBus = ctx.createGain()
    this.sfxBus.gain.value = 1
    this.sfxBus.connect(this.master)

    this.startSoundtrack(ctx)
    this.startClockLoop(ctx)
    this.prepareBodyCue(ctx)
    this.startRain(ctx)
    this.scheduleThunder()
  }

  private prepareBodyCue(ctx: AudioContext) {
    if (!this.sfxBus) return
    const cue = new Audio(BODY_DISCOVERY_URL)
    cue.preload = 'auto'
    cue.dataset.bodyDiscoveryCue = 'true'

    const cueGain = ctx.createGain()
    cueGain.gain.value = 0.72
    this.bodyCue = cue
    this.bodyCueSource = ctx.createMediaElementSource(cue)
    this.bodyCueSource.connect(cueGain).connect(this.sfxBus)
  }

  private startClockLoop(ctx: AudioContext) {
    if (!this.ambienceBus) return
    const clock = new Audio(CLOCK_URL)
    clock.loop = true
    clock.preload = 'auto'
    clock.dataset.gameClock = 'true'

    const clockGain = ctx.createGain()
    clockGain.gain.value = 0.1
    this.clockLoop = clock
    this.clockSource = ctx.createMediaElementSource(clock)
    this.clockSource.connect(clockGain).connect(this.ambienceBus)
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
    // Thunder still uses a filtered noise buffer, but the continuous rain is authored.
    this.noiseBuf = this.makeSoftNoise(ctx, 5)
    const rain = new Audio(RAIN_URL)
    rain.loop = true
    rain.preload = 'auto'
    rain.dataset.gameRain = 'true'

    const low = ctx.createBiquadFilter()
    low.type = 'lowpass'
    low.frequency.value = 2600
    low.Q.value = 0.18

    const high = ctx.createBiquadFilter()
    high.type = 'highpass'
    high.frequency.value = 160
    high.Q.value = 0.25

    const rainGain = ctx.createGain()
    rainGain.gain.value = 0.12

    this.rainLoop = rain
    this.rainSource = ctx.createMediaElementSource(rain)
    this.rainSource.connect(low).connect(high).connect(rainGain).connect(this.ambienceBus)
    void rain.play().catch(() => {
      // A later user gesture will call ensure() again and retry playback.
    })
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
    // Let players hear the storm shortly after a case begins, then keep it sparse.
    const delay = this.thunderHasPlayed
      ? 22000 + Math.random() * 30000
      : 4000 + Math.random() * 2500
    this.thunderTimer = setTimeout(() => {
      this.thunderHasPlayed = true
      this.thunder(0.52 + Math.random() * 0.2)
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
    g.gain.exponentialRampToValueAtTime(0.19 * intensity + 0.025, ctx.currentTime + 0.18)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.6)

    src.connect(filt).connect(g).connect(this.sfxBus)
    src.start()
    src.stop(ctx.currentTime + 3.8)
  }

  /** Musical cue for body discovery / accusation / ending. */
  stinger(kind: 'body' | 'accuse' | 'win' | 'lose') {
    const ctx = this.ctx
    if (!ctx || !this.sfxBus) return
    if (kind === 'body') {
      this.duckMusic(3)
      if (this.bodyCue) {
        this.bodyCue.pause()
        this.bodyCue.currentTime = 0
        void this.bodyCue.play().catch(() => undefined)
      }
      return
    }
    this.duckMusic(2.2)
    const freqs: number[] =
      kind === 'accuse' ? [220.0, 277.18, 329.63] :
      kind === 'win' ? [261.63, 329.63, 392.0, 523.25] :
      [220.0, 196.0, 164.81]
    const peak = kind === 'win' ? 0.15 : kind === 'accuse' ? 0.13 : 0.12

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

  private duckMusic(seconds: number) {
    const ctx = this.ctx
    const bus = this.musicBus
    if (!ctx || !bus) return
    const t = ctx.currentTime
    bus.gain.cancelScheduledValues(t)
    bus.gain.setValueAtTime(bus.gain.value, t)
    bus.gain.linearRampToValueAtTime(0.12, t + 0.08)
    bus.gain.setValueAtTime(0.12, t + Math.max(0.2, seconds - 0.5))
    bus.gain.linearRampToValueAtTime(0.36, t + seconds)
  }

  /** Keep one second of clock audio aligned to one simulated minute. */
  onGameMinute(min: number, speed: number, running: boolean) {
    const clock = this.clockLoop
    this.clockShouldRun = running
    if (!clock) return

    const rate = Math.max(0.5, Math.min(4, speed))
    if (clock.playbackRate !== rate) clock.playbackRate = rate

    if (!running) {
      if (!clock.paused) clock.pause()
      return
    }

    if (Number.isFinite(clock.duration) && clock.duration > 0) {
      const desiredTime = min % clock.duration
      const directDrift = Math.abs(clock.currentTime - desiredTime)
      const wrappedDrift = clock.duration - directDrift
      if (Math.min(directDrift, wrappedDrift) > 0.08) clock.currentTime = desiredTime
    }
    if (clock.paused) void clock.play().catch(() => undefined)
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
    if (this.clockLoop) {
      this.clockLoop.pause()
      this.clockLoop.removeAttribute('src')
      this.clockLoop.load()
    }
    if (this.bodyCue) {
      this.bodyCue.pause()
      this.bodyCue.removeAttribute('src')
      this.bodyCue.load()
    }
    if (this.rainLoop) {
      this.rainLoop.pause()
      this.rainLoop.removeAttribute('src')
      this.rainLoop.load()
    }
    this.ctx = null
    this.master = null
    this.musicBus = null
    this.ambienceBus = null
    this.sfxBus = null
    this.soundtrack = null
    this.soundtrackSource = null
    this.clockLoop = null
    this.clockSource = null
    this.bodyCue = null
    this.bodyCueSource = null
    this.rainLoop = null
    this.rainSource = null
  }
}
