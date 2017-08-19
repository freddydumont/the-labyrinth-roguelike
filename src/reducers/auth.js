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
    case 'TOGGLE_LOADING':
      return {
        ...state,
        loading: !state.loading
      };
    default:
      return state;
  }
};
