import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import * as client from './client';
import { fetchItemDetails } from '../Search/util';
import { AccessTokenContext } from '../AccessTokenContext';
import * as userClient from '../users/client';
import { ListGroup, ListGroupItem, Button, Alert, Card } from 'react-bootstrap';

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
        <div className="container mt-4">
            {playlist ? (
                <Card>
                    <Card.Header as="h2">PlayList: {playlist.title}</Card.Header>
                    <ListGroup variant="flush">
                        {tracksDetails.map((track, index) => (
                            <ListGroupItem key={track.id || index}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h4>{track.name}</h4>
                                        <p>Artist: {track.artists.map(artist => artist.name).join(', ')}</p>
                                        <p>Album: {track.album.name}</p>
                                        <p>Duration: {formatDuration(track.duration_ms)}</p>
                                        {track.preview_url && (
                                            <audio controls src={track.preview_url}>
                                                Your browser does not support the audio element.
                                            </audio>
                                        )}
                                        <p>
                                            <a href={track.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                                                Listen on Spotify
                                            </a>
                                        </p>
                                    </div>
                                    <div>
                                        {track.album.images && track.album.images.length > 0 && (
                                            <img src={track.album.images[0].url} alt={track.album.name} style={{ width: '150px', height: 'auto' }} />
                                        )}
                                        {profile && profile._id === playlist.userId && (
                                            <Button variant="danger" onClick={() => handleDeleteTrack(track.id)}>Delete</Button>
                                        )}
                                    </div>
                                </div>
                            </ListGroupItem> 
                        ))}
                    </ListGroup>
                </Card>
            ) : (
                <Alert variant="info">Loading playlist...</Alert>
            )}
        </div>
    );
}
export default Playlists;
