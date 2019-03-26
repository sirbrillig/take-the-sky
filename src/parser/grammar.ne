statement -> expression semi {% makeStatement %}

expression -> literal {% makeExpression %}
expression -> functionCall {% makeExpression %}

functionCall -> bareWord "()" {% makeFunctionCall %}
functionCall -> bareWord "(" functionArg ")" {% makeFunctionCall %}

functionArg -> functionArg "," _ functionArgElement {% appendItem(0, 3) %}
functionArg -> functionArgElement
functionArgElement -> functionArgElement __ comparator __ functionArgElement {% makeComparison %}
functionArgElement -> functionCall {% id %}
functionArgElement -> literal {% id %}
functionArgElement -> block {% id %}

block -> "{" statement:* "}" {% makeBlock %}
block -> "{" __ statement:* "}" {% makeBlock %} # Note that a statement ends with a semi which can have trailing whitespace

literal -> (number|bool|string) {% makeLiteral %}
bareWord -> bareChar:+ {% id %}
string -> "'" char:* "'" {% makeString %}
bareChar -> [a-zA-Z] {% id %}
char -> [^\\'\n] {% id %}
bool -> ("true"|"false") {% makeBool %}
number -> "-":? [0-9]:+ {% makeNumber %}
comparator -> ("="|"<"|">"|">="|"<=") {% makeObjectMaker('comparator') %}

semi -> ";" _ {% nothing %}

_ -> __:* {% nothing %}
__ -> [\s] {% nothing %}

@{%
function filterChars(value, exclude) {
	exclude = exclude || ['(', ')', ','];
	return value.filter(x => x).filter(x => !exclude.includes(x));
}

function appendItem(lastItemIndex, newItemIndex) {
	return items => items[lastItemIndex].concat([items[newItemIndex]]);
}

function makeObject(type, [value]) {
	return { type, value };
}

function makeLiteral([[value]]) {
	return value;
}

function makeIfStatement(value) {
	value = value.filter(x => x).filter(x => !['(',')',','].includes(x));
	return {
		type: 'if',
		condition: value[1],
		block: value[2],
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
	value = filterChars(value);
	const args = value.slice(1)[0];
	return {
		type: 'functionCall',
		functionName: value[0].join(''),
		args: args === "()" ? [] : args,
	};
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

function makeStatement([value]) {
	return value;
}

function makeExpression([value]) {
	return value;
}

function makeComparison(value) {
	value = value.filter(x => x);
	return {
		type: 'comparison',
		leftSide: value[0],
		comparator: value[1],
		rightSide: value[2],
	};
}

function makeBool([value]) {
	return makeObject('bool', [value[0] === 'true' ? true : false]);
}

function makeString(value) {
	return makeObject('string', [value[1].join('')]);
}

function makeSymbol(value) {
	return makeObject('symbol', [value[0].join('')]);
}

function nothing() {
	return null;
}
%}
