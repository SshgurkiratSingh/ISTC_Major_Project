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
  const [table, sensor] = topic.split("/");
  if (tables[table]) {
    tables[table][sensor] = message.toString();
  }
  mqttData.push({ topic, message: message.toString() });
  if (mqttData.length > 25) {
    mqttData = mqttData.slice(-25);
  }
});

router.get("/", (req, res) => {
  let dataToSend = [...mqttData];
  res.json(dataToSend.reverse());
});
router.get("/clear", (req, res) => {
  mqttData = [];
  res.json({ message: "Data cleared" });
});
// Publising data at drinkdispenser topic
const tables = {
  table1: {
    light: null,
    temp: null,
    humidity: null,
    ldr: null,
    notification_string: null,
  },
  table2: {
    light: null,
    temp: null,
    humidity: null,
    ldr: null,
    notification_string: null,
  },
  table3: {
    light: null,
    temp: null,
    humidity: null,
    ldr: null,
    notification_string: null,
  },
};

router.post("/publish", (req, res) => {
  const { drinkName } = req.body;
  if (!drinkName) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const topic = "drinkdispenser";
  switch (drinkName) {
    case "Orange Juice":
      client.publish(topic, "1");
      break;
    case "Mineral Water":
      client.publish(topic, "2");
      break;
    case "oca Cola":
      client.publish(topic, "3");
      break;
    case "Cappuccino":
      client.publish(topic, "4");
      break;
    default:
      client.publish("itemRequest", drinkName);

      break;
  }
  res.json({ message: "Data published successfully" });
});

module.exports = router;
