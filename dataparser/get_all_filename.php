<?php
function reachdir($dir)
{
	if(is_dir($dir))
	{
		if($df=opendir($dir))
		{
			while(($file=readdir($df))!==false)
			{
				if(!in_array($file,array(".","..")))
				{
					if(is_dir($root."/".$file))
					{
						reachdir($root."/".$file);
						echo "<p>目录-><span style='color:#FF0000;'>".$file."</span><br/></p>";
					} else
					{
						echo "<p>".$file."<br/></p>";
					}
				}
			}
			closedir($df);
		} else
		{
			echo "<p>cannot open</p>";
		}
	} else
	{
		echo "<p>not a dir</p>";
		echo "<p>now it is ".getcwd()."</p>";
	}
}
reachdir('data');
?>
