import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { AccessTokenContext } from '../AccessTokenContext';
import { likeItem, unlikeItem, checkIfUserLikedItem } from '../Likes';
import * as client from '../users/client';
import { fetchReviewsForItem, createReview, fetchReviewsByUser, deleteReview } from '../Reviews';
import * as playlistClient from '../Playlists/client';
import { fetchItemDetails } from '../Search/util';
import * as albumClient from '../Albums';
import { Link } from 'react-router-dom';
import styles from './Details.module.css';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { FaPlay } from 'react-icons/fa';
import { FaPlus } from 'react-icons/fa';
import "../randomCss/galaxy.scss"
import { BiAlbum } from "react-icons/bi";
import { FaPlayCircle } from 'react-icons/fa';
import { RiDeleteBin2Line } from "react-icons/ri";
import { TbPlayerTrackNext } from "react-icons/tb";
import { BsPerson } from "react-icons/bs";
import { Carousel } from 'react-bootstrap';
import { fetchArtistTopTracks } from '../Search/util';
import { render } from '@testing-library/react';


function Details() {
    const location = useLocation();
    const { accessToken } = useContext(AccessTokenContext);
    const [searchParams, setSearchParams] = useSearchParams();
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
    const [fromLocalDb, setFromLocalDb] = useState(false);
    const navigate = useNavigate();
    const [currentTrack, setCurrentTrack] = useState(null);
    const [playingTrackId, setPlayingTrackId] = useState(null);
    const playTrack = (track) => {
        if (playingTrackId === track.id) {
            setPlayingTrackId(null);
        } else {
            setPlayingTrackId(track.id);
        }
    };

    const [isCurrentUserArtist, setIsCurrentUserArtist] = useState(false);
    const [selectedAlbum, setSelectedAlbum] = useState('');
    const [artistAlbums, setArtistAlbums] = useState([]);

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

    const fetchAlbumDetailsFromDB = async (albumId) => {
        try {
            return await albumClient.fetchAlbumById(albumId);
        } catch (error) {
            console.error('Error fetching album from DB:', error);
            return null;
        }
    };

    const fetchDetail = async () => {
        if (!accessToken || !identifier) {
            setError('No access token available');
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            let detailData;
            if (type === 'album') {
                detailData = await fetchAlbumDetailsFromDB(identifier);
                if (detailData && detailData.trackIDs) {
                    setFromLocalDb(true);
                    const trackDetailsPromises = detailData.trackIDs.map(trackId =>
                        fetchItemDetails(trackId, "track", accessToken)
                    );
                    const tracksDetails = await Promise.all(trackDetailsPromises);
                    detailData.tracks = { items: tracksDetails };
                }
            }
            if (type === 'track') {
                if (profile && profile.role === 'ARTIST') {
                    const trackDetails = await fetchItemDetails(identifier, "track", accessToken);
                    if (trackDetails && trackDetails.artists && trackDetails.artists.length > 0) {
                        trackDetails.artists.forEach(artist => {
                            if (artist.id === profile.artistID) {
                                console.log(`Match found for artist: ${artist.name}`);
                                setIsCurrentUserArtist(true);
                            }
                        });
                    }
                }
            }

            if (!detailData) {
                detailData = await fetchItemDetails(identifier, type, accessToken);
            }
            setDetail(detailData);
        } catch (err) {
            console.error('Error fetching details:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderAlbumTracks = () => {
        if (!detail || type !== 'album') return null;

        return detail.tracks.items.map((track, index) => (
            <li key={track.id} className={styles.trackListItem}>
                <div className={styles.trackDetails}>
                    <p>{index + 1}: {track.name}</p>
                    <p className={styles.trackArtists}>
                        {track.artists.map(artist => artist.name).join(', ')}
                    </p>
                </div>
                <button className={styles.playButton} onClick={() => playTrack(track)}>
                    <span className='me-4'>{formatDuration(track.duration_ms)}</span>
                    <FaPlay />
                </button>
                {playingTrackId === track.id && (
                    <div className={styles.audioPlayerContainer}>
                        <audio controls autoPlay src={track.preview_url}>
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                )}
            </li>
        ));
    };

    const formatDuration = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds.padStart(2, '0')}`;
    };

    const fetchProfile = async () => {
        try {
            const profileData = await client.profile();
            localStorage.setItem('userProfile', JSON.stringify(profileData));
            setProfile(profileData);
            checkIfLiked(profileData._id, identifier);
        } catch (error) {
            console.error("Error fetching profile:", error);
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
        fetchProfile();
    }, []);

    useEffect(() => {
        const storedProfile = localStorage.getItem('userProfile');
        if (storedProfile) {
            setProfile(JSON.parse(storedProfile));
            checkIfLiked(JSON.parse(storedProfile)._id, identifier);
        } else {
            fetchProfile();
        }
    }, []);

    useEffect(() => {
        if (identifier && type && accessToken) {
            fetchDetail();
        }
        checkUserReview();
        fetchReviews();
    }, [identifier, type, accessToken]);

    const fetchArtistAlbums = async () => {
        if (profile && profile.role === 'ARTIST') {
            try {
                const albums = await albumClient.fetchAlbumsByUser(profile._id);
                setArtistAlbums(albums);
            } catch (error) {
                console.error('Error fetching artist albums:', error);
            }
        }
    };

    useEffect(() => {
        if (profile && profile.role === 'ARTIST') {
            fetchArtistAlbums();
        }
    }, [profile]);

    const [topTracks, setTopTracks] = useState([]);
    useEffect(() => {
        if (detail && type === 'artist') {
            fetchArtistTopTracks(identifier, "US", accessToken).then(setTopTracks);
        }
    }, [detail, type, identifier, accessToken]);

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
    }, [accessToken, profile])

    useEffect(() => {
        if (profile && type === 'track' && detail) {
            const isArtist = detail.artists.some(artist => artist.id === profile.artistID);
            setIsCurrentUserArtist(isArtist);
        }
    }, [profile, detail, type]);

    useEffect(() => {
        if (isCurrentUserArtist) {
            fetchArtistAlbums();
        }
    }, [isCurrentUserArtist, profile]);

    useEffect(() => {
        console.log("Detail updated:", detail);
    }, [detail]);
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
        if (type === 'track' && playlists.length > 0) {
            return (
                <>
                    <select value={selectedPlaylist} onChange={(e) => setSelectedPlaylist(e.target.value)}>
                        <option value="">Select a playlist</option>
                        {playlists.map(playlist => (
                            <option key={playlist._id} value={playlist._id}>{playlist.title}</option>
                        ))}
                    </select>
                    <button onClick={handleAddToPlaylist} className={styles.addToPlaylistButton}>
                        <FaPlus />
                    </button>
                </>
            );
        }
        return null;
    };

    const renderReviews = () => (
        <div className={styles.reviewsContainer}>
            <h4>Reviews:</h4>
            {reviews.map((review, index) => (
                <div key={index} className={styles.reviewItem}>
                    <p>
                        <Link to={`/profile/${review.userId._id}`} className={`no-underline ${styles.reviewAuthorLink}`}>
                            {review.userId.username}
                        </Link>
                        : {review.reviewText}
                    </p>
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
            return <div className={styles.loginPrompt}>Please login to Add a Review</div>;
        }
        if (userHasReviewed) {
            const userReview = reviews.find(review => review.userId._id === profile?._id);
            return (
                <div className={styles.userReviewContainer}>
                    <div className={styles.yourReviewContainer}>
                        <p>Your Review: {userReview?.reviewText}</p>
                    </div>
                    <button onClick={() => handleReviewDelete(userReview?._id)} className={styles.deleteReviewButton}>
                        <RiDeleteBin2Line />
                    </button>
                </div>
            );
        } else {
            return (
                <div className={styles.reviewContainer}>
                    <h3>Write a Review</h3>
                    <div>
                        <textarea
                            className={styles.reviewTextarea}
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Your review here..."
                        />
                        <button onClick={handleReviewSubmit} className={styles.submitReviewButton}>
                            Submit Review
                        </button>
                    </div>
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

        if (detail) {
            try {
                await likeItem(profile._id, identifier, type);
                setIsLiked(true);
            } catch (err) {
                console.error('Error liking item:', err);
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

    const handleAddToAlbum = async (albumId) => {
        try {
            await albumClient.addTrackToAlbum(albumId, identifier);
            alert('Track added to album successfully.');
        } catch (error) {
            console.error('Error adding track to album:', error);
        }
    };
    const renderAddToAlbumSection = () => {
        if (isCurrentUserArtist && artistAlbums.length > 0) {
            return (
                <>
                    <select className='me-2' onChange={(e) => setSelectedAlbum(e.target.value)}>
                        <option value="">Select an album</option>
                        {artistAlbums.map(album => (
                            <option key={album._id} value={album._id}>{album.title}</option>
                        ))}
                    </select>
                    <button onClick={() => handleAddToAlbum(selectedAlbum)}>Add to Album</button>
                </>
            );
        }
        return null;
    };

    const renderAlbumDetails = () => {
        if (!detail || type !== 'album') return null;

        let albumImageURL = '';
        if (fromLocalDb && detail?.tracks?.items?.length > 0 && detail.tracks.items[0].album.images?.length > 0) {
            albumImageURL = detail.tracks.items[0].album.images[0].url;
        } else if (detail?.images?.length > 0) {
            albumImageURL = detail.images[0].url;
        }
        const spotifyUrl = detail.external_urls?.spotify || 'https://open.spotify.com/';
        const handleSpotifyPlay = () => {
            window.open(spotifyUrl, '_blank', 'noopener,noreferrer');
        };
        const albumName = detail?.title || detail?.name || 'No title';
        const artists = detail.artists ? detail.artists.map(artist => artist.name).join(', ') :
            (detail.tracks.items && detail.tracks.items.some(track => track.artists && track.artists.length > 0) ?
                detail.tracks.items.map(track => track.artists ? track.artists.map(artist => artist.name).join(', ') : '').filter(Boolean).join(', ') :
                'Unknown Artist');

        const releaseDate = detail.release_date || 'Unknown Release Date';
        const totalTracks = detail?.tracks?.items?.length || 0;

        return (
            <div>
                <div className={styles.albumDetailContainer}>
                    <div className={styles.albumImageContainer}>
                        {albumImageURL && <img src={albumImageURL} alt={albumName} className={styles.albumImage} />}
                    </div>
                    <div className={styles.albumInfoContainer}>
                        <span className={styles.albumLabel}><BiAlbum /> Album</span>
                        <h1>{albumName}</h1>
                        <p>{artists} • {releaseDate} • {totalTracks} tracks</p>
                    </div>
                </div>

                <div className={styles.albumTracksContainer}>
                    <button onClick={isLiked ? handleUnlike : handleLike} className={styles.likeButton}>
                        {isLiked ? <FaHeart color="red" /> : <FaRegHeart />}
                    </button>
                    <button onClick={handleSpotifyPlay} className={styles.spotifyPlayButton}>
                        <FaPlayCircle color="green" />
                    </button>
                    <ul>
                        {renderAlbumTracks()}
                    </ul>
                </div>
            </div>
        );
    };

    const renderTrackDetails = () => {
        if (!detail || type !== 'track' || !detail.album){
            return <div>Loading track details...</div>;
        }

        const handlePlayPreview = () => {
            playTrack({ preview_url: detail.preview_url });
        };

        const spotifyUrl = detail.external_urls?.spotify || 'https://open.spotify.com/';
        const handleSpotifyPlay = () => {
            window.open(spotifyUrl, '_blank', 'noopener,noreferrer');
        };

        const releaseDate = detail.album?.release_date || 'Unknown Release Date';

        return (
            <div>
                <div className={styles.albumDetailContainer}>
                    <div className={styles.albumImageContainer}>
                        {detail.album.images && (
                            <img src={detail.album.images[0].url} alt={detail.album.name} className={styles.trackImage} />
                        )}
                    </div>
                    <div className={styles.albumInfoContainer}>
                        <span className={styles.albumLabel}><TbPlayerTrackNext /> Track</span>
                        <h1>{detail.name}</h1>
                        <p>{releaseDate} • {formatDuration(detail.duration_ms)} • {detail.artists.map(artist => artist.name).join(', ')}</p>
                    </div>
                </div>
                <div className={styles.albumTracksContainer}>
                    <button onClick={isLiked ? handleUnlike : handleLike} className={styles.likeButton}>
                        {isLiked ? <FaHeart color="red" /> : <FaRegHeart />}
                    </button>
                    <button onClick={handleSpotifyPlay} className={styles.spotifyPlayButton}>
                        <FaPlayCircle color="green" />
                    </button>
                    {renderAddToPlaylistSection()}
                    {isCurrentUserArtist && renderAddToAlbumSection()}
                </div>
                <div className={styles.previewSection}>
                    <div className={styles.yourReviewContainer}>
                        {detail.preview_url && (
                            <>
                                <div className={styles.audioPlayerContainer}>
                                    <audio controls src={detail.preview_url}>Preview not available</audio>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderArtistDetails = () => {
        if (!detail || type !== 'artist') return null;
        const handleArtistLike = () => {
            if (!profile) {
                alert('Please log in first.');
                navigate('/login');
                return;
            };

            if (isLiked) {
                handleUnlike();
            } else {
                handleLike();
            }
        };
        const spotifyUrl = detail.external_urls?.spotify || 'https://open.spotify.com/';
        const handleSpotifyPlay = () => {
            window.open(spotifyUrl, '_blank', 'noopener,noreferrer');
        };
        return (
            <div>
                <div className={styles.albumDetailContainer}>
                    <div className={styles.albumImageContainer}>
                        {detail.images && detail.images.length > 0 && (
                            <img src={detail.images[0].url} alt={detail.name} className={styles.albumImage} />
                        )}
                    </div>
                    <div className={styles.albumInfoContainer}>
                        <span className={styles.albumLabel}><BsPerson /> Artist</span>
                        <h1>{detail.name}</h1>
                        <p>{detail.genres.join(', ')} • {detail.followers.total} Followers</p>
                    </div>
                </div>
                <div className={styles.albumTracksContainer}>
                    <button onClick={handleArtistLike} className={styles.likeButton}>
                        {isLiked ? <FaHeart color="red" /> : <FaRegHeart />}
                    </button>
                    <button onClick={handleSpotifyPlay} className={styles.spotifyPlayButton}>
                        <FaPlayCircle color="green" />
                    </button>
                    <ul>
                        {renderTopTracks()}
                    </ul>
                </div>
            </div>
        );
    };

    const renderTopTracks = () => {
        if (!topTracks) return null;
        const tracksArray = Array.isArray(topTracks) ? topTracks : topTracks.tracks;

        return tracksArray.map((track, index) => (
            <li key={track.id} className={styles.trackListItem}>
                <div className={styles.trackDetails}>
                    <p>{index + 1}: {track.name}</p>
                    <p className={styles.trackArtists}>
                        {track.artists.map(artist => artist.name).join(', ')}
                    </p>
                </div>
                <button className={styles.playButton} onClick={() => playTrack(track)}>
                    <span className='me-4'>{formatDuration(track.duration_ms)}</span>
                    <FaPlay />
                </button>
                {playingTrackId === track.id && (
                    <div className={styles.audioPlayerContainer}>
                        <audio controls autoPlay src={track.preview_url}>
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                )}
            </li>
        ));
    };


    return (
        <div>
            <div className="animation-wrapper">
                <div className="particle particle-1"></div>
                <div className="particle particle-2"></div>
                <div className="particle particle-3"></div>
                <div className="particle particle-4"></div>
            </div>
            <div>
                {type === 'album' ? renderAlbumDetails() : (type === 'track' ? renderTrackDetails() : renderArtistDetails())}
                {renderReviewSection()}
                {renderReviews()}
            </div>
            {currentTrack && (
                <div className={styles.audioPlayerContainer}>
                    <audio controls autoPlay src={currentTrack.preview_url}>
                        Your browser does not support the audio element.
                    </audio>
                </div>
            )}
        </div>
    );

}

export default Details;