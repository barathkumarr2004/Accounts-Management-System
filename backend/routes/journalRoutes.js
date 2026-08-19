const express = require("express");

const router = express.Router();

const {
  createJournal,
} = require("../controllers/journalController");

router.post("/", createJournal);

module.exports = router;