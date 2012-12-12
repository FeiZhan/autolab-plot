<?php
require __DIR__.'/predis/autoload.php';
$single_server = array(
    'host'     => '192.168.1.115',
    'port'     => 6379,
    'database' => 15
);
$client = new Predis\Client($single_server);
$client->set('test', rand(0, 10000));
$retval = $client->get('test');
echo $retval / 10000;
?>
