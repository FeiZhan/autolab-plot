// by fzhan@Autolab
// create a executive file to parse the data of the robots, and plot with GNUPlot.

#include <iostream>
#include "DataParser.h"
#include "Plot.h"

bool help(void)
{
	std::cout << "Usage: dataparser [OPTION]... [FILE]" << std::endl
		<< "-h: for help" << std::endl
		<< "-f: to open file" << std::endl
		<< "dataparser 1.0 for autolab chatterbox energy project." << std::endl
		<< "Report bugs to zetta217@gmail.com." << std::endl;
	return true;
}
int main(int argc, char *argv[])
{
	std::cerr.rdbuf(std::cout.rdbuf());
	std::clog.rdbuf(std::cout.rdbuf());
	if (argc == 3)
	{
		if (argv[1][1] == 'f')
		{
			ps::CDataParser dp(argv[2]);
			if (! dp.parse())
			{
				std::cerr << "CDataParser error" << std::endl;
				return 1;
			}
			ps::CPlot p(argv[2]);
			if (! p.plot())
			{
				std::cerr << "CPlot error" << std::endl;
				return 1;
			}
		}
		else
		{
			help();
		}
	}
	else
	{
		help();
	}
	return 0;
}
