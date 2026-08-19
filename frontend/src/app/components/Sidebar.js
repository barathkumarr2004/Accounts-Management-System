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
      name: "ChartsOfAccounts",
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
  ];

  return (
    <div
      className="bg-dark text-white min-vh-100 p-3"
      style={{ width: "250px" }}
    >
      <h4 className="mb-1">Accounts</h4>

      <small className="text-secondary">
        Management System
      </small>

      <div className="mt-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`d-block text-decoration-none rounded px-3 py-2 mb-2 ${
              pathname === item.path
                ? "bg-primary text-white"
                : "text-white"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
