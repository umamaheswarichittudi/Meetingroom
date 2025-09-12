// import React, { useState, useEffect } from "react";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import "./App.css";
// import mqtt from "mqtt"; // ✅ for IoT Room Details

// function Navbar({ setPage, username, setUsername }) {
//   const handleLogout = () => {
//     setUsername("");
//     setPage("landing");
//   };

//   return (
//     <nav className="navbar">
//       <div className="nav-left">
//         <img src="IOTIQ SFMS.png" alt="Logo" className="logo" />
//       </div>
//       <div className="nav-right">
//         {!username ? null : (
//           <button className="nav-btn" onClick={handleLogout}>
//             Logout
//           </button>
//         )}
//       </div>
//     </nav>
//   );
// }

// function formatDateForMySQL(d) {
//   if (!d) return null;
//   const date = new Date(d);
//   const pad = (n) => String(n).padStart(2, "0");
//   return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
//     date.getDate()
//   )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
//     date.getSeconds()
//   )}`;
// }

// function App() {
//   const [page, setPage] = useState("landing");
//   const [mode, setMode] = useState("login");
//   const [form, setForm] = useState({ username: "", password: "" });
//   const [error, setError] = useState("");
//   const [rooms, setRooms] = useState([]);
//   const [username, setUsername] = useState("");
//   const [schedule, setSchedule] = useState({ start: "", end: "" });
//   const [immediateBooking, setImmediateBooking] = useState({ start: "", end: "" });
//   const [selectedRoom, setSelectedRoom] = useState(null);

//   // ✅ Admin states
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [adminRooms, setAdminRooms] = useState([]);
//   const [selectedAdminRoom, setSelectedAdminRoom] = useState(null);
//   const [roomBookings, setRoomBookings] = useState([]);
//   const [filter, setFilter] = useState({ start: null, end: null });

//   // ✅ IoT States
//   const [iotData, setIotData] = useState({
//     people: 0,
//     acStatus: "Waiting...",
//     acTemp: "-- °C",
//     lightStatus: "Waiting...",
//     roomStatus: "Waiting...",
//   });

//   const isWithinOfficeHours = (start, end) => {
//     const sHour = new Date(start).getHours();
//     const eHour = new Date(end).getHours();
//     return sHour >= 9 && eHour <= 18;
//   };

//   const fetchRooms = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/rooms");
//       const data = await res.json();
//       setRooms(data);
//       setAdminRooms(data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const fetchRoomBookings = async (roomId) => {
//     try {
//       let url = `http://localhost:5000/bookings/${roomId}`;
//       if (filter.start && filter.end) {
//         url += `?start=${filter.start.toISOString()}&end=${filter.end.toISOString()}`;
//       }
//       const res = await fetch(url);
//       const data = await res.json();
//       setRoomBookings(data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     if (page === "rooms" || page === "adminDashboard") {
//       fetchRooms();
//     }
//   }, [page]);

//   // ✅ MQTT for IoT Room Details
//   useEffect(() => {
//     if (page !== "roomDetails") return;

//     const client = mqtt.connect(
//       "wss://6fdddaf19d614da29c86428142cbe7a2.s1.eu.hivemq.cloud:8884/mqtt",
//       {
//         username: "ruthvik",
//         password: "Iotiq369.",
//       }
//     );

//     client.on("connect", () => {
//       client.subscribe("client/people/count");
//       client.subscribe("client/ac/status");
//       client.subscribe("client/lights/status");
//     });

//     client.on("message", (topic, message) => {
//       const payloadStr = message.toString();
//       let payload;
//       try {
//         payload = JSON.parse(payloadStr);
//       } catch {
//         payload = payloadStr;
//       }

//       setIotData((prev) => {
//         const updated = { ...prev };
//         if (topic === "client/people/count") {
//           const count = payload.total || 0;
//           updated.people = count;
//           updated.roomStatus = count > 0 ? "Occupied" : "Vacant";
//         }
//         if (topic === "client/ac/status") {
//           updated.acStatus = payload.status === "ON" ? "AC: ON" : "AC: OFF";
//           updated.acTemp = `Temperature: ${payload.temperature} °C`;
//         }
//         if (topic === "client/lights/status") {
//           const lightValue = Number(payload);
//           updated.lightStatus = lightValue === 1 ? "Lights: ON" : "Lights: OFF";
//         }
//         return updated;
//       });
//     });

