<?php
/**
 * functions for computing and communicating with database
 * @auther fzhan <fzhan at sfu dot ca>
 */
// load APIs for Redis
require __DIR__.'/predis/autoload.php';

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
	// make it unique @bug don't need to do again in javascript
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
// get robot names
function returnNames()
{
	global $client;
	$len = $client->llen("robotname");
	$tmp = $client->lrange("robotname", 0, $len);
	// make it unique @bug don't need to do again in javascript
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
//@bug need to improve
function historicData()
{
	global $bak_client;
	$year = is_numeric($_GET["year"]) ? $_GET["year"] : "2013";
	$month = $_GET["month"];
	$day = is_numeric($_GET["day"]) ? $_GET["day"] : "1";
	$hour = is_numeric($_GET["hour"]) ? $_GET["hour"] : "0";
	$minute = is_numeric($_GET["minute"]) ? $_GET["minute"] : "0";
	$second = is_numeric($_GET["second"]) ? $_GET["second"] : "0";
	$from = strtotime($day." ".$month." ".$year." ".$hour.":".$minute.":".$second);
	$to = $from + intval($_GET["duration"]);
	$key = $_GET["robot"]."-sorted";
	$tmp = $bak_client->zrangebyscore($key, $from, $to);
	for ($i = 0; $i < count($tmp) && $i < $_GET["num"]; ++ $i)
	{
		echo $tmp[$i].", ";
	}
}
// set old data to the place where current data exist
//@bug need to improve
function timeTravel()
{
	global $bak_client;
	$names = getNames();
	$year = is_numeric($_GET["year"]) ? $_GET["year"] : "2013";
	$month = $_GET["month"];
	$day = is_numeric($_GET["day"]) ? $_GET["day"] : "1";
	$hour = is_numeric($_GET["hour"]) ? $_GET["hour"] : "0";
	$minute = is_numeric($_GET["minute"]) ? $_GET["minute"] : "0";
	$second = is_numeric($_GET["second"]) ? $_GET["second"] : "0";
	$from = strtotime($day." ".$month." ".$year." ".$hour.":".$minute.":".$second);
	foreach ($names as $i)
	{
		$key = $i."-bak";
		$length = - $bak_client->llen($key);
		$find_flag = false;
		for ($j = -1; $j > $length; -- $j)
		{
			$time = $bak_client->lrange($key, $j, $j);
			$time = explode(" ", $time[0]);
			$time = $time[0];
			if ($time >= $from)
			{
				$find_flag = true;
			}
			else if ($time < $from)
			{
				break;
			}
		}
		if ($find_flag)
		{
			$tmp = $bak_client->lrange($key, $j + 1, $j + 1);
			echo $tmp[0].", ";
			//@todo delete the beginning timestamp, assign different values from then
			//$client->set($i, $tmp[0]);
		}
	}
}
// backup data into backup database when get_robot_data is called
function backup($key, $data)
{
	global $bak_client;
	$old = $bak_client->lrange($key."-bak", -1, -1);
	// if change - with _, it does not work.
	$bak_client->zadd($key."-sorted", time(), "time ".time()." ".$data);
	$bak_client->rpushx($key."-bak", "time ".time()." ".$data);
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
	$x = rand(0, 10000) / 100;
	$y = rand(0, 10000) / 100;
	return "frame ".round(rand(0, 100))." x ".$x." y ".$y." voltage ".(rand(0, 10000) / 100)." current ".(rand(0, 10000) / 100);
}
// generate a string of data representing a robot with the following format: time x y voltage current, with constrained x and y representing a field robot moving out of the lab.
function field_robot($client_value)
{
	$c = explode(" ", $client_value);
	// the time stamp of last cycle
	$last_time = intval($c[0]);
	// there is no previous values
	if (count($c) < 3)
	{
		// the location of the lab
		$c[1] = 49.276802;
		$c[2] = -122.914913;
	}
	$x = floatval($c[1]) + rand(-10000, 10000) / 10000 * .001;
	$y = floatval($c[2]) + rand(-10000, 10000) / 10000 * .001;
	return "frame ".($last_time+1)." x ".$x." y ".$y." voltage ".(rand(0, 10000) / 100)." current ".(rand(0, 10000) / 100);
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
// calculate energy or time grids for google maps
function calGrid()
{
	global $client, $LAB;
	$names = getNames();
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
		$now = intval($r[0]);
		if (count($last_frame) < count($names) || $last_frame[$i] >= $now)
		{
			// there is no data, or the robot did not move
			$last_frame[$i] = $now;
			continue;
		}
		// get the grid position from the geo position
		$x = round((floatval($r[1]) - $LAB[0] - $_GET["grid_size"]/2) / $_GET["grid_size"]);
		$y = round((floatval($r[2]) - $LAB[1] - $_GET["grid_size"]/2) / $_GET["grid_size"]);
		// calculate the value of energy or time
		switch($_GET["type"])
		{
		case "energy":
			$value = floatval($r[3]) * floatval($r[4]) * ($now - $last_frame[$i]);
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
		if ($tmp < 0.01)
		{
			$color = 250;
		}
		else if ($tmp > 0.1)
		{
			$color = 50;
		} else
		{
			$color = round(250 + ($tmp - 0.01) / (0.1 - 0.01) * (50 - 250));
		}
		//[todo] if the color does not change, we do not need to transmit it
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
