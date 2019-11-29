# To upload the firmata algorithm to the ESP32 you need to follow this steps below 

## Configuring the Arduino IDE  

1° make sure that the ESP32 boart are correctly installed in the Arduino IDE 

2° move the Boards.h to the path of Firmata in Arduino IDE overriding the original file

3° move the StandardFirmataESP32 to the path of Firmata Examples in the paths of Arduino IDE

4° move the ESP32_Servo to the path of Arduino IDE libraries 

## Uploading the firmata to ESP32  

Now finally you can upload the Firmata to ESP. Go to File, then Examples and then Firmata, and now we can see the option 
StandardFirmataESP32. at that point charge the code into the board. 
