export const authReducer = (state = { loading: true }, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        uid: action.uid,
        authed: true
      };
    case 'LOGOUT':
      return {
        authed: false
      };
    case 'LOADING':
      return {
        ...state,
        loading: true
      };
    case 'LOADED':
      return {
        ...state,
        loading: false
      };
    default:
      return state;
  }
};
