#include <Arduino.h>
#include <PubSubClient.h>
#include <WiFi.h>

// WiFi and MQTT Setup
char SSID[64] = "ConForNode1";
char PASSWORD[64] = "12345678";

// Drink Dispenser Setup
#define drinkCount 4

const int drinkRelay[drinkCount] = {25, 33, 32, 18};
const int buttons[drinkCount] = {35, 27, 14, 15};

// Global variables
bool isDispensing = false;
unsigned long dispensingStartTime = 0;
const unsigned long dispensingTimeout = 10000; // 10 seconds
int drinkQueue = 0;
bool errorState = false; // Flag to indicate error state
int drinkQuenceButton = 22;
int LED_INDICATOR = 23;
WiFiClient espClient;
PubSubClient client(espClient);

#define ERROR_Status 1
#define OK_Status 0
#define DISPENSING_Status 2
#define DISPENSING_TIMEOUT_Status 3
#define In_Quence 4

// Function to indicate error state using LEDs (modify as needed)
void indicateLedStatus(int ledPin, int ledStatus, int duration = 1000)
{
  pinMode(ledPin, OUTPUT);

  if (ledStatus == ERROR_Status)
  {
    // Display pulses to indicate error
    for (int i = 0; i < 5; i++)
    {
      digitalWrite(ledPin, HIGH);
      delay(100);
      digitalWrite(ledPin, LOW);
      delay(100);
    }
  }
  else if (ledStatus == OK_Status)
  {
    // Display a pattern to indicate OK
    for (int i = 0; i < 3; i++)
    {
      digitalWrite(ledPin, HIGH);
      delay(500);
      digitalWrite(ledPin, LOW);
      delay(500);
    }
  }
  else if (ledStatus == DISPENSING_Status)
  {
    // Display a solid on to indicate dispensing
    digitalWrite(ledPin, HIGH);
    delay(duration);
    digitalWrite(ledPin, LOW);
  }
  else if (ledStatus == DISPENSING_TIMEOUT_Status)
  {
    // Display a pattern to indicate dispensing timeout
    for (int i = 0; i < 5; i++)
    {
      digitalWrite(ledPin, HIGH);
      delay(50);
      digitalWrite(ledPin, LOW);
      delay(50);
    }
  }
  else if (ledStatus == In_Quence)
  {
    // Display smooth fade in and fade out to indicate drink in queue
    for (int i = 0; i < 256; i++)
    {
      analogWrite(ledPin, i);
      delay(8);
    }
    for (int i = 255; i >= 0; i--)
    {
      analogWrite(ledPin, i);
      delay(8);
    }
  }
}

// Reconnect to MQTT broker
void reconnectMQTT()
{
  while (!client.connected())
  {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("DrinkDispenser"))
    {
      Serial.println("connected");
      client.subscribe("drinkdispenser");
    }
    else
    {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

// Handle incoming MQTT messages
void handleMQTTMessage(char *topic, byte *payload, unsigned int length)
{
  if (strcmp(topic, "drinkdispenser") == 0)
  {
    int drinkNumber = (char)payload[0] - '0';
    if (drinkNumber >= 1 && drinkNumber <= drinkCount)
    {
      drinkQueue = drinkNumber - 1;
      Serial.printf("Received request to dispense drink %d\n", drinkNumber);
    }
    else
    {
      Serial.printf("Invalid drink number %d received\n", drinkNumber);
    }
  }
}

void setup()
{
  Serial.begin(115200);
  pinMode(LED_INDICATOR, OUTPUT);
  digitalWrite(LED_INDICATOR, LOW); // LEDs off initially
  pinMode(drinkQuenceButton, INPUT_PULLUP);

  // Set up LEDs and relays
  for (int i = 0; i < drinkCount; i++)
  {

    pinMode(drinkRelay[i], OUTPUT);
    digitalWrite(drinkRelay[i], HIGH); // Relays off initially
    pinMode(buttons[i], INPUT);        // Assuming buttons are connected with pull-up resistors
  }

  // Connect to WiFi (add timeout handling if needed)
  WiFi.begin(SSID, PASSWORD);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  // Set up MQTT client
  client.setServer("ec2-44-204-194-140.compute-1.amazonaws.com", 1883); // Replace with your MQTT broker address and port
  client.setCallback(handleMQTTMessage);
}

void loop()
{
  // Handle MQTT connection
  if (!client.connected())
  {
    reconnectMQTT();
  }
  client.loop();
  if (drinkQueue >= 0)
  {
    indicateLedStatus(LED_INDICATOR, In_Quence);
  }
  // Check for button presses and activate relays
  for (int i = 0; i < drinkCount; i++)
  {
    if (digitalRead(buttons[i]) == HIGH)
    {
      while (digitalRead(buttons[i]) == HIGH)
      {
        /* code */
        digitalWrite(drinkRelay[i], LOW);
        isDispensing = true;
        dispensingStartTime = millis();
        Serial.printf("Dispensing drink %d\n", i + 1);
        indicateLedStatus(LED_INDICATOR, DISPENSING_Status);
      }
      // Reset drink queue
      digitalWrite(drinkRelay[i], HIGH);
    }

    int temp;
  }
  if (digitalRead(drinkQuenceButton) == LOW)
  {
    while (digitalRead(drinkQuenceButton) == LOW)
    {
      if (drinkQueue == -1)
      {
        indicateLedStatus(LED_INDICATOR, ERROR_Status);
        Serial.println("Error: No drink in queue");
      }
      else
      {
        digitalWrite(drinkRelay[drinkQueue], HIGH);
        indicateLedStatus(LED_INDICATOR, OK_Status);
        Serial.printf("Dispensing drink %d\n", drinkQueue + 1);
        isDispensing = true;
        dispensingStartTime = millis();
      }
    }
    // Reset drink queue
    for (int i = 0; i < drinkCount; i++)
    {
      digitalWrite(drinkRelay[i], HIGH);
    }

    drinkQueue = -1;
  }

  // Check if drink is being dispensed
}
// void setup() {
//   Serial.begin(115200);
//   pinMode(23, OUTPUT);

// }
// void loop() {
//   Serial.println("Displaying Error LED");
//   indicateLedStatus(23, ERROR_Status);
//   delay(1000);
//   Serial.println("Displaying OK LED");
//   indicateLedStatus(23, OK_Status);
//   delay(1000);
//   Serial.println("Displaying Dispensing LED");
//   indicateLedStatus(23, DISPENSING_Status);
//   delay(1000);
//   Serial.println("Displaying Dispensing Timeout LED");
//   indicateLedStatus(23, DISPENSING_TIMEOUT_Status);
//   delay(1000);
//   Serial.println("Displaying In Sequence LED");
//   indicateLedStatus(23, In_Quence); indicateLedStatus(23, In_Quence); indicateLedStatus(23, In_Quence); indicateLedStatus(23, In_Quence); indicateLedStatus(23, In_Quence); indicateLedStatus(23, In_Quence);
//   delay(1000);

// }