/* @format */

/* globals window */

export default function debugFactory(key) {
	if (window.localStorage.getItem('debug') === key) {
		return (...data) => console.log(key, ...data); // eslint-disable-line
	}
	return () => {};
}
