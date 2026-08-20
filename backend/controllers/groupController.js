const groupModel = require("../models/groupModel");

const getGroups = async (req, res) => {
  try {
    const groups = await groupModel.getAllGroups();
    return res.status(200).json({success: true,data: groups,});
  } 
  catch (error) {
    console.error("GET GROUPS ERROR:", error);

    return res.status(500).json({success: false, message: "Unable to load groups",});
  }
};


const createGroup = async (req, res) => {
  try {
    const { name, parent_id } = req.body;
//validation
    const groupName = name?.trim();

    if (!groupName) {
      return res.status(400).json({ success: false, message: "Group name is required",});
    }

    let parentId = null;
    if (parent_id !== undefined && parent_id !== null && parent_id !== "") {
      parentId = Number(parent_id);

      if (!Number.isInteger(parentId) || parentId <= 0) {
        return res.status(400).json({success: false, message: "Invalid parent group",});
      }
    }

    let parentGroup = null;
    if (parentId !== null) {
      parentGroup = await groupModel.getGroupById(parentId);

      if (!parentGroup) {
        return res.status(404).json({success: false, message: "Parent group not found", });
      }
    }

    const duplicate = await groupModel.findDuplicateGroup( groupName, parentId);

    if (duplicate) {
      return res.status(409).json({success: false, message: "Group already exists under this parent",  });
    }

    const natureId = parentGroup ? parentGroup.nature_id : null;

    const code = await groupModel.getNextGroupCode();

    //insert
    const groupId =await groupModel.insertGroup({ code,name: groupName,natureId,parentId, });

    // Return created group
    
    const createdGroup =await groupModel.getCreatedGroup(groupId);

    return res.status(201).json({success: true, message: "Group created successfully", data: createdGroup,});
} 
catch (error) {
    console.error("CREATE GROUP ERROR:", error);
    return res.status(500).json({success: false,message: "Unable to create group",});
  }
};


module.exports = {
  getGroups,
  createGroup,
};