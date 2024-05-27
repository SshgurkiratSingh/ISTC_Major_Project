const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const cors = require("cors");
const SpotifyWebApi = require("spotify-web-api-node");
require("dotenv").config();

let spotify = new SpotifyWebApi({
  clientId: "098d03c3aeaa4b75a14e3a76ca56f526",
  redirectUri:
    "http://ec2-44-204-194-140.compute-1.amazonaws.com:2500/api/v1/spotify/callback",
  clientSecret: "bde5ee0269ad45cc81962e5d793f097b",
});
spotify.setAccessToken(process.env.SPOTIFY_TOKEN);
router.post("/search", (req, res) => {
  const query = req.body.query;
  spotify.searchTracks(query).then(
    function (data) {
      res.send(data);
    },
    function (err) {
      console.error(err);
    }
  );
});
router.get("/login", (req, res) => {
  const scopes = ["user-read-playback-state", "user-modify-playback-state"];
  const authorizeURL = spotify.createAuthorizeURL(scopes, "yourStateValue");
  console.log(authorizeURL);
  res.send(authorizeURL);
});
router.get("/login1", (req, res) => {
  const scopes = ["user-read-playback-state", "user-modify-playback-state"];
  const authorizeURL = spotify.createAuthorizeURL(scopes, "yourStateValue");
  console.log(authorizeURL);
  res.redirect(authorizeURL);
});
router.get("/currentQueue", (req, res) => {
  spotify.getMyCurrentPlayingTrack().then(
    function (data) {
      // console.log("Now playing: " + data.body.item.name);
      res.json(data);
    },
    function (err) {
      console.log("Something went wrong!", err);
      res.send(err);
    }
  );
});
router.get("/nextSong", (req, res) => {
  spotify.skipToNext().then(
    function (data) {
      res.json(data);
    },
    function (err) {
      console.log("Something went wrong!", err);
      res.send(err);
    }
  );
});
router.get("/callback", (req, res) => {
  const error = req.query.error;
  const code = req.query.code;
  const state = req.query.state;

  if (error) {
    console.error("Callback Error:", error);
    res.send(`Callback Error: ${error}`);
    return;
  }

  spotify.authorizationCodeGrant(code).then(
    (data) => {
      const accessToken = data.body["access_token"];
      console.log(accessToken);
      spotify.setAccessToken(accessToken);

      // Now you can redirect the user or perform other actions
      res.send("Success! You can now close the window.");
    },
    (err) => {
      console.error("Error getting Tokens:", err);
      res.send(`Error getting Tokens: ${err}`);
    }
  );
});

router.post("/addToQueue", (req, res) => {
  console.log(req.body.id);
  if (!req.body.id) {
    res.send({ success: false });
  }
  spotify.addToQueue(req.body.id).then(
    function (data) {
      res.send(data);
    },
    function (err) {
      console.error(err);
      res.send(err);
    }
  );
});
module.exports = router;
