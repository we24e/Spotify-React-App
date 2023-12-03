import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAccessToken } from '../AccessTokenContext';
import "./index.css";

function renderResults(results) {
    if (!results) return null;

    function renderItemCard(item, type, imageUrl, name) {
        const renderPreview = () => {
            if (type === 'track') {
                if (item.preview_url) {
                    return (
                        <audio
                            controls
                            src={item.preview_url}
                            style={{ width: '100%', maxWidth: '100%', marginTop: '10px' }}
                        >
                            Your browser does not support the audio element.
                        </audio>
                    );
                } else {
                    return <p style={{ marginTop: '10px' }}>Preview Not Available</p>;
                }
            }
            return null;
        };

        return (
            <div key={item.id} className="col-md-4 mb-4">
                <div className="card equal-height-card">
                    <Link to={`/details?identifier=${item.id}&type=${type}`} className="text-decoration-none text-primary text-center">
                        <img src={imageUrl} alt={name} className="card-img-top" />
                        <div className="card-body">
                            <h5 className="card-title">{name}</h5>
                            {renderPreview()}
                        </div>
                    </Link>
                </div>
            </div>
        );
    }



    const renderAlbums = (albums) => {
        return albums.items.map(album => renderItemCard(album, 'album', album.images[0].url, album.name));
    };

    const renderTracks = (tracks) => {
        return tracks.items.map(track => renderItemCard(track, 'track', track.album.images[0].url, track.name));
    };

    const renderArtists = (artists) => {
        return artists.items.map(artist => renderItemCard(artist, 'artist', artist.images[0].url, artist.name));
    };

    return (
        <div className="container mt-4">
            <div className="row">
                {results.albums && renderAlbums(results.albums)}
                {results.tracks && renderTracks(results.tracks)}
                {results.artists && renderArtists(results.artists)}
            </div>
        </div>
    );
}

function Search() {
    const [query, setQuery] = useState('');
    const [type, setType] = useState('album');
    const [year, setYear] = useState('');
    const [results, setResults] = useState(null);
    const { accessToken, setAccessToken } = useAccessToken();
    const navigate = useNavigate();
    const [limit, setLimit] = useState(10);

    const getAccessToken = async () => {
        try {
            const response = await axios.post('http://localhost:4000/getAccessToken');
            const token = response.data.access_token;
            setAccessToken(token);
            return token;
        } catch (error) {
            console.error('Error fetching access token:', error);
            return null;
        }
    };

    const searchSpotify = async () => {
        let token = accessToken;
        if (!token) {
            token = await getAccessToken();
        }

        if (!token) {
            console.error('Access token is not available');
            return;
        }

        try {
            const encodedQuery = encodeURIComponent(year ? `${query} year:${year}` : query);
            const response = await axios.get('https://api.spotify.com/v1/search', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    q: encodedQuery,
                    type,
                    limit,
                    offset: 0
                }
            });
            setResults(response.data);
            navigate(`/search?criteria=${type}`);
        } catch (error) {
            console.error('Error during search:', error);
        }
    };

    return (
        <div className="container-fluid mt-2 ms-0 me-0 p-1">
            <div className="row align-items-end ms-1 me-1">
                <div className="col-md-5 mb-1 pe-1 ps-1">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search Anything"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <div className="col-md-2 mb-1 pe-1 ps-1">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Year (optional)"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                    />
                </div>
                <div className="col-md-2 mb-1 pe-1 ps-1">
                    <select
                        className="form-select"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="album">Album</option>
                        <option value="track">Track</option>
                        <option value="artist">Artist</option>
                    </select>
                </div>
                <div className="col-md-1 mb-1 pe-1 ps-1">
                    <select
                        className="form-select"
                        value={limit}
                        onChange={(e) => setLimit(e.target.value)}
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
                <div className="col-md-2 mb-1 pe-1 ps-1">
                    <button
                        className="btn btn-primary w-100"
                        onClick={searchSpotify}
                    >
                        Search
                    </button>
                </div>
            </div>

            {renderResults(results)}
        </div>
    );


}

export default Search;
