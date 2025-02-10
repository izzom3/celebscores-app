import React from 'react';
import Modal from 'react-modal';
import './App.css';

// Set the app element for accessibility
Modal.setAppElement('#root');

interface MovieDetails {
    id: number;
    title: string;
    overview: string;
    release_date: string;
    genres: string[];
    vote_average: number;
    vote_count: number;
    poster_path: string;
    cast: {
        id: number;
        name: string;
        character: string;
        profile_path: string;
    }[];
    trailer: {
        key: string;
        name: string;
    } | null;
}

interface MovieDetailsModalProps {
    movieDetails: MovieDetails;
    isOpen: boolean;
    onRequestClose: () => void;
}

const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({ movieDetails, isOpen, onRequestClose }) => {
    console.log('Opening modal with movie details:', movieDetails);
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Movie Details"
            className="modal"
            overlayClassName="overlay"
        >
            <button className="close-button" onClick={onRequestClose}>
                &times;
            </button>
            <h2>{movieDetails.title}</h2>
            <img
                src={`https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`}
                alt={movieDetails.title}
                style={{ width: '200px', height: 'auto' }}
            />
            <p><strong>Overview:</strong> {movieDetails.overview}</p>
            <p><strong>Release Date:</strong> {movieDetails.release_date}</p>
            <p><strong>Genres:</strong> {movieDetails.genres.join(', ')}</p>
            <p><strong>Rating:</strong> {movieDetails.vote_average} ({movieDetails.vote_count} votes)</p>
            <h3>Top Cast Members</h3>
            <ul>
                {movieDetails.cast.map((member) => (
                    <li key={member.id}>
                        <img
                            src={`https://image.tmdb.org/t/p/w200${member.profile_path}`}
                            alt={member.name}
                            style={{ width: '50px', height: 'auto' }}
                        />
                        <strong>{member.name}</strong> as {member.character}
                    </li>
                ))}
            </ul>
            <h3>Trailer</h3>
            {movieDetails.trailer ? (
                <iframe
                    width="560"
                    height="315"
                    src={`https://www.youtube.com/embed/${movieDetails.trailer.key}`}
                    title="Trailer"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            ) : (
                <p>No trailer available.</p>
            )}
        </Modal>
    );
};

export default MovieDetailsModal;