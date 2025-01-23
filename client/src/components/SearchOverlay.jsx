import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const SearchOverlay = ({ isOpen, onClose }) => {
  // State to manage search query
  const [searchQuery, setSearchQuery] = useState('');

  // Navigation hook to redirect after search
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();

    // Only perform search if query is not empty
    if (searchQuery.trim()) {
      // Navigate to beats page with search query
      navigate(`/beats?search=${encodeURIComponent(searchQuery)}`);
      
      // Close overlay and reset search query
      onClose();
      setSearchQuery('');
    }
  };

  // Render nothing if overlay is closed
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-start justify-center">
      <div className="w-full max-w-4xl mt-24 px-4">
        {/* Close button for overlay */}
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search input form */}
        <form onSubmit={handleSearch} className="w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search beats by title or genre..."
            className="w-full bg-transparent text-white text-xl md:text-2xl border-b-2 border-white focus:border-blue-500 outline-none px-4 py-2"
            autoFocus
          />
        </form>
      </div>
    </div>
  );
};

export default SearchOverlay;
