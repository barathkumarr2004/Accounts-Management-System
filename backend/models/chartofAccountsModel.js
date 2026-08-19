const db = require('../config/db'); // unga db connection file

const getChartOfAccounts = async () => {
  const [natures] = await db.query('SELECT id, name FROM nature ORDER BY id');
  const [groups] = await db.query('SELECT id, name, nature_id, parent_id FROM `groups` ORDER BY parent_id, id');
  const [ledgers] = await db.query('SELECT id, name, group_id FROM ledgers ORDER BY name');

  // Build tree
  const groupMap = {};
  groups.forEach(g => groupMap[g.id] = {...g, children: [] });

  ledgers.forEach(l => {
    if(groupMap[l.group_id]) {
      groupMap[l.group_id].children.push({ id: l.id, name: l.name, type: 'ledger' });
    }
  });

  groups.forEach(g => {
    if(g.parent_id && groupMap[g.parent_id]) {
      groupMap[g.parent_id].children.push({...groupMap[g.id], type: 'group' });
    }
  });

  const result = natures.map(n => ({
    id: n.id,
    name: n.name,
    type: 'nature',
    children: groups
    .filter(g => g.nature_id === n.id && g.parent_id === null)
    .map(g => ({...groupMap[g.id], type: 'group' }))
  }));

  return result;
};

module.exports = { getChartOfAccounts };








// Recursive ah tree build panna function
// const buildTree = (items, parentId = null) => {
//   return items
//    .filter(item => item.parent_id === parentId)
//    .map(item => ({
//       id: item.id,
//       name: item.name,
//       type: item.type, // 'group' or 'ledger'
//       code: item.code || null,
//       children: buildTree(items, item.id) // same table la child thedum
//     }));
// };

// exports.getChartOfAccounts = async (req, res) => {
//   try {
//     // 1. Natures edukanum
//     const [natures] = await db.query("SELECT id, name FROM natures ORDER BY id");
    
//     // 2. Groups + Ledgers serthu oru array la podanum. type add pannanum
//     const [groups] = await db.query("SELECT id, name, parent_id, nature_id, 'group' as type FROM `groups`");
//     const [ledgers] = await db.query("SELECT id, name, group_id as parent_id, NULL as nature_id, code, 'ledger' as type FROM ledgers");
    
//     const allItems = [...groups,...ledgers];

//     // 3. Natures ku kulla tree attach pannanum
//     const result = natures.map(nature => {
//       // indha nature ku direct ah parent_id=NULL irukura groups mattum edukanum
//       const natureItems = allItems.filter(item => 
//         (item.nature_id === nature.id && item.parent_id === null) ||
//         (item.type === 'ledger' && groups.some(g => g.id === item.parent_id && g.nature_id === nature.id && g.parent_id === null))
//       );
      
//       // correct ah tree build pannanum
//       const children = buildTree(allItems.filter(i => 
//         i.nature_id === nature.id || groups.some(g => g.id === i.parent_id && g.nature_id === nature.id)
//       ), null);

//       return {
//         id: nature.id,
//         name: nature.name,
//         children: children
//       };
//     });

//     res.json(result);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };