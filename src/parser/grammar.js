// Generated automatically by nearley, version 2.16.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

const moo = require('moo');
const lexer = moo.compile({
	ws: /[ \t]+/,
	number:  /[-]?(?:0|[1-9][0-9]*)/,
	bool: ['true', 'false'],
	string:  /'[^']*'/,
	command: ['getNpcHappiness', 'getEvent'],
	nl: { match: /\n/, lineBreaks: true },
	comparator: ['>=', '>', '<', '=', '<='],
});
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "expression", "symbols": [(lexer.has("command") ? {type: "command"} : command), (lexer.has("ws") ? {type: "ws"} : ws), "unquotedstring", (lexer.has("ws") ? {type: "ws"} : ws), (lexer.has("comparator") ? {type: "comparator"} : comparator), (lexer.has("ws") ? {type: "ws"} : ws), "rightside"], "postprocess": ( [ command, , key, , comparator, , rightside ] ) => ({ command, key, comparator, rightside })},
    {"name": "unquotedstring", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": ( [ quoted ] ) => ({type: 'string', value: quoted.value.replace(/[']/g, '')})},
    {"name": "rightside", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": ( [ rightside ] ) => rightside},
    {"name": "rightside", "symbols": [(lexer.has("bool") ? {type: "bool"} : bool)], "postprocess": ( [ rightside ] ) => rightside}
]
  , ParserStart: "expression"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
