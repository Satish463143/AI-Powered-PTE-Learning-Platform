// Import components
import ReadAloud from '../../Components/questionMockTestComponent/speakingMocktest/ReadAloud';
import RepeatSentence from '../../Components/questionMockTestComponent/speakingMocktest/RepeatSentence';
import DescribeImage from '../../Components/questionMockTestComponent/speakingMocktest/DescribeImage';
import RetellLecture from '../../Components/questionMockTestComponent/speakingMocktest/RetellLecture';
import AnswerShortQuestion from '../../Components/questionMockTestComponent/speakingMocktest/AnswerShortQuestion';
import WriteEssay from '../../Components/questionMockTestComponent/writingMocktest/WriteEssay';
import SummarizeWrittenText from '../../Components/questionMockTestComponent/writingMocktest/SummarizeWrittenText';
import FillInTheBlanksReading from '../../Components/questionMockTestComponent/readingMocktest/FillInTheBlanks(Reading)';
import MultipleChoiceMultiple from '../../Components/questionMockTestComponent/readingMocktest/MultipleChoiceMultiple';
import ReorderParagraph from '../../Components/questionMockTestComponent/readingMocktest/ReorderParagraph';
import FillInTheBlanksReadingWriting from '../../Components/questionMockTestComponent/readingMocktest/FillInTheBlanksReadingWriting';
import MultipleChoiceSingle from '../../Components/questionMockTestComponent/readingMocktest/MultipleChoiceSingle';
import HighlightCorrectSummary from '../../Components/questionMockTestComponent/readingMocktest/HighlightCorrectSummary';
import SummarizeSpokenText from '../../Components/questionMockTestComponent/listeningMocktest/SummarizeSpokenText';
import FillInTheBlanksListening from '../../Components/questionMockTestComponent/listeningMocktest/FillInTheBlanks';
import HighlightIncorrectWords from '../../Components/questionMockTestComponent/listeningMocktest/HighlightIncorrectWords';
import WriteFromDictation from '../../Components/questionMockTestComponent/listeningMocktest/WriteFromDictation';

export const sectionTimes = {
  // Speaking
  'RA': 40,  // 30-40 seconds
  'RS': 15,  // 15 seconds
  'DI': 40,  // 40 seconds
  'RL': 40,  // 40 seconds
  'ASQ': 10, // 10 seconds

  // Writing
  'WE': 1200,  // 20 minutes
  'SWT': 600,  // 10 minutes

  // Reading
  'FIB-R': 120,  // ~2 minutes per question
  'FIB-RW': 120, // ~2 minutes per question
  'RO': 180,     // ~3 minutes per question
  'MCM': 120,    // ~2 minutes per question
  'MCS': 90,     // ~1.5 minutes per question
  'HCS': 120,    // ~2 minutes per question

  // Listening
  'SST': 600,  // 10 minutes
  'FIB-L': 120, // ~2 minutes per question
  'HIW': 180,   // ~3 minutes per question
  'WFD': 60,     // ~1 minute per question

  // New section times
  'read-aloud': 240,
  'fill-in-blanks-reading': 300,
  'multiple-choice-multiple-reading': 300,
  'multiple-choice-single-reading': 300,
  'reorder-paragraphs': 300,
  'fill-in-blanks-reading-writing': 300,
  'highlight-correct-summary': 300,
  'summarize-written-text': 600,
  'write-essay': 1200,
  'fill-in-blanks-writing': 300,
  'summarize-spoken-text': 600,
  'fill-in-blanks-listening': 300,
  'highlight-incorrect-words': 300,
  'write-from-dictation': 300,
  'multiple-choice-multiple-listening': 300,
  'multiple-choice-single-listening': 300,
  'select-missing-word': 300,
  'highlight-correct-summary-listening': 300,
  'read-aloud-speaking': 240,
  'repeat-sentence': 180,
  'describe-image': 240,
  'retell-lecture': 300,
  'answer-short-question': 180,
  'respond-to-situation': 180
};

