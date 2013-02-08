<?php
// by fzhan@Autolab
// connect with Redis to retrieve general data
require __DIR__.'/predis/autoload.php';
$single_server = array(
    'host'	=>	'192.168.1.120',
    'port'	=>	6379
);
$client = new Predis\Client($single_server);
echo $client->get($_GET["key"]);
?>
