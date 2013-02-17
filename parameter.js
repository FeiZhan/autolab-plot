//<script language="javascript" type="text/javascript" src="./flot/jquery.js"></script>
//<script language="javascript" type="text/javascript" src="./flot/jquery.flot.js"></script>

var host = "192.168.1.120", port = "6379", second_host = "localhost";
var LAB = [49.276802, -122.914913], ROBOT_NAME = ["cb18", "cb01", "pi01"];
var SERVER_RET = "", RET_ARRAY = new Object();
function connect_redis(file, cmd)
{
	var xmlhttp;
	if (window.XMLHttpRequest)
	{// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	}
	else
	{// code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange=function()
	{
		if (xmlhttp.readyState==4 && xmlhttp.status==200)
		{
document.getElementById("debug").innerHTML = 'return(' + file + ' ' + cmd + '): ' + xmlhttp.responseText;
			SERVER_RET = xmlhttp.responseText;
			RET_ARRAY[file] = xmlhttp.responseText;
		}
	}
	xmlhttp.open("GET",file + ".php?" + cmd, true);
	xmlhttp.send();
	// if there is no key in redis_ret, create one
	if (! ((file) in RET_ARRAY))
	{
		RET_ARRAY[file] = "";
	}
}
var labLogo = function (conf)
{
	this.canvas = "labLogo";
	this.border = 0;
	this.width = "100%";
	this.align = "center";
	this.logo_width = "30%";
	this.src = "logo.png";
	this.title = "Autolab Demonstration";
	this.debug = "debug";
	for (var key in conf)
	{
		if (typeof(this[key]) === 'undefined')
		{
			continue;
		}
		this[key] = conf[key];
		if ("" != this.debug)
		{
			document.getElementById(this.debug).innerHTML = "debug: " + key;
		}
	}
	this.show = function ()
	{
		var html = 
			'<table border="' + this.border + '" width="' + this.width + '" align="' + this.align + '">' +
				'<tr>' +
					'<td width="' + this.logo_width + '"><img src="' + this.src + '" alt="logo"></td>' +
					'<td><h1 align="' + this.align + '">' + this.title + '</h1></td>' +
				'</tr>' +
			'</table>';
		document.getElementById(this.canvas).innerHTML = html;
	}
}
var redisServer = function (conf)
{
	this.canvas = "redisServer";
	this.border = 0;
	this.align = "center";
	this.host = host;
	this.port = port;
	this.rate = 1000;
	this.debug = "debug";
	for (var key in conf)
	{
		if (typeof(this[key]) === 'undefined')
		{
			continue;
		}
		this[key] = conf[key];
		if ("" != this.debug)
		{
			document.getElementById(this.debug).innerHTML = "debug: " + key;
		}
	}
	this.getHost = function ()
	{
		return this.host;
	}
	this.getPort = function ()
	{
		return this.port;
	}
	this.getRate = function ()
	{
		return this.rate;
	}
	this.show = function ()
	{
		var html =
			'<table border="' + this.border + '" align="' + this.align + '">' +
				'<tr align="' + this.align + '">' +
					'<form>' +
						'<td>host<input type="text" name="host" value="' + this.host + '" /></td>' +
						'<td>port<input type="text" name="port" value="' + this.port + '" /></td>' +
						'<td>frame rate(ms^{-1})<input type="text" name="rate" value="' + this.rate + '" /></td>' +
						'<td><input type="button" value="submit" /></td>' +
					'</form>' +
				'</tr>' +
			'</table>';
		document.getElementById(this.canvas).innerHTML = html;
		var self = this;
		document.getElementById(this.canvas).getElementsByTagName("input")[3].onclick = function ()
		{
			self.host = this.form.host.value;
			self.port = this.form.port.value;
			self.rate = this.form.rate.value;
			if ("" != self.debug)
			{
				document.getElementById(self.debug).innerHTML = "debug: " + self.host + " " + self.port + " " + self.rate;
			}
		}
	}
}
var keySetter = function (conf)
{
	this.canvas = "keySetter";
	this.border = 1;
	this.align = "center";
	this.heading = 1;
	this.key = "cb18";
	this.value = "@@@field_robot";
	this.init_num = 2;
	this.new_key = "";
	this.new_value = "";
	this.debug = "debug";
	for (var key in conf)
	{
		if (typeof(this[key]) === 'undefined')
		{
			continue;
		}
		this[key] = conf[key];
		if ("" != this.debug)
		{
			document.getElementById(this.debug).innerHTML = "debug: " + key;
		}
	}
	this.show = function ()
	{
		var html =
			'<table border="' + this.border + '" align="' + this.align + '">';
		if (this.heading)
		{
			html +=
				'<tr align="' + this.align + '">' +
					'<td>key<input type="button" value="add key" /></td>' +
					'<td width="70%">value</td>' +
					'<td>submit</td>' +
				'</tr>';
		}
		for (var i = 0; i < this.init_num; ++ i)
		{
			html +=
					'<tr align="' + this.align + '">' +
						'<form>' +
							'<td><input type="text" name="key" value="' + this.key + '" /></td>' +
							'<td><input type="text" name="value" value="' + this.value + '" size="100%" /></td>' +
							'<td><input type="button" value="submit" /></td>' +
						'</form>' +
					'</tr>';
		}
		html += '</table>';
		document.getElementById(this.canvas).innerHTML = html;
		var self = this;
		var submit_key = function ()
		{
			if ("" != self.debug)
			{
				document.getElementById(self.debug).innerHTML = "debug: " + this.form;// + this.form.key.value + " " + this.form.value.value;
			}
		}
		// add callback function to every submit button (the amount of that is not reliable)
		var add_submit_callback = function ()
		{
			var button_array = document.getElementById(self.canvas).getElementsByTagName("input");
			var count = 0;
			for (var i in button_array)
			{
				if (i != 0 && "button" == button_array[i].type)
				{
					button_array[i].onclick = submit_key;
					count += i;
				}
			}
		}
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
			add_submit_callback();
			if ("" != self.debug)
			{
				document.getElementById(self.debug).innerHTML = "debug: " + document.getElementById(self.canvas).getElementsByTagName("tr").length;
			}
		}
		document.getElementById(this.canvas).getElementsByTagName("input")[0].onclick = addKey;
		add_submit_callback();
	}
}
var staticPlot = function ()
{
	this.canvas = "staticPlot";
	this.width = "100%";
	this.height = "300px";
	this.align = "center";
	this.key = "";
	this.debug = "debug";
	this.update = $(function()
	{
		var option = {
			series: {
				lines: {show: true},
				points: {show: true}
			},
			crosshair: {mode: "x"},
			grid: {
				show: true,
				hoverable: true,
				autoHighlight: false
			}};
		plot = $.plot("#placeholder", [[]], option);
		// update the plot periodically in order to plot the data from Redis
		function update()
		{
			if (SERVER_RET != last_ret)
			{
				// we have new data from Redis
				last_ret = SERVER_RET;
				var tmp = SERVER_RET.split(" "), data = new Array();
				for (var i = 0; i < tmp.length; ++ i)
				{
					var tmp2 = parseFloat(tmp[i]);
					if (tmp2 == undefined || isNaN(tmp2))
					{
						continue;
					}
					data.push([i, tmp2]);
				}
				$.plot("#placeholder", [data], option);
			}
			setTimeout(update, 300);
		}
		update();
	});
	this.show = function ()
	{
		document.getElementById(this.canvas).innerHTML =
			'<div id="placeholder" style="width:' + this.width + ';height:' + this.height + ';"></div>' +
			'<div align="' + this.align + '"><form>' +
				'key:<input type="text" name="key" value="' + this.key + '" />' +
				'<input type="button" value="submit" />' +
			'</form></div>';
		var self = this;
		document.getElementById(this.canvas).getElementsByTagName("input")[1].onclick = function ()
		{
			var key = this.form.key.value;
			if (key != undefined && key != "")
			{
				connect_redis("call_method", "method=get_key&key=" + key);
			}
		}
		//this.update();
	}
}
var trajPlot1 = function ()
{
	this.canvas = "trajPlot1";
	this.update = $(function ()
	{
		var ret = "", pos = [0, 0];
		var data = [], data2 = [], totalPoints = 30, pt = [];
		function getRandomData()
		{
			if (data.length > 0)
				data = data.slice(1);
			while (data.length < totalPoints)
			{
				//var prev = data.length > 0 ? data[data.length - 1] : 50;
				var y = pos[0];//prev + Math.random() * 10 - 5;
				if (y < 0)
					y = 0;
				if (y > 100)
					y = 100;
				data.push(y);
			}
			if (data2.length > 0)
				data2 = data2.slice(1);
			while (data2.length < totalPoints)
			{
				var prev = data2.length > 0 ? data2[data2.length - 1] : 0;
				var y = pos[1];//prev + Math.random() * 10 - 5;
				if (y < 0)
					y = 0;
				if (y > 100)
					y = 100;
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
		var options = {
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
			}
		};
		var plot = $.plot($("#placeholder"), [ getRandomData() ], options);
		// update plots periodically
		function update()
		{
			connect_redis("get_robot_data", "");
			var tmp = SERVER_RET.split(", ");
			tmp = tmp[0];
			tmp = tmp.split(" ");
			pos[0] = parseFloat(tmp[1]);
			pos[1] = parseFloat(tmp[2]);
			// update flot
			plot.setData([ getRandomData() ]);
			plot.draw();
			setTimeout(update, 200);
		}
		update();
	});
	this.show = function ()
	{
		document.getElementById(this.canvas).innerHTML =
			'<div id="placeholder" style="width:600px;height:500px;"></div>';
	}
}
var trajPlot2 = function ()
{
	this.canvas = "trajPlot2";
	this.update = function ()
	{
		var ret = "", pos = [0, 0];
		var data = [], data2 = [], totalPoints = 30, pt = [];
		function getRandomData()
		{
			if (data.length > 0)
				data = data.slice(1);
			while (data.length < totalPoints)
			{
				//var prev = data.length > 0 ? data[data.length - 1] : 50;
				var y = pos[0];//prev + Math.random() * 10 - 5;
				if (y < 0)
					y = 0;
				if (y > 100)
					y = 100;
				data.push(y);
			}
			if (data2.length > 0)
				data2 = data2.slice(1);
			while (data2.length < totalPoints)
			{
				var prev = data2.length > 0 ? data2[data2.length - 1] : 0;
				var y = pos[1];//prev + Math.random() * 10 - 5;
				if (y < 0)
					y = 0;
				if (y > 100)
					y = 100;
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
		var options = {
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
			}
		};
		// draw the static graphics by jsDraw2DX
		var gr = new jxGraphics(document.getElementById("graphics"));
		var boundary = new jxRect(new jxPoint(0,0), 600, 600, new jxPen(new jxColor("grey"),'1px'));
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
		var pos = new jxPoint(data2[data.length - 1] * 6, 600 - data[data.length - 1] * 6);
		var body = new jxCircle(pos, 10, new jxPen(new jxColor("black"),'1px'));
		body.draw(gr);
		var test1 = new jxArc(pos, 50, 10, -90, 90, new jxPen(new jxColor("red"),'1px'));
		test1.draw(gr);
		var line = [];
		for (var i = 0; i < data.length - 1; ++i)
		{
			line.push( new jxLine(new jxPoint(data2[i] * 6, 600 - data[i] * 6), new jxPoint(data2[i+1] * 6, 600 - data[i+1] * 6), new jxPen(new jxColor("pink"),'1px')) );
			line[i].draw(gr);
		}
		// update plots periodically
		function update()
		{
			connect_redis("get_robot_data", "");
			var tmp = SERVER_RET.split(", ");
			tmp = tmp[0];
			tmp = tmp.split(" ");
			pos[0] = parseFloat(tmp[1]);
			pos[1] = parseFloat(tmp[2]);
			// update the trajectory by jsDraw2DX
			pos = new jxPoint(data2[data.length - 1] * 6, 600 - data[data.length - 1] * 6);
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
			setTimeout(update, 200);
		}
		update();
	};
	this.show = function ()
	{
		document.getElementById(this.canvas).innerHTML =
			'<div id="graphics" style="overflow:hidden;position:relative;width:1000px;height:1000px;"></div>';
		this.update();
	}
}
var dynamicPlot = function ()
{
	this.canvas = "dynamicPlot";
	this.border = 0;
	this.table_width = "100%";
	this.table_height = "100%";
	this.placehoder = "placeholder1";
	this.width = "1300px";
	this.height = "400px";
	this.update = $(function ()
	{
		var totalPoints = 80, trajLen = 5, label = ["valid", "x", "y", "speed", "voltage", "current"];
		var robotNum = 3, data_ret = [];
		for (var i = 0; i < robotNum * label.length; ++ i)
		{
			data_ret[i] = 0;
		}
		var dataset = {};
		// generate the list of datasets by robot names and labels
		for (var i = 0; i < robotNum; ++ i)
		{
			for (var j = 0; j < label.length; ++ j)
			{
				if (label[j] == "valid")
				{
					// set the default valid as true
					dataset[ROBOT_NAME[i] + label[j]] = {label: label[j], data: 1};
				} else
				{
					dataset[ROBOT_NAME[i] + label[j]] = {label: label[j], data: []};
				}
			}
		}
		var gridNum = 10, energy = [];
		for (var i = 0; i < gridNum * gridNum; ++ i)
		{
			energy[i] = 0;
		}
		// call PHP to calculate the energy in order to plot the energy grids
		function calEnergy()
		{
			var xmlhttp;
			if (window.XMLHttpRequest)
			{// code for IE7+, Firefox, Chrome, Opera, Safari
				xmlhttp=new XMLHttpRequest();
			}
			else
			{// code for IE6, IE5
				xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			xmlhttp.onreadystatechange=function()
			{
				if (xmlhttp.readyState==4 && xmlhttp.status==200)
				{
					var ret = xmlhttp.responseText.split(" ");
					//document.getElementById("debug").innerHTML = 'debug: ' + xmlhttp.responseText;
					for (var i = 0; i < ret.length - 1; ++ i)
					{
						energy[i] = parseFloat(ret[i]);
					}
				}
			}
			xmlhttp.open("GET","calEnergy.php",true);
			xmlhttp.send();
		}
		// get data from connect_redis()
		function updateData()
		{
			connect_redis("call_method", "method=get_robot_data");
			var ret = SERVER_RET.split(" ");
			for (var i = 0; i < ret.length - 1; ++ i)
			{
				data_ret[i] = parseFloat(ret[i]);
			}
			var cnt = -1;
			for (i in dataset)
			{
				++ cnt;
				if (cnt % label.length == 0)
				{
					dataset[i].data = (data_ret[cnt] != 0);
					if (dataset[i].data)
					{
						document.getElementById("r"+ Math.floor((cnt+1)/(label.length-1)) + 0).innerHTML = dataset[i].label + ": true";
					} else
					{
						document.getElementById("r"+ Math.floor((cnt+1)/(label.length-1)) + 0).innerHTML = dataset[i].label + ": false";
					}
				} else
				{
					var tmp = [];
					for (j in dataset[i].data)
					{
						tmp.push(dataset[i].data[j][1]);
					}
					if (tmp.length > 0)
					{
						tmp = tmp.slice(1);
					}
					var y = 0;
					while (tmp.length < totalPoints)
					{
						y = data_ret[cnt];
						//y = Math.floor(Math.random() * 100);
						tmp.push(y);
					}
					// add the number to the corresponding label
					document.getElementById("r"+ Math.floor(cnt/label.length) + (cnt%label.length)).innerHTML = dataset[i].label + ": " + Math.round(y*100)/100;
					// zip the generated y values with the x values
					var res = [];
					for (var j = 0; j < tmp.length; ++ j)
					{
						res.push([j + 1 - tmp.length, tmp[j]]);
					}
					dataset[i].data = res;
				}
			}
		}
		// plot an array of plots
		updateData();
		var plot = new Array();
		for (var i = 0; i < robotNum; ++ i)
		{
			var data = [];
			for (var j = 3; j < label.length; ++ j)
			{
				data.push({label: dataset[ROBOT_NAME[i]+label[j]].label, data: dataset[ROBOT_NAME[i]+label[j]].data});
			}
			plot[i] = $.plot($("#placeholder"+i), data, {
				// drawing is faster without shadows
				series: {shadowSize: 0, lines: {show: true} },
				yaxis: { min: 0, max: 100 },
				xaxis: { min: -totalPoints + 1, max: 0},
				grid: {show: true},
			});
		}
		// draw the graphics by jsDraw2DX
		var size = [1200, 900], enlarge = 8;
		var gr = new jxGraphics(document.getElementById("graphics"));
		var boundary = new jxRect(new jxPoint(0,0), size[0], size[1], new jxPen(new jxColor("grey"),'1px'));
		boundary.draw(gr);
		var grid = [], color = [];
		calEnergy();
		for (var i = 0; i < gridNum; ++ i)
		{
			for (var j = 0; j < gridNum; ++ j)
			{
				color[(i+1)*(j+1)-1] = Math.round(energy[(i+1)*(j+1)-1]);
				color[(i+1)*(j+1)-1] = (255 - color[(i+1)*(j+1)-1] * color[(i+1)*(j+1)-1]).toString(16);
				if (color[(i+1)*(j+1)-1].length == 1)
				{
					color[(i+1)*(j+1)-1] = "0" + color[(i+1)*(j+1)-1];
				}
				color[(i+1)*(j+1)-1] = "#FF" + color[(i+1)*(j+1)-1] + color[(i+1)*(j+1)-1];
				grid[(i+1)*(j+1)-1] = new jxRect(new jxPoint(i * size[0] / gridNum, j * size[1] / gridNum), size[0] / gridNum, size[1] / gridNum, new jxPen(new jxColor("grey"),'1px'), new jxBrush(new jxColor(color[(i+1)*(j+1)-1])));
				grid[(i+1)*(j+1)-1].draw(gr);
			}
		}
		var home = new jxCircle(new jxPoint(30, 30), 20, new jxPen(new jxColor("blue"),'1px'));
		home.draw(gr);
		var patch1 = new jxCircle(new jxPoint(size[0]-30, size[1]-30), 20, new jxPen(new jxColor("green"),'1px'));
		patch1.draw(gr);
		var patch2 = new jxCircle(new jxPoint(30, size[1]-30), 20, new jxPen(new jxColor("green"),'1px'));
		patch2.draw(gr);
		// draw the robots
		var body = [], line = [];
		for (var i = 0; i < robotNum; ++ i)
		{
			document.getElementById("t"+i).innerHTML = "( " + 
			dataset[ROBOT_NAME[i]+"x"].data[dataset[ROBOT_NAME[i]+"x"].data.length 
			- 1][1] + ", " + 
				dataset[ROBOT_NAME[i]+"y"].data[dataset[ROBOT_NAME[i]+"y"].data.length - 1][1] + " )";
			var pos = new 
			jxPoint(dataset[ROBOT_NAME[i]+"x"].data[dataset[ROBOT_NAME[i]+"x"].data.length - 1][1] * enlarge, dataset[ROBOT_NAME[i]+"y"].data[dataset[ROBOT_NAME[i]+"y"].data.length - 1][1] * enlarge);
			body[i] = new jxCircle(pos, 20, new jxPen(new jxColor("black"),'1px'));
			body[i].draw(gr);
			for (var j = 0; j < trajLen; ++ j)
			{
				line.push( new jxLine(new jxPoint(0, 0), new jxPoint(0, 0), new jxPen(new jxColor("red"),'1px')) );
				line[(i+1)*(j+1)-1].draw(gr);
			}
			//var test1 = new jxArc(pos, 100, 180, -90, 90, new jxPen(new jxColor("red"),'1px'));
			//test1.draw(gr);
		}
		// update dynamically
		function update()
		{
			updateData();
			// update plots
			for (var i = 0; i < robotNum; ++ i)
			{
				var data = [];
				for (var j = 3; j < label.length; ++ j)
				{
					data.push( dataset[ROBOT_NAME[i]+label[j]].data );
				}
				plot[i].setData( data );
				plot[i].draw();
			}
			// update the colors of the energy grids
			calEnergy();
			for (var i = 0; i < gridNum; ++ i)
			{
				for (var j = 0; j < gridNum; ++ j)
				{
					var pos = i * gridNum + j;
					color[pos] = Math.round(energy[pos]);
					color[pos] = 255 - color[pos] * color[pos];
					if (color[pos] < 0)
						color[pos] = 0;
					color[pos] = color[pos].toString(16);
					if (color[pos].length == 1)
					{
						color[pos] = "0" + color[pos];
					}
					color[pos] = "#FF" + color[pos] + color[pos];
					grid[pos] = new jxRect(new jxPoint(i * size[0] / gridNum, j * size[1] / gridNum), size[0] / gridNum, size[1] / gridNum, new jxPen(new jxColor("grey"),'1px'), new jxBrush(new jxColor(color[pos])));
					grid[pos].draw(gr);
				}
			}
			// update the trajectory by jsDraw2DXvar
			for (var i = 0; i < robotNum; ++ i)
			{
				document.getElementById("t"+i).innerHTML = "( " + dataset[ROBOT_NAME[i]+"x"].data[dataset[ROBOT_NAME[i]+"x"].data.length - 1][1] + ", " + dataset[ROBOT_NAME[i]+"y"].data[dataset[ROBOT_NAME[i]+"y"].data.length - 1][1] + " )";
				pos = new jxPoint(dataset[ROBOT_NAME[i]+"x"].data[dataset[ROBOT_NAME[i]+"x"].data.length - 1][1] * enlarge, dataset[ROBOT_NAME[i]+"y"].data[dataset[ROBOT_NAME[i]+"y"].data.length - 1][1] * enlarge);
				body[i].remove();
				if (dataset[ROBOT_NAME[i]+"valid"].data)
				{
					body[i] = new jxCircle(pos, 20, new jxPen(new jxColor("black"),'1px'));
					body[i].draw(gr);
				}
				for (var j = 0; j < trajLen; ++j)
				{
					var p = i * robotNum + j;
					line[p].remove();
					if (dataset[ROBOT_NAME[i]+"valid"].data)
					{
						line[p] = new jxLine(
							new jxPoint(
							dataset[ROBOT_NAME[i]+"x"].data[dataset[ROBOT_NAME[i]+"x"].data.length - 1 - j][1] * enlarge,
							dataset[ROBOT_NAME[i]+"y"].data[dataset[ROBOT_NAME[i]+"y"].data.length - 1 - j][1] * enlarge ),
							new jxPoint(
							dataset[ROBOT_NAME[i]+"x"].data[dataset[ROBOT_NAME[i]+"x"].data.length - 2 - j][1] * enlarge,
							dataset[ROBOT_NAME[i]+"y"].data[dataset[ROBOT_NAME[i]+"y"].data.length - 2 - j][1] * enlarge ),
							new jxPen(new jxColor("red"),'1px'));
						line[p].draw(gr);
					}
				}
			}
			setTimeout(update, 1000);
		}
		update();
	});
	this.show = function ()
	{
		var html =
			'<table border="' + this.border + '" style="width:' + this.table_width + ';height:' + this.table_height + ';">' +
				'<tr>' +
					'<td><div id="' + this.placehoder + '" style="width:' + this.width + ';height:' + this.height + ';"></div></td>' +
					'<td style="width:100px">' +
						'<a href="">cb01</a>' +
						'<p>data:</p>' +
					'</td>' +
				'</tr>' +
			'</table>';
		document.getElementById(this.canvas).innerHTML = html;
	}
}
var safeRange = function ()
{
	this.canvas = "safeRange";
	this.border = 1;
	this.width = "80%";
	this.align = "center";
	this.sr_word = "safe-range";
	this.min = 0;
	this.max = 100;
	this.safe_word = "safe";
	this.alert_word = "DANGER !";
	this.debug = "debug";
	this.update = $(function ()
	{
		var totalPoints = 300, plotNum = 1, trajLen = 20, trajPlotNum = 1;
		var labels = ["voltage", "current", "speed"];
		var dataset = {
			"0v": {label: labels[0], data: []},
			"0c": {label: labels[1], data: []},
			"0s": {label: labels[2], data: []},
			"1v": {label: labels[0], data: []},
			"1c": {label: labels[1], data: []},
			"1s": {label: labels[2], data: []},
			"2v": {label: labels[0], data: []},
			"2c": {label: labels[1], data: []},
			"2s": {label: labels[2], data: []},
			"3v": {label: labels[0], data: []},
			"3c": {label: labels[1], data: []},
			"3s": {label: labels[2], data: []},
			"0x": {label: ROBOT_NAME[0], data: []},
			"0y": {label: ROBOT_NAME[0], data: []},
			"1x": {label: ROBOT_NAME[1], data: []},
			"1y": {label: ROBOT_NAME[1], data: []}, }
		var redis_ret = 0;
		function test_saferange(value)
		{
	document.getElementById("debug").innerHTML = 'debug: ' + value;
			if (saferange && (value < sr_min || value > sr_max))
			{
				document.getElementById("safe").innerHTML = 'DANGER !!!';
				alert("DANGER !!!");
			} else
			{
				document.getElementById("safe").innerHTML = 'safe';
			}
		}
		function getData(label) {
			if (dataset[label] == undefined)
				return [0, 0];
			if (dataset[label].data.length > 0)
				dataset[label].data = dataset[label].data.slice(1);
			while (dataset[label].data.length < totalPoints)
			{
				var prev = dataset[label].data.length > 0 ? dataset[label].data[dataset[label].data.length - 1] : 0;
				var y = prev + Math.random() * 10 - 5;
				if (y < 0)
					y = 0;
				if (y > 100)
					y = 100;
				dataset[label].data.push(y);
			}
				if (label[1] == "v")
				{
					test_saferange(y);
				}
			if (label[1] == "v" || label[1] == "c" || label[1] == "s")
			{
				document.getElementById(label[1]).innerHTML = dataset[label].label + ": " + Math.round(y);
			}
			// zip the generated y values with the x values
			var res = [];
			for (var i = 0; i < dataset[label].data.length; ++ i)
				res.push([i + 1 - dataset[label].data.length, dataset[label].data[i]])
			return res;
		}
		var options = {
			// drawing is faster without shadows
			series: {shadowSize: 0, lines: {show: true} },
			yaxis: { min: 0, max: 100 },
			xaxis: { min: -totalPoints + 1, max: 0},
			grid: {show: true},
		};
		var plot = new Array();
		for (var i = 0; i < plotNum; ++ i)
		{
			var data = [{label: dataset[i+"v"].label, data: getData(i+"v")},
			{label: dataset[i+"c"].label, data: getData(i+"c")},
			{label: dataset[i+"s"].label, data: getData(i+"s")} ];
			plot[i] = $.plot($("#placeholder"+i), data, options);
		}
		var res = new Array();
		for (var i = 0; i < trajPlotNum; ++ i)
		{
			getData(i+"x");
			getData(i+"y");
			var len = dataset[i+"y"].data.length > dataset[i+"x"].data.length ? dataset[i+"x"].data.length : dataset[i+"y"].data.length;
			var init = len > trajLen ? len - trajLen : 0;
			res[i] = [];
			for (var j = init; j < len; ++ j)
				res[i].push([dataset[i+"x"].data[j], dataset[i+"y"].data[j]]);
		}
		function update()
		{
			for (var i = 0; i < plotNum; ++ i)
			{
				var data = [getData(i+"v"), getData(i+"c"), getData(i+"s")];
				plot[i].setData(data);
				plot[i].draw();
			}
			setTimeout(update, 100);
		}
		update();
	});
	this.show = function ()
	{
		var html =
			'<table border="' + this.border + '" align="' + this.align + '" width="' + this.width + '">' +
				'<tr align="' + this.align + '">' +
					'<td><input type="checkbox" name="saferange" value="1">' + this.sr_word + '</td>' +
					'<td>' +
						'<form name="safe_range">' +
						'min<input type="text" name="min" value="' + this.min + '">' +
						'max<input type="text" name="max" value="' + this.max + '">' +
						'<input type="button" value="submit" onClick="value_saferange(this.form)">' +
						'</form>' +
					'</td>' +
					'<td width="20%">' +
						'<p id="safe">' + this.safe_word + '</p>' +
					'</td>' +
				'</tr>' +
			'</table>';
		document.getElementById(this.canvas).innerHTML = html;
		var self = this;
		document.getElementById(this.canvas).getElementsByTagName("input")[0].onchange = function ()
		{
document.getElementById(self.debug).innerHTML = "debug: " + this.checked;
		}
		document.getElementById(this.canvas).getElementsByTagName("input")[3].onclick = function ()
		{
document.getElementById(self.debug).innerHTML = "debug: " + this.form.min.value + " " + this.form.max.value;
		}
	}
}
function init()
{
	var mapOptions =
	{
		zoom: 17,
		center: new google.maps.LatLng(LAB[0], LAB[1]),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	var map = new google.maps.Map(document.getElementById("map_canvas"),
		mapOptions);
document.getElementById("debug").innerHTML = "debug: " + document.getElementById("map_canvas");
}
var trajGmap = function ()
{
	this.canvas = "trajGmap";
	this.debug = "debug";
	this.map_canvas = "map_canvas";
	this.border = 0;
	this.init = function ()
	{
document.getElementById(this.debug).innerHTML = "debug: " + "update";
		/*var mapOptions =
		{
			zoom: 17,
			center: new google.maps.LatLng(LAB[0], LAB[1]),
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		var map = new google.maps.Map(document.getElementById('map_canvas'),
			mapOptions);
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(LAB[0], LAB[1]),
			map: map,
			title: 'Autonomy Lab at Simon Fraser University'
		});*/
	}
	this.show = function ()
	{
		var html =
			'<div id="map_canvas"></div>' +
			'<table border="0" align="center" width="40%" >' +
				'<tr>' +
					'<td>' +
						'<form align="center">' +
							'<select name="view" onClick="change_view(this.form)">' +
								'<option value="basic" selected="selected">basic</option>' +
								'<option value="energy">energy map</option>' +
								'<option value="time">time map</option>' +
								'<option value="colorful">colorful trajectory</option>' +
							'</select>' +
						'</form>' +
					'</td>' +
					'<td>follow:' +
						'<form align="center">' +
							'<select name="follow" onClick="follow_robot(this.form)">' +
								'<option value="none" selected="selected">none</option>' +
								'<option value="0">0</option>' +
								'<option value="1">1</option>' +
								'<option value="2">2</option>' +
							'</select>' +
						'</form>' +
					'</td>' +
				'</tr>' +
			'</table>';
		document.getElementById(this.canvas).innerHTML = html;
		var self = this;
		//google.maps.event.addDomListener(window, 'load', init);
	}
}
