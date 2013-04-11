A dashboard to demonstrate the figures and trajectories of different robots in Autonomy Lab at Simon Fraser University.

by Fei Zhan @ Autonomy Lab

Usage
==========================
If you have a computer running this Dashboard, and Redis server for data retrieval and data backup, you can make use of that by simply visit that webpage, and check the plots of the robots.

If you have a new robot needed to plug into the dashboard,

First, rpush the name of the robot into robotname in Redis;

Second, set your robot data into key name as your robot name in Redis, with format of robot data as "frame 100 x 20 y 30 voltage 100 current 0.1";

Last, select the corresponding robot name in the Dashboard, and see the plot and trajectory of that robot.

The trajectory is from "x" and "y" values of your robot.

Setup
==========================
Install Apache and PHP (LAMP)
--------------------------
sudo apt-get install apache2 php5-mysql libapache2-mod-php5 mysql-server

Test if Apache works
-------------------------
Open http://localhost or http://127.0.0.1 in your browser

Change the default directory of website /var/www into any you want
-------------------------
sudo gedit /etc/apache2/sites-enabled/000-default

Change DocumentRoot /var/www to DocumentRoot /home/user/public_html.

Change Directory /var/www/ to Directory /home/user/public_html/.

restart Apache: sudo service apache2 restart

Test if PHP works
-------------------------
sudo vi direcory of website/info.php

Write <?php phpinfo(); ?> into info.php

Open http://localhost/info.php in your browser

Install ROSBridge
-------------------------
sudo apt-get install ros-fuerte-rosbridge-suite

Clone source code of autolab-plot into the default directory of website
-------------------------
cd direcory of website/

sudo git clone https://github.com/FeiZhan/autolab-plot.git

Test if rosjs works
-------------------------
Open http://localhost/autolab-plot/rosjs/example/index.html in your browser

Follow the instruction on the page, and check if JavaScript console has correct results.

Enjoy the ros part of the Dashboard
------------------------
Open http://localhost/autolab-plot/test.html in your browser

With roscore, rosapi, and rosbridge running, make use of the dashboard

Use other parts of the Dashboard
-----------------------
Need Redis installed

Run Redis server

Open http://localhost/autolab-plot/index.html in your browser

Set the host as localhost

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

Suggestions
=========================
The website is still under construction. If you find bugs, or feel hard to understand the description with my poor English, please contact me [fzhan at sfu dot ca]. I apologize for any inconvience.
