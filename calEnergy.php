<?php
$file = fopen("log/".$rname."-".date('Y-m-j').".log","r");
$len = strlen(fgets($file));
$flag = false;
if (filesize($file) > $len * 10)
{
	fseek($file, - $len * 10, SEEK_END);
	$last = split(" ", fgets($file));
	$last = $last[1];
	for ($i = 1; $i < 10; ++ $i)
	{
		$frame = split(" ", fgets($file));
		$frame = $frame[1];
		if ($frame != $last)
		{
			$flag = true;
			break;
		}
		$last = $frame;
	}
}
fclose($file);
?>
