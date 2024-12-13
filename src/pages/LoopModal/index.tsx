import { useEffect, useState } from "react";
import ListItem from "../../components/ListItem";
import Modal from "../../components/Modal";
import ModalListEditor from "../../components/ModalListEditor";
import {
  audioDbConfigs,
  audioInitialItem,
  AudioItemType,
  audioStorage,
} from "../../utils/storage/audioStorage";
import { useStorage } from "../../utils/storage/useStorage";

export default function LoopModal({
  open,
  onClose,
  onChangeLoop,
  onEditMode,
  id,
}: {
  open: boolean;
  id: string;
  onClose: () => void;
  onChangeLoop: (a: number, b: number) => void;
  onEditMode: () => void;
}) {
  const { deleteItems } = useStorage<AudioItemType>(
    audioInitialItem,
    audioDbConfigs
  );
  const [editMode, setEditMode] = useState<boolean>(false);
  const [sourceItem, setSourceItem] = useState<AudioItemType | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
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
  useEffect(() => {
    async function getAudioItem() {
      const item = await audioStorage.get(id);
      setSourceItem(item);
    }
    if (id) getAudioItem();
  }, [id]);
  if (!sourceItem) return null;
  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalListEditor
          editMode={editMode}
          editAble={selectedIds.size > 0}
          onClose={() => {
            setEditMode(false);
          }}
          onDelete={() => {
            deleteItems(Array.from(selectedIds));
            setEditMode(false);
          }}
        />
        {sourceItem?.aToB?.map((item) => (
          <ListItem
            key={item.id}
            item={item}
            onClick={() => {
              if (editMode) {
                toggleSelected(item.id);
              } else {
                onChangeLoop(item.a, item.b);
                onClose();
              }
            }}
            onEditMode={onEditMode}
            selected={selectedIds.has(item.id)}
            selectedMode={editMode}
          />
        ))}
      </Modal>
    </>
  );
}
