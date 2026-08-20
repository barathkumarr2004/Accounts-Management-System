const ledgerModel = require("../models/ledgerModel");
const groupModel = require("../models/groupModel");

const getLedgers = async (req, res) => {
  try {
    const ledgers = await ledgerModel.getAllLedgers();

    return res.status(200).json({success: true,data: ledgers,});
  }
   catch (error) {
    console.error("GET LEDGERS ERROR:", error);

   return res.status(500).json({success: false,  message: "Unable to load ledgers",});
  }
};


const createLedger = async (req, res) => {
  try {
    const {name,group_id,} = req.body;
//validation
    const ledgerName = name?.trim();

    if (!ledgerName) {
      return res.status(400).json({success: false, message: "Ledger name is required",});
    }

    if ( group_id === undefined || group_id === null || group_id === "") {
      return res.status(400).json({success: false, message: "Group is required",});
    }

   const groupId = Number(group_id);
    if (!Number.isInteger(groupId) || groupId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid group",
      });
    }

    const group = await groupModel.getGroupById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Selected group not found",
      });
    }

    const duplicate = await ledgerModel.findDuplicateLedger(ledgerName, groupId);
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Ledger already exists under this group",
      });
    }

    const code =await ledgerModel.getNextLedgerCode();

    const ledgerId = await ledgerModel.insertLedger({code,name: ledgerName,groupId,});

    const createdLedger =await ledgerModel.getCreatedLedger(ledgerId);

    return res.status(201).json({
      success: true,
      message: "Ledger created successfully",
      data: createdLedger,
    });

  } catch (error) {
    console.error("CREATE LEDGER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create ledger",
    });
  }
};


module.exports = {
  getLedgers,
  createLedger,
};