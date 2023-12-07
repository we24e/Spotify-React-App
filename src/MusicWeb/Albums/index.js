import axios from 'axios';
export const API_BASE_URL = process.env.REACT_APP_BASE_API_URL;


export const createAlbum = async (userId, title, description, trackIDs) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/albums`, {
            userId, title, description, trackIDs
        });
        return response.data;
    } catch (error) {
        console.error('Error creating album:', error);
        throw error;
    }
};

export const deleteAlbum = async (albumId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/api/albums/${albumId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting album:', error);
        throw error;
    }
};

export const fetchAlbumsByUser = async (userId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/users/${userId}/albums`);
        return response.data;
    } catch (error) {
        console.error('Error fetching albums by user:', error);
        throw error;
    }
};

export const fetchAllAlbums = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/albums`);
        return response.data;
    } catch (error) {
        console.error('Error fetching all albums:', error);
        throw error;
    }
};

export const updateAlbum = async (albumId, title, description, trackIDs) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/api/albums/${albumId}`, {
            title, description, trackIDs
        });
        return response.data;
    } catch (error) {
        console.error('Error updating album:', error);
        throw error;
    }
};

export const fetchAlbumById = async (albumId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/albums/${albumId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching album by ID:', error);
        throw error;
    }
};

export const addTrackToAlbum = async (albumId, trackId) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/api/albums/${albumId}/add-track`, { trackId });
        return response.data;
    } catch (error) {
        console.error('Error adding track to album:', error);
        throw error;
    }
};