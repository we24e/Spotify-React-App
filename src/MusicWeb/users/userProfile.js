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
    const navigate = useNavigate();
    const fetchFollowingStatus = async () => {
        try {
            const isFollowingData = await client.checkIfFollowing(id);
            setIsFollowing(isFollowingData);
        } catch (err) {
            console.error("Error checking following (Probably not loggedIN):", err);
        }
    };
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
        console.log(playlists);
        return (
            <div className="mt-4">
                <h3>User Playlists</h3>
                <Swiper
                    spaceBetween={15}
                    slidesPerView={3}
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

    return (
        <>
            {user ? (
                <div className="card">
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
                        {/* User details */}
                        <div className="row text-center mt-3">
                            <div className="col-md-4">
                                <p><strong>Username:</strong> {user.username}</p>
                            </div>
                            <div className="col-md-4">
                                <p><strong>First Name:</strong> {user.firstName}</p>
                            </div>
                            <div className="col-md-4">
                                <p><strong>Last Name:</strong> {user.lastName}</p>
                            </div>
                        </div>

                        {user.role === 'ARTIST' ? (
                            <div className="row mt-4">
                                <div className="col-md-6">
                                    {renderTopTracks()}
                                </div>
                                <div className="col-md-6">
                                    {renderAlbums()}
                                </div>
                            </div>
                        ): (
                            // Render user's playlists if not an artist
                            <div className="mt-4">
                                {renderPlaylists()}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <p className="text-center">Loading user profile...</p>
            )}
        </>
    );
}

export default UserProfile;
