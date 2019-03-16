/* @format */

export default function getDialogTree() {
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
			variants: [
				{
					condition: "getNpcHappiness 'engineer' >= 0",
					text:
						"Engineer: Captain, we came to this backwater planet because there's a job to be had. Let's not leave before we at least hear them out.",
					action: { type: 'EVENT_FIRST_LANDING_NOT_DONE' },
					options: [{ text: 'Continue' }],
				},
				{
					condition: "getNpcHappiness 'engineer' = -1",
					text:
						"Engineer: Did you not hear me the first time, Cap? This was a long trip. Let's see what's on that moon.",
					action: { type: 'EVENT_FIRST_LANDING_NOT_DONE' },
					options: [{ text: 'Continue' }],
				},
				{
					condition: "getNpcHappiness 'engineer' < -1",
					text:
						"Engineer: Oh come on, Captain! Go back to that moon and land there or this ship isn't going another inch.",
					action: { type: 'EVENT_FIRST_LANDING_NOT_DONE' },
					options: [{ text: 'Continue' }],
				},
			],
		},
		landingPlanetBeta: {
			text:
				'Home to many researchers and medical professionals. Expensive tech. Folks are overworked, mostly.',
			options: [{ text: 'Depart' }],
		},
		landingPlanetTwist: {
			variants: [
				{
					condition: "getEvent 'firstLanding' = true",
					text:
						"Not much action any more in Twist's dingy space port. The traffic controller looks up, frowns at you, and returns to her work.",
					options: [{ text: 'Depart' }],
				},
				{
					condition: "getEvent 'firstLanding' = false",
					text:
						"In the dingy space port, you are approached by a young woman. She's very confident, but always looking over her shoulder. You don't see anyone other than a drunk and a traffic controller nearby, but on this tiny planet you wouldn't be surprised if someone meant this woman harm.",
					options: [{ text: 'Continue', link: 'firstLanding2' }],
				},
			],
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
			action: { type: 'EVENT_FIRST_LANDING' },
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
