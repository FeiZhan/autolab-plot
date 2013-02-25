<?php
// by fzhan@Autolab
require __DIR__.'/predis/autoload.php';
$LAB = array(49.276802, -122.914913);
$ROBOT_NAME = array("cb18", "cb01", "pi01");
$HOST = "192.168.1.120";
$PORT = "6379";
$SECOND_HOST = "localhost";

function get_key()
{
	global $client;
	echo $client->get($_GET["key"]);
}
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
// cannot put bak_server variables here
function backup($key, $data)
{
	global $bak_client;
	// if change - with _, it does not work.
	$bak_client->rpush($key."-bak", $data);
	//echo $bak_client->llen($key."-bak"); // test if it works
}
function get_robot_data()
{
	global $ROBOT_NAME, $client;
	//time x y voltage current | self-set parameters: valid
	foreach ($ROBOT_NAME as $i)
	{
		$data = "1";
		$ret = $client->get($i);
		//backup($i, $ret);
		echo $ret.", ";
	}
}
function generate_data()
{
	//[todo]
}
function cal_energy()
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
	$SIZE = array(1200, 900);
	$new_frame = 0;
	for ($i = 0; $i < count($ROBOT_NAME); ++ $i)
	{
		$robot_path = "log/".$ROBOT_NAME[$i]."-".date('Y-m-j').".log";
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
// obtain data from Redis, calculate energy or time grids for google maps, and transmit them to html
function cal_grid()
{
	global $client, $ROBOT_NAME, $LAB;
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
	//[todo] generate an array of old colors in order to compare with current colors
	$old_color = array();
	for($i = 0; $i + 2 < count($last_color); $i += 3)
	{
		$old_color[$last_color[$i]." ".$last_color[$i+1]] = floatval($last_color[$i+2]);
	}
	for ($i = 0; $i < count($ROBOT_NAME); ++ $i)
	{
		//obtain robot data from Redis
		$r = explode(" ", $client->get($ROBOT_NAME[$i]));
		$now = intval($r[0]);
		if (count($last_frame) < count($ROBOT_NAME) || $last_frame[$i] >= $now)
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
function call_method($method)
{
	if(is_null($method) || "" == $method || ! function_exists ($method))
	{
		echo "@error wrong method";
		return;
	}
	$method();
}
?>
