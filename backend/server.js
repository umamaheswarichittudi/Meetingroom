// const express = require("express");
// const cors = require("cors");
// const mysql = require("mysql2");

// const app = express();
// const PORT = 5000;

// app.use(cors());
// app.use(express.json());

// // ✅ MySQL connection
// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "root",
//   database: "meeting_rooms",
// });

// db.connect((err) => {
//   if (err) {
//     console.error("❌ DB connection failed:", err);
//     return;
//   }
//   console.log("✅ Connected to MySQL database");
// });

// // ================= USER AUTH =================

// // Signup
// app.post("/signup", (req, res) => {
//   const { username, password } = req.body;
//   const checkQuery = "SELECT * FROM users WHERE username = ?";
//   db.query(checkQuery, [username], (err, results) => {
//     if (err) return res.status(500).json({ message: err.message });
//     if (results.length > 0)
//       return res.status(400).json({ message: "Username already exists" });

//     const insertQuery = "INSERT INTO users (username, password) VALUES (?, ?)";
//     db.query(insertQuery, [username, password], (err2) => {
//       if (err2) return res.status(500).json({ message: err2.message });
//       res.json({ message: "Signup successful" });
//     });
//   });
// });

// // Login
// app.post("/login", (req, res) => {
//   const { username, password } = req.body;
//   const query = "SELECT * FROM users WHERE username = ? AND password = ?";
//   db.query(query, [username, password], (err, results) => {
//     if (err) return res.status(500).json({ message: err.message });
//     if (results.length === 0)
//       return res.status(400).json({ message: "Invalid username or password" });
//     res.json({ username, message: "Login successful" });
//   });
// });

// // ================= ROOMS =================

// // Get all rooms with their bookings
// app.get("/rooms", (req, res) => {
//   const query = `SELECT r.*, b.start_time, b.end_time, b.username as booked_by
//                  FROM rooms r
//                  LEFT JOIN bookings b ON r.id = b.room_id`;
//   db.query(query, (err, results) => {
//     if (err) return res.status(500).json({ message: err.message });

//     // Organize bookings per room
//     const roomsMap = {};
//     results.forEach((r) => {
//       if (!roomsMap[r.id]) {
//         roomsMap[r.id] = {
//           id: r.id,
//           name: r.name,
//           capacity: r.capacity,
//           info: r.info,
//           facilities: r.facilities ? JSON.parse(r.facilities) : [],
//           bookings: [],
//         };
//       }
//       if (r.start_time && r.end_time) {
//         roomsMap[r.id].bookings.push({
//           start_time: r.start_time,
//           end_time: r.end_time,
//           booked_by: r.booked_by,
//         });
//       }
//     });

//     res.json(Object.values(roomsMap));
//   });
// });



// // ================= BOOKINGS =================

// // // Get all bookings
// // app.get("/bookings", (req, res) => {
// //   const query = `
// //     SELECT b.id, b.room_id, r.name AS room_name, b.username, b.start_time, b.end_time
// //     FROM bookings b
// //     JOIN rooms r ON b.room_id = r.id
// //     ORDER BY b.start_time ASC
// //   `;

// //   db.query(query, (err, results) => {
// //     if (err) {
// //       console.error("Fetch bookings error:", err);
// //       return res.status(500).json({ message: "Database error", error: err });
// //     }
// //     res.json(results);
// //   });
// // });

// // // Get bookings for a specific room
// // app.get("/bookings/:roomId", (req, res) => {
// //   const { roomId } = req.params;

// //   const query = `
// //     SELECT b.id, b.room_id, r.name AS room_name, b.username, b.start_time, b.end_time
// //     FROM bookings b
// //     JOIN rooms r ON b.room_id = r.id
// //     WHERE b.room_id = ?
// //     ORDER BY b.start_time ASC
// //   `;

// //   db.query(query, [roomId], (err, results) => {
// //     if (err) {
// //       console.error("Fetch room bookings error:", err);
// //       return res.status(500).json({ message: "Database error", error: err });
// //     }
// //     res.json(results);
// //   });
// // });

// // app.post("/book/:id", (req, res) => {
// //   const { id } = req.params;
// //   const { start, end, username } = req.body;

// //   if (!start || !end) {
// //     return res.status(400).json({ message: "Start and end times required" });
// //   }

// //   const query = `
// //     INSERT INTO bookings (room_id, start_time, end_time, username)
// //     VALUES (?, ?, ?, ?)
// //   `;

// //   db.query(query, [id, start, end, username], (err, result) => {
// //     if (err) {
// //       console.error("Booking insert error:", err);
// //       return res.status(500).json({ message: "Database error", error: err });
// //     }
// //     res.json({ message: "✅ Booking successful!" });
// //   });
// // });
// // ================= BOOKINGS =================

// // Get all bookings
// app.get("/bookings", (req, res) => {
//   const { start, end } = req.query;

//   let query = `
//     SELECT b.id, b.room_id, r.name AS room_name, b.username, b.start_time, b.end_time
//     FROM bookings b
//     JOIN rooms r ON b.room_id = r.id
//   `;

//   const values = [];

//   if (start && end) {
//     query += " WHERE b.start_time >= ? AND b.end_time <= ? ";
//     values.push(start, end);
//   }

//   query += " ORDER BY b.start_time ASC";

//   db.query(query, values, (err, results) => {
//     if (err) {
//       console.error("Fetch bookings error:", err);
//       return res.status(500).json({ message: "Database error", error: err });
//     }
//     res.json(results);
//   });
// });

