#include <iostream>
#include "DataParserTest.h"

CDataParserTest::CDataParserTest(const std::string &path)/* : m_path(path)*/
{
	m_path = path;
}
bool CDataParserTest::test(void)
{
	return ParseTitleTest() & parseTest() & GetTitleTest();
}
bool CDataParserTest::ParseTitleTest(void)
{
	std::cout << "------ParseTitleTest-----------" << std::endl;

	std::cout << "---test case 1---" << std::endl;
	if (! ParseTitle("t; x; y; other; yaw"))
	{
		std::cout << "ParseTitle error" << std::endl;
		return false;
	}
	std::cout << "m_title_vec:" << std::endl;
	for (int i = 0; i < m_title_vec.size(); ++ i)
	{
		std::cout << i << " " << m_title_vec.at(i) << std::endl;
	}

	std::cout << "---test case 2---" << std::endl;
	if (! ParseTitle(""))
	{
		std::cout << "ParseTitle error" << std::endl;
		return false;
	}
	std::cout << "m_title_vec:" << std::endl;
	for (int i = 0; i < m_title_vec.size(); ++ i)
	{
		std::cout << m_title_vec.at(i) << std::endl;
	}
}
bool CDataParserTest::parseTest(void)
{
	return true;
}
bool CDataParserTest::GetTitleTest(void)
{
	std::cout << "------ParseTitleTest-----------" << std::endl;
	std::cout << "---test case 1---" << std::endl;
	if (! ParseTitle("t; x; y; other; yaw"))
	{
		std::cout << "ParseTitle error" << std::endl;
		return false;
	}
	std::cout << "GetTitle:" << std::endl;
	for (int i = 0; i < m_title_vec.size(); ++ i)
	{
		std::cout << i << " " << GetTitle().at(i) << std::endl;
	}
	return true;
}
int main(int argc, char *argv[])
{
	CDataParserTest test("data.txt");
	test.test();
	return 0;
}
