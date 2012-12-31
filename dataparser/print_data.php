<?php
// by fzhan@Autolab
// generate a table of data

$filename = './data/'.$_GET["filename"];
$file = fopen($filename, "r") or exit("unable to open file");

echo 'successfully opened the data file.<br />';

//$cmd = './a.out'; $ret = passthru($cmd); var_dump($ret);
// call a c++ program to generate data
if (exec('./dataparser -f ./data/'.$_GET["filename"], $output, $ret))
{
	echo 'failed to plot the curves.<br />';
	var_dump($output); var_dump($ret);
} else
{
	echo 'successfully plotted the curve.<br />';
	echo '<a href="plot.php?filename='.$_GET["filename"].'">click to see plots here</a>';
}

echo '<hr /><table border="1"><caption>data list</caption>';
/*
if (file_exists($filename.'.parsed') && is_readable($filename.'.parsed'))
{
	fclose($file);
	$file = fopen($filename.'.parsed', "r") or exit("unable to open file");
}
*/
while (! feof($file))
{
	$line = fgets($file);
	echo '<tr>';
	$data = strtok($line, ',');
	while ($data != false && strlen($data) > 1)
	{
		echo '<td>'.$data.'</td>';
		$data = strtok(',');
	}
	echo '</tr>';
}
echo '</table>';
fclose($file);
?>
