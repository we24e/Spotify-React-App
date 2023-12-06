import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AccessTokenContext } from '../AccessTokenContext';
import { likeItem, unlikeItem, checkIfUserLikedItem } from '../Likes';
import * as client from '../users/client';
import { fetchReviewsForItem, createReview, fetchReviewsByUser, deleteReview } from '../Reviews';
import * as playlistClient from '../Playlists/client';

function Details() {
    const location = useLocation();
    const { accessToken } = useContext(AccessTokenContext);
    const [searchParams] = useSearchParams();
    const identifier = searchParams.get('identifier');
    const type = searchParams.get('type');
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [reviewText, setReviewText] = useState('');
    const [reviews, setReviews] = useState([]);
    const [userHasReviewed, setUserHasReviewed] = useState(false);
    const [checkingReview, setCheckingReview] = useState(true);
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState('');
    const navigate = useNavigate();

    const fetchPlaylists = async () => {
        if (profile) {
            try {
                const userPlaylists = await playlistClient.fetchPlaylistsByUser(profile._id);
                setPlaylists(userPlaylists);
            } catch (error) {
                console.error('Error fetching playlists:', error);
            }
        }
    };

    const handleAddToPlaylist = async () => {
        if (!selectedPlaylist) {
            alert("Please select a playlist.");
            return;
        }

        try {
            await playlistClient.addTrackToPlaylist(selectedPlaylist, identifier);
            alert("Track added to playlist successfully.");
        } catch (error) {
            console.error('Error adding track to playlist:', error);
        }
    };

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
        const fetchInitialData = async () => {
            if (profile && identifier) {
                setCheckingReview(true);
                await checkUserReview();
                setCheckingReview(false);
            }
        };

        fetchInitialData();
    }, [profile, identifier]);

    useEffect(() => {
        if (identifier && type && accessToken) {
            fetchDetail();
        }
        fetchProfile();
        checkUserReview();
        fetchReviews();
    }, [identifier, type, accessToken]);

    const fetchReviews = async () => {
        try {
            const fetchedReviews = await fetchReviewsForItem(identifier);
            setReviews(fetchedReviews);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };
    useEffect(() => {
        if (accessToken && profile) {
            fetchPlaylists();
        }
    }, [accessToken, profile]);

    const handleReviewSubmit = async () => {
        try {
            if (profile && reviewText) {
                await createReview(profile._id, reviewText, type, identifier);
                console.log('Review submitted successfully');
                setReviewText('');
                setUserHasReviewed(true);
                fetchReviews();
            } else {
                console.error('Error: Profile not found or review text empty');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };

    const renderAddToPlaylistSection = () => {
        console.log(playlists.length);
        if (type === 'track' && playlists.length > 0) {
            return (
                <div>
                    <h4>Add to Playlist</h4>
                    <select value={selectedPlaylist} onChange={(e) => setSelectedPlaylist(e.target.value)}>
                        <option value="">Select a playlist</option>
                        {playlists.map(playlist => (
                            <option key={playlist._id} value={playlist._id}>{playlist.title}</option>
                        ))}
                    </select>
                    <button onClick={handleAddToPlaylist}>Add to Playlist</button>
                </div>
            );
        }
        return null;
    };

    const renderReviews = () => (
        <div>
            <h4>Reviews:</h4>
            {reviews.map((review, index) => (
                <div key={index}>
                    <p>{review.userId.username}: {review.reviewText}</p>
                </div>
            ))}
        </div>
    );

    const checkUserReview = async () => {
        if (profile) {
            try {
                const userReviews = await fetchReviewsByUser(profile._id);
                const hasReviewed = userReviews.some(review => review.itemID === identifier);
                setUserHasReviewed(hasReviewed);
            } catch (error) {
                console.error('Error checking user review:', error);
            }
        }
    };

    const renderReviewSection = () => {
        if (!profile || checkingReview) {
            return <div>Please login to Add a Review</div>;
        }
        if (userHasReviewed) {
            const userReview = reviews.find(review => review.userId._id === profile?._id);
            return (
                <div>
                    <h4>Your Review:</h4>
                    <p>{userReview?.reviewText}</p>
                    <button onClick={() => handleReviewDelete(userReview?._id)}>Delete Review</button>
                </div>
            );
        } else {
            return (
                <div>
                    <h3>Write a Review:</h3>
                    <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Your review here..."
                    />
                    <button onClick={handleReviewSubmit}>Submit Review</button>
                </div>
            );
        }
    };

    const handleReviewDelete = async (reviewId) => {
        console.log('Deleting review with id:', reviewId);
        try {
            await deleteReview(reviewId);
            setUserHasReviewed(false);
            fetchReviews();
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };

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
            <h3>Reviews:</h3>
            {renderAddToPlaylistSection()}
            {renderReviewSection()}
            {renderReviews()}
        </div>
    );
}

export default Details;