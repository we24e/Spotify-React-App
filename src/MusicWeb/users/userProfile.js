import React, { useState, useEffect, useContext } from 'react';
import * as client from './client';
import { useNavigate, useParams } from 'react-router-dom';
import { AccessTokenContext } from '../AccessTokenContext';
import { fetchArtistTopTracks, fetchArtistAlbums } from '../Search/util';
import { Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchItemDetails } from '../Search/util';
import { FaUserCircle } from 'react-icons/fa';
import { fetchPlaylistsByUser } from '../Playlists/client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import '../Home/index.css';
import { fetchReviewsByUser } from '../Reviews';
import * as likes from '../Likes';
import * as albumClient from '../Albums';

function UserProfile() {
    const { accessToken } = useContext(AccessTokenContext);
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [topTracks, setTopTracks] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [artistDetails, setArtistDetails] = useState(null);
    const [playlists, setPlaylists] = useState([]);
    const [playlistImages, setPlaylistImages] = useState({});
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();
    const fetchFollowingStatus = async () => {
        try {
            const isFollowingData = await client.checkIfFollowing(id);
            setIsFollowing(isFollowingData);
        } catch (err) {
            console.error("Error checking following (Probably not loggedIN):", err);
        }
    };

    const fetchProfile = async () => {
        try {
            const profileData = await client.profile();
            setProfile(profileData);
        }
        catch (err) {
            console.error("Error fetching profile:", err);
        }
    };
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchPlaylistImages = async (playlists) => {
        const newImages = {};
        for (const playlist of playlists) {
            if (playlist.trackIDs && playlist.trackIDs.length > 0) {
                try {
                    const trackDetails = await fetchItemDetails(playlist.trackIDs[0], 'track', accessToken);
                    newImages[playlist._id] = trackDetails.album.images[0].url;
                } catch (error) {
                    console.error("Error fetching image for playlist:", error);
                    newImages[playlist._id] = '';
                }
            } else {
                newImages[playlist._id] = '';
            }
        }
        setPlaylistImages(newImages);
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await client.findUserById(id);
                setUser(userData);
            } catch (err) {
                console.error("Error fetching user:", err);
            }
        };
        fetchUser();
        fetchFollowingStatus();
    }, [id]);

    useEffect(() => {
        const fetchUserPlaylists = async () => {
            if (user) {
                try {
                    const userPlaylists = await fetchPlaylistsByUser(user._id);
                    setPlaylists(userPlaylists);
                    fetchPlaylistImages(userPlaylists);
                } catch (error) {
                    console.error("Error fetching user's playlists:", error);
                    setPlaylists([]);
                }
            }
        };

        fetchUserPlaylists();
    }, [user, accessToken]);


    const renderPlaylists = () => {
        if (playlists.length === 0) {
            return <p>No playlists available.</p>;
        }
        return (
            <div className="mt-4">
                <h3>User Playlists</h3>
                <Swiper
                    spaceBetween={20}
                    slidesPerView={2}
                    loop={true}
                    pagination={{
                        clickable: true,
                    }}
                    navigation={true}
                    modules={[Navigation, Pagination]}
                >
                    {playlists.map(playlist => (
                        <SwiperSlide key={playlist.id}>
                            <Link to={`/playlists/${playlist._id}`}>
                                <p className='text-decoration-none text-light text-center bg-dark mb-0'>{playlist.title}</p>
                                <img
                                    src={playlistImages[playlist._id]}
                                    alt={playlist.title}
                                    className="img-fluid"
                                />
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        );
    };

    useEffect(() => {
        const fetchArtistData = async () => {
            if (user && accessToken && user.role === 'ARTIST') {
                try {
                    const artistDetail = await fetchItemDetails(user.artistID, 'artist', accessToken);
                    if (artistDetail) {
                        setArtistDetails(artistDetail);
                    }

                    const tracksData = await fetchArtistTopTracks(user.artistID, "US", accessToken);
                    setTopTracks(tracksData.tracks || []);

                    const albumsData = await fetchArtistAlbums(user.artistID, "US", accessToken);
                    setAlbums(albumsData.items || []);
                } catch (error) {
                    console.error("Error fetching artist data:", error);
                    setTopTracks([]);
                    setAlbums([]);
                }
            }
        };

        fetchArtistData();
    }, [user, accessToken]);


    const handleFollow = async () => {
        try {
            if (!profile) {
                alert('Please log in first.');
                navigate("/login");
                return;
            }
            if (profile._id === id) {
                alert('You cannot follow yourself.');
                return;
            }
            if (isFollowing) {
                await client.unfollowUser(id);
                setIsFollowing(false);
            } else {
                await client.followUser(id);
                setIsFollowing(true);
            }
        } catch (err) {
            console.error("Error following/unfollowing user (Probably not loggedIN):", err);
            alert('Please log in first.');
            navigate("/login");
        }
    };
    const renderTopTracks = () => {
        if (!topTracks || topTracks.length === 0) {
            return <p>No top tracks available.</p>;
        }
        return (
            <>
                <h2>Top5 Tracks</h2>
                <Carousel>
                    {topTracks.slice(0, 5).map(track => (
                        <Carousel.Item key={track.id}>
                            <Link to={`/track/${track.id}`}>
                                <img
                                    className="d-block w-100"
                                    src={track.album.images[0].url}
                                    alt={track.name}
                                />
                            </Link>
                            <Carousel.Caption>
                                <h3>{track.name}</h3>
                                <p>{track.artists.map(artist => artist.name).join(', ')}</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                    ))}
                </Carousel>
            </>
        );
    };
    const renderAlbums = () => {
        if (!albums || albums.length === 0) {
            return <p>No albums available.</p>;
        }
        return (
            <>
                <h2>Albums</h2>
                <Carousel>
                    {albums.slice(0, 10).map(album => (
                        <Carousel.Item key={album.id}>
                            <Link to={`/album/${album.id}`}>
                                <img
                                    className="d-block w-100"
                                    src={album.images[0].url}
                                    alt={album.name}
                                />
                            </Link>
                            <Carousel.Caption>
                                <h3>{album.name}</h3>
                                <p>Released on {album.release_date}</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                    ))}
                </Carousel>
            </>
        );
    };
    const renderUserInfo = () => {
        if (!profile || !user) {
            return null;
        }

        return (
            <div className="row text-center mt-3">
                <div className="col-md-4">
                    <p><strong>Username:</strong> {user.username}</p>
                </div>
                <div className="col-md-4">
                    <p><strong>Name:</strong> {`${user.firstName} ${user.lastName}`}</p>
                </div>
                <div className="col-md-4">
                    <p><strong>Email:</strong> {user.email}</p>
                </div>
            </div>
        );
    };

    const getImageUrl = (item) => {
        if (item.image) {
            return item.image;
        }

        if (!item.details) return '';

        switch (item.itemType) {
            case 'album':
                return item.details.images[0].url;
            case 'track':
                return item.details.album.images[0].url;
            case 'artist':
                return item.details.images[0].url;
            default:
                return '';
        }
    };



    const [userReviews, setUserReviews] = useState([]);
    const [likedAlbums, setLikedAlbums] = useState([]);
    const [likedTracks, setLikedTracks] = useState([]);
    const [likedArtists, setLikedArtists] = useState([]);

    const fetchLikedItemsDetails = async (items, type) => {
        return Promise.all(items.map(async (item) => {
            const details = await fetchItemDetails(item.itemId, type, accessToken);
            return { ...item, details };
        }));
    };

    const fetchAlbumImage = async (albumId) => {
        try {
            const albumDetails = await albumClient.fetchAlbumById(albumId);
            if (albumDetails && albumDetails.trackIDs && albumDetails.trackIDs.length > 0) {
                const firstTrackDetails = await fetchItemDetails(albumDetails.trackIDs[0], 'track', accessToken);
                return firstTrackDetails.album.images[0]?.url || '';
            }
            return '';
        } catch (error) {
            console.error('Error fetching album image:', error);
            return '';
        }
    };

    const fetchLikedAlbums = async () => {
        if (id) {
            try {
                const albums = await likes.fetchLikedItems(id, 'album');
                const albumsDetails = await Promise.all(albums.map(async (album) => {
                    const image = await fetchAlbumImage(album.itemId);
                    const details = await fetchItemDetails(album.itemId, 'album', accessToken);
                    return { ...album, details, image };
                }));
                setLikedAlbums(albumsDetails);
            } catch (error) {
                console.error("Error fetching liked albums:", error);
            }
        }
    };

    const fetchLikedTracks = async () => {
        try {
            const tracks = await likes.fetchLikedItems(id, 'track');
            const trackDetails = await fetchLikedItemsDetails(tracks, 'track');
            setLikedTracks(trackDetails);
        } catch (error) {
            console.error("Error fetching liked tracks:", error);
        }
    };

    const fetchLikedArtists = async () => {
        try {
            const artists = await likes.fetchLikedItems(id, 'artist');
            const artistsDetails = await fetchLikedItemsDetails(artists, 'artist');
            setLikedArtists(artistsDetails);
        } catch (error) {
            console.error("Error fetching liked artists:", error);
        }
    };

    const fetchUserReviews = async () => {
        if (id) {
            try {
                const reviews = await fetchReviewsByUser(id);
                const reviewsWithDetails = await Promise.all(reviews.map(async review => {
                    const details = await fetchItemDetails(review.itemID, review.itemType, accessToken);
                    let image = '';
                    if (review.itemType === 'album') {
                        image = await fetchAlbumImage(review.itemID);
                    }
                    return { ...review, details, image };
                }));
                setUserReviews(reviewsWithDetails);
            } catch (error) {
                console.error("Error fetching user reviews:", error);
            }
        }
    };



    useEffect(() => {
        if (id && accessToken) {
            fetchLikedAlbums();
            fetchLikedTracks();
            fetchLikedArtists();
            fetchUserReviews();
        }
    }, [id && accessToken]);

    const renderReviewsSection = (reviews) => {
        if (reviews.length === 0) {
            return (
                <p>You have not written any reviews yet.</p>
            );
        }
        return (
            <>
                <h3>My Reviews</h3>
                <Carousel>
                    {reviews.map(review => (
                        <Carousel.Item key={review._id}>
                            <div className="review-panel d-flex my-reviews">
                                <Link to={`/details?identifier=${review.itemID}&type=${review.itemType}`} className="review-image-container flex-shrink-1">
                                    <img src={review.image || getImageUrl(review, review.itemType)} alt="Review" className="review-image" />
                                </Link>
                                <div className="review-text-panel d-flex align-items-center justify-content-center flex-grow-1">
                                    <p className="m-0">
                                        {review.reviewText.length > 100 ? review.reviewText.slice(0, 100) + '...' : review.reviewText}
                                    </p>
                                </div>
                            </div>
                        </Carousel.Item>
                    ))}
                </Carousel>
            </>
        );
    };

    const renderLikedSection = (items, type) => {
        if (items.length === 0) {
            return (
                <p>User haven't liked any {type}s yet.</p>
            );
        }
        console.log(items);
        return (
            <Carousel>
                {items.map(item => (
                    <Carousel.Item key={item._id}>
                        <Link to={`/details?identifier=${item.itemId}&type=${type}`} className="no-underline">
                            <img src={getImageUrl(item)} alt={item.details?.name} className="d-block w-100" />
                        </Link>
                    </Carousel.Item>
                ))}
            </Carousel>
        );
    };

    const [customAlbums, setCustomAlbums] = useState([]);
    const fetchCustomAlbums = async () => {
        try {
            const albums = await albumClient.fetchAlbumsByUser(id);
            const albumsWithDetails = await Promise.all(albums.map(async album => {
                let image = '';
                if (album.trackIDs && album.trackIDs.length > 0) {
                    const firstTrackDetails = await fetchItemDetails(album.trackIDs[0], 'track', accessToken);
                    image = firstTrackDetails.album.images[0]?.url || '';
                }
                return { ...album, image };
            }));
            setCustomAlbums(albumsWithDetails);
        } catch (error) {
            console.error("Error fetching custom albums:", error);
        }
    };

    useEffect(() => {
        fetchCustomAlbums();
    }, [id, accessToken]);

    const renderCustomAlbums = () => {
        if (!customAlbums || customAlbums.length === 0) {
            return <p>No custom albums available.</p>;
        }
        return (
            <>
                <h3>Custom Albums</h3>
                <Carousel>
                    {customAlbums.map(album => (
                        <Carousel.Item key={album._id}>
                            <Link to={`/details?identifier=${album._id}&type=album`}>
                                <img
                                    className="d-block w-100"
                                    src={album.image}
                                    alt={album.title}
                                />
                            </Link>
                            <Carousel.Caption>
                                <h3>{album.title}</h3>
                                <p>{album.release_date}</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                    ))}
                </Carousel>
            </>
        );
    };

    return (
        <>
            {user ? (
                <div className="card col-md-12">
                    <div className="card-body">
                        {artistDetails ? (
                            <div className="text-center">
                                <img
                                    src={artistDetails.images[0].url}
                                    alt={artistDetails.name}
                                    className="img-fluid rounded-circle mb-3"
                                    style={{ maxWidth: "200px" }}
                                />
                                <h3>{artistDetails.name}</h3>
                                <p className="text-muted">Total Followers: {user.followers.length + artistDetails.followers.total}</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <FaUserCircle size={200} className="mb-3" />
                                <h3>{user.username}</h3>
                            </div>
                        )}

                        <div className="text-center mt-3">
                            <button onClick={handleFollow} className="btn btn-primary">
                                {isFollowing ? 'Unfollow' : 'Follow'}
                            </button>
                        </div>

                        <div className="row text-center mb-3">
                            <div className="col-md-6 text-center">
                                <h5>Following: {user.following.length}</h5>
                            </div>
                            <div className="col-md-6 text-center">
                                <h5>Followers: {user.followers.length}</h5>
                            </div>
                        </div>
                        {renderUserInfo()}
                        <hr />
                        {renderReviewsSection(userReviews)}
                        <hr />
                        {user.role === 'ARTIST' ? (
                            <div className="row mt-4">
                                <div className="col-md-4">
                                    {renderTopTracks()}
                                </div>
                                <div className="col-md-4">
                                    {renderAlbums()}
                                </div>
                                <div className="col-md-4">
                                    {renderCustomAlbums()}
                                </div>
                            </div>
                        ) : (
                            // Render user's playlists if not an artist
                            <div className="mt-4">
                                {renderPlaylists()}
                            </div>
                        )}
                        <hr />
                        <div className="row">
                            <div className="col-md-4">
                                <h3>Liked Albums</h3>
                                {renderLikedSection(likedAlbums, 'album')}
                            </div>
                            <div className="col-md-4">
                                <h3>Liked Tracks</h3>
                                {renderLikedSection(likedTracks, 'track')}
                            </div>
                            <div className="col-md-4">
                                <h3>Liked Artists</h3>
                                {renderLikedSection(likedArtists, 'artist')}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-center">Loading user profile...</p>
            )}
        </>
    );
}

export default UserProfile;
