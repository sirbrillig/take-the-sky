/* @format */

export function makeState(initialState) {
	let state = initialState;
	const changeState = newState => {
		if (state !== newState) {
			state = newState;
		}
	};
	const getCurrentState = () => state;
	return [getCurrentState, changeState];
}

export function makeReducer(reducerFunction, initialState) {
	let state = initialState;
	const handleAction = ({ type, payload }) => {
		state = reducerFunction(state, { type, payload });
	};
	const getState = () => state;
	return [getState, handleAction];
}
