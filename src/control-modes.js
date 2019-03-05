/* @format */

export default function getNextMode(mode) {
	switch (mode) {
		case 'pilot':
			return 'land';
		case 'land':
			return 'jump';
		case 'jump':
			return 'pilot';
		default:
			return mode;
	}
}
