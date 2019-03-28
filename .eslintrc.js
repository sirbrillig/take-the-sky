module.exports = {
	extends: ['airbnb', 'prettier'],
	plugins: ['import', 'prettier'],
	rules: {
		'prettier/prettier': 'error',
		'no-use-before-define': [0],
		'no-return-assign': [0],
		'class-methods-use-this': [0],
		'consistent-return': [0],
		'no-unused-expressions': [
			'error',
			{
				allowShortCircuit: true,
			},
		],
		'no-param-reassign': 0,
		'no-restricted-properties': [0],
	},
};
