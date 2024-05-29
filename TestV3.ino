#define BLYNK_TEMPLATE_ID "TMPL3F3zo9OyC"
#define BLYNK_TEMPLATE_NAME "Smart Bell"
#define BLYNK_AUTH_TOKEN "W3mWyA-EsSgFn9r8-B_Y8okDPVJ-HuP8"

#define BLYNK_PRINT Serial

#include <ArduinoJson.h>
#include <ArduinoJson.hpp>
#include <WiFi.h>
#include <WiFiClient.h>
#include <HTTPClient.h>
#include <Adafruit_GFX.h>
#include <XTronical_ST7735.h>
#include <SPI.h>
#include <BlynkSimpleEsp32.h>
#include <time.h>  // Include time library for time synchronization

// TFT display pins
#define TFT_DC 2      // Data/command pin for TFT
#define TFT_RST 4     // Reset pin for TFT
#define TFT_CS 5      // Chip select pin for TFT

Adafruit_ST7735 tft = Adafruit_ST7735(TFT_CS, TFT_DC, TFT_RST);

char auth[] = "W3mWyA-EsSgFn9r8-B_Y8okDPVJ-HuP8";  // Blynk Auth Token
char ssid[] = "OnePlus Nord2 5G";                // WiFi SSID
char pass[] = "1234567890";                        // WiFi Password

#define RELAY_PIN 13  // GPIO pin connected to relay IN

bool relayState = false;       // Variable to hold relay state (false = off, true = on)
unsigned long relayOnTime = 0; // Variable to store the time when the relay was turned on
const unsigned long relayDuration = 5000; // Relay duration in milliseconds (5 seconds)

const char* apiUrl = "https://vedantk3.pythonanywhere.com/api/today";

// Time zone offset in seconds (IST is UTC+5:30, or 19800 seconds)
const long gmtOffset_sec = 5 * 3600 + 1800;
const int daylightOffset_sec = 0;

void setup() {
  Serial.begin(9600);
  Blynk.begin(auth, ssid, pass, "blynk.cloud", 80);

  pinMode(RELAY_PIN, OUTPUT); // Set relay pin as output

  tft.init();            // Initialize TFT display
  tft.setRotation(2);    // Set display rotation (adjust as needed)

  // Set up initial display
  tft.fillScreen(ST7735_BLACK);
  tft.setTextSize(1);
  tft.setTextColor(ST7735_WHITE);
  tft.setCursor(10, 50);
  tft.println("Connecting...");

  // Wait for WiFi connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  tft.fillScreen(ST7735_BLACK);
  tft.setCursor(10, 50);
  tft.println("WiFi Connected");

  // Initialize NTP
  configTime(gmtOffset_sec, daylightOffset_sec, "pool.ntp.org");

  // Allow some time for synchronization
  delay(2000);

  fetchAndDisplaySchedule(); // Fetch and display the schedule
}

void loop() {
  Blynk.run();
  updateRelayState(); // Check and update relay state based on the time
  displayCurrentTime(); // Update display with the current time
  delay(1000); // Adjust delay as needed
}

// Function to fetch and display the schedule
void fetchAndDisplaySchedule() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(apiUrl);
    int httpResponseCode = http.GET();

    if (httpResponseCode > 0) {
      String payload = http.getString();
      Serial.println(payload);

      // Parse JSON
      DynamicJsonDocument doc(2048);
      deserializeJson(doc, payload);

      // Display project name
      tft.fillScreen(ST7735_BLACK);
      tft.setTextSize(1);
      tft.setTextColor(ST7735_WHITE);
      tft.setCursor(10, 10);
      tft.println("Smart Bell");

      // Display schedule
      JsonArray schedule = doc["schedule"];
      int y = 30; // Start a bit higher to fit more rows
      tft.setTextSize(1);
      tft.setTextColor(ST7735_GREEN);

      for (JsonObject lecture : schedule) {
        tft.setCursor(0, y);
        tft.print(lecture["start_time"].as<const char*>());
        tft.print(" - ");
        tft.println(lecture["lecture"].as<const char*>());
        y += 10; // Decreased spacing to fit more rows
        if (y > 110) { // Limit rows to fit on the screen
          break;
        }
      }

      // Display next lecture
      tft.setTextSize(1);
      tft.setTextColor(ST7735_YELLOW);
      tft.setCursor(10, 130); // Adjust position to fit on the screen

      // Determine and display the next lecture
      if (schedule.size() > 0) {
        // Get the current time
        time_t now = time(nullptr);
        struct tm *timeinfo = localtime(&now);
        char currentTime[6];
        strftime(currentTime, sizeof(currentTime), "%H:%M", timeinfo);
        
        // Find the next lecture
        bool nextLectureFound = false;
        for (JsonObject lecture : schedule) {
          const char* start_time = lecture["start_time"];
          if (strcmp(currentTime, start_time) < 0) {
            tft.println("Next Lecture:");
            tft.setCursor(10, 140);
            tft.print(start_time);
            tft.print(" - ");
            tft.println(lecture["lecture"].as<const char*>());
            nextLectureFound = true;
            break;
          }
        }
        if (!nextLectureFound) {
          tft.println("Next Lecture:");
          tft.setCursor(10, 140);
          tft.println("End");
        }
      } else {
        tft.setCursor(10, 140);
        tft.println("End");
      }

    } else {
      Serial.print("Error on HTTP request: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }
}

// Function to update the relay state
void updateRelayState() {
  time_t now = time(nullptr);
  struct tm *timeinfo = localtime(&now);
  char currentTime[6];
  strftime(currentTime, sizeof(currentTime), "%H:%M", timeinfo);

  // Check if the relay needs to be turned on
  if (strcmp(currentTime, "10:30") == 0 || strcmp(currentTime, "11:30") == 0 ||
      strcmp(currentTime, "12:30") == 0 || strcmp(currentTime, "13:00") == 0 ||
      strcmp(currentTime, "14:00") == 0 || strcmp(currentTime, "15:00") == 0 ||
      strcmp(currentTime, "15:30") == 0 || strcmp(currentTime, "16:30") == 0 ||
      strcmp(currentTime, "17:30") == 0) {
    if (!relayState) { // If the relay is not already on
      digitalWrite(RELAY_PIN, HIGH);
      relayState = true;
      relayOnTime = millis(); // Store the current time
    }
  }

  // Check if the relay needs to be turned off
  if (relayState && (millis() - relayOnTime >= relayDuration)) {
    digitalWrite(RELAY_PIN, LOW);
    relayState = false;
  }
}

// Function to display the current time on the TFT display
void displayCurrentTime() {
  // Define the area where the time will be displayed
  int timeX = 10;
  int timeY = 150;
  int timeWidth = 80;  // Width of the area to be cleared
  int timeHeight = 10; // Height of the area to be cleared

  // Clear the area where the time will be displayed
  tft.fillRect(timeX, timeY, timeWidth, timeHeight, ST7735_BLACK);

  tft.setTextSize(1);
  tft.setTextColor(ST7735_WHITE);
  tft.setCursor(timeX, timeY);

  // Get the current time
  time_t now = time(nullptr);
  struct tm *timeinfo = localtime(&now);
  char currentTime[9];
  strftime(currentTime, sizeof(currentTime), "%H:%M:%S", timeinfo);
  tft.println(currentTime);
}
