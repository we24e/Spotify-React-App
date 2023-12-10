import React from 'react';
import './index.css';
import logo from './logo.png';
import { ReactComponent as Logo } from './logo.svg';
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
import { IoHomeOutline, IoSearchOutline } from 'react-icons/io5';
import { MdOutlineAccountCircle } from 'react-icons/md';
import './NavBar.css';
import { IoMdLogIn } from "react-icons/io";
import { PiUsersThreeBold } from "react-icons/pi";
import { useEffect, useState } from 'react';
import * as client from "./users/client";
import { useNavigate } from 'react-router-dom';
import { BiLogOutCircle } from "react-icons/bi"
import { TiThMenuOutline } from "react-icons/ti";
import Footer from './Footer';

function NavBar({ menuOpen }) {
    const [isUserSignedIn, setIsUserSignedIn] = useState(false);
    const navigate = useNavigate();
    const [username, setUsername] = useState('');

    useEffect(() => {
        const savedUsername = localStorage.getItem('username');
        if (savedUsername) {
            setUsername(savedUsername);
            setIsUserSignedIn(true);
        }
    }, []);

    const handleSignOut = async () => {
        try {
            await client.signout();
            setIsUserSignedIn(false);
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('username');
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };
    return (
        <div className="col-md-1">
            <nav id="navbar" className={`navbar-items ${menuOpen ? 'show' : ''}`} style={{ zIndex: 1000 }}>
                <ul className={`navbar-items flexbox-col ${menuOpen ? 'show' : ''}`}>
                    <li className="navbar-logo flexbox-left">
                        <Logo className="navbar-logo" />
                        <span className="navbar-item-inner flexbox username">
                            {isUserSignedIn ? `Hello, ${username}` : ''}
                        </span>
                    </li>

                    <li className="navbar-item flexbox-left">
                        <Link to="/search" className="navbar-item-inner flexbox">
                            <IoSearchOutline className='nav-icon' />
                            <span className="link-text ms-1">Search</span>
                        </Link>
                    </li>
                    <li className="navbar-item flexbox-left">
                        <Link to="/home" className="navbar-item-inner flexbox">
                            <IoHomeOutline className='nav-icon' />
                            <span className="link-text ms-1">Home</span>
                        </Link>
                    </li>
                    <li className="navbar-item flexbox-left">
                        <Link to="/login" className="navbar-item-inner flexbox">
                            <IoMdLogIn className='nav-icon' />
                            <span className="link-text ms-1">Login</span>
                        </Link>
                    </li>
                    <li className="navbar-item flexbox-left">
                        <Link to="/profile" className="navbar-item-inner flexbox">
                            <MdOutlineAccountCircle className='nav-icon' />
                            <span className="link-text ms-1">Profile</span>
                        </Link>
                    </li>
                    <li className="navbar-item flexbox-left">
                        <Link to="/users" className="navbar-item-inner flexbox">
                            <PiUsersThreeBold className='nav-icon' />
                            <span className="link-text ms-1">Users</span>
                        </Link>
                    </li>
                    {isUserSignedIn && (
                        <li className="navbar-item flexbox-left navbar-bottom">
                            <button onClick={handleSignOut} className="navbar-item-inner flexbox signout-button">
                                <BiLogOutCircle className='nav-icon' />
                                <span className="link-text ms-1">Sign Out</span>
                            </button>
                        </li>
                    )}

                </ul>
            </nav>
        </div>
    );
}
function MusicWeb() {
    const [menuOpen, setMenuOpen] = useState(false);

    const [isUserSignedIn, setIsUserSignedIn] = useState(false);

    useEffect(() => {
        const savedUsername = localStorage.getItem('username');
        if (savedUsername) {
            setIsUserSignedIn(true);
        }
    }, []);

    const checkScreenSize = () => {
        if (window.innerWidth > 768) {
            setMenuOpen(false);
        }
    };
    const handleSignOut = async () => {
        try {
            await client.signout();
            setIsUserSignedIn(false);
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('username');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    useEffect(() => {
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };
    return (
        <AccessTokenProvider>
            <Router>
                <div className="container-fluid p-0">
                    <div className="row no-gutters">
                        <div className="hamburger-menu d-md-none" onClick={toggleMenu}>
                            <div style={{ padding: '10px', textAlign: 'center' }}>
                                <TiThMenuOutline />
                            </div>
                        </div>
                        <NavBar />
                        <div className="col-md-11 body-expand">
                            {menuOpen && (
                                <div className="mobile-nav">

                                    <li className="navbar-item flexbox-left">
                                        <Link to="/search" className="navbar-item-inner flexbox">
                                            <IoSearchOutline className='nav-icon' />
                                            <span className="ms-1">Search</span>
                                        </Link>
                                    </li>
                                    <li className="navbar-item flexbox-left">
                                        <Link to="/home" className="navbar-item-inner flexbox">
                                            <IoHomeOutline className='nav-icon' />
                                            <span className="ms-1">Home</span>
                                        </Link>
                                    </li>
                                    <li className="navbar-item flexbox-left">
                                        <Link to="/login" className="navbar-item-inner flexbox">
                                            <IoMdLogIn className='nav-icon' />
                                            <span className="ms-1">Login</span>
                                        </Link>
                                    </li>
                                    <li className="navbar-item flexbox-left">
                                        <Link to="/profile" className="navbar-item-inner flexbox">
                                            <MdOutlineAccountCircle className='nav-icon' />
                                            <span className="ms-1">Profile</span>
                                        </Link>
                                    </li>
                                    <li className="navbar-item flexbox-left">
                                        <Link to="/users" className="navbar-item-inner flexbox">
                                            <PiUsersThreeBold className='nav-icon' />
                                            <span className="ms-1">Users</span>
                                        </Link>
                                    </li>
                                    {isUserSignedIn && (
                                        <li className="navbar-item flexbox-left">
                                            <Link to="/login" onClick={handleSignOut} className="navbar-item-inner flexbox">
                                                <BiLogOutCircle className='nav-icon' />
                                                <span className="ms-1">Sign Out</span>
                                            </Link>
                                        </li>
                                    )}
                                </div>
                            )}
                            <main>
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
                            </main>
                            <Footer />
                        </div>
                    </div>
                </div>
            </Router>
        </AccessTokenProvider>
    );
}

export default MusicWeb;