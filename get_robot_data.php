<?php
// by fzhan@Autolab
// connect with Redis to retrieve data
require __DIR__.'/connect_redis.php';

// save data into a .log file
//[todo] should I save to Redis or mysql?
function saveData($key, $retval)
{
	$file = fopen("log/".$key."-".date('Y-m-j').".log","a");
	fwrite($file, date('G:i:s')." ".$retval."\n");
	fclose($file);
}
//time x y voltage current | self-set parameters: valid
foreach ($ROBOT_NAME as $i)
{
	$data = "1";
	$ret = $client->get($i);
	//saveData($i, $ret." ".$data);
	echo $ret.", ";
}
?>