export const componentMap = {
  // Speaking
  'RA': ReadAloud,
  'RS': RepeatSentence,
  'DI': DescribeImage,
  'RL': RetellLecture,
  'ASQ': AnswerShortQuestion,

  // Writing
  'WE': WriteEssay,
  'SWT': SummarizeWrittenText,

  // Reading
  'FIB-R': FillInTheBlanksReading,
  'MCM': MultipleChoiceMultiple,
  'RO': ReorderParagraph,
  'FIB-RW': FillInTheBlanksReadingWriting,
  'MCS': MultipleChoiceSingle,
  'HCS': HighlightCorrectSummary,

  // Listening
  'SST': SummarizeSpokenText,
  'FIB-L': FillInTheBlanksListening,
  'HIW': HighlightIncorrectWords,
  'WFD': WriteFromDictation
};

export const questionSetupData = {
  // Speaking
  'RA': {
    timeAllowed: "30-40 seconds",
    instructions: "Read the text aloud as naturally and clearly as possible.",
    tips: [
      "Take time to understand the text before reading",
      "Pay attention to pronunciation and intonation",
      "Maintain a steady pace"
    ]
  },
  'RS': {
    timeAllowed: "15 seconds",
    instructions: "Listen to the audio and repeat the sentence exactly as you hear it.",
    tips: [
      "Focus on the speaker's pronunciation and intonation",
      "Try to remember the sentence word by word",
      "Practice speaking at a natural pace"
    ]
  },
  'DI': {
    timeAllowed: "40 seconds",
    instructions: "Look at the image and describe it in detail.",
    tips: [
      "Identify the main elements of the image",
      "Describe trends or patterns if applicable",
      "Use appropriate vocabulary and structures"
    ]
  },
  'RL': {
    timeAllowed: "40 seconds",
    instructions: "Listen to the lecture and retell it in your own words.",
    tips: [
      "Take notes while listening",
      "Focus on main ideas and key details",
      "Organize your response logically"
    ]
  },
  'ASQ': {
    timeAllowed: "10 seconds",
    instructions: "Listen to the question and provide a short answer.",
    tips: [
      "Listen carefully to the question",
      "Answer directly and concisely",
      "Speak clearly and confidently"
    ]
  },

  // Writing
  'WE': {
    timeAllowed: "20 minutes",
    instructions: "Write a 200-300 word essay on the given topic.",
    tips: [
      "Plan your essay before writing",
      "Include introduction, body paragraphs, and conclusion",
      "Support your arguments with examples"
    ]
  },
  'SWT': {
    timeAllowed: "10 minutes",
    instructions: "Summarize the written text in one sentence (5-75 words).",
    tips: [
      "Identify the main idea of the text",
      "Include key supporting points",
      "Use proper grammar and punctuation"
    ]
  },

  // Reading
  'FIB-R': {
    timeAllowed: "time varies",
    instructions: "Fill in the blanks with the most appropriate words from the options given.",
    tips: [
      "Read the entire text first",
      "Consider context and grammar",
      "Check your answers before submitting"
    ]
  },
  'FIB-RW': {
    timeAllowed: "time varies",
    instructions: "Fill in the blanks with the most appropriate words.",
    tips: [
      "Read the entire text carefully",
      "Consider grammar and context",
      "Review your answers"
    ]
  },
  'RO': {
    timeAllowed: "time varies",
    instructions: "Put the paragraphs in the correct order.",
    tips: [
      "Identify topic sentences",
      "Look for connecting words",
      "Check logical flow"
    ]
  },
  'MCM': {
    timeAllowed: "time varies",
    instructions: "Select ALL correct options.",
    tips: [
      "Read the question carefully",
      "Consider all options",
      "Check multiple answers can be correct"
    ]
  },
  'MCS': {
    timeAllowed: "time varies",
    instructions: "Select the BEST option.",
    tips: [
      "Read all options carefully",
      "Eliminate incorrect answers",
      "Choose the most appropriate answer"
    ]
  },
  'HCS': {
    timeAllowed: "time varies",
    instructions: "Select the summary that best represents the text.",
    tips: [
      "Read the original text carefully",
      "Compare each summary",
      "Look for key ideas and details"
    ]
  },

  // Listening
  'SST': {
    timeAllowed: "10 minutes",
    instructions: "Listen to the audio and summarize the spoken text in your own words.",
    tips: [
      "Take notes while listening",
      "Organize your summary logically",
      "Include main points and key details"
    ]
  },
  'FIB-L': {
    timeAllowed: "time varies",
    instructions: "Listen and type the missing words.",
    tips: [
      "Listen carefully to the audio",
      "Pay attention to context",
      "Check your spelling"
    ]
  },
  'HIW': {
    timeAllowed: "time varies",
    instructions: "Click on the words that differ from what you hear.",
    tips: [
      "Listen carefully to pronunciation",
      "Compare with written text",
      "Mark words that don't match"
    ]
  },
  'WFD': {
    timeAllowed: "time varies",
    instructions: "Write the sentence exactly as you hear it.",
    tips: [
      "Listen carefully to each word",
      "Pay attention to punctuation",
      "Check your spelling"
    ]
  },

  // New question setup data
  'read-aloud': {
    timeAllowed: '40 seconds',
    instructions: 'Look at the text below. In 40 seconds, you must read this text aloud as naturally and clearly as possible.',
    tips: [
      'Read the text silently first',
      'Pay attention to punctuation',
      'Maintain a natural pace',
      'Speak clearly and confidently'
    ]
  },
  'summarize-written-text': {
    timeAllowed: '10 minutes',
    instructions: 'Read the passage below and summarize it using one sentence. You have 10 minutes to finish this task.',
    tips: [
      'Read the passage carefully',
      'Identify the main idea',
      'Use your own words',
      'Keep it within one sentence',
      'Check your grammar and spelling'
    ]
  }
};

