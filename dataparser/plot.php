<?php
$fpath = './data/'.$_GET['filename'];
echo '<h1 align="center">plots of all curves</h1>';
$name_list = array('tx', 'ty', 'xy', 'tyaw', 'tvelocity', 'tyawvel'
	, 'tvoltage', 'tcurrent', 'tbatcap', 'tmbatcap', 'tbatlevel'
	, 'tischarg', 'tchargstate', 'tvollpf', 'ttemp', 'tenercons'
	, 'xvelenercons', 'tdiffbatcap', 'xveldiffbatcap');
foreach ($name_list as $i)
{
	echo '<img src="'.$fpath.'_'.$i.'.png" alt="plot '.$i.'" /><br />';
}
?>
