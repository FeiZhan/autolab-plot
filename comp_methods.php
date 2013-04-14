<?php
/**
 * functions for computing and communicating with database
 * @auther fzhan <fzhan at sfu dot ca>
 */
// load APIs for Redis
require __DIR__.'/predis/autoload.php';
include __DIR__.'/robot.php';

$LAB = array(49.276802, -122.914913);
$HOST = "192.168.1.120";
$PORT = "6379";
$SECOND_HOST = "localhost";
//$ROBOT_NAME = array("cb18", "cb01", "pi01");

$host = $HOST;
$port = $PORT;
// if assigned host and port, use them
if (! is_null($_GET["host"]) && ! is_null($_GET["port"]))
{
	$host = $_GET["host"];
	$port = $_GET["port"];
}
$server = array(
	'host'	=>	$host,
	'port'	=>	$port
);
$client = new Predis\Client($server);
// create a backup host for backup historic data
$bak_host = $SECOND_HOST;
$bak_port = $PORT;
if (! is_null($_GET["bak_host"]) && ! is_null($_GET["bak_port"]))
{
	$bak_host = $_GET["bak_host"];
	$bak_port = $_GET["bak_port"];
}
$bak_server = array(
	'host'	=>	$bak_host,
	'port'	=>	$bak_port
);
$bak_client = new Predis\Client($bak_server);

