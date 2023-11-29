import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAccessToken } from '../AccessTokenContext';

function Details() {
    const location = useLocation();
    const { accessToken } = useAccessToken();
    const [searchParams] = useSearchParams();
    const identifier = searchParams.get('identifier');
    const type = searchParams.get('type');
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    console.log("Access Token:", accessToken);
    console.log("Identifier:", identifier);
    console.log("Type:", type);
    const fetchDetail = async () => {
        if (!accessToken) {
            setError('No access token available');
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const url = `https://api.spotify.com/v1/${type}s/${identifier}`;
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            setDetail(response.data);
        } catch (err) {
            console.error('Error fetching details:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (identifier && type && accessToken) {
            fetchDetail();
        }
    }, [identifier, type, accessToken]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!detail) return <div>No Details Available</div>;

    return (
        <div>
            <h2>Details for {type}</h2>
            {type === 'album' && detail && (
                <div>
                    <h3>{detail.name}</h3>
                    <p>Release Date: {detail.release_date}</p>
                    <p>Total Tracks: {detail.total_tracks}</p>
                    {detail.images && <img src={detail.images[0].url} alt={detail.name} />}
                    {/* Additional album-specific details */}
                </div>
            )}
            {type === 'track' && detail && (
                <div>
                    <h3>{detail.name}</h3>
                    <p>Album: {detail.album.name}</p>
                    <p>Duration: {detail.duration_ms} ms</p>
                    {detail.album.images && <img src={detail.album.images[0].url} alt={detail.album.name} />}
                    {/* Additional track-specific details */}
                </div>
            )}
            {type === 'artist' && detail && (
                <div>
                    <h3>{detail.name}</h3>
                    <p>Genres: {detail.genres.join(', ')}</p>
                    <p>Followers: {detail.followers.total}</p>
                    {detail.images && <img src={detail.images[0].url} alt={detail.name} />}
                    {/* Additional artist-specific details */}
                </div>
            )}
        </div>

    );
}

export default Details;
