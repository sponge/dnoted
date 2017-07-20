export const viewer = (state = {}, action) => {
  console.log('viewer got action:', action);
  let newState;
  switch (action.type) {
    case 'VIEW_FILE_PENDING':
      newState = {
        isLoading: true,
        error: false
      };
      return newState;

    case 'VIEW_FILE_FULFILLED':
      newState = {
        isLoading: false,
      };
      return { ...state, ...newState, ...action.payload};

    case 'VIEW_FILE_REJECTED':
      newState = {
          isLoading: false,
          error: true
        }
      return newState;

    default:
      return state;
  };
}