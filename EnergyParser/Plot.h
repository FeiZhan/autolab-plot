// by fzhan@Autolab
// plot figures with GNUPlot

#ifndef _PLOT_H_
#define _PLOT_H_

#include <iostream>
#include <string>
#include <vector>
#include "param.h"

namespace ps
{
	class CPlot
	{
	public:
		CPlot(const char *path = "");
		bool plot(void);
	protected:
		// obtain eps files
		bool PlotCurve(void);
		// obtain png files
		bool PlotPng(void);
		bool PlotTraj(void);
		std::string m_path;
		std::vector<int> m_title;
	};
};
#endif
