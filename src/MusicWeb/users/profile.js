import * as client from "./client";
import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [followersCollapsed, setFollowersCollapsed] = useState(true);
    const [followingCollapsed, setFollowingCollapsed] = useState(true);

    const navigate = useNavigate();

    const formatDateForDisplay = (isoString) => {
        const date = new Date(isoString);
        return date.toISOString().split('T')[0];
    };
    const formatBackToISO = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString();
    };
    const fetchProfile = async () => {
        const profile = await client.profile();
        setProfile(profile);
    };

    const fetchFollowersAndFollowing = async (id) => {
        const fetchedFollowers = await client.getFollowers(id);
        const fetchedFollowing = await client.getFollowing(id);
        const followersProfiles = await Promise.all(fetchedFollowers.map(followerId => client.findUserById(followerId)));
        const followingProfiles = await Promise.all(fetchedFollowing.map(followingId => client.findUserById(followingId)));
        setFollowers(followersProfiles);
        setFollowing(followingProfiles);
    };

    const save = async () => {
        await client.updateUser(profile);
        alert("Profile Saved.");
    };

    const signout = async () => {
        await client.signout();
        navigate("/login");
    };

    useEffect(() => {
        const loadProfile = async () => {
            if (!profile) {
                await fetchProfile();
            }
            if (profile && profile._id) {
                await fetchFollowersAndFollowing(profile._id);
            }
        };

        loadProfile();
    }, [profile]);

    return (
        <div className="w-50">
            <h1>Profile</h1>
            {profile && (
                <div>
                    <label>Username: <input value={profile.username} disabled /></label>
                    <label>Password: <input value={profile.password} onChange={(e) => setProfile({ ...profile, password: e.target.value })} /></label>
                    <label>First Name: <input value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} /></label>
                    <label>Last Name: <input value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} /></label>
                    <label>Date of Birth:
                        <input
                            type="date"
                            value={profile.dob ? formatDateForDisplay(profile.dob) : ''}
                            onChange={(e) => setProfile({ ...profile, dob: formatBackToISO(e.target.value) })}
                        />
                    </label>
                    <label>Email: <input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></label>
                    <label>Role:
                        <select value={profile.role} disabled>
                            <option value="USER">User</option>
                            <option value="ARTIST">Artist</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </label>
                    <br />
                    <br />

                    <button onClick={save}>Save</button>
                    <br />
                    <button onClick={signout}>Signout</button>
                    <br />
                    <div style={{ display: 'flex', justifyContent: 'space-around' }}>

                        <div>
                            <div><label>Followers: {followers.length}</label></div>
                            <button onClick={() => setFollowersCollapsed(!followersCollapsed)}>
                                {followersCollapsed ? 'Show' : 'Hide'} Followers
                            </button>
                            {!followersCollapsed && (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Followers</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {followers.map(follower => (
                                            <tr key={follower._id}>
                                                <td><Link to={`/profile/${follower._id}`} className="no-underline">{follower.username}</Link></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div>
                            <div><label>Following: {following.length}</label></div>

                            <button onClick={() => setFollowingCollapsed(!followingCollapsed)}>
                                {followingCollapsed ? 'Show' : 'Hide'} Following
                            </button>
                            {!followingCollapsed && (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Following</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {following.map(followed => (
                                            <tr key={followed._id}>
                                                <td><Link to={`/profile/${followed._id}`} className="no-underline">{followed.username}</Link></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;
