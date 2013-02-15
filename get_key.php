<?php
// by fzhan@Autolab
require __DIR__.'/connect_redis.php';
echo $client->get($_GET["key"]);
?>