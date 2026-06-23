import api from "../axios/api.js";

const COMMENTS_PREFIX = "/comments";

export const addComment = async (commentData) => {
  try {
    const response = await api.post(`${COMMENTS_PREFIX}`, {
      pid: commentData.pid,
      userid: commentData.userid,
      ...commentData,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getAllComments = async (pid) => {
  try {
    const response = await api.get(`${COMMENTS_PREFIX}/${pid}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteComment = async (id, pid) => {
  try {
    const response = await api.delete(`${COMMENTS_PREFIX}/${id}/${pid}`);
    return response;
  } catch (error) {
    throw error;
  }
};