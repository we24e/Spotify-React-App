import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import * as client from '../users/client';
import * as likes from '../Likes';
import { Carousel } from 'react-bootstrap';
import { fetchReviewsByUser, fetchLatest5Reviews } from '../Reviews';
import './index.css';
import { fetchItemDetails, fetchArtistAlbums, fetchArtistTopTracks } from '../Search/util';
import { AccessTokenContext } from '../AccessTokenContext';
import { fetchPlaylistsByUser, fetchAllPlaylists } from '../Playlists/client';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import * as albumClient from '../Albums';

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

    const fetchLatestReviews = async () => {
        try {
            const reviews = await fetchLatest5Reviews();
            const reviewsWithDetails = await Promise.all(reviews.map(async review => {
                let details = await fetchItemDetails(review.itemID, review.itemType, accessToken);
                let image = '';
                let albumTitle = '';
                if (!details && review.itemType === 'album') {
                    const albumDetails = await albumClient.fetchAlbumById(review.itemID);
                    if (albumDetails) {
                        albumTitle = albumDetails.title;
                        image = await fetchAlbumImage(review.itemID);
                    }
                } else if (details && review.itemType === 'album') {
                    image = details.images[0]?.url;
                    albumTitle = details.name;
                }
                return { ...review, details, image, albumTitle };
            }));
            setLatestReviews(reviewsWithDetails);
        } catch (error) {
            console.error("Error fetching latest reviews:", error);
        }
    };


    const renderLatestReviewsSection = () => {
        if (latestReviews.length === 0) {
            return <p>No latest reviews available.</p>;
        }
    
        return (
            <div className="m-4">
                <h3>Latest Reviews</h3>
                <ul className="list-unstyled">
                    {latestReviews.map(review => (
                        <li key={review._id} className="d-flex align-items-center mb-2">
                            <Link to={`/details?identifier=${review.itemID}&type=${review.itemType}`} className="text-decoration-none text-dark">
                                <img src={review.image || getImageUrl(review)} alt="Review" className="img-fluid me-2 mb-1" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                            </Link>
                            <div className="ms-2">
                                <strong className="latest-review-text">{review.albumTitle || (review.details ? review.details.name : 'Unknown Item')}</strong>
                                <span className="latest-review-text">{review.reviewText}</span>
                            </div>
                        </li>
                    ))}
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

    const fetchLikedAlbums = async () => {
        if (profile) {
            try {
                const albums = await likes.fetchLikedItems(profile._id, 'album');
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
            const playlists = await fetchAllPlaylists();
            setAllPlaylists(playlists);
            fetchPlaylistImages(playlists);
        } catch (error) {
            console.error("Error fetching all playlists:", error);
            setAllPlaylists([]);
        }
    };

    const fetchUserPlaylists = async () => {
        try {
            const playlists = await fetchPlaylistsByUser(profile._id);
            setUserPlaylists(playlists.filter(pl => pl.trackIDs && pl.trackIDs.length > 0));
            fetchPlaylistImages(playlists);
        } catch (error) {
            console.error("Error fetching user playlists:", error);
            setUserPlaylists([]);
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
            fetchUserPlaylists();
        }
        fetchAllUserPlaylists();
    }, [profile, accessToken]);

    const [topTracks, setTopTracks] = useState([]);
    const [albums, setAlbums] = useState([]);

    useEffect(() => {
        if (profile && accessToken && profile.role === 'ARTIST') {
            fetchArtistTopTracks(profile.artistID, "US", accessToken).then(setTopTracks);
            fetchArtistAlbums(profile.artistID, "US", accessToken).then(setAlbums);
        }
    }, [profile, accessToken]);

    const renderTopTracks = () => {
        if (!topTracks) return null;
        const tracksArray = Array.isArray(topTracks) ? topTracks : topTracks.tracks;

        return (
            <>
                <h3>My Top5 Tracks</h3>
                <Carousel>
                    {tracksArray && tracksArray.slice(0, 5).map(track => (
                        <Carousel.Item key={track.id}>
                            <Link to={`/details?identifier=${track.id}&type=${'track'}`}>
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
        if (!albums) return null;
        const albumsArray = Array.isArray(albums) ? albums : albums.items;
        return (
            <>
                <h3>My Albums</h3>
                <Carousel>
                    {albumsArray && albumsArray.slice(0, 10).map(album => (
                        <Carousel.Item key={album.id}>
                            <Link to={`/details?identifier=${album.id}&type=${'album'}`}>
                                <img
                                    className="d-block w-100"
                                    src={album.images[0].url}
                                    alt={album.name}
                                />
                            </Link>
                            <Carousel.Caption>
                                <h3>{album.name}</h3>
                                <p>{album.release_date}</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                    ))}
                </Carousel>
            </>
        );
    };


    const renderPlaylistsSection = () => {
        if (!userPlaylists) return null;
        if (userPlaylists.length === 0) {
            return (
                <p>You have not created any playlists yet.</p>
            );
        }
        return (
            <>
                <h3>My Playlists</h3>
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
            </>
        );
    };


    const renderAllPlaylistsSection = () => {
        if (!allPlaylists) return null;
        if (allPlaylists.length === 0) {
            return (
                <p>No playlists available.</p>
            );
        }
        return (
            <div>
                <h2>Playlists</h2>
                <Swiper
                    spaceBetween={20}
                    slidesPerView={3}
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
                <p>You have not liked any {type}s yet.</p>
            );
        }
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
        if (profile && profile.role === 'ARTIST') {
            try {
                const albums = await albumClient.fetchAlbumsByUser(profile._id);
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
        }
    };
    useEffect(() => {
        fetchCustomAlbums();
    }, [profile, accessToken]);
    const renderCustomAlbums = () => {
        if (!customAlbums || customAlbums.length === 0) {
            return <p>No custom albums available.</p>;
        }

        return (
            <>
                <h3>My Custom Albums</h3>
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

    const [allAlbums, setAllAlbums] = useState([]);
    const fetchAllAlbums = async () => {
        try {
            const albums = await albumClient.fetchAllAlbums();
            const albumsWithDetails = await Promise.all(albums.map(async album => {
                let image = '';
                if (album.trackIDs && album.trackIDs.length > 0) {
                    const firstTrackDetails = await fetchItemDetails(album.trackIDs[0], 'track', accessToken);
                    image = firstTrackDetails.album.images[0]?.url || '';
                }
                return { ...album, image };
            }));
            setAllAlbums(albumsWithDetails);
        } catch (error) {
            console.error("Error fetching all albums:", error);
        }
    };
    useEffect(() => {
        fetchAllAlbums();
    }, []);

    const renderAllAlbumsSection = () => {
        if (!allAlbums || allAlbums.length === 0) {
            return <p>No albums available.</p>;
        }

        return (
            <div className="m-4">
                <h3>Latest Albums</h3>
                <Carousel>
                    {allAlbums.map(album => (
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
                                <p>Release Date: {album.release_date}</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                    ))}
                </Carousel>
            </div>
        );
    };


    return (
        <div>
            {renderAllPlaylistsSection()}
            <div className="row">
                <div className="col-md-6">
                    {renderLatestReviewsSection()}
                </div>
                <div className="col-md-6">
                    {renderAllAlbumsSection()}
                </div>
            </div>
            {profile ? (
                <div className="container">
                    <p>Welcome, {profile.username}!</p>
                    {profile.role === "USER" && (
                        <div className="row">
                            <div className="col-md-12">
                                {renderPlaylistsSection()}
                            </div>
                        </div>
                    )}
                    {profile.role === 'ARTIST' && (
                        <div className="row">
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
                    )}
                    <div className="row">
                        <div className="col-md-12">
                            {renderReviewsSection(userReviews)}
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
                <p>Please log in to view more.</p>
            )}
        </div>
    );
}

export default Home;
