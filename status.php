<?php
// by fzhan@Autolab

require __DIR__.'/connect_redis.php';

echo "dbsize ".$client->dbsize().", lastsave ".$client->lastsave().", ";
$info = $client->info();
foreach ($info as $key => $value)
{
	echo $key." ".$value.", ";
}
?>