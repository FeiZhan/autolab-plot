var HOST = "192.168.1.120", PORT = "6379", SECOND_HOST = "localhost";
var LAB = [49.276802, -122.914913], ROBOT_NAME = ["cb18", "cb01", "pi01"];
var phpComm = function (conf)
{
	this.receive = "";
	this.file = "";
	this.cmd = "";
	this.debug = "debug";
	this.rec_text = "receive";
	this.send_text = "send";
	this.send_time = "";
	this.rec_time = "";
	this.host = "localhost";//"192.168.1.120";
	this.port = "6379";
	for (var key in conf)
	{
		if (typeof(this[key]) === "undefined")
		{
			continue;
		}
		this[key] = conf[key];
	}
	var self = this;
	this.setHost = function (host, port)
	{
		this.host = host;
		this.port = port;
	}
	this.getRec = function ()
	{
		return this.receive;
	}
	this.commPhp = function (file, cmd)
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
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
			{
				this.rec_time = new Date().getTime();
				self.receive = xmlhttp.responseText;
document.getElementById(self.rec_text).innerHTML = "receive: " + xmlhttp.responseText;
			}
		}
		if (cmd == "")
		{
			cmd = "host=" + this.host + "&port=" + this.port;
		} else
		{
			cmd += "&host=" + this.host + "&port=" + this.port;
		}
		xmlhttp.open("GET", file + ".php?" + cmd, true);
