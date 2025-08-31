import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import componentMap from '../sections/allQuestionMap';

const MockTestQuestion = () => {
  const { section } = useParams();
  const [searchParams] = useSearchParams();
  const mockTestId = searchParams.get('id');

  // Map section codes to component names
  const sectionToComponentMap = {
    'RA': 'readAloud',
    'RS': 'repeatSentence',
    'DI': 'describeImage',
    'RL': 'respondToASituation',
    'WE': 'writeEssay',
    'SWT': 'summarizeWrittenText',
    'FIB-RW': 'fillInTheBlanks_reading',
    'FIB-R': 'reading_fillInTheBlanks',
    'RO': 'reorderParagraph',
    'WFD': 'writeFromDictation',
    'SST': 'summarizeSpokenText',
    'FIB-L': 'fillInTheBlanks_listening',
    'HIW': 'highlightIncorrectWords'
  };

  const componentName = sectionToComponentMap[section];
  const QuestionComponent = componentMap[componentName];

  if (!QuestionComponent) {
    return <div>Invalid section type</div>;
  }

  return <QuestionComponent mockTestId={mockTestId} />;
};

export default MockTestQuestion; 