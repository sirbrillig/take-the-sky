expression -> literal osemi {% makeExpression %}
expression -> expression __ comparator __ expression osemi {% makeComparison %}
expression -> functionCall osemi {% makeExpression %}
expression -> "if" _ condition _ block osemi {% makeIfStatement %}

condition -> "(" _ expression _ ")" {% makeCondition %}
block -> "{" _ expression:* _ "}" {% makeBlock %}

functionCall -> ("getEvent"|"getNpcHappiness") "(" functionArg:* ")" {% makeFunctionCall %}
functionArg -> literal {% makeFunctionArg %}
functionArg -> literal "," __:* {% makeFunctionArg %}

literal -> (number|bool|string) {% passThrough %}
string -> "'" char:* "'" {% makeString %}
char -> [^\\'\n] {% id %}
bool -> ("true"|"false") {% makeBool %}
number -> [0-9]:+ {% makeNumber %}
number -> "-" [0-9]:+ {% makeNumber %}
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
	value = value.filter(x => !['(',')'].includes(x));
	return {
		type: 'functionCall',
		functionName: value[0][0],
		args: value[1],
	};
}

function makeFunctionArg([value]) {
	return value;
}

function makeNumber(value) {
	return {
		type: 'number',
		value: value.join(''),
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
