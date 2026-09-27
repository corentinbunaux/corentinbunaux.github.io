## Context

As part of my engineering degree, I had the opportunity to work on building a minesweeper game, as a companion project to a course on Java development.

## Classic mode

First, I implemented the logic of the traditional game, along with a simple graphical interface using the Swing library. The point of the course was mainly to focus on the app's backend. Several grids of different difficulty levels were generated randomly, each with a fixed number of mines. Flood-fill propagation when clicking an empty cell was enabled.

## Multiplayer mode

Next, I added a multiplayer feature, letting several users connect and play together. I used sockets to handle communication between clients and the server, and had to rethink parts of the game logic to handle interactions between players. Flood-fill propagation on an empty cell was disabled this time, since the multiplayer rules differed from the classic game. In this mode, each click was worth 1 point, and the goal was to score as many points as possible on a grid without clicking a mine (which would eliminate the player).
