import firebase, { firebaseRef, githubProvider } from '../firebase';

export const login = uid => {
  return {
    type: 'LOGIN',
    uid
  };
};

export const toggleLoading = () => {
  return {
    type: 'TOGGLE_LOADING'
  };
};

export const startLogin = () => {
  return (dispatch, getState) => {
    return firebase.auth().signInWithPopup(githubProvider).then(
      result => {
        console.log('auth worked', result);
      },
      error => {
        console.log('unable to auth', error);
      }
    );
  };
};

export const logout = () => {
  return {
    type: 'LOGOUT'
  };
};

export const startLogout = () => {
  return (dispatch, getState) => {
    return firebase.auth().signOut().then(() => {
      console.log('loged out');
    });
  };
};
