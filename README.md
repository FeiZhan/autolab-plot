A website to demonstrate the figures and trajectories of different robots in Autonomy Lab at Simon Fraser University.

by Fei Zhan@Autolab

License
==========================
This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License version 3 as
published by the Free Software Foundation.
 
This program is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
General Public License for more details.

A copy of the license is included with the sourcecode in the file
'COPYING". Copying and redistribution is permitted only under the
terms of the license.

Usage
==========================
data generator

Generate various data in order to facilitate experimenting and testing robots.
It can insert different data into Redis in our lab with specified keys.
You can change the host and port of Redis, frame rate of setting, key and value of your own data.
If wanting random data or clear existing data, you can use the codes listed in the webpage. Simply copy and paste them into the value zone of your key, and press submit.

data parser
----------------
Old version of the data parser based on C++ and GNUPlot.
Useless except someone loves GNUPlot.

static plot
----------------
Draw a static plot of data from Redis.
If you organize your data into a string separated with space, and set into Redis, you can plot that with this page by simply input the key and press submit.

a simple dynamic plot
----------------
Really simple. Not effective.

dynamic plot for all robots
----------------
Dynamic plots and trajectories of robots with data retrieved from Redis.
I suppose the names of robots as "cb18", "cb01", and "pioneer01", and the key of the data from Redis is the name. I think I should make it configurable later on.
The format of the data is "time x y voltage current".
If you use "data generator" (the first link in the front page), put "cb18" (without quotation mark) as key, and "@@@random_robot" (without quotation mark) as value, you can see the figure and trajectory is moving.

dynamic plot for one robot
----------------
Similar with previous, but the data are not from Redis.
So you can use the previous one instead.

trajectory plot
----------------
Two different versions of trajectory plots with data retrieved from Redis.
The format of data is the same with the one for "dynamic plot for all robots", but it only works for one robot (the first one in the data stream).

google map
---------------
Trajectory plots on google map with data retrieved from Redis.
You can see energy map, time map, and colorful trajectory representing inner state of the robot. You can follow any of the robots. If you click on a grid in energy map or time map, you can see the data for that grid.
The data for each robot is from Redis. The key is the name of the robot (only cb18, cb01, pi01 available). The value follows the format "time x y voltage current" (without quotation mark).
If you use "data generator" (the first link in the front page), put "cb18" (without quotation mark) as key, and "@@@field_robot" (without quotation mark, note not @@@random_robot) as value, you can see the trajectory on the google map is moving.

Suggestion
=========================
The website is still under construction. If you find bugs, or feel hard to understand the description with my poor English, please contact me [fzhan at sfu dot ca]. I apologize for any inconvience.
The website is not open enough. If you don't like data representing voltage or current, you can put your own data there, but the title won't change. If you don't like the names of the robots, you can also change the program.
