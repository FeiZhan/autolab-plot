var host = "192.168.1.120", port = "6379", second_host = "localhost";
var LAB = [49.276802, -122.914913], ROBOT_NAME = ["cb18", "cb01", "pi01"];
var SERVER_RET = "";
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
		}
	}
	xmlhttp.open("GET",file + ".php?" + cmd, true);
	xmlhttp.send();
}