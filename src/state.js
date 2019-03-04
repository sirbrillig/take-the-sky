/* @format */

export default function makeState(initialState) {
	let state = initialState;
	const changeState = newState => {
		if (state !== newState) {
			// console.log(state, '=>', newState);
			state = newState;
		}
	};
	const getCurrentState = () => state;
	// console.log(state);
	return [getCurrentState, changeState];
}
