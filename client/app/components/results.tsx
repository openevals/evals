import ResultItem from "./resultItem";
import { getEvals } from "../utils/getEvals";
import { useState, useEffect } from "react";

export default function Results() {
  const [evals, setEvals] = useState([]);

  useEffect(() => {
    const retrieveEvals = async () => {
      const ev = await getEvals();
      setEvals(ev);
    };
    retrieveEvals()
  }, []);

  return (
    <>
      {evals.map(({
        name, description, validatorType
      }) => (
        <ResultItem
          key={name}
          name={name}
          description={description}
          validatorType={validatorType}
        />
      ))} 
    </>
  )
}