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

// under process

export default CategoryDistributionChart;
