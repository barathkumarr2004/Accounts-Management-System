"use client";

import { useMemo, useState } from "react";
import { useGetChartOfAccountsQuery } from "@/store/api/chartOfAccountsApi";

const getAllNodeKeys = (nodes, keys = []) => {
  nodes?.forEach((node) => {
    if (node.children?.length) {
      keys.push(`${node.type}-${node.id}`);
      getAllNodeKeys(node.children, keys);
    }
  });
  return keys;
};

const TreeNode = ({ node, level = 0, expanded, toggleNode }) => {
  const hasChildren = node.children?.length > 0;
  const nodeKey = `${node.type}-${node.id}`;
  const isOpen = expanded.has(nodeKey);
  const isLedger = node.type === "ledger";
  const isNature = node.type === "nature";
  const isGroup = node.type === "group";

  return (
    <div className="tree-node">
      <div
        className={`tree-row ${isLedger ? "ledger-row" : ""} ${isNature ? "nature-row" : ""} ${isGroup ? "group-row" : ""}`}
        style={{ "--level": level }}
        onClick={() => hasChildren && toggleNode(nodeKey)}
      >
        <div className="tree-left">
          <span className={`expand-box ${hasChildren ? "has-children" : "empty"}`}>
            {hasChildren ? (isOpen ? "−" : "+") : "•"}
          </span>

          <span className={`node-icon ${isNature ? "nature-icon" : ""} ${isGroup ? "group-icon" : ""} ${isLedger ? "ledger-icon" : ""}`}>
            {isNature ? "N" : isGroup ? "G" : "L"}
          </span>

          <span className="node-name">{node.name}</span>

          {hasChildren && (
            <span className="child-count">
              {node.children.length}
            </span>
          )}
        </div>

        <span className={`node-type ${isNature ? "type-nature" : isGroup ? "type-group" : "type-ledger"}`}>
          {node.type || "account"}
        </span>
      </div>

      {hasChildren && isOpen && (
        <div className="children-container">
          {node.children.map((child) => (
            <TreeNode
              key={`${child.type}-${child.id}`}
              node={child}
              level={level + 1}
              expanded={expanded}
              toggleNode={toggleNode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function ChartOfAccountsPage() {
  const { data, isLoading, error } = useGetChartOfAccountsQuery();

  const allKeys = useMemo(() => getAllNodeKeys(data || []), [data]);

  const [expanded, setExpanded] = useState(new Set());

  const expandAll = () => {
    setExpanded(new Set(allKeys));
  };

  const collapseAll = () => {
    setExpanded(new Set());
  };

  const toggleNode = (key) => {
    setExpanded((prev) => {
      const next = new Set(prev);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  };

  const [search, setSearch] = useState("");

  const filterTree = (nodes) => {
    if (!search.trim()) return nodes;

    const value = search.toLowerCase();

    return nodes
      .map((node) => {
        const matched = node.name?.toLowerCase().includes(value);
        const children = node.children ? filterTree(node.children) : [];

        if (matched || children.length) {
          return {
            ...node,
            children,
          };
        }

        return null;
      })
      .filter(Boolean);
  };

  const filteredData = filterTree(data || []);

  const totalNatures = data?.length || 0;

  const countNodes = (nodes) => {
    let total = 0;

    nodes?.forEach((node) => {
      total += 1;

      if (node.children?.length) {
        total += countNodes(node.children);
      }
    });

    return total;
  };

  const totalAccounts = countNodes(data || []);

  if (isLoading) {
    return (
      <>
        <div className="loading-page">
          <div className="loading-card">
            <div className="loading-spinner"></div>
            <h3>Loading Chart of Accounts</h3>
            <p>Please wait while accounts are loaded...</p>
          </div>
        </div>

        <style>{`
          .loading-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:#07111f; color:#fff; font-family:Arial,Helvetica,sans-serif; }
          .loading-card { width:360px; padding:35px; border:1px solid #24516f; border-radius:12px; background:#0b1b2d; text-align:center; box-shadow:0 15px 40px rgba(0,0,0,.35); }
          .loading-spinner { width:34px; height:34px; margin:0 auto 18px; border:3px solid #193b52; border-top-color:#26b9e8; border-radius:50%; animation:spin .8s linear infinite; }
          .loading-card h3 { margin:0 0 8px; font-size:16px; }
          .loading-card p { margin:0; color:#678394; font-size:10px; }
          @keyframes spin { to { transform:rotate(360deg); } }
        `}</style>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="error-page">
          <div className="error-card">
            <div className="error-icon">!</div>
            <h2>Unable to Load Chart of Accounts</h2>
            <p>{JSON.stringify(error)}</p>
          </div>
        </div>

        <style>{`
          .error-page { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:20px; background:#07111f; color:#fff; font-family:Arial,Helvetica,sans-serif; }
          .error-card { max-width:500px; padding:30px; border:1px solid #733d46; border-radius:10px; background:#281a21; text-align:center; }
          .error-icon { width:40px; height:40px; margin:0 auto 15px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:#6c303a; color:#ff9696; font-weight:900; }
          .error-card h2 { margin:0 0 10px; font-size:17px; }
          .error-card p { margin:0; color:#c47c84; font-size:10px; word-break:break-word; }
        `}</style>
      </>
    );
  }

  return (
    <>
      <div className="coa-page">
        <div className="coa-container">

          <div className="page-header">
            <div className="header-content">
              <div className="header-icon">COA</div>

              <div>
                <h1>Chart of Accounts</h1>
                <p>Complete hierarchy of natures, groups and ledger accounts</p>
              </div>
            </div>

            <div className="header-badge">
              ACCOUNTING MASTER
            </div>
          </div>

          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-icon nature-summary">N</div>
              <div>
                <span>Natures</span>
                <strong>{totalNatures}</strong>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon account-summary">A</div>
              <div>
                <span>Total Accounts</span>
                <strong>{totalAccounts}</strong>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon tree-summary">T</div>
              <div>
                <span>View Mode</span>
                <strong>Hierarchy</strong>
              </div>
            </div>
          </div>

          <div className="toolbar">
            <div className="search-box">
              <span className="search-icon">⌕</span>

              <input
                type="text"
                placeholder="Search nature, group or ledger..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (e.target.value) {
                    expandAll();
                  }
                }}
              />

              {search && (
                <button
                  className="clear-search"
                  onClick={() => setSearch("")}
                >
                  ×
                </button>
              )}
            </div>

            <div className="toolbar-actions">
              <button
                type="button"
                className="toolbar-button expand-button"
                onClick={expandAll}
              >
                <span>+</span>
                Expand All
              </button>

              <button
                type="button"
                className="toolbar-button collapse-button"
                onClick={collapseAll}
              >
                <span>−</span>
                Collapse All
              </button>
            </div>
          </div>

          <div className="legend">
            <div className="legend-title">ACCOUNT LEVELS</div>

            <div className="legend-item">
              <span className="legend-icon nature-legend">N</span>
              Nature
            </div>

            <div className="legend-item">
              <span className="legend-icon group-legend">G</span>
              Group
            </div>

            <div className="legend-item">
              <span className="legend-icon ledger-legend">L</span>
              Ledger
            </div>

            <div className="legend-hint">
              Click any row to expand or collapse
            </div>
          </div>

          <div className="accounts-card">

            <div className="accounts-header">
              <div>
                <h2>Accounts Hierarchy</h2>
                <p>
                  {search
                    ? `Search results for "${search}"`
                    : "All accounting accounts"}
                </p>
              </div>

              <div className="account-count">
                {filteredData.length} Natures
              </div>
            </div>

            <div className="tree-container">

              {filteredData.length > 0 ? (
                filteredData.map((nature) => (
                  <TreeNode
                    key={`${nature.type}-${nature.id}`}
                    node={nature}
                    expanded={expanded}
                    toggleNode={toggleNode}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">⌕</div>
                  <h3>No Accounts Found</h3>
                  <p>
                    Try searching with a different account name.
                  </p>

                  <button
                    type="button"
                    onClick={() => setSearch("")}
                  >
                    Clear Search
                  </button>
                </div>
              )}

            </div>

            <div className="accounts-footer">
              <span>
                Total: {totalNatures} Natures
              </span>

              <span className="footer-divider">|</span>

              <span>
                {totalAccounts} Accounts
              </span>

              <span className="footer-divider">|</span>

              <span>
                {expanded.size > 0
                  ? "Hierarchy Expanded"
                  : "Hierarchy Collapsed"}
              </span>
            </div>

          </div>

        </div>
      </div>

      <style>{`

        * { box-sizing:border-box; }

        body { margin:0; background:#07111f; }

        .coa-page { min-height:100vh; padding:24px; background:radial-gradient(circle at 85% 0%,#152d52 0,transparent 32%),#07111f; color:#e7f0f5; font-family:Arial,Helvetica,sans-serif; }

        .coa-container { width:100%; max-width:1250px; margin:0 auto; }

        .page-header { display:flex; align-items:center; justify-content:space-between; gap:20px; padding:21px 24px; margin-bottom:14px; border:1px solid #2c729b; border-radius:10px; background:linear-gradient(110deg,#0d1e35,#1b3b7b); box-shadow:0 10px 30px rgba(0,0,0,.25); }

        .header-content { display:flex; align-items:center; gap:13px; }

        .header-icon { width:47px; height:47px; display:flex; align-items:center; justify-content:center; border:1px solid #2e7698; border-radius:8px; background:#102f45; color:#5bc9ec; font-family:Consolas,monospace; font-size:10px; font-weight:900; }

        .page-header h1 { margin:0; color:#fff; font-size:25px; font-weight:800; }

        .page-header p { margin:5px 0 0; color:#a9c8d8; font-size:10px; }

        .header-badge { padding:8px 11px; border:1px solid #2a6d8c; border-radius:5px; background:#0d2b3b; color:#61c9ec; font-size:7px; font-weight:900; letter-spacing:.8px; }

        .summary-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:14px; }

        .summary-card { display:flex; align-items:center; gap:12px; padding:13px 15px; border:1px solid #1d3e58; border-radius:8px; background:#0b1b2d; }

        .summary-icon { width:38px; height:38px; display:flex; align-items:center; justify-content:center; flex-shrink:0; border-radius:6px; font-family:Consolas,monospace; font-size:10px; font-weight:900; }

        .nature-summary { border:1px solid #2d6983; background:#102d3d; color:#62c9e9; }

        .account-summary { border:1px solid #315f83; background:#102b46; color:#6caef7; }

        .tree-summary { border:1px solid #5c4d80; background:#28223d; color:#c0a5f6; }

        .summary-card span { display:block; margin-bottom:4px; color:#607a8c; font-size:8px; }

        .summary-card strong { color:#dceaf0; font-family:Consolas,monospace; font-size:13px; }

        .toolbar { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:13px; margin-bottom:10px; border:1px solid #1d4059; border-radius:8px; background:#0b1b2d; }

        .search-box { position:relative; flex:1; }

        .search-icon { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:#5c8093; font-size:17px; }

        .search-box input { width:100%; height:40px; padding:0 40px; outline:none; border:1px solid #284a61; border-radius:6px; background:#071426; color:#e6f0f5; font-size:10px; }

        .search-box input::placeholder { color:#506b7c; }

        .search-box input:focus { border-color:#279cc9; box-shadow:0 0 0 2px rgba(39,156,201,.1); }

        .clear-search { position:absolute; right:10px; top:50%; width:22px; height:22px; transform:translateY(-50%); border:0; border-radius:50%; background:#1a3449; color:#8ca6b4; cursor:pointer; font-size:15px; }

        .toolbar-actions { display:flex; gap:7px; }

        .toolbar-button { height:40px; padding:0 13px; border:1px solid #28506a; border-radius:6px; font-size:9px; font-weight:800; cursor:pointer; }

        .toolbar-button span { margin-right:5px; font-size:14px; }

        .expand-button { background:#102d42; color:#62c8e9; }

        .expand-button:hover { background:#153c56; }

        .collapse-button { background:#182b3c; color:#9cb0bc; }

        .collapse-button:hover { background:#243c50; }

        .legend { display:flex; align-items:center; gap:15px; padding:10px 13px; margin-bottom:10px; border:1px solid #19384e; border-radius:7px; background:#081625; }

        .legend-title { margin-right:4px; color:#4d6d80; font-size:7px; font-weight:900; letter-spacing:1px; }

        .legend-item { display:flex; align-items:center; gap:5px; color:#7690a0; font-size:8px; }

        .legend-icon { width:20px; height:20px; display:flex; align-items:center; justify-content:center; border-radius:4px; font-family:Consolas,monospace; font-size:7px; font-weight:900; }

        .nature-legend { background:#123246; color:#5bc9e9; }

        .group-legend { background:#193251; color:#6eaeef; }

        .ledger-legend { background:#2b2540; color:#bba1ef; }

        .legend-hint { margin-left:auto; color:#4c6879; font-size:8px; }

        .accounts-card { overflow:hidden; border:1px solid #1d4059; border-radius:9px; background:#0a1929; box-shadow:0 12px 30px rgba(0,0,0,.2); }

        .accounts-header { display:flex; align-items:center; justify-content:space-between; padding:16px 18px; border-bottom:1px solid #19374d; background:#0d2135; }

        .accounts-header h2 { margin:0; color:#e7f1f5; font-size:15px; font-weight:800; }

        .accounts-header p { margin:4px 0 0; color:#577286; font-size:8px; }

        .account-count { padding:6px 9px; border:1px solid #24526d; border-radius:5px; background:#102d41; color:#5fc8ea; font-family:Consolas,monospace; font-size:8px; font-weight:800; }

        .tree-container { padding:10px 12px; }

        .tree-node { width:100%; }

        .tree-row { display:flex; align-items:center; justify-content:space-between; min-height:42px; padding:0 12px 0 calc(12px + (var(--level) * 30px)); margin:2px 0; border:1px solid transparent; border-radius:6px; cursor:pointer; transition:.15s; }

        .tree-row:hover { border-color:#214963; background:#10263a; }

        .tree-left { display:flex; align-items:center; min-width:0; gap:9px; }

        .expand-box { width:20px; height:20px; display:flex; align-items:center; justify-content:center; flex-shrink:0; border-radius:4px; font-family:Consolas,monospace; font-size:14px; font-weight:900; }

        .expand-box.has-children { border:1px solid #285670; background:#102c40; color:#58c6e8; }

        .expand-box.empty { color:#304d60; font-size:8px; cursor:default; }

        .node-icon { width:25px; height:25px; display:flex; align-items:center; justify-content:center; flex-shrink:0; border-radius:5px; font-family:Consolas,monospace; font-size:8px; font-weight:900; }

        .nature-icon { background:#12364b; color:#61caeb; }

        .group-icon { background:#17304e; color:#6eaff0; }

        .ledger-icon { background:#29223f; color:#b9a0ee; }

        .node-name { overflow:hidden; color:#dbe8ee; font-size:10px; font-weight:600; text-overflow:ellipsis; white-space:nowrap; }

        .nature-row .node-name { color:#f0f7fa; font-size:11px; font-weight:800; }

        .group-row .node-name { color:#cce0ea; font-size:10px; font-weight:700; }

        .ledger-row .node-name { color:#82bdf4; font-size:10px; font-weight:600; }

        .child-count { min-width:19px; padding:3px 5px; border-radius:10px; background:#112b40; color:#638295; font-family:Consolas,monospace; font-size:7px; text-align:center; }

        .node-type { padding:4px 7px; border-radius:4px; font-size:6px; font-weight:900; letter-spacing:.4px; text-transform:uppercase; }

        .type-nature { background:#123246; color:#59c5e7; }

        .type-group { background:#182f4a; color:#69a9e7; }

        .type-ledger { background:#29223e; color:#b39be8; }

        .children-container { border-left:1px solid #17354a; margin-left:22px; }

        .accounts-footer { display:flex; align-items:center; gap:9px; padding:12px 17px; border-top:1px solid #19374d; background:#081625; color:#587284; font-family:Consolas,monospace; font-size:8px; }

        .footer-divider { color:#28495e; }

        .empty-state { padding:60px 20px; text-align:center; }

        .empty-icon { width:45px; height:45px; margin:0 auto 13px; display:flex; align-items:center; justify-content:center; border-radius:8px; background:#10263a; color:#568198; font-size:24px; }

        .empty-state h3 { margin:0 0 7px; color:#dce9ee; font-size:14px; }

        .empty-state p { margin:0 0 15px; color:#587283; font-size:9px; }

        .empty-state button { padding:8px 13px; border:1px solid #285a75; border-radius:5px; background:#102e43; color:#62c8e9; font-size:8px; font-weight:800; cursor:pointer; }

        .empty-state button:hover { background:#153d57; }

        @media (max-width:800px) { .coa-page { padding:15px; } .page-header { align-items:flex-start; flex-direction:column; } .header-badge { align-self:flex-end; margin-top:-45px; } .summary-grid { grid-template-columns:1fr; } .toolbar { align-items:stretch; flex-direction:column; } .toolbar-actions { width:100%; } .toolbar-button { flex:1; } .legend { flex-wrap:wrap; } .legend-hint { width:100%; margin-left:0; } }

        @media (max-width:500px) { .coa-page { padding:9px; } .page-header { padding:16px; } .page-header h1 { font-size:20px; } .header-icon { width:40px; height:40px; } .header-badge { display:none; } .accounts-header { padding:13px; } .tree-container { padding:7px; } .node-type { display:none; } .tree-row { min-height:40px; padding-left:calc(7px + (var(--level) * 20px)); } .legend-title { width:100%; } .legend { gap:9px; } .accounts-footer { flex-wrap:wrap; } }

      `}</style>
    </>
  );
}