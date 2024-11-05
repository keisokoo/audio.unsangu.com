export interface AudioSettings {
  loop: boolean;
  aToB: { a: number | null; b: number | null };
  volume: number;
  muted: boolean;
  playbackRate: number;
}

class AudioPlayer {
  private audioElement: HTMLAudioElement;
  private settings: AudioSettings = {
    loop: false,
    aToB: { a: 0, b: 0 },
    volume: 0.1,
    muted: false,
    playbackRate: 1,
  };
  private currentTime: number = 0;
  constructor(element: HTMLAudioElement) {
    this.audioElement = element;
  }
  changeSrc(src: string) {
    this.audioElement.src = src;
    this.init();
  }
  readyLoop() {
    return (
      this.settings.aToB.a !== null &&
      this.settings.aToB.b !== null &&
      this.settings.loop
    );
  }
  init() {
    this.audioElement.addEventListener("timeupdate", () => {
      this.currentTime = this.audioElement.currentTime;
      if (this.readyLoop()) {
        if (this.currentTime >= this.settings.aToB.b!) {
          this.audioElement.currentTime = this.settings.aToB.a!;
        } else if (this.currentTime <= this.settings.aToB.a!) {
          this.audioElement.currentTime = this.settings.aToB.a!;
        }
      }
    });
    this.audioElement.addEventListener("ended", () => {
      if (this.readyLoop()) {
        this.audioElement.currentTime = this.settings.aToB.a!;
      }
    });
  }
  getDurationByTime(time: number) {
    return (time / this.audioElement.duration) * 100;
  }
  setSettings(settings: Partial<AudioSettings>) {
    if (!this.audioElement) return;
    this.audioElement.loop = settings.loop ?? this.settings.loop;
    this.audioElement.volume = settings.volume ?? this.settings.volume;
    this.audioElement.muted = settings.muted ?? this.settings.muted;
    this.audioElement.playbackRate =
      settings.playbackRate ?? this.settings.playbackRate;
    this.settings = { ...this.settings, ...settings };
  }
  setPlaybackRate(rate: number) {
    this.settings.playbackRate = rate;
    this.audioElement.playbackRate = rate;
  }
  setVolume(volume: number) {
    this.settings.volume = volume;
    this.audioElement.volume = volume;
  }
  setMuted(muted: boolean) {
    this.settings.muted = muted;
    this.audioElement.muted = muted;
  }
  setLoop(loop: boolean) {
    this.settings.loop = loop;
  }
  setA() {
    if (
      this.settings.aToB.b !== null && // b가 있고
      this.currentTime >= this.settings.aToB.b // 현재 시간이 b보다 크거나 같으면
    ) {
      console.log(
        this.currentTime,
        this.settings.aToB.b,
        "a는 b보다 크면 안됨"
      );
      return null;
    }
    if (this.settings.aToB.a !== null) {
      console.log("a는 이미 있으므로 초기화");
      this.settings.aToB.a = null;
      return null;
    }
    this.settings.aToB.a = this.currentTime;
    return this.getDurationByTime(this.settings.aToB.a);
  }
  setB() {
    if (
      this.settings.aToB.a !== null && // a가 있고
      this.currentTime <= this.settings.aToB.a // 현재 시간이 a보다 작거나 같으면
    ) {
      console.log("a는 b보다 작아야 함");
      return null;
    }
    if (this.settings.aToB.b !== null) {
      console.log("b는 이미 있으므로 초기화");
      this.settings.aToB.b = null;
      return null;
    }
    this.settings.aToB.b = this.currentTime;
    return this.getDurationByTime(this.settings.aToB.b);
  }
  getSettings() {
    return this.settings;
  }
  play() {
    this.audioElement.play();
  }
  pause() {
    this.audioElement.pause();
  }
  togglePlay() {
    if (this.audioElement.paused) {
      this.play();
    } else {
      this.pause();
    }
    return;
  }
}

export default AudioPlayer;