export const sectionSequences = {
  speaking: {
    sequence: ['RA', 'RS', 'DI', 'RL', 'ASQ'],
    counts: {
      'RA': 7,
      'RS': 11,
      'DI': 3,
      'RL': 1,
      'ASQ': 6
    }
  },
  writing: {
    sequence: ['SWT', 'WE'],
    counts: {
      'SWT': 2,
      'WE': 2
    }
  },
  reading: {
    sequence: ['FIB-R', 'MCM', 'RO', 'FIB-RW', 'MCS', 'HCS'],
    counts: {
      'FIB-R': 5,
      'MCM': 2,
      'RO': 2,
      'FIB-RW': 5,
      'MCS': 2,
      'HCS': 2
    }
  },
  listening: {
    sequence: ['SST', 'MCM', 'FIB-L', 'MCS', 'HIW', 'WFD'],
    counts: {
      'SST': 2,
      'MCM': 1,
      'FIB-L': 3,
      'MCS': 4,
      'HIW': 3,
      'WFD': 4
    }
  },
  reading: {
    sequence: [
      'read-aloud',
      'fill-in-blanks-reading',
      'multiple-choice-multiple-reading',
      'reorder-paragraphs',
      'fill-in-blanks-reading-writing'
    ],
    counts: {
      'read-aloud': 2,
      'fill-in-blanks-reading': 2,
      'multiple-choice-multiple-reading': 2,
      'reorder-paragraphs': 2,
      'fill-in-blanks-reading-writing': 2
    }
  },
  writing: {
    sequence: [
      'summarize-written-text',
      'write-essay'
    ],
    counts: {
      'summarize-written-text': 2,
      'write-essay': 1
    }
  },
  listening: {
    sequence: [
      'summarize-spoken-text',
      'fill-in-blanks-listening',
      'highlight-incorrect-words',
      'write-from-dictation'
    ],
    counts: {
      'summarize-spoken-text': 2,
      'fill-in-blanks-listening': 2,
      'highlight-incorrect-words': 2,
      'write-from-dictation': 2
    }
  },
  speaking: {
    sequence: [
      'read-aloud-speaking',
      'repeat-sentence',
      'describe-image',
      'retell-lecture',
      'answer-short-question'
    ],
    counts: {
      'read-aloud-speaking': 2,
      'repeat-sentence': 2,
      'describe-image': 2,
      'retell-lecture': 2,
      'answer-short-question': 2
    }
  }
};

