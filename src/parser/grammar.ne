@{%
const moo = require('moo');
const lexer = moo.compile({
	ws: /[ \t]+/,
	number:  /[-]?(?:0|[1-9][0-9]*)/,
	bool: ['true', 'false'],
	string:  /'[^']*'/,
	command: ['getNpcHappiness', 'getEvent', 'changeNpcHappiness'],
	nl: { match: /\n/, lineBreaks: true },
	comparator: ['>=', '>', '<', '=', '<='],
});
%}
@lexer lexer

expression -> %command %ws unquotedstring %ws %comparator %ws rightside {% ( [ command, , key, , comparator, , rightside ] ) => ({ command, key, comparator, rightside }) %}
expression -> %command %ws unquotedstring %ws rightside {% ( [ command, , key, , rightside ] ) => ({ command, key, rightside }) %}
unquotedstring -> %string {% ( [ quoted ] ) => ({type: 'string', value: quoted.value.replace(/[']/g, '')}) %}
rightside ->
		%number {% ( [ rightside ] ) => rightside %}
	| %bool {% ( [ rightside ] ) => rightside %}
