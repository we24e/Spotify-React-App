import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_BASE_API_URL;


export const createPlaylist = async (userId, title, trackIDs) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/playlists`, {
            userId, title, trackIDs
        });
        return response.data;
    } catch (error) {
        console.error('Error creating playlist:', error);
        throw error;
    }
};

export const deletePlaylist = async (playlistId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/api/playlists/${playlistId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting playlist:', error);
        throw error;
    }
};

export const fetchPlaylistsByUser = async (userId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/users/${userId}/playlists`);
        return response.data;
    } catch (error) {
        console.error('Error fetching playlists by user:', error);
        throw error;
    }
};

export const fetchAllPlaylists = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/playlists`);
        return response.data;
    } catch (error) {
        console.error('Error fetching all playlists:', error);
        throw error;
    }
};

export const updatePlaylist = async (playlistId, title, trackIDs) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/api/playlists/${playlistId}`, {
            title, trackIDs
        });
        return response.data;
    } catch (error) {
        console.error('Error updating playlist:', error);
        throw error;
    }
};
export const fetchPlaylistById = async (playlistId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/playlists/${playlistId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching playlist by ID:', error);
        throw error;
    }
};

export const addTrackToPlaylist = async (playlistId, trackId) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/api/playlists/${playlistId}/add-track`, { trackId });
        return response.data;
    } catch (error) {
        console.error('Error adding track to playlist:', error);
        throw error;
    }
};