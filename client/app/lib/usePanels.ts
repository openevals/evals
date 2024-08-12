import { useState, useEffect, useRef } from 'react';
import { ImperativePanelHandle } from 'react-resizable-panels';

export default function usePanels(step: number) {
  const panel1Ref = useRef<ImperativePanelHandle>(null);
  const panel2Ref = useRef<ImperativePanelHandle>(null);
  const panel3Ref = useRef<ImperativePanelHandle>(null);
  const [panel2Collapsed, setPanel2Collapsed] = useState<boolean>(false);

  useEffect(() => {
    if (step === 2) {
      panel1Ref.current?.resize(30);
      panel2Ref.current?.resize(40);
      panel3Ref.current?.resize(30);
    }
  }, [step]);


  return [panel1Ref, panel2Ref, panel3Ref, panel2Collapsed, setPanel2Collapsed];

}