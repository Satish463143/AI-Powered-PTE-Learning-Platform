import React, { useState, useRef, useEffect } from 'react';
import headsetAudio from '../../assets/audio/audio.mp3';
import keyboardImage from '../../assets/image/qwerty_117.webp';
import timer from '../../assets/image/image.png';

const SetupContent = ({ onNext, sectionSetupData }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [recordedAnswer, setRecordedAnswer] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 60) {
            handleStop();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recording]);

  const handleMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setRecordedAnswer('Completed');
        setRecording(false);
        setRecordingTime(0);
      };

      recorder.start();
      setRecording(true);
      setAudioChunks([]);
      setRecordedAnswer('');
      setAudioUrl(null);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const handlePlayback = () => {
    if (audioUrl && !isPlaying) {
      setIsPlaying(true);
      
      // Create new audio element if not exists
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
        
        audioRef.current.onended = () => {
          setIsPlaying(false);
          audioRef.current = null;
        };
      }
      
      // Play the audio
      audioRef.current.play().catch(err => {
        console.error('Error playing audio:', err);
        setIsPlaying(false);
        audioRef.current = null;
      });
    }
  };

  const handleStop = () => {
    // Handle recording stop
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    
    // Handle playback stop
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      setIsPlaying(false);
    }
  };

  // Generate dynamic table content based on section data
  const generateTableContent = () => {
    if (!sectionSetupData) {
      return (
        <div className='content_table'>
          <h2>Section Mock Test</h2>
          <p>Loading section information...</p>
        </div>
      );
    }

    return (
      <div className='content_table'>
        <h2>The test is approximately {sectionSetupData.timeAllowed} long.</h2>
        <table>
          <thead>
            <tr>
              <td className='font-bold'>Part</td>
              <td className='font-bold'>Content</td>
              <td className='font-bold'>Time Allowed</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowSpan={sectionSetupData.questionTypes.length + 1}>Part 1</td>
              <td>{sectionSetupData.questionTypes[0]}</td>
              <td rowSpan={sectionSetupData.questionTypes.length + 1}>{sectionSetupData.timeAllowed}</td>
            </tr>
            {sectionSetupData.questionTypes.slice(1).map((questionType, index) => (
              <tr key={index}>
                <td>{questionType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const steps = [
    generateTableContent(),
    <div className='headset_container'>
      <h2 className='font-bold'>Headset Check</h2>
      <h2 className='font-bold'>This is an opportunity to check that your headset is working correctly.</h2>
      <ol style={{listStyleType: 'decimal', paddingLeft: '20px', margin: '15px 0'}}>
        <li className='font-bold'>Put your headset on and adjust it so that it fits comfortably over your ears.</li>
        <li className='font-bold'>When you are ready, click on the [Play] button. You will hear a short recording.</li>
        <li className='font-bold'>If you do not hear anything in your headphones while the status reads [Playing], raise your hand to get the attention of the Test Administrator.</li>
      </ol>
      <audio src={headsetAudio} controls controlsList="nodownload"/>
      <ul style={{listStyleType: 'disc', paddingLeft: '20px', margin: '15px 0'}}>
        <li className='font-bold'>During the practice you will not have [Play] and [Stop] buttons. The audio recording will start playing automatically.</li>
        <li className='font-bold'>Please do not remove your headset. You should wear it throughout the test.</li>
      </ul>
    </div>,
    <div className="micorphone_test" >
      <h2 className='font-bold'>Microphone Check</h2>
      <h2 className='font-bold'>This is an opportunity to check that your microphone is working correctly.</h2>
      <ol style={{listStyleType: 'decimal', paddingLeft: '20px', margin: '15px 0'}}>
        <li className='font-bold'>Put your microphone on and adjust it so that it fits comfortably over your mouth.</li>
        <li className='font-bold'>When you are ready, click on the Record button and say "Testing, testing, one, two, three" into the microphone.</li>
        <li className='font-bold'>After you have spoken, click on the Stop button. Your recording is now complete.</li>
        <li className='font-bold'>Now click on the Playback button. You should clearly hear yourself speaking.</li>
        <li className='font-bold'>If you can not hear your voice clearly, please raise your hand.</li>
      </ol>
      <div className="microphone_box">
        <p className='text-center'>Recorded Answer</p>
        <strong>Current Status: </strong>
        {recording ? 'Recording' : isPlaying ? 'Playing' : recordedAnswer ? 'Completed' : 'Click Record to Begin'}
        <div className="recording_div">
          {recording && (
            <div className="progress-bar" style={{ width: `${(recordingTime / 60) * 100}%` }}></div>
          )}
        </div>
        <div className="microphone_btn">
          <button 
            onClick={handleMic} 
            className={`${recording || isPlaying ? 'disabled_btn' : 'primary-btn'}`}
            disabled={recording || isPlaying}
          >
            Record
          </button>
          <button 
            className={`${!recordedAnswer || recording || isPlaying ? 'disabled_btn' : 'primary-btn'}`} 
            onClick={handlePlayback}
            disabled={!recordedAnswer || recording || isPlaying}
          >
            Playback
          </button>
          <button 
            className={`${!recording && !isPlaying ? 'disabled_btn' : 'primary-btn'}`} 
            onClick={handleStop}
            disabled={!recording && !isPlaying}
          >
            Stop
          </button>
        </div>
      </div>
      <h2 className='font-bold'>During the test, you will not have Record, Playback and Stop buttons. The voice recording will start automatically.</h2>      
    </div>,
    <div className="keyboard_check">
      <h2 className='font-bold'>Keyboard Check</h2>
      <h2 className='font-bold'>This is an opportunity to check that you have the correct keyboard.</h2>
      <ol style={{listStyleType: 'decimal', paddingLeft: '20px', margin: '15px 0'}}>
        <li className='font-bold'>Look at the top row of letters on the keyboard.</li>
        <li className='font-bold'>The letters should appear in this order Q W E R T Y.</li>
        <li className='font-bold'>If you do not have a Q W E R T Y keyboard, raise your hand to get the attention of Test Administrator.</li>
      </ol>
      <img src={keyboardImage} width='400px' height='auto' alt="PTE Sathy Keyboard" />
    </div>,
    <div>
      <h2 className='font-bold'>Test Introduction</h2>
      <h2 className='font-bold'>This test will measure the English Reading, Writing, Listening and Speaking skills that you need in an academic setting.</h2>
      <ol style={{listStyleType: 'decimal', paddingLeft: '20px', margin: '15px 0'}}>
        <li className='font-bold'>The test is divided into 3 parts. Each part may contain a number of sections. The sections are individually timed. The timer will be shown in the top right corner of your screen.The number of items in the section will also be displayed.</li>
      </ol>
      <img src={timer} width='200px' height='auto' alt="PTE Sathy Timer" />
      <ul style={{listStyleType: 'disc', paddingLeft: '20px', margin: '15px 0'}}>
        <li className='font-bold'>At the beginning of each part you will receive instructions. These will provide details on what to expect in that part of the test.</li>
        <li className='font-bold'>By clicking on the Next button at the bottom of each screen you confirm your answer and move to the next question. If you click on Next you will not be able to return to the previous question. You will not be able to revisit any questions at the end of the test.</li>
        <li className='font-bold'>You will be offered a break of up 10 minutes after Part 2. The break is optional.</li>
        <li className='font-bold'>This test makes use of different varieties of English, for example, British, American, Australian. You can answer in the standard English variety of your choice.</li>
      </ul>
    </div> 
  ];

  const nextStep = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      onNext(); // Move to next main section
    }
  };

  return (
    <>
      <div className="speaking-wrapper container">
        <div className="mock-question-container">
          <div className="question">
            {steps[stepIndex]}
          </div>
        </div>
      </div>
      <div className='next_button'>
        <button onClick={nextStep} className='primary-btn'>
          Next
        </button>
      </div>
    </>
    
  );
};

export default SetupContent;
