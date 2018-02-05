// import { log } from "util";

require("dotenv").config();

var keys = require("./keys.js");
var Twitter = require("twitter");
var Spotify = require("node-spotify-api");
var request = require("request");
var fs = require("fs"); //reads and writes files
var liriArguement = process.argv[2];

var spotKeys = new Spotify(keys.spotify);
var twitKeys = new Twitter(keys.twitter);
// var omdbKeys = new OMDB(keys.omdb);

switch (liriArguement) {
    case "my-tweets":
        getTweets();
        break;
    case "spotify-this-song":
        getSong();
        break;
    case "movie-this":
        getMovie();
        break;
    case "do-what-it-says":
        doWhatItSays();
        break;
    default:
        console.log(
            "\r\n" +
            "Try typing one of the following commands after 'node liri.js' : " +
            "\r\n" +
            "1. my-tweets  and 'any twitter name' " +
            "\r\n" +
            "2. spotify-this-song  and 'any song name' " +
            "\r\n" +
            "3. movie-this  and 'any movie name' " +
            "\r\n" +
            "4. do-what-it-says." +
            "\r\n" +
            "Be sure to put the movie or song name in quotation marks if it's more than one word."
        );
}


// Tweet function, uses the Twitter module to call the Twitter api
function getTweets() {
    // var client = new Twitter({
    // 	consumer_key: keys.twitter.consumer_key,
    // 	consumer_secret: keys.twitter.consumer_secret,
    // 	access_token_key: keys.twitter.access_token_key,
    // 	access_token_secret: keys.twitter.access_token_secret,
    // });
    // var client = keys.twitter;
    var twitterUsername = process.argv[3];
    if (!twitterUsername) {
        twitterUsername = "Eagles";
    }
    params = {
        screen_name: twitterUsername
    };
    twitKeys.get("statuses/user_timeline/", params, function (
        error,
        tweets,
        response
    ) {
        if (!error) {
            console.log(`The Latest 20 Tweets for ${twitterUsername} are\n`);

            for (let i = 0; i < 20; i++) {
                var tweet =
                    "********************************** \n\n" +
                    "DATE: " + tweets[i].created_at + "\n" +
                    "TWEET: " + tweets[i].text + "\n";
                console.log(tweet);
            }
        } else console.log("Error :" + error);
    });
}

//Spotify Function 
function getSong() {
    var songToSearch = process.argv[3];
    if (!songToSearch) {
        songToSearch = "I Want it That Way";
    }
    spotKeys.search({
        type: "track",
        query: songToSearch,
        limit: 15
    }, function (err, data) {
        if (err) {
            return console.log("Error occurred: " + err);
        }
        // console.log(data.tracks.items);
        // console.log(data.tracks.items[0].artists);
        for (let i = 0; i < 15; i++) {
            var songInfo = data.tracks.items;
            var artistArrayDataResponse = data.tracks.items[0].artists;
            var artistFoundInDataResponse = [];
            var songUrl = "";
            if (songInfo[i].preview_url === null) {
                songUrl = "There is no Preview URL!";
            } else songUrl = songInfo[i].preview_url;
            
            for (let j = 0; j < artistArrayDataResponse.length; j++) {
                if (artistArrayDataResponse[j].hasOwnProperty("name")) {
                    artistFoundInDataResponse.push(artistArrayDataResponse[j].name)
                }
            };
            var artistInfo = artistFoundInDataResponse;

            var songResults =
                "********************************************************************** \n\n" +
                "Artist: " + artistInfo + "\n\n" +
                "Album: " + songInfo[i].name + "\n\n" +
                "Preview Url: " + songUrl;
            console.log(songResults);
        }
    });
}

//OMDB Function
function getMovie() {
    var movieToSearch = process.argv[3];
    if (!movieToSearch) {
        movieToSearch = "Mr. Nobody";
    }
    var queryUrl = "http://www.omdbapi.com/?i=tt3896198&t=" + movieToSearch + "&apikey=54cc6259";
    request(queryUrl, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            var mRes = JSON.parse(body)
            var rottenTomatoesRating = "";
            console.log("body:", mRes);
            if (mRes.hasOwnProperty(mRes.Ratings[1])) {
                rottenTomatoesRating = mRes.Ratings[1].Value;
            } else rottenTomatoesRating = "No Rotten Tomatoes Rating Found";
            var movieOutput =
                "TITLE: " + mRes.Title + "\n\n" +
                "YEAR: " + mRes.Year + "\n\n" +
                "IMDB RATING: " + mRes.imdbRating + "\n\n" +
                "ROTTEN TOMATOES RATING: " + rottenTomatoesRating + "\n\n" +
                "COUNTRY: " + mRes.Country + "\n\n" +
                "LANGUAGE: " + mRes.Language + "\n\n" +
                "PLOT: " + mRes.Plot + "\n\n" +
                "ACTORS: " + mRes.Actors + "\n\n" +
                "AWARDS: " + mRes.Awards + "\n\n" +
                "--------------------------------------------------------";
            console.log(movieOutput);
        } else
            console.log("error:", error, response.statusCode); // Print the error if one occurred
    });
}