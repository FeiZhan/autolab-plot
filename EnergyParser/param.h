#ifndef _PARAM_H_
#define _PARAM_H_

#include <string>

namespace ps
{
	const std::string SEPARATOR = ",;";
	const std::string BLANKS = " \t";
	const size_t TITLE_SIZE = 18;
	typedef enum
	{
		TITLE_t = 0,
		TITLE_x,
		TITLE_y,
		TITLE_yaw,
		TITLE_x_vel,
		TITLE_y_vel,
		TITLE_yaw_vel,
		TITLE_voltage,
		TITLE_current,
		TITLE_bat_capacity,
		TITLE_max_bat_capacity,
		TITLE_bat_level,
		TITLE_is_charging,
		TITLE_charging_source,
		TITLE_charging_state,
		TITLE_vol_lpf,
		TITLE_energy_diss,
		TITLE_temperature,

		// CalcTitleEnum starting with 15
		TITLE_global_x_vel,
		TITLE_x_ratio,
		TITLE_global_y_vel,
		TITLE_y_ratio,
		TITLE_yaw_ratio,
		//
		TITLE_diff_current,	//starting with 20
		TITLE_energy_consumed,
		TITLE_diff_bat_capacity
	} TitleEnum;
	const size_t CALC_TITLE_SIZE = 8;
	const std::string TITLES[TITLE_SIZE + CALC_TITLE_SIZE] = {"t", "x", "y", "yaw"
		/*, "x_vel", "y_vel", "yaw_vel"*/, "xDot", "yDot", "yamDot"
		, "voltage", "current"
		/*, "bat_capacity", "m_bat_capacity", "bat_level"*/, "battCap", "mBattCap", "batLel", "isCharge", "cSoure", "cState"
		/*, "vol_lpf", "energy_diss", "temperature"*/, "mVLpf", "tEneDiss", "battTem"
		, "global_x_vel", "x_ratio", "global_y_vel", "y_ratio"
		, "yaw_ratio", "diff_current", "energy_consumed"
		, "diff_bat_capacity"};
};

#endif
