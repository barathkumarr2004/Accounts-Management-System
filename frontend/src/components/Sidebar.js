"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const sections = [
    {
      title: "MAIN MENU",
      items: [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Chart of Accounts", path: "/chartsofaccounts"},
        { name: "Groups", path: "/groups" },
        { name: "Ledger Accounts", path: "/ledgers" },
      ],
    },
    {
      title: "TRANSACTIONS",
      items: [
        { name: "Journal Voucher", path: "/journal" },
        { name: "Sales", path: "/sales" },
        { name: "Purchase", path: "/purchase" },
        { name: "Receipt", path: "/receipt" },
        { name: "Payment", path: "/payment" },
        { name: "Stock", path: "/stock" },
      ],
    },
    {
      title: "REPORTS",
      items: [
        { name: "Day Book", path: "/daybook"},
        { name: "Ledger Report", path: "/ledgerreport" },
        { name: "Balance Sheet", path: "/balancesheet" },
        { name: "Profit & Loss", path: "/profitloss" },
        { name: "Trial Balance", path: "/trialbalance" },
      ],
    },
  ];

  const isActive = (path) =>
    pathname === path || pathname.startsWith(`${path}/`);

  return (
    <aside className="accounts-sidebar">
      <div className="sidebar-header">
        <div className="logo-box">A</div>
        <div className="brand-content">
          <h4>Accounts</h4>
          <span>Management System</span>
        </div>
      </div>

      <div className="sidebar-menu">
        {sections.map((section) => (
          <div className="menu-section" key={section.title}>
            <div className="section-title">{section.title}</div>

            <div className="menu-list">
              {section.items.map((item) => {
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`menu-item ${active ? "active" : ""}`}
                  >
                    
                    <span className="menu-name">{item.name}</span>
                    {active && <span className="active-line" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="footer-status"></div>
        <div className="footer-content">
          <strong>Accounts Management</strong>
          <span>© 2026 Accounts</span>
        </div>
      </div>

      <style>{`
        * { box-sizing:border-box; }
        .accounts-sidebar { position:fixed; top:0; left:0; width:250px; height:100vh; display:flex; flex-direction:column; background:#08111f; border-right:1px solid #1b344b; color:#fff; z-index:1000; box-shadow:8px 0 28px rgba(0,0,0,.2); }
        .sidebar-header { height:94px; display:flex; align-items:center; gap:13px; padding:0 19px; border-bottom:1px solid #1b344b; background:linear-gradient(135deg,#0b1727,#0c1c2e); }
        .logo-box { width:40px; height:40px; display:flex; align-items:center; justify-content:center; flex-shrink:0; border:1px solid #1e8dc1; border-radius:9px; background:linear-gradient(135deg,#087fce,#08b6d7); color:#fff; font-size:20px; font-weight:900; box-shadow:0 6px 18px rgba(8,160,220,.22); }
        .brand-content { min-width:0; }
        .sidebar-header h4 { margin:0 0 4px; color:#f5f9fc; font-size:18px; font-weight:800; letter-spacing:.1px; }
        .sidebar-header span { display:block; color:#5f8095; font-size:9px; letter-spacing:.2px; }
        .sidebar-menu { flex:1; overflow-y:auto; padding:20px 11px 18px; scrollbar-width:thin; scrollbar-color:#27445b transparent; }
        .sidebar-menu::-webkit-scrollbar { width:5px; }
        .sidebar-menu::-webkit-scrollbar-track { background:transparent; }
        .sidebar-menu::-webkit-scrollbar-thumb { background:#27445b; border-radius:10px; }
        .menu-section { margin-bottom:23px; }
        .section-title { padding:0 12px; margin-bottom:8px; color:#526d81; font-size:8px; font-weight:900; letter-spacing:1.5px; }
        .menu-list { display:flex; flex-direction:column; gap:3px; }
        .menu-item { position:relative; min-height:43px; display:flex; align-items:center; gap:11px; padding:0 12px; border:1px solid transparent; border-radius:8px; color:#aebdca; text-decoration:none; font-size:11px; font-weight:600; transition:all .18s ease; }
        .menu-item:hover { background:#102337; border-color:#193a52; color:#f2f7fa; transform:translateX(2px); }
        .menu-item.active { background:linear-gradient(90deg,#1851d7,#2868ec); border-color:#2766df; color:#fff; font-weight:800; box-shadow:0 6px 18px rgba(27,88,222,.2); }
        .menu-icon { width:24px; height:24px; display:flex; align-items:center; justify-content:center; flex-shrink:0; border:1px solid #1d394f; border-radius:6px; background:#0d1d2d; color:#6d899b; font-size:14px; font-weight:800; transition:all .18s ease; }
        .menu-item:hover .menu-icon { border-color:#285776; background:#122b40; color:#70c9e8; }
        .menu-item.active .menu-icon { border-color:rgba(255,255,255,.18); background:rgba(0,0,0,.14); color:#fff; }
        .menu-name { flex:1; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
        .active-line { position:absolute; top:8px; right:0; bottom:8px; width:3px; border-radius:3px 0 0 3px; background:#5de0f7; box-shadow:0 0 7px rgba(93,224,247,.45); }
        .sidebar-footer { min-height:67px; display:flex; align-items:center; gap:10px; padding:0 17px; border-top:1px solid #1b344b; background:#0a1726; }
        .footer-status { width:8px; height:8px; flex-shrink:0; border-radius:50%; background:#22c55e; box-shadow:0 0 9px rgba(34,197,94,.55); }
        .footer-content { min-width:0; }
        .footer-content strong { display:block; overflow:hidden; margin-bottom:3px; color:#9eb2c1; font-size:9px; font-weight:700; white-space:nowrap; text-overflow:ellipsis; }
        .footer-content span { display:block; color:#496277; font-size:8px; }
        @media (max-width:768px) { .accounts-sidebar { width:220px; } .sidebar-header { padding:0 15px; } .sidebar-menu { padding:17px 9px; } .menu-item { min-height:41px; font-size:10px; } }
      `}</style>
    </aside>
  );
}