// // Get bookings for a specific room (with optional date filter)
// app.get("/bookings/:roomId", (req, res) => {
//   const { roomId } = req.params;
//   const { start, end } = req.query;

//   let query = `
//     SELECT b.id, b.room_id, r.name AS room_name, b.username, b.start_time, b.end_time
//     FROM bookings b
//     JOIN rooms r ON b.room_id = r.id
//     WHERE b.room_id = ?
//   `;
//   const values = [roomId];

//   if (start && end) {
//     query += " AND b.start_time >= ? AND b.end_time <= ? ";
//     values.push(start, end);
//   }

//   query += " ORDER BY b.start_time ASC";

//   db.query(query, values, (err, results) => {
//     if (err) {
//       console.error("Fetch room bookings error:", err);
//       return res.status(500).json({ message: "Database error", error: err });
//     }
//     res.json(results);
//   });
// });

// // ================= ADMIN AUTH =================

// // Admin Login
// app.post("/admin/login", (req, res) => {
//   const { username, password } = req.body;
//   const query = "SELECT * FROM admins WHERE username = ? AND password = ?";

//   db.query(query, [username, password], (err, results) => {
//     if (err) return res.status(500).json({ message: err.message });
//     if (results.length === 0) {
//       return res.status(400).json({ message: "Invalid admin credentials" });
//     }

//     res.json({ username, role: "admin", message: "Admin login successful" });
//   });
// });



// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ✅ MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "meeting_rooms",
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL database");
});

// ================= USER AUTH =================

// Signup
app.post("/signup", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username & password required" });
  }

  const checkQuery = "SELECT * FROM users WHERE username = ?";
  db.query(checkQuery, [username], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length > 0)
      return res.status(400).json({ message: "Username already exists" });

    const insertQuery = "INSERT INTO users (username, password) VALUES (?, ?)";
    db.query(insertQuery, [username, password], (err2) => {
      if (err2) return res.status(500).json({ message: err2.message });
      res.json({ message: "Signup successful" });
    });
  });
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username & password required" });
  }

  const query = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.query(query, [username, password], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0)
      return res.status(400).json({ message: "Invalid username or password" });
    res.json({ username, message: "Login successful" });
  });
});

// ================= ROOMS =================

// Get all rooms with their bookings
app.get("/rooms", (req, res) => {
  const query = `SELECT r.*, b.start_time, b.end_time, b.username as booked_by
                 FROM rooms r
                 LEFT JOIN bookings b ON r.id = b.room_id`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });

    const roomsMap = {};
    results.forEach((r) => {
      if (!roomsMap[r.id]) {
        let facilities = [];
        try {
          facilities = r.facilities ? JSON.parse(r.facilities) : [];
        } catch (e) {
          facilities = [];
        }

        roomsMap[r.id] = {
          id: r.id,
          name: r.name,
          capacity: r.capacity,
          info: r.info,
          facilities,
          bookings: [],
        };
      }
      if (r.start_time && r.end_time) {
        roomsMap[r.id].bookings.push({
          start_time: r.start_time,
          end_time: r.end_time,
          booked_by: r.booked_by,
        });
      }
    });

    res.json(Object.values(roomsMap));
  });
});

// ================= BOOKINGS =================

// Get all bookings
app.get("/bookings", (req, res) => {
  const { start, end } = req.query;

  let query = `
    SELECT b.id, b.room_id, r.name AS room_name, b.username, b.start_time, b.end_time
    FROM bookings b
    JOIN rooms r ON b.room_id = r.id
  `;
  const values = [];

  if (start && end) {
    query += " WHERE b.start_time >= ? AND b.end_time <= ?";
    values.push(start, end);
  }

  query += " ORDER BY b.start_time ASC";

  db.query(query, values, (err, results) => {
    if (err) {
      console.error("Fetch bookings error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json(results);
  });
});

// Get bookings for a specific room (with optional date filter)
app.get("/bookings/:roomId", (req, res) => {
  const { roomId } = req.params;
  const { start, end } = req.query;

  let query = `
    SELECT b.id, b.room_id, r.name AS room_name, b.username, b.start_time, b.end_time
    FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    WHERE b.room_id = ?
  `;
  const values = [roomId];

  if (start && end) {
    query += " AND b.start_time >= ? AND b.end_time <= ?";
    values.push(start, end);
  }

  query += " ORDER BY b.start_time ASC";

  db.query(query, values, (err, results) => {
    if (err) {
      console.error("Fetch room bookings error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json(results);
  });
});

// Create a booking
app.post("/book/:id", (req, res) => {
  const { id } = req.params;
  const { start, end, username } = req.body;

  if (!start || !end || !username) {
    return res.status(400).json({ message: "Start, end & username required" });
  }

  const query = `
    INSERT INTO bookings (room_id, start_time, end_time, username)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [id, start, end, username], (err) => {
    if (err) {
      console.error("Booking insert error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json({ message: "✅ Booking successful!" });
  });
});

// ================= ADMIN AUTH =================

// Admin Login
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username & password required" });
  }

  const query = "SELECT * FROM admins WHERE username = ? AND password = ?";
  db.query(query, [username, password], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0) {
      return res.status(400).json({ message: "Invalid admin credentials" });
    }
    res.json({ username, role: "admin", message: "Admin login successful" });
  });
});

// ================= SERVER =================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
