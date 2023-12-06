import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import * as client from './client';
import { fetchItemDetails } from '../Search/util';
import { AccessTokenContext } from '../AccessTokenContext';

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

    return (
        <div>
            <h2>Playlist Details</h2>
            {playlist ? (
                <div>
                    <h3>{playlist.title}</h3>
                    <ul>
                        {tracksDetails.map((track, index) => (
                            <li key={track.id || index}>
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
                                {track.album.images && track.album.images.length > 0 && (
                                    <img src={track.album.images[0].url} alt={track.album.name} />
                                )}
                            </li> 
                        ))}
                    </ul>
                </div>
            ) : (
                <p>Loading playlist...</p>
            )}
        </div>
    );
}

export default Playlists;
