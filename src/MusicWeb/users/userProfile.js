import React, { useState, useEffect } from 'react';
import * as client from './client';
import { useNavigate, useParams } from 'react-router-dom';

function UserProfile() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const navigate = useNavigate();
    const fetchFollowingStatus = async () => {
        try {
            const isFollowingData = await client.checkIfFollowing(id);
            setIsFollowing(isFollowingData);
        } catch (err) {
            console.error("Error checking following (Probably not loggedIN):", err);
        }
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

    return (
        <div>
            <h1>User Profile</h1>
            {user ? (
                <div>
                    <p>Followers: {user.followers.length}   Following: {user.following.length}</p> 
                    <p>Username: {user.username}</p>
                    <p>First Name: {user.firstName}</p>
                    <p>Last Name: {user.lastName}</p>

                    <button onClick={handleFollow}>
                        {isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                </div>
            ) : (
                <p>Loading user profile...</p>
            )}
        </div>
    );
}

export default UserProfile;
