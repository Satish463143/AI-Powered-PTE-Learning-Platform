import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { FaMicrophone, FaStop, FaPlay, FaPause } from 'react-icons/fa';
import Swal from 'sweetalert2';
import dummyAudio from '../../../assets/audio/call.mp3';

const RecordingBox = memo(({ prepTime, recordingTime, status }) => {
    return (
        <div className="recording-box mt-4">
            <p className="text-lg font-semibold">{status}</p>
            {prepTime > 0 && <p>Preparation Time: {prepTime}s</p>}
            {recordingTime > 0 && <p>Recording Time Left: {recordingTime}s</p>}
        </div>
    );
}, (prev, next) => {
    return prev.prepTime === next.prepTime && 
           prev.recordingTime === next.recordingTime && 
           prev.status === next.status;
});

const AudioPlayingBox = memo(({ audioPlaying, prepTime, audioRef }) => {
    const [volume, setVolume] = useState(1);
    const [audioProgress, setAudioProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const audio = audioRef?.current;
        if (!audio) return;

        audio.volume = volume;
        
        const handleTimeUpdate = () => {
            if (audio) {
                setCurrentTime(audio.currentTime);
                setAudioProgress((audio.currentTime / audio.duration) * 100 || 0);
            }
        };

        const handleLoadedMetadata = () => {
            if (audio) {
                setDuration(audio.duration || 0);
            }
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => {
            setIsPlaying(false);
            setAudioProgress(100);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleEnded);

        if (audio.duration) {
            handleLoadedMetadata();
        }

        return () => {
            if (audio) {
                audio.removeEventListener('timeupdate', handleTimeUpdate);
                audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
                audio.removeEventListener('play', handlePlay);
                audio.removeEventListener('pause', handlePause);
                audio.removeEventListener('ended', handleEnded);
            }
        };
    }, [audioRef, volume]);

    const handleVolumeChange = useCallback((e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
    }, []);

    const formatTime = useCallback((seconds) => {
        if (!seconds && seconds !== 0) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' + secs : secs}`;
    }, []);

    const getAudioStatus = useCallback(() => {
        if (prepTime > 0) return 'Get Ready';
        if (audioPlaying) return 'Playing Audio';
        return 'Audio Complete';
    }, [prepTime, audioPlaying]);

    return (
        <div className="audio-playing-box bg-white rounded-lg shadow p-4 mt-4">
            <div className="flex justify-between items-start">
                <div className="flex-grow">
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <h3 className="text-lg font-semibold">Audio Playback</h3>
                            <p className={`text-sm ${prepTime > 0 ? 'text-yellow-600' : audioPlaying ? 'text-green-600' : 'text-gray-600'}`}>
                                {getAudioStatus()}
                            </p>
                        </div>
                        <div className="text-sm text-gray-600">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                    </div>
                    
                    <div className="relative h-2 bg-gray-200 rounded-full mt-2">
                        <div 
                            className={`absolute h-full rounded-full transition-all ${
                                prepTime > 0 ? 'bg-yellow-500' : 
                                audioPlaying ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${audioProgress}%` }}
                        />
                    </div>
                </div>

                <div className="ml-4 flex items-center">
                    <div className="relative group">
                        <button 
                            className="p-2 hover:bg-gray-100 rounded-full"
                            type="button"
                            aria-label="Volume Control"
                        >
                            <svg 
                                width="20" 
                                height="20" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-gray-600"
                            >
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                {volume > 0.1 && (
                                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                )}
                                {volume > 0.5 && (
                                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                                )}
                            </svg>
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-white shadow-lg rounded p-2">
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.01" 
                                value={volume} 
                                onChange={handleVolumeChange}
                                className="h-24 -rotate-90 transform origin-bottom"
                                aria-label="Volume"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}, (prev, next) => {
    return prev.audioPlaying === next.audioPlaying && 
           prev.prepTime === next.prepTime &&
           prev.audioRef === next.audioRef;
});

