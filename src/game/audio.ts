// Noir audio mix: an authored looping score plus procedural ambience and cues.

const SOUNDTRACK_URL = new URL('../../Midnight in the Static.mp3', import.meta.url).href
const CLOCK_URL = new URL('../../ticktock.mp3', import.meta.url).href
const BODY_DISCOVERY_URL = new URL('../../chord.mp3', import.meta.url).href
const EVIDENCE_DISCOVERY_URL = new URL('../../discovery.mp3', import.meta.url).href
const HOUR_CHIME_URL = new URL('../../chime.m4a', import.meta.url).href
const RAIN_URL = new URL('../../rain.mp3', import.meta.url).href
const FOOTSTEPS_URL = new URL('../../footsteps.mp3', import.meta.url).href
const TEXT_BLIP_URL = new URL('../../text-blip.mp3', import.meta.url).href
const FIRE_URL = new URL('../../fire.mp3', import.meta.url).href
const STUDY_FIRE_GAIN = 0.44

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
  private evidenceCue: HTMLAudioElement | null = null
  private evidenceCueSource: MediaElementAudioSourceNode | null = null
  private hourChime: HTMLAudioElement | null = null
  private hourChimeSource: MediaElementAudioSourceNode | null = null
  private rainLoop: HTMLAudioElement | null = null
  private rainSource: MediaElementAudioSourceNode | null = null
  private fireLoop: HTMLAudioElement | null = null
  private fireSource: MediaElementAudioSourceNode | null = null
  private fireGain: GainNode | null = null
  private footstepsLoop: HTMLAudioElement | null = null
  private footstepsSource: MediaElementAudioSourceNode | null = null
  private textBlipLoop: HTMLAudioElement | null = null
  private textBlipSource: MediaElementAudioSourceNode | null = null
  private thunderTimer: ReturnType<typeof setTimeout> | null = null
  private noiseBuf: AudioBuffer | null = null
  private muted = false
  private bgmVolume = 0.7
  private sfxVolume = 0.7
  private thunderHasPlayed = false
  private clockShouldRun = false
  private playerShouldWalk = false
  private dialogueShouldBlip = false
  private fireShouldRun = false
  private fireFadeTimer: ReturnType<typeof setTimeout> | null = null
  private lastGameMinute: number | null = null

  /** Must be called from a user gesture at least once. */
  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume()
      if (this.soundtrack?.paused) void this.soundtrack.play().catch(() => undefined)
      if (this.rainLoop?.paused) void this.rainLoop.play().catch(() => undefined)
      if (this.fireShouldRun && this.fireLoop?.paused) void this.fireLoop.play().catch(() => undefined)
      if (this.clockShouldRun && this.clockLoop?.paused) void this.clockLoop.play().catch(() => undefined)
      if (this.playerShouldWalk && this.footstepsLoop?.paused) void this.footstepsLoop.play().catch(() => undefined)
      if (this.dialogueShouldBlip && this.textBlipLoop?.paused) void this.textBlipLoop.play().catch(() => undefined)
      return
    }
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    const ctx = new AC()
    this.ctx = ctx

    this.master = ctx.createGain()
    this.master.gain.value = this.outputVolume()

    // Keep buses additive. A shared compressor made louder ambience push the
    // score down even though the music bus itself never changed gain.
    this.master.connect(ctx.destination)

    this.ambienceBus = ctx.createGain()
    this.ambienceBus.gain.value = 0.9 * this.sfxVolume
    this.ambienceBus.connect(this.master)

    this.musicBus = ctx.createGain()
    this.musicBus.gain.value = 0.36 * this.bgmVolume
    this.musicBus.connect(this.master)

    this.sfxBus = ctx.createGain()
    this.sfxBus.gain.value = this.sfxVolume
    this.sfxBus.connect(this.master)

    this.startSoundtrack(ctx)
    this.startClockLoop(ctx)
    this.prepareBodyCue(ctx)
    this.prepareEvidenceCue(ctx)
    this.prepareHourChime(ctx)
    this.prepareFootsteps(ctx)
    this.prepareTextBlip(ctx)
    this.startRain(ctx)
    this.prepareFireLoop(ctx)
    this.scheduleThunder()
  }

  private prepareFireLoop(ctx: AudioContext) {
    if (!this.ambienceBus) return
    const fire = new Audio(FIRE_URL)
    fire.loop = true
    fire.preload = 'auto'
    fire.dataset.studyFire = 'true'

    const lowpass = ctx.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.value = 4200
    lowpass.Q.value = 0.18

    const gain = ctx.createGain()
    gain.gain.value = this.fireShouldRun ? STUDY_FIRE_GAIN : 0.0001
    this.fireLoop = fire
    this.fireGain = gain
    this.fireSource = ctx.createMediaElementSource(fire)
    this.fireSource.connect(lowpass).connect(gain).connect(this.ambienceBus)
    if (this.fireShouldRun) void fire.play().catch(() => undefined)
  }

  private prepareTextBlip(ctx: AudioContext) {
    if (!this.sfxBus) return
    const blip = new Audio(TEXT_BLIP_URL)
    blip.loop = true
    blip.preload = 'auto'
    blip.dataset.dialogueTextBlip = 'true'

    const blipGain = ctx.createGain()
    blipGain.gain.value = 0.42
    this.textBlipLoop = blip
    this.textBlipSource = ctx.createMediaElementSource(blip)
    this.textBlipSource.connect(blipGain).connect(this.sfxBus)
  }

  private prepareFootsteps(ctx: AudioContext) {
    if (!this.sfxBus) return
    const footsteps = new Audio(FOOTSTEPS_URL)
    footsteps.loop = true
    footsteps.preload = 'auto'
    footsteps.dataset.playerFootsteps = 'true'

    const footstepGain = ctx.createGain()
    // The recording is roughly 13 dB quieter than the score before mixing.
    footstepGain.gain.value = 1.35
    this.footstepsLoop = footsteps
    this.footstepsSource = ctx.createMediaElementSource(footsteps)
    this.footstepsSource.connect(footstepGain).connect(this.sfxBus)
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

  private prepareEvidenceCue(ctx: AudioContext) {
    if (!this.sfxBus) return
    const cue = new Audio(EVIDENCE_DISCOVERY_URL)
    cue.preload = 'auto'
    cue.dataset.evidenceDiscoveryCue = 'true'

    // Narrow the frequency range and soften the transients for a restrained,
    // slightly worn lo-fi character without permanently altering the source.
    const highpass = ctx.createBiquadFilter()
    highpass.type = 'highpass'
    highpass.frequency.value = 120
    highpass.Q.value = 0.55

    const lowpass = ctx.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.value = 3200
    lowpass.Q.value = 0.7

    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.value = -24
    compressor.knee.value = 16
    compressor.ratio.value = 5
    compressor.attack.value = 0.018
    compressor.release.value = 0.22

    const cueGain = ctx.createGain()
    cueGain.gain.value = 0.68
    this.evidenceCue = cue
    this.evidenceCueSource = ctx.createMediaElementSource(cue)
    this.evidenceCueSource.connect(highpass).connect(lowpass).connect(compressor).connect(cueGain).connect(this.sfxBus)
  }

  private prepareHourChime(ctx: AudioContext) {
    if (!this.sfxBus) return
    const chime = new Audio(HOUR_CHIME_URL)
    chime.preload = 'auto'
    chime.dataset.hourChime = 'true'

    const chimeGain = ctx.createGain()
    chimeGain.gain.value = 0.62
    this.hourChime = chime
    this.hourChimeSource = ctx.createMediaElementSource(chime)
    this.hourChimeSource.connect(chimeGain).connect(this.sfxBus)
  }

  private startClockLoop(ctx: AudioContext) {
    if (!this.ambienceBus) return
    const clock = new Audio(CLOCK_URL)
    clock.loop = true
    clock.preload = 'auto'
    clock.dataset.gameClock = 'true'

    const clockGain = ctx.createGain()
    // Keep the authored ticks distinct beneath rain after the ambience, SFX,
    // and master gains are applied, while leaving them a background detail.
    clockGain.gain.value = 0.28
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
    return this.muted ? 0 : 0.58
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
    // The source averages around -46 dBFS, so this remains a restrained bed
    // even with gain above unity (about 17 dB below the music after mixing).
    rainGain.gain.value = 1.6

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

    // A mid-bass presence layer keeps thunder audible on laptop speakers,
    // while the original path supplies the deep room-shaking tail.
    const presence = ctx.createBiquadFilter()
    presence.type = 'bandpass'
    presence.frequency.setValueAtTime(280, ctx.currentTime)
    presence.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 2.2)
    presence.Q.value = 0.7
    const presenceGain = ctx.createGain()
    presenceGain.gain.setValueAtTime(0.0001, ctx.currentTime)
    presenceGain.gain.exponentialRampToValueAtTime(0.34 * intensity + 0.08, ctx.currentTime + 0.06)
    presenceGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5)
    src.connect(presence).connect(presenceGain).connect(this.sfxBus)
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

  evidenceDiscovered() {
    if (!this.ctx || !this.sfxBus || !this.evidenceCue) return
    this.evidenceCue.pause()
    this.evidenceCue.currentTime = 0
    void this.evidenceCue.play().catch(() => undefined)
  }

  private duckMusic(seconds: number) {
    const ctx = this.ctx
    const bus = this.musicBus
    if (!ctx || !bus) return
    const t = ctx.currentTime
    bus.gain.cancelScheduledValues(t)
    bus.gain.setValueAtTime(bus.gain.value, t)
    bus.gain.linearRampToValueAtTime(0.12 * this.bgmVolume, t + 0.08)
    bus.gain.setValueAtTime(0.12 * this.bgmVolume, t + Math.max(0.2, seconds - 0.5))
    bus.gain.linearRampToValueAtTime(0.36 * this.bgmVolume, t + seconds)
  }

  /** Keep one second of clock audio aligned to one simulated minute. */
  onGameMinute(min: number, speed: number, running: boolean) {
    const previousMinute = this.lastGameMinute
    if (previousMinute === null || min < previousMinute) {
      // Establish a baseline at case start (or after a new case rewinds to
      // midnight) without chiming immediately at 12:00 AM.
      this.lastGameMinute = min
    } else if (running) {
      if (Math.floor(min / 60) > Math.floor(previousMinute / 60)) this.playHourChime()
      this.lastGameMinute = min
    }

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

  private playHourChime() {
    if (!this.ctx || !this.sfxBus || !this.hourChime) return
    this.hourChime.pause()
    this.hourChime.currentTime = 0
    void this.hourChime.play().catch(() => undefined)
  }

  setPlayerWalking(walking: boolean) {
    this.playerShouldWalk = walking
    const footsteps = this.footstepsLoop
    if (!footsteps) return
    if (walking) {
      if (footsteps.paused) void footsteps.play().catch(() => undefined)
    } else if (!footsteps.paused) {
      footsteps.pause()
    }
  }

  setDialogueTyping(active: boolean, restart = false) {
    this.dialogueShouldBlip = active
    const blip = this.textBlipLoop
    if (!blip) return
    if (restart) blip.currentTime = 0
    if (active) {
      if (blip.paused) void blip.play().catch(() => undefined)
    } else if (!blip.paused) {
      blip.pause()
    }
  }

  /** Fade the fireplace recording in only while the detective occupies the Study. */
  setRoomAmbience(room: string) {
    const active = room === 'study'
    if (active === this.fireShouldRun && (!active || (this.fireLoop && !this.fireLoop.paused))) return
    this.fireShouldRun = active
    if (this.fireFadeTimer) {
      clearTimeout(this.fireFadeTimer)
      this.fireFadeTimer = null
    }
    const ctx = this.ctx
    const fire = this.fireLoop
    const gain = this.fireGain
    if (!ctx || !fire || !gain) return
    gain.gain.cancelScheduledValues(ctx.currentTime)
    gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), ctx.currentTime)
    gain.gain.setTargetAtTime(active ? STUDY_FIRE_GAIN : 0.0001, ctx.currentTime, active ? 0.22 : 0.34)
    if (active) {
      if (fire.paused) void fire.play().catch(() => undefined)
      return
    }
    this.fireFadeTimer = setTimeout(() => {
      if (!this.fireShouldRun && this.fireLoop && !this.fireLoop.paused) this.fireLoop.pause()
      this.fireFadeTimer = null
    }, 1500)
  }

  setMuted(m: boolean) {
    this.muted = m
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(this.outputVolume(), this.ctx.currentTime, 0.14)
    }
  }

  setBgmVolume(v: number) {
    this.bgmVolume = Math.max(0, Math.min(1, v))
    if (this.ctx && this.musicBus) {
      this.musicBus.gain.cancelScheduledValues(this.ctx.currentTime)
      this.musicBus.gain.setTargetAtTime(0.36 * this.bgmVolume, this.ctx.currentTime, 0.08)
    }
  }

  setSfxVolume(v: number) {
    this.sfxVolume = Math.max(0, Math.min(1, v))
    if (this.ctx && this.ambienceBus && this.sfxBus) {
      this.ambienceBus.gain.cancelScheduledValues(this.ctx.currentTime)
      this.sfxBus.gain.cancelScheduledValues(this.ctx.currentTime)
      this.ambienceBus.gain.setTargetAtTime(0.9 * this.sfxVolume, this.ctx.currentTime, 0.08)
      this.sfxBus.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.08)
    }
  }

  dispose() {
    if (this.thunderTimer) clearTimeout(this.thunderTimer)
    if (this.fireFadeTimer) clearTimeout(this.fireFadeTimer)
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
    if (this.evidenceCue) {
      this.evidenceCue.pause()
      this.evidenceCue.removeAttribute('src')
      this.evidenceCue.load()
    }
    if (this.hourChime) {
      this.hourChime.pause()
      this.hourChime.removeAttribute('src')
      this.hourChime.load()
    }
    if (this.rainLoop) {
      this.rainLoop.pause()
      this.rainLoop.removeAttribute('src')
      this.rainLoop.load()
    }
    if (this.fireLoop) {
      this.fireLoop.pause()
      this.fireLoop.removeAttribute('src')
      this.fireLoop.load()
    }
    if (this.footstepsLoop) {
      this.footstepsLoop.pause()
      this.footstepsLoop.removeAttribute('src')
      this.footstepsLoop.load()
    }
    if (this.textBlipLoop) {
      this.textBlipLoop.pause()
      this.textBlipLoop.removeAttribute('src')
      this.textBlipLoop.load()
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
    this.evidenceCue = null
    this.evidenceCueSource = null
    this.hourChime = null
    this.hourChimeSource = null
    this.rainLoop = null
    this.rainSource = null
    this.fireLoop = null
    this.fireSource = null
    this.fireGain = null
    this.footstepsLoop = null
    this.footstepsSource = null
    this.textBlipLoop = null
    this.textBlipSource = null
  }
}
