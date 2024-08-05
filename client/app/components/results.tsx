import ResultItem from "./result";
import dummyData from "../utils/dummyData.json";

const { evals, task_instances, eval_runs } = dummyData;


export default function Results() {
  return (
    <>
      {evals.map((result, index) => (
        <ResultItem
          key={index}
          name={result.name}
          description={result.description}
        />
      ))} 
    </>
  )
}