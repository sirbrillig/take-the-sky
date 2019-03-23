expression -> literal osemi {% makeExpression %}
expression -> expression __ comparator __ expression osemi {% makeComparison %}
expression -> functionCall osemi {% makeExpression %}
expression -> "if" _ condition _ block osemi {% makeIfStatement %}

functionCall -> functionName "()" {% makeFunctionCall %}
functionCall -> functionName functionArg:+ {% makeFunctionCall %}
functionName -> ("getEvent"|"getNpcHappiness"|"isShipFacingPlayer"|"distanceToPlayer") {% id %}
functionName -> ("rotateTowardPlayer"|"decelerate"|"accelerate") {% id %}
functionName -> ("createShip"|"triggerEvent"|"linkToDialog") {% id %}
functionName -> "finish" {% id %}

functionArg -> "," _ (literal|block) _ {% makeFunctionArg %}
functionArg -> "," _ (literal|block) _ ")" {% makeFunctionArg %}
functionArg -> "(" _ (literal|block) _ {% makeFunctionArg %}
functionArg -> "(" _ (literal|block) _ ")" {% makeFunctionArg %}

condition -> "(" _ expression _ ")" {% makeCondition %}
block -> "{" _ expression:* _ "}" {% makeBlock %}

literal -> (number|bool|string) {% passThrough %}
string -> "'" char:* "'" {% makeString %}
char -> [^\\'\n] {% id %}
bool -> ("true"|"false") {% makeBool %}
number -> "-":? [0-9]:+ {% makeNumber %}
comparator -> ("="|"<"|">"|">="|"<=") {% makeObjectMaker('comparator') %}

osemi -> semi:?
semi -> ";" _

_ -> __:* {% nothing %}
__ -> [\s] {% nothing %}

@{%
function makeObject(type, [value]) {
	return { type, value };
}

function passThrough([[value]]) {
	return value;
}

function makeIfStatement(value) {
	value = value.filter(x => x);
	return {
		type: 'if',
		condition: value[1],
		block: value[2],
	};
}

function makeCondition(value) {
	value = value.filter(x => x).filter(x => !['(',')'].includes(x));
	return {
		type: 'condition',
		value: value[0],
	};
}

function makeBlock(value) {
	value = value.filter(x => x).filter(x => !['{','}'].includes(x));
	return {
		type: 'block',
		value: value[0],
	};
}

function makeFunctionCall(value) {
	return {
		type: 'functionCall',
		functionName: value[0][0],
		args: value[1] === '()' ? [] : value[1],
	};
}

function makeFunctionArg(value) {
	return value.filter(x => x).filter(x => !['(',')',','].includes(x))[0][0];
}

function makeNumber(value) {
	const sign = value[0] === '-' ? '-' : '';
	const number = value[1].join('');
	return {
		type: 'number',
		value: sign + number,
	};
}

function makeObjectMaker(type) {
	return function([value]) {
		return makeObject(type, value);
	}
}

function makeExpression(value) {
	return makeObject('expression', value);
}

function makeComparison(value) {
	value = value.filter(x => x);
	return makeObject('expression', [{
		type: 'comparison',
		leftSide: value[0],
		comparator: value[1],
		rightSide: value[2],
	}]);
}

function makeBool([value]) {
	return makeObject('bool', [value[0] === 'true' ? true : false]);
}

function makeString(value) {
	return makeObject('string', [value[1].join('')]);
}

function nothing() {
	return null;
}
%}
