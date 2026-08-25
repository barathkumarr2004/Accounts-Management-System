'use client'; 
import Link from 'next/link';

export default function Dashboard() {
  const today = new Date();
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-GB', options).replace(/ /g, '-');  //global space to -
  
  const menuItems = [
    { name: 'Chart of Accounts', desc: 'View all Natures, Groups & Ledgers', link: '/chartsofaccounts', icon: 'bi-bar-chart-fill' },
    { name: 'Groups', desc: 'Create & Manage Groups', link: '/groups', icon: 'bi-folder-fill' },
    { name: 'Ledgers', desc: 'Create & Manage Ledgers', link: '/ledgers', icon: 'bi-journal-bookmark-fill' },
    { name: 'Journal Voucher', desc: 'Enter Journal Entries', link: '/journal', icon: 'bi-receipt-cutoff' },
    { name: 'Day Book', desc: 'View Daily Transactions', link: '/daybook', icon: 'bi-calendar-date-fill' },
    { name: 'Balance sheet', desc: 'xxxxxxx', link: '/balancesheet', icon: 'bi-calendar-date-fill' },
  ];

  return (
    <div className="p-4 bg-light min-vh-100">
      <h1 className="h3 fw-bold mb-2">Dashboard</h1>
      <p className="text-muted mb-4">Welcome! Select any option to get started</p>
      
      <div className="row g-3">
        {menuItems.map((item) => (
          <div className="col-12 col-md-6 col-lg-4" key={item.name}>
            <Link 
              href={item.link} 
              className="text-decoration-none text-dark"
            >
              <div className="card h-100 shadow-sm border transition hover:-translate-y-1 hover:shadow-lg">
                <div className="card-body d-flex align-items-center gap-3">
                  <i className={`bi ${item.icon} fs-2 text-primary`}></i>
                  <div>
                    <h5 className="card-title fw-bold mb-1">{item.name}</h5>
                    <p className="card-text text-muted small mb-0">{item.desc}</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>


      

      <div className="mt-4 bg-white p-4 rounded-lg shadow text-center">
        <p className="text-gray-600 mb-0">
          Financial Year: <b>2026-2027</b> | Today: <b>{formattedDate}</b>
        </p>
      </div>
    </div>
  )
}