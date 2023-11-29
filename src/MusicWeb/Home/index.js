import React, { useEffect, useState } from 'react';
import * as client from '../users/client';

function Home() {
    const [profile, setProfile] = useState(null);
    const fetchProfile = async () => {
        try {
            const profileData = await client.profile();
            setProfile(profileData);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };
    useEffect(() => {
        fetchProfile();
    }, []);

    return (
        <div>
            <h2>Home</h2>
            {profile ? (
                <div>
                    <p>Welcome, {profile.username}!</p>
                </div>
            ) : (
                <p>Please log in to see your profile information.</p>
            )}
        </div>
    );
}

export default Home;
