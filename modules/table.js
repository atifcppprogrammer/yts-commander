/**
 *
 *
 * @see https://www.npmjs.com/package/cli-table3
 * @see https://github.com/cli-table/cli-table3
 *
 * @atifcppprogrammer
 */

const Table = require('cli-table3');
const help = require('./help');

const commonConfig = {
  chars: {
    'bottom-right':'',
    'bottom-left':'',
    'bottom-mid':'',
    'right-mid':'',
    'top-right':'',
    'top-left':'',
    'left-mid':'',
    'top-mid': '',
    'mid-mid':'',
    'middle':' ',
    'bottom':'',
    'right': '',
    'left':'',
    'top':'',
    'mid':''
  },
  style:{
    'padding-right':0,
    'padding-left':2
  },
  wordWrap:true
};

const movieHeadingTableConfig = { colWidths:[ 5, 15, 65, 15], ...commonConfig };
const movieContentTableConfig = { colWidths:[ 5, 100], ...commonConfig };

const genreHeadingTableConfig = { colWidths:[ 5, 15, 65 ], ...commonConfig };
const genreContentTableConfig = { colWidths:[ 5, 100 ], ...commonConfig };

const torrentHeadingTableConfig = movieHeadingTableConfig;
const torrentContentTableConfig = movieContentTableConfig;

const helpHeadingTableConfig = { colWidths:[ 5, 16, 65 ], ...commonConfig };
const helpContentTableConfig = { colWidths:[ 5, 10, 80 ], ...commonConfig };

const stringifyMovieGenres = genres =>
  'genres['.concat(genres.map(genre => genre.toLowerCase()).join(', '))
    .concat(']');

let tableTheme = undefined;

const stringifyTorrentProps = torrent => {
  const props = [ 'quality', 'type', 'size', 'seeds', 'peers' ];
  return props.map(prop => `${prop}[${torrent[prop]}]`).join(' ');
}

const getHelpModeTableFor = mode => {
  const tableOne = new Table(helpContentTableConfig);
  const tableTwo = new Table(helpContentTableConfig);
  tableOne.push(
    [ '', tableTheme.data(mode.name), tableTheme.info(mode.description) ],
    [ '', '' ]
  );
  mode.commands.forEach(command => tableTwo.push(
    [ '', tableTheme.more(command.keys), tableTheme.text(command.description) ]
  ));
  return tableOne.toString().concat('\n').concat(tableTwo.toString());
}

const getMovieTableFor = (movie, index) => {
  const table = new Table(movieContentTableConfig);
  table.push(
    [ tableTheme.info(`${index}.`), tableTheme.info(movie['title']) ],
    [ '', tableTheme.data(`year[${movie['year']}]`
         .concat(' ').concat(`imdb[${movie['rating']}]`)
         .concat(' ').concat(`runtime[${movie['runtime']}]`)) ],
    [ '', tableTheme.text(movie['summary']) ],
    [ '', tableTheme.more(stringifyMovieGenres(movie['genres'])) ]
  );
  return table.toString();
}

const getTorrentTableFor = (torrent, index) => {
  const table = new Table(torrentContentTableConfig);
  table.push(
    [ tableTheme.info(`${index}.`), tableTheme.info(torrent['hash']) ],
    [ '', tableTheme.data(stringifyTorrentProps(torrent)) ],
    [ '', tableTheme.text(`${torrent['url']}`) ],
    [ '', tableTheme.more(`uploaded[${torrent['date_uploaded'].split(' ')
      .shift()}]`) ]
  );
  return table.toString();
}

exports.getMovieTablesFor = data => {
  const headerTable = new Table(movieHeadingTableConfig);
  const show = tableTheme.show;
  headerTable.push(
    [ '', { hAlign:'left', content:show('mode[movie]') }, 
     { hAlign:'center', content:show(`query[${data['query']}]`) },
     { hAlign:'right', content:show(`page[${data['page_number']}]`) }]
  );
  const contentTables = data.movies.map((movie, index) => 
    getMovieTableFor(movie, index + 1));
  return headerTable.toString()
    .concat('\n\n').concat(contentTables.join('\n\n')).concat('\n');
}

exports.getTorrentTablesFor = (data, index) => {
  const headerTable = new Table(torrentHeadingTableConfig);
  const show = tableTheme.show;
  headerTable.push(
    [ '', { hAlign:'left', content:show('mode[torrent]') },
      { hAlign:'center', content:show(`movie[${data['movies'][index]['title']}]`) },
      { hAlign:'right', content:show(`year[${data['movies'][index]['year']}]`) }]
  );
  const contentTables = data.movies[index].torrents.map((torrent, index) =>
    getTorrentTableFor(torrent, index + 1));
  return headerTable.toString()
    .concat('\n\n').concat(contentTables.join('\n\n')).concat('\n');
}

exports.getGenreTableFor = genres => {
  const headerTable = new Table(genreHeadingTableConfig);
  headerTable.push(
    [ '', { hAlign:'left', content:tableTheme.show('mode[genre]') },
      { hAlign:'center', content:tableTheme.show('select movie genre') }]
  );
  const contentTable = new Table(genreContentTableConfig);
  genres.forEach((genre, index) => contentTable.push(
    [ tableTheme.info(`${index + 1}.`), tableTheme.more(genre) ]
  ));
  return headerTable.toString().concat('\n\n')
    .concat(contentTable.toString()).concat('\n');
}

exports.getHelpTables = () => {
  const headerTable = new Table(helpHeadingTableConfig);
  headerTable.push(
    [ '', { hAlign:'left', content:tableTheme.show('mode[help]') },
      { hAlign:'center', content:tableTheme.show(help.description) }]
  );
  const modeTables = help.modes.map(mode => getHelpModeTableFor(mode))
    .join('\n\n');
  const searchTable = new Table(helpContentTableConfig);
  searchTable.push(
    [ '', tableTheme.data('search'), 
      tableTheme.text(help.search.description) ]
  );
  const aboutTable = new Table(helpContentTableConfig);
  aboutTable.push(
    [ '', tableTheme.data('about'),
      tableTheme.text(help.about.description) ]
  );
  return headerTable.toString().concat('\n\n')
    .concat(aboutTable.toString()).concat('\n\n').concat(modeTables)
    .concat('\n\n').concat(searchTable.toString()).concat('\n');
}

exports.setTheme = theme => tableTheme = theme;

