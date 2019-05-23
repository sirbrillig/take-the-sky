/* @format */

import reducer from './state-reducer';

export default class EventState {
	constructor() {
		this.stateTree = reducer(undefined, { type: 'INIT' });
		this.getState = this.getState.bind(this);
		this.getEvent = this.getEvent.bind(this);
		this.getDialog = this.getDialog.bind(this);
		this.dispatchAction = this.dispatchAction.bind(this);
	}

	dispatchAction(event) {
		this.stateTree = reducer(this.stateTree, event);
	}

	getState() {
		return this.stateTree;
	}

	getEvent(key) {
		return this.stateTree.events[key];
	}

	getDialog() {
		return this.stateTree.dialog;
	}

	getSystemName() {
		return this.stateTree.systemName;
	}
}
