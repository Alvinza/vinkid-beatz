import React, { createContext, useState, useRef } from "react";

// Create context for managing audio playback state
export const AudioContext = createContext();

// Provider component to manage audio-related state and functions
export const AudioProvider = ({ children }) => {
  // State to track currently playing beat's index
  const [playingIndex, setPlayingIndex] = useState(null);
  
  // State to track if audio is currently playing
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Reference to the audio element
  const audioRef = useRef(new Audio());
  
  // State to track the current beat being played
  const [currentBeat, setCurrentBeat] = useState(null);

  // Function to play an audio beat
  const playAudio = (beat, index) => {
    // Update audio source if different from current source
    if (audioRef.current.src !== `https://vinkid-beatz-backend.onrender.com${beat.audio}`) {
      audioRef.current.src = `https://vinkid-beatz-backend.onrender.com${beat.audio}`;
      audioRef.current.load();
    }
    
    // Play the audio and update state
    audioRef.current.play();
    setPlayingIndex(index);
    setIsPlaying(true);
    setCurrentBeat(beat);
  };

  // Function to pause audio playback
  const pauseAudio = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  // Combine all state and methods to be passed via context
  const value = {
    playingIndex,
    isPlaying,
    audioRef,
    currentBeat,
    playAudio,
    pauseAudio,
    setPlayingIndex,
    setIsPlaying,
    setCurrentBeat,
  };

  // Provide context to child components
  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};
