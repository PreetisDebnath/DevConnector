import axios from 'axios';
import { setAlert } from './alert';
import {
  ADD_COMMENT,
  ADD_POST,
  DELETE_POST,
  GET_POST,
  GET_POSTS,
  POST_ERROR,
  REMOVE_COMMENT,
  UPDATE_LIKES
} from './types';

const getErrorMessage = error => {
  const data = error.response && error.response.data;

  if (data && data.errors) {
    return data.errors.map(({ msg }) => msg).join(', ');
  }

  if (data && data.msg) {
    return data.msg;
  }

  return error.message || 'Request failed';
};

export const getPosts = () => async dispatch => {
  try {
    const response = await axios.get('/api/posts');
    dispatch({ type: GET_POSTS, payload: response.data });
  } catch (error) {
    dispatch({ type: POST_ERROR, payload: { msg: getErrorMessage(error) } });
  }
};

export const getPost = postId => async dispatch => {
  try {
    const response = await axios.get(`/api/posts/${postId}`);
    dispatch({ type: GET_POST, payload: response.data });
  } catch (error) {
    dispatch({ type: POST_ERROR, payload: { msg: getErrorMessage(error) } });
  }
};

export const addPost = formData => async dispatch => {
  try {
    const response = await axios.post('/api/posts', formData);
    dispatch({ type: ADD_POST, payload: response.data });
    dispatch(setAlert('Post created', 'success'));
  } catch (error) {
    dispatch(setAlert(getErrorMessage(error), 'danger'));
    dispatch({ type: POST_ERROR, payload: { msg: getErrorMessage(error) } });
  }
};

export const deletePost = postId => async dispatch => {
  try {
    await axios.delete(`/api/posts/${postId}`);
    dispatch({ type: DELETE_POST, payload: postId });
    dispatch(setAlert('Post removed', 'success'));
  } catch (error) {
    dispatch(setAlert(getErrorMessage(error), 'danger'));
    dispatch({ type: POST_ERROR, payload: { msg: getErrorMessage(error) } });
  }
};

export const addLike = postId => async dispatch => {
  try {
    const response = await axios.put(`/api/posts/like/${postId}`);
    dispatch({
      type: UPDATE_LIKES,
      payload: { id: postId, likes: response.data }
    });
  } catch (error) {
    dispatch(setAlert(getErrorMessage(error), 'danger'));
    dispatch({ type: POST_ERROR, payload: { msg: getErrorMessage(error) } });
  }
};

export const removeLike = postId => async dispatch => {
  try {
    const response = await axios.put(`/api/posts/unlike/${postId}`);
    dispatch({
      type: UPDATE_LIKES,
      payload: { id: postId, likes: response.data }
    });
  } catch (error) {
    dispatch(setAlert(getErrorMessage(error), 'danger'));
    dispatch({ type: POST_ERROR, payload: { msg: getErrorMessage(error) } });
  }
};

export const addComment = (postId, formData) => async dispatch => {
  try {
    const response = await axios.post(
      `/api/posts/comment/${postId}`,
      formData
    );
    dispatch({ type: ADD_COMMENT, payload: response.data });
  } catch (error) {
    dispatch(setAlert(getErrorMessage(error), 'danger'));
    dispatch({ type: POST_ERROR, payload: { msg: getErrorMessage(error) } });
  }
};

export const deleteComment = (postId, commentId) => async dispatch => {
  try {
    const response = await axios.delete(
      `/api/posts/comment/${postId}/${commentId}`
    );
    dispatch({ type: REMOVE_COMMENT, payload: commentId });
    dispatch({ type: ADD_COMMENT, payload: response.data });
  } catch (error) {
    dispatch(setAlert(getErrorMessage(error), 'danger'));
    dispatch({ type: POST_ERROR, payload: { msg: getErrorMessage(error) } });
  }
};
