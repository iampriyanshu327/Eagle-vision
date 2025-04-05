import { motion } from "framer-motion";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import { UsersIcon, UserPlus, UserCheck, UserX, AlertCircle, Clock, CheckCircle, BarChart2 } from "lucide-react";
import { Player } from "@lottiefiles/react-lottie-player";

// Mock data for the table

const ContentWithLottie = () => (
  <div className="flex items-center justify-center mb-8 mt-10 space-x-8">
    {/* Lottie Animation */}
    <Player
      autoplay
      loop
      src="DoomCCTV.json"
      className="w-32 h-32"
    />

    
    {/* Content */}
    <div className="flex flex-col items-center text-center">
      <img
        src="etherium.png"
        alt="Eagle Logo"
        className="w-20 h-15 object-contain mb-3"
      />
      
      <div className="text-4xl font-extrabold tracking-wide mt-1 mb-3">
        <span className="bg-gradient-to-t from-[#00E68F] via-[#00B378] to-[#007F5E] bg-clip-text text-transparent">
          EAGLE
        </span>{" "}
        <span className="bg-gradient-to-b from-[#00E68F] via-[#00B378] to-[#007F5E] bg-clip-text text-transparent">
          SAFE
        </span>
      </div>
      <p className="text-gray-400 text-lg max-w-2xl mt-1 leading-relaxed">
        Statistical data of cases undertaken and lead are listed out here.
      </p>
    </div>
  </div>
);


const caseStats = {
	totalCases: 120,
	resolvedCases: 85,
	pendingCases: 25,
	underInvestigationCases: 10,
  };
const caseData = [
  {
    officerName: "Pandey",
    locality: "Garha",
    caseType: "Theft",
    description: "Stolen vehicle found in the locality.",
    status: "Resolved",
  },
  {
    officerName: "Prabhsimran",
    locality: "Gorakhpur",
    caseType: "Assault",
    description: "Physical assault case near the market.",
    status: "Investigating",
  },
  {
    officerName: "Raja",
    locality: "Vijay nagar",
    caseType: "Fraud",
    description: "Online fraud involving stolen credit card information.",
    status: "Pending",
  },
  {
    officerName: "Balaji Venkatesh",
    locality: "Adhartal",
    caseType: "Missing Person",
    description: "A person went missing in the local park.",
    status: "Resolved",
  },
];



const UsersPage = () => {
  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Case Statistics" />

      <ContentWithLottie/>

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* STATS */}
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
			<StatCard
				name="Total Cases"
				icon={BarChart2} // Icon for total cases
				value={caseStats.totalCases}
				color="#6366F1"
			/>
			<StatCard
				name="Resolved Cases"
				icon={CheckCircle} // Icon for resolved cases
				value={caseStats.resolvedCases}
				color="#10B981"
			/>
			<StatCard
				name="Pending Cases"
				icon={Clock} // Icon for pending cases
				value={caseStats.pendingCases}
				color="#F59E0B"
			/>
			<StatCard
				name="Under Investigation"
				icon={AlertCircle} // Icon for cases under investigation
				value={caseStats.underInvestigationCases}
				color="#EF4444"
			/>
        </motion.div>

        {/* Surveillance Cases Table */}
        <div className="overflow-x-auto shadow-md sm:rounded-lg">
          <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Officer Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Locality
                </th>
                <th scope="col" className="px-6 py-3">
                  Case Type
                </th>
                <th scope="col" className="px-6 py-3">
                  Case Description
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {caseData.map((caseItem, index) => (
                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{caseItem.officerName}</td>
                  <td className="px-6 py-4">{caseItem.locality}</td>
                  <td className="px-6 py-4">{caseItem.caseType}</td>
                  <td className="px-6 py-4">{caseItem.description}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        caseItem.status === "Resolved"
                          ? "bg-green-100 text-green-800"
                          : caseItem.status === "Investigating"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {caseItem.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* USER CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* User Growth Chart */}
          {/* <UserGrowthChart /> */}
          {/* User Activity Heatmap */}
          {/* <UserActivityHeatmap /> */}
          {/* User Demographics Chart */}
          {/* <UserDemographicsChart /> */}
        </div>
      </main>
    </div>
  );
};

export default UsersPage;
