// Displays beats from backend, allows filtering, sorting, search, play/pause, and adding to cart
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Heart,
  ShoppingCart,
  Play,
  Pause,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { motion } from "motion/react";
import { useCart } from '../context/CartContext';
import { toast } from "react-toastify";
import GenreSelector from './GenreSelector';

function BeatStore() {
  // State management for various features
  const { addToCart } = useCart();
  const [beats, setBeats] = useState([]); // Stores all beats
  const [filteredBeats, setFilteredBeats] = useState([]); // Stores filtered beats based on search/genre
  const [selectedGenre, setSelectedGenre] = useState(""); // Currently selected music genre
  const [searchQuery, setSearchQuery] = useState(""); // User's search input
  const [playingBeat, setPlayingBeat] = useState(null); // Currently playing beat
  const [isPlaying, setIsPlaying] = useState(false); // Playing state of audio
  const [sortOption, setSortOption] = useState("new"); // How beats are sorted
  const [currentBeatSrc, setCurrentBeatSrc] = useState(null); // Source URL of current beat

  // References and hooks for routing and audio
  const audioRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Handles adding a beat to the shopping cart
  const handleAddToCart = (beat) => {
    const added = addToCart(beat);
    if (added) {
      toast.success("Beat added to cart.");
    }
  };

  // Handles search functionality and updates URL
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/beats?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Gets search query from URL parameters
  const query = new URLSearchParams(location.search).get("search") || "";

  // Fetches beats from the API based on selected genre
  useEffect(() => {
    const fetchBeats = async () => {
      try {
        const response = selectedGenre
          ? await axios.get(`https://vinkid-beatz-backend.onrender.com/api/beats/genre/${selectedGenre}`)
          : await axios.get("https://vinkid-beatz-backend.onrender.com/api/beats");
        setBeats(response.data);
        setFilteredBeats(response.data);
      } catch (err) {
        console.error("Error fetching beats:", err);
      }
    };
    fetchBeats();
  }, [selectedGenre]);

  // Filters and sorts beats based on search query and sort option
  useEffect(() => {
    let filterBeats = query || searchQuery
      ? beats.filter((beat) =>
          beat.title.toLowerCase().includes((query || searchQuery).toLowerCase()) ||
          beat.genre.toLowerCase().includes((query || searchQuery).toLowerCase())
        )
      : beats;

    // Sort beats based on selected option
    if (sortOption === "new") {
      filterBeats = [...filterBeats].sort((a, b) => {
        const dateA = a.releaseDate ? new Date(a.releaseDate) : new Date(parseInt(a._id.substring(0, 8), 16) * 1000);
        const dateB = b.releaseDate ? new Date(b.releaseDate) : new Date(parseInt(b._id.substring(0, 8), 16) * 1000);
        return dateB - dateA;
      });
    } else if (sortOption === "old") {
      filterBeats = [...filterBeats].sort((a, b) => {
        const dateA = a.releaseDate ? new Date(a.releaseDate) : new Date(parseInt(a._id.substring(0, 8), 16) * 1000);
        const dateB = b.releaseDate ? new Date(b.releaseDate) : new Date(parseInt(b._id.substring(0, 8), 16) * 1000);
        return dateA - dateB;
      });
    } else if (sortOption === "low") {
      filterBeats = [...filterBeats].sort((a, b) => a.price - b.price);
    } else if (sortOption === "high") {
      filterBeats = [...filterBeats].sort((a, b) => b.price - a.price);
    }

    setFilteredBeats(filterBeats);
  }, [query, searchQuery, beats, sortOption]);

// Handles audio playback when beat or playing state changes
  useEffect(() => {
    if (audioRef.current && playingBeat) {
      const newBeatSrc = playingBeat.audio;

      // Only update audio source if it's a different beat
      if (newBeatSrc !== currentBeatSrc) {
        audioRef.current.src = newBeatSrc;
        setCurrentBeatSrc(newBeatSrc);
      }

      // Play or pause based on isPlaying state
      if (isPlaying) {
        audioRef.current
          .play()
          .catch((err) => console.error("Error playing audio:", err));
      } else {
        audioRef.current.pause();
      }
    }
  }, [playingBeat, isPlaying, currentBeatSrc]);

  // Handles play/pause functionality for beats
  const playBeat = (beat) => {
    if (playingBeat && playingBeat._id === beat._id) {
      setIsPlaying(!isPlaying); // Toggle play/pause for current beat
    } else {
      setPlayingBeat(beat); // Start playing new beat
      setIsPlaying(true);
    }
  };

  // Plays the next beat in the filtered list
  const nextBeat = () => {
    if (playingBeat && filteredBeats.length > 0) {
      const currentIndex = filteredBeats.findIndex(
        (beat) => beat._id === playingBeat._id
      );
      const nextIndex = (currentIndex + 1) % filteredBeats.length;
      setPlayingBeat(filteredBeats[nextIndex]);
      setIsPlaying(true);
    }
  };

  // Plays the previous beat in the filtered list
  const previousBeat = () => {
    if (playingBeat && filteredBeats.length > 0) {
      const currentIndex = filteredBeats.findIndex(
        (beat) => beat._id === playingBeat._id
      );
      const prevIndex = currentIndex === 0 ? filteredBeats.length - 1 : currentIndex - 1;
      setPlayingBeat(filteredBeats[prevIndex]);
      setIsPlaying(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      transition={{ duration: 2 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="App">
        <h1 className="store-title">Beat Store</h1>

        {/* Search input section */}
        <div className="inputField">
          <input
            type="text"
            placeholder="Search beats by title or genre"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button className="search-button" onClick={handleSearch}>
            <i className="fas fa-search"></i>
          </button>
        </div>

        {/* Sort options dropdown */}
        <div className="sort-container">
          <select
            className="sort-dropdown"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="new">Latest</option>
            <option value="old">Old to New</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>
        </div>

        {/* Genre selection component */}
        <GenreSelector selectedGenre={selectedGenre} setSelectedGenre={setSelectedGenre} />

        {/* Beat cards container */}
        <div className="beats-container container mb-40">
          {filteredBeats.length === 0 ? (
            // Show message when no beats are found
            <div className="no-results-message text-center py-8">
              <h2 className="text-2xl font-semibold text-gray-700">
                No beats found
              </h2>
              <p className="text-gray-500 mt-2">
                Loading, please wait a moment.. or try adjusting your search
              </p>
            </div>
          ) : (
            // Display beat cards
            filteredBeats.map((beat) => (
              <div
                className={`beat-card relative ${
                  playingBeat?._id === beat._id ? "playing" : ""
                }`}
                key={beat._id}
              >
                {/* Favorite button */}
                <button className="favorite-button absolute top-2 right-2 z-10 p-2 rounded-full transition-transform duration-300 hover:bg-blue-500 hover:scale-110">
                  <Heart className="w-4 h-4 text-black transition-colors duration-300 hover:text-white" />
                </button>

                <img
                  className="beat-image"
                  src={beat.picture}
                  alt={beat.title}
                />
                <div className="beat-details">
                  <div className="beat-info-container">
                    <h2 className="beat-title">{beat.title}</h2>
                    <p className="beat-info">Genre: {beat.genre}</p>
                    <p className="beat-info">BPM: {beat.bpm}</p>
                    <p className="beat-info">Price: ${beat.price}</p>
                  </div>
                  {/* Play and add to cart buttons */}
                  <div className="beat-actions flex items-center space-x-4 mt-12">
                    <button className="play-button" onClick={() => playBeat(beat)}>
                      {playingBeat?._id === beat._id && isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </button>
                    <button
                      className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition duration-300 addCart"
                      onClick={() => handleAddToCart(beat)}
                    >
                      <ShoppingCart className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Fixed music player at bottom */}
        {playingBeat && (
          <div className="music-player fixed bottom-0 left-0 right-0 bg-black text-white p-2 sm:p-4 z-50">
            <div className="container mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                {/* Currently playing beat info */}
                <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-1/3">
                  <img
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover"
                    src={playingBeat.picture}
                    alt={playingBeat.title}
                  />
                  <div className="player-info">
                    <h3 className="font-semibold text-base sm:text-lg truncate max-w-[150px] sm:max-w-full">
                      {playingBeat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300 hidden sm:block">
                      Genre: {playingBeat.genre}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-300 hidden sm:block">
                      BPM: {playingBeat.bpm}
                    </p>
                  </div>
                </div>

                {/* Audio controls */}
                <div className="flex items-center justify-center space-x-2 sm:space-x-4 w-full sm:w-2/3">
                  <button
                    className="text-white hover:text-gray-300"
                    onClick={previousBeat}
                  >
                    <SkipBack className="w-4 h-4 sm:w-6 sm:h-6" />
                  </button>
                  <audio
                    ref={audioRef}
                    controls
                    className="w-48 sm:w-96"
                    style={{ backgroundColor: "black" }}
                  />
                  <button
                    className="text-white hover:text-gray-300"
                    onClick={nextBeat}
                  >
                    <SkipForward className="w-4 h-4 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default BeatStore;
