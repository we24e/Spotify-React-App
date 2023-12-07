import axios from 'axios';
export const API_BASE_URL = process.env.REACT_APP_BASE_API_URL;

export const likeItem = async (userId, itemId, itemType) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/users/${userId}/likes`, { itemId, itemType });
        return response.data;
    } catch (error) {
        console.error('Error liking item:', error);
        throw error;
    }
};


export const unlikeItem = async (userId, itemId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/api/users/${userId}/likes/${itemId}`);
        return response.data;
    } catch (error) {
        console.error('Error unliking item:', error);
        throw error;
    }
};


export const checkIfUserLikedItem = async (userId, itemId) => {
    if (!userId) {
        console.error("User ID is not loggedIn, skipping like check");
        return;
    }
    try {
        const response = await axios.get(`${API_BASE_URL}/api/users/${userId}/likes/check`, { params: { itemId } });
        return response.data;
    } catch (error) {
        console.error('Error checking if user liked item:', error);
        throw error;
    }
};


export const fetchLikedItems = async (userId, itemType) => {
    try {
        const params = {};
        if (itemType) {
            params.type = itemType;
        }
        const response = await axios.get(`${API_BASE_URL}/api/users/${userId}/likes`, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching liked items:', error);
        throw error;
    }
};
