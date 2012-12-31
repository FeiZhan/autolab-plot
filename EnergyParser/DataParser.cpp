#include <memory.h>
#include <fstream>
#include <sstream>
#include <vector>
#include "param.h"
#include "DataCalculator.h"
#include "DataParser.h"

namespace ps
{
	CDataParser::CDataParser(const std::string &path) : m_path(path)
	{}
	bool CDataParser::parse(void)
	{
		std::ifstream in_file(m_path.c_str());
		if (! in_file.is_open())
		{
			std::cerr << "unable to open file " << m_path << std::endl;
			return false;
		}
		std::string line;
		getline(in_file, line);
		if (! ParseTitle(line))
		{
			return false;
		}
		std::ofstream out_file((m_path + ".parsed").c_str());
		if (! out_file.is_open())
		{
			std::cerr << "unable to open file " << m_path + ".parsed" << std::endl;
			return false;
		}
		while (in_file.good() && out_file.good())
		{
			getline(in_file, line);
			out_file << ParseContent(line) << std::endl;
		}
		out_file.close();
		in_file.close();
		return true;
	}
	bool CDataParser::ParseTitle(const std::string &titles)
	{
		std::string titles_tmp(titles);
		for (size_t i = 0; i < titles_tmp.size(); ++ i)
		{
			for (size_t j = 0; j < BLANKS.size(); ++ j)
			{
				if (titles_tmp.at(i) == BLANKS.at(j))
				{
					titles_tmp.erase(i, 1);
					-- i;
					break;
				}
			}
		}
		int sep, tmp, title_cnt = 0;
		std::string title_tmp;
		memset(m_title_pos, 0, sizeof(m_title_pos));
		while (titles_tmp.size())
		{
			sep = titles_tmp.size();
			for (size_t i = 0; i < SEPARATOR.size(); ++ i)
			{
				tmp = titles_tmp.find(SEPARATOR.at(i));
				if (tmp >= 0 && sep > tmp)
				{
					sep = tmp;
				}
			}
			++ title_cnt;
			title_tmp = titles_tmp.substr(0, sep);
			titles_tmp.erase(0, sep + 1);
			for (size_t i = 0; i < TITLE_SIZE; ++ i)
			{
				if (title_tmp == TITLES[i])
				{
					m_title_pos[i] = title_cnt;
					break;
				}
			}
		}
		return true;
	}
	const std::string CDataParser::ParseContent(const std::string &line)
	{
		if (line.size() <= 1)
		{
			return std::string("");
		}
		std::string line_tmp(line);
		std::vector<std::string> data_vec;
		int sep, tmp;
		while (line_tmp.size())
		{
			sep = line_tmp.size();
			for (size_t i = 0; i < SEPARATOR.size(); ++ i)
			{
				tmp = line_tmp.find(SEPARATOR.at(i));
				if (tmp >= 0 && sep > tmp)
				{
					sep = tmp;
				}
			}
			data_vec.push_back(line_tmp.substr(0, sep));
			line_tmp.erase(0, sep + 1);
		}
		std::stringstream ss;
		double data[TITLE_SIZE];
		for (size_t i = 0; i < TITLE_SIZE; ++ i)
		{
			if (m_title_pos[i] > 0 && data_vec.size() > m_title_pos[i])
			{
				ss.clear();
				ss << data_vec.at(m_title_pos[i] - 1);
				ss >> data[i];
			}
			else
			{
				data[i] = 0;
			}
		}
		CDataCalculator dc(data);
		return dc.GetData();
	}
}
