# SmartSilo project

SmartSilo is a university research project from the Federal University of Rio Grande do Norte. Consists in a a hardware based application for intelligent aeration / drying instrumentation and control in grain storage silos in a IoT context.

## Project setup

### To upload the firmata algorithm to the ESP32 you need to follow this steps below 

#### Configuring the Arduino IDE for ESP32 

1° make sure that the ESP32 boart are correctly installed in the Arduino IDE 
we can do this following the tutorial in https://randomnerdtutorials.com/installing-the-esp32-board-in-arduino-ide-windows-instructions/

2° move the Boards.h to the path of Firmata in Arduino IDE overriding the original file

3° move the StandardFirmataESP32 to the path of Firmata Examples in the paths of Arduino IDE

4° move the ESP32_Servo to the path of Arduino IDE libraries 

#### Uploading the firmata to ESP32  

Now finally you can upload the Firmata to ESP. Go to File, then Examples and then Firmata, and now we can see the option 
StandardFirmataESP32. at that point charge the code into the board. 

## Running the project 

Clone this repository and execute the command 

```
npm install
```

Then finally you can start the server writing 

```
npm start 
```