// get data from a single key
function getKey()
{
	global $client;
	echo $client->get($_GET["key"]);
}
// get the status of Redis
function status()
{
	global $client;
	if (is_null($client) || is_null($client->ping()))
	{
		echo "cannot reach server";
		return;
	}
	echo "dbsize ".$client->dbsize().", lastsave ".$client->lastsave().", ";
	$info = $client->info();
	foreach ($info as $key => $value)
	{
		echo $key." ".$value.", ";
	}
}
// get robot names
function getNames()
{
	global $client;
	$len = $client->llen("robotname");
	$tmp = $client->lrange("robotname", 0, $len);
	// make it unique. don't need to do again in javascript
	$tmp = array_unique($tmp);
	for ($i = 0; $i < $len; ++ $i)
	{
		// invalid names
		if ($tmp[$i] == "" || $tmp[$i] == " ")
			continue;
		echo $tmp[$i]." ";
	}
	return $tmp;
}
// return robot names
function returnNames()
{
	global $client;
	$len = $client->llen("robotname");
	$tmp = $client->lrange("robotname", 0, $len);
	// make it unique. don't need to do again in javascript
	$tmp = array_unique($tmp);
	for ($i = 0; $i < $len; ++ $i)
	{
		// invalid names
		if ($tmp[$i] == "" || $tmp[$i] == " ")
		{
			array_splice($tmp, $i, 1);
		}
	}
	return $tmp;
}
// get old data since current
function getPreviousData()
{
	global $bak_client;
	$key = $_GET["robot"]."-bak";
	$len = min($bak_client->llen($key), $_GET["num"]);
	$tmp = $bak_client->lrange($key, - $len, -1);
	foreach ($tmp as $i)
	{
		echo $i.", ";
	}
}
// get old data between two time stamps
function historicData()
{
	global $bak_client;
	$from = strtotime($_GET["from"]) * 1000;
	// if duration is not valid, use "to"
	if ($_GET["duration"] == "" || $_GET["duration"] == " " || $_GET["duration"] == "0")
	{
		$to = strtotime($_GET["to"]) * 1000;
	} else
	{
		$to = $from + intval($_GET["duration"]) * 1000;
	}
	$key = $_GET["robot"]."-sorted";
	// get data ranging from "from" to "to"
	$tmp = $bak_client->zrangebyscore($key, $from, $to);
	for ($i = 0; $i < count($tmp) && $i < $_GET["num"]; ++ $i)
	{
		echo $tmp[$i].", ";
	}
}
// set old data to the place where current data exist
function timeTravel()
{
	global $client, $bak_client;
	if ($_GET["timestamp"] == "" || $_GET["timestamp"] == " " || $_GET["timestamp"] == "undefined")
	{
		echo "0 0";
		return;
	}
	$names = returnNames();
	$nexttime = floatval($_GET["nexttime"]) * 1000;
	$next = pow(2, 63);
	$timestamp = strtotime($_GET["timestamp"]) * 1000;
	// if "nexttime" is invalid, get timestamp from "timestamp", and determine "nexttime"
	if ($_GET["nexttime"] == "" || 0 == $nexttime)
	{
		foreach ($names as $i)
		{
			$key = $i."-sorted";
			$tmp = $bak_client->zrangebyscore($key, $timestamp, "+inf");
			$tmp = $tmp[0];
			$client->set($i, $tmp);
			$index = $bak_client->zrank($key, $tmp);
			$tmp = $bak_client->zrange($key, $index + 1, $index + 1);
			$tmp = $bak_client->zscore($key, $tmp[0]);
			if ($tmp >= $timestamp && $tmp < $next)
			{
				$next = $tmp;
			}
		}
	} else
	{
		foreach ($names as $i)
		{
			$key = $i."-sorted";
			$tmp = $bak_client->zrangebyscore($key, $nexttime, $nexttime);
			$tmp = $tmp[0];
			$client->set($i, $tmp);
			$index = $bak_client->zrank($key, $tmp);
			$tmp = $bak_client->zrange($key, $index + 1, $index + 1);
			$tmp = $bak_client->zscore($key, $tmp[0]);
			if ($tmp >= $timestamp && $tmp < $next)
			{
				$next = $tmp;
			}
		}
	}
	echo ($next / 1000.0)." ".($next - $nexttime);
}
// backup data into backup database when get_robot_data is called
function backup($key, $data)
{
	global $bak_client;
	if (is_null($bak_client) || is_null($bak_client->ping()))
	{
		echo "cannot reach server";
		return;
	}
	if ($bak_client->llen($key."-bak") > 0)
	{
		$old = $bak_client->lrange($key."-bak", -1, -1);
		$old = explode(" ", $old[0]);
		array_splice($old, 0, 2);
		$old = implode(" ", $old);
	} else
	{
		$old = "";
	}
	// if data is the same as previous, do not save it
	if ($old != $data)
	{
		$time = round(microtime(true) * 1000);
		// if change - with _, it does not work.
		$bak_client->zadd($key."-sorted", $time, "servertime ".$time." ".$data);
		$bak_client->rpush($key."-bak", "servertime ".$time." ".$data);
	}
}
// get robot data
function getRobotData()
{
	global $client;
	$name = returnNames();
	foreach ($name as $i)
	{
		$ret = $client->get($i);
		backup($i, $ret);
		echo $ret.", ";
	}
}
// generate a random value
function random_value()
{
	return rand(0, 10000) / 100;
}
function random_robot()
{
	// the ground is 10 * 8
	$x = rand(-5 * 100, 100 * 5) / 100;
	$y = rand(-4 * 100, 100 * 4) / 100;
	return "frame ".round(rand(0, 100))." x ".$x." y ".$y." voltage ".(rand(0, 10000) / 100)." current ".(rand(0, 10000) / 100)." elect ".(rand(0, 1) ? "ELECTED" : "NOELECTED")." yaw ".(rand(-M_PI * 100, 100 * M_PI) / 100)." state ".(rand(0, 10));
}
// generate a string of data representing a robot with the following format: time x y voltage current, with constrained x and y representing a field robot moving out of the lab.
function field_robot($client_value)
{
	$c = explode(" ", $client_value);
	// the time stamp of last cycle
	$last_time = intval($c[1]);
	// there is no previous values
	if (count($c) < 3)
	{
		// the location of the lab
		$c[3] = 49.276802;
		$c[5] = -122.914913;
	}
	$x = floatval($c[3]) + rand(-10000, 10000) / 10000 * .001;
	$y = floatval($c[5]) + rand(-10000, 10000) / 10000 * .001;
	return "frame ".($last_time+1)." x ".$x." y ".$y." voltage ".(rand(0, 10000) / 100)." current ".(rand(0, 10000) / 100)." state ".(rand(0, 5))." substate ".(rand(0, 5));
}
function setStaticGraphics()
{
	global $client;
	$client->del("staticgraphics");
	//map
	$client->rpush("staticgraphics", "image -5 -4 http://192.168.1.116/autolab-plot/resource/cave_compact.png 10 8");
	// home
	$client->rpush("staticgraphics", "circle -4.5 -3.5 0.3 pen blue 1 0");
	// text home
	$client->rpush("staticgraphics", "text -4.5 -3.5 home 8 pen blue 1 0");
	// patch 1
	$client->rpush("staticgraphics", "circle -4.5 3.5 0.3 pen green 1 0");
	// text patch
	$client->rpush("staticgraphics", "text -4.5 3.5 patch 8 pen green 1 0");
	// recharging site
	$client->rpush("staticgraphics", "circle 4.5 -3.5 0.3 pen red 1 0");
	// text recharging site
	$client->rpush("staticgraphics", "text 3 -3.5 recharging_site 8 pen red 1 0");
	echo "ok";
}
//@todo more functions for generating data should be added
function generateData()
{
	global $client;
	$i = 0;
	// if the key is valid
	while ($_GET["key".$i] != undefined && $_GET["key".$i] != null && $_GET["key".$i] != "")
	{
		$value = $_GET["value".$i];
		// if it is the code
		if (substr($_GET["value".$i], 0, 3) == "@@@")
		{
			$code = substr($_GET["value".$i], 3);
			if(is_null($code) || "" == $code || ! function_exists ($code))
			{
				$value = $code;
			} else
			{
				$value = $code($client->get($_GET["key".$i]));
			}
		}
		$client->set($_GET["key".$i], $value);
		echo $_GET["key".$i].": ".$client->get($_GET["key".$i]).", ";
		++ $i;
	}
}
// calculate energy grid for jsDraw2DX trajPlot2
//@todo need to improve
function calEnergy()
{
	$gridNum = 10;
	$ENERGY_PATH = "log/energy-".date('Y-m-j').".log";
	if (file_exists($ENERGY_PATH) && filesize($ENERGY_PATH) > 200)
	{
		$file = fopen($ENERGY_PATH, "r");
		$old_frame = intval(fgets($file));
		$energy = split(" ", fgets($file));
		fclose($file);
		for ($i = count($energy); $i < $gridNum * $gridNum; ++ $i)
		{
			$energy[$i] = 0;
		}
	} else
	{
		$old_frame = 0;
		for ($i = 0; $i < $gridNum * $gridNum; ++ $i)
		{
			$energy[$i] = 0;
		}
	}
	//$ROBOT_NAME = array("shit1", "shit2", "shit3");//array("cb18", "cb01", "pioneer01");
	$names = getNames();
	$SIZE = array(1200, 900);
	$new_frame = 0;
	for ($i = 0; $i < count($names); ++ $i)
	{
		$robot_path = "log/".$names[$i]."-".date('Y-m-j').".log";
		if (file_exists($robot_path))
		{
			$file = fopen($robot_path, "r");
			$len = strlen(fgets($file));
			fseek($file, - $len, SEEK_END);
			$new = split(" ", fgets($file));
			fclose($file);
			$pos = array($new[3] * 8 / ($SIZE[0] / $gridNum), $new[4] * 8 / ($SIZE[1] / $gridNum));
			$valid = intval($new[9]);
			if ($valid)
			{
				$p = floor($pos[0]) * $gridNum + floor($pos[1]);
				$energy[$p] += $new[5] * $new[6] * ($new[1] - $old_frame);
			}
			if ($new[1] > $new_frame)
			{
				$new_frame = $new[1];
			}
		}
	}
	$file = fopen($ENERGY_PATH, "w");
	fwrite($file, $new_frame."\n");
	for ($i = 0; $i < $gridNum * $gridNum; ++ $i)
	{
		fwrite($file, $energy[$i]." ");
	}
	fclose($file);
	
	$sum = array_sum($energy);
	$colorLevel = 10;
	for ($i = 0; $i < count($energy); ++ $i)
	{
		$energy[$i] /= $sum;
		if ($energy[$i] > 0.2)
		{
			$color[$i] = $colorLevel + 3;
		}
		else if ($energy[$i] <= 0)
		{
			$color[$i] = 0;
		} else
		{
			$color[$i] = round($energy[$i] / ((0.2 - 0) / $colorLevel)) + 3;
		}
	}
	
	for ($i = 0; $i < $gridNum * $gridNum; ++ $i)
	{
		echo $color[$i];
		//echo rand(0, 12 * 100) / 100;
		echo " ";
	}
}
function calTraj2Grid()
{
	global $client;
	$names = returnNames();
	// obtain old data from Redis
	switch($_GET["type"])
	{
	case "energy":
		$last_frame = explode(" ", $client->get("last_traj2_energy_frame"));
		$last_color = explode(" ", $client->get("last_traj2_energy_color"));
		$last = explode(" ", $client->get("last_traj2_energy"));
		break;
	case "time":
		$last_frame = explode(" ", $client->get("last_traj2_time_frame"));
		$last_color = explode(" ", $client->get("last_traj2_time_color"));
		$last = explode(" ", $client->get("last_traj2_time"));
		break;
	default:
		$last_frame = "";
		$last_color = "";
		$last = "";
	}
	// generate a map for old data
	$map = array();
	for($i = 0; $i + 2 < count($last); $i += 3)
	{
		$map[$last[$i]." ".$last[$i+1]] = floatval($last[$i+2]);
	}
	//@todo generate an array of old colors in order to compare with current colors
	$old_color = array();
	for($i = 0; $i + 2 < count($last_color); $i += 3)
	{
		$old_color[$last_color[$i]." ".$last_color[$i+1]] = floatval($last_color[$i+2]);
	}
	for ($i = 0; $i < count($names); ++ $i)
	{
		//obtain robot data from Redis
		$r = explode(" ", $client->get($names[$i]));
		if (count($r) == 0)
		{
			continue;
		}
		$now = intval($r[1]);
		if (count($last_frame) < count($names) || $last_frame[$i] >= $now)
		{
			// there is no data, or the robot did not move
			$last_frame[$i] = $now;
			continue;
		}
		// get the grid position from the geo position
		$x = round(floatval($r[3]));
		$y = round(floatval($r[5]));
		// calculate the value of energy or time
		switch($_GET["type"])
		{
		case "energy":
			$value = floatval($r[7]) * floatval($r[9]) * ($now - $last_frame[$i]);
			break;
		case "time":
			$value = $now - $last_frame[$i];
			break;
		default:
			$value = 0;
		}
		// add with old data if there exist old data
		if (array_key_exists($x." ".$y, $map))
		{
			$map[$x." ".$y] += $value;
		} else
		{
			$map[$x." ".$y] = $value;
		}
		$last_frame[$i] = $now;
	}
	// save frame data back to Redis
	switch($_GET["type"])
	{
	case "energy":
		$client->set("last_traj2_energy_frame", implode(" ", $last_frame));
		break;
	case "time":
		$client->set("last_traj2_time_frame", implode(" ", $last_frame));
		break;
	default:
	}
	$sum = array_sum($map);
	$last = "";
	$centerx = intval($_GET["centerx"]);
	$centery = intval($_GET["centery"]);
	foreach ($map as $key => $i)
	{
		$last .= $key." ".$i." ";
		$pos = explode(" ", $key);
		$x = intval($pos[0]);
		$y = intval($pos[1]);
		// calculate the color value of the grid
		$tmp = $i / $sum;
		if ($tmp < 0.001)
		{
			$color = 230;
		}
		else if ($tmp > 0.1)
		{
			$color = 50;
		} else
		{
			$color = round(230 + ($tmp - 0.001) / (0.1 - 0.001) * (50 - 230));
		}
		//@todo if the color does not change, we do not need to transmit it
		if (array_key_exists($key, $old_color) || $old_color[$key] != $color)
		{
			$old_color[$key] = $color;
		}
		echo $key." ".$color." ".$i." ";
	}
	// save back to Redis
	switch($_GET["type"])
	{
	case "energy":
		$client->set("last_traj2_energy", $last);
		$client->set("last_traj2_energy_color", $old_color);
		break;
	case "time":
		$client->set("last_traj2_time", $last);
		$client->set("last_traj2_time_color", $old_color);
		break;
	default:
	}
}
function clearTraj2Grids()
{
	global $client;
	$client->set("last_traj2_energy", "");
	$client->set("last_traj2_energy_frame", "");
	$client->set("last_traj2_time", "");
	$client->set("last_traj2_time_frame", "");
}
// calculate energy or time grids for google maps
function calGrid()
{
	global $client, $LAB;
	$names = returnNames();
	// obtain old data from Redis
	switch($_GET["type"])
	{
	case "energy":
		$last_frame = explode(" ", $client->get("last_energy_frame"));
		$last_color = explode(" ", $client->get("last_energy_color"));
		$last = explode(" ", $client->get("last_energy"));
		break;
	case "time":
		$last_frame = explode(" ", $client->get("last_time_frame"));
		$last_color = explode(" ", $client->get("last_time_color"));
		$last = explode(" ", $client->get("last_time"));
		break;
	default:
		$last_frame = "";
		$last_color = "";
		$last = "";
	}
	// generate a map for old data
	$map = array();
	for($i = 0; $i + 2 < count($last); $i += 3)
	{
		$map[$last[$i]." ".$last[$i+1]] = floatval($last[$i+2]);
	}
	//@todo generate an array of old colors in order to compare with current colors
	$old_color = array();
	for($i = 0; $i + 2 < count($last_color); $i += 3)
	{
		$old_color[$last_color[$i]." ".$last_color[$i+1]] = floatval($last_color[$i+2]);
	}
	for ($i = 0; $i < count($names); ++ $i)
	{
		//obtain robot data from Redis
		$r = explode(" ", $client->get($names[$i]));
		$now = intval($r[1]);
		if (count($last_frame) < count($names) || $last_frame[$i] >= $now)
		{
			// there is no data, or the robot did not move
			$last_frame[$i] = $now;
			continue;
		}
		// get the grid position from the geo position
		$x = round((floatval($r[3]) - $LAB[0] - $_GET["grid_size"]/2) / $_GET["grid_size"]);
		$y = round((floatval($r[5]) - $LAB[1] - $_GET["grid_size"]/2) / $_GET["grid_size"]);
		// calculate the value of energy or time
		switch($_GET["type"])
		{
		case "energy":
			$value = floatval($r[7]) * floatval($r[9]) * ($now - $last_frame[$i]);
			break;
		case "time":
			$value = $now - $last_frame[$i];
			break;
		default:
			$value = 0;
		}
		// add with old data if there exist old data
		if (array_key_exists($x." ".$y, $map))
		{
			$map[$x." ".$y] += $value;
		} else
		{
			$map[$x." ".$y] = $value;
		}
		$last_frame[$i] = $now;
	}
	// save frame data back to Redis
	switch($_GET["type"])
	{
	case "energy":
		$client->set("last_energy_frame", implode(" ", $last_frame));
		break;
	case "time":
		$client->set("last_time_frame", implode(" ", $last_frame));
		break;
	default:
	}
	$sum = array_sum($map);
	$last = "";
	$centerx = intval($_GET["centerx"]);
	$centery = intval($_GET["centery"]);
	foreach ($map as $key => $i)
	{
		$last .= $key." ".$i." ";
		$pos = explode(" ", $key);
		$x = intval($pos[0]);
		$y = intval($pos[1]);
		if ($pos[0] > $centerx + 10 || $pos[0] < $centerx - 10 || $pos[1] > $centery + 10 || $pos[1] < $centery - 10)
		{
			// this grid is out of the field of view, ignore it
			continue;
		}
		// calculate the color value of the grid
		$tmp = $i / $sum;
		if ($tmp < 0.001)
		{
			$color = 240;
		}
		else if ($tmp > 0.05)
		{
			$color = 40;
		} else
		{
			$color = round(230 + ($tmp - 0.001) / (0.05 - 0.001) * (40 - 240));
		}
		//@todo if the color does not change, we do not need to transmit it
		if (array_key_exists($key, $old_color) || $old_color[$key] != $color)
		{
			$old_color[$key] = $color;
		}
		echo $key." ".$color." ".$i." ";
	}
	// save back to Redis
	switch($_GET["type"])
	{
	case "energy":
		$client->set("last_energy", $last);
		$client->set("last_energy_color", $old_color);
		break;
	case "time":
		$client->set("last_time", $last);
		$client->set("last_time_color", $old_color);
		break;
	default:
	}
}
function clearGrids()
{
	global $client;
	$client->set("last_energy", "");
	$client->set("last_energy_frame", "");
	$client->set("last_time", "");
	$client->set("last_time_frame", "");
}
function getStaticGraphics()
{
	global $client;
	$g = $client->lrange("staticgraphics", 0, -1);
	foreach ($g as $i)
	{
		echo $i.", ";
	}
}
function runRobot()
{
	$sensor = getSensor($_GET["sensor"], $_GET["x"], $_GET["y"], $_GET["yaw"]);
	pathPlan($sensor, $_GET["x"], $_GET["y"], $_GET["yaw"]);
}
function publishCpp()
{
	if (exec('./ros/talker '.$_GET["name"]." ".$_GET["msg"], $output, $ret))
	{
		echo "Fail to exec. ";
		var_dump($output);
		var_dump($ret);
	} else
	{
		echo '(./ros/talker '.$_GET["name"]." ".$_GET["msg"].") ";
		var_dump($output);
		var_dump($ret);
	}
}
function subscribeCpp()
{
	if (exec('./ros/listener '.$_GET["name"]." &", $output, $ret))
	{
		echo "Fail to exec. ";
		var_dump($output);
		var_dump($ret);
	} else
	{
		echo '(./ros/listener '.$_GET["name"].") ";
		var_dump($output);
		var_dump($ret);
	}
}
// call corresponding method according to $method
function callMethod($method)
{
	if(is_null($method) || "" == $method || ! function_exists($method))
	{
		echo "@error wrong method";
		return;
	}
	$method();
}
//call method specified by javascript
callMethod($_GET["method"]);
?>
