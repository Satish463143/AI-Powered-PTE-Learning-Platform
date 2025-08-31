import React,{useState, useEffect} from 'react'
import AnswerShortQuestion from './answerShortQuestion'
import DescribeImage from './describeImage'
import ReadAloud from './readAloud'
import RepeatSentence from './repeatSentence'
import RetellLecture from './retellLecture'

const  SpeakingMocktest = ({ onNext, updateProgress }) => {
  const [section, setSection] = useState('readAloud')
  const [currentQuestion, setCurrentQuestion] = useState(1);

  const answerShortQuestionQuestions = 6;
  const describeImageQuestions = 3;
  const readAloudQuestions = 7;
  const repeatSentenceQuestions = 11;
  const retellLectureQuestions = 1;
  const totalQuestions = answerShortQuestionQuestions + describeImageQuestions + readAloudQuestions + repeatSentenceQuestions + retellLectureQuestions;

  useEffect(() => {
    if (updateProgress) {
      updateProgress(currentQuestion, totalQuestions);
        }
    }, [currentQuestion, updateProgress, totalQuestions]);

  const handleReadAloudComplete = () => {
      setSection('repeatSentence');
  }
  const handleRepeatSentenceComplete = () => {
      setSection('describeImage');
  }
    const handleDescribeImageComplete = () => {
        setSection('retellLecture');
    }   
    
    const handleRetellLectureComplete = () => {
      setSection('answerShortQuestion');
    }

    const updateSetUpProgress = (current, total) => {
      setCurrentQuestion(current);
    };

    const updateReadAloudProgress = (current, total) => {
      setCurrentQuestion(readAloudQuestions + current);
    }
    const updateRepeatSentenceProgress = (current, total) => {
      setCurrentQuestion(readAloudQuestions + repeatSentenceQuestions + current);
    }
    const updateDescribeImageProgress = (current, total) => {
      setCurrentQuestion(readAloudQuestions + repeatSentenceQuestions + describeImageQuestions + current);
    }
    const updateRetellLectureProgress = (current, total) => {
      setCurrentQuestion(readAloudQuestions + repeatSentenceQuestions + describeImageQuestions + retellLectureQuestions + current);
    }
    
  return (
    <>
      {section === 'readAloud' && (
        <ReadAloud onNext={handleReadAloudComplete} updateProgress={updateSetUpProgress} />
      )}
      {section === 'repeatSentence' && (
        <RepeatSentence onNext={handleRepeatSentenceComplete} updateProgress={updateReadAloudProgress} />
      )}
      
      {section === 'describeImage' && (
        <DescribeImage onNext={handleDescribeImageComplete} updateProgress={updateRepeatSentenceProgress} />
      )}
      {section === 'retellLecture' && (
        <RetellLecture onNext={handleRetellLectureComplete} updateProgress={updateDescribeImageProgress} />
      )}
      {section === 'answerShortQuestion' && (
        <AnswerShortQuestion onNext={onNext} updateProgress={updateRetellLectureProgress} />
      )}     
      
    </>
  )
}

export default SpeakingMocktest