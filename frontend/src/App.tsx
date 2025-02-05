import React, { useState } from 'react';
import axios from 'axios';

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
            const response = await axios.get<ActorFilmCreditsResponse>(`/api/celebscores?name=${encodeURIComponent(actorName)}`);
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
        <div>
            <h1>Celeb Scores</h1>
            <div>
                <input
                    type="text"
                    placeholder="Enter actor's name"
                    value={actorName}
                    onChange={(e) => setActorName(e.target.value)}
                />
                <button onClick={handleSearch} disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            {error && <div style={{ color: 'red' }}>{error}</div>}

            {credits && credits.cast.length > 0  &&(
                <div>
                    <h2>Results for "{actorNameFromAPI}"</h2>
                    {averageRating !== "N/A" && <p>Average Film Rating: {averageRating}</p>}
                    <ul>
                        {credits.cast.map((movie: Movie) => (
                            <li key={movie.id}>
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                    alt={movie.title}
                                    style={{ width: '100px', height: 'auto' }}
                                />
                                <strong>{movie.title}</strong> ({movie.release_date}) - {movie.character} - {movie.vote_average}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {credits && credits.cast.length === 0 && actorNameFromAPI && (
              <div>No movies found for {actorNameFromAPI}</div>
            )}
        </div>
    );
};

export default ActorFilmCredits;
