import axios from 'axios';
export const API_BASE_URL = process.env.REACT_APP_BASE_API_URL;

export const createReview = async (userId, detail, reviewText, itemType, itemID) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/reviews`, {
            userId, detail, reviewText, itemType, itemID
        });
        return response.data;
    } catch (error) {
        console.error('Error creating review:', error);
        throw error;
    }
};

export const deleteReview = async (reviewId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/api/reviews/${reviewId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting review:', error);
        throw error;
    }
};

export const fetchReviewsForItem = async (itemId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/items/${itemId}/reviews`);
        return response.data;
    } catch (error) {
        console.error('Error fetching reviews for item:', error);
        throw error;
    }
};

export const fetchReviewsByUser = async (userId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/users/${userId}/reviews`);
        return response.data;
    } catch (error) {
        console.error('Error fetching reviews by user:', error);
        throw error;
    }
};

