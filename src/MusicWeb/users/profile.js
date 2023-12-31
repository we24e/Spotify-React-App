import * as client from "./client";
import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import * as playList from "../Playlists/client";
import * as albumClient from "../Albums";
import '../randomCss/galaxy.scss';
import './profile.css';

function Profile() {
    const [profile, setProfile] = useState(null);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [followersCollapsed, setFollowersCollapsed] = useState(true);
    const [followingCollapsed, setFollowingCollapsed] = useState(true);
    const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
    const [playlists, setPlaylists] = useState([]);
    const navigate = useNavigate();

    const fetchPlaylists = async () => {
        if (profile && profile._id) {
            try {
                const userPlaylists = await playList.fetchPlaylistsByUser(profile._id);
                setPlaylists(userPlaylists);
            } catch (error) {
                console.error('Error fetching playlists:', error);
                alert("Failed to fetch playlists.");
            }
        }
    };

    const createPlaylist = async () => {
        if (!newPlaylistTitle) {
            alert("Please enter a title for the playlist.");
            return;
        }
        try {
            await playList.createPlaylist(profile._id, newPlaylistTitle, []);
            alert("Playlist created successfully!");
            fetchPlaylists();
            setNewPlaylistTitle('');
        } catch (error) {
            console.error('Error creating playlist:', error);
            alert("Failed to create playlist.");
        }
    };

    const deletePlaylist = async (playlistId) => {
        if (window.confirm("Are you sure you want to delete this playlist?")) {
            try {
                await playList.deletePlaylist(playlistId);
                setPlaylists(playlists.filter(pl => pl._id !== playlistId));
                alert("Playlist deleted successfully!");
            } catch (error) {
                console.error('Error deleting playlist:', error);
                alert("Failed to delete playlist.");
            }
        }
    };

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
        if (!profile.password) {
            alert("Password cannot be empty.");
            return;
        }

        try {
            await client.updateUser(profile);
            alert("Profile Saved.");
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save profile.");
        }
    };

    useEffect(() => {
        const loadProfile = async () => {
            if (!profile) {
                await fetchProfile();
            }
            if (profile && profile._id) {
                await fetchFollowersAndFollowing(profile._id);
                await fetchPlaylists();
            }
        };

        loadProfile();
    }, [profile]);

    useEffect(() => {
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        if (!isAuthenticated) {
            alert("You must be logged in to view your profile.");
            navigate('/signin');
        }
    }, [navigate]);

    const [albums, setAlbums] = useState([]);
    const [newAlbumTitle, setNewAlbumTitle] = useState('');
    const [newAlbumDescription, setNewAlbumDescription] = useState('');
    const fetchAlbums = async () => {
        if (profile && profile._id) {
            try {
                const userAlbums = await albumClient.fetchAlbumsByUser(profile._id);
                setAlbums(userAlbums);
            } catch (error) {
                console.error('Error fetching albums:', error);
                alert("Failed to fetch albums.");
            }
        }
    };

    useEffect(() => {
        if (profile && profile._id) {
            fetchAlbums();
        }
    }, [profile]);

    const createAlbum = async () => {
        if (!newAlbumTitle) {
            alert("Please enter a title for the album.");
            return;
        }
        try {
            await albumClient.createAlbum(profile._id, newAlbumTitle, newAlbumDescription, []);
            alert("Album created successfully!");
            fetchAlbums();
            setNewAlbumTitle('');
            setNewAlbumDescription('');
        } catch (error) {
            console.error('Error creating album:', error);
            alert("Failed to create album.");
        }
    };
    const deleteAlbum = async (albumId) => {
        if (window.confirm("Are you sure you want to delete this album?")) {
            try {
                await albumClient.deleteAlbum(albumId);
                setAlbums(albums.filter(al => al._id !== albumId));
                alert("Album deleted successfully!");
            } catch (error) {
                console.error('Error deleting album:', error);
                alert("Failed to delete album.");
            }
        }
    };

    return (
        <div className="w-100">
            <div class="animation-wrapper">
                <div class="particle particle-1"></div>
                <div class="particle particle-2"></div>
                <div class="particle particle-3"></div>
                <div class="particle particle-4"></div>
            </div>
            {profile ? (
                <div className="p-1">
                    <div className="profile-form futuristic-theme m-2">
                        <h1 className="future-font">Profile</h1>
                        <div className="form-grid">
                            <div className="label">First Name:</div>
                            <div className="label">Last Name:</div>
                            <input className="form-control futuristic-input" placeholder="first name" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
                            <input className="form-control futuristic-input" placeholder="last name" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
                        </div>
                        <label>Username: <input placeholder="username"  className="form-control futuristic-input disabled-input" value={profile.username} disabled /></label>
                        <label>Password: <input placeholder="pswd" className="form-control futuristic-input" value={profile.password} onChange={(e) => setProfile({ ...profile, password: e.target.value })} /></label>

                        <label>Date of Birth:
                            <input
                                type="date"
                                className="form-control futuristic-input"
                                value={profile.dob ? formatDateForDisplay(profile.dob) : ''}
                                onChange={(e) => setProfile({ ...profile, dob: formatBackToISO(e.target.value) })}
                            />
                        </label>
                        <label>Email: <input placeholder="email" className="form-control futuristic-input" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></label>
                        <label>Role:
                            <select value={profile.role} className="form-control futuristic-input disabled-input" disabled>
                                <option value="USER">User</option>
                                <option value="ARTIST">Artist</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </label>
                        {profile.role === "ARTIST" && (
                            <label>Artist ID:
                                <input
                                    placeholder="Artist ID" 
                                    className="form-control futuristic-input"
                                    value={profile.artistID || ''}
                                    onChange={(e) => setProfile({ ...profile, artistID: e.target.value })}
                                    name="artistID"
                                />
                            </label>
                        )}
                        {profile.role === "ADMIN" && (
                            <label>Timezone:
                                <select
                                    placeholder="Select Timezone"
                                    value={profile.timezone}
                                    className="form-control futuristic-input"
                                    onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                                >
                                    <option value="EST">Eastern Standard Time (EST)</option>
                                    <option value="CST">Central Standard Time (CST)</option>
                                    <option value="MST">Mountain Standard Time (MST)</option>
                                    <option value="PST">Pacific Standard Time (PST)</option>
                                    <option value="GMT">Greenwich Mean Time (GMT)</option>
                                </select>
                            </label>
                        )}
                        <button className="save-button futuristic-button mt-3" onClick={save}>Save</button>
                    </div>
                    <br />
                    {profile.role === "ARTIST" && (
                        <>
                            <div className="p-3 m-2 mb-0 new-section">
                                <h2>My Custom Albums</h2>
                                {albums.length > 0 ? (
                                    <ul className="profile-playlist mb-0">
                                        {albums.map((album, index) => (
                                            <li className="profile-playlist-items d-flex justify-content-between align-items-center" key={album._id}>
                                                <Link to={`/details?identifier=${album._id}&type=album`} className="no-underline">
                                                    {album.title} ({album.trackIDs.length} songs)
                                                </Link>
                                                <button className="btn btn-danger" onClick={() => deleteAlbum(album._id)}>Delete</button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p>No albums found.</p>}
                                <div>
                                    <label className="form-label">New Album Title:</label>
                                    <input
                                        value={newAlbumTitle}
                                        className="form-control futuristic-input"
                                        onChange={(e) => setNewAlbumTitle(e.target.value)}
                                        placeholder="Enter album title"
                                    />
                                    <label className="form-label mt-1">New Album Description:</label>
                                    <input
                                        value={newAlbumDescription}
                                        className="form-control futuristic-input"
                                        onChange={(e) => setNewAlbumDescription(e.target.value)}
                                        placeholder="Enter album description"
                                    />
                                    <button className="futuristic-button mt-3 mb-3" onClick={createAlbum}>Create Album</button>
                                </div>
                            </div>

                        </>
                    )}
                    {profile.role !== "ARTIST" && (
                        <>
                            <div className="p-3 m-2 mb-0 new-section">
                                <h2>My Playlists</h2>
                                {playlists.length > 0 ? (
                                    <ul className="profile-playlist mb-0">
                                        {playlists.map((playlist, index) => (
                                            <li className="profile-playlist-items d-flex justify-content-between align-items-center" key={playlist._id}>
                                                <Link to={`/playlists/${playlist._id}`} className="no-underline">
                                                    {playlist.title} ({playlist.trackIDs.length} songs)
                                                </Link>
                                                <button className="btn btn-danger" onClick={() => deletePlaylist(playlist._id)}>Delete</button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p>No playlists found.</p>}
                                <div>
                                    <label className="form-label">New Playlist Title:</label>
                                    <input
                                        value={newPlaylistTitle}
                                        className="form-control futuristic-input"
                                        onChange={(e) => setNewPlaylistTitle(e.target.value)}
                                        placeholder="Enter playlist title"
                                    />
                                    <button className="futuristic-button mt-3 mb-3" onClick={createPlaylist}>Create Playlist</button>
                                </div>
                            </div>

                        </>
                    )}
                    <div className="followers-section ">

                        <div className="followers">
                            <h3>Followers: {followers.length}</h3>
                            <button className="toggle-button" onClick={() => setFollowersCollapsed(!followersCollapsed)}>
                                {followersCollapsed ? 'Show' : 'Hide'} Followers
                            </button>
                            {!followersCollapsed && (
                                <table className="followers-table">
                                    <tbody>
                                        {followers.map(follower => (
                                            <tr key={follower._id}>
                                                <td><Link to={`/profile/${follower._id}`} className="profile-link">{follower.username}</Link></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="following">
                            <h3>Following: {following.length}</h3>
                            <button className="toggle-button" onClick={() => setFollowingCollapsed(!followingCollapsed)}>
                                {followingCollapsed ? 'Show' : 'Hide'} Following
                            </button>
                            {!followingCollapsed && (
                                <table className="following-table">
                                    <tbody>
                                        {following.map(followed => (
                                            <tr key={followed._id}>
                                                <td><Link to={`/profile/${followed._id}`} className="profile-link">{followed.username}</Link></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                </div>
            )
                : (
                    <h1 className="mt-4" style={{ textAlign: 'center' }}>Loading your Profile...</h1>
                )
            }

        </div>
    );
}

export default Profile;
