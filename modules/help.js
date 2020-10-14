module.exports = {
  "description":"yts-commander help menu",
  "modes":[
    {
      "description":"movie mode commands",
      "commands":[
	{ "description":"opens youtube trailer for movie with given index in default web browser.", "keys":"y[1-5]" },
	{ "description":"opens yts site page for movie with given index in default web browser.", "keys":"i[1-5]" },
	{ "description":"opens torrent mode showing torrent(s) for movie with given index.", "keys":"t[1-5]" },
	{ "description":"opens cover page for movie with given index in default web browser.", "keys":"c[1-5]" },
	{ "description":"opens imdb page for movie with given index in default web browser.", "keys":"u[1-5]" },
	{ "description":"opens genre mode showing list of all available movie genres.", "keys":"l" },
	{ "description":"loads the previous page of results for the same search term.", "keys":"p" },
	{ "description":"loads the next page of results for the same search term.", "keys":"n" }
      ],
      "name":"movie"
    },
    {
      "description":"torrent mode commands",
      "commands":[
	{ "description":"displays torrent for movie with given index.", "keys":"t[1-5]" },
	{ "description":"downloads torrent with given index to $PWD.",  "keys":"d[1-9]" }
      ],
      "name":"torrent"
    },
    { "description":"genre mode commands",
      "commands":[
	{ "description":"selects genre filter with given index for next movie search.", "keys":"g[1-27]" }
      ],
      "name":"genre"
    },
    {
      "description":"these commands can be performed from all modes",
      "commands":[
	{ "description":"show current mode of the application.", "keys":"m" },
	{ "description":"returns app to the last mode.", "keys":"b" },
	{ "description":"opens this help menu.", "keys":"?" },
	{ "description":"quits yts-commander.", "keys":"q" }
      ],
      "name":"all"
    }
  ],
  "about":{
    "description":"yts-commander is a terminal application, built using the official yts.mx api "
     .concat("allowing for quick browsing of the YTS.MX domain. The application has four modes ")
     .concat("movie, torrent, genre and help each mode's commands are presented below.")
  },
  "search":{
    "description":"all inputs apart from the above commands are interpreted as a search term and "
    .concat("will cause yts-commander to search for movies matching the given search term. ")
    .concat("Tip: To search for all movies according to your set genre, simply use an empty space as ")
    .concat("your search term.")
  },
}
