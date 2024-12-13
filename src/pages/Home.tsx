import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaCircle,
  FaFastBackward,
  FaFastForward,
  FaMinusCircle,
  FaPlusCircle,
  FaTimes,
} from "react-icons/fa";
import {
  FaA,
  FaB,
  FaClockRotateLeft,
  FaList,
  FaPause,
  FaPlay,
  FaPlus,
  FaRotate,
  FaTrash,
} from "react-icons/fa6";
import ControlButton from "../components/ControlButton";
import ListItem from "../components/ListItem";
import Modal from "../components/Modal";
import TopButton from "../components/TopButton";
import { useAudioPlayer } from "../utils/audioPlayer/useAudioPlayer";
import { currentTimeToHHMMSS } from "../utils/helpers/parser";
import Layout from "./Layout";
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
    resetLoop,
    currentAudioStatus,
    togglePlay,
    items,
    setPreviousAudio,
    deleteItems,
    setCurrentItem,
    setNextAudio,
    setTemporaryLoop,
    addTemporaryLoop,
    toggleLoop,
    setPlaybackRate,
    addPlaybackRate,
    addAToBLoop,
    setLoop,
    deleteAToBLoops,
    addCurrentTime,
    syncCurrentItem,
  } = useAudioPlayer(
    audioElement.current,
    seekBarElement.current,
    seekBarSeeker.current,
    timeRef.current
  );

  const [values, setValues] = useState<{
    currentAtoB: "a" | "b" | null;
    addTime: number;
  }>({ currentAtoB: null, addTime: 0.5 });

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
  const titleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX - (titleRef.current?.offsetLeft || 0));
    setScrollLeft(titleRef.current?.scrollLeft || 0);
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    const x = clientX - (titleRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1;
    if (titleRef.current) {
      titleRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    handleStart(e.pageX);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleMove(e.pageX);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    handleMove(e.touches[0].clientX);
  };

  const [editMode, setEditMode] = useState<"sources" | "loop" | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleEditMode = (mode: "sources" | "loop" | null, itemId?: string) => {
    setEditMode(mode);
    if (itemId) {
      setSelectedIds(new Set([itemId]));
    } else {
      setSelectedIds(new Set());
    }
  };
  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  return (
    <>
      <div
        className={clsx("fixed top-0 left-0 w-full z-[51]", {
          "-translate-y-full": editMode === null,
          "translate-y-0": editMode !== null,
        })}
      >
        <div className="flex items-center justify-between w-full p-4 bg-slate-200 text-slate-700">
          <TopButton icon={FaTimes} onClick={() => handleEditMode(null)} />
          <div className="flex items-center justify-end flex-1 gap-2">
            <TopButton
              icon={FaTrash}
              color={selectedIds.size > 0 ? "#a80f0f" : "#a6a6a6cc"}
              onClick={() => {
                if (editMode === "loop") {
                  deleteAToBLoops(Array.from(selectedIds));
                }
                if (editMode === "sources") {
                  deleteItems(Array.from(selectedIds));
                }
                setSelectedIds(new Set());
                setEditMode(null);
              }}
            />
          </div>
        </div>
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        {items.length > 0 && (
          <div className="flex flex-col gap-1 pb-4 max-h-[300px] overflow-y-auto">
            {items.map((item) => (
              <ListItem
                key={item.id}
                item={item}
                onClick={() => {
                  if (editMode === "sources") {
                    toggleSelected(item.id);
                  } else {
                    setCurrentItem(item);
                    setModalOpen(false);
                  }
                }}
                onEditMode={() => {
                  handleEditMode("sources", item.id);
                }}
                selected={selectedIds.has(item.id)}
                selectedMode={editMode === "sources"}
              />
            ))}
          </div>
        )}
      </Modal>
      <Modal open={aToBModalOpen} onClose={() => setAtoBModalOpen(false)}>
        {sourceItem?.aToB?.map((item) => (
          <ListItem
            key={item.id}
            item={item}
            onClick={() => {
              if (editMode === "loop") {
                toggleSelected(item.id);
              } else {
                setLoop(item.a, item.b);
                setAtoBModalOpen(false);
              }
            }}
            onEditMode={() => {
              handleEditMode("loop", item.id);
            }}
            selected={selectedIds.has(item.id)}
            selectedMode={editMode === "loop"}
          />
        ))}
      </Modal>
      <Layout>
        <div className="flex justify-between w-full px-4 py-6 border-b border-gray-700">
          <div className="text-2xl font-bold">Audio Player</div>
          <div className="flex flex-row gap-2">
            <button
              onClick={() => {
                inputRef.current?.click();
              }}
              className="flex flex-row items-center gap-1 px-4 py-2 rounded-md bg-slate-600"
            >
              <FaPlus /> Audio
            </button>
            <button
              onClick={async () => {
                if (!sourceItem) return;
                await syncCurrentItem(sourceItem?.id || "");
                setAtoBModalOpen(true);
              }}
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
        <div
          ref={titleRef}
          className="w-full overflow-x-auto text-lg select-none no-scrollbar cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleEnd}
          onTouchCancel={handleEnd}
          onTouchMove={handleTouchMove}
        >
          <div className="inline-block px-4 py-4 whitespace-nowrap">
            {sourceItem ? sourceItem?.fileName : "등록된 오디오가 없습니다."}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 min-h-fit">
          {sourceItem && (
            <>
              <div className="flex flex-col items-center w-full gap-4">
                <div className="flex flex-row gap-4 child-flex-1">
                  <ControlButton
                    icon={FaFastBackward}
                    onClick={() => setPreviousAudio(sourceItem.id)}
                  />
                  <ControlButton
                    onClick={() => addCurrentTime(-values.addTime)}
                  >
                    -{values.addTime}
                  </ControlButton>
                  <ControlButton
                    icon={currentAudioStatus.isPlaying ? FaPause : FaPlay}
                    onClick={togglePlay}
                  />
                  <ControlButton onClick={() => addCurrentTime(values.addTime)}>
                    +{values.addTime}
                  </ControlButton>
                  <ControlButton
                    icon={FaFastForward}
                    onClick={() => setNextAudio(sourceItem.id)}
                  />
                </div>
                <div className="flex flex-row gap-4 child-flex-1">
                  <ControlButton
                    icon={FaMinusCircle}
                    onClick={() => addPlaybackRate(-0.1)}
                    color={
                      currentAudioStatus.playbackRate < 1
                        ? `rgba(255, 71, 71, ${
                            0.5 +
                            ((1 - currentAudioStatus.playbackRate) / 0.9) * 0.5
                          })`
                        : "white"
                    }
                  />
                  <ControlButton
                    icon={FaCircle}
                    onClick={() => setPlaybackRate(1)}
                  >
                    <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full text-sm font-bold text-black">
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
                <div className="flex flex-row w-full gap-4 child-flex-1">
                  <ControlButton
                    icon={FaA}
                    onClick={() => {
                      setTemporaryLoop("a");
                    }}
                    color={currentAudioStatus.ALoop !== null ? "red" : "white"}
                  />
                  <ControlButton
                    icon={FaB}
                    onClick={() => {
                      setTemporaryLoop("b");
                    }}
                    color={currentAudioStatus.BLoop !== null ? "red" : "white"}
                  />
                  <ControlButton
                    icon={FaClockRotateLeft}
                    onClick={() => {
                      resetLoop();
                      setValues((prev) => ({
                        ...prev,
                        currentAtoB: null,
                      }));
                    }}
                    color="white"
                  />
                </div>
                <div className="flex flex-row gap-4 child-flex-1">
                  <ControlButton
                    onClick={() => {
                      if (currentAudioStatus.ALoop === null) return;
                      setValues((prev) => ({
                        ...prev,
                        currentAtoB: prev.currentAtoB === "a" ? null : "a",
                      }));
                    }}
                    disabled={currentAudioStatus.ALoop === null}
                    color={
                      currentAudioStatus.ALoop === null
                        ? "gray"
                        : values.currentAtoB === "a"
                        ? "cyan"
                        : "white"
                    }
                  >
                    A
                  </ControlButton>
                  <ControlButton
                    onClick={() => {
                      if (currentAudioStatus.BLoop === null) return;
                      setValues((prev) => ({
                        ...prev,
                        currentAtoB: prev.currentAtoB === "b" ? null : "b",
                      }));
                    }}
                    disabled={currentAudioStatus.BLoop === null}
                    color={
                      currentAudioStatus.BLoop === null
                        ? "gray"
                        : values.currentAtoB === "b"
                        ? "cyan"
                        : "white"
                    }
                  >
                    B
                  </ControlButton>
                  <ControlButton
                    onClick={() => {
                      if (values.currentAtoB === null) return;
                      addTemporaryLoop(values.currentAtoB, -values.addTime);
                    }}
                    color={values.currentAtoB ? "white" : "gray"}
                  >
                    -{values.addTime}
                  </ControlButton>
                  <ControlButton
                    onClick={() => {
                      if (values.currentAtoB === null) return;
                      addTemporaryLoop(values.currentAtoB, values.addTime);
                    }}
                    color={values.currentAtoB ? "white" : "gray"}
                  >
                    {values.addTime}
                  </ControlButton>
                </div>
                <div className="flex flex-row w-full gap-4 child-flex-1">
                  <ControlButton
                    className="flex-1 gap-2"
                    icon={FaPlus}
                    onClick={addAToBLoop}
                    size={16}
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
                  <ControlButton
                    icon={FaRotate}
                    onClick={toggleLoop}
                    color={currentAudioStatus.isLoop ? "red" : "white"}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </Layout>
      <div className={"fixed-footer"}>
        <div
          ref={seekBarElement}
          style={{
            display: sourceItem ? "block" : "none",
          }}
          className="relative w-full h-10 bg-gray-800 cursor-pointer select-none"
        >
          <div className="absolute top-0 left-0 z-30 flex flex-row items-center justify-center w-full h-full pointer-events-none">
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
            className="absolute top-0 left-0 z-10 h-full bg-gray-500 seeker"
          >
            <div className="absolute right-0 top-0 w-[4px] h-full bg-red-500 translate-x-1/2" />
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
