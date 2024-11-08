import { nanoid } from "nanoid";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { currentTimeToHHMMSS } from "../helpers/parser";
import { useStorage } from "../storage/useStorage";

export type AudioSourceItem = {
  id: string;
  fileName: string;
  src: string;
  aToB: {
    id: string;
    title: string;
    a: number;
    b: number;
    createdAt: ISOString;
  }[];
  index: number;
};
export type AudioStatus = {
  isPlaying: boolean;
  isLoop: boolean;
  isMuted: boolean;
  playbackRate: number;
  ALoop: number | null;
  BLoop: number | null;
  duration: number;
};

export class AudioPlayer {
  private readonly defaultAudioStatus: AudioStatus = {
    isPlaying: false,
    isLoop: false,
    isMuted: false,
    playbackRate: 1,
    ALoop: null,
    BLoop: null,
    duration: 0,
  };
  private audioState: AudioStatus = { ...this.defaultAudioStatus };
  private isDragging: boolean = false;

  constructor(
    private audioElement: HTMLAudioElement,
    private seekBarElement: HTMLDivElement,
    private seekBarSeeker: HTMLDivElement,
    private currentTimeElement: HTMLDivElement,
    private updateCurrentAudioStatus: (status: Partial<AudioStatus>) => void
  ) {
    this.init();
  }
  private setAudioState = (status: Partial<AudioStatus>) => {
    this.audioState = { ...this.audioState, ...status };
    this.updateCurrentAudioStatus(status);
  };

  private setSeekerWidth = (currentTime: number) => {
    const time = currentTime;
    const rect = this.seekBarElement.getBoundingClientRect();
    const x = (time / this.audioElement.duration) * rect.width;
    const percentage = (x / rect.width) * 100;
    this.seekBarSeeker.style.width = `${percentage}%`;
  };

  private setCurrentTimeByXPosition = (xPosition: number) => {
    const rect = this.seekBarElement.getBoundingClientRect();
    const x = xPosition - rect.left;
    const time = (x / rect.width) * this.audioElement.duration;
    this.audioElement.currentTime = time;
    this.setSeekerWidth(time);
  };
  private init = () => {
    this.audioElement.addEventListener("timeupdate", () => {
      this.loopHandler(this.audioElement.currentTime);
      this.setSeekerWidth(this.audioElement.currentTime);
      this.currentTimeElement.textContent = currentTimeToHHMMSS(
        this.audioElement.currentTime
      );
    });
    this.audioElement.addEventListener("ended", () => {
      if (this.audioState.isLoop && this.audioState.ALoop !== null) {
        this.audioElement.currentTime = this.audioState.ALoop;
        this.setSeekerWidth(0);
        this.currentTimeElement.textContent = currentTimeToHHMMSS(0);
        this.setAudioState({
          isPlaying: false,
        });
      }
    });
    this.audioElement.addEventListener("loadedmetadata", () => {
      this.setSeekerWidth(0);
      this.setAudioState({
        isPlaying: false,
        duration: this.audioElement.duration,
      });
    });

    // 마우스 이벤트
    this.seekBarElement.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this.setCurrentTimeByXPosition(e.clientX);
    });

    document.addEventListener("mousemove", (e) => {
      if (this.isDragging) {
        this.setCurrentTimeByXPosition(e.clientX);
      }
    });

    document.addEventListener("mouseup", () => {
      this.isDragging = false;
    });

    // 터치 이벤트
    this.seekBarElement.addEventListener("touchstart", (e) => {
      this.isDragging = true;
      this.setCurrentTimeByXPosition(e.touches[0].clientX);
    });

    this.seekBarElement.addEventListener("touchmove", (e) => {
      if (this.isDragging) {
        e.preventDefault();
        this.setCurrentTimeByXPosition(e.touches[0].clientX);
      }
    });

    document.addEventListener("touchend", () => {
      this.isDragging = false;
    });
  };

  private loopHandler = (currentTime: number) => {
    if (this.audioState.isLoop && this.audioState.ALoop !== null) {
      if (
        this.audioState.BLoop !== null &&
        currentTime >= this.audioState.BLoop
      ) {
        this.audioElement.currentTime = this.audioState.ALoop;
      } else if (currentTime <= this.audioState.ALoop) {
        this.audioElement.currentTime = this.audioState.ALoop;
      }
    }
  };

  public setLoopA = (currentTime: number) => {
    if (this.audioState.ALoop !== null) {
      this.setAudioState({
        ALoop: null,
      });
    } else {
      if (
        this.audioState.BLoop !== null &&
        currentTime >= this.audioState.BLoop
      ) {
        this.setAudioState({
          ALoop: currentTime,
          BLoop: null,
        });
        return;
      }
      this.setAudioState({
        ALoop: currentTime,
      });
    }
  };

  public setLoopB = (currentTime: number) => {
    if (this.audioState.BLoop !== null) {
      this.setAudioState({
        BLoop: null,
      });
    } else {
      if (
        this.audioState.ALoop !== null &&
        currentTime <= this.audioState.ALoop
      ) {
        return;
      }
      this.setAudioState({
        BLoop: currentTime,
      });
    }
  };

  public togglePlay = () => {
    if (!this.audioState.isPlaying) {
      this.audioElement.play();
      this.setAudioState({
        isPlaying: true,
      });
    } else {
      this.audioElement.pause();
      this.setAudioState({
        isPlaying: false,
      });
    }
  };

  public setLoop = (a: number, b: number) => {
    this.setAudioState({
      ALoop: a,
      BLoop: b,
    });
  };

  public toggleLoop = () => {
    this.setAudioState({
      isLoop: !this.audioState.isLoop,
    });
  };

  public setMuted = (muted: boolean) => {
    this.audioElement.muted = muted;
    this.setAudioState({
      isMuted: muted,
    });
  };

  public setPlaybackRate = (rate: number) => {
    if (rate < 0) return;
    if (rate > 2) return;
    this.audioElement.playbackRate = rate;
    this.setAudioState({
      playbackRate: rate,
    });
  };
  public addPlaybackRate = (rate: number) => {
    const currentRate = parseInt(
      (this.audioElement.playbackRate * 100).toFixed(1)
    );
    const nextRate = rate * 100;
    const newRate = (currentRate + nextRate) / 100;
    if (newRate < 0) return;
    if (newRate > 2) return;
    this.audioElement.playbackRate = newRate;
    this.setAudioState({
      playbackRate: this.audioElement.playbackRate,
    });
  };

  public getStatusBy = <K extends keyof AudioStatus>(...keys: K[]) => {
    return keys.reduce((acc, key) => {
      acc[key] = this.audioState[key];
      return acc;
    }, {} as Pick<AudioStatus, K>);
  };

  public dispose = () => {
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
  };
  public getStatus = () => {
    return this.audioState;
  };
}

