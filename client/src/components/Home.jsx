import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState(""); // manage search input
  const navigate = useNavigate();

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Navigate to beats page with search query if not empty
    if (searchQuery.trim()) {
      navigate(`/beats?search=${encodeURIComponent(searchQuery)}`);
    }
  };
  const homePage = () => {
    navigate('/beats')
  }

  return (
    // Hero section with search functionality
    <div className="hero">
      <div className="hero-text container">
        <h1 className="hero-title">High Quality Beats!</h1>
        
        {/* Search form */}
        <form className="inputField" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search your tracks here"
            value={searchQuery}
            // Update search query state on input change
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {/* Search button with icon */}
          <button className="search-button" type="submit">
            <i className="fas fa-search"></i>
          </button>
        </form>
 
        <div className="home-button">
          <button onClick={homePage} style={{marginLeft: "2rem"}}>
            Explore More
          </button>
        </div>
      </div>
    </div>
  );
};
export default Home;
