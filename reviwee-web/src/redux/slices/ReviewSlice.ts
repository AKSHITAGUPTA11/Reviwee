import { createSlice } from "@reduxjs/toolkit";

type ReviewState = {
  selectedTemplateId: string;
  selectedLanguage: string;
};

const initialState: ReviewState = {
  selectedTemplateId: "",
  selectedLanguage: "english",
};

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {
    setSelectedTemplateId: (state, action) => {
      state.selectedTemplateId = action.payload;
    },
    setSelectedLanguage: (state, action) => {
      state.selectedLanguage = action.payload;
    },
    resetReview: (state) => {
      state.selectedTemplateId = "";
      state.selectedLanguage = "english";
    },
  },
});

export const { setSelectedTemplateId, setSelectedLanguage, resetReview } = reviewSlice.actions;
export default reviewSlice.reducer;
