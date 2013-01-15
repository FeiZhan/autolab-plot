<?php
// by fzhan@Autolab
// connect with Redis to retrieve data
require __DIR__.'/predis/autoload.php';

function saveData($key, $retval)
{
	$file = fopen("log/".$key."-".date('Y-m-j').".log","a");
	fwrite($file, date('G:i:s')." ".$retval."\n");
	fclose($file);
}
function robotValid($robot)
{
	switch ($robot)
	{
	case 0:
		$rname = "camera0";
		break;
	case 1:
	case 2:
	default:
		$rname = "camera0";
		break;
	}
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
	if ($flag == false)
	{
		//return 0;
	}
	return 1;
}

$single_server = array(
    'host'	=>	'192.168.1.120',
    'port'	=>	6379
);
$client = new Predis\Client($single_server);

// assume there are 3 plots in dynamic-all.html
$ROBOT_NUM = 3;
$DATA_NUM = 6;

for ($i = 0; $i < $ROBOT_NUM; ++ $i)
{
	$data = "";
	for ($j = 0; $j < $DATA_NUM; ++ $j)
	{
		// valid
		if ($j == 0)
		{
			if (robotValid($i))
			{
				$data = "1";
			} else
			{
				$data = "0";
			}
			continue;
		}
		$data = $data." ".(rand(0, 10000) / 100);
	}
	$client->set('cb'.$i, $data);
	$ret = $client->get('cb'.$i);
	// camera0: time robotID x y XXX XXX
	//$ret = $client->get("camera0");
	//saveData('cb'.$i, $ret);
	echo $ret." ";
}
?>
