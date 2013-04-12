var HOST = "192.168.1.120", PORT = "6379", SECOND_HOST = "localhost";
var LAB = [49.276802, -122.914913], GROUND = [10, 8];
var STATE = ["A", "B", "C", "D", "E", "F", "G"], SUBSTATE = ["a", "b", "c", "d", "e", "f", "g"]
var STATE_COLOR = ["black", "blue", "red", "green", "yellow", "cyan", "grey", "orchid", "pink", "tan", "brown", "white"];
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
	this.clearSendTime = function ()
	{
		send_time = [0];
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
	this.getNum = function ()
	{
		return self.rn.count();
	}
	this.getNames = function ()
	{
		return self.rn.getNames();
	}
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
			for (var j = 0; j + 1 < tmp.length; j += 2)
			{
				if (typeof tmp[j] == "undefined" || "" == tmp[j] || " " == tmp[j])
				{
					++ j;
					if (j + 1 >= tmp.length)
					{
						break;
					}
				}
				// if it is number
				if (!isNaN(parseFloat(tmp[j + 1])) && isFinite(tmp[j + 1]))
				{
					robot_tmp[tmp[j]] = parseFloat(tmp[j + 1]);
				} else
				{
					robot_tmp[tmp[j]] = tmp[j + 1];
				}
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
	this.canvas = "labLogo";
	this.border = 0;
	this.width = "100%";
	this.align = "center";
	this.logo_width = "30%";
	this.src = "resource/logo.png";
	this.title = "Autolab Dashboard";
	this.debug = "debug";
	this.subheading = 1;
	var self = this;
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
				'<table class="table table-striped" border="1" align="' + self.align + '" width="' + self.width + '">' +
					'<tr class="info" align="' + self.align + '">' +
						'<td><p class="text-center"><a href="./index.html" target="_blank">Index</a></p></td>' +
						'<td><p class="text-center"><a href="./index-ipad.html" target="_blank">Index-ipad</a></p></td>' +
						'<td><p class="text-center"><a href="./ros1.html" target="_blank">rosjs</a></p></td>' +
						'<td><p class="text-center"><a href="./debugger.html" target="_blank">Debugger</a></p></td>' +
						'<td><p class="text-center"><a href="./gmap.html" target="_blank">Google Map</a></p></td>' +
						'<td><p class="text-center"><a href="./status.html" target="_blank">Status</a></p></td>' +
						'<td><p class="text-center"><a href="./traj1.html" target="_blank">Trajectory Plot 1</a></p></td>' +
						'<td><p class="text-center"><a href="./traj2.html" target="_blank">Trajectory Plot 2</a></p></td>' +
						'<td><p class="text-center"><a href="./dynamic.html" target="_blank">Dynamic Plot</a></p></td>' +
						'<td><p class="text-center"><a href="./static.html" target="_blank">Static Plot</a></p></td>' +
						'<td><p class="text-center"><a href="./dataparser/index.html" target="_blank">Data Parser</a></p></td>' +
						'<td><p class="text-center"><a href="./test.html" target="_blank">Test</a></p></td>' +
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
				'<form class="form-horizontal" align="' + self.align + '" style="background-color:AliceBlue;">' +
					'<div class="control-group input-prepend input-append">' +
						'<span class="add-on">host</span>' +
						'<input class="span2" type="text" name="host" value="' + self.host + '" />' +
					'</div>' +
					'<div class="control-group input-prepend input-append">' +
						'<span class="add-on">port</span>' +
						'<input class="span2" type="text" name="port" value="' + self.port + '" />' +
					'</div>' +
					'<div class="control-group input-prepend input-append">' +
						'<input class="btn btn-small btn-primary" type="button" value="ok" />' +
					'</div>' +
				'</form>';
		document.getElementById(self.canvas).innerHTML = html;
		/**
		 * assign callback function to submit button
		 */
		var input_list = document.getElementById(self.canvas).getElementsByTagName("input");
		input_list[input_list.length - 1].onclick = function ()
		{
			self.host = this.form.host.value;
			self.port = this.form.port.value;
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
	this.fix_count = 20;
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
			self.php_comm.clearSendTime();
			for (var i = 1; i < p.length; i += 2)
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
		var html = '<table class="table table-condensed" width="' + self.width + '" align="' + self.align + '" style="background-color:AliceBlue;">';
		for (var i = 0; i < self.fix_count; ++ i)
		{
			html += '<tr align="' + self.align + '">' +
						'<td><p class="text-center"></p></td>' +
						'<td><p class="text-center"></p></td>' +
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
	this.init_key = ["test01", "test02"];
	/**
	 * initial values
	 * @public
	 */
	this.init_value = ["@@@field_robot", "@@@random_robot"];
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
						'<td>A set of random numbers describing a robot as "frame x y voltage current". The boundaries of x and y are [0, 500] and [0, 400]</td>' +
					'</tr>' +
					'<tr align="center">' +
						'<td>@@@field_robot</td>' +
						'<td>A set of random numbers describing a robot as "frame x y voltage current state substate", with unconstrained x and y representing a field robot moving out of the lab.</td>' +
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
	this.max_points = 0;
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
	this.threshold = {/*below: 2, above: 7, */color: "black"};
	this.robot = "test01";
	this.yaxis = "all";
	this.xaxis = "servertime";
	this.number = 100;
	/**
	 * options for the plot
	 * @public
	 */
	this.option = {
		series: {
			lines: {show: true},
			points: {show: true}
		},
		crosshair: {mode: "xy"},
		zoom: {interactive: true},
		pan: {interactive: true},
		xaxis: {mode: undefined},
		yaxis: {
			tickFormatter: function (v, axis)
			{
				return v.toFixed(2);
			}
		},
		legend: { position: "nw" },
		grid: {
			show: true,
			hoverable: true,
			autoHighlight: false
	}};
	var update_time = 0, plot, dataset, str_dataset = new Object(), hover_pos, updateLegendTimeout, zoom_range = new Array();
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
				self.option.xaxis.mode = undefined;
				$.plot("#" + self.placeholder, dataset, self.option);
			} else // multi strings of data
			{
				// obtain the amount of curves
				var tmp2 = tmp[0].split(" "), xaxis_tmp = 0, yaxis_tmp = -1;
				for (var i = 0; i + 1 < tmp2.length; i += 2)
				{
					if ("servertime" == tmp2[i])
					{
						continue;
					}
					if (self.xaxis == tmp2[i])
					{
						xaxis_tmp = i;
					}
					if (self.yaxis == tmp2[i])
					{
						yaxis_tmp = i;
					}
					else if (typeof self.yaxis != "undefined" && self.yaxis != "" && self.yaxis != " " && self.yaxis != "all")
					{
						continue;
					}
					var label = tmp2[i] + " = 0.00";
					if ("servertime" != self.xaxis)
					{
						label = tmp2[i];
					}
					dataset.push({label: label, data: new Array(), yaxis: i/2 + 1, threshold: {color: self.threshold.color} });
					var flag = false;
					// if have corresponding safe-range
					for (var j in self.safe_range_array)
					{
						if (! self.safe_range_array[j].checked)
							break;
						if (self.safe_range_array[j].robot == self.robot && self.safe_range_array[j].label == tmp2[i])
						{
							dataset[dataset.length - 1].threshold.below = self.safe_range_array[j].min;
							dataset[dataset.length - 1].threshold.above = self.safe_range_array[j].max;
document.getElementById("debug").innerHTML = "debug: " + dataset[dataset.length - 1].threshold.below + " " + dataset[dataset.length - 1].threshold.above + " " + dataset[dataset.length - 1].threshold.color;
							flag = true;
							break;
						}
					}
					if (false == flag)
					{
						dataset[dataset.length - 1].threshold.below = undefined;
						dataset[dataset.length - 1].threshold.above = undefined;
					}
				}
				for (var i in tmp)
				{
					// if self.max_points <= 0, means it does not work
					if (self.max_points > 0 && i > self.max_points)
						break;
					tmp2 = tmp[i].split(" ");
					var xaxis_tmp2 = parseFloat(tmp2[xaxis_tmp + 1]);
					if ("servertime" == self.xaxis)
					{
						xaxis_tmp2  += - 1000 * 60 * 60 * 7;
						self.option.xaxis.mode = "time";
					} else
					{
						self.option.xaxis.mode = undefined;
					}
					var dataset_order = 0;
					for (var j = 0; j < tmp2.length / 2; ++ j)
					{
						if (dataset_order >= dataset.length)
						{
							break;
						}
						if ("servertime" == tmp2[j * 2])
						{
							continue;
						}
						if (yaxis_tmp >= 0 && yaxis_tmp != j * 2)
						{
							continue;
						}
						var tmp3;
						// if is number
						if (! isNaN(parseFloat(tmp2[j * 2 + 1])) && isFinite(tmp2[j * 2 + 1]))
						{
							tmp3 = parseFloat(tmp2[j * 2 + 1]);
						} else
						{
							if (! (("str" + dataset_order) in str_dataset))
							{
								str_dataset["str" + dataset_order] = new Array();
							}
							str_dataset["str" + dataset_order].push(tmp2[j * 2 + 1]);
							tmp3 = 0;
						}
						dataset[dataset_order ++].data.push([xaxis_tmp2, tmp3]);
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
		if ("servertime" != self.xaxis)
		{
			for (var i = 0; i < dataset.length; ++ i)
			{
				$("#" + self.placeholder + " .legendLabel").eq(i).text(dataset[i].label.replace(/=.*/, ""));
			}
			return;
		}
		updateLegendTimeout = null;
		var pos = hover_pos;
		var axes = plot.getAxes();
		var ans;
		for (var i = 0; i < dataset.length; ++ i)
		{
			var series = dataset[i];
			// Find the nearest points in x-wise
			for (var j = 0; j < series.data.length; ++ j)
			{
				if (series.data[j][0] > pos.x)
				{
					if (series.data[j][1] == 0 && ("str" + i) in str_dataset)
					{
						ans = str_dataset["str" + i][j];
						break;
					}
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
			if (typeof ans == "string")
			{
				$("#" + self.placeholder + " .legendLabel").eq(i).text(series.label.replace(/=.*/, "= " + ans));
			} else
			{
				$("#" + self.placeholder + " .legendLabel").eq(i).text(series.label.replace(/=.*/, "= " + ans.toFixed(2)));
			}
		}
	}
	/**
	 * show this object, add callbacks, and start to plot periodically
	 * @public
	 */
	this.show = function ()
	{
		var html =
			'<div id="' + self.placeholder + '" style="width:' + self.width + ';height:' + self.height + ';align:center;background-color:AliceBlue;"></div>' +
			'<div class="input-prepend input-append">' +
				'<form align="' + self.align + '">' +
					'<button class="btn btn-primary" type="button" name="clear" class="btn">clear</button>' +
					'<span class="add-on">key</span>' +
					'<input class="span2" type="text" name="key" value="' + self.key + '" />' +
					'<input class="btn btn-primary" type="button" value="submit" class="btn" />' +
				'</form>' +
				'<form align="' + self.align + '">' +
					'<div class="control-group">' +
						'<span class="add-on">robot</span>' +
						'<input class="span2" type="text" name="robot" value="' + self.robot + '" />' +
						'<span class="add-on">yaxis</span>' +
						'<input class="span2" type="text" name="yaxis" value="' + self.yaxis + '" />' +
						'<span class="add-on">xaxis</span>' +
						'<input class="span2" type="text" name="xaxis" value="' + self.xaxis + '" />' +
						'<span class="add-on">number</span>' +
						'<input class="span2" type="text" name="number" value="' + self.number + '" />' +
						'<input class="btn btn-primary" type="button" value="previous data" class="btn" />' +
					'</div>' +
					'<div class="control-group">' +
						'<span class="add-on">start</span>' +
						'<input class="span2" type="text" name="dtpicker" id="sp_dtpicker1" value="" />' +
						'<span class="add-on">end</span>' +
						'<input class="span2" type="text" name="dtpicker" id="sp_dtpicker2" value="" />' +
						'<span class="add-on">duration</span>' +
						'<input class="span2" type="text" name="duration" value="" />' +
						'<input class="btn btn-primary" type="button" value="historical data" class="btn" />' +
					'</div>' +
				'</form>' +
			'</div>';
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
		// add callback to getPreviousData button
		input_array[6].onclick = function ()
		{
			self.robot = this.form.robot.value;
			self.yaxis = this.form.yaxis.value;
			self.xaxis = this.form.xaxis.value;
			self.number = this.form.number.value;
			if (typeof self.robot != "undefined" && self.robot != "")
			{
				self.php_comm.cmd = "method=getPreviousData&robot=" + self.robot + "&num=" + self.number;
				self.php_comm.commPhp();
			}
		}
		// add callback to historicData button
		input_array[input_array.length - 1].onclick = function ()
		{
			self.robot = this.form.robot.value;
			self.yaxis = this.form.yaxis.value;
			self.xaxis = this.form.xaxis.value;
			self.number = this.form.number.value;
			self.php_comm.cmd = "method=historicData&robot=" + this.form.robot.value + "&from=" + $('#sp_dtpicker1').datetimepicker('getDate') + "&to=" + $('#sp_dtpicker2').datetimepicker('getDate') + "&duration=" + this.form.duration.value + "&num=" + self.number;
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
	this.speed = .5;
	/**
	 * create a php communication
	 * @public
	 */
	this.php_comm = new phpComm();
	var self = this, cmd = "", nexttime = 0, travel_flag = false;
	/**
	 * update data periodically
	 * @private
	 */
	var update = function()
	{
		self.php_comm.cmd = "method=timeTravel&timestamp=" + cmd + "&nexttime=" + nexttime;
		self.php_comm.commPhp();
		var rec = self.php_comm.receive.split(" ");
		var tmp = parseFloat(rec[0]);
		if (tmp > nexttime)
		{
			nexttime = tmp;
			var tmp = parseFloat(rec[1]);
			if (tmp < 10000 && tmp > 1)
			{
				self.timeout = parseFloat(rec[1]) * self.speed;
			}
		}
		var now = (travel_flag && nexttime) ? new Date(nexttime * 1000) : "invalid timestamp";
		var span_list = document.getElementById(self.canvas).getElementsByTagName("span");
		span_list[0].innerHTML = now + ", rate " + self.timeout;
		setTimeout(update, self.timeout);
	};
	/**
	 * show this object, and start to plot periodically
	 * @public
	 */
	this.show = function ()
	{
		var html =	'<div class="input-prepend input-append" align="' + self.align + '" style="background-color:AliceBlue;">' +
						'<input class="span2" type="text" name="dtpicker" id="dtpicker" value="" />' +
						'<button class="btn btn-primary" type="button" name="submit" >start time travelling</button>' +
						'<button class="btn btn-info" type="button" name="submit" >faster</button>' +
						'<button class="btn btn-info" type="button" name="submit" >slower</button>' +
						'<span class="add-on"></span>' +
					'</div>';
		document.getElementById(self.canvas).innerHTML = html;
		var button_list = document.getElementById(self.canvas).getElementsByTagName("button");
		// start or stop time travelling
		button_list[0].onclick = function ()
		{
			nexttime = 0;
			// if travelling, stop
			if (nexttime)
			{
				cmd = "";
				travel_flag = false;
				document.getElementById(self.canvas).getElementsByTagName("button")[0].innerHTML = "start time travelling";
			} else // if not travelling, start
			{
				cmd = $('#dtpicker').datetimepicker('getDate');
				travel_flag = true;
				document.getElementById(self.canvas).getElementsByTagName("button")[0].innerHTML = "stop time travelling";
			}
		}
		// faster
		button_list[1].onclick = function ()
		{
			self.speed *= 0.8;
		}
		//slower
		button_list[2].onclick = function ()
		{
			self.speed *= 1.2;
		}
		$('#dtpicker').datetimepicker({
			showSecond: true,
			timeFormat: 'HH:mm:ss',
			stepHour: 2,
			stepMinute: 10,
			stepSecond: 10
		});
		update();
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
	this.width = 500;
	/**
	 * @public
	 */
	this.height = 400;
	/**
	 * @public
	 */
	this.align = "center";
	/**
	 * max points of a curve in the plot
	 * @public
	 */
	this.total_points = 20;
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
	this.php_comm = new phpComm();
	this.grid_php_comm = new phpComm();
	/**
	 * the placeholder of debug info
	 * @public
	 */
	this.debug = "debug";
	var view_type = "basic", follow, gr, test1;
	var data = new Object(), data2 = new Object(), yaw = new Object(), body = new Object(), dir = new Object(), line = new Object(), grid;
	var GRID_SIZE = 10;
	var self = this;
	/**
	 * combine data into position data
	 * @public
	 */
	var getData = function (robot_name)
	{
		var x = (self.robot_data.getData(robot_name, "x") + GROUND[0]/2) * (self.width / GROUND[0]);
		var y = (self.robot_data.getData(robot_name, "y") + GROUND[1]/2) * (self.height / GROUND[1]);
		yaw[robot_name] = self.robot_data.getData(robot_name, "yaw");
		if (! (robot_name in data))
		{
			data[robot_name] = new Array();
		}
		if (data[robot_name].length > 0)
			data[robot_name] = data[robot_name].slice(1);
		while (data[robot_name].length < self.total_points)
		{
			data[robot_name].push(x);
		}
		if (! (robot_name in data2))
		{
			data2[robot_name] = new Array();
		}
		if (data2[robot_name].length > 0)
			data2[robot_name] = data2[robot_name].slice(1);
		while (data2[robot_name].length < self.total_points)
		{
			data2[robot_name].push(y);
		}
	}
	var parseNum = function (num)
	{
		num = parseFloat(num);
		if (isNaN(num))
		{
			num = 0;
		} else
		{
			num = num * (self.width / GROUND[0]);
		}
		return num;
	}
	var parsePoint = function (x, y)
	{
		x = parseFloat(x);
		if (isNaN(x))
		{
			x = 0;
		} else
		{
			x = (x + GROUND[0]/2) * (self.width / GROUND[0]);
		}
		y = parseFloat(y);
		if (isNaN(y))
		{
			y = 0;
		} else
		{
			y = (y + GROUND[1]/2) * (self.height / GROUND[1]);
		}
		return new jxPoint(x, y);
	}
	var parsePen = function (arg, start)
	{
		for (var i = start; i + 3 < arg.length; ++ i)
		{
			if ("pen" == arg[i])
			{
				return new jxPen(new jxColor(arg[i + 1]), arg[i + 2] + "px", arg[i + 3]);
			}
		}
		return null;
	}
	var parseBrush = function (arg, start)
	{
		for (var i = start; i + 2 < arg.length; ++ i)
		{
			if ("brush" == arg[i])
			{
				return new jxBrush(new jxColor(arg[i + 1]), arg[i + 2]);
			}
		}
		return null;
	}
	var drawGraphics = function (cmd)
	{
		var arg = cmd.split(" "), pen, brush, g;
		switch (arg[0])
		{
		case "point":
			g = parsePoint(arg[1], arg[2]);
			g.draw(gr);
			break;
		case "line":
			pen = parsePen(arg, 3);
			if (typeof pen == "undefined")
			{
				g = new jxLine(parsePoint(arg[1], arg[2]), parsePoint(arg[3], arg[4]));
			} else
			{
				g = new jxLine(parsePoint(arg[1], arg[2]), parsePoint(arg[3], arg[4]), pen);
			}
			g.draw(gr);
			break;
		case "rect":
			pen = parsePen(arg, 5);
			if (typeof pen == "undefined")
			{
				brush = parseBrush(arg, 5);
				if (typeof brush == "undefined")
				{
					g = new jxRect(parsePoint(arg[1], arg[2]), parseNum(arg[3]), parseNum(arg[4]));
				} else
				{
					g = new jxRect(parsePoint(arg[1], arg[2]), parseNum(arg[3]), parseNum(arg[4]), brush);
				}
			} else
			{
				brush = parseBrush(arg, 9);
				if (typeof brush == "undefined")
				{
					g = new jxRect(parsePoint(arg[1], arg[2]), parseNum(arg[3]), parseNum(arg[4]), pen);
				} else
				{
					g = new jxRect(parsePoint(arg[1], arg[2]), parseNum(arg[3]), parseNum(arg[4]), pen, brush);
				}
			}
			g.draw(gr);
			break;
		case "circle":
			pen = parsePen(arg, 4);
			if (pen == null)
			{
				brush = parseBrush(arg, 4);
			} else
			{
				brush = parseBrush(arg, 8);
			}
			g = new jxCircle(parsePoint(arg[1], arg[2]), parseNum(arg[3]), pen, brush);
			g.draw(gr);
			break;
		//jxText(point<jxPoint>, text, [font<jxFont>], [pen<jxPen>], [brush<jxBrush>], [angle])
		//jxFont(family, weight, size, style, variant)
		case "text":
			pen = parsePen(arg, 5);
			if (pen == null)
			{
				brush = parseBrush(arg, 5);
			} else
			{
				brush = parseBrush(arg, 9);
			}
			g = new jxText(parsePoint(arg[1], arg[2]), arg[3], new jxFont(null, null, arg[4]+"pt", null, null), pen, brush);
			g.draw(gr);
			break;
		//jxImage(point<jxPoint>, url, width, height, [angle])
		case "image":
			g = new jxImage(parsePoint(arg[1], arg[2]), arg[3], parseNum(arg[4]), parseNum(arg[5]));
			g.draw(gr);
			break;
		}
	}
	var static_state = 0;
	var getStatic = function ()
	{
		switch (static_state)
		{
		// new, set static graphics
		case 0:
			self.php_comm.cmd = "method=setStaticGraphics";
			self.php_comm.commPhp();
			static_state = 1;
			break;
		// wait for receiving message of setting
		case 1:
			if ("ok" == self.php_comm.receive)
			{
				self.php_comm.receive = "";
				static_state = 2;
			}
			break;
		// get static graphics
		case 2:
			self.php_comm.cmd = "method=getStaticGraphics";
			self.php_comm.commPhp();
			static_state = 3;
			break;
		// wait for receiving message of getting
		case 3:
			if ("" != self.php_comm.receive)
			{
				var boundary = new jxRect(new jxPoint(0,0), self.width, self.height, new jxPen(new jxColor("grey"), "1px"));
				boundary.draw(gr);
				var g = self.php_comm.receive.split(", ");
				for (i in g)
				{
					drawGraphics(g[i]);
				}
				static_state = 4;
			}
			break;
		}
		if (4 != static_state)
		{
			setTimeout(getStatic, self.timeout);
		}
	}
	var plotStatic = function ()
	{
		// draw the static graphics by jsDraw2DX
		var home = new jxCircle(new jxPoint(30, 30), 20, new jxPen(new jxColor("blue"),'1px'));
		home.draw(gr);
		var patch1 = new jxCircle(new jxPoint(self.width - 30, self.height - 30), 20, new jxPen(new jxColor("green"),'1px'));
		patch1.draw(gr);
		var patch1 = new jxCircle(new jxPoint(30, self.height - 30), 20, new jxPen(new jxColor("green"),'1px'));
		patch1.draw(gr);
	}
	var clearGridFromServer = function ()
	{
		self.php_comm.cmd = "method=clearTraj2Grids";
		self.php_comm.commPhp();
	}
	var clearGrids = function ()
	{
		if (typeof grid == "undefined" || null == grid)
		{
			grid = new Array();
		}
		for (i in grid)
		{
			for (j in grid[i])
			{
				grid[i][j].remove();
			}
			grid[i] = new Array();
		}
		while (grid.length <= self.width / GRID_SIZE)
		{
			grid.push(new Array());
		}
	}
	var calGrid = function ()
	{
		self.grid_php_comm.cmd = "method=calTraj2Grid&width=" + self.width + "&height=" + self.height;
		self.grid_php_comm.commPhp();
document.getElementById("debug").innerHTML = "debug rec: " + self.grid_php_comm.receive;
		clearGrids();
		if (null == self.grid_php_comm.receive || "" == self.grid_php_comm.receive)
		{
			return;
		}
		var rec = self.grid_php_comm.receive.split(" ");
		// the format of the data is "x y color value"
		for (var i = 0; i + 3 < rec.length; i += 3)
		{
			var x = parseInt(rec[i]), y = parseInt(rec[i + 1]);
			if (typeof x == "undefined" || null == x || isNaN(x) || typeof y == "undefined" || null == y || isNaN(y))
			{
				continue;
			}
			grid[x][y] = new jxRect(new jxPoint(x * self.width / GRID_SIZE, y * self.width / GRID_SIZE), GRID_SIZE, GRID_SIZE, new jxPen(new jxColor("pink"), '1px'), new jxBrush(new jxColor("pink")));
			grid[x][y].draw(gr);
		}
	}
	/**
	 * plot periodically
	 * @public
	 */
	var update = function ()
	{
		var rn = self.robot_data.getNames();
		for (i in rn)
		{
			getData(rn[i]);
			var pos = new jxPoint(data[rn[i]][data[rn[i]].length - 1], data2[rn[i]][data2[rn[i]].length - 1]);
			if (rn[i] in body)
			{
				body[rn[i]].remove();
			} else
			{
				document.getElementById(self.canvas).getElementsByTagName("select")[1].innerHTML +=
						'<option value="' + rn[i] + '">' + rn[i] + '</option>';
			}
			body[rn[i]] = new jxCircle(pos, 10, new jxPen(new jxColor("black"),'1px'));
			body[rn[i]].draw(gr);
			if (rn[i] in dir)
			{
				dir[rn[i]].remove();
			}
			if (typeof yaw[rn[i]] != "undefined" && ! isNaN(yaw[rn[i]]))
			{
				var dir_pt = new jxPoint(data[rn[i]][data[rn[i]].length - 1] + Math.sin(yaw[rn[i]]) * 30, data2[rn[i]][data2[rn[i]].length - 1] + Math.cos(yaw[rn[i]]) * 30);
				dir[rn[i]] = new jxLine(pos, dir_pt, new jxPen(new jxColor("black"),'1px'));
				dir[rn[i]].draw(gr);
			}
			//test1.remove();
			//test1 = new jxArc(pos, 130, 100, -90, 90, new jxPen(new jxColor("red"),'1px'));
			//test1.draw(gr);
			if (rn[i] in line)
			{
					while (line[rn[i]].length >= self.total_points)
					{
						line[rn[i]][0].remove();
						line[rn[i]].shift();
					}
			} else
			{
				line[rn[i]] = new Array();
			}
			var len = Math.min(data[rn[i]].length - 1, data2[rn[i]].length - 1);
			var color = STATE_COLOR[0];
			if ("colorful" == view_type)
			{
				color = parseInt(self.robot_data.getData(rn[i], "state"));
				if (color < STATE_COLOR.length)
				{
					color = STATE_COLOR[color];
				} else
				{
					color = STATE_COLOR[0];
				}
			}
			line[rn[i]].push( new jxLine(new jxPoint(data[rn[i]][data[rn[i]].length - 2], data2[rn[i]][data2[rn[i]].length - 2]), new jxPoint(data[rn[i]][data[rn[i]].length - 1], data2[rn[i]][data2[rn[i]].length - 1]), new jxPen(new jxColor(color),'1px')) );
			line[rn[i]][line[rn[i]].length - 1].draw(gr);
			if ("energy" == view_type || "time" == view_type)
			{
				calGrid();
			}
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
			'<div id="' + self.placeholder + '" style="background-color:#fff;overflow:' + self.overflow + ';position:' + self.position + ';width:' + self.width + 'px;height:' + self.height + 'px;align:' + self.align + ';"></div>' +
			'<div class="input-prepend input-append" style="overflow:' + self.overflow + ';position:' + self.position + ';align:' + self.align + ';">' +
				'<form>' +
					'<input class="btn btn-primary" type="button" value="clear grids">' +
					'<span class="add-on">view</span>' +
					'<select name="view">' +
						'<option value="basic" selected="selected">basic</option>' +
						'<option value="energy">energy map</option>' +
						'<option value="time">time map</option>' +
						'<option value="colorful">state trajectory</option>' +
					'</select>' +
					'<span class="add-on">follow</span>' +
					'<select name="follow">' +
						'<option value="overview" selected="selected">overview</option>' +
					'</select>' +
				'</form>' +
			'</div>';
		document.getElementById(self.canvas).innerHTML = html;
		// add callback to clear grids button
		document.getElementById(self.canvas).getElementsByTagName("input")[0].onclick = function ()
		{
			clearGrids();
		}
		var select = document.getElementById(self.canvas).getElementsByTagName("select");
		// add callback to view select
		select[0].onclick = function ()
		{
			if (this.form.view.value == view_type)
				return;
			view_type = this.form.view.value;
		}
		// add callback to follow select
		select[1].onclick = function ()
		{
			if (this.form.follow.value == follow)
				return;
			follow = this.form.follow.value;
		}
		// if robot data is not defined, define one
		if (typeof self.robot_data == "undefined")
		{
			self.robot_data = new robotData();
			self.robot_data.update();
		}
		gr = new jxGraphics(document.getElementById(self.placeholder));
		getStatic();
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
	this.align = "center";
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
	this.width = "95%";
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
	this.total_points = 30;
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
			points: {show: true}
		},
		crosshair: {mode: "x"},
		zoom: {interactive: true},
		pan: {interactive: true},
		// it can adjust automatically
		//@bug still some bugs
		//yaxis: { min: 0, max: 100 },
		xaxis: { min: -this.total_points + 1, max: 0, zoomRange: [-this.total_points + 1, 0]},
		yaxis: {
			tickFormatter: function (v, axis)
			{
				return v.toFixed(2);
			}
		},
		grid: {show: true},
		legend: { position: "nw" },
		grid: {
			show: true,
			hoverable: true,
			autoHighlight: false
		}
	};
	this.safe_range_array = new Array();
	var dataset = new Object(), plot, robot_name = new Array(), label_name = new Array(), hover_pos;
	var self = this;
	var updateLegend = function ()
	{
		var pos = hover_pos;
		var axes = plot.getAxes();
		var ans, i = 0;
		for (var key in dataset)
		{
			if (("parameter" == self.label && ("frame" == key || "x" == key || "y" == key || "state" == key || "substate" == key))
				|| ("all" != self.label && "parameter" != self.label && self.label != key))
			{
				continue;
			}
			var series = dataset[key];
			if (typeof pos == "undefined" || pos.x < axes.xaxis.min || pos.x > axes.xaxis.max || pos.y < axes.yaxis.min || pos.y > axes.yaxis.max)
			{
				ans = series.data[series.data.length - 1][1];
				if (isNaN(ans) || 0 == ans)
				{
					ans = self.robot_data.getData(self.robot, key);
				}
			} else
			{
				var flag = false;
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
						flag = true;
						break;
					}
				}
				if (false == flag)
				{
					ans = 0;
				}
			}
			if ("state" != key && "substate" != key)
			{
				if (typeof ans == "string")
				{
					$("#" + self.placeholder + " .legendLabel").eq(i ++).text(series.label.replace(/=.*/, "= " + ans));
				}else
				{
					$("#" + self.placeholder + " .legendLabel").eq(i ++).text(series.label.replace(/=.*/, "= " + ans.toFixed(2)));
				}
			}
			else if ("state" == key)
			{
				ans = Math.round(ans);
				if (ans >= STATE.length)
				{
					ans = 0;
				}
				$("#" + self.placeholder + " .legendLabel").eq(i ++).text(series.label.replace(/=.*/, "= " + STATE[ans]));
			}
			else if ("substate" == key)
			{
				ans = Math.round(ans);
				if (ans >= SUBSTATE.length)
				{
					ans = 0;
				}
				$("#" + self.placeholder + " .legendLabel").eq(i ++).text(series.label.replace(/=.*/, "= " + SUBSTATE[ans]));
			}
		}
		setTimeout(updateLegend, 50);
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
				var flag = false;
				// if have corresponding safe-range
				for (var j in self.safe_range_array)
				{
					if (! self.safe_range_array[j].checked)
						break;
					if (self.safe_range_array[j].robot == self.robot && self.safe_range_array[j].label == i)
					{
						dataset[i].threshold.above = self.safe_range_array[j].max;
						dataset[i].threshold.below = self.safe_range_array[j].min;
						flag = true;
						break;
					}
				}
				if (false == flag)
				{
					dataset[i].threshold.above = undefined;
					dataset[i].threshold.below = undefined;
				}
				data.push( dataset[i] );
			}
		}
		else if ("parameter" == self.label)
		{
			for (i in dataset)
			{
				if ("frame" == i || "x" == i || "y" == i || "state" == i || "substate" == i)
				{
					continue;
				}
				var flag = false;
				// if have corresponding safe-range
				for (var j in self.safe_range_array)
				{
					if (! self.safe_range_array[j].checked)
						break;
					if (self.safe_range_array[j].robot == self.robot && self.safe_range_array[j].label == i)
					{
						dataset[i].threshold.above = self.safe_range_array[j].max;
						dataset[i].threshold.below = self.safe_range_array[j].min;
						flag = true;
						break;
					}
				}
				if (false == flag)
				{
					dataset[i].threshold.above = undefined;
					dataset[i].threshold.below = undefined;
				}
				data.push( dataset[i] );
			}
		} else
		{
			if (self.label in dataset)
			{
				var flag = false;
				// if have corresponding safe-range
				for (var j in self.safe_range_array)
				{
					if (! self.safe_range_array[j].checked)
						break;
					if (self.safe_range_array[j].robot == self.robot && self.safe_range_array[j].label == self.label)
					{
						dataset[self.label].threshold.above = self.safe_range_array[j].max;
						dataset[self.label].threshold.below = self.safe_range_array[j].min;
						flag = true;
						break;
					}
				}
				if (false == flag)
				{
					dataset[self.label].threshold.above = undefined;
					dataset[self.label].threshold.below = undefined;
				}
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
				dataset[i] = {label: i + " = 0.00", data: [], yaxis: cnt + 1, threshold: {color: "black"}};
			}
			var tmp = new Array();
			for (j in dataset[i].data)
			{
				if (typeof dataset[i].data[j][1] != "undefined" && ! isNaN(dataset[i].data[j][1]))
				{
					tmp.push(dataset[i].data[j][1]);
				} else
				{
					tmp.push(0);
				}
			}
			if (tmp.length > 0)
			{
				tmp = tmp.slice(1);
			}
			var y = 0;
			if (typeof data_ret != "undefined" && typeof data_ret[i] != "undefined" && typeof data_ret[i] != "string")
			{
				y = data_ret[i];
			}
			while (tmp.length < self.total_points)
			{
				tmp.push(0);
			}
			tmp.push(y);
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
		if (self.show_select)
		{
			for (var i in dataset)
			{
				if (label_name.indexOf(i) == -1)
				{
					label_name.push(i);
					document.getElementById(self.canvas).getElementsByTagName("select")[1].innerHTML += '<option value="' + i + '">' + i + '</option>';
				}
			}
		}
		// generate data according to the format of Flot based on self.label
		var data = new Array();
		if ("all" == self.label)
		{
			for (i in dataset)
			{
				var flag = false;
				// if have corresponding safe-range
				for (var j in self.safe_range_array)
				{
					if (! self.safe_range_array[j].checked)
						break;
					if (self.safe_range_array[j].robot == self.robot && self.safe_range_array[j].label == i)
					{
						dataset[i].threshold.above = self.safe_range_array[j].max;
						dataset[i].threshold.below = self.safe_range_array[j].min;
						flag = true;
						break;
					}
				}
				if (false == flag)
				{
					dataset[i].threshold.above = undefined;
					dataset[i].threshold.below = undefined;
				}
				data.push( dataset[i] );
			}
		}
		else if ("parameter" == self.label)
		{
			for (i in dataset)
			{
				if ("frame" == i || "x" == i || "y" == i || "state" == i || "substate" == i)
				{
					continue;
				}
				var flag = false;
				// if have corresponding safe-range
				for (var j in self.safe_range_array)
				{
					if (! self.safe_range_array[j].checked)
						break;
					if (self.safe_range_array[j].robot == self.robot && self.safe_range_array[j].label == i)
					{
						dataset[i].threshold.above = self.safe_range_array[j].max;
						dataset[i].threshold.below = self.safe_range_array[j].min;
						flag = true;
						break;
					}
				}
				if (false == flag)
				{
					dataset[i].threshold.above = undefined;
					dataset[i].threshold.below = undefined;
				}
				data.push( dataset[i] );
			}
		} else
		{
			if (self.label in dataset)
			{
				var flag = false;
				// if have corresponding safe-range
				for (var j in self.safe_range_array)
				{
					if (! self.safe_range_array[j].checked)
						break;
					if (self.safe_range_array[j].robot == self.robot && self.safe_range_array[j].label == self.label)
					{
						dataset[self.label].threshold.above = self.safe_range_array[j].max;
						dataset[self.label].threshold.below = self.safe_range_array[j].min;
						flag = true;
						break;
					}
				}
				if (false == flag)
				{
					dataset[self.label].threshold.above = undefined;
					dataset[self.label].threshold.below = undefined;
				}
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
					'<div id="' + self.placeholder + '" style="background-color:AliceBlue;align:center;width:' + self.width + ';height:' + self.height + ';"></div>' +
					'<form class="input-prepend input-append" align="' + self.align + '">' +
						'<button class="btn btn-primary" type="button" name="clear">clear</button>';
		if (self.show_select)
		{
			html += 	'<span class="add-on">robot</span>' +
						'<select name="robot">' +
							'<option value="" selected="selected">select:</option>' +
						'</select>' +
						'<span class="add-on">label</span>' +
						'<select name="label">' +
							'<option value="all" selected="selected">all</option>' +
							'<option value="parameter">parameter</option>' +
						'</select>';
		}
		html +=		'</form>';
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
		});
		updateLegend();
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
	var self = this, sound_timeout = 0;
	/**
	 * test if it in the safe-range
	 * @private
	 */
	var test_saferange = function (value)
	{
		if (self.checked && (value < self.min || value > self.max))
		{
			document.getElementById(self.canvas).getElementsByTagName("p")[1].innerHTML = '<font color="red">' + self.alarm_text + '</font>';
			//alert(self.alarm_text);
			if (0 == sound_timeout || new Date().getTime() - sound_timeout > 10000)
			{
				sound_timeout = new Date().getTime();
				//$.playSound("jquery-play-sound/alarma.wav");
				var span_list = document.getElementById(self.canvas).getElementsByTagName("span")
				span_list[span_list.length - 1].innerHTML = '<embed src="jquery-play-sound/ALARM.WAV" height="0%" width="0%" hidden="true" autostart="true" loop="false" />';
			}
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
			'<table border="' + self.border + '" align="' + self.align + '" width="' + self.width + '" style="background-color:AliceBlue;">' +
				'<tr align="' + self.align + '">' +
					'<td>' +
						'<form name="source" class="input-prepend input-append">' +
							'<span class="add-on">safe-range</span>' +
							'<label class="checkbox inline">' +
								'<input type="checkbox" name="work">' +
							'</label>' +
							'<span class="add-on">robot</span>' +
							'<input class="span2" type="text" name="robot" value="' + r + '">' +
							'<span class="add-on">label</span>' +
							'<input class="span2" type="text" name="label" value="' + l + '">' +
							'<input class="btn btn-primary" type="button" value="ok">' +
						'</form>' +
					'</td>' +
					'<td>' +
						'<form name="safe_range" class="input-prepend input-append">' +
							'<span class="add-on">min</span>' +
							'<input class="span2" type="text" name="min" value="' + self.min + '">' +
							'<span class="add-on">max</span>' +
							'<input class="span2" type="text" name="max" value="' + self.max + '">' +
							'<input class="btn btn-primary" type="button" value="ok">' +
						'</form>' +
					'</td>' +
					'<td width="5%">' +
						'<form name="safe_range" class="input-prepend input-append">' +
							'<span class="add-on"><p></p></span>' +
						'</form>' +
					'</td>' +
					'<td width="10%">' +
						'<form name="safe_range" class="input-prepend input-append">' +
							'<span class="add-on"><p>' + self.safe_text + '</p></span>' +
						'</form>' +
					'</td>' +
					'<td width="0%" height="0%">' +
						'<span><embed width="0%" height="0%" hidden="true" /></span>' +
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
	this.canvas = "trajGmap";
	this.debug = "debug";
	this.map_canvas = "map_canvas";
	this.border = 0;
	this.align = "center";
	this.width = "40%";
	this.debug = "debug";
	this.timeout = 300;
	this.robot_data;
	this.grid_php_comm = new phpComm();
	var STATE_ICON = [	[],
						[{icon: {path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW}, offset: "100%"}],
						[{icon: {path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4}, offset: '0', repeat: '20px'}],
						[{icon: {path: 'M -2,0 0,-2 2,0 0,2 z',	strokeColor: '#F00', fillColor: '#F00', fillOpacity: 1}, offset: '50%'}],
						[{icon: {path: 'M -2,-2 2,2 M 2,-2 -2,2', strokeColor: '#292', strokeWeight: 4}, offset: '50%'}],
						[{icon: {path: 'M -1,0 A 1,1 0 0 0 -3,0 1,1 0 0 0 -1,0M 1,0 A 1,1 0 0 0 3,0 1,1 0 0 0 1,0M -3,3 Q 0,5 3,3', strokeColor: '#00F', rotation: 0}, offset: '50%'}] ];
	this.map_options =
	{
		zoom: 17,
		center: new google.maps.LatLng(LAB[0], LAB[1]),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	var view_type = "basic", follow = "", map, update_grid = new Object();
	var last_coord = new Object(), coord = new Object(), rpath = new Object(), robot = new Object(), grid = new Object(), grid_value = new Object();
	var self = this;
	this.setMap = function (m)
	{
		map = m;
	}
	//@bug no longer useful
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
	var clearGrid = function ()
	{
		for (i in grid)
		{
			google.maps.event.clearListeners(grid[i], "click");
			grid[i].setMap(null);
		}
	}
	var coordToGrid = function (x, y)
	{
		var GRID_SIZE = .001;
		return [Math.round((x - LAB[0] - GRID_SIZE/2) / GRID_SIZE), Math.round((y - LAB[1] - GRID_SIZE/2) / GRID_SIZE)];
	}
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
					color = parseInt(self.robot_data.getData(i, "state"));
					if (color < STATE_COLOR.length)
					{
						color = STATE_COLOR[color]; //"#" + Math.floor(Math.random()*16777215).toString(16);
					} else
					{
						color = STATE_COLOR[0];
					}
					weight = 2;
					icon = parseInt(self.robot_data.getData(i, "substate"));
					if (icon < STATE_ICON.length)
					{
						icon = STATE_ICON[icon];
					} else
					{
						icon = STATE_COLOR[0];
					}

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
					icon: "resource/cabs.png",
					//shadow: {url: 'resource/cabs.shadow.png',}
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
	//@todo
	var calGrid = function ()
	{
		if (view_type == "energy" || view_type == "time")
		{
			// I guess it is the way to calculate the grid size
			// don't need to fix the size of grid
			var grid_size = .001; // * Math.pow(17, 10) / Math.pow(map.getZoom(), 10);
			var center_pos = coordToGrid(map.getCenter().lat(), map.getCenter().lng());
			self.grid_php_comm.cmd = "method=calGrid&grid_size=" + grid_size + "&type=" + view_type + "&centerx=" + center_pos[0] + "&centery=" + center_pos[1];
			self.grid_php_comm.commPhp();
			// separate the data into different grids
			var ret = self.grid_php_comm.receive.split(" ");
			var dist, min;
			update_grid = new Object();
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
				var tmp_grid;
				if ((x + " " + y) in grid)
				{
					tmp_grid = grid[x + " " + y];
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
				// old grid need to be deleted, and tmp_grid is used to avoid flashing
				if (typeof tmp_grid != "undefined")
				{
					google.maps.event.clearListeners(grid[x + " " + y], "click");
					tmp_grid.setMap(null);
				}
				// add the info window into the grid
				google.maps.event.addListener(grid[x + " " + y], "click", infoWnd);
				// save the grid value in order to be displayed on the info window
				grid_value[x + " " + y] = ret[i+3];
				update_grid[x + " " + y] = true;
			}
			for (i in grid)
			{
				if (! (i in update_grid) || ! update_grid[i])
				{
					google.maps.event.clearListeners(grid[i], "click");
					grid[i].setMap(null);
				}
			}
		}
		window.setTimeout(calGrid, self.timeout);
	}
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
	this.show = function ()
	{
		var html =
					'<form align="' + self.align + '">' +
						'<div class="input-prepend input-append" align="' + self.align + '">' +
							'<input class="btn btn-primary" type="button" value="clear grids">' +
							'<span class="add-on">view</span>' +
							'<select name="view">' +
								'<option value="basic" selected="selected">basic</option>' +
								'<option value="energy">energy map</option>' +
								'<option value="time">time map</option>' +
								'<option value="colorful">state trajectory</option>' +
							'</select>' +
							'<span class="add-on">follow</span>' +
							'<select name="follow">' +
								'<option value="none" selected="selected">none</option>' +
								'<option value="lab">lab</option>' +
							'</select>' +
						'</div>' +
					'</form>';
		document.getElementById(self.canvas).innerHTML = html;
		// clear grids
		document.getElementById(self.canvas).getElementsByTagName("input")[0].onclick = function ()
		{
			clearGrid();
			self.grid_php_comm.cmd = "method=clearGrids";
			self.grid_php_comm.commPhp();
		}
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
var rosCommCpp = function ()
{
	this.timeout = 100;
	this.pub_php_comm = new phpComm();
	this.sub_php_comm = new phpComm();
	var self = this;
	var publish = function ()
	{
		var name_value = document.getElementsByName("topicName")[0].value;
		var type_value = document.getElementsByName("topicType")[0].value;
		if (typeof name_value == "undefined" || null == name_value || "" == name_value || typeof type_value == "undefined" || null == type_value || "" == type_value)
		{
			putLog("Invalid name or type");
			return;
		}
		var msg_content = document.getElementsByName("topicMsg")[0].value;
		putLog("publishing via C++");
		self.pub_php_comm.cmd = "method=publishCpp&name=" + name_value + "&msg=" + msg_content;
		self.pub_php_comm.commPhp();
		putLog("Published topic (name: " + name_value + ", messageType: " + type_value + ")");
	}
	var last_rec = "";
	var updateSub = function ()
	{
		if (last_rec != sub_php_comm.receive)
		{
			putLog("Received message: " + sub_php_comm.receive, "log");
			last_rec = sub_php_comm.receive;
			return;
		} else
		{
			setTimeout(updateSub, self.timeout);
		}
	}
	var subscribe = function ()
	{
		var name_value = document.getElementsByName("topicName")[0].value;
		var type_value = document.getElementsByName("topicType")[0].value;
		if (typeof name_value == "undefined" || null == name_value || "" == name_value || typeof type_value == "undefined" || null == type_value || "" == type_value)
		{
			putLog("Invalid name or type");
			return;
		}
		putLog("subscribing via C++");
		self.sub_php_comm.cmd = "method=subscribeCpp&name=" + name_value;
		self.sub_php_comm.commPhp();
		updateSub();
		putLog("subscribed via C++");
	}
	this.show = function ()
	{
		document.getElementsByName("publishCpp")[0].onclick = publish;
		document.getElementsByName("subscribeCpp")[0].onclick = subscribe;
	}
}
var rosComm = function ()
{
	this.canvas = "rosComm";
	this.need_instruction = false;
	this.host = "";
	this.publish_num = 1;
	this.subscribe_str_num = 7;
	this.sub_str_name = ["/speech", "/d0/status", "/d1/status", "/status", "/d0/vslam/status", "/d1/vslam/status"];
	this.subscribe_value_num = 1;
	this.msg_log = true;
	var ros = null, last_speech = "";
	var self = this;
	this.putLog = function (msg, type)
	{
		if (typeof type == "undefined")
		{
			type = "system";
		}
		document.getElementsByName("msgLog")[0].innerHTML +=
			'[' + type + '] ' + msg +
			'<br />';
	}
	this.clearLog = function ()
	{
		self.putLog("Clearing log");
		document.getElementsByName("msgLog")[0].innerHTML = "";
	}
	this.closeRos = function ()
	{
		if (null == ros)
		{
			self.putLog("Already closed");
		}
		ros.close();
		self.putLog("Closed connection");
	}
	this.initRos = function ()
	{
		self.putLog("Initializing rosjs");
		if (null != ros)
		{
			self.closeRos();
		}
		ros = new ROS();
		if (typeof ros == "undefined" || null == ros)
		{
			self.putLog("Fail to initialize rosjs", "system");
		}
		self.putLog("Initialized rosjs", "system");
		// If there is an error on the backend, an 'error' emit will be emitted.
		ros.on('error', function(error) {
			self.putLog("Error from rosjs: " + error, "system");
		});
	}
	this.connectRos = function(host, port)
	{
		if (typeof host == "undefined" || null == host || "" == host || typeof port == "undefined" || null == port || "" == port)
		{
			self.putLog("Invalid server");
			return;
		}
		try {
			ros.connect('ws://' + host + ':' + port);
		} catch (err) {
			self.putLog("Fail to connect " + 'ws://' + host + ':' + port + " error: " + err);
			return;
		}
		self.putLog("Connected " + 'ws://' + host + ':' + port);
	}
	this.publishTopic = function (name_value, type_value, msg_content)
	{
		if (typeof name_value == "undefined" || null == name_value || "" == name_value || typeof type_value == "undefined" || null == type_value || "" == type_value)
		{
			self.putLog("Invalid name or type");
			return;
		}
		var topic = new ros.Topic({
			name        : name_value,
			messageType : type_value
		});
		// Then we create the payload to be published.
		var msg = new ros.Message({data: msg_content});
		topic.publish(msg);
		self.putLog("Published topic (name: " + name_value + ", messageType: " + type_value + ")");
	}
	this.subscribeTopic = function (name_value, type_value, content, ret_type, below, above)
	{
		if (typeof name_value == "undefined" || null == name_value || "" == name_value || typeof type_value == "undefined" || null == type_value || "" == type_value)
		{
			self.putLog("Invalid name or type");
			return;
		}
		var topic = new ros.Topic({
			name        : name_value,
			messageType : type_value
		});
		topic.unsubscribe();
		// Then we add a callback to be called every time a message is published on this topic.
		topic.subscribe(function (message)
		{
			var msg_tmp = "";
			for (i in message)
			{
				msg_tmp += i + ": " + message[i] + " ";
			}
			//self.putLog("Received msg: " + msg_tmp, "log");
			if (ret_type == "value")
			{
				if (! isNaN(parseFloat(message.data)) && isFinite(message.data))
				{
					var num = parseFloat(message.data);
					if (num < below || num > above)
					{
						content.style.color = "white";
						content.style.backgroundColor = "red";
					} else
					{
						content.style.color = "black";
						content.style.backgroundColor = "transparent";
					}
					content.value = num;
				} else
				{
					content.value = NaN;
				}
			}
			else if (ret_type == "speech")
			{
				content.value = msg_tmp;
				if (message.data != last_speech)
				{
					last_speech = message.data;
					speak(message.data);
				}
			} else
			{
				content.value = msg_tmp;
			}
		});
		self.putLog("Subscribed topic (name: " + name_value + ", messageType: " + type_value + ")", "system");
	}
	this.callService = function (name_value, type_value, request_value, content_placeholder)
	{
		self.putLog("Calling service");
		//@todo make it generic
		var service = new ros.Service({
		  name        : name_value,
		  serviceType : type_value
		});
		// Then we create a Service Request. The object we pass in to ros.ServiceRequest matches the fields defined in the rospy_tutorials' AddTwoInts.srv file.
		var request = new ros.ServiceRequest(request_value);
		// Finally, we call the /add_two_ints service and get back the results in the callback. The result is a ros.ServiceResponse object.
		service.callService(request, function (result)
		{
			self.putLog('Result for service call on ' + service.name + ': ' + result.sum, "log");
		});
	}
	this.setParam = function (name_value, param_value, placeholder)
	{
		ros.getParams(function (params)
		{
			self.putLog(params, "log");
		});
		var param = new ros.Param({
		  name: name_value
		});
		param.set(param_value);
		param.get(function (value)
		{
			self.putLog(name_value + ': ' + value, "log");
		});
	}
	this.getParam = function (name_value, param_value, placeholder)
	{
		var param = new ros.Param({
		  name: name_value
		});
		param.set(param_value);
		param.get(function (value)
		{
			self.putLog(name_value + ': ' + value, "log");
		});
	}
	this.getServerInfo = function (placeholder)
	{
		// Retrieves the current list of topics in ROS.
		ros.getTopics(function(topics) {
		  self.putLog('Current topics in ROS: ' + topics, "log");
		});
		// Fetches list of all active services in ROS.
		ros.getServices(function(services) {
		  self.putLog('Current services in ROS: ' + services, "log");
		});
		// Gets list of all param names.
		ros.getParams(function(params) {
		  self.putLog('Current params in ROS: ' + params, "log");
		});
	}
	var AddStrSub = function ()
	{
		var html =
				'<form align="center">' +
					'name<input type="text" name="topicName" value="" />' +
					'type<input type="text" name="topicType" value="" size="3" />' +
					'<input type="button" name="subStrTopic" value="Subscribe" />' +
					'<input type="text" name="topicContent" value="" size="120" />' +
				'</form>';
		document.getElementsByName("apilist")[0].innerHTML += html;
		// callbacks of substribe string
		var subs_str_list = document.getElementsByName("subStrTopic");
		for (var i = 0; i < subs_str_list.length; ++ i)
		{
			subs_str_list[i].onclick = function ()
			{
				self.subscribeTopic(this.form.topicName.value, this.form.topicType.value, this.form.topicContent, "string");
			}
		}
	}
	var AddValSub = function ()
	{
		var html =
				'<form align="center">' +
					'name<input type="text" name="topicName" value="" />' +
					'type<input type="text" name="topicType" value="" size="3" />' +
					'safe-range<input type="text" name="saferangebelow" value="0" size="5"  />' +
					'<input type="text" name="saferangeabove" value="100" size="5" />' +
					'<input type="button" name="subValTopic" value="Subscribe"/>' +
					'<input type="text" name="topicContent" value="" size="100" />' +
				'</form>';
		document.getElementsByName("apilist")[0].innerHTML += html;
		// callbacks of substribe value
		var subs_val_list = document.getElementsByName("subValTopic");
		for (var i = 0; i < subs_val_list.length; ++ i)
		{
			subs_val_list[i].onclick = function ()
			{
				self.subscribeTopic(this.form.topicName.value, this.form.topicType.value, this.form.topicContent, "value", this.form.saferangebelow.value, this.form.saferangeabove.value);
			}
		}
	}
	this.autoStart = function ()
	{
		self.connectRos(self.host, "9090");
		var subs_str_list = document.getElementsByName("subStrTopic");
		var subStrForm_list = document.getElementsByName("subStrForm");
		for (var i = 0; i < subs_str_list.length; ++ i)
		{
			if ("" == subStrForm_list[i].topicName.value)
			{
				continue;
			}
			var ret_type = (i == 0) ? "speech" : "string";
			self.subscribeTopic(subStrForm_list[i].topicName.value, subStrForm_list[i].topicType.value, subStrForm_list[i].topicContent, ret_type);
		}
	}
	this.show = function ()
	{
		var html = "";
		if (self.need_instruction)
		{
			html +=
				'<ol>' +
					'<li>roscore</li>' +
					'<li>rostopic pub /listener std_msgs/String "howdy"</li>' +
					'<li>rostopic echo /cmd_vel</li>' +
					'<li>rosrun rospy_tutorials add_two_ints_server</li>' +
					'<li>rosrun rosapi rosapi.py</li>' +
					'<li>rosrun rosbridge_server rosbridge.py</li>' +
				'</ol>';
		}
		html +=
			'<div align="center">' +
				'host<input type="text" name="host" value="' + self.host + '" />' +
				'port<input type="text" name="port" value="9090" />' +
				'<button>Open</button>' +
				'<button>Close</button>' +
				'<button>call service</button>' +
				'<button>set parameter</button>' +
				'<button>get parameter</button>' +
				'<button>get server info</button>' +
				//'<button name="publishCpp">Publish Topic via C++</button>' +
				//'<button name="subscribeCpp">Subscribe Topic via C++</button>' +
				'<button>Add String Subscription</button>' +
				'<button>Add Data Subscription</button>' +
			'</div>' +
			'<div name="apilist">';
		for (var i = 0; i < self.publish_num; ++ i)
		{
			html +=
				'<form align="center">' +
					'name<input type="text" name="topicName" value="" />' +
					'type<input type="text" name="topicType" value="" />' +
					'<input type="text" name="topicContent" value="" />' +
					'<input type="button" name="publishTopic" value="Publish Topic" />' +
				'</form>';
		}
		html +=
			'<form align="center" name="subStrForm">' +
				'name<input type="text" name="topicName" value="' + self.sub_str_name[0] + '" />' +
				'type<input type="text" name="topicType" value="std_msgs/String" />' +
				'<input type="button" name="subStrTopic" value="Subscribe" />' +
				'<input type="button" name="speech" onclick="" value="speak" />' +
				'<input type="text" name="topicContent" value="" style="height:6%;width:80%;font-size:12pt;" />' +
			'</form>';
		for (var i = 1; i < self.subscribe_str_num; ++ i)
		{
			var name = (self.sub_str_name.length > i) ? self.sub_str_name[i] : "";
			html +=
				'<form align="center" name="subStrForm">' +
					'name<input type="text" name="topicName" value="' + name + '" />' +
					'type<input type="text" name="topicType" value="std_msgs/String" />' +
					'<input type="button" name="subStrTopic" value="Subscribe" />' +
					'<input type="text" name="topicContent" value="" style="height:6%;width:80%;font-size:12pt;" />' +
				'</form>';
		}
		for (var i = 0; i < self.subscribe_value_num; ++ i)
		{
			html +=
				'<form align="center">' +
					'name<input type="text" name="topicName" value="" />' +
					'type<input type="text" name="topicType" value="std_msgs/Float32" size="3" />' +
					'safe-range<input type="text" name="saferangebelow" value="0" size="5"  />' +
					'<input type="text" name="saferangeabove" value="100" size="5" />' +
					'<input type="button" name="subValTopic" value="Subscribe"/>' +
					'<input type="text" name="topicContent" value="" size="100" />' +
				'</form>';
		}
		html += '</div>';
		if (self.msg_log)
		{
			html +=
				'<fieldset>' +
					'<legend>Message Log<button name="clearLog">Clear</button></legend>' +
					'<div name="msgLog"></div>' +
				'</fieldset>';
		}
		html += '<div id="audio"></div>';
		document.getElementById(self.canvas).innerHTML = html;
		document.getElementsByName("speech")[0].onclick = function ()
		{
			var speech = (this.form.topicContent.value == "") ? "Empty inside !" : this.form.topicContent.value;
			speak(speech);
		}
		var button_list = document.getElementById(self.canvas).getElementsByTagName("button");
		// callback of open
		button_list[0].onclick = function ()
		{
			self.connectRos(document.getElementsByName("host")[0].value, document.getElementsByName("port")[0].value);
		}
		// callback of close
		button_list[1].onclick = self.closeRos;
		// callback of callService
		button_list[2].onclick = function ()
		{
			self.callService('/add_two_ints', 'rospy_tutorials/AddTwoInts', { A: 1, B: 2}, null);
		}
		// callback of setParam
		button_list[3].onclick = function ()
		{
			self.setParam('max_vel_y', 0.8, null);
		}
		// callback of getParam
		button_list[4].onclick = function ()
		{
			self.getParam('favorite_color', 'red', null);
		}
		// callback of getServerInfo
		button_list[5].onclick = function ()
		{
			self.getServerInfo(null);
		}
		// callback of Add String Subscription
		button_list[6].onclick = AddStrSub;
		// callback of Add value Subscription
		button_list[7].onclick = AddValSub;
		// callbacks of publish
		var pub_list = document.getElementsByName("publishTopic");
		for (var i = 0; i < pub_list.length; ++ i)
		{
			pub_list[i].onclick = function ()
			{
				self.publishTopic(this.form.topicName.value, this.form.topicType.value, this.form.topicContent.value);
			}
		}
		// callbacks of substribe string
		var subs_str_list = document.getElementsByName("subStrTopic");
		subs_str_list[0].onclick = function ()
		{
			self.subscribeTopic(this.form.topicName.value, this.form.topicType.value, this.form.topicContent, "speech");
		}
		for (var i = 1; i < subs_str_list.length; ++ i)
		{
			subs_str_list[i].onclick = function ()
			{
				self.subscribeTopic(this.form.topicName.value, this.form.topicType.value, this.form.topicContent, "string");
			}
		}
		// callbacks of substribe value
		var subs_val_list = document.getElementsByName("subValTopic");
		for (var i = 0; i < subs_val_list.length; ++ i)
		{
			subs_val_list[i].onclick = function ()
			{
				self.subscribeTopic(this.form.topicName.value, this.form.topicType.value, this.form.topicContent, "value", this.form.saferangebelow.value, this.form.saferangeabove.value);
			}
		}
		var clear_log_list = document.getElementsByName("clearLog");
		if (clear_log_list.length > 0)
		{
			clear_log_list[0].onclick = function ()
			{
				self.clearLog(document.getElementsByName("msgLog")[0]);
			}
		}
		self.initRos();
	}
}
