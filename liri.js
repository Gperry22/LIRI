// import { log } from "util";
require("dotenv").config();

var keys = require("./keys.js");
var Twitter = require("twitter");
var Spotify = require("node-spotify-api");
var request = require("request");
var fs = require("fs");

var liriArguement = process.argv[2];
var songEntered = process.argv[3];
var spotKeys = new Spotify(keys.spotify);
var twitKeys = new Twitter(keys.twitter);
var omdbKeys = keys.omdb.apikey;

//Switch statement
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
            "\r\n\n" +
            "1. my-tweets  and 'any twitter name'. The default Twitter is @Philadelphia Eagles " +
            "\r\n\n" +
            "2. spotify-this-song  and 'any song name'. The default Song is Unforgettable by French Montana & Swae Lee. " +
            "\r\n\n" +
            "3. movie-this  and 'any movie name'. The default Movie is Mr. Nobody. " +
            "\r\n\n" +
            "4. do-what-it-says.  Get's Backstreet Boys song 'I Want It That Way' from text file and Spotify's It." +
            "\r\n\n" +
            "Be sure to put the movie or song name in quotation marks if it's more than one word."
        );
}


// Tweet function, uses the Twitter module to call the Twitter api
function getTweets() {
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
                logdata(tweet);
            }
        } else console.log("Error :" + error);
    });
}


//Spotify Function 
function getSong(songFromTxtFile) {
    var songToSearch = songEntered;
    if (!songToSearch && songFromTxtFile) {
        songToSearch = songFromTxtFile;
    } else if (!songToSearch && !songFromTxtFile) {
        songToSearch = "Unforgettable";
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
            logdata(songResults);
        }
    });
}


//OMDB Function
function getMovie() {
    var movieToSearch = process.argv[3];
    if (!movieToSearch) {
        movieToSearch = "Mr. Nobody";
    }
    var queryUrl = "http://www.omdbapi.com/?i=tt3896198&t=" + movieToSearch + "&apikey=" + omdbKeys;
    request(queryUrl, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            var mRes = JSON.parse(body)
            var rottenTomatoesRating = "";
            // console.log("body:", mRes);
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
            logdata(movieOutput);
        } else
            console.log("error:", error, response.statusCode); // Print the error if one occurred
    });
}


//Read from Txt file function
function doWhatItSays() {
    fs.readFile("./random.txt", "utf8", function (error, data) {
        if (error) {
            return console.log(error);
        }
        var dataArr = data.split(",");
        var songFromTxtFile = dataArr[1];
        // console.log(songFromTxtFile);
        getSong(songFromTxtFile);
    });
}


// Log to log.txt file
function logdata(data) {
    fs.appendFile("log.txt", data, function (error) {
        if (error) {
            console.log(error);
        }
    })
}