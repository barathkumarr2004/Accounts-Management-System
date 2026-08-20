"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "▣",
    },
    {
      name: "Chart of Accounts",
      path: "/chartsofaccounts",
      icon: "▦",
    },
    {
      name: "Groups",
      path: "/groups",
      icon: "◇",
    },
    {
      name: "Ledger Accounts",
      path: "/ledgers",
      icon: "▤",
    },
    {
      name: "Journal Voucher",
      path: "/journal",
      icon: "▧",
    },
    {
      name: "Day Book",
      path: "/daybook",
      icon: "▥",
    },
  ];

  return (
    <aside
      className="position-fixed top-0 start-0 bg-dark text-white d-flex flex-column shadow"
      style={{
        width: "250px",
        height: "100vh",
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <div className="px-4 py-4 border-bottom border-secondary">
        <h4 className="fw-bold mb-1">
          Accounts
        </h4>

        <small className="text-secondary">
          Management System
        </small>
      </div>

      {/* Menu */}
      <nav className="flex-grow-1 overflow-auto px-3 py-4">
        <small className="text-secondary text-uppercase fw-semibold px-3">
          Main Menu
        </small>

        <div className="mt-3">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.path ||
              pathname.startsWith(`${item.path}/`);

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`d-flex align-items-center text-decoration-none rounded px-3 py-3 mb-2 ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-white"
                }`}
                style={{
                  gap: "14px",
                  transition: "all 0.2s ease",
                }}
              >
                <span
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: "22px",
                    minWidth: "22px",
                    fontSize: "15px",
                  }}
                >
                  {item.icon}
                </span>

                <span
                  className="fw-medium"
                  style={{
                    fontSize: "15px",
                  }}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-top border-secondary px-4 py-3">
        <small className="text-secondary">
          © 2026 Accounts
        </small>
      </div>
    </aside>
  );
}