import firebase, { githubProvider } from '../firebase';

export const login = uid => {
  return {
    type: 'LOGIN',
    uid
  };
};

export const loaded = () => {
  return {
    type: 'LOADED'
  };
};

export const loading = () => {
  return {
    type: 'LOADING'
  };
};

export const startLogin = () => {
  return (dispatch, getState) => {
    return firebase.auth().signInWithPopup(githubProvider).then(
      result => {
        console.log('auth worked', result);
        dispatch(login(result.user.uid));
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
      dispatch(logout());
      console.log('loged out');
    });
  };
};
