import React, { createContext, useState, useRef } from "react";

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [playingIndex, setPlayingIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());
  const [currentBeat, setCurrentBeat] = useState(null);

  const playAudio = (beat, index) => {
    if (audioRef.current.src !== `http://localhost:5000${beat.audio}`) {
      audioRef.current.src = `http://localhost:5000${beat.audio}`;
      audioRef.current.load();
    }

    audioRef.current.play();
    setPlayingIndex(index);
    setIsPlaying(true);
    setCurrentBeat(beat);
  };

  const pauseAudio = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

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

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};
