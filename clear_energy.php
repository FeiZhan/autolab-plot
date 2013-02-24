<?php
$ROBOT_NAME = array("shit1", "shit2", "shit3");//array("cb18", "cb01", "pioneer01");
$frame = 0;
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
		if ($new[1] > $frame)
		{
			$frame = $new[1];
			$best = $i;
		}
	}
}
$ENERGY_PATH = "log/energy-".date('Y-m-j').".log";
$file = fopen($ENERGY_PATH, "w");

$file2 = fopen("log/".$ROBOT_NAME[$best]."-".date('Y-m-j').".log", "r");
$len = strlen(fgets($file2));
fseek($file2, - $len, SEEK_END);
$new = split(" ", fgets($file2));
fclose($file2);

fwrite($file, $new[1]."\n");
$gridNum = 10;
for ($i = 0; $i < $gridNum * $gridNum; ++ $i)
{
	fwrite($file, "0 ");
}
fclose($file);
echo '<html><body><h1>Clear Over. <a href="dynamic-all.html">Click me to return.</a></h1></body></html>'
?>
