module.exports = {
    "extends": ['airbnb', 'prettier'],
    "plugins": [
        'import',
        'prettier',
    ],
    "rules": {
        'prettier/prettier': 'error',
        'no-param-reassign': 0,
        'no-restricted-properties': [0, {
            object: 'Math',
            property: 'pow',
            message: 'Use the exponentiation operator (**) instead.',
        }],
    },
};
