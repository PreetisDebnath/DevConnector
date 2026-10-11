import axios from 'axios';
import setAuthToken from '../utils/setAuthToken';
import { setAlert } from './alert';
import {
  AUTH_ERROR,
  CLEAR_PROFILE,
  LOGIN_FAIL,
  LOGIN_SUCCESS,
  LOGOUT,
  REGISTER_FAIL,
  REGISTER_SUCCESS,
  USER_LOADED
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

export const loadUser = () => async dispatch => {
  if (localStorage.token) {
    setAuthToken(localStorage.token);
  } else {
    setAuthToken(null);
  }

  try {
    const response = await axios.get('/api/auth');
    dispatch({ type: USER_LOADED, payload: response.data });
  } catch (error) {
    dispatch({ type: AUTH_ERROR });
  }
};

export const register = (name, email, password) => async dispatch => {
  try {
    const response = await axios.post('/api/users', { name, email, password });
    localStorage.setItem('token', response.data.token);
    setAuthToken(response.data.token);
    dispatch({ type: REGISTER_SUCCESS, payload: { token: response.data.token } });
    dispatch(loadUser());
  } catch (error) {
    dispatch(setAlert(getErrorMessage(error), 'danger'));
    dispatch({ type: REGISTER_FAIL });
  }
};

export const login = (email, password) => async dispatch => {
  try {
    const response = await axios.post('/api/auth', { email, password });
    localStorage.setItem('token', response.data.token);
    setAuthToken(response.data.token);
    dispatch({ type: LOGIN_SUCCESS, payload: { token: response.data.token } });
    dispatch(loadUser());
  } catch (error) {
    dispatch(setAlert(getErrorMessage(error), 'danger'));
    dispatch({ type: LOGIN_FAIL });
  }
};

export const logout = () => dispatch => {
  setAuthToken(null);
  dispatch({ type: LOGOUT });
  dispatch({ type: CLEAR_PROFILE });
};
