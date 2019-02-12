/* @format */

export default function makeState(initialState) {
	let state = initialState;
	const changeState = newState => {
		state = { ...state, ...newState };
	};
	const getCurrentState = () => state;
	return [getCurrentState, changeState];
}
