<?php
$gridNum = 10;
$ENERGY_PATH = "log/energy-".date('Y-m-j').".log";
if (file_exists($ENERGY_PATH))
{
	$file = fopen($ENERGY_PATH, "r");
	$old_frame = intval(fgets($file));
	$energy = split(" ", fgets($file));
} else
{
	for ($i = 0; $i < $gridNum * $gridNum; ++ $i)
	{
		$energy[$i] = 0;
	}
}
$ROBOT_NAME = array("cb18", "cb01", "pioneer01");
$SIZE = array(1200, 900);
for ($i = 0; $i < count($ROBOT_NAME); ++ $i)
{
	$robot_path = "log/".$ROBOT_NAME[$i]."-".date('Y-m-j').".log";
	if (file_exists($robot_path))
	{
		$file = fopen($robot_path,"a");
		$len = strlen(fgets($file));
		fseek($file, - $len, SEEK_END);
		$new = split(" ", fgets($file));
		fclose($file);
		$pos = array($new[3] / ($SIZE[0] / $gridNum), $new[4] / ($SIZE[1] / $gridNum));
		$energy[(floor($pos[0])+1) * (floor($pos[1])+1) - 1] += $new[6] * $new[7] * ($new[3] - $old_frame);
	}
}
$sum = array_sum($energy);
$colorLevel = 12;
for ($i = 0; $i < count($energy); ++ $i)
{
	$energy[$i] /= $sum;
	if ($energy[$i] > 0.2)
	{
		$color[$i] = 12;
	}
	else if ($energy[$i] <= 0)
	{
		$color[$i] = 0;
	} else
	{
		$color[$i] = round($energy[$i] / ((0.2 - 0) / $colorLevel));
	}
}

for ($i = 0; $i < $gridNum; ++ $i)
{
	for ($j = 0; $j < $gridNum; ++ $j)
	{
		echo rand(0, 12 * 100) / 100;
		echo " ";
	}
}
?>
