import { useEffect, useRef, useState } from 'react';
import { getEvalRun } from '../../utils/getEvalRun';


const FINISHED_STATUS = ['Failed', 'Finished'];

const useEvalResults = (evalId: number, evalRunIds: number[]) => {
  const [evalRuns, setEvalRuns] = useState<any[]>(evalRunIds.map((evalRunId: number) => {
    return {
      id: evalRunId,
      model: {
        id: 0,
        modelDeveloper: "",
        modelName: ""
      },
      systemPrompt: "",
      userPrompt: "",
      score: 0,
      datetime: "",
      validatorType: "",
      status: "",
      evalId: 0,
      taskInstanceOutputs: []
    }
  }))
  const evalRunsRef = useRef<any[]>()

  /* Keeps reference updated */
  useEffect(() => {
    evalRunsRef.current = evalRuns
  }, [evalRuns])

  /* Keep the object state updated */
  const updateObjState = (obj: any) => {
    /* Update object state */
    const newObjs: any[] = evalRunsRef.current!.map((value) => {
      return (value.id === obj.id) ? obj : value;
    });
    setEvalRuns(newObjs);
  }

  /* Poll the response of the eval run until the object get a finisehd status */
  const loadUntilFinished = async (evalRunId: number, latency: number) => {
    let itr = 0;
    let obj = await getEvalRun(evalId, evalRunId, 0)
    let lastStatus = obj.status;
    updateObjState(obj);
    while (!FINISHED_STATUS.includes(lastStatus)) {
      obj = await getEvalRun(evalId, evalRunId, latency + 1000 * itr);
      lastStatus = obj.status;
      itr += 1;
      updateObjState(obj);
    }
  }

  evalRunIds.forEach((id: number, idx: number) => {
    loadUntilFinished(id, 1000 * (idx + 1))
  });

  return { evalRuns };
}

export default useEvalResults;