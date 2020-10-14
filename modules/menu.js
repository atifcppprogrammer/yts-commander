/**
 *
 *
 * @author atifcppprogrammer
 */

const table = require('./table');
const open = require('open');
const yts = require('./yts');

const appAlerts = {
  "downloadSucceeded":"torrent successfully download to current working directory !",
  "downloadFailed":"download failed check your internet connection !",
  'requestFailed':"request failed check your internet connection !",
  'invalidCommand':"cannot perform given command in current mode !",
  'noResultsLoaded':"no results on which peform given command !",
  'onFirstPage':"already on first page cannot go back further !",
  'onLastPage':"already on last page cannot load more results !",
  'downloadingTorrent':"downloading torrent ! please wait ...",
  'noResultsFound':"no results found for given search term !",
  'outOfBounds':"given index argument is out of bounds !",
  'noTorrentsFound':"no torrents found for this movie !",
  'loadingResults':"loading results ! please wait ...",
  'sameTorrent':"already showing requested torrent !",
  "openingLink":"opening external link !",
  'inMode':"already in requested mode !",
  'settingGenre':"setting genre to ",
  "isMode":"current mode is "
};

const commandMapping = {
  'c':'large_cover_image',
  'y':'yt_trailer',
  'i':'imdb_page',
  'u':'url'
};

const movieGenres = [
  "all", 
  "action",
  "adventure",
  "animation",
  "biography",
  "comedy",
  "crime",
  "documentary",
  "drama",
  "family",
  "fantasy",
  "film-noir",
  "history",
  "horror",
  "music",
  "musical",
  "mystery",
  "news",
  "reality-tv",
  "romance",
  "game-show",
  "sci-fi",
  "sport",
  "thriller",
  "talk-show",
  "war",
  "western"
];

const requestStatus = [
  'NOT_OK', 
  'OK'
];

const appModes = [
  'MOVIE',
  'TORRENT',
  'GENRE',
  'HELP'
];

let menuTheme = undefined;
let movieTorrentIndex = -1;
let currentMode = 'MOVIE';
let currentGenreIndex = 0;
let newGenreIndex = 0;
let moviePages = [''];
let movieCount = -1;
let queryTerm = '';
let pageNumber = 0;
let lastMode = undefined;

const limit = 5;

const getSearchParameters = (number, query = '', genre = '') => {
  genre = genre == '' ? movieGenres[currentGenreIndex] : genre;
  query = query == '' ? queryTerm : query;
  return { 'query_term':query, 'page':number, 'sort_by':'rating', genre, limit };
}

const showPageHavingNumber = number => {
  console.clear();
  if (number == 0) return;
  const data = moviePages[number].data; data.query = queryTerm;
  console.log(table.getMovieTablesFor(data));
}

const showTorrentHavingIndex = index => {
  console.clear();
  console.log(table.getTorrentTablesFor(moviePages[pageNumber].data, index));
}

const showMovieGenres = () => {
  console.clear();
  console.log(table.getGenreTableFor(movieGenres));
}

exports.searchForMovies = async newQuery => {
  newGenre = movieGenres[newGenreIndex];
  console.log(menuTheme.alert(appAlerts.loadingResults));
  const results = await yts.getMovies(getSearchParameters(1, newQuery, newGenre));
  if (results.status === requestStatus[0]){
    console.log(menuTheme.failure(appAlerts.requestFailed));
    return;
  }
  if (results.data['movie_count'] == 0){
    console.log(menuTheme.alert(appAlerts.noResultsFound));
    return;
  }
  currentMode = appModes[0]; currentGenreIndex = newGenreIndex; 
  moviePages = [ '', results ]; queryTerm = newQuery; pageNumber = 1;
  movieCount = results.data['movie_count']; movieTorrentIndex = -1;
  showPageHavingNumber(pageNumber);
}

exports.loadMoviesSimilarTo = async index => {
  if (currentMode != appModes[0]){
    console.log(menuTheme.alert(appAlerts.invalidCommand));
    return;
  }
  if (pageNumber == 0){
    console.log(menuTheme.alert(appAlerts.noResultsLoaded));
    return;
  }
  const movies = moviePages[pageNumber].data.movies;
  if (index < 1 || index > movies.length){
    console.log(menuTheme.alert(appAlerts.outOfBounds));
    return;
  }
  console.log(menuTheme.alert(appAlerts.loadingResults));
  const results = await yts.suggestMoviesSimilarTo(movies[--index].id);
  if(results.status === requestStatus[0]){
    console.log(menuTheme.failure(appAlerts.requestFailed));
    return;
  }
  if (results.data.movies.length == 0){
    console.log(menuTheme.alert(appAlerts.noResultsFound));
    return;
  }
  movieCount = results.data['movie_count']; movieTorrentIndex = -1;
  pageNumber = 1; moviePages = ['', results];
  showPageHavingNumber(pageNumber);
}

exports.loadPreviousPage = async () => {
  if (currentMode != appModes[0]){
    console.log(menuTheme.alert(appAlerts.invalidCommand));
    return;
  }
  if (pageNumber == 0){
    console.log(menuTheme.alert(appAlerts.noResultsLoaded));
    return;
  }
  if (pageNumber == 1){
    console.log(menuTheme.alert(appAlerts.onFirstPage));
    return;
  }
  else showPageHavingNumber(--pageNumber);
}

