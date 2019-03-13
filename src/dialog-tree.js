/* @format */

export function getDialogTree() {
	return {
		explodedShip: {
			text:
				"As the ship's hull tears apart and the coldness of space covers your skin, you reflect that at least you were free.",
			action: { type: 'EVENT_GAME_OVER' },
		},
		firstLandingNotDone: {
			text:
				"Engineer: Captain, we came to this backwater planet because there's a job to be had. Let's not leave before we at least hear them out.",
			options: [{ text: 'Continue' }],
		},
		firstLanding1: {
			text:
				"In the dingy space port, you are approached by a teenage girl. She's very confident, but always looking over her shoulder. You don't see anyone other than a drunk and a traffic controller nearby, but on this tiny planet you wouldn't be surprised if someone meant this woman harm.",
			options: [{ text: 'Continue', link: 'firstLanding2' }],
			action: { type: 'EVENT_FIRST_LANDING' },
		},
		firstLanding2: {
			text:
				"Girl: You're a captain, right? I'm the one who sent the message. I... I want to buy passage. Passage ... just passage out of here. Please?",
			options: [
				{
					text: 'Not a problem, miss. So long as you can pay.',
					link: 'firstLanding3',
				},
				{ text: 'What are you doing way out here?', link: 'firstLanding4' },
			],
		},
		firstLanding3: {
			text:
				"Thanks so much, captain. I won't be trouble, I promise. Just take me to Cassis and I can find my way from there. My name is Alana.",
			options: [
				{
					text: 'Depart',
				},
			],
		},
		firstLanding4: {
			text:
				'Some people are trying to... they want to bring me somewhere terrible. And I need your help to get away. Everyone said you could help, when people need it. I have the cash. I can pay for my passage.',
			options: [
				{
					text: "No need to worry. Hop on board and let's get you where you need to go.",
					link: 'firstLanding3',
				},
			],
		},
	};
}

export function getDialogObjectForKey(key) {
	return getDialogTree()[key];
}
