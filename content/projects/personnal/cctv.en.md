## Context

As a personal project alongside my final-year coursework at Mines de Saint-Étienne, I set out to build an online-accessible video surveillance system.

## Building the hardware setup

I designed and assembled the hardware components needed for the system, mainly using Arduino and ESP32 boards. The core idea was to have a central Arduino board manage all the information sent to it. Various sensors were connected to collect environmental data (light, motion, sound). This central board then communicated with the other ESP32 boards over Bluetooth to retrieve the captured video feeds or photos. In particular, I used a PIR sensor to detect when to take a photo (in the event of an intrusion at home).

## Building an API

I then built a RESTful API in Django to let the application communicate with the surveillance system. This API handled user requests such as authentication, retrieving video feeds, and managing security settings. All requests were made autonomously by the Arduino board, to store the photos taken or the data collected.

## Building a user interface

Finally, I built a user interface in React to let users interact with the surveillance system. This interface displayed the photos taken in an online viewer and provided an overview of the data collected by the sensors.
