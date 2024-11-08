import { useEffect, useMemo, useRef } from "react";
import {
  FaA,
  FaB,
  FaBackward,
  FaForward,
  FaPause,
  FaPlay,
  FaRotate,
  FaTrash,
} from "react-icons/fa6";
import { useAudioPlayer } from "../utils/audioPlayer/useAudioPlayer";
import { currentTimeToHHMMSS } from "../utils/helpers/parser";
import "./styles.css";

export default function Home() {
  const audioElement = useRef<HTMLAudioElement>(null);
  const seekBarElement = useRef<HTMLDivElement>(null);
  const seekBarSeeker = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    sourceItem,
    addItem,
    currentAudioStatus,
    togglePlay,
    items,
    setPreviousAudio,
    deleteItem,
    setCurrentItem,
    setNextAudio,
    setTemporaryLoop,
    toggleLoop,
  } = useAudioPlayer(
    audioElement.current,
    seekBarElement.current,
    seekBarSeeker.current,
    timeRef.current
  );

  useEffect(() => {
    function setViewportHeight() {
      const footer = document.querySelector(".fixed-footer") as HTMLElement;
      if (!footer) return;
      const dummy = document.querySelector(".fixed-dummy") as HTMLElement;
      if (dummy) {
        dummy.style.height = `${footer.clientHeight}px`;
      }
    }
    setViewportHeight();
    window.addEventListener("orientationchange", setViewportHeight);
    document.addEventListener("DOMContentLoaded", setViewportHeight);
    return () => {
      if (window.visualViewport)
        window.visualViewport.removeEventListener("resize", setViewportHeight);
      window.removeEventListener("orientationchange", setViewportHeight);
      document.removeEventListener("DOMContentLoaded", setViewportHeight);
    };
  }, []);
  const loopPosition = useMemo(() => {
    let loopAPosition: number | null = null;
    let loopBPosition: number | null = null;
    const duration = currentAudioStatus?.duration || 0;
    if (currentAudioStatus.ALoop) {
      loopAPosition = (currentAudioStatus.ALoop / duration) * 100;
    }
    if (currentAudioStatus.BLoop) {
      loopBPosition = (currentAudioStatus.BLoop / duration) * 100;
    }
    return { loopAPosition, loopBPosition };
  }, [currentAudioStatus]);
  return (
    <>
      <div className="main-container">
        <div className="inner-container">
          <div className="flex flex-col items-center justify-center min-h-fit">
            <div className="text-2xl font-bold">Audio Player</div>
            <input
              className="hidden"
              type="file"
              ref={inputRef}
              onChange={(e) => {
                if (e.target.files) {
                  addItem({
                    audioFile: e.target.files[0],
                    name: e.target.files[0].name,
                  });
                }
              }}
            />
            <button
              onClick={() => {
                inputRef.current?.click();
              }}
              className="p-2 rounded-md bg-slate-600"
            >
              Add Audio
            </button>
            {sourceItem && (
              <>
                <div className="text-sm">
                  {sourceItem.fileName || "Unknown"}
                </div>
                <div className="flex flex-row items-center justify-between">
                  <div className="flex flex-row gap-1">
                    <button onClick={togglePlay}>
                      {currentAudioStatus.isPlaying ? <FaPause /> : <FaPlay />}
                    </button>
                    <button onClick={() => setPreviousAudio(sourceItem.id)}>
                      <FaBackward />
                    </button>
                    <button onClick={() => setNextAudio(sourceItem.id)}>
                      <FaForward />
                    </button>
                    <button onClick={() => setTemporaryLoop("a")}>
                      <FaA color={currentAudioStatus.ALoop ? "red" : "white"} />
                    </button>
                    <button onClick={() => setTemporaryLoop("b")}>
                      <FaB color={currentAudioStatus.BLoop ? "red" : "white"} />
                    </button>
                    <button onClick={toggleLoop}>
                      <FaRotate
                        color={
                          currentAudioStatus.ALoop !== null &&
                          currentAudioStatus.BLoop !== null
                            ? currentAudioStatus.isLoop
                              ? "red"
                              : "white"
                            : "gray"
                        }
                      />
                    </button>
                  </div>
                </div>
              </>
            )}
            {items.length > 0 && (
              <div className="flex flex-col gap-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="text-sm cursor-pointer flex justify-between"
                    onClick={() => setCurrentItem(item)}
                  >
                    <span>{item.name || "Unknown"}</span>
                    <button onClick={() => deleteItem(item.id)}>
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="fixed-dummy" />
        </div>
        <div className={"fixed-footer"}>
          {sourceItem && (
            <>
              <audio
                ref={audioElement}
                {...(sourceItem && { src: sourceItem.src })}
                className="hidden"
                preload="metadata"
              />
              <div
                ref={seekBarElement}
                className="w-full h-10 bg-gray-300 relative cursor-pointer"
              >
                <div className="absolute z-30 top-0 left-0 flex justify-center items-center flex-row w-full h-full pointer-events-none">
                  <span ref={timeRef} className="text-sm">
                    00:00:00
                  </span>
                  <span className="text-sm"> / </span>
                  <span className="text-sm">
                    {currentTimeToHHMMSS(currentAudioStatus.duration)}
                  </span>
                </div>
                <div
                  className="absolute top-[-6px] w-[2px] h-[calc(100%+6px)] bg-yellow-300 translate-x-1/2 z-20"
                  style={{
                    left: `calc(${loopPosition.loopAPosition}% - 2px)`,
                    visibility: loopPosition.loopAPosition
                      ? "visible"
                      : "hidden",
                  }}
                />
                <div
                  className="absolute top-[-6px] w-[2px] h-[calc(100%+6px)] bg-cyan-300 translate-x-1/2 z-20"
                  style={{
                    left: `calc(${loopPosition.loopBPosition}% - 2px)`,
                    visibility: loopPosition.loopBPosition
                      ? "visible"
                      : "hidden",
                  }}
                />
                <div
                  ref={seekBarSeeker}
                  className="seeker bg-gray-500 h-full absolute left-0 top-0 z-10"
                >
                  <div className="absolute right-0 top-0 w-[4px] h-full bg-red-500 translate-x-1/2" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
