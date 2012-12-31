<?php
// by fzhan@Autolab
// connect with Redis to retrieve data
require __DIR__.'/predis/autoload.php';
$single_server = array(
    'host'     => '192.168.1.115',
    'port'     => 6379,
    'database' => 15
);
$client = new Predis\Client($single_server);
// assume there are 3 plots in dynamic-all.html
$PLOT_NUM = 3;
for ($i = 0; $i < $PLOT_NUM * 5; ++ $i)
{
	//set several random data, retrieve them back, and output to html.
	$client->set('test', rand(0, 10000));
	$retval = $client->get('test');
	echo $retval / 10000;
	echo " ";
}
?>
