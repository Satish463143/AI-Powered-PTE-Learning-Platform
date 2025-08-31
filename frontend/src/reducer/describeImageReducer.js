// Action Types
const SET_QUESTION_IMAGE = 'SET_QUESTION_IMAGE';

// Action Creators
export const setQuestionImage = (questionId, imageUrl) => ({
  type: SET_QUESTION_IMAGE,
  payload: { questionId, imageUrl }
});

// Add new action for setting full question content
export const setQuestionContent = (questionId, content) => ({
  type: 'SET_QUESTION_CONTENT',
  payload: { questionId, content }
});

// Initial State
const initialState = {
  questionImages: {},
  questionContents: {}  // Add this to store full question content
};

// Reducer
const describeImageReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_QUESTION_IMAGE:
      return {
        ...state,
        questionImages: {
          ...state.questionImages,
          [action.payload.questionId]: action.payload.imageUrl
        }
      };
    
    case 'SET_QUESTION_CONTENT':
      return {
        ...state,
        questionContents: {
          ...state.questionContents,
          [action.payload.questionId]: action.payload.content
        }
      };

    default:
      return state;
  }
};

export default describeImageReducer; 