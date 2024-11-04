import { useCallback, useEffect, useRef, useState } from "react";
import { useStorage } from "./utils/storage/useStorage";

interface Item {
  id: string;
  name: string;
  audioFile: File;
}

const defaultAudioSettings = {
  loop: false,
  aToB: { a: 0, b: 0 },
  volume: 0.2,
  muted: false,
  playbackRate: 1,
};

function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { items, loading, error, addItem, deleteItem } = useStorage<Item>(
    "test",
    "test"
  );
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const audioPlayer = useRef<HTMLAudioElement | null>(null);
  const [audioSettings] = useState<{
    loop: boolean;
    aToB: { a: number; b: number };
    volume: number;
    muted: boolean;
    playbackRate: number;
  }>({
    loop: false,
    aToB: { a: 0, b: 0 },
    volume: 0.1,
    muted: false,
    playbackRate: 1,
  });

  useEffect(() => {
    if (items.length > 0) {
      const initialItem = items[0];
      setCurrentItem(initialItem);
    }
  }, [items]);

  const updateAudioSettings = useCallback(
    (settings: Partial<typeof audioSettings>) => {
      if (audioPlayer.current) {
        audioPlayer.current.loop = settings.loop ?? defaultAudioSettings.loop;
        audioPlayer.current.volume =
          settings.volume ?? defaultAudioSettings.volume;
        audioPlayer.current.muted =
          settings.muted ?? defaultAudioSettings.muted;
        audioPlayer.current.playbackRate =
          settings.playbackRate ?? defaultAudioSettings.playbackRate;
      }
    },
    []
  );
  useEffect(() => {
    updateAudioSettings(audioSettings);
  }, [audioSettings, updateAudioSettings]);

  return (
    <div className="min-h-screen flex items-center flex-col justify-center bg-gray-100">
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
                  addItem({
                    name: file.name,
                    audioFile: file,
                  });
                }
              }}
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
              onClick={() => inputRef.current?.click()}
            >
              Import
            </button>
            <div className="audio-player">
              <audio
                ref={audioPlayer}
                {...(currentItem?.audioFile && {
                  src: URL.createObjectURL(currentItem?.audioFile),
                })}
                controls
                onLoadedMetadata={() => {}}
              />
            </div>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto h-[400px] bg-slate-200 p-4 rounded-md">
            {items.map((item) => (
              <div key={item.id} className="flex gap-1">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded-md"
                  onClick={() => setCurrentItem(item)}
                >
                  {item.name}
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded-md"
                  onClick={() => deleteItem(item.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
