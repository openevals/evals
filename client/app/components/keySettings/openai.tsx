import { useModelStorageContext } from '@/app/lib/providers/model-storage';
import BaseKeysSettings from './baseKeySettings';

export default function OpenAIKeysSettings() {
  const { openAIKey, setOpenAIKey } = useModelStorageContext();

  return (
    <BaseKeysSettings provider="openai" aiKey={openAIKey} setAiKey={setOpenAIKey} />
  );
}
