#!/usr/bin/env node

/**
 *
 * @author atifcppprogrammer
 */

const parser = require('./modules/parser');
const menu = require('./modules/menu');
const program = require('commander');
const colors = require('colors');

const theme = {
  'parse':colors.bold.bgMagenta.white,
  'show':colors.bold.white,
  'data':colors.bold.green,
  'more':colors.bold.blue,
  'info':colors.bold.red,
  'text':colors.white,
  'alert':colors.bold.yellow,
  'failure':colors.bold.red,
  'success':colors.bold.green
};

const message = `
The above help pertains only to the flags with which yts-commander can be
invoked for more detailed information regarding how to use this cli we
recommened that you launch yts-commander and enter '?' to obtain a more
detailed help menu. Have Fun using yts-commander !`;

program.option('-d, --disable', 'disable application colors');
program.on('--help', () => console.log(message));
program.name("yts-commander");
program.parse(process.argv);

parser.setTheme(theme.parse);
menu.setTheme(theme);

if(program['disable']) colors.disable();

(async () => {
  let sentinel = 'y', ouput = '';
  while(sentinel != 'q'){
    output = await parser.input();
    if (output.command){
      switch(output.command){
	case 's': await menu.loadMoviesSimilarTo(output.arg); break;
	case 'n': await menu.loadNextPage(); break;
	case 'p': menu.loadPreviousPage(); break;
	case 'y': await menu.openUrl(output); break;
	case 'c': await menu.openUrl(output); break;
	case 'i': await menu.openUrl(output); break;
	case 'u': await menu.openUrl(output); break;

	case 'd': await menu.downloadMovieTorrent(output.arg, process.cwd()); break;
	case 't': menu.loadMovieTorrents(output.arg); break;
	case 'l': menu.loadMovieGenres(); break;
	case 'g': menu.setMovieGenre(output.arg); break;

	case 'b': menu.loadLastMode(); break;
	case 'm': menu.showCurrentMode(); break;
	case '?': menu.loadAppHelp(); break;
	case 'q': sentinel = 'q'; break;
      }
    }
    if (output.searchTerm)
      await menu.searchForMovies(output.searchTerm);
  }
})();
