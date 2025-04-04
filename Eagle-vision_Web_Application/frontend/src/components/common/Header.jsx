const Header = ({ title }) => {
	return (
	  <header className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg border-b border-gray-700">
		<center>
		  <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
			<h1 className="text-2xl font-semibold text-transparent bg-gradient-to-b from-white to-gray-300 bg-clip-text">
			  {title}
			</h1>
		  </div>
		</center>
	  </header>
	);
  };
  
  export default Header;
  