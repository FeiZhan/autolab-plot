#include <memory.h>
#include <iostream>
#include <cmath>
#include <sstream>
#include "param.h"
#include "DataCalculator.h"

namespace ps
{
	bool CDataCalculator::is_first = true;
	double CDataCalculator::m_last_data[TITLE_SIZE + CALC_TITLE_SIZE] = {0};
	CDataCalculator::CDataCalculator(const double data[TITLE_SIZE])
	{
		for (size_t i = 0; i < TITLE_SIZE; ++ i)
		{
			m_data[i] = data[i];
		}
		for (size_t i = TITLE_SIZE; i < TITLE_SIZE + CALC_TITLE_SIZE; ++ i)
		{
			m_data[i] = 0;
		}
	}
	std::string CDataCalculator::GetData(void)
	{
		if (true == is_first)
		{
			is_first = false;
			memcpy(m_last_data, m_data, sizeof(m_data));
		}
		std::ostringstream oss;
		for (size_t i = 0; i < TITLE_SIZE; ++ i)
		{
			oss << m_data[i] << ", ";
		}
		oss << GlobalXVel() << ", "
			<< XRatio() << ", "
			<< GlobalYVel() << ", "
			<< YRatio() << ", "
			<< YawRatio() << ", "
			<< DiffCurrent() << ", "
			<< EnergyConsumed() << ", "
			<< DiffBatCapacity() << ", ";
		memcpy(m_last_data, m_data, sizeof(m_data));
		return oss.str();
	}
	double CDataCalculator::GlobalXVel(void)
	{
		return m_data[TITLE_global_x_vel] = 
			m_data[TITLE_x_vel] * cos(m_data[TITLE_yaw])
			+ m_data[TITLE_y_vel] * sin(m_data[TITLE_yaw]);
	}
	double CDataCalculator::XRatio(void)
	{
		if (m_data[TITLE_x] != 0)
		{
			m_data[TITLE_x_ratio] = 
			(m_data[TITLE_x] - m_last_data[TITLE_x] - m_data[TITLE_global_x_vel])
				/ m_data[TITLE_x];
		} else
		{
			m_data[TITLE_x_ratio] = 0;
		}
		return m_data[TITLE_x_ratio];
	}
	double CDataCalculator::GlobalYVel(void)
	{
		return m_data[TITLE_global_y_vel] = 
			m_data[TITLE_x_vel] * sin(m_data[TITLE_yaw])
			+ m_data[TITLE_y_vel] * cos(m_data[TITLE_yaw]);
	}
	double CDataCalculator::YRatio(void)
	{
		if (m_data[TITLE_y] != 0)
		{
			m_data[TITLE_y_ratio] =	
			 (m_data[TITLE_y] - m_last_data[TITLE_y] - m_data[TITLE_global_y_vel])
				/ m_data[TITLE_y];
		} else
		{
			m_data[TITLE_y_ratio] = 0;
		}
		return m_data[TITLE_y_ratio];
	}
	double CDataCalculator::YawRatio(void)
	{
		if (m_data[TITLE_yaw] != 0)
		{
			m_data[TITLE_yaw_ratio] = 
				(m_data[TITLE_yaw] - m_last_data[TITLE_yaw] - m_data[TITLE_yaw_vel])
				/ m_data[TITLE_yaw];
		} else
		{
			m_data[TITLE_yaw_ratio] = 0;
		}
		return m_data[TITLE_yaw_ratio];
	}
	double CDataCalculator::DiffCurrent(void)
	{
		return m_data[TITLE_diff_current] =
			m_data[TITLE_current] - m_last_data[TITLE_current];
	}
	double CDataCalculator::EnergyConsumed(void)
	{
		return m_data[TITLE_energy_consumed] = -
			(m_data[TITLE_voltage] + m_last_data[TITLE_voltage]) / 2.0
			* (m_data[TITLE_current] + m_last_data[TITLE_current]) / 2.0
			* (m_data[TITLE_t] - m_last_data[TITLE_t]);
	}
	double CDataCalculator::DiffBatCapacity(void)
	{
		return m_data[TITLE_diff_bat_capacity] =
			m_data[TITLE_bat_capacity] - m_last_data[TITLE_bat_capacity];
	}
};
