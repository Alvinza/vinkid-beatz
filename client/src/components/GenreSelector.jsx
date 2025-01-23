import React from 'react';

// Genre selector component for filtering beats
const GenreSelector = ({ selectedGenre, setSelectedGenre }) => {
  // Predefined list of music genres
  const genres = [
    "Hip-Hop",
    "Trap",
    "R&B",
    "Drill",
    "Deep-House",
    "Amapiano",
    "Pop",
  ];

  return (
    // Flex container for genre buttons
    <div className="flex flex-wrap justify-center gap-2 px-4 py-2">
      {/* Map through genres and create buttons */}
      {genres.map((genre) => (
        <button
          key={genre}
          // Conditional styling based on selected genre
          className={`px-4 py-2 rounded-md text-sm md:text-base transition-all duration-300 ${
            selectedGenre === genre 
              ? "bg-blue-600 text-white" 
              : "bg-blue-100 hover:bg-blue-200 text-blue-800"
          }`}
          // Update selected genre on click
          onClick={() => setSelectedGenre(genre)}
        >
          {genre}
        </button>
      ))}
    </div>
  );
};

export default GenreSelector;
