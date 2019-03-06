/* @format */

export default function reducer(state, { type, payload }) {
	switch (type) {
		case 'CHANGE_SYSTEM_POSITION':
			return { ...state, position: payload };
		case 'CHANGE_SYSTEM':
			return { ...state, currentSystem: payload };
		default:
			return state;
	}
}