export type ISOString = string;
export interface Item {
  id: string;
  name: string;
  audioFile: File | null;
  aToB: {
    id: string;
    title: string;
    a: number;
    b: number;
    createdAt: ISOString;
  }[];
}
const initialItem: Readonly<Item> = {
  id: "",
  name: "",
  audioFile: null,
  aToB: [],
};
export const useAudioPlayer = (
  audioElement: HTMLAudioElement | null,
  seekBarElement: HTMLDivElement | null,
  seekBarSeeker: HTMLDivElement | null,
  currentTimeElement: HTMLDivElement | null
) => {
  const {
    currentItem,
    setCurrentItem,
    items,
    loading,
    error,
    addItem,
    deleteItem,
    updateItem,
  } = useStorage<Item>(initialItem, {
    dbName: "test",
    storeName: "test",
    version: 1,
  });
  const audioPlayer = useRef<AudioPlayer | null>(null);

  // 이전 blob URL을 저장할 ref 추가
  const prevBlobUrl = useRef<string | null>(null);

  const sourceItem: AudioSourceItem | null = useMemo(() => {
    if (!currentItem) return null;
    if (!currentItem.audioFile) return null;
    // 새로운 blob URL 생성
    const src = URL.createObjectURL(currentItem.audioFile);

    // cleanup 함수를 실행하기 전에 이전 URL 해제
    requestAnimationFrame(() => {
      if (prevBlobUrl.current && prevBlobUrl.current !== src) {
        URL.revokeObjectURL(prevBlobUrl.current);
      }
      prevBlobUrl.current = src;
    });

    return {
      id: currentItem.id,
      fileName: currentItem.name,
      src,
      index: items.findIndex((item) => item.id === currentItem.id),
      aToB: currentItem.aToB,
    };
  }, [currentItem, items]);

  const [currentAudioStatus, setCurrentAudioStatus] = useState<AudioStatus>({
    isPlaying: false,
    isLoop: false,
    isMuted: false,
    playbackRate: 1,
    ALoop: null,
    BLoop: null,
    duration: 0,
  });

  useEffect(() => {
    if (audioElement && seekBarElement && seekBarSeeker && currentTimeElement) {
      audioPlayer.current = new AudioPlayer(
        audioElement,
        seekBarElement,
        seekBarSeeker,
        currentTimeElement,
        (status) => {
          setCurrentAudioStatus((prev) => ({
            ...prev,
            ...status,
          }));
        }
      );
      setCurrentAudioStatus(audioPlayer.current.getStatus());
    }
    return () => {
      if (audioPlayer.current) {
        audioPlayer.current.dispose();
        audioPlayer.current = null;
      }
    };
  }, [audioElement, seekBarElement, seekBarSeeker, currentTimeElement]);

  const togglePlay = useCallback(() => {
    if (audioPlayer.current) {
      audioPlayer.current.togglePlay();
    }
  }, [audioPlayer]);

  const setPreviousAudio = useCallback(
    (itemId: string) => {
      if (items.length === 0) return;
      const previousItemIndex = items.findIndex((item) => item.id === itemId);
      if (previousItemIndex === -1) return;
      const previousItem = items[previousItemIndex - 1];
      if (!previousItem) {
        setCurrentItem(items[items.length - 1]);
        return;
      }
      if (previousItem.audioFile) {
        setCurrentItem(previousItem);
      }
    },
    [items, setCurrentItem]
  );

  const setNextAudio = useCallback(
    (itemId: string) => {
      if (items.length === 0) return;
      const nextItemIndex = items.findIndex((item) => item.id === itemId);
      if (nextItemIndex === -1) return;
      const nextItem = items[nextItemIndex + 1];
      if (!nextItem) {
        setCurrentItem(items[0]);
        return;
      }
      if (nextItem.audioFile) {
        setCurrentItem(nextItem);
      }
    },
    [items, setCurrentItem]
  );
  const setTemporaryLoop = useCallback(
    (target: "a" | "b") => {
      if (audioPlayer.current && audioElement) {
        const time = audioElement.currentTime;
        if (target === "a") {
          audioPlayer.current.setLoopA(time);
        } else {
          audioPlayer.current.setLoopB(time);
        }
      }
    },
    [audioPlayer, audioElement]
  );
  const toggleLoop = useCallback(() => {
    if (audioPlayer.current) {
      audioPlayer.current.toggleLoop();
    }
  }, [audioPlayer]);

  const setPlaybackRate = useCallback(
    (rate: number) => {
      if (audioPlayer.current) {
        audioPlayer.current.setPlaybackRate(rate);
      }
    },
    [audioPlayer]
  );
  const addPlaybackRate = useCallback(
    (rate: number) => {
      if (audioPlayer.current) {
        audioPlayer.current.addPlaybackRate(rate);
      }
    },
    [audioPlayer]
  );

  const addAToBLoop = useCallback(() => {
    if (!audioPlayer.current) return;
    const { getStatus } = audioPlayer.current;
    const { ALoop, BLoop } = getStatus();
    if (ALoop === null || BLoop === null) return;
    if (!currentItem) return;
    const newItem = { ...currentItem };
    if (!newItem?.aToB) {
      newItem.aToB = [];
    }
    const uniqueTitle = `${currentTimeToHHMMSS(ALoop)} ~ ${currentTimeToHHMMSS(
      BLoop
    )}`;
    if (newItem.aToB.find((item) => item.title === uniqueTitle)) return;
    newItem.aToB.push({
      id: nanoid(),
      title: `${currentTimeToHHMMSS(ALoop)} ~ ${currentTimeToHHMMSS(BLoop)}`,
      a: ALoop,
      b: BLoop,
      createdAt: new Date().toISOString(),
    });
    updateItem(newItem);
  }, [updateItem, currentItem]);

  const deleteAToBLoop = useCallback(
    (id: string) => {
      if (!currentItem) return;
      const newItem = { ...currentItem };
      newItem.aToB = newItem.aToB.filter((item) => item.id !== id);
      updateItem(newItem);
    },
    [updateItem, currentItem]
  );

  const setLoop = useCallback(
    (a: number, b: number) => {
      if (audioPlayer.current) {
        audioPlayer.current.setLoop(a, b);
      }
    },
    [audioPlayer]
  );

  useEffect(() => {
    return () => {
      if (prevBlobUrl.current) {
        URL.revokeObjectURL(prevBlobUrl.current);
        prevBlobUrl.current = null;
        setCurrentItem(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    items,
    sourceItem,
    currentAudioStatus,
    togglePlay,
    audioPlayer,
    loading,
    error,
    setPlaybackRate,
    addPlaybackRate,
    addItem,
    deleteItem,
    updateItem,
    setPreviousAudio,
    setNextAudio,
    setCurrentItem,
    setTemporaryLoop,
    toggleLoop,
    addAToBLoop,
    setLoop,
    deleteAToBLoop,
  };
};
