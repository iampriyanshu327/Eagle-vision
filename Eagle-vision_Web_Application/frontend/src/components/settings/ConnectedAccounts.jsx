import { useState } from "react";
import SettingSection from "./SettingSection";
import { HelpCircle, Plus } from "lucide-react";

const ConnectedAccounts = () => {
	const [connectedAccounts, setConnectedAccounts] = useState([
		{
			id: 1,
			name: "MongoDB",
			connected: true,
			icon: "https://www.pngall.com/wp-content/uploads/13/Mongodb-PNG-Image-HD.png",
		},
		{
			id: 2,
			name: "ExpressJS",
			connected: false,
			icon: "https://e7.pngegg.com/pngimages/558/166/png-clipart-node-js-javascript-react-express-js-linux-foundation-mongodb-icons-angle-text-thumbnail.png",
		},
		{
			id: 3,
			name: "ReactJS",
			connected: true,
			icon: "https://cdn4.iconfinder.com/data/icons/logos-3/600/React.js_logo-512.png",
		},{
			id: 4,
			name: "NodeJS",
			connected: true,
			icon: "https://www.mangoitsolutions.com/wp-content/uploads/2020/11/node_js-1.png",
		},{
			id: 5,
			name: "Python",
			connected: true,
			icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/1869px-Python-logo-notext.svg.png",
		},{
			id: 6,
			name: "Flask",
			connected: true,
			icon: "https://static-00.iconduck.com/assets.00/programming-language-flask-icon-1024x914-r5y3w9tt.png",
		},
		,{
			id: 7,
			name: "Docker",
			connected: true,
			icon: "https://www.stackhero.io/assets/src/images/servicesLogos/openGraphVersions/docker.png?d87f4381",
		},
	]);
	return (
		<SettingSection icon={HelpCircle} title={"Technical Stack Requirments"}>
			{connectedAccounts.map((account) => (
				<div key={account.id} className='flex items-center justify-between py-3'>
					<div className='flex gap-1'>
						<img src={account.icon} alt='Social img' className='size-7 object-cover rounded-full mr-2' />
						<span className='text-gray-300'>{account.name}</span>
					</div>
					<button
						className={`px-3 py-1 rounded ${
							account.connected ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
						} transition duration-200`}
						onClick={() => {
							setConnectedAccounts(
								connectedAccounts.map((acc) => {
									if (acc.id === account.id) {
										return {
											...acc,
											connected: !acc.connected,
										};
									}
									return acc;
								})
							);
						}}
					>
						{account.connected ? "Required" : "Not Required"}
					</button>
				</div>
			))}
			{/* <button className='mt-4 flex items-center text-indigo-400 hover:text-indigo-300 transition duration-200'>
				<Plus size={18} className='mr-2' /> Add Account
			</button> */}
		</SettingSection>
	);
};
export default ConnectedAccounts;
