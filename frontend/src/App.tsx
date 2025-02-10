import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

interface Movie {
    id: string;
    title: string;
    release_date: string;
    character: string;
    poster_path: string;
    vote_average: number;
}

interface Credits {
    cast: Movie[];
}

interface ActorFilmCreditsResponse {
    credits: Credits;
    actorName: string;
    averageRating: any;
}

const ActorFilmCredits: React.FC = () => {
    const [actorName, setActorName] = useState<string>('');
    const [credits, setCredits] = useState<Credits | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [actorNameFromAPI, setActorNameFromAPI] = useState<string | null>(null);
    const [averageRating, setAverageRating] = useState<any | null>(null);
    const [sortOption, setSortOption] = useState<string>('title');

    const handleSearch = async () => {
        if (!actorName) {
            setError('Please enter an actor\'s name.');
            return;
        }

        setLoading(true);
        setError(null);
        setActorNameFromAPI(null); // Reset the actor name from API

        try {
            const response = await axios.get<ActorFilmCreditsResponse>(`https://celebscores-backend.azurewebsites.net/api/celebscores?name=${encodeURIComponent(actorName)}`);
            setCredits(response.data.credits);
            setActorNameFromAPI(response.data.actorName); // Set the actor name from API
            setAverageRating(response.data.averageRating); // Set the average rating
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                // Handle 404 error (actor not found)
                setError(error.response.data.error); // Display the specific error message
                setCredits(null); // Clear the credits
            } else {
                // Handle other errors
                console.error('Error fetching data:', error);
                setError('Failed to fetch data. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const getSortedMovies = () => {
      if (!credits) return [];

      return [...credits.cast].sort((a, b) => {
          if (sortOption === 'title_desc') {
              return a.title.localeCompare(b.title); // Sort by Title (A-Z)
          } else if (sortOption === 'title_asc') {
              return b.title.localeCompare(a.title); // Sort by Title (Z-A)
          } else if (sortOption === 'rating_desc') {
              return b.vote_average - a.vote_average; // Sort by Rating (Highest First)
          } else if (sortOption === 'rating_asc') {
              return a.vote_average - b.vote_average; // Sort by Rating (Lowest First)
          } else if (sortOption === 'release_date_desc') {
            return new Date(b.release_date).getTime() - new Date(a.release_date).getTime(); // Sort by Release Date (Newest First)
          } else if (sortOption === 'release_date_asc') {
              return new Date(a.release_date).getTime() - new Date(b.release_date).getTime(); // Sort by Release Date (Oldest First)
          }
          return 0;
      });
  };

    return (
      <div className="container">
          <h1>Celeb Scores</h1>
          <div className="search-bar">
              <input
                  type="text"
                  placeholder="Enter actor's name"
                  value={actorName}
                  onChange={(e) => setActorName(e.target.value)}
              />
              <button onClick={handleSearch} disabled={loading}>
                {loading ? <div className="loading-spinner"></div> : 'Search'}
              </button>
          </div>
  
          {error && <div className="error">{error}</div>}
  
          {credits && credits.cast.length > 0 && (
              <div className="results">
                  <h2>Results for "{actorNameFromAPI}"</h2>
                  {averageRating !== "N/A" && <p>Average Film Rating: {averageRating}</p>}
                  <div className="sorting">
                        <label>Sort by: </label>
                        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                            <option value="title_desc">Title (A-Z)</option>
                            <option value="title_asc">Title (Z-A)</option>
                            <option value="release_date_desc">Release Date (New-Old)</option>
                            <option value="release_date_asc">Release Date (Old-New)</option>
                            <option value="rating_desc">Rating (High-Low)</option>
                            <option value="rating_asc">Rating (Low-High)</option>
                        </select>
                    </div>
                    <div className="movie-grid">
                        {getSortedMovies().map((movie: Movie) => (
                            <div key={movie.id} className="movie-card">
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                    alt={movie.title}
                                />
                                <div className="movie-info">
                                    <strong>{movie.title}</strong>
                                    <div className="release-date">Release Date: {movie.release_date}</div>
                                    <div className="character">Character: {movie.character}</div>
                                    <div className="rating">Rating: {movie.vote_average}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          {credits && credits.cast.length === 0 && actorNameFromAPI && (
              <div className="no-results">No movies found for {actorNameFromAPI}</div>
          )}
      </div>
  );
};

export default ActorFilmCredits;
