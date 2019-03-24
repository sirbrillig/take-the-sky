// Generated automatically by nearley, version 2.16.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

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

function makeNot() {
	return 'not';
}

function makeCondition(value) {
	value = value.filter(x => x).filter(x => !['(',')'].includes(x));
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

function nothing() {
	return null;
}
var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "statement", "symbols": ["expression", "semi"], "postprocess": makeStatement},
    {"name": "expression", "symbols": ["literal"], "postprocess": makeExpression},
    {"name": "expression", "symbols": ["expression", "__", "comparator", "__", "expression"], "postprocess": makeComparison},
    {"name": "expression", "symbols": ["functionCall"], "postprocess": makeExpression},
    {"name": "expression$string$1", "symbols": [{"literal":"i"}, {"literal":"f"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "expression", "symbols": ["expression$string$1", "_", "condition", "_", "block"], "postprocess": makeIfStatement},
    {"name": "functionCall$string$1", "symbols": [{"literal":"("}, {"literal":")"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "functionCall", "symbols": ["functionName", "functionCall$string$1"], "postprocess": makeFunctionCall},
    {"name": "functionCall$ebnf$1", "symbols": ["functionArg"]},
    {"name": "functionCall$ebnf$1", "symbols": ["functionCall$ebnf$1", "functionArg"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "functionCall", "symbols": ["functionName", "functionCall$ebnf$1"], "postprocess": makeFunctionCall},
    {"name": "functionName$subexpression$1$string$1", "symbols": [{"literal":"g"}, {"literal":"e"}, {"literal":"t"}, {"literal":"E"}, {"literal":"v"}, {"literal":"e"}, {"literal":"n"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "functionName$subexpression$1", "symbols": ["functionName$subexpression$1$string$1"]},
    {"name": "functionName$subexpression$1$string$2", "symbols": [{"literal":"g"}, {"literal":"e"}, {"literal":"t"}, {"literal":"N"}, {"literal":"p"}, {"literal":"c"}, {"literal":"H"}, {"literal":"a"}, {"literal":"p"}, {"literal":"p"}, {"literal":"i"}, {"literal":"n"}, {"literal":"e"}, {"literal":"s"}, {"literal":"s"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "functionName$subexpression$1", "symbols": ["functionName$subexpression$1$string$2"]},
    {"name": "functionName$subexpression$1$string$3", "symbols": [{"literal":"i"}, {"literal":"s"}, {"literal":"S"}, {"literal":"h"}, {"literal":"i"}, {"literal":"p"}, {"literal":"F"}, {"literal":"a"}, {"literal":"c"}, {"literal":"i"}, {"literal":"n"}, {"literal":"g"}, {"literal":"P"}, {"literal":"l"}, {"literal":"a"}, {"literal":"y"}, {"literal":"e"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "functionName$subexpression$1", "symbols": ["functionName$subexpression$1$string$3"]},
    {"name": "functionName$subexpression$1$string$4", "symbols": [{"literal":"d"}, {"literal":"i"}, {"literal":"s"}, {"literal":"t"}, {"literal":"a"}, {"literal":"n"}, {"literal":"c"}, {"literal":"e"}, {"literal":"T"}, {"literal":"o"}, {"literal":"P"}, {"literal":"l"}, {"literal":"a"}, {"literal":"y"}, {"literal":"e"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "functionName$subexpression$1", "symbols": ["functionName$subexpression$1$string$4"]},
    {"name": "functionName", "symbols": ["functionName$subexpression$1"], "postprocess": id},
    {"name": "functionName$subexpression$2$string$1", "symbols": [{"literal":"r"}, {"literal":"o"}, {"literal":"t"}, {"literal":"a"}, {"literal":"t"}, {"literal":"e"}, {"literal":"T"}, {"literal":"o"}, {"literal":"w"}, {"literal":"a"}, {"literal":"r"}, {"literal":"d"}, {"literal":"P"}, {"literal":"l"}, {"literal":"a"}, {"literal":"y"}, {"literal":"e"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "functionName$subexpression$2", "symbols": ["functionName$subexpression$2$string$1"]},
    {"name": "functionName$subexpression$2$string$2", "symbols": [{"literal":"d"}, {"literal":"e"}, {"literal":"c"}, {"literal":"e"}, {"literal":"l"}, {"literal":"e"}, {"literal":"r"}, {"literal":"a"}, {"literal":"t"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "functionName$subexpression$2", "symbols": ["functionName$subexpression$2$string$2"]},
    {"name": "functionName$subexpression$2$string$3", "symbols": [{"literal":"a"}, {"literal":"c"}, {"literal":"c"}, {"literal":"e"}, {"literal":"l"}, {"literal":"e"}, {"literal":"r"}, {"literal":"a"}, {"literal":"t"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "functionName$subexpression$2", "symbols": ["functionName$subexpression$2$string$3"]},
    {"name": "functionName", "symbols": ["functionName$subexpression$2"], "postprocess": id},
    {"name": "functionName$subexpression$3$string$1", "symbols": [{"literal":"c"}, {"literal":"r"}, {"literal":"e"}, {"literal":"a"}, {"literal":"t"}, {"literal":"e"}, {"literal":"S"}, {"literal":"h"}, {"literal":"i"}, {"literal":"p"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "functionName$subexpression$3", "symbols": ["functionName$subexpression$3$string$1"]},
    {"name": "functionName$subexpression$3$string$2", "symbols": [{"literal":"t"}, {"literal":"r"}, {"literal":"i"}, {"literal":"g"}, {"literal":"g"}, {"literal":"e"}, {"literal":"r"}, {"literal":"E"}, {"literal":"v"}, {"literal":"e"}, {"literal":"n"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "functionName$subexpression$3", "symbols": ["functionName$subexpression$3$string$2"]},
    {"name": "functionName$subexpression$3$string$3", "symbols": [{"literal":"l"}, {"literal":"i"}, {"literal":"n"}, {"literal":"k"}, {"literal":"T"}, {"literal":"o"}, {"literal":"D"}, {"literal":"i"}, {"literal":"a"}, {"literal":"l"}, {"literal":"o"}, {"literal":"g"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "functionName$subexpression$3", "symbols": ["functionName$subexpression$3$string$3"]},
    {"name": "functionName$subexpression$3$string$4", "symbols": [{"literal":"c"}, {"literal":"h"}, {"literal":"a"}, {"literal":"n"}, {"literal":"g"}, {"literal":"e"}, {"literal":"N"}, {"literal":"p"}, {"literal":"c"}, {"literal":"H"}, {"literal":"a"}, {"literal":"p"}, {"literal":"p"}, {"literal":"i"}, {"literal":"n"}, {"literal":"e"}, {"literal":"s"}, {"literal":"s"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "functionName$subexpression$3", "symbols": ["functionName$subexpression$3$string$4"]},
    {"name": "functionName", "symbols": ["functionName$subexpression$3"], "postprocess": id},
    {"name": "functionName$string$1", "symbols": [{"literal":"f"}, {"literal":"i"}, {"literal":"n"}, {"literal":"i"}, {"literal":"s"}, {"literal":"h"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "functionName", "symbols": ["functionName$string$1"]},
    {"name": "functionArg$subexpression$1", "symbols": ["literal"]},
    {"name": "functionArg$subexpression$1", "symbols": ["block"]},
    {"name": "functionArg", "symbols": [{"literal":","}, "_", "functionArg$subexpression$1", "_"], "postprocess": makeFunctionArg},
    {"name": "functionArg$subexpression$2", "symbols": ["literal"]},
    {"name": "functionArg$subexpression$2", "symbols": ["block"]},
    {"name": "functionArg", "symbols": [{"literal":","}, "_", "functionArg$subexpression$2", "_", {"literal":")"}], "postprocess": makeFunctionArg},
    {"name": "functionArg$subexpression$3", "symbols": ["literal"]},
    {"name": "functionArg$subexpression$3", "symbols": ["block"]},
    {"name": "functionArg", "symbols": [{"literal":"("}, "_", "functionArg$subexpression$3", "_"], "postprocess": makeFunctionArg},
    {"name": "functionArg$subexpression$4", "symbols": ["literal"]},
    {"name": "functionArg$subexpression$4", "symbols": ["block"]},
    {"name": "functionArg", "symbols": [{"literal":"("}, "_", "functionArg$subexpression$4", "_", {"literal":")"}], "postprocess": makeFunctionArg},
    {"name": "condition", "symbols": [{"literal":"("}, "_", "expression", "_", {"literal":")"}], "postprocess": makeCondition},
    {"name": "condition", "symbols": [{"literal":"("}, "_", "not", "expression", "_", {"literal":")"}], "postprocess": makeCondition},
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
    {"name": "literal", "symbols": ["literal$subexpression$1"], "postprocess": passThrough},
    {"name": "string$ebnf$1", "symbols": []},
    {"name": "string$ebnf$1", "symbols": ["string$ebnf$1", "char"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "string", "symbols": [{"literal":"'"}, "string$ebnf$1", {"literal":"'"}], "postprocess": makeString},
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
    {"name": "semi", "symbols": [{"literal":";"}, "_"]},
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
