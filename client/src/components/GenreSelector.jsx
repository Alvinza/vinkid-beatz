import React from 'react';

const GenreSelector = ({ selectedGenre, setSelectedGenre }) => {
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
    <div className="flex flex-wrap justify-center gap-2 px-4 py-2">
      {genres.map((genre) => (
        <button
          key={genre}
          className={`px-4 py-2 rounded-md text-sm md:text-base transition-all duration-300 ${
            selectedGenre === genre 
              ? "bg-blue-600 text-white" 
              : "bg-blue-100 hover:bg-blue-200 text-blue-800"
          }`}
          onClick={() => setSelectedGenre(genre)}
        >
          {genre}
        </button>
      ))}
    </div>
  );
};

export default GenreSelector;