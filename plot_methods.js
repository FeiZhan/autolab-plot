var HOST = "192.168.1.120", PORT = "6379", SECOND_HOST = "localhost";
var LAB = [49.276802, -122.914913], LABEL = ["frame", "x", "y", "voltage", "current"];
//var ROBOT_NAME = ["cb18", "cb01", "pi01", "hu01"];
/**
 * @class create a php communication
 */
var phpComm = function ()
{
	/**
	 * received string
	 * @public
	 */
	this.receive = "";
	/**
	 * PHP file name to be called
	 * @public
	 */
	this.file = "comp_methods";
	/**
	 * cmd to be transmitted to PHP
	 * @public
	 */
	this.cmd = "";
	/**
	 * the placeholder of debug info
	 * @public
	 */
	this.debug = "debug";
	/**
	 * the placeholder of receive info
	 * @public
	 */
	this.rec_text = "receive";
	/**
	 * the placeholder of send info
	 * @public
	 */
	this.send_text = "send";
	/**
	 * host name
	 * @public
	 */
	this.host = "";
	/**
	 * port name
	 * @public
	 */
	this.port = "";
	/**
	 * server object
	 * @public
	 */
	this.server;
	/**
	 * send and receive time in order to test the delay of the server
	 * @private
	 */
	var send_time = [0], rec_time = 0;
	var self = this;
	this.getRecTime = function ()
	{
		return rec_time;
	}
	/**
	 * how long since the latest time of receiving data, in order to test if the server works
	 * @public
	 */
	this.getUnrecTime = function ()
	{
		var now = new Date().getTime();
		return now - rec_time;
	}
	/**
	 * get the delay of the server
	 * @public
	 */
	this.getDelay = function ()
	{
		if (send_time.length > 0 && rec_time > 0)
		{
			return rec_time - send_time[0];
		} else
		{
			return 0;
		}
	}
	/**
	 * communicate with PHP via XMLHttpRequest
	 * @public
	 */
	this.commPhp = function ()
	{
		var xmlhttp;
		if (window.XMLHttpRequest)
		{
			// code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp = new XMLHttpRequest();
		}
		else
		{
			// code for IE6, IE5
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
		xmlhttp.onreadystatechange = function ()
		{
			// receive data
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
			{
				// record the receiving time
				rec_time = new Date().getTime();
				// remove old sending time
				if (send_time.length > 1)
				{
					send_time.shift();
				}
				// obtain receiving data
				self.receive = xmlhttp.responseText;
				document.getElementById(self.rec_text).innerHTML = "receive: " + xmlhttp.responseText;
			}
		}
		// if the server is assigned, send the host and port to PHP
		if (typeof self.server != "undefined")
		{
			self.cmd += "&host=" + self.server.host + "&port=" + self.server.port;
		} else
		{
			// if the public values are assigned, send them to PHP
			if (typeof self.host != "undefined" && "" != self.host)
			{
				self.cmd += "&host=" + self.host;
			}
			if (typeof self.port != "undefined" && "" != self.port)
			{
				self.cmd += "&port=" + self.port;
			}
		}
		// remove the beginning &
		if ("&" == self.cmd.charAt(0))
		{
			self.cmd = self.cmd.substr(1);
		}
		xmlhttp.open("GET", self.file + ".php?" + self.cmd, true);
		document.getElementById(self.send_text).innerHTML = "send: " + self.file + ".php?" + self.cmd;
		xmlhttp.send();
		// record the sending time
		send_time.push(new Date().getTime());
	}
}
/**
 * @class get all the names of robots
 */
var robotName = function ()
{
	this.canvas = "robotName";
	/**
	 * create a php communication
	 * @public
	 */
	this.php_comm = new phpComm();
	/**
	 * the placeholder of debug info
	 * @public
	 */
	this.debug = "debug";
	/**
	 * the timeout between two communications (ms)
	 * @public
	 */
	this.timeout = 300;
	var name = new Array();
	var self = this;
	/**
	 * the amount of robot names
	 * @public
	 */
	this.count = function ()
	{
		return name.length;
	}
	/**
	 * get robot names
	 * @public
	 */
	this.getNames = function ()
	{
		return name;
	}
	/**
	 * update robot names periodically
	 * @public
	 */
	this.update = function ()
	{
		self.php_comm.cmd = "method=getNames";
		self.php_comm.commPhp();
		var tmp = self.php_comm.receive.split(" ");
		for (var i in tmp)
		{
			// invalid robot name
			if (" " == tmp[i] || "" == tmp[i])
				continue;
			var flag = false;
			for (var j in name)
			{
				// duplicate
				if (tmp[i] == name[j])
				{
					flag = true;
					break;
				}
			}
			if (false == flag)
			{
				name.push(tmp[i]);
			}
		}
		setTimeout(self.update, self.timeout);
	}
	this.show = function ()
	{
		var html = 	'<ul align="center">';
		for (var i in name)
		{
			html +=		'<li style="display:inline;margin:3%;">' +
							'<a href="?robot=' + name[i] + '">' + name[i] + '</a>' +
						'</li>';
		}
		html +=		'</ul>';
		document.getElementById(self.canvas).innerHTML = html;
		//self.update();
		setTimeout(self.show, self.timeout);
	}
}
/**
 * @class get all the data of robots
 */
var robotData = function ()
{
	/**
	 * the placeholder of debug info
	 * @public
	 */
	this.debug = "debug";
	/**
	 * create a php communication
	 * @public
	 */
	this.php_comm = new phpComm();
	/**
	 * the timeout between two communications (ms)
	 * @public
	 */
	this.timeout = 300;
	/**
	 * robot name from robotName
	 * @public
	 */
	this.rn;
	var robot_data = new Object();
	var self = this;
	/**
	 * get the data of all robots
	 * @public
	 */
	this.getAllRobots = function ()
	{
		return robot_data;
	}
	/**
	 * get the data of a specified robot
	 * @public
	 * @param robot the name of the robot
	 */
	this.getRobot = function (robot)
	{
		if (robot in robot_data)
		{
			return robot_data[robot];
		} else
		{
			return undefined;
		}
	}
	/**
	 * get the data of a specified robot and a specified key
	 * @public
	 * @param robot the name of the robot
	 * @param data the specified data
	 */
	this.getData = function (robot, data)
	{
		if (! (robot in robot_data) || ! (data in robot_data[robot]))
		{
			return NaN;
		}
		return robot_data[robot][data];
	}
	/**
	 * update robot data periodically
	 * @public
	 */
	this.update = function ()
	{
		// if robot name is not defined, define one
		if (typeof self.rn == "undefined")
		{
			self.rn = new robotName();
			self.rn.update();
		}
		var name = self.rn.getNames();
		self.php_comm.cmd = "method=getRobotData";
		self.php_comm.commPhp();
		var robot = self.php_comm.receive.split(", ");
		// for each robot
		for (var i in robot)
		{
			// more robots than names, ignore the rest robots
			if (name.length <= i)
			{
				break;
			}
			var tmp = robot[i].split(" ");
			var robot_tmp = new Object();
			// for each value
			for (var j = 0; j < tmp.length; j += 2)
			{
				robot_tmp[tmp[j]] = parseFloat(tmp[j + 1]);
			}
			robot_data[name[i]] = robot_tmp;
		}
		setTimeout(self.update, self.timeout);
	}
}
/**
 * @class generate a lab logo
 */
var labLogo = function ()
{
	/**
	 * the place to hold this object
	 * @public
	 */
	this.canvas = "labLogo";
	/**
	 * @public
	 */
	this.border = 0;
	/**
	 * @public
	 */
	this.width = "100%";
	/**
	 * @public
	 */
	this.align = "center";
	/**
	 * the width percentage of the logo
	 * @public
	 */
	this.logo_width = "30%";
	/**
	 * the path and file name of the logo
	 * @public
	 */
	this.src = "logo.png";
	/**
	 * the title of this page
	 * @public
	 */
	this.title = "Autolab Demonstration";
	/**
	 * the placeholder of debug info
	 * @public
	 */
	this.debug = "debug";
	/**
	 * if we need subheading
	 * @public
	 */
	this.subheading = 1;
	var self = this;
	/**
	 * show the object
	 * @public
	 */
	this.show = function ()
	{
		var html = 
			'<table border="' + self.border + '" width="' + self.width + '" align="' + self.align + '">' +
				'<tr>' +
					'<td width="' + self.logo_width + '"><img src="' + self.src + '" alt="logo"></td>' +
					'<td><h1 align="' + self.align + '">' + self.title + '</h1></td>' +
				'</tr>' +
			'</table>';
		if (self.subheading)
		{
			html += 
				'<table border="1" align="' + self.align + '" width="' + self.width + '">' +
					'<tr align="' + self.align + '">' +
						//@todo change the following links into suitable ones.
						'<td><a href="./index.html">index</a></td>' +
						'<td><a href="./debugger.html">debugger</a></td>' +
						'<td><a href="./example.html">example</a></td>' +
						'<td><a href="./test.html">test</a></td>' +
						'<td><a href="./status.html">status</a></td>' +
						'<td><a href="./data_generator.html">data generator</a></td>' +
						'<td><a href="./dataparser/index.html">data parser</a></td>' +
						'<td><a href="./static.html">static plot</a></td>' +
						'<td><a href="./real-time.html">a simple dynamic plot</a></td>' +
						'<td><a href="./dynamic-all.html">dynamic plot for all robots</a></td>' +
						'<td><a href="./dynamic-robot.html">dynamic plot for one robot</a></td>' +
						'<td><a href="./trajectory.html">trajectory plot</a></td>' +
						'<td><a href="./gmap.html">google map</a></td>' +
					'</tr>' +
				'</table>';
		}
		document.getElementById(self.canvas).innerHTML = html;
	}
}
/**
 * @class generate a redis server control
 */
var redisServer = function ()
{
	/**
	 * the place to hold this object
	 * @public
	 */
	this.canvas = "redisServer";
	/**
	 * @public
	 */
	this.border = 0;
	/**
	 * @public
	 */
	this.align = "center";
	/**
	 * the default value of host
	 * @public
	 */
	this.host = HOST;
	/**
	 * the default value of port
	 * @public
	 */
	this.port = PORT;
	/**
	 * the default value of rate
	 * @public
	 */
	this.rate = 1000;
	/**
	 * the placeholder of debug info
	 * @public
	 */
	this.debug = "debug";
	/**
	 * if to put it horizontally
	 * @public
	 */
	this.horizontal = 1;
	var self = this;
	/**
	 * show this object
	 * @public
	 */
	this.show = function ()
	{
		var html =
			'<table border="' + self.border + '" align="' + self.align + '">';
		if (self.horizontal)
		{
			html +=
				'<tr align="' + self.align + '">' +
					'<form>' +
						'<td>host<input type="text" name="host" value="' + self.host + '" /></td>' +
						'<td>port<input type="text" name="port" value="' + self.port + '" /></td>' +
						'<td>frame rate(ms^{-1})<input type="text" name="rate" value="' + self.rate + '" /></td>' +
						'<td><input type="button" value="submit" /></td>' +
					'</form>' +
				'</tr>';
		} else
		{
			html +=
				'<form>' +
					'<tr align="' + self.align + '">' +
						'<td>host<input type="text" name="host" value="' + self.host + '" /></td>' +
					'</tr>' +
					'<tr align="' + self.align + '">' +
						'<td>port<input type="text" name="port" value="' + self.port + '" /></td>' +
					'</tr>' +
					'<tr align="' + self.align + '">' +
						'<td>frame rate(ms^{-1})<input type="text" name="rate" value="' + self.rate + '" /></td>' +
					'</tr>' +
					'<tr align="' + self.align + '">' +
						'<td><input type="button" value="submit" /></td>' +
					'</tr>' +
				'</form>';
		}
		html += '</table>';
		document.getElementById(self.canvas).innerHTML = html;
		/**
		 * assign callback function to submit button
		 */
		document.getElementById(self.canvas).getElementsByTagName("input")[3].onclick = function ()
		{
			self.host = this.form.host.value;
			self.port = this.form.port.value;
			self.rate = this.form.rate.value;
		}
	}
}
/**
 * @class generate a table of server status
 */
var serverStatus = function ()
{
	/**
	 * the place to hold this object
	 * @public
	 */
	this.canvas = "serverStatus";
	/**
	 * @public
	 */
	this.border = 1;
	/**
	 * @public
	 */
	this.width = "60%";
	/**
	 * @public
	 */
	this.align = "center";
	/**
	 * the placeholder of debug info
	 * @public
	 */
	this.debug = "debug";
	/**
	 * the max number of status elements
	 * @public
	 */
	this.max_count = 1000;
	/**
	 * the fixed number of status elements
	 * @public
	 */
	this.fix_count = 10;
	/**
	 * create a php communication
	 * @public
	 */
	this.php_comm = new phpComm();
	/**
	 * the timeout between two communications (ms)
	 * @public
	 */
	this.timeout = 300;
	/**
	 * the status names and count
	 * @private
	 */
	var self = this;
	/**
	 * update the info periodically
	 * @private
	 */
	var update = function ()
	{
		var count = 0;
		var db_status = new Array();
		self.php_comm.cmd = "method=status";
		self.php_comm.commPhp();
		var data = self.php_comm.receive.split(", ");
		// set the delay value
		document.getElementById(self.canvas).getElementsByTagName("p")[0].innerHTML = "delay (ms)";
		document.getElementById(self.canvas).getElementsByTagName("p")[1].innerHTML = self.php_comm.getDelay();
		// if the server does not respond
		if (self.php_comm.getUnrecTime() > 1000)
		{
			var p = document.getElementById(self.canvas).getElementsByTagName("p");
			for (var i = 3; i < p.length; i += 2)
			{
				p[i].innerHTML = "-";
			}
		} else
		{
			for (var i = 0; i < data.length; ++ i)
			{
				// reach max count or fix count if fix is set
				if (count > self.max_count || (self.fix_count > 0 && count >= self.fix_count - 1))
				{
					break;
				}
				var key_value = data[i].split(" ");
				if (key_value[0] == "")
				{
					continue;
				}
				var flag = false;
				// search for each key
				//for (var j = 0; j < self.db_status.length; ++ j)
				//{
					//if (key_value[0] == self.db_status[j])
					//{
						//var key_array = document.getElementsByTagName("p");
						//for (var i = 0; i < key_array.length; ++ i)
						//{
							//if (key_array[i].innerHTML == key_value[0])
							//{
								//key_array[i+1].innerHTML = key_value[1];
								//break;
							//}
						//}
						//flag = true;
						//break;
					//}
				//}
				if (false == flag)
				{
					++ count;
					db_status.push(key_value[0]);
					document.getElementById(self.canvas).getElementsByTagName("p")[count * 2].innerHTML = key_value[0];
					document.getElementById(self.canvas).getElementsByTagName("p")[count * 2 + 1].innerHTML = key_value[1];
				}
			}
		}
		setTimeout(update, self.timeout);
	}
	/**
	 * show this object and start the update
	 * @public
	 */
	this.show = function ()
	{
		var html = '<table border="' + self.border + '" width="' + self.width + '" align="' + self.align + '">';
		for (var i = 0; i < self.fix_count; ++ i)
		{
			html += '<tr align="' + self.align + '">' +
						'<td><p></p></td>' +
						'<td><p></p></td>' +
					'</tr>';
		}
		html += '</table>';
		document.getElementById(self.canvas).innerHTML = html;
		update();
	}
}
/**
 * @class generate the control of setting keys in the Redis
 */
var keySetter = function ()
{
	/**
	 * the place to hold this object
	 * @public
	 */
	this.canvas = "keySetter";
	/**
	 * @public
	 */
	this.border = 1;
	/**
	 * @public
	 */
	this.align = "center";
	/**
	 * if with the heading
	 * @public
	 */
	this.heading = 1;
	/**
	 * initial keys
	 * @public
	 */
	this.init_key = ["cb18", "cb01", "last_time", "last_time_frame"];
	/**
	 * initial values
	 * @public
	 */
	this.init_value = ["@@@field_robot", "@@@random_robot", "@@@clear", "@@@clear"];
	/**
	 * initial amout of lines
	 * @public
	 */
	this.init_num = 8;
	/**
	 * default string of new key
	 * @public
	 */
	this.new_key = "";
	/**
	 * default value of new key
	 * @public
	 */
	this.new_value = "";
	/**
	 * if generate the explanations
	 * @public
	 */
	this.meaning = 0;
	/**
	 * the placeholder of debug info
	 * @public
	 */
	this.debug = "debug";
	/**
	 * the timeout between two settings (ms)
	 * @public
	 */
	this.timeout = 1000;
	/**
	 * create a php communication
	 * @public
	 */
	this.php_comm = new phpComm();
	var key = new Array(), value = new Array(), pause = false;
	var self = this;
	/**
	 * the callback of submit buttion
	 * @private
	 * @bug new buttons do not work
	 */
	var submitKey = function ()
	{
		var flag = false;
		for (var i in key)
		{
			// if key exists
			if (key[i] == this.form.key.value)
			{
				value[i] = this.form.value.value;
				flag = true;
				break;
			}
		}
		// if key does not exist
		if (false == flag)
		{
			key.push(this.form.key.value);
			value[key.length - 1] = this.form.value.value;
		}
//document.getElementById(self.debug).innerHTML = "debug: " + this.form.key.value + this.form.value.value;
	}
	/**
	 * add callback function to every submit button (the amount of those is not reliable)
	 * @private
	 */
	var addSubmitCallback = function ()
	{
		var button_array = document.getElementById(self.canvas).getElementsByTagName("input");
		for (var i in button_array)
		{
			// ignore addKey and pause buttons
			if (i > 1 && "button" == button_array[i].type)
			{
				button_array[i].onclick = submitKey;
			}
		}
	}
	/**
	 * add callback function to addKey
	 * @private
	 */
	var addKey = function ()
	{
		var html =
			'<tr align="' + self.align + '">' +
				'<form>' +
					'<td><input type="text" name="key" value="' + self.new_key + '" /></td>' +
					'<td><input type="text" name="value" value="' + self.new_value + '" size="100%" /></td>' +
					'<td><input type="button" value="submit" /></td>' +
				'</form>' +
			'</tr>';
		document.getElementById(self.canvas).getElementsByTagName("table")[0].innerHTML += html;
		// the callback function has to be assigned again
		document.getElementById(self.canvas).getElementsByTagName("input")[0].onclick = addKey;
		// add callback to pause
		document.getElementById(self.canvas).getElementsByTagName("input")[1].onclick = function ()
		{
			pause = (0 == pause);
		}
		addSubmitCallback();
//document.getElementById(self.debug).innerHTML = "debug: " + document.getElementById(self.canvas).getElementsByTagName("tr").length;
	}
	/**
	 * send data periodically
	 * @private
	 */
	var update = function ()
	{
		var data = "";
		if (! pause)
		{
			for (var i = 0; i < key.length; ++ i)
			{
				if (typeof key[i] != "undefined" && key[i] != null && key[i] != "")
				{
					data += "&key" + i + "=" + key[i] + "&value" + i + "=" + value[i];
				}
			}
		}
		self.php_comm.cmd = data + "&method=generateData";
		self.php_comm.commPhp();
		setTimeout(update, self.timeout);
	}
	/**
	 * show this object, add callbacks, and start to send data periodically
	 * @public
	 */
	this.show = function ()
	{
		var html =
			'<table border="' + self.border + '" align="' + self.align + '">';
		if (self.heading)
		{
			html +=
				'<tr align="' + self.align + '">' +
					'<td>key<input type="button" value="add key" /></td>' +
					'<td width="70%">value<input type="button" value="pause" /></td>' +
					'<td>submit</td>' +
				'</tr>';
		}
		for (var i = 0; i < self.init_num; ++ i)
		{
			var key_tmp = (self.init_key.length > i) ? self.init_key[i] : "";
			var value_tmp = (self.init_value.length > i) ? self.init_value[i] : "";
			html +=
					'<tr align="' + self.align + '">' +
						'<form>' +
							'<td><input type="text" name="key" value="' + key_tmp + '" /></td>' +
							'<td><input type="text" name="value" value="' + value_tmp + '" size="100%" /></td>' +
							'<td><input type="button" value="submit" /></td>' +
						'</form>' +
					'</tr>';
		}
		html += '</table>';
		if (self.meaning)
		{
			html += 
				'<br />' +
				'<table border="1" align="center" width="80%">' +
					'<tr align="center">' +
						'<td width="20%">code</td>' +
						'<td width="80%">meaning</td>' +
					'</tr>' +
					'<tr align="center">' +
						'<td>@@@clear</td>' +
						'<td>Set to void</td>' +
					'</tr>' +
					'<tr align="center">' +
						'<td>@@@random_value</td>' +
						'<td>A random number</td>' +
					'</tr>' +
					'<tr align="center">' +
						'<td>@@@random_robot</td>' +
						'<td>A set of random numbers describing a robot as "time x y voltage current". The boundary of x and y is [0, 100]</td>' +
					'</tr>' +
					'<tr align="center">' +
						'<td>@@@field_robot</td>' +
						'<td>A set of random numbers describing a robot as "time x y voltage current", with unconstrained x and y representing a field robot moving out of the lab.</td>' +
					'</tr>' +
					'<tr align="center">' +
						'<td>@@@-</td>' +
						'<td>A set of random numbers describing a camera return values as "time robotID x y voltage current".</td>' +
					'</tr>' +
				'</table>';
		}
		document.getElementById(self.canvas).innerHTML = html;
		// add callback to addkey
		document.getElementById(self.canvas).getElementsByTagName("input")[0].onclick = addKey;
		// add callback to pause
		document.getElementById(self.canvas).getElementsByTagName("input")[1].onclick = function ()
		{
			pause = (0 == pause);
		}
		// add callback to each submit button
		addSubmitCallback();
		update();
	}
}
/**
 * @class a static plot of some values from Redis, or historical data of robots
 */
var staticPlot = function ()
{
	/**
	 * the place to hold this object
	 * @public
	 */
	this.canvas = "staticPlot";
	/**
	 * the place to hold the plot
	 * @public
	 */
	this.placeholder = "sp_placeholder";
	/**
	 * @public
	 */
	this.width = "95%";
	/**
	 * @public
	 */
	this.height = "300px";
	/**
	 * @public
	 */
	this.align = "center";
	/**
	 * default key value
	 * @public
	 */
	this.key = "";
	/**
	 * the placeholder of debug info
	 * @public
	 */
	this.debug = "debug";
	/**
	 * the timeout between two updates (ms)
	 * @public
	 */
	this.timeout = 300;
	/**
	 * max points of a curve in the plot
	 * @public
	 */
	this.max_points = 200;
	/**
	 * create a php communication
	 * @public
	 */
	this.php_comm = new phpComm();
	/**
	 * create a safe-range
	 * @public
	 */
	this.safe_range_array = new Array();
	this.threshold = {below: 2, color: "black"};
	this.robot = "cb18";
	/**
	 * options for the plot
	 * @public
	 */
	this.option = {
		series: {
			lines: {show: true},
			points: {show: true}
		},
		crosshair: {mode: "x"},
		//selection: {mode: "xy"},
		zoom: {interactive: true},
		pan: {interactive: true},
		//@bug
		//xaxis: {mode: "time", minTickSize: [1, "hour"], min: (new Date(2013, 4, 1)).getTime(), min: (new Date(2013, 5, 1)).getTime(), twelveHourClock: true},
		legend: { position: "nw" },
		grid: {
			show: true,
			hoverable: true,
			autoHighlight: false
	}};
	var update_time = 0, plot, dataset, hover_pos, updateLegendTimeout, zoom_range = new Array();
	var self = this;
	/**
	 * plot periodically
	 * @private
	 */
	var update = function()
	{
		var time_tmp = self.php_comm.getRecTime();
		// if we have new data from Redis
		if (time_tmp != update_time)
		{
			update_time = time_tmp;
			var rec = self.php_comm.receive;
			dataset = new Array();
			var tmp = rec.split(", ");
			// if there is only one string of data
			if (tmp.length <= 1 || (tmp.length == 2 && tmp[1].length <= 1))
			{
				var tmp2 = tmp[0].split(" "), data2 = new Array();
				for (var i in tmp2)
				{
					data2.push([i, tmp2[i]]);
				}
				dataset.push({label: self.key + " = 0.00", data: data2, threshold: self.threshold});
				$.plot("#" + self.placeholder, dataset, self.option);
			} else // multi strings of data
			{
				// obtain the amount of curves
				var tmp2 = tmp[0].split(" ");
				for (var i = 4; i + 1 < tmp2.length; i += 2)
				{
					dataset.push({label: tmp2[i] + " = 0.00", data: new Array(), yaxis: i/2 - 1, threshold: {color: self.threshold.color} });
					// if have corresponding safe-range
					for (var j in self.safe_range_array)
					{
						if (! self.safe_range_array[j].checked)
							break;
						if (self.safe_range_array[j].robot == self.robot && self.safe_range_array[j].label == tmp2[i])
						{
							dataset[dataset.length - 1].threshold.below = self.safe_range_array[j].min;
							break;
						}
					}
				}
				for (var i in tmp)
				{
					if (self.max_points > 0 && i > self.max_points)
						break;
					tmp2 = tmp[i].split(" ");
					var len = Math.min(dataset.length + 2, tmp2.length / 2);
					var time = parseFloat(tmp2[1]);
					for (var j = 2; j < len; ++ j)
					{
						var tmp3 = parseFloat(tmp2[j * 2 + 1]);
						if (typeof tmp3 == "undefined" || isNaN(tmp3))
						{
							tmp3 = 0;
						}
						dataset[j - 2].data.push([time, tmp3]);
					}
				}
				$.plot("#" + self.placeholder, dataset, self.option);
			}
		}
		setTimeout(update, self.timeout);
	};
	//
	var updateLegend = function ()
	{
		updateLegendTimeout = null;
		var pos = hover_pos;
		var axes = plot.getAxes();
		// we don't need to test if it is inside of the canvas
		/*if (pos.x < axes.xaxis.min || pos.x > axes.xaxis.max || pos.y < axes.yaxis.min || pos.y > axes.yaxis.max)
		{
			return;
		}*/
		var ans;
		for (var i = 0; i < dataset.length; ++ i)
		{
			var series = dataset[i];
			// Find the nearest points in x-wise
			for (var j = 0; j < series.data.length; ++ j)
			{
				if (series.data[j][0] > pos.x)
				{
					// Interpolate
					var p1 = series.data[j - 1], p2 = series.data[j];
					if (p1 == null)
					{
						ans = p2[1];
					} else if (p2 == null)
					{
						ans = p1[1];
					} else
					{
						// it is originally string
						ans = parseFloat(p1[1]) + (p2[1] - p1[1]) * (pos.x - p1[0]) / (p2[0] - p1[0]);
					}
					break;
				}
			}
			$("#" + self.placeholder + " .legendLabel").eq(i).text(series.label.replace(/=.*/, "= " + ans.toFixed(2)));
		}
	}
	/**
	 * show this object, add callbacks, and start to plot periodically
	 * @public
	 */
	this.show = function ()
	{
		var html =
			'<div id="' + self.placeholder + '" style="width:' + self.width + ';height:' + self.height + ';"></div>' +
			'<form>' +
				'<button type="button" name="clear">clear</button>' +
				//'<button type="button" name="zoom">zoom</button>' +
				' key<input type="text" name="key" value="' + self.key + '" />' +
				'<input type="button" value="submit" />' +
				' backup data: robot<input type="text" name="robot" value="' + self.robot + '" />' +
				'<input type="button" value="submit" />' +
			'</form>' +
			'<form>' +
				'robot<input type="text" name="robot" value="' + self.robot + '" />' +
				'label<input type="text" name="label" value="' + self.label + '" />' +
				'start<input type="text" name="dtpicker" id="sp_dtpicker1" value="" />' +
				'end<input type="text" name="dtpicker" id="sp_dtpicker2" value="" />' +
				'duration (s)<input type="text" name="duration" value="3600" />' +
				'<input type="button" value="submit" />' +
			'</form>';
		document.getElementById(self.canvas).innerHTML = html;
		$('#sp_dtpicker1').datetimepicker({
			showSecond: true,
			timeFormat: 'HH:mm:ss',
			stepHour: 2,
			stepMinute: 10,
			stepSecond: 10
		});
		$('#sp_dtpicker2').datetimepicker({
			showSecond: true,
			timeFormat: 'HH:mm:ss',
			stepHour: 2,
			stepMinute: 10,
			stepSecond: 10
		});
		// add callback to clear button
		document.getElementById(self.canvas).getElementsByTagName("button")[0].onclick = function ()
		{
			plot = $.plot("#" + self.placeholder, [[]], self.option);
		}
		// add callback to zoom button
		/*document.getElementById(self.canvas).getElementsByTagName("button")[1].onclick = function ()
		{
			plot = $.plot("#" + self.placeholder, dataset,
				$.extend(true, {}, self.option, {
					xaxis: { min: zoom_range[0], max: zoom_range[1] },
					yaxis: { min: zoom_range[2], max: zoom_range[3] }
				})
			);
		}*/
		var input_array = document.getElementById(self.canvas).getElementsByTagName("input");
		// add callback to getKey button
		input_array[1].onclick = function ()
		{
			self.key = this.form.key.value;
			if (typeof self.key != "undefined" && self.key != "")
			{
				self.php_comm.cmd = "method=getKey&key=" + self.key;
				self.php_comm.commPhp();
			}
		}
		// add callback to getOldData button
		input_array[3].onclick = function ()
		{
			self.robot = this.form.robot.value;
			if (typeof self.robot != "undefined" && self.robot != "")
			{
				self.php_comm.cmd = "method=getPreviousData&robot=" + self.robot + "&num=100";
				self.php_comm.commPhp();
			}
		}
		// add callback to historicData button
		input_array[input_array.length - 1].onclick = function ()
		{
			self.robot = this.form.robot.value;
			alert($('#sp_dtpicker1').datetimepicker('getDate') + " - " + $('#sp_dtpicker1').datetimepicker('getDate'));
			self.php_comm.cmd = "method=historicData&robot=" + this.form.robot.value + "&label=" + this.form.label.value + "&from=" + $('#sp_dtpicker1').datetimepicker('getDate') + "&to=" + $('#sp_dtpicker1').datetimepicker('getDate') + "&duration=" + this.form.duration.value + "&num=100";
			self.php_comm.commPhp();
		}
		// initial
		plot = $.plot("#" + self.placeholder, [[]], self.option);
		// add legend tracking
		$("#"+self.placeholder).bind("plothover",  function (event, pos, item)
		{
			hover_pos = pos;
			if (!updateLegendTimeout) {
				updateLegendTimeout = setTimeout(updateLegend, 50);
			}
		});
		//@deprecated add selected zooming
		$("#" + self.placeholder).bind("plotselected", function (event, ranges)
		{
			// clamp the zooming to prevent eternal zoom
			if (ranges.xaxis.to - ranges.xaxis.from < 0.00001) {
				ranges.xaxis.to = ranges.xaxis.from + 0.00001;
			}
			if (ranges.yaxis.to - ranges.yaxis.from < 0.00001) {
				ranges.yaxis.to = ranges.yaxis.from + 0.00001;
			}
			//@bug with multi-axis
			zoom_range[0] = ranges.xaxis.from;
			zoom_range[1] = ranges.xaxis.to;
			zoom_range[2] = ranges.yaxis.from;
			zoom_range[3] = ranges.yaxis.to;
		});
		update();
	}
}
/**
 * @class put old data back to Redis for time traveling
 */
var timeTravel = function ()
{
	/**
	 * the place to hold this object
	 * @public
	 */
	this.canvas = "timeTravel";
	/**
	 * @public
	 */
	this.align = "center";
	/**
	 * the placeholder of debug info
	 * @public
	 */
	this.debug = "debug";
	/**
	 * the timeout between two updates (ms)
	 * @public
	 */
	this.timeout = 300;
	/**
	 * create a php communication
	 * @public
	 */
	this.php_comm = new phpComm();
	var self = this, cmd = "";
	/**
	 * update data periodically
	 * @private
	 */
	var update = function()
	{
		//@bug need to send value to tell PHP which
		self.php_comm.cmd = "method=timeTravel" + cmd;
		self.php_comm.commPhp();
		setTimeout(update, self.timeout);
	};
	/**
	 * show this object, and start to plot periodically
	 * @public
	 */
	this.show = function ()
	{
		var html = 	'<input type="text" name="dtpicker" id="dtpicker" value="" />' +
					'<button type="button" name="submit" >start time travelling</button>';
		document.getElementById(self.canvas).innerHTML = html;
		document.getElementById(self.canvas).getElementsByTagName("button")[0].onclick = function ()
		{
			cmd = $('#dtpicker').datetimepicker('getDate');
			alert(cmd);
			//update();
		}
		$('#dtpicker').datetimepicker({
			showSecond: true,
			timeFormat: 'HH:mm:ss',
			stepHour: 2,
			stepMinute: 10,
			stepSecond: 10
		});
	}
}
/**
 * @class trajectory plot by Flot
 */
var trajPlot1 = function ()
{
	/**
	 * the place to hold this object
	 * @public
	 */
	this.canvas = "trajPlot1";
	/**
	 * the place to hold this plot
	 * @public
	 */
	this.placeholder = "tp_placeholder";
	/**
	 * @public
	 */
	this.width = "600px";
	/**
	 * @public
	 */
	this.height = "500px";
	/**
	 * the timeout between two updates (ms)
	 * @public
	 */
	this.timeout = 300;
	/**
	 * max points of a curve in the plot
	 * @public
	 */
	this.total_points = 30;
	/**
	 * the placeholder of debug info
	 * @public
	 */
	this.debug = "debug";
	/**
	 * robot data generated by robotData
	 * @public
	 */
	this.robot_data;
	/**
	 * options of the plot
	 * @public
	 */
	this.option = {
		series: {
			shadowSize: 0,
			lines: {show: true},
			points: {show: true}},
			yaxis: { min: 0, max: 100 },
			xaxis: { min: 0, max: 100 },
			crosshair: {mode: "x"},
			grid: {
				show: true,
				hoverable: true,
				autoHighlight: false
	}};
	var data = new Array(), data2 = new Array(), plot;
	var self = this;
	/**
	 * combine data into position value
	 * @private
	 */
	var combineData = function (pos0, pos1)
	{
		// x axis
		if (data.length > 0)
			data = data.slice(1);
		while (data.length < self.total_points)
		{
			var y = pos0;
			if (y < self.option.xaxis.min)
				y = self.option.xaxis.min;
			if (y > self.option.xaxis.max)
				y = self.option.xaxis.max;
			data.push(y);
		}
		// y axis
		if (data2.length > 0)
			data2 = data2.slice(1);
		while (data2.length < self.total_points)
		{
			var y = pos1;
			if (y < self.option.xaxis.min)
				y = self.option.xaxis.min;
			if (y > self.option.xaxis.max)
				y = self.option.xaxis.max;
			data2.push(y);
		}
		// combine data and data2, and plot them in one plot, so the trajectory is obtained.
		var res = [];
		for (var i = 0; i < data.length; ++i)
		{
			res.push([data2[i], data[i]]);
		}
		return res;
	}
	/**
	 * plot periodically
	 * @private
	 */
	var update = function ()
	{
		plot.setData([ combineData(self.robot_data.getData("cb01", "x"), self.robot_data.getData("cb01", "y")) ]);
		plot.draw();
		setTimeout(update, self.timeout);
	};
	/**
	 * show this object, and start to plot periodically
	 * @public
	 */
	this.show = function ()
	{
		var html =
			'<div id="' + self.placeholder + '" style="width:' + self.width + ';height:' + self.height + ';"></div>';
		document.getElementById(self.canvas).innerHTML = html;
		// if robot data is not defined, define one
		if (typeof self.robot_data == "undefined")
		{
			self.robot_data = new robotData();
			self.robot_data.update();
		}
		plot = $.plot("#" + self.placeholder, [[]], self.option);
		update();
	}
}
/**
 * @class trajectory plot by jsDraw2DX
 */
var trajPlot2 = function ()
{
	/**
	 * the place to hold this object
	 * @public
	 */
	this.canvas = "trajPlot2";
	/**
	 * the place to hold this plot
	 * @public
	 */
	this.placeholder = "graphics";
	/**
	 * @public
	 */
	this.overflow = "hidden";
	/**
	 * @public
	 */
	this.position = "relative";
	/**
	 * @public
	 */
	this.width = "830px";
	/**
	 * @public
	 */
	this.height = "340px";
	/**
	 * max points of a curve in the plot
	 * @public
	 */
	this.total_points = 30;
	/**
	 * the timeout between two updates (ms)
	 * @public
	 */
	this.timeout = 300;
	/**
	 * size of the playground
	 * @public
	 */
	this.max = 100;
	/**
	 * robot data
	 * @public
	 */
	this.robot_data;
	/**
	 * the placeholder of debug info
	 * @public
	 */
	this.debug = "debug";
	var data = new Array(), data2 = new Array(), gr, body, test1, line = new Array();
	var self = this;
	/**
	 * combine data into position data
	 * @public
	 */
	var getData = function (pos0, pos1)
	{
		if (data.length > 0)
			data = data.slice(1);
		while (data.length < self.total_points)
		{
			var y = pos0;
			if (y < 0)
				y = 0;
			if (y > self.max)
				y = self.max;
			data.push(y);
		}
		if (data2.length > 0)
			data2 = data2.slice(1);
		while (data2.length < self.total_points)
		{
			var y = pos1;
			if (y < 0)
				y = 0;
			if (y > self.max)
				y = self.max;
			data2.push(y);
		}
	}
	/**
	 * plot static stuff
	 * @private
	 */
	var plotStatic = function ()
	{
		// draw the static graphics by jsDraw2DX
		gr = new jxGraphics(document.getElementById(self.placeholder));
		var boundary = new jxRect(new jxPoint(0,0), 830, 340, new jxPen(new jxColor("grey"),'1px'));
		boundary.draw(gr);
		var grid = new jxRect(new jxPoint(330, 480), 50, 50, new jxPen(new jxColor("pink"),'1px'), new jxBrush(new jxColor("pink")));
		grid.draw(gr);
		var home = new jxCircle(new jxPoint(30, 30), 20, new jxPen(new jxColor("blue"),'1px'));
		home.draw(gr);
		var patch1 = new jxCircle(new jxPoint(570, 570), 20, new jxPen(new jxColor("green"),'1px'));
		patch1.draw(gr);
		var patch1 = new jxCircle(new jxPoint(30, 570), 20, new jxPen(new jxColor("green"),'1px'));
		patch1.draw(gr);

		// draw the initial graphics of dynamic objects
		getData(0, 0);
		var pos = new jxPoint(data2[data.length - 1] * 6, 600 - data[data.length - 1] * 6);
		body = new jxCircle(pos, 10, new jxPen(new jxColor("black"),'1px'));
		body.draw(gr);
		test1 = new jxArc(pos, 50, 10, -90, 90, new jxPen(new jxColor("red"),'1px'));
		test1.draw(gr);
		for (var i = 0; i < data.length - 1; ++i)
		{
			line.push( new jxLine(new jxPoint(data2[i] * 6, 600 - data[i] * 6), new jxPoint(data2[i+1] * 6, 600 - data[i+1] * 6), new jxPen(new jxColor("pink"),'1px')) );
			line[i].draw(gr);
		}
	}
	/**
	 * plot periodically
	 * @public
	 */
	var update = function ()
	{
		getData(self.robot_data.getData("cb01", "x"), self.robot_data.getData("cb01", "y"));
		var pos = new jxPoint(data2[data.length - 1] * 6, 600 - data[data.length - 1] * 6);
		body.remove();
		body = new jxCircle(pos, 10, new jxPen(new jxColor("black"),'1px'));
		body.draw(gr);
		test1.remove();
		test1 = new jxArc(pos, 130, 100, -90, 90, new jxPen(new jxColor("red"),'1px'));
		test1.draw(gr);
		for (var i = 0; i < data.length - 1; ++i)
		{
			line[i].remove();
			line[i] = new jxLine(new jxPoint(data2[i] * 6, 600 - data[i] * 6), new jxPoint(data2[i+1] * 6, 600 - data[i+1] * 6), new jxPen(new jxColor("pink"),'1px'));
			line[i].draw(gr);
		}
		setTimeout(update, self.timeout);
	};
	/**
	 * show this object, and start to plot periodically
	 * @public
	 */
	this.show = function ()
	{
		var html =
			'<div id="' + self.placeholder + '" style="overflow:' + self.overflow + ';position:' + self.position + ';width:' + self.width + ';height:' + self.height + ';"></div>';
		document.getElementById(self.canvas).innerHTML = html;
		// if robot data is not defined, define one
		if (typeof self.robot_data == "undefined")
		{
			self.robot_data = new robotData();
			self.robot_data.update();
		}
		plotStatic();
		update();
	}
}
/**
 * @class dynamic plot
 */
var dynamicPlot = function ()
{
	/**
	 * the place to hold this object
	 * @public
	 */
	this.canvas = "dynamicPlot";
	/**
	 * @public
	 */
	this.border = 0;
	/**
	 * width of the entire table
	 * @public
	 */
	this.table_width = "100%";
	/**
	 * height of the entire table
	 * @public
	 */
	this.table_height = "100%";
	/**
	 * the place to hold this plot
	 * @public
	 */
	this.placeholder = "dp_placeholder";
	/**
	 * width of the plot
	 * @public
	 */
	this.width = "100%";
	/**
	 * height of the plot
	 * @public
	 */
	this.height = "240px";
	/**
	 * height of the text
	 * @public
	 */
	this.text_width = "130px";
	/**
	 * the placeholder of debug info
	 * @public
	 */
	this.debug = "debug";
	/**
	 * max points of a curve in the plot
	 * @public
	 */
	this.total_points = 100;
	/**
	 * the timeout between two updates (ms)
	 * @public
	 */
	this.timeout = 300;
	/**
	 * robot data
	 * @public
	 */
	this.robot_data;
	/**
	 * selected robot
	 * @public
	 */
	this.robot;
	/**
	 * selected label
	 * @public
	 */
	this.label = "all";
	/**
	 * if to show the selections of robot and label
	 * @public
	 */
	this.show_select = true;
	/**
	 * options for the plot
	 * @public
	 */
	this.option = {
		// drawing is faster without shadows
		series: {
			shadowSize: 0,
			lines: {show: true},
			//points: {show: true} bad-looking
		},
		crosshair: {mode: "x"},
		zoom: {interactive: true},
		pan: {interactive: true},
		// it can adjust automatically
		//@bug still some bugs
		//yaxis: { min: 0, max: 100 },
		//@todo time mode
		xaxis: { min: -this.total_points + 1, max: 0, zoomRange: [-this.total_points + 1, 0]},
		grid: {show: true},
		legend: { position: "nw" },
		grid: {
			show: true,
			hoverable: true,
			autoHighlight: false
		}
	};
	this.safe_range_array = new Array();
	var dataset = new Object(), plot, robot_name = new Array(), hover_pos, updateLegendTimeout;
	var self = this;
	var updateLegend = function ()
	{
		updateLegendTimeout = null;
		var pos = hover_pos;
		var axes = plot.getAxes();
		var ans, i = 0;
		for (var key in dataset)
		{
			if ("frame" == key)
				continue;
			var series = dataset[key];
			// Find the nearest points in x-wise
			for (var j = 0; j < series.data.length; ++ j)
			{
				if (series.data[j][0] > pos.x)
				{
					// Interpolate
					var p1 = series.data[j - 1], p2 = series.data[j];
					if (p1 == null)
					{
						ans = p2[1];
					} else if (p2 == null)
					{
						ans = p1[1];
					} else
					{
						// it is originally string
						ans = parseFloat(p1[1]) + (p2[1] - p1[1]) * (pos.x - p1[0]) / (p2[0] - p1[0]);
					}
					break;
				}
			}
			$("#" + self.placeholder + " .legendLabel").eq(i ++).text(series.label.replace(/=.*/, "= " + ans.toFixed(2)));
		}
	}
	var initData = function ()
	{
		dataset = new Object();
		getData();
		// generate data according to the format of Flot based on self.label
		var data = new Array();
		if ("all" == self.label)
		{
			for (i in dataset)
			{
				if ("frame" == i)
				{
					continue;
				}
				// if have corresponding safe-range
				for (var j in self.safe_range_array)
				{
					if (! self.safe_range_array[j].checked)
						break;
					if (self.safe_range_array[j].robot == self.robot && self.safe_range_array[j].label == i)
					{
						dataset[i].threshold.below = self.safe_range_array[j].min;
						break;
					}
				}
				data.push( dataset[i] );
			}
		} else
		{
			if (self.label in dataset)
			{
				data.push( dataset[self.label] );
			}
		}
		if (data.length == 0)
		{
			data = [[]];
		}
		plot = $.plot("#" + self.placeholder, data, self.option);
	}
	var getData = function ()
	{
		// obtain all robot data no matter what self.label is
		var data_ret = self.robot_data.getRobot(self.robot);
		var cnt = -1;
		for (i in data_ret)
		{
			++ cnt;
			if (! (i in dataset))
			{
				dataset[i] = {label: i + " = 0.00", data: [], yaxis: cnt, threshold: {color: "black"}};
			}
			var tmp = new Array();
			for (j in dataset[i].data)
			{
				if (typeof dataset[i].data[j][1] != "undefined" && ! isNaN(dataset[i].data[j][1]))
				{
					tmp.push(dataset[i].data[j][1]);
				}
			}
			if (tmp.length > 0)
			{
				tmp = tmp.slice(1);
			}
			var y = NaN;
			if (typeof data_ret != "undefined" && typeof data_ret[i] != "undefined")
			{
				y = data_ret[i];
			}
			while (tmp.length < self.total_points)
			{
				tmp.push(0);
			}
			tmp.push(y);
			// add the number to the corresponding label
			var lis = document.getElementById(self.canvas).getElementsByTagName("li");
			for (var j = 0; j < lis.length; ++ j)
			{
				if (lis[j].innerText.length >= dataset[i].label.length && lis[j].innerText.substr(0, dataset[i].label.length) == dataset[i].label)
				{
					lis[j].innerHTML = dataset[i].label + ": " + y.toFixed(2);
				}
			}
			// zip the generated y values with the x values
			var res = new Array();
			for (var j = 0; j < tmp.length; ++ j)
			{
				res.push([j + 1 - tmp.length, tmp[j]]);
			}
			dataset[i].data = res;
		}
	}
	/**
	 * plot periodically
	 * @private
	 */
	var update = function ()
	{
		var tmp = self.robot_data.rn.getNames(), flag = false;
		if (self.show_select)
		{
			for (var i in tmp)
			{
				if (robot_name.indexOf(tmp[i]) == -1)
				{
					robot_name.push(tmp[i]);
					document.getElementById(self.canvas).getElementsByTagName("select")[0].innerHTML += '<option value="' + tmp[i] + '">' + tmp[i] + '</option>';
				}
			}
		}
		getData();
		// generate data according to the format of Flot based on self.label
		var data = new Array();
		if ("all" == self.label)
		{
			for (i in dataset)
			{
				if ("frame" == i)
				{
					continue;
				}
				// if have corresponding safe-range
				for (var j in self.safe_range_array)
				{
					if (! self.safe_range_array[j].checked)
						break;
					if (self.safe_range_array[j].robot == self.robot && self.safe_range_array[j].label == i)
					{
						dataset[i].threshold.below = self.safe_range_array[j].min;
						break;
					}
				}
				data.push( dataset[i] );
			}
		} else
		{
			if (self.label in dataset)
			{
				data.push( dataset[self.label] );
			}
		}
		plot.setData( data );
		plot.draw();
		setTimeout(update, self.timeout);
	};
	/**
	 * show this object, and start to plot periodically
	 * @public
	 */
	this.show = function ()
	{
		var html =
			'<table border="' + self.border + '" style="width:' + self.table_width + ';height:' + self.table_height + ';">' +
				'<tr>' +
					'<td><div id="' + self.placeholder + '" style="width:' + self.width + ';height:' + self.height + ';"></div></td>' +
					'<td width="' + self.text_width + '" align="center">' +
						'<button type="button" name="clear">clear</button>';
		if (self.show_select)
		{
			html += 	'<form align="' + self.align + '">' +
							'<select name="robot">' +
								'<option value="" selected="selected">select:</option>' +
							'</select>' +
							//@todo add corresponding labels
							'<select name="label">' +
								'<option value="all" selected="selected">all</option>' +
								'<option value="x">x</option>' +
								'<option value="y">y</option>' +
								'<option value="voltage">voltage</option>' +
								'<option value="current">current</option>' +
							'</select>' +
						'</form>';
		}
		html +=			'<ul style="list-style-type:none;">' +
							//@todo add corresponding labels
							'<li>x:</li>' +
							'<li>y:</li>' +
							'<li>voltage:</li>' +
							'<li>current:</li>' +
						'<ul>' +
					'</td>' +
				'</tr>' +
			'</table>';
		document.getElementById(self.canvas).innerHTML = html;
		// add callback to clear button
		document.getElementById(self.canvas).getElementsByTagName("button")[0].onclick = function ()
		{
			initData();
		}
		var select_list = document.getElementById(self.canvas).getElementsByTagName("select");
		if (select_list.length)
		{
			// add callback to robot select
			select_list[0].onclick = function ()
			{
				if (this.form.robot.value == "" || this.form.robot.value == " " || this.form.robot.value == "select:" || this.form.robot.value == self.robot)
					return;
				self.robot = this.form.robot.value;
				initData();
			}
			// add callback to label select
			select_list[1].onclick = function ()
			{
				if (this.form.label.value == "" || this.form.label.value == " " || this.form.label.value == self.label)
					return;
				self.label = this.form.label.value;
				initData();
			}
		}
		// if robot data is not defined, define one
		if (typeof self.robot_data == "undefined")
		{
			self.robot_data = new robotData();
			self.robot_data.update();
		}
		initData();
		// add legend tracking
		$("#"+self.placeholder).bind("plothover",  function (event, pos, item)
		{
			hover_pos = pos;
			if (!updateLegendTimeout) {
				updateLegendTimeout = setTimeout(updateLegend, 50);
			}
		});
		update();
	}
}
/**
 * @class control for safe range
 */
var safeRange = function ()
{
	/**
	 * the place to hold this object
	 * @public
	 */
	this.canvas = "safeRange";
	/**
	 * @public
	 */
	this.border = 1;
	/**
	 * @public
	 */
	this.width = "100%";
	/**
	 * @public
	 */
	this.align = "center";
	/**
	 * @public
	 */
	this.sr_text = "safe-range";
	/**
	 * min alarm value
	 * @public
	 */
	this.min = 0;
	/**
	 * max alarm value
	 * @public
	 */
	this.max = 100;
	/**
	 * say when safe
	 * @public
	 */
	this.safe_text = "safe";
	/**
	 * say when alarm
	 * @public
	 */
	this.alarm_text = "DANGER !";
	/**
	 * robot data
	 * @public
	 */
	this.robot_data;
	/**
	 * the placeholder of debug info
	 * @public
	 */
	this.debug = "debug";
	/**
	 * the timeout between two updates (ms)
	 * @public
	 */
	this.timeout = 300;
	this.checked = false;
	this.robot = undefined;
	this.label = undefined;
	var self = this;
	/**
	 * test if it in the safe-range
	 * @private
	 */
	var test_saferange = function (value)
	{
		if (self.checked && (value < self.min || value > self.max))
		{
			document.getElementById(self.canvas).getElementsByTagName("p")[1].innerHTML = self.alarm_text;
			//alert(self.alarm_text);
		} else
		{
			document.getElementById(self.canvas).getElementsByTagName("p")[1].innerHTML = self.safe_text;
		}
	}
	/**
	 * update the test periodically
	 * @private
	 */
	var update = function ()
	{
		//var data = Math.round(Math.random() * 100);
		var data = self.robot_data.getData(self.robot, self.label);
		document.getElementById(self.canvas).getElementsByTagName("p")[0].innerHTML = data;
		test_saferange(data);
		setTimeout(update, self.timeout);
	};
	/**
	 * show this object, assign callback, and start to plot periodically
	 * @public
	 */
	this.show = function ()
	{
		var r = self.robot, l = self.label;
		if (typeof r == "undefined")
		{
			r = "";
		}
		if (typeof l == "undefined")
		{
			l = "";
		}
		var html =
			'<table border="' + self.border + '" align="' + self.align + '" width="' + self.width + '">' +
				'<tr align="' + self.align + '">' +
					'<td>' +
						'<form name="source">' +
						'safe-range<input type="checkbox" name="work">' +
						'robot<input type="text" name="robot" value="' + r + '">' +
						'label<input type="text" name="label" value="' + l + '">' +
						'<input type="button" value="submit">' +
						'</form>' +
					'</td>' +
					'<td>' +
						'<form name="safe_range">' +
						'min<input type="text" name="min" value="' + self.min + '">' +
						'max<input type="text" name="max" value="' + self.max + '">' +
						'<input type="button" value="submit">' +
						'</form>' +
					'</td>' +
					'<td width="5%"><p></p></td>' +
					'<td width="5%">' +
						'<p>' + self.safe_text + '</p>' +
					'</td>' +
				'</tr>' +
			'</table>';
		document.getElementById(self.canvas).innerHTML = html;
		// callback of checkbox
		document.getElementById(self.canvas).getElementsByTagName("input")[0].onchange = function ()
		{
			self.checked = this.checked;
//document.getElementById(self.debug).innerHTML = "debug: " + self.checked;
		}
		// callback of submit button of safe_range form
		document.getElementById(self.canvas).getElementsByTagName("input")[6].onclick = function ()
		{
			self.min = parseFloat(this.form.min.value);
			self.max = parseFloat(this.form.max.value);
//document.getElementById(self.debug).innerHTML = "debug: " + this.form.work.value + " " + self.min + " " + self.max;
		}
		// callback of submit button of source form
		document.getElementById(self.canvas).getElementsByTagName("input")[3].onclick = function ()
		{
			self.robot = this.form.robot.value;
			self.label = this.form.label.value;
//document.getElementById(self.debug).innerHTML = "debug: " + self.robot + " " + self.label;
		}
		// if robot data is not defined, define one
		if (typeof self.robot_data == "undefined")
		{
			self.robot_data = new robotData();
			self.robot_data.update();
		}
		update();
	}
}
/**
 * @class trajectory plot on Google map
 */
var trajGmap = function ()
{
	/**
	 * the place to hold this object
	 * @public
	 */
	this.canvas = "trajGmap";
	/**
	 * the placeholder of debug info
	 * @public
	 */
	this.debug = "debug";
	/**
	 * the place to hold this plot
	 * @public
	 */
	this.map_canvas = "map_canvas";
	/**
	 * @public
	 */
	this.border = 0;
	/**
	 * @public
	 */
	this.align = "center";
	/**
	 * @public
	 */
	this.width = "40%";
	/**
	 * the placeholder of debug info
	 * @public
	 */
	this.debug = "debug";
	/**
	 * the timeout between two updates (ms)
	 * @public
	 */
	this.timeout = 300;
	/**
	 * robot data
	 * @public
	 */
	this.robot_data;
	/**
	 * create a php communication to get grid information
	 * @public
	 */
	this.grid_php_comm = new phpComm();
	/**
	 * options for map
	 * @public
	 */
	this.map_options =
	{
		zoom: 17,
		center: new google.maps.LatLng(LAB[0], LAB[1]),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	var view_type = "basic", follow = "", map;
	var last_coord = new Object(), coord = new Object(), rpath = new Object(), robot = new Object(), grid = new Object(), grid_value = new Object();
	var self = this;
	/**
	 * set map externally
	 * @public
	 */
	this.setMap = function (m)
	{
		map = m;
	}
	/**
	 * init map
	 * @public
	 * @bug no longer useful
	 */
	this.init = function ()
	{
		map = new google.maps.Map(document.getElementById('map_canvas'),
			self.map_options);
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(LAB[0], LAB[1]),
			map: map,
			title: 'Autonomy Lab at Simon Fraser University'
		});
	}
	/**
	 * clear grid data from the map
	 * @private
	 */
	var clearGrid = function ()
	{
		for (key in grid)
		{
			grid[key].setMap(null);
		}
	}
	/**
	 * transform the coordinate into grid position
	 * @private
	 */
	var coordToGrid = function (x, y)
	{
		var GRID_SIZE = .001;
		return [Math.round((x - LAB[0] - GRID_SIZE/2) / GRID_SIZE), Math.round((y - LAB[1] - GRID_SIZE/2) / GRID_SIZE)];
	}
	/**
	 * pop up a info window on a grid
	 * @private
	 */
	var infoWnd = function (event)
	{
		var grid_pos = coordToGrid(event.latLng.lat(), event.latLng.lng());
		if (! ((grid_pos[0] + " " + grid_pos[1]) in grid_value))
		{
			return;
		}
		var info = '<table border="1"><tr><td>grid</td><td>('+grid_pos[0] + ", " + grid_pos[1]+')</td></tr>'
			+ '<tr><td>location</td><td>('+event.latLng.lat()+', '+event.latLng.lng()+')</td></tr>'
			+ '<tr><td>value</td><td>'+ grid_value[grid_pos[0] + " " + grid_pos[1]] +'</td></tr>'
			+ '<tr><td>color</td><td>'+ grid[grid_pos[0] + " " + grid_pos[1]].fillColor +'</td></tr></table>';
		var infownd = new google.maps.InfoWindow({
			content: info,
			position: event.latLng
		});
		infownd.open(map);
	}
	/**
	 * get the icon representing substate
	 * @private
	 */
	var getIcon = function ()
	{
		var icon = new Array();
		switch (Math.round(Math.random() * 6))
		{
		case 0:
			icon = [];
			break;
		case 1: // arrows
			icon = [{icon: {path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW}, offset: "100%"}];
			break;
		case 2: // dashed lines
			icon = [{
				icon: {
					path: 'M 0,-1 0,1',
					strokeOpacity: 1,
					scale: 4
				},
				offset: '0',
				repeat: '20px'
			}];
			break;
		case 3:
			icon = [{
				icon: {
					path: 'M -2,0 0,-2 2,0 0,2 z',
					strokeColor: '#F00',
					fillColor: '#F00',
					fillOpacity: 1
				},
				offset: '50%'
			}];
			break;
		case 4:
			icon = [{
				icon: {
					path: 'M -2,-2 2,2 M 2,-2 -2,2',
					strokeColor: '#292',
					strokeWeight: 4
				},
				offset: '50%'
			}];
			break;
		case 5:
			icon = [{
				icon: {
					path: 'M -1,0 A 1,1 0 0 0 -3,0 1,1 0 0 0 -1,0M 1,0 A 1,1 0 0 0 3,0 1,1 0 0 0 1,0M -3,3 Q 0,5 3,3',
					strokeColor: '#00F',
					 rotation: 0
				},
				offset: '50%'
			}];
			break;
		default:
		}
		return icon;
	}
	/**
	 * generate the trajectory
	 * @private
	 */
	var robotMove = function ()
	{
		// separate the data into different robots
		var all = self.robot_data.getAllRobots();
		for (var i in all)
		{
			var x = parseFloat(all[i]["x"]), y = parseFloat(all[i]["y"]);
			if (typeof x == "undefined" || isNaN(x) || typeof y == "undefined" || isNaN(y))
				continue;
			// if a new robot, assign default value to it
			if (! (i in robot))
			{
				last_coord[i] = [x, y];
				coord[i] = [x, y];
				rpath[i] = new Array();
				robot[i] = null;
				document.getElementById(self.canvas).getElementsByTagName("select")[1].innerHTML += '<option value="' + i + '">' + i + '</option>';
			}
			last_coord[i] = coord[i];
			coord[i] = [x, y];
			// if the robot moves
			if (coord[i][0] != last_coord[i][0] || coord[i][1] != last_coord[i][1])
			{
				// keep the length of path no longer than a threshold
				while (rpath[i].length >= 20)
				{
					rpath[i][0].setMap(null);
					rpath[i].splice(0, 1);
				}
				var color, weight, icon;
				// select if it is colorful
				if (view_type == "colorful")
				{
					color = "#" + Math.floor(Math.random()*16777215).toString(16);
					weight = 4;
					icon = getIcon();

				} else
				{
					color = "black";
					weight = 1;
					icon = new Array();
				}
				// erase old robot position
				if (typeof robot[i] != "undefined" && robot[i] != null)
				{
					robot[i].setMap(null);
				}
				robot[i] = new google.maps.Marker({
					position: new google.maps.LatLng(coord[i][0], coord[i][1]),
					map: map,
					title: i,
					icon: "cabs.png"
				});
				rpath[i].push(new google.maps.Polyline({
					map: map,
					path: [new google.maps.LatLng(last_coord[i][0], last_coord[i][1]), new google.maps.LatLng(coord[i][0], coord[i][1])],
					strokeColor: color,
					strokeOpacity: 1,
					strokeWeight: weight,
					icons: icon
				}));
			}
			if (follow == i)
			{
				// let the map follow a robot
				map.panTo(robot[i].getPosition());
			}
		}
		window.setTimeout(robotMove, self.timeout);
	}
	/**
	 * generate grids on energy or time distribution
	 * @private
	 * @todo
	 */
	var calGrid = function ()
	{
		if (view_type == "energy" || view_type == "time")
		{
			//[bug] simply clear all grids in every iteration. Perhaps there is a better way
			clearGrid();
			// I guess it is the way to calculate the grid size
			var grid_size = .001 * Math.pow(17, 10) / Math.pow(map.getZoom(), 10);
			var center_pos = coordToGrid(map.getCenter().lat(), map.getCenter().lng());
			self.grid_php_comm.cmd = "method=calGrid&grid_size=" + grid_size + "&type=" + view_type + "&centerx=" + center_pos[0] + "&centery=" + center_pos[1];
			self.grid_php_comm.commPhp();
			// separate the data into different grids
			var ret = self.grid_php_comm.receive.split(" ");
			var dist, min;
			for (var i = 0; i + 3 < ret.length; i += 4)
			{
				// the format of the data is "x y color value"
				var x = ret[i];//Math.round(Math.random() * GRID_NUM - GRID_NUM / 2);
				var y = ret[i+1];
				var color = parseInt(ret[i+2]).toString(16);//Math.round(Math.random() * 160).toString(16);
				if (color.length == 1)
				{
					color = "0" + color;
				}
				else if (color.length > 2)
				{
					color = color.substr(0, 2);
				}
				if (view_type == "energy")
				{
					color = "#FF" + color + color;
				}
				else if (view_type == "time")
				{
					color = "#" + color + color + "FF";
				}
				grid[x + " " + y] = new google.maps.Rectangle({
					strokeColor: 'grey',
					strokeOpacity: 0.2,
					strokeWeight: 1,
					fillColor: color,
					fillOpacity: 0.8,
					map: map,
					title: "value: " + ret[i+3],
					bounds: new google.maps.LatLngBounds(
						new google.maps.LatLng(LAB[0] + x * grid_size, LAB[1] + y * grid_size),
						new google.maps.LatLng(LAB[0] + x * grid_size + grid_size, LAB[1] + y * grid_size + grid_size))
				});
				google.maps.event.clearListeners(grid[x + " " + y], "click");
				// add the info window into the grid
				google.maps.event.addListener(grid[x + " " + y], "click", infoWnd);
				// save the grid value in order to be displayed on the info window
				grid_value[x + " " + y] = ret[i+3];
			}
		}
		window.setTimeout(calGrid, self.timeout);
	}
	/**
	 * waiting for the setup of the map
	 * @private
	 */
	var update = function ()
	{
		// wait until the map is setuped, and start update plots
		if (typeof map != "undefined" && map != null)
		{
			robotMove();
			calGrid();
			google.maps.event.addListener(map, 'zoom_changed', clearGrid);
		}
		else
		{
			setTimeout(update, self.timeout);
		}
	}
	/**
	 * show this object, add callbacks, and start to plot periodically
	 * @public
	 */
	this.show = function ()
	{
		var html =
			'<table border="' + self.border + '" align="' + self.align + '" width="' + self.width + '" >' +
				'<tr>' +
					'<td>' +
						'<form align="' + self.align + '">' +
							'view<select name="view">' +
								'<option value="basic" selected="selected">basic</option>' +
								'<option value="energy">energy map</option>' +
								'<option value="time">time map</option>' +
								'<option value="colorful">colorful trajectory</option>' +
							'</select>' +
						'</form>' +
					'</td>' +
					'<td>' +
						'<form align="' + self.align + '">' +
							'follow <select name="follow">' +
								'<option value="none" selected="selected">none</option>' +
								'<option value="lab">lab</option>' +
							'</select>' +
						'</form>' +
					'</td>' +
				'</tr>' +
			'</table>';
		document.getElementById(self.canvas).innerHTML = html;
		var select = document.getElementById(self.canvas).getElementsByTagName("select");
		// add callback to view select
		select[0].onclick = function ()
		{
			if (this.form.view.value == view_type)
				return;
			clearGrid();
			view_type = this.form.view.value;
		}
		// add callback to follow select
		select[1].onclick = function ()
		{
			if (this.form.follow.value == follow)
				return;
			follow = this.form.follow.value;
			// pan to the location of lab
			if ("lab" == follow)
			{
				map.panTo(new google.maps.LatLng(LAB[0], LAB[1]));
			}
		}
		// if robot data is not defined, define one
		if (typeof self.robot_data == "undefined")
		{
			self.robot_data = new robotData();
			self.robot_data.update();
		}
		update();
	}
}
