# Self-Driving Car Project

## Overview
This project is a self-driving car simulation implemented in JavaScript without any external libraries.

## Learning
Basically the learning process happens by creating many different cars with different whigts and baises randomly,
and every time you save the best car "brain" and refresh the game, a new set of cars will be created based on the last "brain" you saved, with a defined percentage of similarity to this brain.
In this way you can explore a vest field of random whigts and baises at the same time to find the right parameters to avoid the obstacles.

## Features
- **Training Mechanism:** The learning process involves creating multiple cars with random weights and biases.
- **Saving Best Brain:** Clicking on the 💾 button stores the "brain" (The values ​​of the weights and biases) of the best-performing car in the browser's storage.
- **Iteration:** Clicking on the 🔂 button allows you to refresh the game, and generat a new set of cars with different brains, based on the last saved brain, with a defined percentage of similarity to that brain.
- **Local Storage Support:** Users can opt to save and load the "brain" from the local storage using the "save locally" and "load" buttons (📥, 📤).
- **Customization:** Users can specify the number of cars to create in each iteration (🚗), allowing for exploration of a wider range of random weights and biases.

## Usage
1. **Setup:** Clone the repository to your local machine.
2. **Open:** Open the `index.html` file in a web browser.
3. **Interaction:**
   - Click on the 💾 button once you find a successful car relative to others, to store the best-performing car's brain.
   - Click on the 🔂 button to refresh the game with new cars based on the last saved brain.
   - Adjust the number of cars (🚗) for each iteration as per your preference.
4. **Enjoy:** Watch as the self-driving cars learn and adapt based on their performance.

## Note
- Using a large number of cars may impact browser performance, while Using a low number of cars may mean that it will take a longer time to find a good car to work with.
- In a case of a bad choice of a car, a situation can happen where all the cars after it will learn this bad behavior and enter a state of incorrect learning.
- In case you don't like the best car brain you saved, and want to start the learning process again, you can use the 🗑️ button and delete the brain of the car you saved from the browser memory.
- You can load a pre trained brain file from the local storage to start with (📤). 
[Best_Car_Brain.txt](https://github.com/OmerZo/Self-Driving-Car/files/14812640/Best_Car_Brain.txt)

## Credits
- [Radu Tutorial](https://www.youtube.com/playlist?list=PLB0Tybl0UNfYoJE7ZwsBQoDIG4YN9ptyY): For the initial inspiration and codebase.
