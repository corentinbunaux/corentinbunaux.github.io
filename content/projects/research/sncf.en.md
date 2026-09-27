## Context

This project served as a capstone project at the Mines de Saint-Étienne. Its goal was to address a specific research and innovation need for SNCF. In a group of 4 students, we spent 1 month optimizing a route-generation problem specific to SNCF.

## Problem statement

To represent the various possible routes on its railway lines, SNCF uses space-time diagrams, which show how different trains use the various lines over time. One of the most persistent problems with this system is the readability of these diagrams: the more stations represented, the harder the diagram is to read. The project we were given was therefore about optimizing these diagrams.

## Proposed solution

We proposed solving this problem by rethinking how routes were generated on these diagrams. We used the topology of the railway network to optimize how routes were represented. This first solution reduced the number of stations shown on each diagram, improving readability. However, there was still room for improvement, since this representation was too far removed from what happens on the ground.

## Improved solution

We refined our approach by incorporating real traffic flows into our model, so that route generation accounted for the actual flow of trains on a given track. This new approach significantly improved the relevance of the generated routes, making them more realistic and usable, though it did reduce diagram readability somewhat. In the end, our solution still improved the situation by producing clearer, more informative diagrams, reducing the number of stations represented by a factor of 3 on average.
