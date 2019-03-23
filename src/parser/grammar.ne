expression -> literal {% makeExpression %}
expression -> functionCall {% makeExpression %}
expression -> expression ws comparator ws expression {% makeComparison %}
functionCall -> ("getEvent"|"getNpcHappiness") "(" functionArg:* ")" {% makeFunctionCall %}
functionArg -> literal {% makeFunctionArg %}
functionArg -> literal "," {% makeFunctionArg %}
literal -> (number|bool|string) {% passThrough %}
string -> "'" char:* "'" {% makeString %}
char -> [^\\'\n] {% id %}
bool -> ("true"|"false") {% makeBool %}
number -> [0-9]:+ {% makeObjectMaker('number') %}
number -> "-" [0-9]:+ {% makeObjectMaker('number') %}
comparator -> ("="|"<"|">"|">="|"<=") {% makeObjectMaker('comparator') %}
ws -> [\s] {% nothing %}

@{%
function makeObject(type, [value]) {
	return { type, value };
}

function passThrough([[value]]) {
	return value;
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
