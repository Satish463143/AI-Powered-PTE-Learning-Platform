//listening section
import fillInTheBlanks_listenng from './listening/fillInTtheBlanks';
import highlightIncorrectWords from './listening/highlightIncorrectWords';
import multipleChoiceMultiple_listening from './listening/multipleChoice(Multiple)';
import multipleChoiceSingle_listenong from './listening/multipleChoice(Single)';
import selectMissingWord from './listening/selectMissingWord';
import summarizeSpokenText from './listening/summarizeSpokenText';
import writeFromDictation from './listening/writeFromDictation';

//reading section
import fillInTheBlanks_reading from './reading/fillInTheBlanks';
import multipleChoiceMultiple_reading from './reading/multipleChoice(Multiple)';
import multipleChoiceSingle_reading from './reading/multipleChoice(Single)';
import ReorderParagraph from './reading/re-orderParagraphs';
import reading_fillInTheBlanks from './reading/reading-FillInTheBlanks';

//speaking section
import answerShortQuestion from './speaking/answerShortQuestion';
import describeImage from './speaking/describeImage';
import readAloud from './speaking/readAloud';
import repeatSentence from './speaking/repeatSentence';
import respondToASituation from './speaking/respondToASituation';

//writing section
import summarizeWrittenText from './writing/summarizeWrittenText';
import writeEssay from './writing/writeEssay';

const componentMap = {
    'fillInTheBlanks_listenng': fillInTheBlanks_listenng,
    'highlightIncorrectWords': highlightIncorrectWords,
    'multipleChoiceMultiple_listening': multipleChoiceMultiple_listening,
    'multipleChoiceSingle_listenong': multipleChoiceSingle_listenong,
    'selectMissingWord': selectMissingWord,
    'summarizeSpokenText': summarizeSpokenText,
    'writeFromDictation': writeFromDictation,

    'fillInTheBlanks_reading': fillInTheBlanks_reading,
    'multipleChoiceMultiple_reading': multipleChoiceMultiple_reading,
    'multipleChoiceSingle_reading': multipleChoiceSingle_reading,
    'reorderParagraph': ReorderParagraph,
    'reading_fillInTheBlanks': reading_fillInTheBlanks,

    'answerShortQuestion': answerShortQuestion,
    'describeImage': describeImage,
    'readAloud': readAloud, 
    'repeatSentence': repeatSentence,
    'respondToASituation': respondToASituation,

    'summarizeWrittenText': summarizeWrittenText,
    'writeEssay': writeEssay,

}

export default componentMap;








