import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as client from '../users/client';
import * as likes from '../Likes';

function Home() {
    const [profile, setProfile] = useState(null);
    const [likedAlbums, setLikedAlbums] = useState([]);
    const [likedTracks, setLikedTracks] = useState([]);
    const [likedArtists, setLikedArtists] = useState([]);

    const fetchProfile = async () => {
        try {
            const profileData = await client.profile();
            setProfile(profileData);
        } catch (error) {
            console.error("Error fetching profile:", error);
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

    const renderLikedSection = (items, type) => {
        return items.map(item => (
            <Link to={`/details?identifier=${item.itemId}&type=${type}`} key={item._id} className="card no-underline">
                <img src={getImageUrl(item, type)} alt={item.itemTitle} className="card-img-top" />
                <div className="card-body">
                    <p className="card-text text-primary text-center">{item.itemTitle}</p>
                </div>
            </Link>
        ));
    };    

    return (
        <div>
            <h2>Home</h2>
            {profile ? (
                <div className="container">
                    <p>Welcome, {profile.username}!</p>
                    <div className="row">
                        <div className="col-md-4">
                            <h3>Liked Albums</h3>
                            <div>{renderLikedSection(likedAlbums, 'album')}</div>
                        </div>
                        <div className="col-md-4">
                            <h3>Liked Tracks</h3>
                            <div>{renderLikedSection(likedTracks, 'track')}</div>
                        </div>
                        <div className="col-md-4">
                            <h3>Liked Artists</h3>
                            <div>{renderLikedSection(likedArtists, 'artist')}</div>
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
