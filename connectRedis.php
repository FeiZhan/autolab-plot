<?php
// by fzhan@Autolab
// connect with Redis to retrieve data
require __DIR__.'/predis/autoload.php';

$single_server = array(
    'host'	=>	'192.168.1.120',
    'port'	=>	6379
);
$client = new Predis\Client($single_server);

// assume there are 3 plots in dynamic-all.html
$PLOT_NUM = 3;

// camera0: time robotID x y XXX XXX
$retval = $client->get('camera0');
$cb18 = split(" ", $retval);

for ($i = 0; $i < $PLOT_NUM * 5; ++ $i)
{
	if ($i == 3)
	{
		echo $cb18[2];
		echo " ";
		continue;
	}
	else if ($i == 4)
	{
		echo $cb18[3];
		echo " ";
		continue;
	}
	//set several random data, retrieve them back, and output to html.
	$client->set('test', rand(0, 10000));
	$retval = $client->get('test');
	echo $retval / 10000;
	echo " ";
}
?>
