import * as React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/react-table";


type Run = {
  model: string;
  averageScore: number;
  status: string;
};

type Input = {
  model: string;
  response: string;
};

type ModelResponse = {
  input: string;
  modelResponse: string;
  ideal: string;
};

type Summary = {
  model: string;
  nRuns: number;
  averageScore: number;
  ranBy: string;
  dateLastRan: string;
};

export const runsData: Run[] = [
  {
    model: "GPT-3.5",
    averageScore: 0.85,
    status: "Completed"
  },
  {
    model: "GPT-4",
    averageScore: 0.92,
    status: "In Progress"
  },
  {
    model: "BERT",
    averageScore: 0.78,
    status: "Completed"
  },
  {
    model: "T5",
    averageScore: 0.81,
    status: "Completed"
  }
];


export const inputData: Input[] = [
  {
    model: "GPT-3.5",
    response: "The capital of France is Paris."
  },
  {
    model: "GPT-4",
    response: "The largest planet in our solar system is Jupiter."
  },
  {
    model: "BERT",
    response: "Water boils at 100 degrees Celsius at sea level."
  },
  {
    model: "T5",
    response: "The Great Wall of China is visible from space."
  }
];

export const modelResponseData: ModelResponse[] = [
  {
    input: "What is the capital of France?",
    modelResponse: "The capital of France is Paris.",
    ideal: "Paris"
  },
  {
    input: "What is the largest planet in our solar system?",
    modelResponse: "The largest planet in our solar system is Jupiter.",
    ideal: "Jupiter"
  },
  {
    input: "At what temperature does water boil at sea level?",
    modelResponse: "Water boils at 100 degrees Celsius at sea level.",
    ideal: "100 degrees Celsius"
  },
  {
    input: "Is the Great Wall of China visible from space?",
    modelResponse: "The Great Wall of China is visible from space.",
    ideal: "No, it is not easily visible from space without aid."
  }
];

export const summaryData: Summary[] = [
  {
    model: "GPT-3.5",
    nRuns: 100,
    averageScore: 0.85,
    ranBy: "Alice",
    dateLastRan: "2023-06-15"
  },
  {
    model: "GPT-4",
    nRuns: 50,
    averageScore: 0.92,
    ranBy: "Bob",
    dateLastRan: "2023-06-14"
  },
  {
    model: "BERT",
    nRuns: 75,
    averageScore: 0.78,
    ranBy: "Charlie",
    dateLastRan: "2023-06-13"
  },
  {
    model: "T5",
    nRuns: 60,
    averageScore: 0.81,
    ranBy: "Diana",
    dateLastRan: "2023-06-12"
  }
];



const runColumnHelper = createColumnHelper<Run>();
const inputColumnHelper = createColumnHelper<Input>();
const modelColumnHelper = createColumnHelper<ModelResponse>();
const summaryColumnHelper = createColumnHelper<Summary>();

export const runsColumns = [
  runColumnHelper.accessor("model", {
    cell: (info) => info.getValue(),
    header: "Model"
  }),
  runColumnHelper.accessor("averageScore", {
    cell: (info) => info.getValue(),
    header: "Average score (0-1)",
    meta: {
      isNumeric: true
    }
  }),
  runColumnHelper.accessor("status", {
    cell: (info) => info.getValue(),
    header: "Status"
  })
];

export const inputColumns = [
  inputColumnHelper.accessor("model", {
    cell: (info) => info.getValue(),
    header: "Model"
  }),
  inputColumnHelper.accessor("response", {
    cell: (info) => info.getValue(),
    header: "Response"
  })
];

export const modelColumns = [
  modelColumnHelper.accessor("input", {
    cell: (info) => info.getValue(),
    header: "Input"
  }),
  modelColumnHelper.accessor("modelResponse", {
    cell: (info) => info.getValue(),
    header: "Model response"
  }),
  modelColumnHelper.accessor("ideal", {
    cell: (info) => info.getValue(),
    header: "Ideal Output"
  })
];

export const summaryColumns = [
  summaryColumnHelper.accessor("model", {
    cell: (info) => info.getValue(),
    header: "Model"
  }),
  summaryColumnHelper.accessor("nRuns", {
    cell: (info) => info.getValue(),
    header: "Runs",
    meta: {
      isNumeric: true
    }
  }),
  summaryColumnHelper.accessor("averageScore", {
    cell: (info) => info.getValue(),
    header: "Average score (0-1)",
    meta: {
      isNumeric: true
    }
  }),
  summaryColumnHelper.accessor("ranBy", {
    cell: (info) => info.getValue(),
    header: "Ran by"
  }),
  summaryColumnHelper.accessor("dateLastRan", {
    cell: (info) => info.getValue(),
    header: "Date Last Ran"
  })
];
