// by fzhan@Autolab
// parse the data file

#ifndef _DATAPARSER_H_
#define _DATAPARSER_H_

#include <iostream>
#include <string>
#include <set>
#include "param.h"

namespace ps
{
	class CDataParser
	{
	public:
		CDataParser(const std::string &path = "");
		bool parse(void);
	protected:
		// parse the title into correct order
		bool ParseTitle(const std::string &titles);
		// read and parse the content of data files
		const std::string ParseContent(const std::string &line);
		std::string m_path;
		size_t m_title_pos[TITLE_SIZE];
	};
};
#endif
