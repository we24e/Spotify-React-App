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

function MusicWeb() {
    return (
        <AccessTokenProvider>
            <Router>
                <div>
                    {/* Nav Bar */}
                    <nav style={{ backgroundColor: '#f0f0f0', padding: '10px' }}>
                        <Link to="/home" style={{ marginRight: '10px' }}>Home</Link>
                        <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
                        <Link to="/signup" style={{ marginRight: '10px' }}>Register</Link>
                        <Link to="/profile" style={{ marginRight: '10px' }}>Profile</Link>
                        <Link to="/users" style={{ marginRight: '10px' }}>Users</Link>
                        <Link to="/search">Search</Link>
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
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </div>
            </Router>
        </AccessTokenProvider>
    );
}

export default MusicWeb;
