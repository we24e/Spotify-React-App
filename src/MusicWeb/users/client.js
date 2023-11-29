import axios from "axios";
export const BASE_API = process.env.REACT_APP_BASE_API_URL;
export const USERS_API = `${BASE_API}/api/users`;
export const signin = async (credentials) => {
  const response = await axios.post(`${USERS_API}/login`, credentials);
  return response.data;
};
export const profile = async () => {
  const response = await axios.post(`${USERS_API}/profile`);
  return response.data;
};

export const updateUser = async (user) => {
  const response = await axios.put(`${USERS_API}/${user._id}`, user);
  return response.data;
};

export const findAllUsers = async () => {
  console.log("findAllUsers");
  console.log(USERS_API);
  const response = await axios.get(`${USERS_API}`);
  return response.data;
};

export const createUser = async (user) => {
  const response = await axios.post(`${USERS_API}`, user);
  return response.data;
};

export const findUserById = async (id) => {
  const response = await axios.get(`${USERS_API}/${id}`);
  return response.data;
};

export const deleteUser = async (user) => {
  const response = await axios.delete(
    `${USERS_API}/${user._id}`);
  return response.data;
};

export const signup = async (credentials) => {
  try {
    const response = await axios.post(`${USERS_API}/signup`, credentials);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const signout = async () => {
  const response = await axios.post(`${USERS_API}/signout`);
  return response.data;
};

export const getFollowers = async (userId) => {
  const response = await axios.get(`${USERS_API}/${userId}/followers`);
  return response.data;
};

export const getFollowing = async (userId) => {
  const response = await axios.get(`${USERS_API}/${userId}/following`);
  return response.data;
};

export const followUser = async (userId) => {
  const response = await axios.post(`${USERS_API}/follow`, { userId });
  return response.data;
};

export const unfollowUser = async (userId) => {
  const response = await axios.post(`${USERS_API}/unfollow`, { userId });
  return response.data;
};
export const checkIfFollowing = async (userId) => {
  const response = await axios.get(`${USERS_API}/${userId}/is-followed-by-current-user`);
  return response.data.isFollowing;
};