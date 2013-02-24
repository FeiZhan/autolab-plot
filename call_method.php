<?php
// by fzhan@Autolab

require __DIR__.'/connect_redis.php';

$host = $HOST;
$port = $PORT;
if (! is_null($_GET["host"]) && ! is_null($_GET["port"]))
{
	$host = $_GET["host"];
	$port = $_GET["port"];
}
$server = array(
	'host'	=>	$host,
	'port'	=>	$port
);
$client = new Predis\Client($server);
$bak_host = $SECOND_HOST;
$bak_port = $PORT;
if (! is_null($_GET["bak_host"]) && ! is_null($_GET["bak_port"]))
{
	$bak_host = $_GET["bak_host"];
	$bak_port = $_GET["bak_port"];
}
$bak_server = array(
	'host'	=>	$bak_host,
	'port'	=>	$bak_port
);
$bak_client = new Predis\Client($bak_server);

call_method($_GET["method"]);
?>
