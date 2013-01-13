#include "./include/gnuplot-cpp/gnuplot_i.hpp"
#include "param.h"
#include "Plot.h"

namespace ps
{
	CPlot::CPlot(const char *path) : m_path(path)
	{}
	bool CPlot::plot(void)
	{
		return PlotCurve() && PlotPng() && PlotTraj();
	}
	bool CPlot::PlotCurve(void)
	{
		std::string ppath = m_path + std::string(".parsed");
		Gnuplot g1;
		g1.savetops(m_path);
		g1.set_grid().set_style("lines").set_xautoscale().set_yautoscale();

		g1.reset_plot().set_xlabel("t").set_ylabel("x")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_x + 1);
		g1.reset_plot().set_xlabel("t").set_ylabel("y")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_y + 1);
		g1.reset_plot().set_xlabel("x").set_ylabel("y")
			.plotfile_xy(ppath, TITLE_x + 1, TITLE_y + 1);
		g1.reset_plot().set_xlabel("t").set_ylabel("yaw")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_yaw + 1);
		g1.reset_plot().set_xlabel("t").set_ylabel("velocity")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_x_vel + 1);
		g1.reset_plot().set_xlabel("t").set_ylabel("yaw_vel")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_yaw_vel + 1);
		g1.reset_plot().set_xlabel("t").set_ylabel("voltage")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_voltage + 1);
		g1.reset_plot().set_xlabel("t").set_ylabel("current")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_current + 1);
		g1.reset_plot().set_xlabel("t").set_ylabel("bat capacity")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_bat_capacity + 1);
		g1.reset_plot().set_xlabel("t").set_ylabel("max bat capacity")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_max_bat_capacity + 1);
		g1.reset_plot().set_xlabel("t").set_ylabel("bat level")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_bat_level + 1);
		g1.reset_plot().set_xlabel("t").set_ylabel("is charging")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_is_charging + 1);
		g1.reset_plot().set_xlabel("t").set_ylabel("charging state")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_charging_state + 1);
		g1.reset_plot().set_xlabel("t").set_ylabel("vol lpf")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_vol_lpf + 1);
		g1.reset_plot().set_xlabel("t").set_ylabel("temperature")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_temperature + 1);
		g1.reset_plot().set_xlabel("t").set_ylabel("energy consumed")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_energy_consumed + 1);
		g1.reset_plot().set_xlabel("x vel").set_ylabel("energy consumed")
			.set_style("points")
			.plotfile_xy(ppath, TITLE_x_vel + 1, TITLE_energy_consumed + 1);
		g1.reset_plot().set_xlabel("t").set_ylabel("diff bat capacity")
			.set_style("lines").set_yrange(-0.002, 0.0002)
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_diff_bat_capacity + 1);
		g1.reset_plot().set_xlabel("x vel").set_ylabel("diff bat capacity")
			.set_style("points").set_yrange(-0.002, 0.0002)
			.plotfile_xy(ppath, TITLE_x_vel + 1, TITLE_diff_bat_capacity + 1);

		/*g1.savetops(ppath + "_charging");
		g1.set_xrange(1400, 2000).set_yautoscale().set_style("points")
			.reset_plot().set_xlabel("t").set_ylabel("charging state")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_charging_state + 1);
		g1.set_xrange(1400, 2000).set_yautoscale().set_style("points")
			.reset_plot().set_xlabel("t").set_ylabel("current")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_current + 1);
		g1.set_yautoscale().set_style("lines")
			.reset_plot().set_xlabel("t").set_ylabel("current")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_current + 1);

		g1.set_xrange(1400, 1420).set_yautoscale().set_style("points")
			.reset_plot().set_xlabel("t").set_ylabel("current")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_current + 1);
		g1.set_yautoscale().set_style("lines")
			.reset_plot().set_xlabel("t").set_ylabel("current")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_current + 1);
		g1.set_xrange(1400, 1420).set_yautoscale().set_style("points")
			.reset_plot().set_xlabel("t").set_ylabel("voltage")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_voltage + 1);
		g1.set_yautoscale().set_style("lines")
			.reset_plot().set_xlabel("t").set_ylabel("voltage")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_voltage + 1);*/
		return true;
	}
	bool CPlot::PlotPng(void)
	{
		std::string ppath = m_path + std::string(".parsed");
		Gnuplot g2;
		g2.set_grid().set_style("lines").set_xautoscale().set_yautoscale();
		g2.reset_plot().savetopng(m_path + "_tx").set_xlabel("t").set_ylabel("x")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_x + 1);
		g2.reset_plot().savetopng(m_path + "_ty").set_xlabel("t").set_ylabel("y")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_y + 1);
		g2.reset_plot().savetopng(m_path + "_xy").set_xlabel("x").set_ylabel("y")
			.plotfile_xy(ppath, TITLE_x + 1, TITLE_y + 1);
		g2.reset_plot().savetopng(m_path + "_tyaw").set_xlabel("t").set_ylabel("yaw")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_yaw + 1);
		g2.reset_plot().savetopng(m_path + "_tvelocity").set_xlabel("t").set_ylabel("velocity")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_x_vel + 1);
		g2.reset_plot().savetopng(m_path + "_tyawvel").set_xlabel("t").set_ylabel("yaw_vel")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_yaw_vel + 1);
		g2.reset_plot().savetopng(m_path + "_tvoltage").set_xlabel("t").set_ylabel("voltage")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_voltage + 1);
		g2.reset_plot().savetopng(m_path + "_tcurrent").set_xlabel("t").set_ylabel("current")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_current + 1);
		g2.reset_plot().savetopng(m_path + "_tbatcap").set_xlabel("t").set_ylabel("bat capacity")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_bat_capacity + 1);
		g2.reset_plot().savetopng(m_path + "_tmbatcap").set_xlabel("t").set_ylabel("max bat capacity")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_max_bat_capacity + 1);
		g2.reset_plot().savetopng(m_path + "_tbatlevel").set_xlabel("t").set_ylabel("bat level")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_bat_level + 1);
		g2.reset_plot().savetopng(m_path + "_tischarg").set_xlabel("t").set_ylabel("is charging")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_is_charging + 1);
		g2.reset_plot().savetopng(m_path + "_tchargstate").set_xlabel("t").set_ylabel("charging state")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_charging_state + 1);
		g2.reset_plot().savetopng(m_path + "_tvollpf").set_xlabel("t").set_ylabel("vol lpf")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_vol_lpf + 1);
		g2.reset_plot().savetopng(m_path + "_ttemp").set_xlabel("t").set_ylabel("temperature")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_temperature + 1);
		g2.reset_plot().savetopng(m_path + "_tenercons").set_xlabel("t").set_ylabel("energy consumed")
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_energy_consumed + 1);
		g2.reset_plot().savetopng(m_path + "_xvelenercons").set_xlabel("x vel").set_ylabel("energy consumed")
			.set_style("points")
			.plotfile_xy(ppath, TITLE_x_vel + 1, TITLE_energy_consumed + 1);
		g2.reset_plot().savetopng(m_path + "_tdiffbatcap").set_xlabel("t").set_ylabel("diff bat capacity")
			.set_style("lines").set_yrange(-0.002, 0.0002)
			.plotfile_xy(ppath, TITLE_t + 1, TITLE_diff_bat_capacity + 1);
		g2.reset_plot().savetopng(m_path + "_xveldiffbatcap").set_xlabel("x vel").set_ylabel("diff bat capacity")
			.set_style("points").set_yrange(-0.002, 0.0002)
			.plotfile_xy(ppath, TITLE_x_vel + 1, TITLE_diff_bat_capacity + 1);
		return true;
	}
	bool CPlot::PlotTraj(void)
	{
		return true;
	}
};
