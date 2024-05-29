#define BLYNK_TEMPLATE_ID "TMPL3F3zo9OyC"
#define BLYNK_TEMPLATE_NAME "Smart Bell"
#define BLYNK_AUTH_TOKEN "W3mWyA-EsSgFn9r8-B_Y8okDPVJ-HuP8"

#include <WiFi.h>
#include <WiFiClient.h>
#include <Adafruit_GFX.h>
#include <XTronical_ST7735.h>
#include <SPI.h>
#include <BlynkSimpleEsp32.h>

#define BLYNK_PRINT Serial

// TFT display pins
#define TFT_DC 2      // Data/command pin for TFT
#define TFT_RST 4     // Reset pin for TFT
#define TFT_CS 5      // Chip select pin for TFT

Adafruit_ST7735 tft = Adafruit_ST7735(TFT_CS, TFT_DC, TFT_RST);

char auth[] = "W3mWyA-EsSgFn9r8-B_Y8okDPVJ-HuP8";  // Blynk Auth Token
char ssid[] = "Bifrost Fiber 2_4G";                // WiFi SSID
char pass[] = "vk@bifrost";                        // WiFi Password

#define RELAY_PIN 13  // GPIO pin connected to relay IN
bool relayState = false;  // Variable to hold relay state (false = off, true = on)
uint8_t prevState = LOW;

void setup() {
  Serial.begin(9600);
  Blynk.begin(auth, ssid, pass, "blynk.cloud", 80);

  pinMode(RELAY_PIN, OUTPUT);  // Set relay pin as output

  tft.init();            // Initialize TFT display
  tft.setRotation(2);    // Set display rotation (adjust as needed)

  // Set up initial display
  tft.fillScreen(ST7735_BLACK);
  tft.setTextSize(2);
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
}

void loop() {
  Blynk.run();
  uint8_t state = digitalRead(RELAY_PIN);
  if (prevState != state) {
    prevState = state;
    Serial.print("PIN status: ");
    if (state == HIGH) {
      Serial.println("HIGH");
      relayState = true;
    } else {
      Serial.println("LOW");
      relayState = false;
    }
  }
  delay(100);
  updateTFTDisplay();  // Update TFT display based on relay state
}

// BLYNK_WRITE(13) {  // Blynk virtual pin V1 handler for relay control
//   int pinValue = param.asInt();  // Read value from virtual pin V1

//   if (pinValue == HIGH) {
//     // Turn ON relay
//     digitalWrite(RELAY_PIN, HIGH);
//     Serial.println("Relay is ON");
//     relayState = true;
//   } else {
//     // Turn OFF relay
//     digitalWrite(RELAY_PIN, LOW);
//     Serial.println("Relay is OFF");
//     relayState = false;
//   }

//   updateTFTDisplay();  // Update TFT display based on relay state
// }

void updateTFTDisplay() {
  tft.fillScreen(ST7735_BLACK);
  tft.setTextSize(2);
  tft.setTextColor(ST7735_WHITE);
  tft.setCursor(10, 50);

  if (relayState) {
    tft.println("Relay On");
  } else {
    tft.println("Relay Off");
  }

  delay(1000);  // Adjust delay as needed
}
