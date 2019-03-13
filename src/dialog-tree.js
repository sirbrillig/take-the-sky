/* @format */

export function getDialogTree() {
	return {
		explodedShip: {
			text: "As the ship's hull tears apart, you reflect that at least, at the end, you were free.",
			action: { type: 'EVENT_GAME_OVER' },
			options: [{ text: 'Oh well' }],
		},
		starsAreHot: {
			text: "Engineer: Captain, that star is millions of degrees. Let's try to avoid it, ok?",
			action: { type: 'EVENT_STAR_WARNING' },
			options: [{ text: 'Continue' }],
		},
		firstLandingNotDone: {
			text:
				"Engineer: Captain, we came to this backwater planet because there's a job to be had. Let's not leave before we at least hear them out.",
			options: [{ text: 'Continue' }],
		},
		firstLanding1: {
			text:
				"In the dingy space port, you are approached by a young woman. She's very confident, but always looking over her shoulder. You don't see anyone other than a drunk and a traffic controller nearby, but on this tiny planet you wouldn't be surprised if someone meant this woman harm.",
			options: [{ text: 'Continue', link: 'firstLanding2' }],
			action: { type: 'EVENT_FIRST_LANDING' },
		},
		firstLanding2: {
			text:
				"Young woman: You're a captain, right? I'm the one who sent the message. I... I want to buy passage. Passage ... just passage out of here. Please?",
			options: [
				{
					text: 'Not a problem, friend. So long as you can pay.',
					link: 'firstLanding3',
				},
				{ text: 'What are you doing way out here?', link: 'firstLanding4' },
			],
		},
		firstLanding3: {
			text:
				"Young woman: Thanks so much, captain. I won't be trouble, I promise. Just take me to Cassis and I can find my way from there. My name is Alana.",
			options: [
				{
					text: 'Depart',
				},
			],
		},
		firstLanding4: {
			text:
				'Young woman: Some people are trying to... they want to bring me somewhere terrible. And I need your help to get away. Everyone said you could help, when people need it. I have the cash. I can pay for my passage.',
			options: [
				{
					text: "No need to worry. Let's get you where you need to go.",
					link: 'firstLanding3',
				},
			],
		},
	};
}

export function getDialogObjectForKey(key) {
	if (getDialogTree()[key]) {
		return { options: [], action: null, text: '', ...getDialogTree()[key] };
	}
	return { options: [], action: null, text: '' };
}