//     return () => {
//       client.end();
//     };
//   }, [page]);

//   const handleAuth = async (e) => {
//     e.preventDefault();
//     try {
//       const endpoint = mode === "login" ? "/login" : "/signup";
//       const res = await fetch(`http://localhost:5000${endpoint}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Error");

//       if (mode === "signup") {
//         alert("✅ Signup successful, please login!");
//         setMode("login");
//         setForm({ username: "", password: "" });
//       } else {
//         setUsername(data.username);
//         setPage("meeting");
//       }
//       setError("");
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   const confirmBooking = async () => {
//     if (!selectedRoom) return;
//     const startRaw = immediateBooking.start || schedule.start;
//     const endRaw = immediateBooking.end || schedule.end;
//     const start = formatDateForMySQL(startRaw);
//     const end = formatDateForMySQL(endRaw);

//     if (!isWithinOfficeHours(startRaw, endRaw)) {
//       alert("Booking must be within office hours: 09:00 - 18:00");
//       return;
//     }
//     try {
//       const bookingData = { start, end, username };
//       const res = await fetch(
//         `http://localhost:5000/book/${selectedRoom.id}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(bookingData),
//         }
//       );
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Booking failed");

//       alert(data.message);
//       setSelectedRoom(null);
//       await fetchRooms();
//       setPage("rooms");
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   const handleImmediate = () => {
//     const now = new Date();
//     const startTime = now.toISOString();
//     setImmediateBooking({ start: startTime, end: "" });
//     setPage("immediate");
//   };

//   const checkOccupied = (room) => {
//     const startCheck = new Date(schedule.start || immediateBooking.start);
//     const endCheck = new Date(schedule.end || immediateBooking.end);
//     return room.bookings?.some((b) => {
//       const bStart = new Date(b.start_time);
//       const bEnd = new Date(b.end_time);
//       return startCheck < bEnd && endCheck > bStart;
//     });
//   };

//   // ✅ CSV Export
//   const downloadCSV = () => {
//     if (!roomBookings.length) {
//       alert("No data to export!");
//       return;
//     }
//     const headers = ["Room", "User", "Start Time", "End Time"];
//     const rows = roomBookings.map((b) => [
//       selectedAdminRoom.name,
//       b.username,
//       b.start_time,
//       b.end_time,
//     ]);
//     let csvContent =
//       "data:text/csv;charset=utf-8," +
//       [headers, ...rows].map((e) => e.join(",")).join("\n");
//     const link = document.createElement("a");
//     link.href = encodeURI(csvContent);
//     link.download = `Bookings_${selectedAdminRoom.name}.csv`;
//     link.click();
//   };

//   // 🚀 Pages
//   return (
//     <div>
//       <Navbar setPage={setPage} username={username} setUsername={setUsername} />
//       <div className="app-container">
//         <h1>Meeting Room Booking</h1>
//         <br />

//         {/* ✅ Landing */}
//         {page === "landing" && (
//           <div className="landing-box">
            
//             <div className="landing-buttons">
//               <button onClick={() => setPage("login")} className="btn primary">
//                 User Login
//               </button>
//               <button onClick={() => setPage("adminLogin")} className="btn secondary">
//                 Admin Login
//               </button>
//             </div>
//           </div>
//         )}

//         {/* ✅ User Login */}
//         {page === "login" && (
//           <div className="auth-box">
//             <h2>{mode === "login" ? "User Login" : "Signup"}</h2>
//             <form onSubmit={handleAuth}>
//               <input
//                 type="text"
//                 placeholder="Username"
//                 value={form.username}
//                 onChange={(e) =>
//                   setForm({ ...form, username: e.target.value })
//                 }
//                 required
//               />
//               <input
//                 type="password"
//                 placeholder="Password"
//                 value={form.password}
//                 onChange={(e) =>
//                   setForm({ ...form, password: e.target.value })
//                 }
//                 required
//               />
//               <button type="submit">
//                 {mode === "login" ? "Login" : "Signup"}
//               </button>
//             </form>
//             <br />
//             {error && <p className="error">{error}</p>}
//             <p>
//               {mode === "login" ? "Don't have an account? " : "Already registered? "}
//               <span
//                 className="link-btn"
//                 onClick={() => setMode(mode === "login" ? "signup" : "login")}
//                 style={{
//                   cursor: "pointer",
//                   color: "blue",
//                   textDecoration: "underline",
//                 }}
//               >
//                 {mode === "login" ? "Signup" : "Login"}
//               </span>
//             </p>
//           </div>
//         )}

//         {/* ✅ Admin Login */}
//         {page === "adminLogin" && (
//           <div className="auth-box">
//             <h2>Admin Login</h2>
//             <form
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 setIsAdmin(true);
//                 setPage("adminDashboard");
//               }}
//             >
//               <input type="text" placeholder="Admin Username" required />
//               <input type="password" placeholder="Password" required />
//               <button type="submit">Login</button>
//             </form>
//           </div>
//         )}

        // {/* ✅ Admin Dashboard */}
        // {page === "adminDashboard" && (
        //   <div className="booking-container">
        //     <h2>Meeting Room Booking</h2>

        //     {!selectedAdminRoom ? (
        //       <div className="booking-card">
        //         <h3>Rooms List</h3>
        //         <div className="room-list">
        //           {adminRooms.map((room) => (
        //             <div key={room.id} className="room-item">
        //               <span className="room-name">{room.name}</span>
        //               <button
        //                 className="view-btn"
        //                 onClick={() => {
        //                   setSelectedAdminRoom(room);
        //                   fetchRoomBookings(room.id);
        //                 }}
        //               >
        //                 View Bookings
        //               </button>
        //               <button
        //                 className="details-btn"
        //                 onClick={() => setPage("roomDetails")}
        //               >
        //                 Room Details
        //               </button>
        //             </div>
        //           ))}
        //         </div>
        //         <button onClick={() => setPage("landing")} className="btn">
        //           Back
        //         </button>
        //       </div>
        //     ) : (
        //       <div className="booking-card">
        //         <h3>Room: {selectedAdminRoom.name}</h3>

        //         {/* Date Filter */}
        //         <div className="date-filter">
        //           <label>
        //             From Date:
        //             <input
        //               type="date"
        //               value={filter.start ? filter.start.toISOString().split("T")[0] : ""}
        //               onChange={(e) =>
        //                 setFilter({ ...filter, start: new Date(e.target.value) })
        //               }
        //             />
        //           </label>
        //           <label>
        //             To Date:
        //             <input
        //               type="date"
        //               value={filter.end ? filter.end.toISOString().split("T")[0] : ""}
        //               onChange={(e) =>
        //                 setFilter({ ...filter, end: new Date(e.target.value) })
        //               }
        //             />
        //           </label>
        //           <button
        //             className="apply-btn"
        //             onClick={() => fetchRoomBookings(selectedAdminRoom.id)}
        //           >
        //             Apply Filter
        //           </button>
        //         </div>

        //         {/* Bookings Table */}
        //         <table>
        //           <thead>
        //             <tr>
        //               <th>User</th>
        //               <th>Start Time</th>
        //               <th>End Time</th>
        //             </tr>
        //           </thead>
        //           <tbody>
        //             {roomBookings.length > 0 ? (
        //               roomBookings.map((b, idx) => (
        //                 <tr key={idx}>
        //                   <td>{b.username}</td>
        //                   <td>{new Date(b.start_time).toLocaleString()}</td>
        //                   <td>{new Date(b.end_time).toLocaleString()}</td>
        //                 </tr>
        //               ))
        //             ) : (
        //               <tr>
        //                 <td colSpan={3}>No bookings available</td>
        //               </tr>
        //             )}
        //           </tbody>
        //         </table>

        //         {/* Buttons */}
        //         <div className="button-group">
        //           <button onClick={downloadCSV} className="download-btn">
        //             Download CSV
        //           </button>
        //           <button
        //             onClick={() => setSelectedAdminRoom(null)}
        //             className="back-btn"
        //           >
        //             Back
        //           </button>
        //         </div>
        //       </div>
        //     )}
        //   </div>
        // )}

//         {/* ✅ IoT Room Details */}
//         {page === "roomDetails" && (
//           <div className="container">
//             <div className="card">
//               <h2>IOTIQ Meeting Room</h2>

//               <h3>Room Occupancy</h3>
//               <div
//                 className={`status ${
//                   iotData.roomStatus === "Occupied" ? "occupied" : "vacant"
//                 }`}
//               >
//                 {iotData.roomStatus}
//               </div>
//               <div className="people">{iotData.people}</div>

//               <h3>AC Status</h3>
//               <div
//                 className={`ac-info ${
//                   iotData.acStatus === "AC: ON" ? "ac-on" : "ac-off"
//                 }`}
//               >
//                 {iotData.acStatus}
//               </div>
//               <div className="ac-info">{iotData.acTemp}</div>

//               <h3>Lights Status</h3>
//               <div
//                 className={`light-info ${
//                   iotData.lightStatus === "Lights: ON"
//                     ? "light-on"
//                     : "light-off"
//                 }`}
//               >
//                 {iotData.lightStatus}
//               </div>

//               <br />
//               <button onClick={() => setPage("adminDashboard")} className="btn">
//                 Back
//               </button>
//             </div>
//           </div>
//         )}

//         {/* 🚀 User Pages */}
//         {page === "meeting" && (
//           <div className="meeting-box">
//             <h2>Welcome, {username}</h2>
//             <button onClick={handleImmediate}>Immediate Booking</button>
//             <button onClick={() => setPage("schedule")}>Schedule Meeting</button>
//           </div>
//         )}

//         {page === "schedule" && (
//           <div className="schedule-box">
//             <h2>Schedule Meeting</h2>
//             <DatePicker
//               selected={schedule.start ? new Date(schedule.start) : null}
//               onChange={(date) =>
//                 setSchedule({ ...schedule, start: date?.toISOString() || "" })
//               }
//               showTimeSelect
//               dateFormat="dd-MM-yyyy h:mm aa"
//               minDate={new Date()}
//               placeholderText="Select start time"
//             />
//             <DatePicker
//               selected={schedule.end ? new Date(schedule.end) : null}
//               onChange={(date) =>
//                 setSchedule({ ...schedule, end: date?.toISOString() || "" })
//               }
//               showTimeSelect
//               dateFormat="dd-MM-yyyy h:mm aa"
//               minDate={new Date()}
//               placeholderText="Select end time"
//             />
//             <button onClick={() => setPage("rooms")}>Check Rooms</button>
//             <br />
//             <button onClick={() => setPage("meeting")}>Back</button>
//           </div>
//         )}

//         {page === "immediate" && (
//           <div className="immediate-box">
//             <h2>Immediate Booking</h2>
//             <p>Start: {new Date(immediateBooking.start).toLocaleString()}</p>
//             <DatePicker
//               selected={
//                 immediateBooking.end ? new Date(immediateBooking.end) : null
//               }
//               onChange={(date) =>
//                 setImmediateBooking({
//                   ...immediateBooking,
//                   end: date?.toISOString() || "",
//                 })
//               }
//               showTimeSelect
//               dateFormat="dd-MM-yyyy h:mm aa"
//               minDate={new Date()}
//               placeholderText="Select end time"
//             />
//             <br />
//             <button onClick={() => setPage("rooms")}>Check Rooms</button>
//             <br />
//             <button onClick={() => setPage("meeting")}>Back</button>
//           </div>
//         )}

//         {page === "rooms" && (
//           <div className="rooms-box">
//             <h2>Available Rooms</h2>
//             <br />
//             <div className="rooms-grid">
//               {rooms.map((room) => {
//                 const occupied = checkOccupied(room);
//                 return (
//                   <div
//                     key={room.id}
//                     className={`room-card ${occupied ? "occupied" : "free"}`}
//                   >
//                     <h3>{room.name}</h3>
//                     <p>Capacity: {room.capacity}</p>
//                     <p>Facilities: {room.facilities.join(", ")}</p>
//                     {occupied ? (
//                       <div>
//                         <p style={{ color: "red" }}>
//                           Occupied during selected time
//                         </p>
//                         <button disabled style={{ background: "#ccc" }}>
//                           Occupied
//                         </button>
//                       </div>
//                     ) : (
//                       <button onClick={() => setSelectedRoom(room)}>Book</button>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//             <br />
//             <button onClick={() => setPage("meeting")}>Back</button>
//           </div>
//         )}

//         {selectedRoom && (
//           <div className="modal-overlay">
//             <div className="modal">
//               <h2>Confirm Booking</h2>
//               <p>
//                 <strong>Room:</strong> {selectedRoom.name}
//               </p>
//               <p>
//                 <strong>Capacity:</strong> {selectedRoom.capacity}
//               </p>
//               {Array.isArray(selectedRoom.facilities) &&
//                 selectedRoom.facilities.length > 0 && (
//                   <div>
//                     <strong>Facilities:</strong>
//                     <ul>
//                       {selectedRoom.facilities.map((f, idx) => (
//                         <li key={idx}>{f}</li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}
//               <p>
//                 <strong>Start:</strong> {immediateBooking.start || schedule.start}
//               </p>
//               <p>
//                 <strong>End:</strong> {immediateBooking.end || schedule.end}
//               </p>
//               <button onClick={confirmBooking} className="btn confirm">
//                 Confirm
//               </button>
//               <button onClick={() => setSelectedRoom(null)} className="btn cancel">
//                 Cancel
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default App;
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./App.css";
import mqtt from "mqtt"; // ✅ for IoT Room Details

function Navbar({ setPage, username, setUsername }) {
  const handleLogout = () => {
    setUsername("");
    setPage("landing");
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src="IOTIQ SFMS.png" alt="Logo" className="logo" />
      </div>
      <div className="nav-right">
        {!username ? null : (
          <button className="nav-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

function formatDateForMySQL(d) {
  if (!d) return null;
  const date = new Date(d);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}`;
}

function App() {
  const [page, setPage] = useState("landing");
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [rooms, setRooms] = useState([]);
  const [username, setUsername] = useState("");
  const [schedule, setSchedule] = useState({ start: "", end: "" });
  const [immediateBooking, setImmediateBooking] = useState({
    start: "",
    end: "",
  });
  const [selectedRoom, setSelectedRoom] = useState(null);

  // ✅ Admin states
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRooms, setAdminRooms] = useState([]);
  const [selectedAdminRoom, setSelectedAdminRoom] = useState(null);
  const [roomBookings, setRoomBookings] = useState([]);
  const [filter, setFilter] = useState({ start: null, end: null });

  // ✅ IoT States
  const [iotData, setIotData] = useState({
    people: 0,
    acStatus: "Waiting...",
    acTemp: "-- °C",
    lightStatus: "Waiting...",
    roomStatus: "Waiting...",
  });

  const isWithinOfficeHours = (start, end) => {
    const sHour = new Date(start).getHours();
    const eHour = new Date(end).getHours();
    return sHour >= 9 && eHour <= 18;
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch("http://localhost:5000/rooms");
      const data = await res.json();
      setRooms(data);
      setAdminRooms(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRoomBookings = async (roomId) => {
    try {
      let url = `http://localhost:5000/bookings/${roomId}`;
      if (filter.start && filter.end) {
        url += `?start=${filter.start.toISOString()}&end=${filter.end.toISOString()}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setRoomBookings(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (page === "rooms" || page === "adminDashboard") {
      fetchRooms();
    }
  }, [page]);

  // ✅ MQTT for IoT Room Details
  useEffect(() => {
    if (page !== "roomDetails") return;

    const client = mqtt.connect(
      "wss://6fdddaf19d614da29c86428142cbe7a2.s1.eu.hivemq.cloud:8884/mqtt",
      {
        username: "ruthvik",
        password: "Iotiq369.",
      }
    );

    client.on("connect", () => {
      client.subscribe("client/people/count");
      client.subscribe("client/ac/status");
      client.subscribe("client/lights/status");
    });

    client.on("message", (topic, message) => {
      const payloadStr = message.toString();
      let payload;
      try {
        payload = JSON.parse(payloadStr);
      } catch {
        payload = payloadStr;
      }

      setIotData((prev) => {
        const updated = { ...prev };
        if (topic === "client/people/count") {
          const count = payload.total || 0;
          updated.people = count;
          updated.roomStatus = count > 0 ? "Occupied" : "Vacant";
        }
        if (topic === "client/ac/status") {
          updated.acStatus = payload.status === "ON" ? "AC: ON" : "AC: OFF";
          updated.acTemp = `Temperature: ${payload.temperature} °C`;
        }
        if (topic === "client/lights/status") {
          const lightValue = Number(payload);
          updated.lightStatus = lightValue === 1 ? "Lights: ON" : "Lights: OFF";
        }
        return updated;
      });
    });

    return () => {
      client.end();
    };
  }, [page]);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const endpoint = mode === "login" ? "/login" : "/signup";
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error");

      if (mode === "signup") {
        alert("✅ Signup successful, please login!");
        setMode("login");
        setForm({ username: "", password: "" });
      } else {
        setUsername(data.username);
        setPage("meeting");
      }
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmBooking = async () => {
    if (!selectedRoom) return;
    const startRaw = immediateBooking.start || schedule.start;
    const endRaw = immediateBooking.end || schedule.end;
    const start = formatDateForMySQL(startRaw);
    const end = formatDateForMySQL(endRaw);

    if (!isWithinOfficeHours(startRaw, endRaw)) {
      alert("Booking must be within office hours: 09:00 - 18:00");
      return;
    }
    try {
      const bookingData = { start, end, username };
      const res = await fetch(
        `http://localhost:5000/book/${selectedRoom.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingData),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      alert(data.message);
      setSelectedRoom(null);
      await fetchRooms();
      setPage("rooms");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleImmediate = () => {
    const now = new Date();
    const startTime = now.toISOString();
    setImmediateBooking({ start: startTime, end: "" });
    setPage("immediate");
  };

  const checkOccupied = (room) => {
    const startCheck = new Date(schedule.start || immediateBooking.start);
    const endCheck = new Date(schedule.end || immediateBooking.end);
    return room.bookings?.some((b) => {
      const bStart = new Date(b.start_time);
      const bEnd = new Date(b.end_time);
      return startCheck < bEnd && endCheck > bStart;
    });
  };

  // ✅ CSV Export
  const downloadCSV = () => {
    if (!roomBookings.length) {
      alert("No data to export!");
      return;
    }
    const headers = ["Room", "User", "Start Time", "End Time"];
    const rows = roomBookings.map((b) => [
      selectedAdminRoom.name,
      b.username,
      b.start_time,
      b.end_time,
    ]);
    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `Bookings_${selectedAdminRoom.name}.csv`;
    link.click();
  };

  // 🚀 Pages
  return (
    <div>
      <Navbar setPage={setPage} username={username} setUsername={setUsername} />
      <div className="app-container">
        <h1>Meeting Room Booking</h1>
        <br />

        {/* ✅ Landing */}
        {page === "landing" && (
          <div className="landing-box">
            <div className="landing-buttons">
              <button onClick={() => setPage("login")} className="btn primary">
                User Login
              </button>
              <button
                onClick={() => setPage("adminLogin")}
                className="btn secondary"
              >
                Admin Login
              </button>
            </div>
          </div>
        )}

        {/* ✅ User Login */}
             {page === "login" && (
          <div className="auth-box">
            <h2>{mode === "login" ? "User Login" : "Signup"}</h2>
            <form onSubmit={handleAuth}>
               <input
                type="text"
                placeholder="Username"
                value={form.username}
                 onChange={(e) =>
                   setForm({ ...form, username: e.target.value })
                }
                required
               />
             <input
                type="password"
                 placeholder="Password"
               value={form.password}
                onChange={(e) =>
                 setForm({ ...form, password: e.target.value })
               }
               required
               />
             <button type="submit">
                {mode === "login" ? "Login" : "Signup"}
               </button>
             </form>
             <br />
            {error && <p className="error">{error}</p>}
            <p>
              {mode === "login" ? "Don't have an account? " : "Already registered? "}
               <span
                 className="link-btn"
                 onClick={() => setMode(mode === "login" ? "signup" : "login")}
                style={{
                  cursor: "pointer",
                   color: "blue",
                  textDecoration: "underline",
                }}
               >
                {mode === "login" ? "Signup" : "Login"}
               </span>
             </p>
           </div>
         )}

        {/* ✅ Admin Login */}
        {page === "adminLogin" && (
          <div className="auth-box">
            <h2>Admin Login</h2>
             <form
              onSubmit={(e) => {              
                   e.preventDefault();
               setIsAdmin(true);
                setPage("adminDashboard");
             }}
           >
             <input type="text" placeholder="Admin Username" required />
            <input type="password" placeholder="Password" required />
             <button type="submit">Login</button>
            </form>
         </div>
       )}

        {/* ✅ Admin Dashboard */}
        
        {page === "adminDashboard" && (
  <div className="admin-dashboard">
    {/* If no room selected → show rooms list */}
    {!selectedAdminRoom ? (
      <div className="booking-card">
       
        <h3>Rooms List</h3>
        <div className="room-list">
          {adminRooms.map((room) => (
            <div key={room.id} className="room-item">
              <span className="room-name">{room.name}</span>
              <button
                className="view-btn"
                onClick={() => {
                  setSelectedAdminRoom(room);
                  fetchRoomBookings(room.id);
                }}
              >
                View Bookings
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => setPage("landing")} className="btn">
          Back
        </button>
      </div>
    ) : (
      // If room selected → show bookings + IoT details side by side
      <div className="side-by-side">
        {/* Left Side → Bookings */}
        <div className="booking-card">
          <h3>Room: {selectedAdminRoom.name}</h3>

          {/* Date Filter */}
          <div className="date-filter">
            <label>
              From Date:
              <input
                type="date"
                value={
                  filter.start ? filter.start.toISOString().split("T")[0] : ""
                }
                onChange={(e) =>
                  setFilter({ ...filter, start: new Date(e.target.value) })
                }
              />
            </label>
            <label>
              To Date:
              <input
                type="date"
                value={
                  filter.end ? filter.end.toISOString().split("T")[0] : ""
                }
                onChange={(e) =>
                  setFilter({ ...filter, end: new Date(e.target.value) })
                }
              />
            </label>
            <button
              className="apply-btn"
              onClick={() => fetchRoomBookings(selectedAdminRoom.id)}
            >
              Apply Filter
            </button>
          </div>

          {/* Bookings Table */}
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Start Time</th>
                <th>End Time</th>
              </tr>
            </thead>
            <tbody>
              {roomBookings.length > 0 ? (
                roomBookings.map((b, idx) => (
                  <tr key={idx}>
                    <td>{b.username}</td>
                    <td>{new Date(b.start_time).toLocaleString()}</td>
                    <td>{new Date(b.end_time).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>No bookings available</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Buttons */}
          <div className="button-group">
            <button onClick={downloadCSV} className="download-btn">
              Download CSV
            </button>
            <button
              onClick={() => setSelectedAdminRoom(null)}
              className="back-btn"
            >
              Back
            </button>
          </div>
        </div>

        {/* Right Side → IoT Room Details */}
        <div className="room-details-container">
          <div className="card">
            <h2>IOTIQ Meeting Room</h2>

            <h3>Room Occupancy</h3>
            <div
              className={`status ${
                iotData.roomStatus === "Occupied" ? "occupied" : "vacant"
              }`}
            >
              {iotData.roomStatus}
            </div>
            <div className="people">{iotData.people}</div>

            <h3>AC Status</h3>
            <div
              className={`ac-info ${
                iotData.acStatus === "AC: ON" ? "ac-on" : "ac-off"
              }`}
            >
              {iotData.acStatus}
            </div>
            <div className="ac-info">{iotData.acTemp}</div>

            <h3>Lights Status</h3>
            <div
              className={`light-info ${
                iotData.lightStatus === "Lights: ON" ? "light-on" : "light-off"
              }`}
            >
              {iotData.lightStatus}
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
)}

            

         
        {page === "meeting" && (
          <div className="meeting-box">
            <h2>Welcome, {username}</h2>
            <button onClick={handleImmediate}>Book For Now </button><br></br>
            <button onClick={() => setPage("schedule")}>Schedule For Later</button>
          </div>
        )}

        {page === "schedule" && (
          <div className="schedule-box">
            <h2>Schedule For Later</h2>
            <DatePicker
              selected={schedule.start ? new Date(schedule.start) : null}
              onChange={(date) =>
                setSchedule({ ...schedule, start: date?.toISOString() || "" })
              }
              showTimeSelect
              dateFormat="dd-MM-yyyy h:mm aa"
              minDate={new Date()}
              placeholderText="Select start time"
            />
            <DatePicker
              selected={schedule.end ? new Date(schedule.end) : null}
              onChange={(date) =>
                setSchedule({ ...schedule, end: date?.toISOString() || "" })
              }
              showTimeSelect
              dateFormat=" h:mm aa"
              minDate={new Date()}
              placeholderText="Select end time"
            />
            <button onClick={() => setPage("rooms")}>Check Rooms</button>
            <br />
            <button onClick={() => setPage("meeting")}>Back</button>
          </div>
        )}

        {/* {page === "immediate" && (
          <div className="immediate-box">
            <h2>Book For Now </h2>
            <p>Start: {new Date(immediateBooking.start).toLocaleString()}</p>
            <DatePicker
              selected={
                immediateBooking.end ? new Date(immediateBooking.end) : null
              }
              onChange={(date) =>
                setImmediateBooking({
                  ...immediateBooking,
                  end: date?.toISOString() || "",
                })
              }
              showTimeSelect
              dateFormat="dd-MM-yyyy h:mm aa"
              minDate={new Date()}
              placeholderText="Select end time"
            />
            <br />
            <button onClick={() => setPage("rooms")}>Check Rooms</button>
            <br />
            <button onClick={() => setPage("meeting")}>Back</button>
          </div>
        )} */}
         {page === "immediate" && (
  <div className="immediate-box">
    <h2>Book For Now </h2>
    <p>Start: {new Date(immediateBooking.start).toLocaleTimeString()}</p>

    <DatePicker
      selected={
        immediateBooking.end ? new Date(immediateBooking.end) : null
      }
      onChange={(date) =>
        setImmediateBooking({
          ...immediateBooking,
          end: date?.toISOString() || "",
        })
      }
      showTimeSelect
      showTimeSelectOnly  
      timeIntervals={1}    
      timeFormat="HH:mm:ss" 
      dateFormat="HH:mm:ss" 
      placeholderText="Select end time"
    />

    <br />
    <button onClick={() => setPage("rooms")}>Check Rooms</button>
    <br />
    <button onClick={() => setPage("meeting")}>Back</button>
  </div>
)}

        {page === "rooms" && (
          <div className="rooms-box">
            <h2>Available Rooms</h2>
            <br />
            <div className="rooms-grid">
              {rooms.map((room) => {
                const occupied = checkOccupied(room);
                return (
                  <div
                    key={room.id}
                    className={`room-card ${occupied ? "occupied" : "free"}`}
                  >
                    <h3>{room.name}</h3>
                    <p>Capacity: {room.capacity}</p>
                    <p>Facilities: {room.facilities.join(", ")}</p>
                    {occupied ? (
                      <div>
                        <p style={{ color: "red" }}>
                          Occupied during selected time
                        </p>
                        <button disabled style={{ background: "#ccc" }}>
                          Occupied
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setSelectedRoom(room)}>Book</button>
                    )}
                  </div>
                );
              })}
            </div>
            <br />
            <button onClick={() => setPage("meeting")}>Back</button>
          </div>
        )}

        {selectedRoom && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Confirm Booking</h2>
              <p>
                <strong>Room:</strong> {selectedRoom.name}
              </p>
              <p>
                <strong>Capacity:</strong> {selectedRoom.capacity}
              </p>
              {Array.isArray(selectedRoom.facilities) &&
                selectedRoom.facilities.length > 0 && (
                  <div>
                    <strong>Facilities:</strong>
                    <ul>
                      {selectedRoom.facilities.map((f, idx) => (
                        <li key={idx}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
              <p>
                <strong>Start:</strong> {immediateBooking.start || schedule.start}
              </p>
              <p>
                <strong>End:</strong> {immediateBooking.end || schedule.end}
              </p>
              <button onClick={confirmBooking} className="btn confirm">
                Confirm
              </button>
              <button onClick={() => setSelectedRoom(null)} className="btn cancel">
                Cancel
              </button>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}

export default App;
