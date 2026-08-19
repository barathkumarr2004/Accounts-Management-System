import Link from 'next/link';

export default function Dashboard() {
  const menuItems = [
    { name: 'Chart of Accounts', desc: 'View all Natures, Groups & Ledgers', link: '/chartsofaccounts', icon: '📊' },
    { name: 'Groups', desc: 'Create & Manage Groups', link: '/groups', icon: '📁' },
    { name: 'Ledgers', desc: 'Create & Manage Ledgers', link: '/ledgers', icon: '📒' },
    { name: 'Journal Voucher', desc: 'Enter Journal Entries', link: '/journal', icon: '🧾' },
    { name: 'Day Book', desc: 'View Daily Transactions', link: '/daybook', icon: '📅' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome! Select any option to get started</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {menuItems.map((item) => (
          <Link href={item.link} key={item.name}>
            <div 
              className="bg-white p-5 rounded-xl shadow hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer border-gray-200" 
              style={{ textDecoration: 'none' }} // 👈 div ku direct ah podurom
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">{item.icon}</div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800" style={{ textDecoration: 'none' }}>{item.name}</h3>
                  <p className="text-gray-500 text-sm" style={{ textDecoration: 'none' }}>{item.desc}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 bg-white p-4 rounded-lg shadow text-center">
         <p className="text-gray-600">Financial Year: <b>2026-2027</b> | Today: <b>19-Aug-2026</b></p>
       </div>
     </div>
   )
 }
    
  
