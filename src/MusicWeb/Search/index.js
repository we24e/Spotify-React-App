import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AccessTokenContext } from '../AccessTokenContext';
import "./test.css";
import "./index.css";
import "../randomCss/galaxy.scss";
import { AiOutlineSearch } from "react-icons/ai";

function renderResults(results) {
    if (!results) return null;
    const maxLength = 25;
    function renderItemCard(item, type, imageUrl, name, displayInfo) {
        const handleAudioClick = (event) => {
            event.stopPropagation();
        };

        const renderPreview = () => {
            if (type === 'track' && item.preview_url) {
                return (
                    <audio
                        controls
                        src={item.preview_url}
                        style={{ width: '100%', maxWidth: '100%', marginTop: '10px' }}
                        onClick={handleAudioClick}
                    >
                        Your browser does not support the audio element.
                    </audio>
                );
            } else if (type === 'track') {
                return <p style={{ marginTop: '10px' }}>Preview Not Available</p>;
            }
            return null;
        };

        return (
            <div key={item.id} className="col">
                <Link to={`/details?identifier=${item.id}&type=${type}`} className="text-decoration-none text-primary">
                    <div className="card-container">
                        <div className="overlay"></div>
                        <div className="overlay"></div>
                        <div className="overlay"></div>
                        <div className="overlay"></div>
                        <div className="custom-card">
                            <img src={imageUrl} alt={name} className="card-img-top" />
                            <div className="card-body">
                                <h4 className="card-title text-start">{truncateText(name, maxLength)}</h4>
                                <p className="card-text text-start">{truncateText(displayInfo, maxLength)}</p>
                            </div>
                            <span className="chev">&rsaquo;</span>
                        </div>
                    </div>
                </Link>
            </div>
        );
    }


    function truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    const renderAlbums = (albums) => {
        return albums.items.map(album => renderItemCard(album, 'album', album.images[0]?.url, album.name, album.artists.map(artist => artist.name).join(', ')));
    };

    const renderTracks = (tracks) => {
        return tracks.items.map(track => renderItemCard(track, 'track', track.album.images[0]?.url, track.name, track.artists.map(artist => artist.name).join(', ')));
    };

    const renderArtists = (artists) => {
        return artists.items.map(artist => renderItemCard(artist, 'artist', artist.images[0]?.url, artist.name, artist.genres.join(', ')));
    };

    return (
        <div className="container-flex mt-4">
            <div className="row">
                {results.albums && renderAlbums(results.albums)}
                {results.tracks && renderTracks(results.tracks)}
                {results.artists && renderArtists(results.artists)}
            </div>
        </div>
    );
}

function SearchBar({ query, setQuery, placeholder }) {
    return (
        <input
            type="text"
            className="search-input"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
        />
    );
}

function Search() {
    const [query, setQuery] = useState('');
    const [type, setType] = useState('album');
    const [year, setYear] = useState('');
    const [results, setResults] = useState(null);
    const { accessToken } = useContext(AccessTokenContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [limit, setLimit] = useState(10);
    const [emptySearchError, setEmptySearchError] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    const toggleAdvancedSearch = () => {
        setShowAdvanced(!showAdvanced);
    };

    useEffect(() => {
        const storedResults = sessionStorage.getItem('searchResults');
        if (storedResults) {
            setResults(JSON.parse(storedResults));
        }
    }, []);

    const searchSpotify = async () => {
        if (!accessToken) {
            console.error('Access token is not available');
            return;
        }
        if (!query.trim()) {
            setEmptySearchError('Please enter something to search.');
            return;
        } else {
            setEmptySearchError('');
        }
        try {
            const encodedQuery = encodeURIComponent(year ? `${query} year:${year}` : query);
            const response = await axios.get('https://api.spotify.com/v1/search', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                params: {
                    q: encodedQuery,
                    type,
                    limit,
                    offset: 0
                }
            });
            setResults(response.data);
            sessionStorage.setItem('searchResults', JSON.stringify(response.data));
            navigate(`/search?criteria=${type}`);
        } catch (error) {
            console.error('Error during search:', error);
        }
    };


    return (
        <div className="container-fluid mt-1 ms-0 me-0 p-1">
            <div class="animation-wrapper">
                <div class="particle particle-1"></div>
                <div class="particle particle-2"></div>
                <div class="particle particle-3"></div>
                <div class="particle particle-4"></div>
            </div>

            <div className="search-container mt-3 mb-0">
                {emptySearchError && (
                    <div className="alert alert-danger m-2" role="alert">
                        {emptySearchError}
                    </div>
                )}
                <div className="search-bar">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search Anything..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="search-controls">
                        <select className="search-select" value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="album">Album</option>
                            <option value="track">Track</option>
                            <option value="artist">Artist</option>
                        </select>
                        <select className="search-select" value={limit} onChange={(e) => setLimit(e.target.value)}>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <button className="icon-button" onClick={searchSpotify}>
                            <AiOutlineSearch size={24} />
                        </button>
                    </div>
                </div>
            </div>
            {renderResults(results)}
        </div>
    );


}

export default Search;
