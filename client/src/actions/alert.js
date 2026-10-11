import { REMOVE_ALERT, SET_ALERT } from './types';

let nextAlertId = 0;

export const setAlert = (msg, alertType, timeout = 5000) => dispatch => {
  const id = nextAlertId++;

  dispatch({
    type: SET_ALERT,
    payload: { id, msg, alertType }
  });

  window.setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), timeout);
};
