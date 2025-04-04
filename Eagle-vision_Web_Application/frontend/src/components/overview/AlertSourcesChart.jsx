import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";

const COLORS = ["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B"];

const ALERT_SOURCES_DATA = [
	{ name: "CCTV Cameras", value: 240 },
	{ name: "Patrol Reports", value: 180 },
	{ name: "Citizen Reports", value: 120 },
	{ name: "Social Media", value: 60 },
];

const AlertSourcesChart = () => {
	return (
		<motion.div
			className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 lg:col-span-2 border border-gray-700'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.4 }}
		>
			<h2 className='text-lg font-medium mb-4 text-gray-100'>Alert Sources</h2>

			{/* under process */}
		</motion.div>
	);
};

export default AlertSourcesChart;
