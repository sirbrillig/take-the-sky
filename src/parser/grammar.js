// Generated automatically by nearley, version 2.16.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

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

function makeNot() {
	return 'not';
}

function makeCondition(value) {
	value = value.filter(x => x);
	const isInverted = value[0] === 'not';
	return {
		type: 'condition',
		isInverted,
		value: isInverted ? value[1] : value[0],
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
	return makeObject('synmbol', [value[0].join('')]);
}

function nothing() {
	return null;
}
var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "statement", "symbols": ["expression", "semi"], "postprocess": makeStatement},
    {"name": "statement$string$1", "symbols": [{"literal":"i"}, {"literal":"f"}, {"literal":"("}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "statement", "symbols": ["statement$string$1", "_", "condition", "_", "block", "_", {"literal":")"}, "semi"], "postprocess": makeIfStatement},
    {"name": "expression", "symbols": ["literal"], "postprocess": makeExpression},
    {"name": "expression", "symbols": ["expression", "__", "comparator", "__", "expression"], "postprocess": makeComparison},
    {"name": "expression", "symbols": ["functionCall"], "postprocess": makeExpression},
    {"name": "functionCall$string$1", "symbols": [{"literal":"("}, {"literal":")"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "functionCall", "symbols": ["bareWord", "functionCall$string$1"], "postprocess": makeFunctionCall},
    {"name": "functionCall", "symbols": ["bareWord", {"literal":"("}, "functionArg", {"literal":")"}], "postprocess": makeFunctionCall},
    {"name": "functionArg", "symbols": ["functionArg", {"literal":","}, "_", "functionArgElement"], "postprocess": appendItem(0, 3)},
    {"name": "functionArg", "symbols": ["functionArgElement"]},
    {"name": "functionArgElement", "symbols": ["functionCall"], "postprocess": id},
    {"name": "functionArgElement", "symbols": ["literal"], "postprocess": id},
    {"name": "functionArgElement", "symbols": ["block"], "postprocess": id},
    {"name": "condition", "symbols": ["expression", {"literal":","}], "postprocess": makeCondition},
    {"name": "condition", "symbols": ["not", "expression", {"literal":","}], "postprocess": makeCondition},
    {"name": "block$ebnf$1", "symbols": []},
    {"name": "block$ebnf$1", "symbols": ["block$ebnf$1", "statement"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "block", "symbols": [{"literal":"{"}, "block$ebnf$1", {"literal":"}"}], "postprocess": makeBlock},
    {"name": "block$ebnf$2", "symbols": []},
    {"name": "block$ebnf$2", "symbols": ["block$ebnf$2", "statement"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "block", "symbols": [{"literal":"{"}, "__", "block$ebnf$2", {"literal":"}"}], "postprocess": makeBlock},
    {"name": "not$string$1", "symbols": [{"literal":"n"}, {"literal":"o"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "not", "symbols": ["not$string$1", "_"], "postprocess": makeNot},
    {"name": "literal$subexpression$1", "symbols": ["number"]},
    {"name": "literal$subexpression$1", "symbols": ["bool"]},
    {"name": "literal$subexpression$1", "symbols": ["string"]},
    {"name": "literal", "symbols": ["literal$subexpression$1"], "postprocess": makeLiteral},
    {"name": "bareWord$ebnf$1", "symbols": ["bareChar"]},
    {"name": "bareWord$ebnf$1", "symbols": ["bareWord$ebnf$1", "bareChar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "bareWord", "symbols": ["bareWord$ebnf$1"], "postprocess": id},
    {"name": "string$ebnf$1", "symbols": []},
    {"name": "string$ebnf$1", "symbols": ["string$ebnf$1", "char"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "string", "symbols": [{"literal":"'"}, "string$ebnf$1", {"literal":"'"}], "postprocess": makeString},
    {"name": "bareChar", "symbols": [/[a-zA-Z]/], "postprocess": id},
    {"name": "char", "symbols": [/[^\\'\n]/], "postprocess": id},
    {"name": "bool$subexpression$1$string$1", "symbols": [{"literal":"t"}, {"literal":"r"}, {"literal":"u"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "bool$subexpression$1", "symbols": ["bool$subexpression$1$string$1"]},
    {"name": "bool$subexpression$1$string$2", "symbols": [{"literal":"f"}, {"literal":"a"}, {"literal":"l"}, {"literal":"s"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "bool$subexpression$1", "symbols": ["bool$subexpression$1$string$2"]},
    {"name": "bool", "symbols": ["bool$subexpression$1"], "postprocess": makeBool},
    {"name": "number$ebnf$1", "symbols": [{"literal":"-"}], "postprocess": id},
    {"name": "number$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "number$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "number$ebnf$2", "symbols": ["number$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "number", "symbols": ["number$ebnf$1", "number$ebnf$2"], "postprocess": makeNumber},
    {"name": "comparator$subexpression$1", "symbols": [{"literal":"="}]},
    {"name": "comparator$subexpression$1", "symbols": [{"literal":"<"}]},
    {"name": "comparator$subexpression$1", "symbols": [{"literal":">"}]},
    {"name": "comparator$subexpression$1$string$1", "symbols": [{"literal":">"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "comparator$subexpression$1", "symbols": ["comparator$subexpression$1$string$1"]},
    {"name": "comparator$subexpression$1$string$2", "symbols": [{"literal":"<"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "comparator$subexpression$1", "symbols": ["comparator$subexpression$1$string$2"]},
    {"name": "comparator", "symbols": ["comparator$subexpression$1"], "postprocess": makeObjectMaker('comparator')},
    {"name": "semi", "symbols": [{"literal":";"}, "_"], "postprocess": nothing},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "__"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": nothing},
    {"name": "__", "symbols": [/[\s]/], "postprocess": nothing}
]
  , ParserStart: "statement"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
