const db = require("../config/db");

// Get all groups
const getAllGroups = async () => {
  const [rows] = await db.execute(`
    SELECT g.id, g.code, g.name, g.nature_id, g.parent_id, p.name AS parent_name
    FROM \`groups\` g
    LEFT JOIN \`groups\` p
      ON g.parent_id = p.id
    ORDER BY g.id ASC
  `);
  return rows;
};

// Get one group
const getGroupById = async (id) => {
  const [rows] = await db.execute(
    ` SELECT id, code, name, nature_id, parent_id FROM \`groups\` WHERE id = ? LIMIT 1 `,
    [id]
  );
  return rows[0] || null;
};

// Check duplicate group
const findDuplicateGroup = async (name, parentId) => {
  let sql;
  let params;
  if (parentId === null) {
    sql = ` SELECT id FROM \`groups\` WHERE LOWER(name) = LOWER(?) AND parent_id IS NULL LIMIT 1 `;
 params = [name];
  } else {
    sql = `SELECT id FROM \`groups\` WHERE LOWER(name) = LOWER(?) AND parent_id = ? LIMIT 1  `;
    params = [name, parentId];
  }
  const [rows] = await db.execute(sql, params);
  return rows[0] || null;
};

// Generate group code
const getNextGroupCode = async () => {
  const [rows] = await db.execute(` SELECT code FROM \`groups\` WHERE code LIKE 'GRP%' ORDER BY id DESC
    LIMIT 1`);
  if (rows.length === 0) {
    return "GRP01";
  }
  const lastCode = rows[0].code;
  const number = parseInt( lastCode.replace("GRP", ""),10);

  const nextNumber = Number.isNaN(number) ? 1 : number + 1;

  return `GRP${String(nextNumber).padStart(2, "0")}`;
};

// Create group
const insertGroup = async ({  code, name, natureId, parentId,}) => {
  const [result] = await db.execute(
    ` INSERT INTO \`groups\`(code, name, nature_id,parent_id)  VALUES (?, ?, ?, ?)`,
    [
      code,name, natureId,parentId,
    ]
  );

  return result.insertId;
};

// Get created group
const getCreatedGroup = async (id) => {
  const [rows] = await db.execute(
    `SELECT id, code, name, nature_id, parent_id FROM \`groups\`  WHERE id = ? LIMIT 1`,
    [id]
  );

  return rows[0] || null;
};

module.exports = {
  getAllGroups,
  getGroupById,
  findDuplicateGroup,
  getNextGroupCode,
  insertGroup,
  getCreatedGroup,
};