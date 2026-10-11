import axios from 'axios';
import { setAlert } from './alert';
import {
  ACCOUNT_DELETED,
  CLEAR_PROFILE,
  GET_PROFILE,
  GET_PROFILES,
  GET_REPOS,
  PROFILE_ERROR,
  UPDATE_PROFILE
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

export const getCurrentProfile = () => async dispatch => {
  try {
    const response = await axios.get('/api/profile/me');
    dispatch({ type: GET_PROFILE, payload: response.data });
  } catch (error) {
    dispatch({ type: PROFILE_ERROR, payload: { msg: getErrorMessage(error) } });
  }
};

export const getProfiles = () => async dispatch => {
  try {
    const response = await axios.get('/api/profile');
    dispatch({ type: GET_PROFILES, payload: response.data });
  } catch (error) {
    dispatch({ type: PROFILE_ERROR, payload: { msg: getErrorMessage(error) } });
  }
};

export const getProfileById = userId => async dispatch => {
  dispatch({ type: CLEAR_PROFILE });
  try {
    const response = await axios.get(`/api/profile/user/${userId}`);
    dispatch({ type: GET_PROFILE, payload: response.data });
  } catch (error) {
    dispatch({ type: PROFILE_ERROR, payload: { msg: getErrorMessage(error) } });
  }
};

export const createProfile = (profileData, history) => async dispatch => {
  try {
    const response = await axios.post('/api/profile', profileData);
    dispatch({ type: UPDATE_PROFILE, payload: response.data });
    history.push('/dashboard');
  } catch (error) {
    dispatch(setAlert(getErrorMessage(error), 'danger'));
    dispatch({ type: PROFILE_ERROR, payload: { msg: getErrorMessage(error) } });
  }
};

export const addExperience = (formData, history) => async dispatch => {
  try {
    const response = await axios.put('/api/profile/experience', formData);
    dispatch({ type: UPDATE_PROFILE, payload: response.data });
    history.push('/dashboard');
  } catch (error) {
    dispatch(setAlert(getErrorMessage(error), 'danger'));
    dispatch({ type: PROFILE_ERROR, payload: { msg: getErrorMessage(error) } });
  }
};

export const deleteExperience = experienceId => async dispatch => {
  try {
    const response = await axios.delete(
      `/api/profile/experience/${experienceId}`
    );
    dispatch({ type: UPDATE_PROFILE, payload: response.data });
  } catch (error) {
    dispatch(setAlert(getErrorMessage(error), 'danger'));
    dispatch({ type: PROFILE_ERROR, payload: { msg: getErrorMessage(error) } });
  }
};

export const addEducation = (formData, history) => async dispatch => {
  try {
    const response = await axios.put('/api/profile/education', formData);
    dispatch({ type: UPDATE_PROFILE, payload: response.data });
    history.push('/dashboard');
  } catch (error) {
    dispatch(setAlert(getErrorMessage(error), 'danger'));
    dispatch({ type: PROFILE_ERROR, payload: { msg: getErrorMessage(error) } });
  }
};

export const deleteEducation = educationId => async dispatch => {
  try {
    const response = await axios.delete(
      `/api/profile/education/${educationId}`
    );
    dispatch({ type: UPDATE_PROFILE, payload: response.data });
  } catch (error) {
    dispatch(setAlert(getErrorMessage(error), 'danger'));
    dispatch({ type: PROFILE_ERROR, payload: { msg: getErrorMessage(error) } });
  }
};

export const deleteAccount = () => async dispatch => {
  if (!window.confirm('Are you sure? This action cannot be undone.')) {
    return;
  }

  try {
    await axios.delete('/api/profile');
    dispatch({ type: ACCOUNT_DELETED });
    dispatch({ type: CLEAR_PROFILE });
    dispatch(setAlert('Your account has been permanently deleted', 'success'));
  } catch (error) {
    dispatch(setAlert(getErrorMessage(error), 'danger'));
    dispatch({ type: PROFILE_ERROR, payload: { msg: getErrorMessage(error) } });
  }
};

export const getGithubRepos = username => async dispatch => {
  try {
    const response = await axios.get(`/api/profile/github/${username}`);
    dispatch({ type: GET_REPOS, payload: response.data });
  } catch (error) {
    dispatch(setAlert(getErrorMessage(error), 'danger'));
  }
};