const AudioBox = memo(({ audioUrl, audioRef, onLoadedMetadata }) => {
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.load();
        }
    }, [audioUrl, audioRef]);

    return (
        <div className="audio-box">
            <audio 
                src={audioUrl} 
                ref={audioRef}
                preload="auto"
                onLoadedMetadata={onLoadedMetadata}
                onError={(e) => {
                    console.error('Audio loading error:', e);
                }}
                style={{ display: 'none' }}
            />
        </div>
    );
}, (prev, next) => {
    return prev.audioUrl === next.audioUrl;
});

const Question = memo(({ data, prepTime, audioPlaying, recordingTime, status, audioRef, onAudioLoad }) => {
    const dummyData = useMemo(() => ({
        question: {
            audioUrl: dummyAudio,
            paragraph: "This is a sample repeat sentence question. Please listen and repeat."
        },
        questionType: "repeatSentence"
    }), []);
    
    const isValidQuestionType = useMemo(() => {
        return data?.questionType === "repeatSentence" || data?.questionType === "readAloud";
    }, [data?.questionType]);

    const questionData = useMemo(() => {
        if (!data?.question?.audioUrl || !isValidQuestionType) {
            return dummyData;
        }
        return data;
    }, [data, isValidQuestionType, dummyData]);
    
    return (
        <div className="question-container p-4 bg-white rounded-lg shadow">
            <h2 className='font-bold text-xl mb-4'>
                You will hear a sentence. Please repeat the sentence exactly as you hear it. You will have 15 seconds to respond.
            </h2>
            <AudioBox 
                audioUrl={questionData.question.audioUrl}
                audioRef={audioRef}
                onLoadedMetadata={onAudioLoad}
            />
            <AudioPlayingBox 
                audioPlaying={audioPlaying} 
                prepTime={prepTime}
                audioRef={audioRef}
            />
            <RecordingBox 
                prepTime={prepTime}
                recordingTime={recordingTime} 
                status={status}
            />
            <p className="mt-4 text-gray-600 italic">
                Text: {questionData.question.paragraph}
            </p>
            <div className="mt-4 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">
                    Status: {status} | Prep Time: {prepTime}s | Recording Time: {recordingTime}s
                </p>
            </div>
        </div>
    );
}, (prev, next) => {
    return prev.prepTime === next.prepTime &&
           prev.audioPlaying === next.audioPlaying &&
           prev.recordingTime === next.recordingTime &&
           prev.status === next.status &&
           prev.data?.question?.paragraph === next.data?.question?.paragraph;
});

