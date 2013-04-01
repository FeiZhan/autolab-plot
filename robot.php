<?php
$SENSOR_LIST = array("ranger");
$map;
function getPixel($x, $y)
{
	global $map;
	if (is_null($map))
	{
		return 0;
	} else
		return imagecolorat($map, $x , $y);
}
function getMap()
{
	global $map;
	if (! is_null($map))
	{
		imagedestroy($map);
	}
	if (is_null($_GET["mapname"]))
	{
		$imgname = "resource/cave_compact.png";
	} else
	{
		$imgname = $_GET["mapname"];
	}
	$map = @imagecreatefrompng($imgname);
	// See if it failed
	if(! $map)
	{
		// Create a blank image
		$map  = imagecreatetruecolor(150, 30);
		$bgc = imagecolorallocate($map, 255, 255, 255);
		$tc  = imagecolorallocate($map, 0, 0, 0);
		imagefilledrectangle($map, 0, 0, 150, 30, $bgc);
		// Output an error message
		imagestring($map, 1, 5, 5, 'Error loading ' . $imgname, $tc);
	}
	// output the image
	imagewbmp($map);
}
// do not capitalize r
function getranger($x, $y, $yaw)
{
	
}
function getSensor($sensor_name, $x, $y, $yaw)
{
	global $SENSOR_LIST;
	$flag = false;
	foreach ($SENSOR_LIST as $i)
	{
		if ($sensor_name == $i)
		{
			$flag = true;
			break;
		}
	}
	if ($flag)
	{
		"get".$sensor_name($x, $y, $yaw);
	}
}
?>
