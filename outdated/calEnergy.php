<?php
//require __DIR__.'/parameter.php';
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
$ROBOT_NAME = array("shit1", "shit2", "shit3");//array("cb18", "cb01", "pioneer01");
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
?>
