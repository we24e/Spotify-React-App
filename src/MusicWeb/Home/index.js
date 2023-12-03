import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as client from '../users/client';
import * as likes from '../Likes';
import { Carousel } from 'react-bootstrap';
import { fetchReviewsByUser } from '../Reviews';
import './index.css';

function Home() {
    const [profile, setProfile] = useState(null);
    const [likedAlbums, setLikedAlbums] = useState([]);
    const [likedTracks, setLikedTracks] = useState([]);
    const [likedArtists, setLikedArtists] = useState([]);
    const [userReviews, setUserReviews] = useState([]);

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
                setUserReviews(reviews);
            } catch (error) {
                console.error("Error fetching user reviews:", error);
            }
        }
    };

    const fetchLikedAlbums = async () => {
        if (profile) {
            try {
                const albums = await likes.fetchLikedItems(profile._id, 'album');
                setLikedAlbums(albums);
            } catch (error) {
                console.error("Error fetching liked albums:", error);
            }
        }
    };

    const fetchLikedTracks = async () => {
        if (profile) {
            try {
                const tracks = await likes.fetchLikedItems(profile._id, 'track');
                setLikedTracks(tracks);
            } catch (error) {
                console.error("Error fetching liked tracks:", error);
            }
        }
    };

    const fetchLikedArtists = async () => {
        if (profile) {
            try {
                const artists = await likes.fetchLikedItems(profile._id, 'artist');
                setLikedArtists(artists);
            } catch (error) {
                console.error("Error fetching liked artists:", error);
            }
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (profile) {
            fetchLikedAlbums();
            fetchLikedTracks();
            fetchLikedArtists();
            fetchUserReviews();
        }
    }, [profile]);

    const getImageUrl = (item, type) => {
        switch (type) {
            case 'album':
                return item.detail.image;
            case 'track':
                return item.detail.album.image;
            case 'artist':
                return item.detail.image;
            default:
                return '';
        }
    };
    const renderReviewsSection = (reviews) => {
        return (
            <Carousel>
                {reviews.map(review => (
                    <Carousel.Item key={review._id}>
                        <div className="review-panel d-flex">
                            <Link to={`/details?identifier=${review.itemID}&type=${review.itemType}`} className="review-image-container flex-shrink-1">
                                <img src={getImageUrl(review, review.itemType)} alt="Review" className="review-image" />
                            </Link>
    
                            {/* Use Bootstrap classes for aligning text in the middle */}
                            <div className="review-text-panel d-flex align-items-center justify-content-center flex-grow-1">
                                <p className="m-0">{review.reviewText}</p>
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
                            <img src={getImageUrl(item, type)} alt={item.itemTitle} className="d-block w-100" />
                            {/* <Carousel.Caption>
                                <p className="text-white text-center">{item.itemTitle}</p>
                            </Carousel.Caption> */}
                        </Link>
                    </Carousel.Item>
                ))}
            </Carousel>
        );
    };

    return (
        <div>
            <h2>Home</h2>
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
