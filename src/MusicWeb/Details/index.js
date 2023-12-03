import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAccessToken } from '../AccessTokenContext';
import { likeItem, unlikeItem, checkIfUserLikedItem } from '../Likes';
import * as client from '../users/client';

function Details() {
    const location = useLocation();
    const { accessToken } = useAccessToken();
    const [searchParams] = useSearchParams();
    const identifier = searchParams.get('identifier');
    const type = searchParams.get('type');
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const navigate = useNavigate();
    const fetchDetail = async () => {
        if (!accessToken) {
            setError('No access token available');
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const url = `https://api.spotify.com/v1/${type}s/${identifier}`;
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setDetail(response.data);
            console.log("response.data", response.data);
        } catch (err) {
            console.error('Error fetching details:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfile = async () => {
        try {
            const profileData = await client.profile();
            setProfile(profileData);
            checkIfLiked(profileData._id, identifier);
        } catch (error) {
            console.error("Error profile (probably not logged in):", error);
        }
    };

    const checkIfLiked = async (userId, itemId) => {
        try {
            const isLikedResponse = await checkIfUserLikedItem(userId, itemId);
            setIsLiked(isLikedResponse);
        } catch (error) {
            console.error("Error checking if item is liked:", error);
        }
    };

    useEffect(() => {
        if (identifier && type && accessToken) {
            fetchDetail();
        }
        fetchProfile();
    }, [identifier, type, accessToken]);

    const handleLike = async () => {
        if (!profile) {
            alert('Please log in first.');
            navigate('/login');
            return;
        };

        if (type === 'album' && detail) {
            const albumDataToLike = {
                name: detail.name,
                releaseDate: detail.release_date,
                label: detail.label,
                image: detail.images[0].url,
                tracks: detail.tracks.items.map(track => ({
                    name: track.name,
                    duration: track.duration_ms,
                    previewUrl: track.preview_url,
                    spotifyLink: track.external_urls.spotify
                }))
            };

            try {
                await likeItem(profile._id, identifier, type, detail.name, albumDataToLike);
                setIsLiked(true);
            } catch (err) {
                console.error('Error liking item:', err);
            }
        }
        else if (type === 'track' && detail) {
            const trackDataToLike = {
                name: detail.name,
                duration: detail.duration_ms,
                previewUrl: detail.preview_url,
                spotifyLink: detail.external_urls.spotify,
                album: {
                    name: detail.album.name,
                    releaseDate: detail.album.release_date,
                    image: detail.album.images[0].url
                },
                artists: detail.artists.map(artist => ({
                    name: artist.name,
                    // spotifyLink: artist.external_urls.spotify
                }))
            };

            try {
                await likeItem(profile._id, identifier, type, detail.name, trackDataToLike);
                setIsLiked(true);
            } catch (err) {
                console.error('Error liking track:', err);
            }
        }

        else if (type === 'artist' && detail) {
            const artistDataToLike = {
                name: detail.name,
                popularity: detail.popularity,
                genres: detail.genres,
                followers: detail.followers.total,
                image: detail.images[0]?.url
            };

            try {
                await likeItem(profile._id, identifier, type, detail.name, artistDataToLike);
                setIsLiked(true);
            } catch (err) {
                console.error('Error liking artist:', err);
            }
        }
        else {
            console.error('Error liking item: invalid type or detail');
        }
    };



    const handleUnlike = async () => {
        if (!profile) {
            alert('Please log in first.');
            navigate('/login');
            return;
        }
        try {
            await unlikeItem(profile._id, identifier);
            setIsLiked(false);
        } catch (err) {
            console.error('Error unliking item:', err);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!detail) return <div>No Details Available</div>;

    const renderAlbumDetails = () => {
        if (!detail || type !== 'album') return null;

        return (
            <div>
                <h3>{detail.name}</h3>
                <p>Release Date: {detail.release_date}</p>
                <p>Label: {detail.label}</p>
                <p>Total Tracks: {detail.total_tracks}</p>
                {detail.images && <img src={detail.images[0].url} alt={detail.name} />}
                <h4>Tracks:</h4>
                <ul>
                    {detail.tracks.items.map((track, index) => (
                        <li key={track.id}>
                            <p>Track {index + 1}: {track.name}</p>
                            <p>Duration: {Math.floor(track.duration_ms / 60000)}:{((track.duration_ms % 60000) / 1000).toFixed(0)}</p>
                            {track.preview_url && <audio controls src={track.preview_url}>Preview</audio>}
                            <a href={track.external_urls.spotify} target="_blank" rel="noopener noreferrer">Listen on Spotify</a>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    const renderTrackDetails = () => {
        if (!detail || type !== 'track') return null;

        return (
            <div>
                <h3>{detail.name}</h3>
                <p>Album: {detail.album.name}</p>
                <p>Duration: {Math.floor(detail.duration_ms / 60000)}:{((detail.duration_ms % 60000) / 1000).toFixed(0)}</p>
                <p>Artists: {detail.artists.map(artist => artist.name).join(', ')}</p>
                {detail.preview_url ? (
                    <div>
                        <p>Preview:</p>
                        <audio controls src={detail.preview_url}>Preview not available</audio>
                    </div>
                ) : (
                    <div>
                        <p>Preview not available due to copyright.</p>
                    </div>
                )}
                <a href={detail.external_urls.spotify} target="_blank" rel="noopener noreferrer">Listen on Spotify</a>
                {detail.album.images && <img src={detail.album.images[0].url} alt={detail.album.name} />}
            </div>
        );
    };

    const renderArtistDetails = () => {
        if (!detail || type !== 'artist') return null;

        return (
            <div>
                <h3>{detail.name}</h3>
                <p>Genres: {detail.genres.join(', ')}</p>
                <p>Popularity: {detail.popularity}</p>
                <p>Followers: {detail.followers.total}</p>
                {detail.images && detail.images.length > 0 && (
                    <img src={detail.images[0].url} alt={detail.name} />
                )}
                <a href={detail.external_urls.spotify} target="_blank" rel="noopener noreferrer">Listen on Spotify</a>
            </div>
        );
    };
    return (
        <div>
            <h2>Details for {type}</h2>
            {type === 'album' ? renderAlbumDetails() : (type === 'track' ? renderTrackDetails() : renderArtistDetails())}
            <button onClick={isLiked ? handleUnlike : handleLike}>
                {isLiked ? 'Unlike' : 'Like'}
            </button>
        </div>
    );
}

export default Details;
