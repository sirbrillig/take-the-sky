// Generated automatically by nearley, version 2.16.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

const moo = require('moo');
const lexer = moo.compile({
	ws: /[ \t]+/,
	number:  /[-]?(?:0|[1-9][0-9]*)/,
	string:  /'[^']*'/,
	command: ['getNpcHappiness'],
	nl: { match: /\n/, lineBreaks: true },
	comparator: ['>=', '>', '<', '=', '<='],
});
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "expression", "symbols": [(lexer.has("command") ? {type: "command"} : command), (lexer.has("ws") ? {type: "ws"} : ws), "unquotedstring", (lexer.has("ws") ? {type: "ws"} : ws), (lexer.has("comparator") ? {type: "comparator"} : comparator), (lexer.has("ws") ? {type: "ws"} : ws), (lexer.has("number") ? {type: "number"} : number)], "postprocess": ( [ command, , key, , comparator, , number ] ) => ({ command, key, comparator, number })},
    {"name": "unquotedstring", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": ( [ quoted ] ) => ({type: 'string', value: quoted.value.replace(/[']/g, '')})}
]
  , ParserStart: "expression"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
