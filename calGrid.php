<?php
require __DIR__.'/predis/autoload.php';
$LAB = array(49.276802, -122.914913);
$ROBOT = array("cb18", "cb01", "pi01");
$single_server = array(
    'host'	=>	'192.168.1.120',
    'port'	=>	6379
);
$client = new Predis\Client($single_server);
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
$map = array();
for($i = 0; $i + 2 < count($last); $i += 3)
{
	$map[$last[$i]." ".$last[$i+1]] = floatval($last[$i+2]);
}
$old_color = array();
for($i = 0; $i + 2 < count($last_color); $i += 3)
{
	$old_color[$last_color[$i]." ".$last_color[$i+1]] = floatval($last_color[$i+2]);
}
for ($i = 0; $i < count($ROBOT); ++ $i)
{
	$r = explode(" ", $client->get($ROBOT[$i]));
	$now = intval($r[0]);
	if (count($last_frame) < count($ROBOT) || $last_frame[$i] >= $now)
	{
		$last_frame[$i] = $now;
		continue;
	}
	$x = round((floatval($r[1]) - $LAB[0] - $_GET["grid_size"]/2) / $_GET["grid_size"]);
	$y = round((floatval($r[2]) - $LAB[1] - $_GET["grid_size"]/2) / $_GET["grid_size"]);
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
	if (array_key_exists($x." ".$y, $map))
	{
		$map[$x." ".$y] += $value;
	} else
	{
		$map[$x." ".$y] = $value;
	}
	$last_frame[$i] = $now;
}
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
		continue;
	}
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
	if (array_key_exists($key, $old_color) || $old_color[$key] != $color)
	{
		$old_color[$key] = $color;
	}
	echo $key." ".$color." ".$i." ";
}
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
?>