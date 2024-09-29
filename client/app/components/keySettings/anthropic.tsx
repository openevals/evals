
import { useModelStorageContext } from '@/app/lib/providers/model-storage';
import BaseKeysSettings from './baseKeySettings';

export default function AnthropicKeysSettings() {
  const { anthropicKey, setAnthropicKey } = useModelStorageContext();

  return (
    <BaseKeysSettings provider="anthropic" aiKey={anthropicKey} setAiKey={setAnthropicKey} />
  );
}