const RepeatSentence = ({ data, onSubmit }) => {
    const [state, setState] = useState({
        prepTime: 4,
        audioPlaying: false,
        recordingTime: 0,
        hasStartedRecording: false,
        recording: false,
        status: "Get Ready",
        audioLoaded: false,
        hasAttemptedPlay: false,
        isSubmitting: false
    });

    const audioRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);

    const handleAudioLoad = useCallback((e) => {
        setState(prev => ({ ...prev, audioLoaded: true }));
    }, []);

    const playAudioAfterPrepTime = useCallback(() => {
        if (state.hasAttemptedPlay) return;

        if (!audioRef.current) {
            console.error('Audio reference not available');
            return;
        }

        setState(prev => ({ ...prev, hasAttemptedPlay: true }));

        audioRef.current.load();
        audioRef.current.currentTime = 0;
        
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    setState(prev => ({ 
                        ...prev, 
                        status: "Playing Audio",
                        audioPlaying: true,
                        audioLoaded: true
                    }));

                    audioRef.current.onended = () => {
                        setState(prev => ({ 
                            ...prev, 
                            audioPlaying: false,
                            status: "Audio Complete"
                        }));
                        startRecording();
                    };
                })
                .catch(error => {
                    console.error('Audio play failed:', error);
                    setState(prev => ({ ...prev, hasAttemptedPlay: false }));
                    
                    setTimeout(() => {
                        if (audioRef.current) {
                            audioRef.current.play()
                                .then(() => {
                                    setState(prev => ({ 
                                        ...prev, 
                                        status: "Playing Audio",
                                        audioPlaying: true,
                                        audioLoaded: true
                                    }));
                                })
                                .catch(err => {
                                    console.error('Audio retry failed:', err);
                                    setState(prev => ({ ...prev, hasAttemptedPlay: false }));
                                    Swal.fire({
                                        title: "Error",
                                        text: "Failed to play audio. Please try again.",
                                        icon: 'error',
                                        confirmButtonText: 'OK'
                                    });
                                });
                        }
                    }, 1000);
                });
        }
    }, [state.audioLoaded, state.hasAttemptedPlay]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && state.recording) {
            setState(prev => ({ 
                ...prev, 
                recording: false,
                status: "Processing Recording...",
                isSubmitting: true
            }));
            mediaRecorderRef.current.stop();
        }
    }, [state.recording]);

    useEffect(() => {
        setState({
            prepTime: 4,
            audioPlaying: false,
            recordingTime: 0,
            hasStartedRecording: false,
            recording: false,
            status: "Get Ready",
            audioLoaded: false,
            hasAttemptedPlay: false,
            isSubmitting: false
        });

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current.onended = null;
            }
            if (mediaRecorderRef.current && state.recording) {
                mediaRecorderRef.current.stop();
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            }
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [data]);

    useEffect(() => {
        const updateTimer = () => {
            if (state.prepTime > 0) {
                setState(prev => ({
                    ...prev,
                    prepTime: prev.prepTime - 1,
                    status: `Get Ready: ${prev.prepTime - 1}s`
                }));
            }
        };

        if (state.prepTime > 0) {
            timerRef.current = setTimeout(updateTimer, 1000);
        } else if (state.prepTime === 0 && !state.hasAttemptedPlay) {
            playAudioAfterPrepTime();
        } else if (state.recordingTime > 0) {
            setState(prev => ({ 
                ...prev,
                recordingTime: prev.recordingTime - 1,
                status: `Recording Now: ${prev.recordingTime - 1}s left`
            }));
            timerRef.current = setTimeout(updateTimer, 1000);
        } else if (state.recordingTime === 0 && state.hasStartedRecording) {
            setState(prev => ({ ...prev, status: "Recording Completed" }));
            stopRecording();
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [
        state.prepTime,
        state.recordingTime,
        state.hasStartedRecording,
        state.audioPlaying,
        state.audioLoaded,
        state.hasAttemptedPlay,
        playAudioAfterPrepTime,
        stopRecording
    ]);

    const handleSubmission = async (audioBlob) => {
        try {
            await onSubmit?.(audioBlob);
            setState(prev => ({ 
                ...prev, 
                status: "Submission Complete",
                isSubmitting: false
            }));
        } catch (error) {
            console.error('Submission failed:', error);
            setState(prev => ({ 
                ...prev, 
                status: "Submission Failed",
                isSubmitting: false
            }));
            
            Swal.fire({
                title: "Submission Error",
                text: "Failed to submit your recording. Don't worry, you can proceed to the next question.",
                icon: 'warning',
                confirmButtonText: 'OK'
            });
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
                handleSubmission(audioBlob);
            };

            mediaRecorderRef.current.start();
            setState(prev => ({
                ...prev,
                recording: true,
                recordingTime: 15,
                hasStartedRecording: true,
                status: "Recording Started"
            }));
        } catch (error) {
            console.error('Recording error:', error);
            setState(prev => ({
                ...prev,
                status: "Recording Failed",
                hasStartedRecording: false
            }));
            Swal.fire({
                title: "Error",
                text: "Failed to start recording. Please check your microphone permissions.",
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    return (
        <div className="repeat-sentence-container p-4">
            <Question 
                data={data}
                prepTime={state.prepTime}
                audioPlaying={state.audioPlaying}
                recordingTime={state.recordingTime}
                status={state.status}
                audioRef={audioRef}
                onAudioLoad={handleAudioLoad}
            />
            {state.isSubmitting && (
                <div className="mt-4 text-center">
                    <p className="text-gray-600">Submitting your recording...</p>
                </div>
            )}
        </div>
    );
};

export default memo(RepeatSentence); 