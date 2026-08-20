const db = require("../config/db");

const getAllLedgers = async () => {
  const [rows] = await db.execute(`
    SELECT
      l.id,
      l.code,
      l.name,
      l.group_id,
      g.name AS group_name
    FROM ledgers l
    INNER JOIN \`groups\` g
      ON g.id = l.group_id
    ORDER BY l.name ASC
  `);

  return rows;
};


const findDuplicateLedger = async (name,groupId) => {
  const [rows] = await db.execute(
    `
    SELECT id
    FROM ledgers
    WHERE LOWER(name) = LOWER(?)
    AND group_id = ?
    LIMIT 1
    `,
    [
      name,
      groupId,
    ]
  );

  return rows[0] || null;
};


const getNextLedgerCode = async () => {
  const [rows] = await db.execute(`
    SELECT code
    FROM ledgers
    WHERE code LIKE 'LED%'
    ORDER BY id DESC
    LIMIT 1
  `);

  if (!rows.length) {
    return "LED01";
  }

  const lastCode = rows[0].code;

  const number = parseInt(
    lastCode.replace("LED", ""),
    10
  );

  const nextNumber = Number.isNaN(number)
    ? 1
    : number + 1;

  return `LED${String(nextNumber).padStart(2, "0")}`;
};


const insertLedger = async ({
  code,
  name,
  groupId,
}) => {
  const [result] = await db.execute(
    `
    INSERT INTO ledgers
    (
      code,
      name,
      group_id
    )
    VALUES (?, ?, ?)
    `,
    [
      code,
      name,
      groupId,
    ]
  );

  return result.insertId;
};


const getCreatedLedger = async (id) => {
  const [rows] = await db.execute(
    `
    SELECT
      l.id,
      l.code,
      l.name,
      l.group_id,
      g.name AS group_name
    FROM ledgers l
    INNER JOIN \`groups\` g
      ON g.id = l.group_id
    WHERE l.id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};


module.exports = {
  getAllLedgers,
  findDuplicateLedger,
  getNextLedgerCode,
  insertLedger,
  getCreatedLedger,
};
