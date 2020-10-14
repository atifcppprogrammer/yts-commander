/**
 * @see https://nodejs.org/api/readline.html
 *
 * @author atifcppprogrammer
 */
const readline = require('readline');

let parserTheme = undefined;

const parseString = string => {
  let parsed = {};
  const regex = [ /^(y|i|u|c|s|t|d|g)[0-9]{1,2}$/g, /^(n|p|b|m|l|\?|q)$/g ];
  if(string.search(regex[0]) == 0)
    parsed = { 'command':string[0], 'arg':string.substring(1, 3) }
  else if (string.search(regex[1]) == 0)
    parsed = { 'command':string[0] }
  else parsed = { 'searchTerm':string }
  return parsed;
}

exports.input = () => {
  return new Promise(resolve => {
    const scanner = readline.createInterface({
      output:process.stdout, input:process.stdin
    });
    const message = parserTheme('yts-commander (? for help) ').concat(' ');
    scanner.question(message, answer => {
      scanner.close(); resolve(parseString(answer));
    });
  });
}

exports.setTheme = theme => parserTheme = theme;
