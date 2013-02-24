<?php
// by fzhan@Autolab
// a generic program to set various data into Redis
require __DIR__.'/predis/autoload.php';
require __DIR__.'/parameter.php';
$OFFSET = .001;
$begin = microtime(true);
$single_server = array(
    'host'	=>	$_GET["host"],
    'port'	=>	$_GET["port"]
);
$client = new Predis\Client($single_server);
// generate a random value
function random_value()
{
	return rand(0, 10000) / 100;
}
function random_robot()
{
	$x = rand(0, 10000) / 100;
	$y = rand(0, 10000) / 100;
	return round(rand(0, 100))." ".$x." ".$y." ".(rand(0, 10000) / 100)." ".(rand(0, 10000) / 100);
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
	return ($last_time+1)." ".$x." ".$y." ".(rand(0, 10000) / 100)." ".(rand(0, 10000) / 100);
}
// test the duration to communicate with Redis
$client->set("delay_test", $_GET["time"]);
echo "time ".$client->get("delay_test").", ";
//echo round(microtime(true) * 1000 - $_GET["time"]);

// suppose there are 10 robots
for($i = 0; $i < 10; ++ $i)
{
	// if the key is valid
	if($_GET["key".$i] != undefined && $_GET["key".$i] != null && $_GET["key".$i] != "")
	{
		$value = $_GET["value".$i];
		// if it is the code
		if (substr($_GET["value".$i], 0, 3) == "@@@")
		{
			$code = substr($_GET["value".$i], 3);
			switch($code)
			{
			case "clear":
				$value = "";
				break;
			case "random_value":
				$value = random_value();
				break;
			case "random_robot":
				$value = random_robot();
				break;
			case "field_robot":
				$value = field_robot($client->get($_GET["key".$i]));
				break;
			default:
				// undefined code
				$value = $code;
				break;
			}
		}
		$client->set($_GET["key".$i], $value);
		echo $_GET["key".$i].": ".$client->get($_GET["key".$i]).", ";
	}
}
//echo "delay in php: ".round((microtime(true) - $begin) * 1000);
?>
