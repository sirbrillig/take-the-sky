/* @format */

import getDialogTree from './dialog-tree';

export default function getDialogObjectForKey(key, state) {
	const dialogObject = getDialogTree()[key];
	if (dialogObject) {
		if (dialogObject.variants) {
			const matchingVariant =
				dialogObject.variants.find(variant => variant.condition(state)) || dialogObject.variants[0];
			return { options: [], action: null, text: '', ...matchingVariant };
		}
		return { options: [], action: null, text: '', ...dialogObject };
	}
	return { options: [], action: null, text: '' };
}
