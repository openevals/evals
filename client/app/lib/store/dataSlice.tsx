import { createSlice } from '@reduxjs/toolkit';
import { IModelResponse, IEvalListItemResponse } from '../types';

const initialState: {
  models: IModelResponse[];
  evals: IEvalListItemResponse[];
  search: string;
} = {
  models: [],
  evals: [],
  search: '',
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
        upvoted: false
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
  },
});

export const {
  setModels, setEvals, addNewEval, setUpvotedEval, setSearchTerm, clearSearchTerm
} = dataSlice.actions;
export default dataSlice.reducer;
