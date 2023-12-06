import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import * as client from '../users/client';
import * as likes from '../Likes';
import { Carousel } from 'react-bootstrap';
import { fetchReviewsByUser, fetchLatest5Reviews } from '../Reviews';
import './index.css';
import { fetchItemDetails } from '../Search/util';
import { AccessTokenContext } from '../AccessTokenContext';
import { fetchPlaylistsByUser, fetchAllPlaylists } from '../Playlists/client';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

function Home() {
    const { accessToken } = useContext(AccessTokenContext);
    const [profile, setProfile] = useState(null);
    const [likedAlbums, setLikedAlbums] = useState([]);
    const [likedTracks, setLikedTracks] = useState([]);
    const [likedArtists, setLikedArtists] = useState([]);
    const [userReviews, setUserReviews] = useState([]);
    const [latestReviews, setLatestReviews] = useState([]);

    const fetchLikedItemsDetails = async (items, type) => {
        return Promise.all(items.map(async (item) => {
            const details = await fetchItemDetails(item.itemId, type, accessToken);
            return { ...item, details };
        }));
    };

    const fetchLatestReviews = async () => {
        try {
            const reviews = await fetchLatest5Reviews();
            const reviewsWithDetails = await Promise.all(reviews.map(async review => {
                const details = await fetchItemDetails(review.itemID, review.itemType, accessToken);
                return { ...review, details };
            }));
            setLatestReviews(reviewsWithDetails);
        } catch (error) {
            console.error("Error fetching latest reviews:", error);
        }
    };
    const renderLatestReviewsSection = () => {
        return (
            <div className="m-4">
                <h3>Latest Reviews</h3>
                <ul className="list-unstyled">
                    {latestReviews.length > 0 ? (
                        latestReviews.map(review => (
                            <li key={review._id} className="d-flex align-items-center mb-2">
                                <Link to={`/details?identifier=${review.itemID}&type=${review.itemType}`} className="text-decoration-none text-dark">
                                    <img src={getImageUrl(review)} alt="Review" className="img-fluid me-2" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                </Link>
                                <div>
                                    <strong className="me-2">{review.details ? review.details.name : 'Unknown Item'}:</strong>
                                    <span>{review.reviewText.slice(0, 40)}{review.reviewText.length > 40 ? '...' : ''}</span>
                                </div>
                            </li>
                        ))
                    ) : (
                        <p>No latest reviews available.</p>
                    )}
                </ul>
            </div>
        );
    };



    const fetchProfile = async () => {
        try {
            const profileData = await client.profile();
            setProfile(profileData);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const fetchUserReviews = async () => {
        if (profile) {
            try {
                const reviews = await fetchReviewsByUser(profile._id);
                const reviewsWithDetails = await Promise.all(reviews.map(async review => {
                    const details = await fetchItemDetails(review.itemID, review.itemType, accessToken);
                    return { ...review, details };
                }));
                setUserReviews(reviewsWithDetails);
            } catch (error) {
                console.error("Error fetching user reviews:", error);
            }
        }
    };


    const fetchLikedAlbums = async () => {
        if (profile) {
            try {
                const albums = await likes.fetchLikedItems(profile._id, 'album');
                const albumsDetails = await fetchLikedItemsDetails(albums, 'album');
                setLikedAlbums(albumsDetails);
            } catch (error) {
                console.error("Error fetching liked albums:", error);
            }
        }
    };

    const fetchLikedTracks = async () => {
        if (profile) {
            try {
                const tracks = await likes.fetchLikedItems(profile._id, 'track');
                const trackDetails = await fetchLikedItemsDetails(tracks, 'track');
                setLikedTracks(trackDetails);
            } catch (error) {
                console.error("Error fetching liked tracks:", error);
            }
        }
    };

    const fetchLikedArtists = async () => {
        if (profile) {
            try {
                const artists = await likes.fetchLikedItems(profile._id, 'artist');
                const artistsDetails = await fetchLikedItemsDetails(artists, 'artist');
                setLikedArtists(artistsDetails);
            } catch (error) {
                console.error("Error fetching liked artists:", error);
            }
        }
    };

    useEffect(() => {
        fetchLatestReviews();
        fetchProfile();
    }, []);

    useEffect(() => {
        if (profile && accessToken) {
            fetchLikedAlbums();
            fetchLikedTracks();
            fetchLikedArtists();
            fetchUserReviews();
        }
    }, [profile && accessToken]);

    const [allPlaylists, setAllPlaylists] = useState([]);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [playlistImages, setPlaylistImages] = useState({});

    const fetchAllUserPlaylists = async () => {
        try {
            // Use the imported function with a different local name
            const playlists = await fetchAllPlaylists();
            setAllPlaylists(playlists);
            fetchPlaylistImages(playlists);
        } catch (error) {
            console.error("Error fetching all playlists:", error);
            setAllPlaylists([]); // Set to empty array in case of error
        }
    };

    const fetchUserPlaylists = async () => {
        try {
            // Use the imported function with a different local name
            const playlists = await fetchPlaylistsByUser(profile._id);
            setUserPlaylists(playlists.filter(pl => pl.trackIDs && pl.trackIDs.length > 0));
            fetchPlaylistImages(playlists);
        } catch (error) {
            console.error("Error fetching user playlists:", error);
            setUserPlaylists([]); // Set to empty array in case of error
        }
    };

    const fetchPlaylistImages = async (playlists) => {
        try {
            const images = {};
            for (const playlist of playlists) {
                if (playlist.trackIDs && playlist.trackIDs.length > 0) {
                    const trackDetails = await fetchItemDetails(playlist.trackIDs[0], 'track', accessToken);
                    images[playlist._id] = trackDetails.album.images[0]?.url || '';
                }
            }
            setPlaylistImages(images);
        } catch (error) {
            console.error("Error fetching playlist images:", error);
        }
    };

    useEffect(() => {
        if (profile && accessToken) {
            fetchUserPlaylists(); // Call the renamed function
        }
        fetchAllUserPlaylists(); // Call the renamed function
    }, [profile, accessToken]);

    const renderPlaylistsSection = () => {
        return (
            <Carousel className='user-playlist'>
                {userPlaylists.map(playlist => (
                    <Carousel.Item key={playlist._id}>
                        <Link to={`/playlists/${playlist._id}`} className="no-underline">
                            <img src={playlistImages[playlist._id]} alt={playlist.title} className="d-block w-100 custom-image-size" />
                            <Carousel.Caption>
                                <h3>{playlist.title}</h3>
                            </Carousel.Caption>
                        </Link>
                    </Carousel.Item>
                ))}
            </Carousel>
        );
    };
    

    const renderAllPlaylistsSection = () => {
        return (
            <div>
                <h2>All Playlists</h2>
                <Swiper
                    spaceBetween={20}
                    slidesPerView={'auto'}
                    centeredSlides={true}
                    loop={true}
                    coverflowEffect={{
                        rotate: 0,
                        stretch: -100,
                        depth: 200,
                        modifier: 1,
                        slideShadows: true,
                    }}
                    effect={'coverflow'}
                    pagination={{
                        clickable: true,
                    }}
                    navigation={true}
                    modules={[Navigation, Pagination]}
                    className="mySwiper"
                >
                    {allPlaylists.map(playlist => (
                        <SwiperSlide key={playlist._id}>
                            <Link to={`/playlists/${playlist._id}`} className="no-underline">
                                <img src={playlistImages[playlist._id]} alt={playlist.title} className="swiper-slide-image" />
                                <div className="swiper-caption">{playlist.title}</div>
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        );
    };


    const getImageUrl = (item) => {
        console.log(item);
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
    const renderReviewsSection = (reviews) => {
        return (
            <Carousel>
                {reviews.map(review => (
                    <Carousel.Item key={review._id}>
                        <div className="review-panel d-flex my-reviews">
                            <Link to={`/details?identifier=${review.itemID}&type=${review.itemType}`} className="review-image-container flex-shrink-1">
                                <img src={getImageUrl(review, review.itemType)} alt="Review" className="review-image" />
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
        );
    };

    const renderLikedSection = (items, type) => {
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

    return (
        <div>
            <h2>Home</h2>
            {renderAllPlaylistsSection()}
            {renderLatestReviewsSection()}
            {profile ? (
                <div className="container">
                    <p>Welcome, {profile.username}!</p>
                    <div className="row">
                        <div className="col-md-12">
                            <h3>My Reviews</h3>
                            {renderReviewsSection(userReviews)}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <h3>My Playlists</h3>
                            {renderPlaylistsSection()}
                        </div>
                    </div>
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
            ) : (
                <p>Please log in to see your profile information and liked items.</p>
            )}
        </div>
    );
}

export default Home;