exports.loadNextPage = async () => {
  if (currentMode != appModes[0]){
    console.log(menuTheme.alert(appAlerts.invalidCommand));
    return;
  }
  if (pageNumber == 0){
    console.log(menuTheme.alert(appAlerts.noResultsLoaded));
    return;
  }
  if (pageNumber * limit >= movieCount){
    console.log(menuTheme.alert(appAlerts.onLastPage));
    return;
  }
  if (pageNumber == moviePages.length - 1){
    console.log(menuTheme.alert(appAlerts.loadingResults));
    const results = await yts.getMovies(getSearchParameters(1 + pageNumber));
    if (results.status === requestStatus[0]){
      console.log(menuTheme.failure(appAlerts.requestFailed));
      return;
    }
    moviePages.push(results); showPageHavingNumber(++pageNumber);
  }
  else showPageHavingNumber(++pageNumber);
}

exports.loadMovieTorrents = index => {
  if (currentMode == appModes[2] || currentMode == appModes[3]){
    console.log(menuTheme.alert(appAlerts.invalidCommand));
    return;
  }
  if (pageNumber == 0){
    console.log(menuTheme.alert(appAlerts.noResultsLoaded)); 
    return;
  }
  const movies = moviePages[pageNumber].data.movies;
  if (index < 1 || index > movies.length){
    console.log(menuTheme.alert(appAlerts.outOfBounds));
    return;
  }
  if (movieTorrentIndex == index - 1 && currentMode == appModes[1]){
    console.log(menuTheme.alert(appAlerts.sameTorrent));
    return;
  }
  if (movies[--index].torrents.length == 0){
    console.log(menuTheme.alert(appAlerts.noTorrentsFound));
    return;
  }
  movieTorrentIndex = index; currentMode = appModes[1];
  showTorrentHavingIndex(index);
}

exports.downloadMovieTorrent = async (index, path) => {
  if (currentMode != appModes[1]){
    console.log(menuTheme.alert(appAlerts.invalidCommand));
    return;
  }
  const movie = moviePages[pageNumber].data.movies[movieTorrentIndex];
  if (index < 1 || index > movie.torrents.length){
    console.log(menuTheme.alert(appAlerts.outOfBounds));
    return;
  }
  console.log(menuTheme.alert(appAlerts.downloadingTorrent));
  const results = await yts.downloadMovieTorrent(movie, --index, path);
  if (results.status === requestStatus[0]){
    console.log(menuTheme.failure(appAlerts.downloadFailed));
    return;
  }
  console.log(menuTheme.success(appAlerts.downloadSucceeded));
}

exports.loadMovieGenres = () => {
  if (currentMode == appModes[2]){
    console.log(menuTheme.alert(appAlerts.inMode));
    return;
  }
  if (currentMode != appModes[0]){
    console.log(menuTheme.alert(appAlerts.invalidCommand));
    return;
  }
  currentMode = appModes[2]; showMovieGenres();
}

exports.setMovieGenre = index => {
  if (currentMode != appModes[2]){
    console.log(menuTheme.alert(appAlerts.invalidCommand));
    return;
  }
  if (index < 1 || index > movieGenres.length){
    console.log(menuTheme.alert(appAlerts.outOfBounds));
    return;
  }
  newGenreIndex = --index;
  console.log(menuTheme.alert(appAlerts.settingGenre.concat(' ')
    .concat(movieGenres[newGenreIndex]).concat(' !')));
}

exports.loadAppHelp = () => {
  if (currentMode == appModes[3]){
    console.log(menuTheme.alert(appAlerts.inMode));
    return;
  }
  lastMode = currentMode; currentMode = appModes[3];
  console.clear();
  console.log(table.getHelpTables());
}

exports.loadLastMode = () => {
  if (currentMode == appModes[1] || currentMode == appModes[2]){
    currentMode = appModes[0];
    showPageHavingNumber(pageNumber);
    return;
  }
  if (currentMode == appModes[3]){
    switch(lastMode){
      case appModes[0]:
	currentMode = appModes[0];
	showPageHavingNumber(pageNumber); break;
      case appModes[1]:
	currentMode = appModes[1];
	showTorrentHavingIndex(movieTorrentIndex); break;
      case appModes[2]:
	currentMode = appModes[2];
	showMovieGenres(); break;
    }
    lastMode = undefined; return;
  }
  console.log(menuTheme.alert(appAlerts.inMode));
}

exports.openUrl = (output, theme) => {
  if (currentMode != appModes[0]){
    console.log(menuTheme.alert(appAlerts.invalidCommand));
    return;
  }
  if (pageNumber == 0){
    console.log(menuTheme.alert(appAlerts.noResultsLoaded));
    return;
  }
  const movies = moviePages[pageNumber].data.movies;
  if (output.arg < 1 || output.arg > movies.length){
    console.log(menuTheme.alert(appAlerts.outOfBounds));
    return;
  }
  console.log(menuTheme.alert(appAlerts.openingLink));
  return open(movies[--output.arg][commandMapping[output.command]]);
}

exports.showCurrentMode = () => {
  console.log(menuTheme.alert(appAlerts.isMode.concat(currentMode)
    .concat(' !')));
}

exports.setTheme = theme => {
  table.setTheme(theme); menuTheme = theme;
}

