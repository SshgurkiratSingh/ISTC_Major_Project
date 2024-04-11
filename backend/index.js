const express = require("express");
const app = express();
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const morgan = require("morgan");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors()); // Use cors middleware here
app.use(express.json());

const port = 2500; // or any other port number you want to use
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 100 requests per windowMs
});
app.use(limiter);
app.use(morgan("dev"));
app.get("/", (req, res) => {
  res.send("Hello World!");
});

const apiForSpotify = require("./routes/spotifyRoutes");
app.use("/api/v1/spotify/", apiForSpotify);

const apiForItemList = require("./routes/itemListRoute");
app.use("/api/v1/item/", apiForItemList);

const apiForUser = require("./routes/userRoute");
app.use("/api/v1/user/", apiForUser);

const apiForMqtt = require("./routes/mqttData");
app.use("/api/v1/mqtt/", apiForMqtt);

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is online at port ${port}!`);
  console.log(`http://localhost:${port}`);
});
