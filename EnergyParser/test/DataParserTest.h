#ifndef _DATAPARSER_TEST_H_
#define _DATAPARSER_TEST_H_
#include "../DataParser.h"
using namespace ps;

class CDataParserTest : public CDataParser
{
public:
	CDataParserTest(const std::string &path = "");
	bool test(void);
protected:
	bool ParseTitleTest(void);
	bool parseTest(void);
	bool GetTitleTest(void);
};
#endif
