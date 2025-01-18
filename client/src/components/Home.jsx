import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault(); // Prevents default form submission behavior
    if (searchQuery.trim()) {
      navigate(`/beats?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const homePage = () => {
    navigate('/beats')
  }

  return (
      <div className="hero">
        <div className="hero-text container">
          <h1 className="hero-title">High Quality Beats!</h1>
          <form className="inputField" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search your tracks here"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button className="search-button" type="submit">
              <i className="fas fa-search"></i>
            </button>
          </form>
          <div className="home-button">
          <button onClick={homePage} style={{marginLeft: "10rem"}}>
            Explore More
          </button>
          </div>
        </div>
      </div>
  );
};

export default Home;
