import axios from 'axios';

export const fetchItemDetails = async (id, type, accessToken) => {
    if (!accessToken) {
        console.error('Access token is not available');
        return null;
    }

    try {
        let url;
        switch (type) {
            case 'album':
                url = `https://api.spotify.com/v1/albums/${id}`;
                break;
            case 'track':
                url = `https://api.spotify.com/v1/tracks/${id}`;
                break;
            case 'artist':
                url = `https://api.spotify.com/v1/artists/${id}`;
                break;
            default:
                throw new Error('Invalid item type');
        }

        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching item details:', error);
        return null;
    }
};

export const fetchArtistAlbums = async (artistId, market, accessToken) => {
    console.log(artistId)
    if (!accessToken) {
        console.error('Access token is not available');
        return null;
    }
    try {
        const url = `https://api.spotify.com/v1/artists/${artistId}/albums`;
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching artist albums:', error);
        return null;
    }
};

export const fetchArtistTopTracks = async (artistId, market, accessToken) => {
    if (!accessToken) {
        console.error('Access token is not available');
        return null;
    }

    try {
        const url = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=${market}`;
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching artist top tracks:', error);
        return null;
    }
};
