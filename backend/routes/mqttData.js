const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const cors = require("cors");
const uuid = require("uuid-random");
const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://localhost:1883");
let mqttData = [];

client.on("connect", () => {
  console.log("Connected to MQTT broker");
  client.subscribe("#");
});

client.on("message", (topic, message) => {
  console.log("Received message:", topic, message.toString());
  if (mqttData.length > 25) {
    mqttData = mqttData.slice(25);
  }
  mqttData.push({ id: new Date(), topic: topic, message: message.toString() });
});

router.get("/", (req, res) => {
  let dataToSend = [...mqttData];
  res.json(dataToSend.reverse());
});

module.exports = router;
