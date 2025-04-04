import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from "recharts";
import { motion } from "framer-motion";

const alertData = [
	{ name: "Jul", alerts: 120 },
	{ name: "Aug", alerts: 100 },
	{ name: "Sep", alerts: 150 },
	{ name: "Oct", alerts: 130 },
	{ name: "Nov", alerts: 180 },
	{ name: "Dec", alerts: 210 },
	{ name: "Jan", alerts: 200 },
	{ name: "Feb", alerts: 190 },
	{ name: "Mar", alerts: 220 },
	{ name: "Apr", alerts: 210 },
	{ name: "May", alerts: 230 },
	{ name: "Jun", alerts: 250 },
];

const AlertOverviewChart = () => {
	return (
		<motion.div
			className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<h2 className='text-lg font-medium mb-4 text-gray-100'>Alert Overview</h2>

			<div className='h-80'>
				<ResponsiveContainer width={"100%"} height={"100%"}>
					<LineChart data={alertData}>
						<CartesianGrid strokeDasharray='3 3' stroke='#4B5563' />
						<XAxis dataKey={"name"} stroke='#9ca3af'>
							<Label
								value='Months'
								offset={-5}
								position='insideBottom'
								style={{ fill: "#9ca3af", fontSize: "12px" }}
							/>
						</XAxis>
						<YAxis stroke='#9ca3af'>
							<Label
								value='Number of Alerts'
								angle={-90}
								position='insideLeft'
								style={{ fill: "#9ca3af", fontSize: "12px" }}
							/>
						</YAxis>
						<Tooltip
							contentStyle={{
								backgroundColor: "rgba(31, 41, 55, 0.8)",
								borderColor: "#4B5563",
							}}
							itemStyle={{ color: "#E5E7EB" }}
							labelStyle={{ color: "#E5E7EB" }}
						/>
						<Line
							type='monotone'
							dataKey='alerts'
							stroke='#FF4500'
							strokeWidth={3}
							dot={{ fill: "#FF4500", strokeWidth: 2, r: 6 }}
							activeDot={{ r: 8, strokeWidth: 2 }}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};

export default AlertOverviewChart;
