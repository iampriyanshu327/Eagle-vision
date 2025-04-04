import React, { useState, useEffect } from "react";
import { FaUserPlus, FaEnvelope, FaUserShield } from "react-icons/fa";
import { IoPeople, IoShieldCheckmark } from "react-icons/io5";
import axios from "axios";
import Header from "../components/common/Header";
import { Player } from "@lottiefiles/react-lottie-player";

const ContentWithLottie = () => {
  return (
    <div className="flex items-center justify-center mb-8 space-x-8">
      {/* Lottie Animation */}
      <Player
        autoplay
        loop
        src="CustomerSupport.json" // Replace with the actual path to your Lottie JSON file
        className="w-34 h-32"
      />

      {/* Content */}
      <div className="flex flex-col items-center text-center">


        {/* Paragraph */}
        <p className="text-gray-300 text-lg max-w-2xl mt-1">
          The Notify Service uses NodeMailer API, which sends Instantaneous Mail Alert to the concerned Authorities and Residents in the affected Locality.
        </p>
      </div>
    </div>
  );
};


const AddUserModal = ({ userType, setShowModal }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [locality, setLocality] = useState("");

  const handleSubmit = async () => {
    try {
      const user = { name, email, locality };
      const endpoint =
        userType === "resident" ? "/api/residents/add-resident" : "/api/authorities/add-authority";

      const response = await axios.post(`http://localhost:5000${endpoint}`, user);
      if (response.status === 200) {
        alert(`${userType === "resident" ? "Resident" : "Authority"} added successfully!`);
        setShowModal(false);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to add user.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 text-white rounded-lg p-8 w-96 shadow-lg">
        <h3 className="text-2xl font-semibold mb-6 text-center">
          Add {userType === "resident" ? "Resident" : "Authority"} User
        </h3>
        <div className="mb-4">
          <label className="block mb-2 text-lg">Name</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-600 rounded bg-gray-800 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-lg">Email</label>
          <input
            type="email"
            className="w-full p-3 border border-gray-600 rounded bg-gray-800 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-lg">Locality</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-600 rounded bg-gray-800 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-6">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition-transform transform hover:scale-105"
            onClick={handleSubmit}
          >
            Add
          </button>
          <button
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg shadow-md transition-transform transform hover:scale-105"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const UserTable = ({ users, userType }) => (
  <div className="space-y-6">
    <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-white">
      {userType === "resident" ? <IoPeople className="w-6 h-6 text-blue-500" /> : <IoShieldCheckmark className="w-6 h-6 text-green-500" />}
      {userType === "resident" ? "Resident Users" : "Authority Users"}
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user) => (
        <div key={user.email} className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-all">
          <h4 className="text-xl font-bold text-white">{user.name}</h4>
          <p className="text-gray-300">{user.email}</p>
          <p className="text-gray-500">{user.locality}</p>
        </div>
      ))}
    </div>
  </div>
);

const NotifyPage = () => {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userType, setUserType] = useState("");
  const [residentUsers, setResidentUsers] = useState([]);
  const [authorityUsers, setAuthorityUsers] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/residents/get-residents")
      .then((response) => setResidentUsers(response.data))
      .catch((error) => console.error(error));

    axios
      .get("http://localhost:5000/api/authorities/get-authorities")
      .then((response) => setAuthorityUsers(response.data))
      .catch((error) => console.error(error));
  }, []);

  const handleAddUserClick = (type) => {
    setUserType(type);
    setShowAddUserModal(true);
  };

  const handleSendEmail = (type) => {
    const endpoint =
      type === "resident" ? "/api/mail/send-resident-alert" : "/api/mail/send-authority-alert";

    axios
      .post(`http://localhost:5000${endpoint}`)
      .then((response) => alert(response.data.message))
      .catch(() => alert(`Failed to send email to ${type}s.`));
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-gray-900">
      <div className="w-64 bg-gray-800 text-white p-6 space-y-6 shadow-lg">
        <h2 className="text-2xl font-bold ">ZEN SAFE</h2>
        <button
          className="w-full p-4 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-3 transition-all hover:scale-105"
          onClick={() => handleAddUserClick("resident")}
        >
          <FaUserPlus className="w-6 h-6" /> Add Resident User
        </button>
        <button
          className="w-full p-4 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-3 transition-all hover:scale-105"
          onClick={() => handleAddUserClick("authority")}
        >
          <FaUserShield className="w-6 h-6" /> Add Authority User
        </button>
      </div>
      <div className="flex-1 bg-gray-900 p-5 space-y-5 overflow-auto">
        <Header title="Notify Service" />
        <ContentWithLottie/>
        <div>
          <UserTable users={residentUsers} userType="resident" />
          <div className="flex justify-center mt-6">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition-all hover:scale-105 flex items-center gap-3"
              onClick={() => handleSendEmail("resident")}
            >
              <FaEnvelope className="w-6 h-6" /> Notify Residents
            </button>
          </div>
        </div>
        <div>
          <UserTable users={authorityUsers} userType="authority" />
          <div className="flex justify-center mt-6">
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md transition-all hover:scale-105 flex items-center gap-3"
              onClick={() => handleSendEmail("authority")}
            >
              <FaEnvelope className="w-6 h-6" /> Notify Authorities
            </button>
          </div>
        </div>
      </div>
      {showAddUserModal && <AddUserModal userType={userType} setShowModal={setShowAddUserModal} />}
    </div>
  );
};

export default NotifyPage;
