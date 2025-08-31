# Mock Test API - Frontend Developer Guide

## Overview
The backend automatically manages test progression (sections, question types, and order). Frontend only needs to handle UI and basic question/answer flow.

---

## API Endpoints

### 1. Main Mock Test Endpoint
**POST** `/api/mock-test`

#### **Next Button Action**
```json
{
  "actionType": "next",
  "question": { /* current question object */ },
  "userAnswer": { /* user's answer */ },
  "mockTestId": "optional - auto-created if not provided"
}
```

**Response (Continue Test):**
```json
{
  "message": "Previous answer saved successfully",
  "result": {
    "mockTestId": "674a1b2c3d4e5f6789012345",
    "nextSection": "Speaking",
    "nextQuestionType": "repeat_sentence",
    "questionNumber": 2,
    "totalQuestions": 10
  }
}
```

**Response (Test Complete):**
```json
{
  "message": "Test completed successfully",
  "result": {
    "mockTestId": "674a1b2c3d4e5f6789012345",
    "isTestComplete": true,
    "status": "completed"
  }
}
```

#### **Submit Button Action**
```json
{
  "actionType": "submit",
  "question": { /* last question object */ },
  "userAnswer": { /* final answer */ },
  "mockTestId": "674a1b2c3d4e5f6789012345"
}
```

**Response:**
```json
{
  "message": "Test completed successfully",
  "result": {
    "mockTestId": "674a1b2c3d4e5f6789012345",
    "status": "completed"
  }
}
```

#### **Generate Question Action**
```json
{
  "actionType": "generate_question",
  "mockTestId": "674a1b2c3d4e5f6789012345"
}
```

**Response:**
```json
{
  "message": "Question generated successfully",
  "result": {
    "question": {
      "questionId": 12346,
      "section": "Speaking",
      "questionType": "repeat_sentence",
      "content": "Listen and repeat...",
      /* ... other question properties ... */
    },
    "mockTestId": "674a1b2c3d4e5f6789012345"
  }
}
```

### 2. Get Test Status
**GET** `/api/mock-test/status/:mockTestId`

**Response:**
```json
{
  "message": "Test status retrieved successfully",
  "result": {
    "progress": {
      "section": "Reading",
      "questionType": "reorder",
      "questionNumber": 1,
      "totalQuestions": 2,
      "isTestComplete": false,
      "overallProgress": {
        "answered": 35,
        "total": 73
      }
    }
  }
}
```

### 3. Get Test Report
**GET** `/api/mock-test/report/:mockTestId`

### 4. Get User Stats
**GET** `/api/mock-test/stats`

---

## Frontend Logic

### Next Button Flow
1. **Send current answer** to backend with `actionType: "next"`
2. **Check response** - if `isTestComplete: true`, show completion screen
3. **If not complete**, use response data to generate next question
4. **Generate question** by calling API with `actionType: "generate_question"`
5. **Display new question** and reset answer state

### Submit Button Flow
1. **Send final answer** to backend with `actionType: "submit"`
2. **Show completion screen** with test results

### Basic Implementation
```javascript
// Next Button Handler
const handleNext = async () => {
  // 1. Save current answer and get next position
  const nextResponse = await fetch('/api/mock-test', {
    method: 'POST',
    body: JSON.stringify({
      actionType: "next",
      question: currentQuestion,
      userAnswer: userAnswer,
      mockTestId: mockTestId
    })
  });
  
  const nextData = await nextResponse.json();
  
  // 2. Check if test is complete
  if (nextData.result.isTestComplete) {
    showTestComplete();
    return;
  }
  
  // 3. Generate next question
  const questionResponse = await fetch('/api/mock-test', {
    method: 'POST',
    body: JSON.stringify({
      actionType: "generate_question",
      mockTestId: nextData.result.mockTestId
    })
  });
  
  const questionData = await questionResponse.json();
  
  // 4. Update UI with next question
  setCurrentQuestion(questionData.result.question);
  setMockTestId(nextData.result.mockTestId);
};

// Submit Button Handler
const handleSubmit = async () => {
  const response = await fetch('/api/mock-test', {
    method: 'POST',
    body: JSON.stringify({
      actionType: "submit",
      question: currentQuestion,
      userAnswer: userAnswer,
      mockTestId: mockTestId
    })
  });
  
  showTestComplete();
};
```

---

## Test Progression Order (Automatic)

1. **Speaking** (35 questions): read_aloud → repeat_sentence → describe_image → retell_lecture → answer_short_question
2. **Reading** (13 questions): reorder → fill_in_blank → multiple_choice_single → multiple_choice_multiple  
3. **Listening** (23 questions): summarize_spoken_text → multiple_choice_single → fill_in_blank → etc.
4. **Writing** (2 questions): summarize_written_text → essay_writing

**Total: 73 questions**

---

## Key Points
- **Frontend only sends**: question, userAnswer, actionType
- **Backend handles**: section progression, question types, test completion
- **Single endpoint**: `/api/mock-test` for all actions
- **State needed**: currentQuestion, userAnswer, mockTestId

This simplified approach makes frontend development much easier while ensuring consistent test flow! 🚀 