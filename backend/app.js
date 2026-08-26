const express = require("express");
const cors = require("cors");

const groupRoutes = require("./routes/groupRoutes");
const ledgerRoutes = require("./routes/ledgerRoutes");
const chartOfAccountsRoutes = require('./routes/chartofAccountsRoutes'); 
const journalRoutes = require("./routes/journalRoutes");
const balanceSheetRoutes = require("./routes/balanceSheetRoutes");
const profit_lossRoutes = require("./routes/profit-lossRoutes");

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Accounts Management API is running" });
});

app.use("/api/groups", groupRoutes);
app.use("/api/ledgers", ledgerRoutes);
app.use("/api/chartsofaccounts", chartOfAccountsRoutes); 
app.use("/api/journals", journalRoutes);
app.use("/api/balancesheet", balanceSheetRoutes);
app.use("/api/profit-loss", profit_lossRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

module.exports = app;