document.getElementById(self.send_text).innerHTML = "send: " + file + ".php?" + cmd;
		xmlhttp.send();
		this.send_time = new Date().getTime();
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
document.getElementById(this.debug).innerHTML = "debug: " + key;
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
	this.host = HOST;
	this.port = PORT;
	this.rate = 1000;
	this.debug = "debug";
	for (var key in conf)
	{
		if (typeof(this[key]) === 'undefined')
		{
			continue;
		}
		this[key] = conf[key];
document.getElementById(this.debug).innerHTML = "debug: " + key;
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
document.getElementById(self.debug).innerHTML = "debug: " + self.host + " " + self.port + " " + self.rate;
		}
	}
}
var serverStatus = function (conf)
{
	this.canvas = "serverStatus";
	this.border = 1;
	this.width = "60%";
	this.align = "center";
	this.debug = "debug";
	this.max_count = 1000;
	this.count = 0;
	this.php_comm = new phpComm();
	this.timeout = 300;
	for (var key in conf)
	{
		if (typeof(this[key]) === "undefined")
		{
			continue;
		}
		this[key] = conf[key];
document.getElementById(this.debug).innerHTML = "debug: " + key;
	}
	this.db_status = new Array();
	var self = this;
	this.update = function ()
	{
		self.php_comm.commPhp("call_method", "method=status");
		var data = self.php_comm.receive.split(", ");
		for (var i = 0; i < data.length; ++ i)
		{
			var key_value = data[i].split(" ");
			if (key_value[0] == "")
			{
				continue;
			}
			var flag = false;
			for (var j = 0; j < self.db_status.length; ++ j)
			{
				if (key_value[0] == self.db_status[j])
				{
					var key_array = document.getElementsByTagName("p");
					for (var i = 0; i < key_array.length; ++ i)
					{
						if (key_array[i].innerHTML == key_value[0])
						{
							key_array[i+1].innerHTML = key_value[1];
							break;
						}
					}
					flag = true;
					break;
				}
			}
			if (false == flag && self.count < self.max_count)
			{
				++ self.count;
				self.db_status.push(key_value[0]);
				document.getElementById(self.canvas).getElementsByTagName("table")[0].innerHTML += 
					'<tr align="' + self.align + '">' +
						'<td><p>' + key_value[0] + '</p></td>' +
						'<td><p>' + key_value[1] + '</p></td>' +
					'</tr>';
			}
		}
		setTimeout(self.update, self.timeout);
	}
	this.show = function ()
	{
		var html = '<table border="' + this.border + '" width="' + this.width + '" align="' + this.align + '"></table>';
		document.getElementById(this.canvas).innerHTML = html;
		self.update();
	}
}
var keySetter = function (conf)
{
	this.canvas = "keySetter";
	this.border = 1;
	this.align = "center";
	this.heading = 1;
	this.key = ["cb18", "cb01"];
	this.value = ["@@@field_robot", "@@@random_robot"];
	this.init_num = 2;
	this.new_key = "";
	this.new_value = "";
	this.debug = "debug";
	this.php_comm = new phpComm();
	for (var key in conf)
	{
		if (typeof(this[key]) === "undefined")
		{
			continue;
		}
		this[key] = conf[key];
document.getElementById(this.debug).innerHTML = "debug: " + key;
	}
	var self = this;
	this.update = function ()
	{
		for (var i = 0; i < key.length; ++ i)
		{
			if (key[i] != undefined && key[i] != null && key[i] != "")
			{
				data += "&key" + i + "=" + key[i] + "&value" + i + "=" + value[i];
			}
		}
		//connect_redis("data_generator", data);
		self.php_comm.commPhp("data_generator", data);
		setTimeout(this.update, rate);
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
							'<td><input type="text" name="key" value="' + this.key[i] + '" /></td>' +
							'<td><input type="text" name="value" value="' + this.value[i] + '" size="100%" /></td>' +
							'<td><input type="button" value="submit" /></td>' +
						'</form>' +
					'</tr>';
		}
		html += '</table>';
		document.getElementById(this.canvas).innerHTML = html;
		var self = this;
		var submit_key = function ()
		{
			//[bug] new buttons do not work
//document.getElementById(self.debug).innerHTML = "debug: " + this.form;
			// how about one button to submit everything?
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
document.getElementById(self.debug).innerHTML = "debug: " + document.getElementById(self.canvas).getElementsByTagName("tr").length;
		}
		document.getElementById(this.canvas).getElementsByTagName("input")[0].onclick = addKey;
		add_submit_callback();
	}
}
var staticPlot = function (conf)
{
	this.canvas = "staticPlot";
	this.placeholder = "sp_placeholder";
	this.width = "100%";
	this.height = "300px";
	this.align = "center";
	this.key = "";
	this.debug = "debug";
	this.timeout = 300;
	this.php_comm = new phpComm();
	this.option = {
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
	for (var key in conf)
	{
		if (typeof(this[key]) === "undefined")
		{
			continue;
		}
		this[key] = conf[key];
document.getElementById(this.debug).innerHTML = "debug: " + key;
	}
	this.last_ret = "";
	var self = this;
	this.update = function()
	{
		var plot = $.plot("#" + this.placeholder, [[]], this.option);
		// update the plot periodically in order to plot the data from Redis
		function plot_update()
		{
			var rec = self.php_comm.receive;
			if (rec != self.last_ret)
			{
				// we have new data from Redis
				this.last_ret = rec;
				var tmp = rec.split(" ");
				var data = new Array();
				for (var i = 0; i < tmp.length; ++ i)
				{
					var tmp2 = parseFloat(tmp[i]);
					if (tmp2 == undefined || isNaN(tmp2))
					{
						continue;
					}
					data.push([i, tmp2]);
				}
				$.plot("#" + self.placeholder, [data], self.option);
			}
			setTimeout(plot_update, self.timeout);
		}
		plot_update();
	};
	this.show = function ()
	{
		var html =
			'<div id="' + this.placeholder + '" style="width:' + this.width + ';height:' + this.height + ';"></div>' +
			'<div align="' + this.align + '"><form>' +
				'key:<input type="text" name="key" value="' + this.key + '" />' +
				'<input type="button" value="submit" />' +
			'</form></div>';
		document.getElementById(this.canvas).innerHTML = html;
		var self = this;
		document.getElementById(this.canvas).getElementsByTagName("input")[1].onclick = function ()
		{
			var key = this.form.key.value;
			if (key != undefined && key != "")
			{
				//connect_redis("call_method", "method=get_key&key=" + key);
				self.php_comm.commPhp("call_method", "method=get_key&key=" + key);
			}
		}
		this.update();
	}
}
var trajPlot1 = function (conf)
{
	this.canvas = "trajPlot1";
	this.placeholder = "tp_placeholder";
	this.width = "600px";
	this.height = "500px";
	this.timeout = 300;
	this.total_points = 30;
	this.min = 0;
	this.max = 100;
	this.debug = "debug";
	this.php_comm = new phpComm();
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
	for (var key in conf)
	{
		if (typeof(this[key]) === "undefined")
		{
			continue;
		}
		this[key] = conf[key];
	}
	var self = this;
	this.update = function ()
	{
		var pos = [0, 0], data = [], data2 = [];
		function getData()
		{
			if (data.length > 0)
				data = data.slice(1);
			while (data.length < self.total_points)
			{
				var y = pos[0];
				if (y < self.min)
					y = self.min;
				if (y > self.max)
					y = self.max;
				data.push(y);
			}
			if (data2.length > 0)
				data2 = data2.slice(1);
			while (data2.length < self.total_points)
			{
				var y = pos[1];
				if (y < self.min)
					y = self.min;
				if (y > self.max)
					y = self.max;
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
		var plot = $.plot("#" + this.placeholder, [ getData() ], this.option);
		// update plots periodically
		function plot_update()
		{
			self.php_comm.commPhp("call_method", "method=get_robot_data");
			//connect_redis("get_robot_data", "");
			var tmp = self.php_comm.receive.split(", ");
			tmp = tmp[0];
			tmp = tmp.split(" ");
			pos[0] = parseFloat(tmp[1]);
			pos[1] = parseFloat(tmp[2]);
			plot.setData([ getData() ]);
			plot.draw();
			setTimeout(plot_update, self.timeout);
		}
		plot_update();
	};
	this.show = function ()
	{
		var html =
			'<div id="' + this.placeholder + '" style="width:' + this.width + ';height:' + this.height + ';"></div>';
		document.getElementById(this.canvas).innerHTML = html;
		this.update();
	}
}
var trajPlot2 = function (conf)
{
	this.canvas = "trajPlot2";
	this.placeholder = "graphics";
	this.overflow = "hidden";
	this.position = "relative";
	this.width = "600px";
	this.height = "600px";
	this.total_points = 30;
	this.timeout = 300;
	this.min = 0;
	this.max = 100;
	this.php_comm = new phpComm();
	this.debug = "debug";
	for (var key in conf)
	{
		if (typeof(this[key]) === "undefined")
		{
			continue;
		}
		this[key] = conf[key];
document.getElementById(this.debug).innerHTML = "debug: " + key;
	}
	this.update = function ()
	{
		var pos = [0, 0], data = [], data2 = [];
		var self = this;
		function getData()
		{
			if (data.length > 0)
				data = data.slice(1);
			while (data.length < self.total_points)
			{
				var y = pos[0];
				if (y < self.min)
					y = self.min;
				if (y > self.max)
					y = self.max;
				data.push(y);
			}
			if (data2.length > 0)
				data2 = data2.slice(1);
			while (data2.length < self.total_points)
			{
				var y = pos[1];
				if (y < self.min)
					y = self.min;
				if (y > self.max)
					y = self.max;
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
		// draw the static graphics by jsDraw2DX
		var gr = new jxGraphics(document.getElementById(this.placeholder));
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
		getData();
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
		function plot_update()
		{
			self.php_comm.commPhp("call_method", "method=get_robot_data");
			//connect_redis("get_robot_data", "");
			var tmp = self.php_comm.receive.split(", ");
			tmp = tmp[0];
			tmp = tmp.split(" ");
			pos[0] = parseFloat(tmp[1]);
			pos[1] = parseFloat(tmp[2]);
			getData();
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
			setTimeout(plot_update, self.timeout);
		}
		plot_update();
	};
	this.show = function ()
	{
		var html =
			'<div id="' + this.placeholder + '" style="overflow:' + this.overflow + ';position:' + this.position + ';width:' + this.width + ';height:' + this.height + ';"></div>';
		document.getElementById(this.canvas).innerHTML = html;
		this.update();
	}
}
var dynamicPlot = function (conf)
{
	this.canvas = "dynamicPlot";
	this.border = 0;
	this.table_width = "100%";
	this.table_height = "100%";
	this.placeholder = "dp_placeholder";
	this.width = "100%";
	this.height = "300px";
	this.text_width = "100px";
	this.debug = "debug";
	this.total_points = 100;
	this.timeout = 300;
	this.php_comm = new phpComm();
	this.option = {
		// drawing is faster without shadows
		series: {shadowSize: 0, lines: {show: true} },
		yaxis: { min: 0, max: 100 },
		xaxis: { min: -this.total_points + 1, max: 0},
		grid: {show: true},
	};
	for (var key in conf)
	{
		if (typeof(this[key]) === "undefined")
		{
			continue;
		}
		this[key] = conf[key];
document.getElementById(this.debug).innerHTML = "debug: " + key;
	}
	this.update = function ()
	{
		var label = ["valid", "x", "y", "voltage", "current"], data_ret = [];
		var self = this;
		for (var i = 0; i < label.length; ++ i)
		{
			data_ret[i] = 0;
		}
		var dataset = new Object();
		// generate the list of datasets by robot names and labels
		for (var j = 0; j < label.length; ++ j)
		{
			dataset[label[j]] = {label: label[j], data: []};
		}
		function getData()
		{
			self.php_comm.commPhp("call_method", "method=get_robot_data");
			var ret = self.php_comm.receive.split(" ");
			for (var i = 0; i < ret.length - 1; ++ i)
			{
				data_ret[i] = parseFloat(ret[i]);
			}
			var cnt = -1;
			for (i in dataset)
			{
				++ cnt;
				var tmp = new Array();
				for (j in dataset[i].data)
				{
					tmp.push(dataset[i].data[j][1]);
				}
				if (tmp.length > 0)
				{
					tmp = tmp.slice(1);
				}
				var y = 0;
				while (tmp.length < self.total_points)
				{
					y = data_ret[cnt];
					tmp.push(y);
				}
				// add the number to the corresponding label
				//document.getElementById("r"+ Math.floor(cnt/label.length) + (cnt%label.length)).innerHTML = dataset[i].label + ": " + Math.round(y*100)/100;
				//document.getElementById(self.canvas).getElementsByTagName("table")[2].innerHTML = '<tr>dfsfd</tr>';
//document.getElementById(self.debug).innerHTML = "debug: " + document.getElementById(self.canvas).getElementsByTagName("table")[0].innerText;
				// zip the generated y values with the x values
				var res = [];
				for (var j = 0; j < tmp.length; ++ j)
				{
					res.push([j + 1 - tmp.length, tmp[j]]);
				}
				dataset[i].data = res;
			}
		}
		getData();
		var data = new Array();
		for (var j = 1; j < label.length; ++ j)
		{
			data.push({label: dataset[label[j]].label, data: dataset[label[j]].data});
		}
		var plot = $.plot("#" + this.placeholder, data, this.option);
		function plot_update()
		{
			getData();
			var data = new Array();
			for (var j = 1; j < label.length; ++ j)
			{
				data.push( dataset[label[j]].data );
			}
			plot.setData( data );
			plot.draw();
			setTimeout(plot_update, self.timeout);
		}
		plot_update();
	};
	this.show = function ()
	{
		var html =
			'<table border="' + this.border + '" style="width:' + this.table_width + ';height:' + this.table_height + ';">' +
				'<tr>' +
					'<td><div id="' + this.placeholder + '" style="width:' + this.width + ';height:' + this.height + ';"></div></td>' +
					'<td width="' + this.text_width + '" align="center">' +
						'<a href="">robot</a>' +
						'<table border="1" align="center">' +
						'<tr><td>voltage</td></tr>' +
						'<tr><td>current</td></tr>' +
						'</table>' +
					'</td>' +
				'</tr>' +
			'</table>';
		document.getElementById(this.canvas).innerHTML = html;
		this.update();
	}
}
var safeRange = function (conf)
{
	this.canvas = "safeRange";
	this.border = 1;
	this.width = "80%";
	this.align = "center";
	this.sr_text = "safe-range";
	this.min = 0;
	this.max = 100;
	this.checked = false;
	this.safe_text = "safe";
	this.alert_text = "DANGER !";
	this.debug = "debug";
	this.timeout = 300;
	for (var key in conf)
	{
		if (typeof(this[key]) === "undefined")
		{
			continue;
		}
		this[key] = conf[key];
document.getElementById(this.debug).innerHTML = "debug: " + key;
	}
	this.test_saferange = function (value)
	{
		if (this.checked && (value < this.min || value > this.max))
		{
			document.getElementById(this.canvas).getElementsByTagName("p")[0].innerHTML = this.alert_text;
			alert(this.alert_text);
		} else
		{
			document.getElementById(this.canvas).getElementsByTagName("p")[0].innerHTML = this.safe_text;
		}
	}
	this.show = function ()
	{
		var html =
			'<table border="' + this.border + '" align="' + this.align + '" width="' + this.width + '">' +
				'<tr align="' + this.align + '">' +
					'<td><input type="checkbox" name="saferange">' + this.sr_text + '</td>' +
					'<td>' +
						'<form name="safe_range">' +
						'min<input type="text" name="min" value="' + this.min + '">' +
						'max<input type="text" name="max" value="' + this.max + '">' +
						'<input type="button" value="submit">' +
						'</form>' +
					'</td>' +
					'<td width="20%">' +
						'<p id="safe">' + this.safe_text + '</p>' +
					'</td>' +
				'</tr>' +
			'</table>';
		document.getElementById(this.canvas).innerHTML = html;
		var self = this;
		document.getElementById(this.canvas).getElementsByTagName("input")[0].onchange = function ()
		{
			self.checked = this.checked;
document.getElementById(self.debug).innerHTML = "debug: " + self.checked;
		}
		document.getElementById(this.canvas).getElementsByTagName("input")[3].onclick = function ()
		{
			self.min = this.form.min.value;
			self.max = this.form.max.value;
document.getElementById(self.debug).innerHTML = "debug: " + self.min + " " + self.max;
		}
		var update = function ()
		{
			var data = Math.round(Math.random() * 100);
document.getElementById(self.debug).innerHTML = "debug: " + data;
			self.test_saferange(data);
			setTimeout(update, self.timeout);
		};
		update();
	}
}
var trajGmap = function (conf)
{
	this.canvas = "trajGmap";
	this.debug = "debug";
	this.map_canvas = "map_canvas";
	this.border = 0;
	this.align = "center";
	this.width = "40%";
	this.debug = "debug";
	this.timeout = 300;
	this.mv_php_comm = new phpComm();
	this.grid_php_comm = new phpComm();
	this.map_options =
	{
		zoom: 17,
		center: new google.maps.LatLng(LAB[0], LAB[1]),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	this.view_type = "basic";
	this.follow = "";
	for (var key in conf)
	{
		if (typeof(this[key]) === "undefined")
		{
			continue;
		}
		this[key] = conf[key];
document.getElementById(this.debug).innerHTML = "debug: " + key;
	}
	this.map;
	var self = this;
	this.setMap = function (map)
	{
		this.map = map;
	}
	//[bug] no longer useful
	this.init = function ()
	{
		var map = new google.maps.Map(document.getElementById('map_canvas'),
			this.map_options);
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(LAB[0], LAB[1]),
			map: map,
			title: 'Autonomy Lab at Simon Fraser University'
		});
	}
	this.last_coord = new Array();
	this.coord = new Array();
	this.rpath = new Array();
	this.robot = new Array();
	this.grid = new Object();
	this.grid_value = new Object();
	// clear grid data from the map
	this.clear_grid = function ()
	{
		for (key in self.grid)
		{
			self.grid[key].setMap(null);
		}
document.getElementById("debug").innerHTML = "debug: " + self.view_type + " " + self.grid.length;
	}
	// transform the coordinate into grid position
	this.coord_to_grid = function (x, y)
	{
		var GRID_SIZE = .001;
		return [Math.round((x - LAB[0] - GRID_SIZE/2) / GRID_SIZE), Math.round((y - LAB[1] - GRID_SIZE/2) / GRID_SIZE)];
	}
	// pop up a info window on a grid
	this.info_wnd = function (event)
	{
		var grid_pos = self.coord_to_grid(event.latLng.lat(), event.latLng.lng());
		if (! ((grid_pos[0] + " " + grid_pos[1]) in self.grid_value))
		{
			return;
		}
		var info = '<table border="1"><tr><td>grid</td><td>('+grid_pos[0] + ", " + grid_pos[1]+')</td></tr>'
			+ '<tr><td>location</td><td>('+event.latLng.lat()+', '+event.latLng.lng()+')</td></tr>'
			+ '<tr><td>value</td><td>'+ self.grid_value[grid_pos[0] + " " + grid_pos[1]] +'</td></tr>'
			+ '<tr><td>color</td><td>'+ self.grid[grid_pos[0] + " " + grid_pos[1]].fillColor +'</td></tr></table>';
		var infownd = new google.maps.InfoWindow({
			content: info,
			position: event.latLng
		});
		infownd.open(self.map);
	}
	// generate the trajectory
	this.robot_move = function ()
	{
		self.mv_php_comm.commPhp("call_method", "method=get_robot_data");
		// separate the data into different robots
		var ret = self.mv_php_comm.receive.split(", ");
		for (var i = 0; i < ret.length; ++ i)
		{
			// separate the data into different values
			var j = ret[i].split(" ");
			// the 1st is x, and the 2nd is y
			var x = parseFloat(j[1]), y = parseFloat(j[2]);
			if (x == undefined || isNaN(x) || y == undefined || isNaN(y))
				continue;
			self.last_coord[i] = self.coord[i];
			self.coord[i] = [j[1], j[2]];
			if (self.coord[i][0] != self.last_coord[i][0] || self.coord[i][1] != self.last_coord[i][1])
			{
				// keep the length of path no longer than a threshold
				while (self.rpath[i].length >= 20)
				{
					self.rpath[i][0].setMap(null);
					self.rpath[i].splice(0, 1);
				}
				var color, weight, icon = [];
				// select if it is colorful
				if (self.view_type == "colorful")
				{
					color = "#" + Math.floor(Math.random()*16777215).toString(16);
					weight = 4;
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
				} else
				{
					color = "black";
					weight = 1;
				}
				if (typeof self.robot[i] != "undefined")
				{
					self.robot[i].setMap(null);
				}
				self.robot[i] = new google.maps.Marker({
					position: new google.maps.LatLng(self.coord[i][0], self.coord[i][1]),
					map: self.map,
					title:"robot" + i,
					icon: "cabs.png"
				});
				self.rpath[i].push(new google.maps.Polyline({
					map: self.map,
					path: [new google.maps.LatLng(self.last_coord[i][0], self.last_coord[i][1]), new google.maps.LatLng(self.coord[i][0], self.coord[i][1])],
					strokeColor: color,
					strokeOpacity: 1,
					strokeWeight: weight,
					icons: icon
				}));
			}
			if (self.follow == ""+i)
			{
				// let the map follow a robot
				self.map.panTo(self.robot[i].getPosition());
			}
		}
		window.setTimeout(self.robot_move, self.timeout);
	}
	// generate grids on energy or time distribution
	this.cal_grid = function ()
	{
		if (self.view_type == "energy" || self.view_type == "time")
		{
			//[bug] simply clear all grids in every iteration. Perhaps there is a better way
			self.clear_grid();
			var grid_size = .001 * Math.pow(17, 10) / Math.pow(self.map.getZoom(), 10);
			var center_pos = self.coord_to_grid(self.map.getCenter().lat(), self.map.getCenter().lng());
			var file = "call_method", cmd = "method=cal_grid&grid_size=" + grid_size + "&type=" + self.view_type + "&centerx=" + center_pos[0] + "&centery=" + center_pos[1];
			self.grid_php_comm.commPhp(file, cmd);
			// separate the data into different robots
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
				if (self.view_type == "energy")
				{
					color = "#FF" + color + color;
				}
				else if (self.view_type == "time")
				{
					color = "#" + color + color + "FF";
				}
				self.grid[x + " " + y] = new google.maps.Rectangle({
					strokeColor: 'grey',
					strokeOpacity: 0.2,
					strokeWeight: 1,
					fillColor: color,
					fillOpacity: 0.8,
					map: self.map,
					title: "value: " + ret[i+3],
					bounds: new google.maps.LatLngBounds(
						new google.maps.LatLng(LAB[0] + x * grid_size, LAB[1] + y * grid_size),
						new google.maps.LatLng(LAB[0] + x * grid_size + grid_size, LAB[1] + y * grid_size + grid_size))
				});
				google.maps.event.clearListeners(self.grid[x + " " + y], 'click');
				// add the info window into the grid
				google.maps.event.addListener(self.grid[x + " " + y], 'click', function(event)
				{
					self.info_wnd(event);
				});
				// save the grid value in order to be displayed on the info window
				self.grid_value[x + " " + y] = ret[i+3];
			}
		}
		window.setTimeout(self.cal_grid, self.timeout);
	}
	this.update = function ()
	{
		if (typeof self.map != "undefined" && self.map != null)
		{
			for (var i = 0; i < ROBOT_NAME.length; ++ i)
			{
				self.coord.push([LAB[0], LAB[1]]);
				self.rpath.push(new Array());
			}
			self.robot_move();
			self.cal_grid();
			google.maps.event.addListener(self.map, 'zoom_changed', function()
			{
				self.clear_grid();
			});
		}
		else
		{
			setTimeout(self.update, self.timeout);
		}
	}
	this.show = function ()
	{
		var html =
			'<table border="' + this.border + '" align="' + this.align + '" width="' + this.width + '" >' +
				'<tr>' +
					'<td>' +
						'<form align="' + this.align + '">' +
							'<select name="view">' +
								'<option value="basic" selected="selected">basic</option>' +
								'<option value="energy">energy map</option>' +
								'<option value="time">time map</option>' +
								'<option value="colorful">colorful trajectory</option>' +
							'</select>' +
						'</form>' +
					'</td>' +
					'<td>follow:' +
						'<form align="' + this.align + '">' +
							'<select name="follow">' +
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
		var select = document.getElementsByTagName("select");
		select[0].onclick = function ()
		{
			if (this.form.view.value == self.view_type)
				return;
			self.clear_grid();
			self.view_type = this.form.view.value;
		}
		select[1].onclick = function ()
		{
			if (this.form.follow.value == self.follow)
				return;
			self.follow = this.form.follow.value;
		}
		this.update();
	}
}
