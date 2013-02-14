<?php
// by fzhan@Autolab

require __DIR__.'/predis/autoload.php';
$single_server = array(
    'host'	=>	'192.168.1.120',
    'port'	=>	6379
);
$client = new Predis\Client($single_server);

echo "dbsize ".$client->dbsize().", lastsave ".$client->lastsave().", ";
$info = $client->info();
foreach ($info as $key => $value)
{
	echo $key." ".$value.", ";
}
?>