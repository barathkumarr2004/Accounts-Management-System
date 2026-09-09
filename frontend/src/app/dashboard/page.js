"use client";

import Link from "next/link";

export default function Dashboard() {
  const today = new Date();

  const options = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  };

  const formattedDate = today
    .toLocaleDateString("en-GB", options)
    .replace(/ /g, "-");

  const menuSections = [
    {
      title: "MAIN MENU",
      items: [
        {
          name: "Chart of Accounts",
          desc: "View Natures, Groups & Ledgers",
          link: "/chartsofaccounts",
          icon: "COA",
          type: "blue",
        },
        {
          name: "Groups",
          desc: "Create & Manage Groups",
          link: "/groups",
          icon: "GR",
          type: "purple",
        },
        {
          name: "Ledger Accounts",
          desc: "Create & Manage Ledgers",
          link: "/ledgers",
          icon: "LA",
          type: "cyan",
        },
      ],
    },
    {
      title: "TRANSACTIONS",
      items: [
        {
          name: "Journal Voucher",
          desc: "Enter Journal Entries",
          link: "/journal",
          icon: "JV",
          type: "blue",
        },
        {
          name: "Sales",
          desc: "Create Sales & Reduce Stock",
          link: "/sales",
          icon: "SV",
          type: "green",
        },
        {
          name: "Purchase",
          desc: "Create Purchase & Add Stock",
          link: "/purchase",
          icon: "PV",
          type: "orange",
        },
        {
          name: "Receipt",
          desc: "Record Money Received",
          link: "/receipt",
          icon: "RV",
          type: "cyan",
        },
        {
          name: "Payment",
          desc: "Record Money Paid",
          link: "/payment",
          icon: "PM",
          type: "red",
        },
        {
          name: "Stock",
          desc: "Manage Inventory & Items",
          link: "/stock",
          icon: "ST",
          type: "yellow",
        },
      ],
    },
    {
      title: "REPORTS",
      items: [
        {
          name: "Day Book",
          desc: "View Daily Transactions",
          link: "/daybook",
          icon: "DB",
          type: "blue",
        },
        {
          name: "Ledger Report",
          desc: "View Ledger Transactions",
          link: "/ledgerreport",
          icon: "LR",
          type: "cyan",
        },
        {
          name: "Balance Sheet",
          desc: "View Assets & Liabilities",
          link: "/balancesheet",
          icon: "BS",
          type: "purple",
        },
        {
          name: "Profit & Loss",
          desc: "View Income & Expenses",
          link: "/profitloss",
          icon: "PL",
          type: "red",
        },
        {
          name: "Trial Balance",
          desc: "View Ledger Balances & Tally",
          link: "/trialbalance",
          icon: "TB",
          type: "green",
        },
      ],
    },
  ];

  const totalModules = menuSections.reduce(
    (total, section) => total + section.items.length,
    0
  );

  return (
    <>
      <div className="dashboard-page">
        <div className="dashboard-container">

          <header className="dashboard-header">
            <div>
              <div className="title-row">
                <h1>Accounts Dashboard</h1>
                <span className="status-badge">ACCOUNTING SYSTEM</span>
              </div>

              <p>
                Manage vouchers, inventory, ledgers and financial reports
                from one place
              </p>
            </div>

            <div className="module-count">
              <span>{totalModules}</span>
              <small>MODULES</small>
            </div>
          </header>

          <section className="welcome-card">
            <div className="welcome-icon">
              AC
            </div>

            <div>
              <h2>Welcome to Accounts Management</h2>
              <p>
                Select any module below to create transactions or view
                financial information.
              </p>
            </div>
          </section>

          {menuSections.map((section) => (
            <section className="module-section" key={section.title}>

              <div className="section-heading">
                <div className="section-line"></div>

                <h2>{section.title}</h2>

                <span>
                  {section.items.length} MODULES
                </span>
              </div>

              <div className="module-grid">
                {section.items.map((item) => (
                  <Link
                    href={item.link}
                    className="module-card"
                    key={item.name}
                  >
                    <div className={`module-icon ${item.type}`}>
                      {item.icon}
                    </div>

                    <div className="module-content">
                      <h3>{item.name}</h3>

                      <p>{item.desc}</p>
                    </div>

                    <div className="arrow">
                      →
                    </div>
                  </Link>
                ))}
              </div>

            </section>
          ))}

          <footer className="dashboard-footer">

            <div className="footer-item">
              <span>FINANCIAL YEAR</span>
              <strong>2026-2027</strong>
            </div>

            <div className="footer-divider"></div>

            <div className="footer-item">
              <span>TODAY</span>
              <strong>{formattedDate}</strong>
            </div>

            <div className="footer-divider"></div>

            <div className="footer-item">
              <span>SYSTEM</span>
              <strong className="online">
                ● ONLINE
              </strong>
            </div>

          </footer>

        </div>
      </div>

      <style>{`

        * { box-sizing:border-box; }

        body { margin:0; background:#07111f; }

        .dashboard-page { min-height:100vh; padding:24px; background:radial-gradient(circle at 85% 0%,#152c55 0,transparent 30%),#07111f; color:#e8f1f7; font-family:Arial,Helvetica,sans-serif; }

        .dashboard-container { width:100%; max-width:1450px; margin:0 auto; }

        .dashboard-header { display:flex; align-items:center; justify-content:space-between; gap:20px; padding:23px 25px; margin-bottom:15px; background:linear-gradient(110deg,#0d1e35,#193a78); border:1px solid #2a6fa0; border-radius:10px; box-shadow:0 10px 30px rgba(0,0,0,.25); }

        .title-row { display:flex; align-items:center; gap:10px; }

        .dashboard-header h1 { margin:0; color:#fff; font-size:26px; font-weight:800; }

        .dashboard-header p { margin:6px 0 0; color:#a8c9dd; font-size:11px; }

        .status-badge { padding:5px 8px; border:1px solid #2b6d83; border-radius:5px; background:#0d2d3b; color:#62c9eb; font-size:7px; font-weight:800; letter-spacing:.6px; }

        .module-count { min-width:75px; padding:8px 12px; border:1px solid #2d7396; border-radius:7px; background:#0d2639; text-align:center; }

        .module-count span { display:block; color:#61c9ee; font-family:Consolas,monospace; font-size:21px; font-weight:800; }

        .module-count small { color:#638296; font-size:7px; font-weight:800; letter-spacing:.7px; }

        .welcome-card { display:flex; align-items:center; gap:14px; padding:17px 20px; margin-bottom:22px; background:#0b1b2d; border:1px solid #1b3853; border-radius:9px; box-shadow:0 7px 22px rgba(0,0,0,.18); }

        .welcome-icon { width:42px; height:42px; display:flex; align-items:center; justify-content:center; flex-shrink:0; border:1px solid #296f91; border-radius:7px; background:#102e46; color:#61c8eb; font-size:10px; font-weight:900; }

        .welcome-card h2 { margin:0; color:#edf5fa; font-size:15px; font-weight:800; }

        .welcome-card p { margin:4px 0 0; color:#607b8d; font-size:9px; }

        .module-section { margin-bottom:22px; }

        .section-heading { display:flex; align-items:center; gap:9px; margin-bottom:10px; }

        .section-line { width:4px; height:17px; border-radius:3px; background:#2b91bd; }

        .section-heading h2 { margin:0; color:#8099a9; font-size:9px; font-weight:900; letter-spacing:1.3px; }

        .section-heading span { padding:3px 7px; border:1px solid #1c3b53; border-radius:10px; background:#0c2032; color:#4e7085; font-size:6px; font-weight:800; letter-spacing:.5px; }

        .module-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }

        .module-card { position:relative; display:flex; align-items:center; gap:13px; min-height:82px; padding:14px 15px; overflow:hidden; border:1px solid #1b3853; border-radius:8px; background:#0b1b2d; color:#fff; text-decoration:none; box-shadow:0 6px 18px rgba(0,0,0,.15); transition:.2s ease; }

        .module-card::after { content:""; position:absolute; right:-30px; bottom:-30px; width:90px; height:90px; border-radius:50%; background:rgba(35,117,167,.05); transition:.2s; }

        .module-card:hover { transform:translateY(-2px); border-color:#2c6589; background:#0e2338; box-shadow:0 10px 25px rgba(0,0,0,.25); }

        .module-card:hover::after { transform:scale(1.4); }

        .module-icon { width:43px; height:43px; display:flex; align-items:center; justify-content:center; flex-shrink:0; border-radius:7px; font-family:Consolas,monospace; font-size:8px; font-weight:900; }

        .module-icon.blue { border:1px solid #285e82; background:#102d48; color:#62c8ed; }

        .module-icon.cyan { border:1px solid #286c7e; background:#102e39; color:#60d0e8; }

        .module-icon.green { border:1px solid #286b58; background:#10352d; color:#61ddb1; }

        .module-icon.orange { border:1px solid #705523; background:#392d18; color:#efc35d; }

        .module-icon.red { border:1px solid #713740; background:#391e24; color:#ff9292; }

        .module-icon.purple { border:1px solid #58457b; background:#29213e; color:#c4a5ff; }

        .module-icon.yellow { border:1px solid #766326; background:#332d17; color:#e9d166; }

        .module-content { min-width:0; flex:1; }

        .module-content h3 { margin:0; color:#eaf2f6; font-size:12px; font-weight:800; }

        .module-content p { margin:5px 0 0; overflow:hidden; color:#5e788b; font-size:8px; text-overflow:ellipsis; white-space:nowrap; }

        .arrow { width:25px; height:25px; display:flex; align-items:center; justify-content:center; border:1px solid #203f57; border-radius:5px; background:#0d2134; color:#4f819d; font-size:13px; transition:.2s; }

        .module-card:hover .arrow { border-color:#2c789d; background:#12304a; color:#69c8ed; transform:translateX(2px); }

        .dashboard-footer { display:flex; align-items:center; justify-content:center; gap:25px; min-height:67px; margin-top:5px; padding:12px 20px; border:1px solid #1b3853; border-radius:9px; background:#0b1b2d; box-shadow:0 7px 22px rgba(0,0,0,.18); }

        .footer-item { display:flex; align-items:center; gap:8px; }

        .footer-item span { color:#4f6b7e; font-size:7px; font-weight:800; letter-spacing:.6px; }

        .footer-item strong { color:#b9cbd5; font-family:Consolas,monospace; font-size:9px; }

        .footer-item strong.online { color:#55d7a8; }

        .footer-divider { width:1px; height:20px; background:#1d354a; }

        @media (max-width:1100px) { .module-grid { grid-template-columns:repeat(2,1fr); } }

        @media (max-width:750px) { .dashboard-page { padding:14px; } .dashboard-header { align-items:flex-start; flex-direction:column; } .module-count { align-self:flex-end; margin-top:-55px; } .module-grid { grid-template-columns:1fr; } .dashboard-footer { align-items:flex-start; flex-direction:column; gap:10px; } .footer-divider { display:none; } }

        @media (max-width:500px) { .dashboard-page { padding:9px; } .dashboard-header { padding:18px; } .dashboard-header h1 { font-size:21px; } .status-badge { display:none; } .welcome-card { align-items:flex-start; } .module-count { display:none; } }

      `}</style>
    </>
  );
}