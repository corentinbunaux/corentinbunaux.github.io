## Context

As part of my second year of engineering school, I had the opportunity to complete a software engineering internship at Quimesis, a Belgian company specializing in three fields: mechanics, electronics, and computer science. I worked on a software project in the medical field.

## Improving dental segmentation algorithms

The first step of this internship was to improve the dental segmentation algorithms, which separate a tooth from its neighbors and from the gum. For this, I used the VTK library in C++, which is used to manipulate 3D images. I added a feature that lets the boundary points between a tooth and its neighbors/gum (computed mathematically) be moved, so that this boundary can be manually retraced with precision.

## Building a web application

To make it easier to integrate the dental segmentation software into dentists' everyday workflow, I built a web application in React.js, integrating the VTK library. This application allows 3D tooth images to be viewed, segmented, and exported, all from a web browser. It also includes additional visualization features. This step helped me understand how full-stack applications work.

## Setting up an optimized development environment

So that my work could be picked up by the company's developers, I set up an optimized development environment. For this, I used WebAssembly, which compiles C++ code into JavaScript. Initially, this technology helped optimize the smoothness of the application's rendering. I then set up a "hot-reload" environment that automatically reloads the application whenever a change is made to the source code, without a full C++ recompilation.
