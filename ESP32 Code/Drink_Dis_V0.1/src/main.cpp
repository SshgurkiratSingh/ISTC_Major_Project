#include <Arduino.h>
#include <PubSubClient.h>
#include <WiFi.h>

// WiFi and MQTT Setup
char SSID[64] = "Node";
char PASSWORD[64] = "whyitellyou";

// Drink Dispenser Setup
#define drinkCount 4
const int drinkLedIndicator[drinkCount] = {23, 22, 21, 19};
const int drinkRelay[drinkCount] = {25, 33, 32, 18};
const int buttons[drinkCount] = {35, 27, 14, 15};

// Global variables
bool isDispensing = false;
unsigned long dispensingStartTime = 0;
const unsigned long dispensingTimeout = 10000; // 10 seconds
int drinkQueue = 0;
bool errorState = false; // Flag to indicate error state
WiFiClient espClient;
PubSubClient client(espClient);

// Function to indicate error state using LEDs (modify as needed)
void indicateLedError() {
  for (int i = 0; i < drinkCount; i++) {
    digitalWrite(drinkLedIndicator[i], HIGH);
  }
}

// Function to indicate drink queue using LED animation
void indicateDrinkQueue() {
  static unsigned long lastBlinkTime = 0;
  const unsigned long blinkInterval = 500; // Adjust blink speed

  if (millis() - lastBlinkTime >= blinkInterval) {
    lastBlinkTime = millis();
    digitalWrite(drinkLedIndicator[drinkQueue], !digitalRead(drinkLedIndicator[drinkQueue]));
  }
}

// Reconnect to MQTT broker
void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("DrinkDispenser")) {
      Serial.println("connected");
      client.subscribe("drinkdispenser");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

// Handle incoming MQTT messages
void handleMQTTMessage(char* topic, byte* payload, unsigned int length) {
  if (strcmp(topic, "drinkdispenser") == 0) {
    int drinkNumber = (char)payload[0] - '0';
    if (drinkNumber >= 1 && drinkNumber <= drinkCount) {
      drinkQueue = drinkNumber - 1;
      Serial.printf("Received request to dispense drink %d\n", drinkNumber);
    } else {
      Serial.printf("Invalid drink number %d received\n", drinkNumber);
    }
  }
}

void setup() {
  Serial.begin(115200);

  // Set up LEDs and relays
  for (int i = 0; i < drinkCount; i++) {
    pinMode(drinkLedIndicator[i], OUTPUT);
    pinMode(drinkRelay[i], OUTPUT);
    digitalWrite(drinkRelay[i], LOW); // Relays off initially
    pinMode(buttons[i], INPUT); // Assuming buttons are connected with pull-up resistors
  }

  // Connect to WiFi (add timeout handling if needed)
  WiFi.begin(SSID, PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  // Set up MQTT client
  client.setServer("192.168.1.50", 1883); // Replace with your MQTT broker address and port
  client.setCallback(handleMQTTMessage);
}

void loop() {
  // Handle MQTT connection
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();

  // Check for button presses and activate relays
  for (int i = 0; i < drinkCount; i++) {
    if (digitalRead(buttons[i]) == LOW && drinkQueue == i) { // Button pressed and matches queue
      digitalWrite(drinkRelay[i], HIGH); 
      isDispensing = true;
      dispensingStartTime = millis();
    }
  }

  // Manage dispensing timeout 
  if (isDispensing && millis() - dispensingStartTime >= dispensingTimeout) {
    for (int i = 0; i < drinkCount; i++) { 
      digitalWrite(drinkRelay[i], LOW); // Turn off all relays after timeout
    }
    isDispensing = false;
    drinkQueue = -1; // Reset queue 
  }

  // Indicate drink queue using LED animation
  if (drinkQueue >= 0 && drinkQueue < drinkCount) {
    indicateDrinkQueue();
  } 
  // Add error handling and LED indication as needed
}