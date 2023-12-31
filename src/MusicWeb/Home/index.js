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
import "../randomCss/galaxy.scss";
import "./likes.css";
import { RiNeteaseCloudMusicLine } from "react-icons/ri";
import { FcLikePlaceholder } from "react-icons/fc";

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

    const fetchAlbumImageAndTitle = async (albumId) => {
        try {
            const albumDetails = await albumClient.fetchAlbumById(albumId);
            let imageUrl = '';
            let title = albumDetails.title;
            if (albumDetails && albumDetails.trackIDs && albumDetails.trackIDs.length > 0) {
                const firstTrackDetails = await fetchItemDetails(albumDetails.trackIDs[0], 'track', accessToken);
                imageUrl = firstTrackDetails.album.images[0]?.url || albumDetails.images[0]?.url || '';
            } else {
                imageUrl = albumDetails.images[0]?.url || '';
            }

            return { imageUrl, title };
        } catch (error) {
            console.error('Error fetching album image and title:', error);
            return { imageUrl: '', title: '' };
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
                        image = (await fetchAlbumImageAndTitle(review.itemID)).imageUrl;
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
            <div className="latest-reviews-container  mt-4 ms-2">
                <h3>Latest Reviews</h3>
                <ul className="list-unstyled">
                    {latestReviews.map(review => (
                        <li key={review._id} className="review-panel d-flex align-items-center mb-2">
                            <Link to={`/details?identifier=${review.itemID}&type=${review.itemType}`} className="review-image-container">
                                <img src={review.image || getImageUrl(review)} alt="Review" className="review-image" />
                            </Link>
                            <div className="review-text-panel">
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
                        image = (await fetchAlbumImageAndTitle(review.itemID)).imageUrl;
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
                    const { imageUrl, title } = await fetchAlbumImageAndTitle(album.itemId);
                    const details = await fetchItemDetails(album.itemId, 'album', accessToken);
                    return { ...album, details, image: imageUrl, title };
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
                <p className='ps-1'>You have not created any playlists yet.</p>
            );
        }
        return (
            <>
                <h3>My Playlists</h3>
                <div className="card-container">
                    {userPlaylists.map(playlist => (
                        <div className="card-item" key={playlist._id}>
                            <Link to={`/playlists/${playlist._id}`} className="card-link">
                                <div className="card-image-container">
                                    <img src={playlistImages[playlist._id]} alt={playlist.title} className="card-image" />
                                    <div className="card-overlay">
                                    </div>
                                </div>
                                <div className="card-content">
                                    <h5 className="card-title">{playlist.title}</h5>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
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
                    className="mySwiper p-2"
                >
                    {/* <h2>Playlists</h2> */}
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
                <p className='ps-1'>You have not written any reviews yet.</p>
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
                <p className='ps-1'>You have not liked any {type}s yet.</p>
            );
        }
        return (
            <div className="card-container">
                {items.map(item => (
                    <div className="card-item" key={item._id}>
                        <Link to={`/details?identifier=${item.itemId}&type=${type}`} className="card-link">
                            <div className="card-image-container">
                                <img src={getImageUrl(item)} alt={item.details?.name || item.title} className="card-image" />
                                <div className="card-overlay">
                                    <div className="card-rating">
                                    </div>
                                </div>
                            </div>
                            <div className="card-content">
                                <h5 className="card-title">{item.details?.name || item.title}</h5>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        );
    }

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
        const latestAlbums = [...allAlbums].reverse().slice(0, 4);
        return (
            <>
                <h3 className='mt-4'>Latest Albums</h3>
                <div className="newalbum-container pt-2 me-2 mb-2" style={{ display: 'flex', gap: '10px', height: '100%' }}>
                    {latestAlbums.map(album => (
                        <Link
                            to={`/details?identifier=${album._id}&type=album`}
                            key={album._id}
                            style={{ textDecoration: 'none', flex: '1', maxWidth: 'calc(25% - 10px)', height: '100%' }}
                            className="album-card"
                        >
                            <div
                                className="album-image"
                                style={{
                                    backgroundImage: `url(${album.image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    height: '100%',
                                    transition: 'transform 0.3s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <div className="newalbum" style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', padding: '10px' }}>
                                    <h4>{album.title}</h4>
                                    <p>{album.description}</p>
                                    <p>Release Date: {album.release_date}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </>
        );
    };


    return (
        <div>
            <div class="animation-wrapper">
                <div class="particle particle-1"></div>
                <div class="particle particle-2"></div>
                <div class="particle particle-3"></div>
                <div class="particle particle-4"></div>
            </div>
            <div className={`hero-section d-none d-md-block`}>
                <div className="hero-content">
                    <h1>Welcome to Spatify, Your <RiNeteaseCloudMusicLine/> Universe</h1>
                    <p>Explore new playlists, tracks, albums, and artists.</p>
                </div>
            </div>
            <h2 className='text-center mb-3'>Playlists</h2>
            {renderAllPlaylistsSection()}

            <div className="row" style={{ maxWidth: '1700px', maxHeight: '1200px', margin: '0 auto' }}>
                <div className="col-md-6">
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        {renderLatestReviewsSection()}
                    </div>
                </div>
                <div className="col-md-6" style={{ margin: '0 auto' }}>
                    {renderAllAlbumsSection()}
                </div>
            </div>

            {profile ? (
                <div className="home-container m-2 p-2">
                    {profile.role !== "ARTIST" && (
                        <div className="row m-1">
                            {renderPlaylistsSection()}
                        </div>
                    )}
                    {profile.role === 'ARTIST' && (
                        <div className="row">
                            <div className="col-md-4" style={{ display: 'flex', justifyContent: 'center' }}>
                                <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                                    {renderTopTracks()}
                                </div>
                            </div>
                            <div className="col-md-4" style={{ display: 'flex', justifyContent: 'center' }}>
                                <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                                    {renderAlbums()}
                                </div>
                            </div>
                            <div className="col-md-4" style={{ display: 'flex', justifyContent: 'center' }}>
                                <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                                    {renderCustomAlbums()}
                                </div>
                            </div>
                        </div>
                    )}

                    <h3 className='mt-3 text-start'><FcLikePlaceholder />Albums</h3>
                    {renderLikedSection(likedAlbums, 'album')}
                    <h3><FcLikePlaceholder />Tracks</h3>
                    {renderLikedSection(likedTracks, 'track')}
                    <h3><FcLikePlaceholder />Artists</h3>
                    {renderLikedSection(likedArtists, 'artist')}
                    <div className="row" style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                            {renderReviewsSection(userReviews)}
                        </div>
                    </div>


                </div>
            ) : (
                <p className='ps-4'>Please log in to view more.</p>
            )}
        </div>
    );
}

export default Home;
