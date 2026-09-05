"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const sections = [
    {
      title: "MAIN MENU",
      items: [
        {
          name: "Dashboard",
          path: "/dashboard",
          icon: "⌂",
        },
        {
          name: "Chart of Accounts",
          path: "/chartsofaccounts",
          icon: "▦",
        },
        {
          name: "Groups",
          path: "/groups",
          icon: "▤",
        },
        {
          name: "Ledger Accounts",
          path: "/ledgers",
          icon: "▥",
        },
      ],
    },
    {
      title: "TRANSACTIONS",
      items: [
        {
          name: "Journal Voucher",
          path: "/journal",
          icon: "▣",
        },
        {
          name: "Sales",
          path: "/sales",
          icon: "↗",
        },
        {
          name: "Purchase",
          path: "/purchase",
          icon: "↙",
        },
        {
          name: "Receipt",
          path: "/receipt",
          icon: "↓",
        },
        {
          name: "Payment",
          path: "/payment",
          icon: "↑",
        },
        {
          name: "Stock",
          path: "/stock",
          icon: "▧",
        },
      ],
    },
    {
      title: "REPORTS",
      items: [
        {
          name: "Day Book",
          path: "/daybook",
          icon: "▤",
        },
        {
          name: "Ledger Report",
          path: "/ledgerreport",
          icon: "▥",
        },
        {
          name: "Balance Sheet",
          path: "/balancesheet",
          icon: "▦",
        },
        {
          name: "Profit & Loss",
          path: "/profitloss",
          icon: "◈",
        },
        {
          name: "Trial Balance",
          path: "/trialbalance",
          icon: "≡",
        },
      ],
    },
  ];

  const isActive = (path) =>
    pathname === path || pathname.startsWith(`${path}/`);

  return (
    <aside className="accounts-sidebar">
      <div className="sidebar-header">
        <div className="logo-box">A</div>

        <div>
          <h4>Accounts</h4>
          <span>Management System</span>
        </div>
      </div>

      <div className="sidebar-menu">
        {sections.map((section) => (
          <div className="menu-section" key={section.title}>
            <div className="section-title">
              {section.title}
            </div>

            <div className="menu-list">
              {section.items.map((item) => {
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`menu-item ${
                      active ? "active" : ""
                    }`}
                  >
                    <span className="menu-icon">
                      {item.icon}
                    </span>

                    <span className="menu-name">
                      {item.name}
                    </span>

                    {active && (
                      <span className="active-line" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="footer-dot" />
        <div>
          <small>Accounts Management</small>
          <span>© 2026 Accounts</span>
        </div>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .accounts-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 250px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #0b1220;
          border-right: 1px solid #1e334a;
          color: #fff;
          z-index: 1000;
          box-shadow: 8px 0 30px rgba(0, 0, 0, 0.18);
        }

        .sidebar-header {
          height: 86px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 20px;
          border-bottom: 1px solid #1e334a;
          background: #0d1726;
        }

        .logo-box {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: linear-gradient(
            135deg,
            #2563eb,
            #06b6d4
          );
          color: #fff;
          font-size: 19px;
          font-weight: 900;
          box-shadow: 0 5px 15px rgba(37, 99, 235, 0.25);
        }

        .sidebar-header h4 {
          margin: 0 0 3px;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 0.2px;
        }

        .sidebar-header span {
          color: #718096;
          font-size: 11px;
        }

        .sidebar-menu {
          flex: 1;
          overflow-y: auto;
          padding: 20px 12px;
        }

        .sidebar-menu::-webkit-scrollbar {
          width: 5px;
        }

        .sidebar-menu::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-menu::-webkit-scrollbar-thumb {
          background: #263b52;
          border-radius: 10px;
        }

        .menu-section {
          margin-bottom: 22px;
        }

        .section-title {
          padding: 0 12px;
          margin-bottom: 8px;
          color: #60748a;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.2px;
        }

        .menu-list {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .menu-item {
          position: relative;
          min-height: 43px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 13px;
          border-radius: 8px;
          color: #c4ceda;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .menu-item:hover {
          background: #132337;
          color: #fff;
          transform: translateX(2px);
        }

        .menu-item.active {
          background: linear-gradient(
            90deg,
            #1d4ed8,
            #2563eb
          );
          color: #fff;
          font-weight: 700;
          box-shadow:
            0 5px 15px rgba(37, 99, 235, 0.2);
        }

        .menu-icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #71869c;
          font-size: 15px;
          font-weight: 700;
        }

        .menu-item.active .menu-icon {
          color: #fff;
        }

        .menu-name {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .active-line {
          position: absolute;
          right: 0;
          top: 8px;
          bottom: 8px;
          width: 3px;
          border-radius: 3px 0 0 3px;
          background: #67e8f9;
        }

        .sidebar-footer {
          min-height: 66px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 18px;
          border-top: 1px solid #1e334a;
          background: #0d1726;
        }

        .footer-dot {
          width: 8px;
          height: 8px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
        }

        .sidebar-footer small {
          display: block;
          margin-bottom: 3px;
          color: #a8b5c4;
          font-size: 10px;
          font-weight: 600;
        }

        .sidebar-footer span {
          display: block;
          color: #53677d;
          font-size: 9px;
        }

        @media (max-width: 768px) {
          .accounts-sidebar {
            width: 220px;
          }

          .sidebar-header {
            padding: 0 15px;
          }

          .sidebar-menu {
            padding: 15px 9px;
          }

          .menu-item {
            font-size: 12px;
          }
        }
      `}</style>
    </aside>
  );
}