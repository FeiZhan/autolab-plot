var ros = null;
var putLog = function (msg, type)
{
	if (typeof type == "undefined")
	{
		type = "log";
	}
	document.getElementsByName("msgLog")[0].innerHTML +=
		'[' + type + '] ' + msg +
		'<br />';
}
var clearLog = function ()
{
	putLog("Clearing log", "system");
	document.getElementsByName("msgLog")[0].innerHTML = "";
}
var closeRos = function ()
{
	ros.close();
	putLog("Closed connection", "system");
}
var initRos = function ()
{
	putLog("Initializing rosjs", "system");
	ros = new ROS();
	if (typeof ros == "undefined" || null == ros)
	{
		putLog("Fail to initialize rosjs", "system");
	}
	putLog("Initialized rosjs", "system");
	// If there is an error on the backend, an 'error' emit will be emitted.
	ros.on('error', function(error) {
		putLog("Error from rosjs: " + error, "system");
	});
}
var connectRos = function()
{
	var host = document.getElementsByName("host")[0].value;
	var port = document.getElementsByName("port")[0].value;
	if (typeof host == "undefined" || null == host || "" == host || typeof port == "undefined" || null == port || "" == port)
	{
		putLog("Invalid server", "system");
		return;
	}
	try {
		ros.connect('ws://' + host + ':' + port);
	} catch (err) {
		putLog("Fail to connect " + 'ws://' + host + ':' + port + "error: " + err, "system");
		return;
	}
	putLog("Connected " + 'ws://' + host + ':' + port, "system");
}
var publishTopic = function ()
{
	var name_value = document.getElementsByName("topicName")[0].value;
	var type_value = document.getElementsByName("topicType")[0].value;
	if (typeof name_value == "undefined" || null == name_value || "" == name_value || typeof type_value == "undefined" || null == type_value || "" == type_value)
	{
		putLog("Invalid name or type", "system");
	}
	var msg_content = document.getElementsByName("topicMsg")[0].value;
	var topic = new ros.Topic({
		name        : name_value,
		messageType : type_value
	});
	// Then we create the payload to be published. The object we pass in to ros.Message matches the fields defined in the geometry_msgs/PoseStamped.msg definition.
	var msg = new ros.Message({data: msg_content});
	topic.publish(msg);
	putLog("Published topic (name: " + name_value + ", messageType: " + type_value + ")", "system");
}
var subscribeTopic = function ()
{
	var name_value = document.getElementsByName("topicName")[0].value;
	var type_value = document.getElementsByName("topicType")[0].value;
	if (typeof name_value == "undefined" || null == name_value || "" == name_value || typeof type_value == "undefined" || null == type_value || "" == type_value)
	{
		putLog("Invalid name or type", "system");
	}
	var topic = new ros.Topic({
		name        : name_value,
		messageType : type_value
	});
	// Then we add a callback to be called every time a message is published on this topic.
	topic.subscribe(function (message)
	{
		putLog('Received message on ' + topic.name + ': ' + message.data, "log");
		topic.unsubscribe();
	});
	putLog("Subscribed topic (name: " + name_value + ", messageType: " + type_value + ")", "system");
}
var callService = function ()
{
	putLog("Calling service", "system");
	//@todo make it generic
	var service = new ros.Service({
	  name        : '/add_two_ints',
	  serviceType : 'rospy_tutorials/AddTwoInts'
	});
	// Then we create a Service Request. The object we pass in to ros.ServiceRequest matches the fields defined in the rospy_tutorials' AddTwoInts.srv file.
	var request = new ros.ServiceRequest({ A: 1, B: 2});
	// Finally, we call the /add_two_ints service and get back the results in the callback. The result is a ros.ServiceResponse object.
	service.callService(request, function (result)
	{
		putLog('Result for service call on ' + service.name + ': ' + result.sum, "log");
	});
}
var setParam = function ()
{
	ros.getParams(function (params)
	{
		putLog(params, "log");
	});
	var param = new ros.Param({
	  name: 'max_vel_y'
	});
	param.set(0.8);
	param.get(function (value)
	{
		putLog('MAX VAL: ' + value, "log");
	});
}
var getParam = function ()
{
	var param = new ros.Param({
	  name: 'favorite_color'
	});
	param.set('red');
	param.get(function (value)
	{
		putLog('My robot\'s favorite color is ' + value, "log");
	});
}
var getServerInfo = function ()
{
	// Retrieves the current list of topics in ROS.
	ros.getTopics(function(topics) {
	  putLog('Current topics in ROS: ' + topics);
	});

	// Fetches list of all active services in ROS.
	ros.getServices(function(services) {
	  putLog('Current services in ROS: ' + services);
	});

	// Gets list of all param names.
	ros.getParams(function(params) {
	  putLog('Current params in ROS: ' + params);
	});
}
