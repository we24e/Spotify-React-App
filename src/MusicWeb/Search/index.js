import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAccessToken } from '../AccessTokenContext';

function renderResults(results) {
    if (!results) return null;
    const renderAlbums = (albums) => {
        return albums.items.map(album => (
            <div key={album.id}>
                <img src={album.images[0].url} alt={album.name} />
                <h3>{album.name}</h3>
                <Link to={`/details?identifier=${album.id}&type=album`}>View Details</Link>
            </div>
        ));
    };
    const renderTracks = (tracks) => {
        return tracks.items.map(track => (
            <div key={track.id}>
                <img src={track.album.images[0].url} alt={track.name} />
                <h3>{track.name}</h3>
                <Link to={`/details?identifier=${track.id}&type=track`}>View Details</Link>
            </div>
        ));
    };

    const renderArtists = (artists) => {
        return artists.items.map(artist => (
            <div key={artist.id}>
                <img src={artist.images[0].url} alt={artist.name} />
                <h3>{artist.name}</h3>
                <Link to={`/details?identifier=${artist.id}&type=artist`}>View Details</Link>
            </div>
        ));
    };


    return (
        <div>
            {results.albums && renderAlbums(results.albums)}
            {results.tracks && renderTracks(results.tracks)}
            {results.artists && renderArtists(results.artists)}
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
                    limit: 10,
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
        <div>
            <input
                type="text"
                placeholder="Search query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <input
                type="text"
                placeholder="Year (optional)"
                value={year}
                onChange={(e) => setYear(e.target.value)}
            />
            <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="album">Album</option>
                <option value="track">Track</option>
                <option value="artist">Artist</option>
            </select>
            <button onClick={searchSpotify}>Search</button>

            {renderResults(results)}
        </div>
    );
}

export default Search;
