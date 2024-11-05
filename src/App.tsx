import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaTrash } from "react-icons/fa6";
import AudioPlayer, { AudioSettings } from "./utils/audioPlayer";
import { useStorage } from "./utils/storage/useStorage";

type ISOString = string;
interface Item {
  id: string;
  name: string;
  audioFile: File;
  aToB: {
    id: string;
    title: string;
    a: number;
    b: number;
    createdAt: ISOString;
  }[];
}

function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  const firstRender = useRef(true);
  const { items, loading, error, addItem, deleteItem, updateItem } =
    useStorage<Item>("test", "test");

  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioPlayer = useRef<AudioPlayer | null>(null);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    loop: false,
    aToB: { a: null, b: null },
    volume: 0.1,
    muted: false,
    playbackRate: 1,
  });
  const changeAudio = useCallback((item: Item) => {
    if (audioPlayer.current) {
      setCurrentItem(item);
      audioPlayer.current.changeSrc(URL.createObjectURL(item.audioFile));
    }
  }, []);

  const updateAudioSettings = useCallback(
    (settings: Partial<typeof audioSettings>) => {
      if (audioRef.current && audioPlayer.current) {
        audioPlayer.current.setSettings(settings);
        setAudioSettings(audioPlayer.current.getSettings());
      }
    },
    []
  );
  const setA = useCallback(() => {
    if (audioPlayer.current) {
      const percent = audioPlayer.current.setA();
      console.log(percent);
      setAudioSettings(audioPlayer.current.getSettings());
    }
  }, []);
  const setB = useCallback(() => {
    if (audioPlayer.current) {
      const percent = audioPlayer.current.setB();
      console.log(percent);
      setAudioSettings(audioPlayer.current.getSettings());
    }
  }, []);
  const currentTimeToHHMMSS = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    if (hours > 0) return `${hours}:${minutes}:${seconds}`;
    if (minutes > 0) return `${minutes}:${seconds}`;
    return `${seconds}`;
  };
  const addAtoB = useCallback(
    (aToB: { a: number | null; b: number | null }) => {
      if (aToB.a === null || aToB.b === null) return;
      if (currentItem) {
        const currentDate = dayjs();
        // 만약 같은 값이 있다면 return;
        if (
          currentItem.aToB.some(
            (aToB) => aToB.a === aToB.a && aToB.b === aToB.b
          )
        )
          return;
        const newCurrentItem = {
          ...currentItem,
          aToB: [
            ...currentItem.aToB,
            {
              id: nanoid(),
              title: `${currentTimeToHHMMSS(aToB.a)} - ${currentTimeToHHMMSS(
                aToB.b
              )}`,
              createdAt: currentDate.toISOString(),
              a: aToB.a,
              b: aToB.b,
            },
          ],
        };
        setCurrentItem(newCurrentItem);
        updateItem(newCurrentItem);
      }
    },
    [currentItem, updateItem]
  );
  const deleteAtoB = useCallback(
    (id: string) => {
      if (currentItem) {
        const newCurrentItem = { ...currentItem };
        newCurrentItem.aToB = newCurrentItem.aToB.filter(
          (aToB) => aToB.id !== id
        );
        setCurrentItem(newCurrentItem);
        updateItem(newCurrentItem);
      }
    },
    [currentItem, updateItem]
  );
  const addAndSetCurrentItem = useCallback(
    async (item: Omit<Item, "id">) => {
      const newItem = await addItem(item);
      if (newItem) changeAudio(newItem);
    },
    [addItem, changeAudio]
  );
  useEffect(() => {
    if (audioRef.current) {
      audioPlayer.current = new AudioPlayer(audioRef.current);
      audioPlayer.current.init();
    }
  }, [audioRef]);

  useEffect(() => {
    if (items.length > 0 && firstRender.current) {
      const initialItem = items[0];
      changeAudio(initialItem);
      firstRender.current = false;
    }
  }, [items, changeAudio]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold text-blue-500">
          Hello, Tailwind CSS!
        </h1>
        <div className="flex flex-col gap-4">
          <div className="min-h-[150px] flex flex-col gap-4 bg-slate-200 p-4 rounded-md">
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  const file = e.target.files[0];
                  addAndSetCurrentItem({
                    name: file.name,
                    audioFile: file,
                    aToB: [],
                  });
                }
              }}
            />
            <button
              className="px-4 py-2 text-white bg-blue-500 rounded-md"
              onClick={() => inputRef.current?.click()}
            >
              Import
            </button>
            <div className="audio-player">
              <audio
                ref={audioRef}
                controls
                onLoadedMetadata={(e) => {
                  console.log(e);
                }}
              />
            </div>
            {currentItem && currentItem.name}
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            <button
              onClick={() => updateAudioSettings({ loop: !audioSettings.loop })}
            >
              {audioSettings.loop ? "Loop Off" : "Loop On"}
            </button>
            <button
              onClick={() =>
                updateAudioSettings({ muted: !audioSettings.muted })
              }
            >
              {audioSettings.muted ? "Muted Off" : "Muted On"}
            </button>
            <button onClick={setA}>Set A</button>
            <button onClick={setB}>Set B</button>
            <div>
              {"a: " + audioSettings.aToB.a}
              {", "}
              {"b: " + audioSettings.aToB.b}
              {audioSettings.aToB.a !== null &&
                audioSettings.aToB.b !== null && (
                  <button
                    onClick={() => addAtoB(audioSettings.aToB)}
                    className="px-4 py-2 text-white bg-blue-500 rounded-md"
                  >
                    Add AtoB
                  </button>
                )}
            </div>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto h-[400px] bg-slate-200 p-4 rounded-md">
            {currentItem?.aToB?.map((aToB) => (
              <button
                key={aToB.id}
                className="flex items-center justify-between gap-2 line-clamp-1"
                onClick={() => {
                  updateAudioSettings({
                    aToB: { a: aToB.a, b: aToB.b },
                  });
                }}
              >
                <span>{aToB.title}</span>
                <span>{aToB.createdAt}</span>
                <div
                  className="p-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteAtoB(aToB.id);
                  }}
                >
                  <FaTrash color="#373737" />
                </div>
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto h-[400px] bg-slate-200 p-4 rounded-md">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => changeAudio(item)}
                className="flex justify-between line-clamp-1 items-center gap-1 px-3 py-1.5 border border-gray-500 rounded-md hover:bg-blue-200 hover:border-blue-500 transition-colors"
              >
                <span>{item.name}</span>
                <div
                  className="p-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteItem(item.id);
                  }}
                >
                  <FaTrash color="#373737" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
