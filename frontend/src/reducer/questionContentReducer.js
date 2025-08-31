// Action Types
const SET_QUESTION_CONTENT = 'SET_QUESTION_CONTENT';

// Action Creators
export const setQuestionContent = (questionId, content) => ({
  type: SET_QUESTION_CONTENT,
  payload: { questionId, content }
});

// Initial State
const initialState = {
  questionContents: {}  // Map of questionId to content object
};

// Reducer
const questionContentReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_QUESTION_CONTENT:
      // Only set content if it doesn't already exist for this question
      if (!state.questionContents[action.payload.questionId]) {
        return {
          ...state,
          questionContents: {
            ...state.questionContents,
            [action.payload.questionId]: action.payload.content
          }
        };
      }
      return state;
    default:
      return state;
  }
};

export default questionContentReducer; 