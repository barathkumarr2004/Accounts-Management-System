"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      name: "Chart of Accounts",
      path: "/chartsofaccounts",
    },
    {
      name: "Groups",
      path: "/groups",
    },
    {
      name: "Ledger Accounts",
      path: "/ledgers",
    },
    {
      name: "Journal Voucher",
      path: "/journal",
    },
    {
      name: "Day Book",
      path: "/daybook",
    },
    {
      name: "Balance Sheet",
      path: "/balancesheet",
    },
    {
      name: "Profit & loss",
      path: "/profitloss",
    },
     {
      name: "Trial Balance",
      path: "/trialbalance",
    },
  ];

  return (
    <aside className="position-fixed top-0 start-0 vh-100 bg-dark text-white d-flex flex-column shadow">
      
      <div className="px-4 py-4 border-bottom border-secondary">
        <h4 className="fw-bold mb-1">Accounts</h4>

        <small className="text-secondary"> Management System</small>
      </div>

      <nav className="flex-grow-1 overflow-auto px-3 py-4">
        <small className="text-secondary text-uppercase fw-semibold px-3"> Main Menu </small>

        <div className="mt-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`d-block text-decoration-none rounded px-3 py-3 mb-2 ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-white"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-top border-secondary px-4 py-3">
        <small className="text-secondary">
          © 2026 Accounts
        </small>
      </div>

    </aside>
  );
}
