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


