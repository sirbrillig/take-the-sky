@{%
const moo = require('moo');
const lexer = moo.compile({
	ws: /[ \t]+/,
	number:  /[-]?(?:0|[1-9][0-9]*)/,
	string:  /'[^']*'/,
	command: ['getNpcHappiness'],
	nl: { match: /\n/, lineBreaks: true },
	comparator: ['>=', '>', '<', '=', '<='],
});
%}
@lexer lexer

expression -> %command %ws unquotedstring %ws %comparator %ws %number {% ( [ command, , key, , comparator, , number ] ) => ({ command, key, comparator, number }) %}
unquotedstring -> %string {% ( [ quoted ] ) => ({type: 'string', value: quoted.value.replace(/[']/g, '')}) %}
