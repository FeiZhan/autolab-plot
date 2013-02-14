<?php
// by fzhan@Autolab
// connect with Redis to retrieve data
require __DIR__.'/predis/autoload.php';

// save data into a .log file
//[todo] should I save to Redis or mysql?
function saveData($key, $retval)
{
	$file = fopen("log/".$key."-".date('Y-m-j').".log","a");
	fwrite($file, date('G:i:s')." ".$retval."\n");
	fclose($file);
}

$single_server = array(
    'host'	=>	'192.168.1.120',
    'port'	=>	6379
);
$client = new Predis\Client($single_server);

// assume there are 3 robots
//[todo] put the names of robots out of programs
$ROBOT = array("cb18", "cb01", "pi01");

//time x y voltage current | self-set parameters: valid
foreach ($ROBOT as $i)
{
	$data = "1";
	$ret = $client->get($i);
	//saveData($i, $ret." ".$data);
	echo $ret.", ";
}
?>
