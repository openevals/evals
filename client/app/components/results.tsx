import ResultItem from "./result";
import dummyData from "../utils/dummyData.json";
import { Box } from "@chakra-ui/react";

const { evals } = dummyData;


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