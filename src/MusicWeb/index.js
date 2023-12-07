import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './Home';
import Search from './Search';
import Details from './Details';
import { AccessTokenProvider } from './AccessTokenContext';
import Register from './users/signup';
import Profile from './users/profile';
import Login from "./users/signin";
import UserTable from "./users/table";
import UserProfile from './users/userProfile';
import Playlist from './Playlists';
import './index.css';

function MusicWeb() {
    return (
        <AccessTokenProvider>
            <Router>
                <div>
                    {/* Nav Bar */}
                    <nav className='navbar p-2'>
                        <Link to="/home" style={{ marginRight: '10px' }} className="no-underline">Home</Link>
                        <Link to="/login" style={{ marginRight: '10px' }} className="no-underline">Login</Link>
                        <Link to="/signup" style={{ marginRight: '10px' }} className="no-underline">Register</Link>
                        <Link to="/profile" style={{ marginRight: '10px' }} className="no-underline">Profile</Link>
                        <Link to="/users" style={{ marginRight: '10px' }} className="no-underline">Users</Link>
                        <Link to="/search" className="no-underline">Search</Link>
                    </nav>

                    {/* Routes */}
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Register />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/details" element={<Details />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/users" element={<UserTable />} />
                        <Route path="/profile/:id" element={<UserProfile />} />
                        <Route path="/playlists/:playlistId" element={<Playlist />} />
                        <Route path="*" element={<Navigate to="/home" replace />} />
                    </Routes>
                </div>
            </Router>
        </AccessTokenProvider>
    );
}

export default MusicWeb;
