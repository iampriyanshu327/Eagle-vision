import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const ALERT_CATEGORY_DATA = [
	{ name: "Women Abuse", value: 40 },
	{ name: "Vandalism", value: 25 },
	{ name: "Suspicious Activity", value: 20 },
	{ name: "Emergency", value: 10 },
	{ name: "Other", value: 5 },
];

const COLORS = ["#3B82F6", "#EC4899", "#F59E0B", "#10B981", "#6366F1"];

const CategoryDistributionChart = () => {
	return (
		<motion.div
			className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.3 }}
		>
			<h2 className='text-lg font-medium mb-4 text-gray-100'>Alert Category Distribution</h2>
			<div className='h-80'>
				<ResponsiveContainer width={"100%"} height={"100%"}>
					<PieChart>
						<Pie
							data={ALERT_CATEGORY_DATA}
							cx={"50%"}
							cy={"50%"}
							labelLine={false}
							outerRadius={80}
							fill='#8884d8'
							dataKey='value'
							label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
						>
							{ALERT_CATEGORY_DATA.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
							))}
						</Pie>
						<Tooltip
							contentStyle={{
								backgroundColor: "rgba(31, 41, 55, 0.8)",
								borderColor: "#4B5563",
							}}
							itemStyle={{ color: "#E5E7EB" }}
						/>
						<Legend wrapperStyle={{ color: "#E5E7EB" }} />
					</PieChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};

export default CategoryDistributionChart;
