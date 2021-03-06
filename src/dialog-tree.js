/* @format */

export default function getDialogTree() {
	return {
		gameOver: {
			text: 'Game Over',
		},
		explodedShip: {
			text: "As the ship's hull tears apart, you reflect that at least, at the end, you were free.",
			script: "triggerEvent('gameOver');",
			options: [{ text: 'Oh well', link: 'gameOver' }],
		},
		starsAreHot: {
			text: "Engineer: Captain, that star is millions of degrees. Let's try to avoid it, ok?",
			script: "triggerEvent('starsAreHot');",
			options: [{ text: 'Continue' }],
		},
		landingPlanetBeta: {
			text:
				'Home to many researchers and medical professionals. Expensive tech. Folks are overworked, mostly.',
			options: [{ text: 'Depart' }],
		},
		landingPlanetTwist: {
			variants: [
				{
					condition: "if(getEvent('firstLanding') = true, { finish(true); });",
					text:
						"Not much action any more in Twist's dingy space port. The traffic controller looks up, frowns at you, and returns to her work.",
					options: [{ text: 'Depart' }],
				},
				{
					condition: "if(getEvent('firstLanding') = false, { finish(true); });",
					script: "triggerEvent('firstLanding');",
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
					link: 'firstLanding5',
				},
			],
			script:
				"createShip('cruiser', 'firstCruiser', { rotateTowardPlayer(); if(distanceToPlayer() < 800, { if(getEvent('firstCruiserEncounter'), { fire(); }); }); if(distanceToPlayer() < 150, { decelerate(); if(not(getEvent('firstCruiserEncounter')), { triggerEvent('firstCruiserEncounter'); linkToDialog('firstCruiserEncounter'); }); }); if(distanceToPlayer() >= 150, { if(isShipFacingPlayer(), { accelerate(); }); }); });",
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
		firstLanding5: {
			text:
				"Engineer: Captain, I'm so glad you're back! I was trying to call you. There's an Empire cruiser that just entered the system. Why would they send a ship like that way out here? Think they found out about that run we did at Selkirk? Here they come!",
			options: [
				{
					text: 'Continue',
				},
			],
		},
		firstCruiserEncounter: {
			text:
				"Cruiser: Greetings. This is Captain Drake of the Dauntless. We are looking for a runaway with stolen information who's been reported in this system. Please identify yourself and stand by for boarding.",
			options: [
				{
					text: 'Continue',
					link: 'firstCruiserEncounter2',
				},
			],
		},
		firstCruiserEncounter2: {
			text:
				"Alana: It's a lie! I didn't steal anything. They just want to take me back. I have to get to safety. I'm begging you, Captain.",
			options: [
				{
					text: 'Give your name and await boarding.',
					link: 'firstCruiserEncounter3',
				},
				{
					text: 'Ignore the warning and run.',
				},
			],
		},
		firstCruiserEncounter3: {
			text:
				"Engineer: Captain... someone is scrambling our communications... The Empire ship doesn't look happy.",
			script: "changeNpcHappiness('alana', -1);",
			options: [
				{
					text: 'Continue',
					link: 'firstCruiserEncounter4',
				},
			],
		},
		firstCruiserEncounter4: {
			text:
				"Alana: That was me. I'm sorry, Captain, but I can't let them take me back to that place.",
			options: [
				{
					text: 'Continue',
				},
			],
		},
	};
}
