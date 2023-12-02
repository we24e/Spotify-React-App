import axios from 'axios';
export const API_BASE_URL = process.env.REACT_APP_BASE_API_URL;

export const likeItem = async (userId, itemId, itemType, itemTitle) => {
    console.log(`${API_BASE_URL}/users/${userId}/likes`);
    try {
        const response = await axios.post(`${API_BASE_URL}/api/users/${userId}/likes`,
            { itemId, itemType, itemTitle }
        );
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
    const response = await axios.get(`${API_BASE_URL}/api/users/${userId}/likes/check`, { params: { itemId } });
    return response.data;
};
