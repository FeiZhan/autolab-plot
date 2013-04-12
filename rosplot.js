var rosComm = function ()
{
	this.canvas = "rosComm";
	this.need_instruction = true;
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
