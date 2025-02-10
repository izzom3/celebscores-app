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
                  <div className="movie-grid">
                      {credits.cast.map((movie: Movie) => (
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
