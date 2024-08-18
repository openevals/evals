import { createSlice } from '@reduxjs/toolkit';
import { IModelResponse, IEvalListItemResponse, IEvalResponse } from '../types';

const initialState: {
  models: IModelResponse[];
  evals: IEvalListItemResponse[];
  search: string;
  evalToTry?: IEvalResponse;
} = {
  models: [],
  evals: [],
  search: '',
  evalToTry: undefined
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setModels(state, action) {
      state.models = action.payload;
    },
    setEvals(state, action) {
      state.evals = action.payload;
    },
    addNewEval(state, action) {
      state.evals = [...state.evals, {
        id: action.payload.id,
        name: action.payload.name,
        description: action.payload.description,
        validatorType: action.payload.validatorType,
        upvotes: 0,
        upvoted: false,
        authors: action.payload.authors
      }];
    },
    setUpvotedEval(state, action) {
      state.evals = state.evals.map((value: any) => {
        if (value.id !== action.payload.id) return value;
        value.upvotes = action.payload.upvotes;
        value.upvoted = action.payload.upvoted;
        return value;
      });
    },
    setSearchTerm(state, action) {
      state.search = action.payload;
    },
    clearSearchTerm(state, action) {
      state.search = '';
    },
    setEvalToTry(state, action) {
      state.evalToTry = action.payload;
    },
    clearEvalToTry(state, action) {
      state.evalToTry = undefined;
    }
  },
});

export const {
  setModels, setEvals, addNewEval, setUpvotedEval, setSearchTerm, clearSearchTerm, setEvalToTry, clearEvalToTry
} = dataSlice.actions;
export default dataSlice.reducer;
