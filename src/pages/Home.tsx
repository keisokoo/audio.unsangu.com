import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaCircle, FaMinusCircle, FaPlusCircle } from "react-icons/fa";
import {
  FaA,
  FaB,
  FaBackward,
  FaClockRotateLeft,
  FaForward,
  FaList,
  FaPause,
  FaPlay,
  FaPlus,
  FaRotate,
  FaTrash,
} from "react-icons/fa6";
import ControlButton from "../components/ControlButton";
import Modal from "../components/Modal";
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
    setPlaybackRate,
    addPlaybackRate,
    addAToBLoop,
    setLoop,
    deleteAToBLoop,
    addCurrentTime,
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
  }, [sourceItem]);

  const loopPosition = useMemo(() => {
    let loopAPosition: number | null = null;
    let loopBPosition: number | null = null;
    const duration = currentAudioStatus?.duration || 0;
    if (currentAudioStatus.ALoop !== null) {
      loopAPosition = (currentAudioStatus.ALoop / duration) * 100;
    }
    if (currentAudioStatus.BLoop !== null) {
      loopBPosition = (currentAudioStatus.BLoop / duration) * 100;
    }
    return { loopAPosition, loopBPosition };
  }, [currentAudioStatus]);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [aToBModalOpen, setAtoBModalOpen] = useState<boolean>(false);
  const [isOverflow, setIsOverflow] = useState<boolean>(false);
  const titleRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrolling, setIsScrolling] = useState(true);
  const [direction, setDirection] = useState<"right" | "left">("left");
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    const marqueeText = titleRef.current;
    if (marqueeText) {
      const isOverflowing = marqueeText.scrollWidth > marqueeText.clientWidth;
      setIsOverflow(isOverflowing);

      if (isOverflowing && isScrolling && !isPaused) {
        const scrollWidth = marqueeText.scrollWidth - marqueeText.clientWidth;
        const animate = () => {
          setScrollPosition((prev) => {
            const step = direction === "left" ? 1 : -1;
            const newPosition = prev + step;

            if (newPosition >= scrollWidth) {
              setIsPaused(true);
              setTimeout(() => {
                setDirection("right");
                setIsPaused(false);
              }, 1500);
              return scrollWidth;
            }
            if (newPosition <= 0) {
              setIsPaused(true);
              setTimeout(() => {
                setDirection("left");
                setIsPaused(false);
              }, 1500);
              return 0;
            }
            return newPosition;
          });
          animationRef.current = requestAnimationFrame(animate);
        };
        animationRef.current = requestAnimationFrame(animate);

        return () => {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
        };
      }
    }
  }, [sourceItem?.fileName, isScrolling, direction, isPaused]);

  return (
    <>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        {items.length > 0 && (
          <div className="flex flex-col gap-1 pb-4 max-h-[300px] overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.id}
                className="text-sm cursor-pointer flex justify-between px-4 py-2 gap-2 overflow-hidden text-ellipsis"
                onClick={() => {
                  setCurrentItem(item);
                  setModalOpen(false);
                }}
              >
                <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.name || "Unknown"}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteItem(item.id);
                  }}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal>
      <Modal open={aToBModalOpen} onClose={() => setAtoBModalOpen(false)}>
        {sourceItem?.aToB?.map((item) => (
          <div
            key={item.id}
            className="text-sm cursor-pointer flex justify-between px-4 py-2 gap-2 overflow-hidden text-ellipsis"
            onClick={() => {
              setLoop(item.a, item.b);
              setAtoBModalOpen(false);
            }}
          >
            <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
              {item.title || "Unknown"}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteAToBLoop(item.id);
              }}
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </Modal>
      <div className="main-container">
        <div className="inner-container">
          <div className="flex justify-between w-full py-6 px-4 border-b border-gray-700">
            <div className="text-2xl font-bold">Audio Player</div>
            <div className="flex flex-row gap-2">
              <button
                onClick={() => {
                  inputRef.current?.click();
                }}
                className="px-4 py-2 rounded-md bg-slate-600 flex flex-row gap-1 items-center"
              >
                <FaPlus /> Audio
              </button>
              <button
                onClick={() => setAtoBModalOpen(true)}
                className={clsx("px-4 py-2 rounded-md bg-slate-600", {
                  "opacity-50": !sourceItem?.aToB?.length,
                })}
                disabled={!sourceItem?.aToB?.length}
              >
                <FaClockRotateLeft />
              </button>
              <button
                onClick={() => setModalOpen(true)}
                className={clsx("px-4 py-2 rounded-md bg-slate-600", {
                  "opacity-50": !items.length,
                })}
                disabled={!items.length}
              >
                <FaList />
              </button>
            </div>
          </div>
          <div ref={titleRef} className="text-lg marquee-container py-4 px-4">
            <div
              className="marquee-text"
              style={{
                transform: `translateX(-${scrollPosition}px)`,
                cursor: isOverflow ? "pointer" : "default",
              }}
              onClick={() => setIsScrolling(!isScrolling)}
            >
              {sourceItem ? sourceItem?.fileName : "등록된 오디오가 없습니다."}
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center min-h-fit">
            {sourceItem && (
              <>
                <div className="flex flex-col items-center gap-4">
                  <div className="flex flex-row gap-4">
                    <ControlButton
                      icon={FaBackward}
                      onClick={() => {
                        addCurrentTime(-3);
                      }}
                    />
                    <ControlButton
                      icon={currentAudioStatus.isPlaying ? FaPause : FaPlay}
                      onClick={togglePlay}
                    />
                    <ControlButton
                      icon={FaForward}
                      onClick={() => {
                        addCurrentTime(3);
                      }}
                    />
                  </div>
                  <div className="flex flex-row gap-4">
                    <ControlButton
                      icon={FaMinusCircle}
                      onClick={() => addPlaybackRate(-0.1)}
                      color={
                        currentAudioStatus.playbackRate < 1
                          ? `rgba(255, 71, 71, ${
                              0.5 +
                              ((1 - currentAudioStatus.playbackRate) / 0.9) *
                                0.5
                            })`
                          : "white"
                      }
                    />
                    <ControlButton
                      icon={FaCircle}
                      onClick={() => setPlaybackRate(1)}
                    >
                      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-black text-sm font-bold">
                        {currentAudioStatus.playbackRate.toFixed(1)}
                      </div>
                    </ControlButton>
                    <ControlButton
                      icon={FaPlusCircle}
                      onClick={() => addPlaybackRate(0.1)}
                      color={
                        currentAudioStatus.playbackRate > 1
                          ? `rgba(255, 71, 71, ${
                              0.5 +
                              ((currentAudioStatus.playbackRate - 1.1) / 0.9) *
                                0.5
                            })`
                          : "white"
                      }
                    />
                  </div>
                  <div className="w-full h-[1px] bg-gray-700" />
                  <div className="flex flex-row gap-4">
                    <ControlButton
                      icon={FaA}
                      onClick={() => setTemporaryLoop("a")}
                      color={
                        currentAudioStatus.ALoop !== null ? "red" : "white"
                      }
                    />
                    <ControlButton
                      icon={FaB}
                      onClick={() => setTemporaryLoop("b")}
                      color={
                        currentAudioStatus.BLoop !== null ? "red" : "white"
                      }
                    />
                    <ControlButton
                      icon={FaRotate}
                      onClick={toggleLoop}
                      color={
                        currentAudioStatus.ALoop !== null &&
                        currentAudioStatus.BLoop !== null
                          ? currentAudioStatus.isLoop
                            ? "red"
                            : "white"
                          : "gray"
                      }
                    />
                  </div>
                  <div className="flex flex-row gap-4 w-full">
                    <ControlButton
                      className="flex-1 gap-2"
                      icon={FaPlus}
                      onClick={addAToBLoop}
                      size={24}
                      disabled={
                        currentAudioStatus.ALoop === null ||
                        currentAudioStatus.BLoop === null
                      }
                      color={
                        currentAudioStatus.ALoop === null ||
                        currentAudioStatus.BLoop === null
                          ? "gray"
                          : "white"
                      }
                    >
                      <div
                        className={clsx("text-gray-400", {
                          "text-white":
                            currentAudioStatus.ALoop !== null &&
                            currentAudioStatus.BLoop !== null,
                        })}
                      >
                        Add Loop
                      </div>
                    </ControlButton>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="fixed-dummy" />
        </div>
        <div className={"fixed-footer"}>
          <div
            ref={seekBarElement}
            style={{
              display: sourceItem ? "block" : "none",
            }}
            className="w-full h-10 bg-gray-800 relative cursor-pointer select-none"
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
                visibility:
                  loopPosition.loopAPosition !== null ? "visible" : "hidden",
              }}
            />
            <div
              className="absolute top-[-6px] w-[2px] h-[calc(100%+6px)] bg-cyan-300 translate-x-1/2 z-20"
              style={{
                left: `calc(${loopPosition.loopBPosition}% - 2px)`,
                visibility:
                  loopPosition.loopBPosition !== null ? "visible" : "hidden",
              }}
            />
            <div
              ref={seekBarSeeker}
              className="seeker bg-gray-500 h-full absolute left-0 top-0 z-10"
            >
              <div className="absolute right-0 top-0 w-[4px] h-full bg-red-500 translate-x-1/2" />
            </div>
          </div>
        </div>
      </div>
      <audio
        ref={audioElement}
        {...(sourceItem && { src: sourceItem.src })}
        className="hidden"
        preload="metadata"
      />
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
    </>
  );
}
