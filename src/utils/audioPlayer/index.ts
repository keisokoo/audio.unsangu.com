class AudioPlayer {
  private audio: HTMLAudioElement;
  private aToB: {
    a: number;
    b: number;
  } = { a: 0, b: 0 };
  private isLooping = false;
  private onTimeUpdateCallback: ((time: number) => void)[] = [];
  private onEndedCallback: (() => void)[] = [];
  private onPlayCallback: (() => void)[] = [];
  private onPauseCallback: (() => void)[] = [];
  private onStopCallback: (() => void)[] = [];
  private onDurationChangeCallback: ((duration: number) => void)[] = [];
  private onVolumeChangeCallback: ((volume: number) => void)[] = [];
  private onMutedChangeCallback: ((muted: boolean) => void)[] = [];
  private onPlaybackRateChangeCallback: ((rate: number) => void)[] = [];
  private onLoopChangeCallback: ((loop: boolean) => void)[] = [];
  private onAtoBChangeCallback: ((aToB: { a: number; b: number }) => void)[] =
    [];
  public isPlaying = false;
  public currentTime = 0;
  constructor(
    audioFile: File,
    configs?: {
      init: boolean;
      onTimeUpdate: (time: number) => void;
      onEnded: () => void;
      onPlay: () => void;
      onPause: () => void;
      onStop: () => void;
      onDurationChange: (duration: number) => void;
      onVolumeChange: (volume: number) => void;
      onMutedChange: (muted: boolean) => void;
      onPlaybackRateChange: (rate: number) => void;
      onLoopChange: (loop: boolean) => void;
      onAtoBChange: (aToB: { a: number; b: number }) => void;
    }
  ) {
    this.audio = new Audio(URL.createObjectURL(audioFile));

    if (configs?.onTimeUpdate) {
      this.onTimeUpdateCallback.push(configs.onTimeUpdate);
    }

    if (configs?.onEnded) {
      this.onEndedCallback.push(configs.onEnded);
    }

    if (configs?.onPlay) {
      this.onPlayCallback.push(configs.onPlay);
    }

    if (configs?.onPause) {
      this.onPauseCallback.push(configs.onPause);
    }

    if (configs?.onStop) {
      this.onStopCallback.push(configs.onStop);
    }

    if (configs?.onDurationChange) {
      this.onDurationChangeCallback.push(configs.onDurationChange);
    }

    if (configs?.onVolumeChange) {
      this.onVolumeChangeCallback.push(configs.onVolumeChange);
    }

    if (configs?.onMutedChange) {
      this.onMutedChangeCallback.push(configs.onMutedChange);
    }

    if (configs?.onPlaybackRateChange) {
      this.onPlaybackRateChangeCallback.push(configs.onPlaybackRateChange);
    }

    if (configs?.onLoopChange) {
      this.onLoopChangeCallback.push(configs.onLoopChange);
    }

    if (configs?.onAtoBChange) {
      this.onAtoBChangeCallback.push(configs.onAtoBChange);
    }
  }
  init() {
    this.audio.addEventListener("timeupdate", (e: Event) => {
      if (this.isLooping) {
        const target = e.target as HTMLAudioElement;
        this.currentTime = target.currentTime;
        if (this.currentTime >= this.aToB.b) {
          this.audio.currentTime = this.aToB.a;
        }
      }
      this.onTimeUpdateCallback.forEach((callback) =>
        callback(this.currentTime)
      );
    });
    this.audio.addEventListener("ended", () => {
      this.onEndedCallback.forEach((callback) => callback());
    });
    this.audio.addEventListener("play", () => {
      this.onPlayCallback.forEach((callback) => callback());
    });
    this.audio.addEventListener("pause", () => {
      this.onPauseCallback.forEach((callback) => callback());
    });
    this.audio.addEventListener("stop", () => {
      this.onStopCallback.forEach((callback) => callback());
    });
    this.audio.addEventListener("durationchange", () => {
      this.onDurationChangeCallback.forEach((callback) =>
        callback(this.audio.duration)
      );
    });
    this.audio.addEventListener("volumechange", () => {
      this.onVolumeChangeCallback.forEach((callback) =>
        callback(this.audio.volume)
      );
    });
    this.audio.addEventListener("mutedchange", () => {
      this.onMutedChangeCallback.forEach((callback) =>
        callback(this.audio.muted)
      );
    });
    this.audio.addEventListener("playbackratechange", () => {
      this.onPlaybackRateChangeCallback.forEach((callback) =>
        callback(this.audio.playbackRate)
      );
    });
    this.audio.addEventListener("loopchange", () => {
      this.onLoopChangeCallback.forEach((callback) => callback(this.isLooping));
    });
    this.audio.addEventListener("atobchange", () => {
      this.onAtoBChangeCallback.forEach((callback) => callback(this.aToB));
    });
  }
  play() {
    this.audio.play();
    this.isPlaying = true;
  }
  pause() {
    this.audio.pause();
    this.isPlaying = false;
  }
  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.isPlaying = false;
  }
  getDuration() {
    return this.audio.duration;
  }
  getCurrentTime() {
    return this.audio.currentTime;
  }
  setCurrentTime(time: number) {
    this.audio.currentTime = time;
  }
  getVolume() {
    return this.audio.volume;
  }
  setVolume(volume: number) {
    this.audio.volume = volume;
  }
  getMuted() {
    return this.audio.muted;
  }
  setMuted(muted: boolean) {
    this.audio.muted = muted;
  }
  getPlaybackRate() {
    return this.audio.playbackRate;
  }
  setPlaybackRate(rate: number) {
    this.audio.playbackRate = rate;
  }
  getLoop() {
    return this.audio.loop;
  }
  setLoop(loop: boolean) {
    this.audio.loop = loop;
    this.isLooping = loop;
  }
  setAtoB(target: "a" | "b" = "a") {
    this.aToB[target] = this.getCurrentTime();
  }
  getAtoB() {
    return this.aToB;
  }
  getAtoBTime(target: "a" | "b" = "a") {
    return this.aToB[target];
  }
}

export default AudioPlayer;
