import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as client from './client';
import { fetchItemDetails } from '../Search/util';
import { AccessTokenContext } from '../AccessTokenContext';
import * as userClient from '../users/client';
import { ListGroup, ListGroupItem, Button, Alert, Card } from 'react-bootstrap';
import './index.css';
import { RiDeleteBinLine } from "react-icons/ri";
import { PiContactlessPaymentLight } from 'react-icons/pi';

function Playlists() {
    const { playlistId } = useParams();
    const [playlist, setPlaylist] = useState(null);
    const [tracksDetails, setTracksDetails] = useState([]);
    const { accessToken } = useContext(AccessTokenContext);

    const fetchPlaylistDetails = async () => {
        try {
            const playlistData = await client.fetchPlaylistById(playlistId);
            setPlaylist(playlistData);
            fetchTracksDetails(playlistData.trackIDs);
        } catch (error) {
            console.error("Error fetching playlist details:", error);
        }
    };

    const fetchTracksDetails = async (trackIds) => {
        try {
            const details = await Promise.all(
                trackIds.map(trackId => fetchItemDetails(trackId, 'track', accessToken))
            );
            setTracksDetails(details);
        } catch (error) {
            console.error("Error fetching track details:", error);
        }
    };

    const formatDuration = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    };

    useEffect(() => {
        fetchPlaylistDetails();
    }, [playlistId]);

    const [profile, setProfile] = useState(null);
    const fetchProfile = async () => {
        try {
            const profileData = await userClient.profile();
            setProfile(profileData);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };
    useEffect(() => {
        fetchProfile();
    }, []);
    const handleDeleteTrack = async (trackId) => {
        if (window.confirm("Are you sure you want to delete this track?")) {
            await client.deleteTrackFromPlaylist(playlistId, trackId);
            fetchPlaylistDetails();
        }
    };

    return (
        <div className="container-playlist p-1 m-0 mt-1">
            <div class="animation-wrapper">
                <div class="particle particle-1"></div>
                <div class="particle particle-2"></div>
                <div class="particle particle-3"></div>
                <div class="particle particle-4"></div>
            </div>
            {playlist ? (
                <div className="playlist-card shadow-sm p-2 rounded">
                    <h2 className="playlist-title">Playlist: {playlist.title}</h2>
                    <div className="track-list">
                        {tracksDetails.map((track, index) => (
                            <div key={track.id || index} className="track-item mb-3">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <div className="track-image">
                                            {track.album.images && track.album.images.length > 0 && (
                                                <img src={track.album.images[0].url} alt={track.album.name} className="img-fluid" />
                                            )}
                                        </div>
                                        <div className="track-info">
                                            <Link to={`/details?identifier=${track.id}&type=track`} className="track-link">
                                                <h4 className="track-name">{track.name}</h4>
                                                <p className="track-artist">Artist: {track.artists.map(artist => artist.name).join(', ')}</p>
                                                <p className="track-album">Album: {track.album.name}</p>
                                                <p className="track-duration">Duration: {formatDuration(track.duration_ms)}</p>
                                            </Link>
                                        </div>
                                    </div>
                                    {profile && profile._id === playlist.userId && (
                                        <button className="btn btn-danger delete-button" onClick={() => handleDeleteTrack(track.id)}><RiDeleteBinLine /></button>
                                    )}
                                </div>
                                {track.preview_url && (
                                    <audio controls src={track.preview_url} className="audio-preview w-100">
                                        Your browser does not support the audio element.
                                    </audio>
                                )}
                                <hr className='custom-hr' />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="alert alert-info">Loading playlist...</div>
            )}
        </div>
    );


}
export default Playlists;