export const questionTypeMap = {
  // Speaking
  'RA': { section: 'speaking', type: 'readAloud', sectionType: 'speaking', displayName: 'Read Aloud' },
  'RS': { section: 'speaking', type: 'repeatSentence', sectionType: 'speaking', displayName: 'Repeat Sentence' },
  'DI': { section: 'speaking', type: 'describeImage', sectionType: 'speaking', displayName: 'Describe Image' },
  'RL': { section: 'speaking', type: 'retellLecture', sectionType: 'speaking', displayName: 'Retell Lecture' },
  'ASQ': { section: 'speaking', type: 'answerShortQuestion', sectionType: 'speaking', displayName: 'Answer Short Question' },

  // Writing
  'WE': { section: 'writing', type: 'writeEssay', sectionType: 'writing', displayName: 'Write Essay' },
  'SWT': { section: 'writing', type: 'summarizeWrittenText', sectionType: 'writing', displayName: 'Summarize Written Text' },

  // Reading
  'FIB-R': { section: 'reading', type: 'fillInTheBlanksReading', sectionType: 'reading', displayName: 'Fill in the Blanks (Reading)' },
  'FIB-RW': { section: 'reading', type: 'fillInTheBlanksReadingWriting', sectionType: 'reading', displayName: 'Fill in the Blanks (Reading & Writing)' },
  'RO': { section: 'reading', type: 'reorderParagraphs', sectionType: 'reading', displayName: 'Reorder Paragraphs' },
  'MCM': { section: 'reading', type: 'multipleChoiceMultiple', sectionType: 'reading', displayName: 'Multiple Choice (Multiple)' },
  'MCS': { section: 'reading', type: 'multipleChoiceSingle', sectionType: 'reading', displayName: 'Multiple Choice (Single)' },
  'HCS': { section: 'reading', type: 'highlightCorrectSummary', sectionType: 'reading', displayName: 'Highlight Correct Summary' },

  // Listening
  'SST': { section: 'listening', type: 'summarizeSpokenText', sectionType: 'listening', displayName: 'Summarize Spoken Text' },
  'FIB-L': { section: 'listening', type: 'fillInTheBlanksListening', sectionType: 'listening', displayName: 'Fill in the Blanks (Listening)' },
  'HIW': { section: 'listening', type: 'highlightIncorrectWords', sectionType: 'listening', displayName: 'Highlight Incorrect Words' },
  'WFD': { section: 'listening', type: 'writeFromDictation', sectionType: 'listening', displayName: 'Write from Dictation' },

  // New question types
  'read-aloud': {
    displayName: 'Read Aloud',
    section: 'reading',
    type: 'read-aloud',
    sectionType: 'reading'
  },
  'fill-in-blanks-reading': {
    displayName: 'Fill in the Blanks (Reading)',
    section: 'reading',
    type: 'fill-in-blanks',
    sectionType: 'reading'
  },
  'multiple-choice-multiple-reading': {
    displayName: 'Multiple Choice (Multiple)',
    section: 'reading',
    type: 'multiple-choice-multiple',
    sectionType: 'reading'
  },
  'multiple-choice-single-reading': {
    displayName: 'Multiple Choice (Single)',
    section: 'reading',
    type: 'multiple-choice-single',
    sectionType: 'reading'
  },
  'reorder-paragraphs': {
    displayName: 'Reorder Paragraphs',
    section: 'reading',
    type: 'reorder-paragraphs',
    sectionType: 'reading'
  },
  'fill-in-blanks-reading-writing': {
    displayName: 'Fill in the Blanks (Reading & Writing)',
    section: 'reading',
    type: 'fill-in-blanks-reading-writing',
    sectionType: 'reading'
  },
  'highlight-correct-summary': {
    displayName: 'Highlight Correct Summary',
    section: 'reading',
    type: 'highlight-correct-summary',
    sectionType: 'reading'
  },
  'summarize-written-text': {
    displayName: 'Summarize Written Text',
    section: 'writing',
    type: 'summarize-written-text',
    sectionType: 'writing'
  },
  'write-essay': {
    displayName: 'Write Essay',
    section: 'writing',
    type: 'write-essay',
    sectionType: 'writing'
  },
  'fill-in-blanks-writing': {
    displayName: 'Fill in the Blanks (Writing)',
    section: 'writing',
    type: 'fill-in-blanks',
    sectionType: 'writing'
  },
  'summarize-spoken-text': {
    displayName: 'Summarize Spoken Text',
    section: 'listening',
    type: 'summarize-spoken-text',
    sectionType: 'listening'
  },
  'fill-in-blanks-listening': {
    displayName: 'Fill in the Blanks (Listening)',
    section: 'listening',
    type: 'fill-in-blanks',
    sectionType: 'listening'
  },
  'highlight-incorrect-words': {
    displayName: 'Highlight Incorrect Words',
    section: 'listening',
    type: 'highlight-incorrect-words',
    sectionType: 'listening'
  },
  'write-from-dictation': {
    displayName: 'Write from Dictation',
    section: 'listening',
    type: 'write-from-dictation',
    sectionType: 'listening'
  },
  'multiple-choice-multiple-listening': {
    displayName: 'Multiple Choice (Multiple)',
    section: 'listening',
    type: 'multiple-choice-multiple',
    sectionType: 'listening'
  },
  'multiple-choice-single-listening': {
    displayName: 'Multiple Choice (Single)',
    section: 'listening',
    type: 'multiple-choice-single',
    sectionType: 'listening'
  },
  'select-missing-word': {
    displayName: 'Select Missing Word',
    section: 'listening',
    type: 'select-missing-word',
    sectionType: 'listening'
  },
  'highlight-correct-summary-listening': {
    displayName: 'Highlight Correct Summary',
    section: 'listening',
    type: 'highlight-correct-summary',
    sectionType: 'listening'
  },
  'read-aloud-speaking': {
    displayName: 'Read Aloud',
    section: 'speaking',
    type: 'read-aloud',
    sectionType: 'speaking'
  },
  'repeat-sentence': {
    displayName: 'Repeat Sentence',
    section: 'speaking',
    type: 'repeat-sentence',
    sectionType: 'speaking'
  },
  'describe-image': {
    displayName: 'Describe Image',
    section: 'speaking',
    type: 'describe-image',
    sectionType: 'speaking'
  },
  'retell-lecture': {
    displayName: 'Retell Lecture',
    section: 'speaking',
    type: 'retell-lecture',
    sectionType: 'speaking'
  },
  'answer-short-question': {
    displayName: 'Answer Short Question',
    section: 'speaking',
    type: 'answer-short-question',
    sectionType: 'speaking'
  },
  'respond-to-situation': {
    displayName: 'Respond to Situation',
    section: 'speaking',
    type: 'respond-to-situation',
    sectionType: 'speaking'
  }
};

