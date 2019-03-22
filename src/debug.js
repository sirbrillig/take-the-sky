/* @format */

/* globals window */

export default function debugFactory(key) {
	if (window.localStorage.getItem('debug') === key) {
		return (...data) => console.log(key, ...data); // eslint-disable-line
	}
	return () => {};
}

export function debugTextFactory(key) {
	if (window.localStorage.getItem('debug') !== key) {
		return () => {};
	}
	return ({ game, id, text, x, y }) => {
		if (!game.debugText) {
			game.debugText = [];
		}
		const textToShow = `${id}: ${text}`;
		if (!game.debugText[id]) {
			game.debugText[id] = game.text(textToShow, {
				fontFamily: 'Arial',
				fontSize: 14,
				fill: 'white',
			});
			game.debugText[id].zIndex = 100;
			game.debugText[id].position.set(x, y);
			game.mainContainer.addChild(game.debugText[id]);
		} else {
			game.debugText[id].text = textToShow;
			game.debugText[id].position.set(x, y);
		}
	};
}
