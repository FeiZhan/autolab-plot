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
		$rname = "shit1";
		break;
	case 1:
		$rname = "shit2";
		break;
	case 2:
	default:
		$rname = "camera0";
		break;
	}
	$file = fopen("log/".$rname."-".date('Y-m-j').".log","r");
	$len = strlen(fgets($file));
	$flag = false;
	if (filesize("log/".$rname."-".date('Y-m-j').".log") > $len * 10)
	{
		fseek($file, - $len * 10, SEEK_END);
		$last = split(" ", fgets($file));
		$last = $last[1];
		for ($i = 1; $i < 10; ++ $i)
		{
			$frame = split(" ", fgets($file));
			$frame = $frame[1];
//echo "(".$rname." ".$frame." ".$last." )";
			if ($frame != $last)
			{
				$flag = true;
				break;
			}
			$last = $frame;
		}
	} else
	{
		return 1;
	}
	fclose($file);
	if ($flag == false)
	{
		return 0;
	}
	return 1;
}

$single_server = array(
    'host'	=>	'192.168.1.120',
    'port'	=>	6379
);
$client = new Predis\Client($single_server);

// assume there are 3 robots
$ROBOT = array("cb18", "cb01", "pi01");
//time x y voltage current | self-set parameters: valid

foreach ($ROBOT as $i)
{
		// valid
		/*if ($j == 0)
		{
			if (robotValid($i))
			{
				$data = "1";
			} else
			{
				$data = "0";
			}
			continue;
		}*/
	$data = "1";
	$ret = $client->get($i);
	saveData($i, $ret." ".$data);
	echo $ret.", ";
}
?>
