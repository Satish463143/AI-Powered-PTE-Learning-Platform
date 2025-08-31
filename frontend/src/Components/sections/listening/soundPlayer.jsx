import React, { useRef, useEffect, useState } from 'react';


const SoundPlayer = ({ audioFile, hideRedo = false, onAudioEnd, autoPlay = false }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [redoUsed, setRedoUsed] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const maxPlays = 2; // Maximum number of times the audio can be played
  
  // Set up the audio source whenever it changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioFile) return;
    
    // Reset states when audio source changes
    setIsPlaying(false);
    setProgress(0);
    setPlayCount(0);
    setRedoUsed(false);
    setHasAutoPlayed(false);
    
    try {
      // Set the source and load the audio
      audio.src = typeof audioFile === 'string' ? audioFile : audioFile.default || audioFile;
      audio.preload = 'auto';
      audio.load();
    } catch (error) {
      console.error("Error setting audio source:", error);
    }
  }, [audioFile]);

  // Auto-play when audio is loaded and autoPlay is true
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioFile || !autoPlay || hasAutoPlayed) return;

    const handleCanPlay = () => {
      if (autoPlay && !isPlaying && playCount === 0 && audio.paused && !hasAutoPlayed) {
        setHasAutoPlayed(true);
        audio.play()
          .then(() => setIsPlaying(true))
          .catch(error => {
            console.error("Auto-play error:", error);
            setHasAutoPlayed(false); // Reset flag if auto-play fails
          });
      }
    };

    audio.addEventListener('canplay', handleCanPlay);
    
    // If audio is already loaded, try to play immediately
    if (audio.readyState >= 2 && audio.paused && !hasAutoPlayed) {
      handleCanPlay();
    }

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [audioFile, autoPlay, isPlaying, playCount, hasAutoPlayed]);

  // Set up event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleTimeUpdate = () => {
      const currentProgress = (audio.currentTime / audio.duration) * 100;
      setProgress(isNaN(currentProgress) ? 0 : currentProgress);
    };
    
    const handleLoadedMetadata = () => {
      if (!isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(100);
      setPlayCount(prevCount => prevCount + 1);
      // Call the onAudioEnd callback when audio finishes
      if (onAudioEnd) {
        onAudioEnd();
      }
    };
    
    const handlePlay = () => {
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
    };
    
    // Add event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    
    // Clean up event listeners
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [onAudioEnd]);

  // Handle play/pause button click
  const handlePlay = () => {
    const audio = audioRef.current;
    if (!audio || !audioFile || playCount >= maxPlays) return;
    
    if (audio.paused) {
      // If the audio ended (completed), count as a new play attempt
      if (audio.currentTime >= audio.duration || audio.currentTime === 0) {
        // If already played maximum times, don't allow replay
        if (playCount >= maxPlays) return;
        
        // Incrementing playCount when starting from beginning
        if (audio.currentTime === 0 && !isPlaying) {
          setPlayCount(prevCount => prevCount < maxPlays ? prevCount : prevCount);
        }
      }
      
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(error => {
          console.error("Play error:", error);
          setIsPlaying(false);
        });
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  // Handle redo button click
  const handleRedo = () => {
    if (redoUsed || playCount >= maxPlays) return;
    
    const audio = audioRef.current;
    if (!audio || !audioFile) return;
    
    // Reset to beginning
    audio.currentTime = 0;
    setProgress(0);
    
    // Attempt to play
    audio.play()
      .then(() => {
        setIsPlaying(true);
        setRedoUsed(true);
      })
      .catch(error => console.error("Redo play error:", error));
  };

  // Format time display (e.g., "2:45")
  const formatTime = (seconds) => {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <>
    <div className="sound-player">
      <audio ref={audioRef} preload="auto" />
      
      <div className="player-controls">
        <button 
          className="control-button play-button" 
          onClick={handlePlay}
          disabled={!audioFile || playCount >= maxPlays}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>
        
        
      </div>
      
      <div className="progress-container">
        <input 
          type="range"  
          value={progress} 
          className="progress-bar"
          readOnly
          disabled={true}
        />
        
        <div className="time-display">
          <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="sound-wave-animation">
        {isPlaying && (
          <>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </>
        )}
      </div>
      </div>
      {!hideRedo && (
        <button 
          onClick={handleRedo} 
          disabled={redoUsed || !audioFile || playCount >= maxPlays}
          className="control-button redo-button"
          title="Replay"
        >
          ↺
        </button>
      )}
    </div>
    
      {!audioFile && (
        <div className="audio-status-message">
          No audio available
        </div>
      )}
      
      {playCount >= maxPlays && (
        <div className="audio-status-message">
          Maximum plays reached
        </div>
      )}
    </>
  );
};

export default SoundPlayer;
