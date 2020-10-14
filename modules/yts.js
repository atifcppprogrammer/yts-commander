/**
 * 
 * @see https://yts.mx/api#movie_suggestions
 * @see https://yts.mx/api#list_movies
 *
 * @author atifcppprogrammer
 */

const axios = require('axios');
const paths = require('path');
const fs = require('fs');

const getMovieSuggestionsUrlFor = movieId => {
  const url = 'https://yts.mx/api/v2/movie_suggestions.json';
  return `${url}?movie_id=${movieId}`;
}

const getListMoviesUrlFor = searchParameters => {
  const url = 'https://yts.mx/api/v2/list_movies.json';
  const queryTerm = searchParameters['query_term'];
  if (queryTerm){
    const newTerm = queryTerm.replace(/\ /g, '%20');
    searchParameters['query_term'] = newTerm;
  }
  const parameterString = Object.keys(searchParameters)
    .map(key => `${key}=${searchParameters[key]}`).join('&');
  return `${url}${parameterString.length > 0 ? '?' : ''}`
    .concat(parameterString);
}

const getSiteUrlFor = (flag, code) => {
  return flag === 'y' ? `https://youtube.com/watch?v=${code}` :
    `https://imdb.com/title/${code}`;
}

const processMovieObject = movie => {
  if (!movie.torrents) movie.torrents = [];
  movie['yt_trailer'] = getSiteUrlFor('y', movie['yt_trailer_code']);
  delete movie['yt_trailer_code'];
  movie['imdb_page'] = getSiteUrlFor('i', movie['imdb_code']);
  delete movie['imdb_code'];
}

const getTorrentNameFor = (movie, index) => {
  return movie.title
    .concat(' ').concat(`(${movie.year})`)
    .concat(' ').concat(`[${movie.torrents[index].quality}]`)
    .concat(' ').concat(`[${movie.torrents[index].type}]`)
    .concat(' ').concat('[YTS.MX].torrent');
}

const getStatusNotOk = () => { return { 'status': 'NOT_OK' } }
const getStatusOk = () => { return { 'status': 'OK' } }

const getTorrentRequestResponseHandler = (response, path) => {
  return new Promise((resolve, reject) => {
    const writeableStream = fs.createWriteStream(path);
    response.data.pipe(writeableStream);
    writeableStream.on('close', () => resolve(getStatusOk()));
    writeableStream.on('error', err => reject(err));
  });
}

const getAxiosRequestParameters = (url, responseType = 'j') => {
  responseType = responseType == 'j' ? 'json' : 'stream';
  return { 'method':'get', 'timeout':15000, url, responseType };
}

const makeAxiosTorrentRequestFor = async (url, path) => {
  const payload = await axios(getAxiosRequestParameters(url, 's' ))
    .then(response => getTorrentRequestResponseHandler(response, path))
    .catch(getStatusNotOk);
  return payload;
}

const makeAxiosApiRequestFor = async url => {
  const payload = await axios(getAxiosRequestParameters(url))
    .then(response => response.data)
    .catch(getStatusNotOk);
  payload.status = payload.status == 'ok' ? 'OK' : 'NOT_OK';
  if (payload.status == 'OK' && payload.data.movies){
    payload.data.movies.forEach(movie => processMovieObject(movie));
    if(!payload.data['page_number']) payload.data['page_number'] = 1;
  }
  return payload;
}

exports.downloadMovieTorrent = (movie, index, path) => {
  path = paths.join(path, getTorrentNameFor(movie, index));
  const url = movie.torrents[index].url;
  return makeAxiosTorrentRequestFor(url, path);
}

exports.suggestMoviesSimilarTo = movieId => {
  const url = getMovieSuggestionsUrlFor(movieId);
  return makeAxiosApiRequestFor(url);
}

exports.getMovies = searchParameters => {
  const url = getListMoviesUrlFor(searchParameters);
  return makeAxiosApiRequestFor(url);
}
