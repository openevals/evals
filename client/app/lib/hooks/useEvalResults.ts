import { useEffect, useRef, useState } from 'react';
import { getEvalRun } from '../../utils/getEvalRun';


const FINISHED_STATUS = ['Failed', 'Finished'];

const useEvalResults = (evalId: number, evalRunIds: number[]) => {
  const [evalRuns, setEvalRuns] = useState<any[]>([])
  const evalRunsRef = useRef<any[]>()

  console.log("HOOK", evalId, evalRunIds)

  /* Keeps reference updated */
  useEffect(() => {
    evalRunsRef.current = evalRuns
    console.log("Setting state")
  }, [evalRuns])

  /* Keep the object state updated */
  const updateObjState = (obj: any) => {
    if (!evalRunsRef.current) return;
    /* Update object state */
    const newObjs: any[] = evalRunsRef.current!.map((value) => {
      return (value.id === obj.id) ? obj : value;
    });
    setEvalRuns([...newObjs]);
  }


  useEffect(() => {
    if (evalRunIds.length === 0) return;

    /* Poll the response of the eval run until the object get a finisehd status */
    const loadUntilFinished = async (evalRunId: number, latency: number) => {
      let itr = 0;
      let obj = await getEvalRun(evalId, evalRunId, 0)
      let lastStatus = obj.status;
      console.log(lastStatus);
      updateObjState(obj);
      while (!FINISHED_STATUS.includes(lastStatus)) {
        obj = await getEvalRun(evalId, evalRunId, latency + 1000 * itr);
        lastStatus = obj.status;
        itr += 1;
        updateObjState(obj);

      }
    }

    const newObjs = evalRunIds.map((evalRunId: number) => {
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
    });
    setEvalRuns(newObjs);

    evalRunIds.forEach((id: number, idx: number) => {
      loadUntilFinished(id, 1000 * (idx + 1))
    });

    return () => { }
  }, [evalId, evalRunIds])


  return { evalRuns };
}

export default useEvalResults;