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
		bool ParseTitle(const std::string &titles);
		const std::string ParseContent(const std::string &line);
		std::string m_path;
		size_t m_title_pos[TITLE_SIZE];
	};
};
#endif
