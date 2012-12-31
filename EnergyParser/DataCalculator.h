// by fzhan@Autolab
// calculate the data we want from the data obtained

#ifndef _DATACALCULATOR_H_
#define _DATACALCULATOR_H_
#include "param.h"

namespace ps
{
	class CDataCalculator
	{
	public:
		CDataCalculator(const double data[TITLE_SIZE]);
		std::string GetData(void);
	protected:
		double GlobalXVel(void);
		double XRatio(void);
		double GlobalYVel(void);
		double YRatio(void);
		double YawRatio(void);
		double DiffCurrent(void);
		double EnergyConsumed(void);
		double DiffBatCapacity(void);
		double m_data[TITLE_SIZE + CALC_TITLE_SIZE];
		static bool is_first;
		static double m_last_data[TITLE_SIZE + CALC_TITLE_SIZE];
	};
};
#endif
