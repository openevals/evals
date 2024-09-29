import { useModelStorageContext } from '@/app/lib/providers/model-storage';
import BaseKeysSettings from './baseKeySettings';

export default function GeminiKeysSettings() {
  const { geminiKey, setGeminiKey } = useModelStorageContext();

  return (
    <BaseKeysSettings provider="google" aiKey={geminiKey} setAiKey={setGeminiKey} />
  );
}
