/* @format */

export default function reducer(state, { type, payload }) {
	switch (type) {
		case 'CHANGE_SYSTEM_POSITION':
			return { ...state, position: payload };
		case 'CHANGE_SYSTEM':
			return { ...state, currentSystem: payload };
		case 'EVENT_FIRST_LANDING':
			return { ...state, events: { ...state.events, firstLanding: true } };
		default:
			return state;
	}
}
