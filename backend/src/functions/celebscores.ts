import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Define the function to handle the request
export async function celebscores(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    // Get the actor's name from the query string
    const actorName = request.query.get('name');

    if (!actorName) {
        return {
            status: 400,
            body: JSON.stringify({
                error: 'Please provide an actor\'s name as a query parameter (e.g., ?name=Leonardo DiCaprio).',
            }),
            headers: {
                "Access-Control-Allow-Origin": "*",  // Allow frontend requests
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        };
    }

    try {
        // Step 1: Search for the actor's TMDB ID
        const searchResponse = await axios.get('https://api.themoviedb.org/3/search/person', {
            params: {
                query: actorName,
                include_adult: false,
                language: 'en-US',
                page: 1,
            },
            headers: {
                Authorization: `Bearer ${TMDB_API_KEY}`,
                accept: 'application/json',
            },
        });

        const actor = searchResponse.data.results[0];

        if (!actor) {
            return {
                status: 404,
                body: JSON.stringify({
                    error: `No actor found with the name "${actorName}".`,
                }),
                headers: {
                    "Access-Control-Allow-Origin": "*",  // Allow frontend requests
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                }
            };
        }

        const actorId = actor.id;
        const actorNameFromAPI = actor.name; // Get the actor's name from the API

        // Step 2: Fetch the actor's film credits
        const creditsResponse = await axios.get(`https://api.themoviedb.org/3/person/${actorId}/movie_credits`, {
            params: {
                language: 'en-US',
            },
            headers: {
                Authorization: `Bearer ${TMDB_API_KEY}`,
                accept: 'application/json',
            },
        });

        const movies = creditsResponse.data.cast;

        // Step 3: Calculate the average rating
        const ratings = movies
            .filter((movie: any) => movie.vote_average !== undefined && movie.vote_average > 0) // Exclude movies without ratings
            .map((movie: any) => movie.vote_average);

        const averageRating = ratings.length
            ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length
            : null; // Set to null if no ratings exist

        // Return the response as an object
        return {
            status: 200,
            jsonBody:{
                actorName: actorNameFromAPI, // Return the actor's name from the API
                credits: creditsResponse.data, // Return the TMDB API response
                averageRating: averageRating !== null ? averageRating.toFixed(1) : "N/A" // Rounded to 1 decimal place
            },
            headers: {
                "Access-Control-Allow-Origin": "*",  // Allow frontend requests
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        };
    } catch (error) {
        context.log('Error fetching data from TMDB:', error);

        // Return an error response
        return {
            status: 500,
            body: JSON.stringify({
                error: 'An error occurred while fetching data.',
            }),
            headers: {
                "Access-Control-Allow-Origin": "*",  // Allow frontend requests
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        };
    }
};

// Define the function to handle the movie details request
export async function movieDetails(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);
    // Get the movie ID from the query string
    const movieId = request.query.get('movieId');

    if (!movieId) {
        return {
            status: 400,
            body: JSON.stringify({
                error: 'Please provide a movie ID as a query parameter (e.g., ?movieId=12345).',
            }),
            headers: {
                "Access-Control-Allow-Origin": "*",  // Allow frontend requests
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        };
    }

    try {
        // Step 1: Fetch movie details
        const detailsResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
            params: {
                language: 'en-US',
            },
            headers: {
                Authorization: `Bearer ${TMDB_API_KEY}`,
                accept: 'application/json',
            },
        });

        // Step 2: Fetch cast members
        const creditsResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
            params: {
                language: 'en-US',
            },
            headers: {
                Authorization: `Bearer ${TMDB_API_KEY}`,
                accept: 'application/json',
            },
        });

        // Step 3: Fetch videos (trailers)
        const videosResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/videos`, {
            params: {
                language: 'en-US',
            },
            headers: {
                Authorization: `Bearer ${TMDB_API_KEY}`,
                accept: 'application/json',
            },
        });

        // Step 4: Format the response
        const movieDetails = {
            id: detailsResponse.data.id,
            title: detailsResponse.data.title,
            overview: detailsResponse.data.overview,
            release_date: detailsResponse.data.release_date,
            genres: detailsResponse.data.genres.map((genre: any) => genre.name),
            vote_average: detailsResponse.data.vote_average,
            vote_count: detailsResponse.data.vote_count,
            poster_path: detailsResponse.data.poster_path,
            cast: creditsResponse.data.cast.slice(0, 3).map((member: any) => ({
                id: member.id,
                name: member.name,
                character: member.character,
                profile_path: member.profile_path,
            })),
            trailer: videosResponse.data.results.find((video: any) => video.site === 'YouTube' && video.type === 'Trailer'),
        };

        // Return the response as an object
        return {
            status: 200,
            jsonBody: movieDetails,
            headers: {
                "Access-Control-Allow-Origin": "*",  // Allow frontend requests
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        };
    } catch (error) {
        context.log('Error fetching movie details:', error);

        // Return an error response
        return {
            status: 500,
            body: JSON.stringify({
                error: 'An error occurred while fetching movie details.',
            }),
            headers: {
                "Access-Control-Allow-Origin": "*",  // Allow frontend requests
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        };
    }
}

// Register the HTTP trigger handlers with the app
app.http('celebscores', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: celebscores,
});

app.http('movieDetails', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: movieDetails,
});