import { useEffect, useRef, useState } from "react";
import { getEvalRun } from "../../utils/getEvalRun";
import { IEvalRunResponse } from "../types";

const FINISHED_STATUS = ["Failed", "Done"];

const useEvalResults = (evalId: number, evalRunIds: number[]) => {
  const [evalRuns, setEvalRuns] = useState<IEvalRunResponse[]>([]);
  const [allRunsCompleted, setAllRunsCompleted] = useState(false);
  const evalRunsRef = useRef<any[]>();
  const waitResultsRef = useRef(false);

  /* Keeps reference updated */
  useEffect(() => {
    evalRunsRef.current = evalRuns;
  }, [evalRuns]);

  /* Keep the object state updated */
  const updateObjState = (obj: IEvalRunResponse) => {
    if (!evalRunsRef.current) return;
    /* Update object state */
    setEvalRuns((prevData: IEvalRunResponse[]) => {
      return prevData.map((value: IEvalRunResponse) => {
        return value.id === obj.id ? obj : value;
      });
    });
  };

  useEffect(() => {
    /* Ensure that actions are called only once */
    waitResultsRef.current = true;

    if (evalRunIds.length === 0) return;

    let completedRuns = 0;

    /* Poll the response of the eval run until the object get a finisehd status */
    const loadUntilFinished = async (evalRunId: number, latency: number) => {
      let itr = 0;
      let obj = await getEvalRun(evalId, evalRunId, 0);
      let lastStatus = obj.status;
      updateObjState(obj);
      while (waitResultsRef.current && !FINISHED_STATUS.includes(lastStatus)) {
        obj = await getEvalRun(evalId, evalRunId, latency + 1000 * itr);
        lastStatus = obj.status;
        itr += 1;
        updateObjState(obj);
      }
      completedRuns++;
      if (completedRuns === evalRunIds.length) {
        setAllRunsCompleted(true);
        waitResultsRef.current = false;
      }
    };

    const newObjs = evalRunIds.map((evalRunId: number) => {
      return {
        id: evalRunId,
        model: {
          id: 0,
          modelDeveloper: "",
          modelName: "",
        },
        systemPrompt: "",
        userPrompt: "",
        score: 0,
        datetime: "",
        validatorType: "",
        status: "",
        evalId: 0,
        taskInstanceOutputs: [],
      };
    });
    setEvalRuns(newObjs);

    evalRunIds.forEach((id: number, idx: number) => {
      loadUntilFinished(id, 1000 * (idx + 1));
    });

    return () => {
      waitResultsRef.current = false;
    };
  }, [evalId, evalRunIds]);

  return { evalRuns, allRunsCompleted };
};

export default useEvalResults;