export const formatQuestionData = (response, questionType) => {
  const baseData = {
    mockTestId: response.result.mockTestId,
    section: response.result.section,
    questionType: response.result.questionType
  };

  switch (questionType) {
    // Speaking section
    case 'RA':
      return {
        ...baseData,
        question: {
          text: response.result.question.text || response.result.question.paragraph,
          instructions: "Read the text aloud as naturally and clearly as possible."
        }
      };
    
    case 'RS':
      return {
        ...baseData,
        question: {
          audio: response.result.question.audio,
          audioUrl: response.result.question.audioUrl,
          transcript: response.result.question.transcript,
          instructions: "Listen to the audio and repeat the sentence exactly as you hear it."
        }
      };
    
    case 'DI':
      return {
        ...baseData,
        question: {
          image: response.result.question.image,
          imageUrl: response.result.question.imageUrl,
          description: response.result.question.description,
          instructions: "Look at the image and describe it in detail."
        }
      };
    
    case 'RL':
      return {
        ...baseData,
        question: {
          audio: response.result.question.audio,
          audioUrl: response.result.question.audioUrl,
          transcript: response.result.question.transcript,
          image: response.result.question.image,
          imageUrl: response.result.question.imageUrl,
          instructions: "Listen to the lecture and retell it in your own words."
        }
      };

    case 'ASQ':
      return {
        ...baseData,
        question: {
          audio: response.result.question.audio,
          audioUrl: response.result.question.audioUrl,
          transcript: response.result.question.transcript,
          correctAnswer: response.result.question.correctAnswer,
          instructions: "Listen to the question and provide a short answer."
        }
      };

    // Writing section
    case 'WE':
      return {
        ...baseData,
        question: {
          topic: response.result.question.topic,
          description: response.result.question.description,
          instructions: "Write a 200-300 word essay on the given topic."
        }
      };

    case 'SWT':
      return {
        ...baseData,
        question: {
          text: response.result.question.text,
          instructions: "Summarize the written text in one sentence (5-75 words)."
        }
      };

    // Reading section
    case 'FIB-R':
    case 'FIB-RW':
      return {
        ...baseData,
        question: {
          text: response.result.question.text,
          paragraphText: response.result.question.paragraphText,
          wordOptions: response.result.question.wordOptions,
          blanksCount: response.result.question.blanksCount,
          instructions: questionType === 'FIB-R' 
            ? "Fill in the blanks with the most appropriate words from the options given."
            : "Fill in the blanks with the most appropriate words."
        }
      };

    case 'RO':
      return {
        ...baseData,
        question: {
          paragraphs: response.result.question.paragraphs,
          instructions: "Put the paragraphs in the correct order."
        }
      };

    case 'MCM':
    case 'MCS':
      return {
        ...baseData,
        question: {
          text: response.result.question.text,
          options: response.result.question.options,
          instructions: questionType === 'MCM'
            ? "Select ALL correct options."
            : "Select the BEST option."
        }
      };

    case 'HCS':
      return {
        ...baseData,
        question: {
          text: response.result.question.text,
          summaries: response.result.question.summaries,
          instructions: "Select the summary that best represents the text."
        }
      };

    // Listening section
    case 'SST':
      return {
        ...baseData,
        question: {
          audio: response.result.question.audio,
          audioUrl: response.result.question.audioUrl,
          transcript: response.result.question.transcript,
          instructions: "Listen to the audio and summarize the spoken text in your own words."
        }
      };

    case 'FIB-L':
      return {
        ...baseData,
        question: {
          audio: response.result.question.audio,
          audioUrl: response.result.question.audioUrl,
          transcript: response.result.question.transcript,
          text: response.result.question.text,
          blanksCount: response.result.question.blanksCount,
          instructions: "Listen and type the missing words."
        }
      };

    case 'HIW':
      return {
        ...baseData,
        question: {
          audio: response.result.question.audio,
          audioUrl: response.result.question.audioUrl,
          transcript: response.result.question.transcript,
          text: response.result.question.text,
          instructions: "Click on the words that differ from what you hear."
        }
      };

    case 'WFD':
      return {
        ...baseData,
        question: {
          audio: response.result.question.audio,
          audioUrl: response.result.question.audioUrl,
          transcript: response.result.question.transcript,
          instructions: "Write the sentence exactly as you hear it."
        }
      };

    // New question types
    case 'read-aloud':
      return {
        ...baseData,
        question: {
          text: response.result.question.text || response.result.question.paragraph,
          instructions: "Look at the text below. In 40 seconds, you must read this text aloud as naturally and clearly as possible."
        }
      };

    case 'summarize-written-text':
      return {
        ...baseData,
        question: {
          text: response.result.question.text,
          instructions: "Read the passage below and summarize it using one sentence. You have 10 minutes to finish this task."
        }
      };

    default:
      return {
        ...baseData,
        question: response.result.question
      };
  }
}; 