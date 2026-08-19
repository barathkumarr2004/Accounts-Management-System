const express = require("express");
const cors = require("cors");

const groupRoutes = require("./routes/groupRoutes");
const ledgerRoutes = require("./routes/ledgerRoutes");
const journalRoutes = require("./routes/journalRoutes");

const app = express();


/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());
app.use("/api/groups", groupRoutes);
app.use("/api/ledgers", ledgerRoutes);
app.use("/api/journals", journalRoutes);

/*
|--------------------------------------------------------------------------
| Test
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Accounts Management API is running",
  });
});


/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/groups",
  groupRoutes
);

app.use(
  "/api/ledgers",
  ledgerRoutes
);
app.use(
  "/api/journals",
  journalRoutes
);


/*
|--------------------------------------------------------------------------
| 404
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});


/*
|--------------------------------------------------------------------------
| Global Error
|--------------------------------------------------------------------------
*/

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});


module.exports = app;