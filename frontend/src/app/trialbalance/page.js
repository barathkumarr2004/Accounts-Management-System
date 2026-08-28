// // "use client";
// // import { useEffect, useState } from "react";
// // import axios from "axios";

// // // Backend URL da!
// // const API_URL = "http://localhost:5000";

// // export default function TrialBalancePage() {
// //   const [data, setData] = useState([]);
// //   const [totals, setTotals] = useState({ totalDebit: 0, totalCredit: 0 });
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     // ✅ axios + correct URL
// //     axios.get(`${API_URL}/api/trialbalance`)
// //       .then(res => {
// //         console.log("API Response:", res.data); // F12 console la paaru da!
// //         setData(res.data.data || []);
// //         setTotals({ 
// //           totalDebit: res.data.totalDebit || 0, 
// //           totalCredit: res.data.totalCredit || 0 
// //         });
// //         setLoading(false);
// //       })
// //       .catch(err => {
// //         console.error("Trial Balance Error:", err);
// //         setLoading(false);
// //       });
// //   }, []);

// //   const handleLedgerClick = async (ledger) => {
// //     try {
// //       // ✅ axios + correct URL
// //       const res = await axios.get(`${API_URL}/api/ledgers/${ledger.id}/vouchers`);
// //       console.log("Vouchers:", res.data);
// //       // Modal la kaamikkalama illa page maathalama nu un choice da!
// //       alert(JSON.stringify(res.data, null, 2)); // Temporary ah alert la kaamikuren
// //     } catch (err) {
// //       console.error(err);
// //     }
// //   };

// //   if (loading) return <p>Loading Trial Balance...</p>;

// //   return (
// //     <div style={{ padding: '20px' }}>
// //       <h2>Trial Balance</h2>
// //       <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
// //         <thead>
// //           <tr style={{ background: '#f0f0f0' }}>
// //             <th>Particulars</th>
// //             <th>Debit</th>
// //             <th>Credit</th>
// //             <th>View</th>
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {data.length === 0 ? (
// //             <tr><td colSpan="4" style={{ textAlign: 'center' }}>No data - Check journal_entries table da!</td></tr>
// //           ) : (
// //             data.map(row => (
// //               <tr key={row.id}>
// //                 <td onClick={() => handleLedgerClick(row)} style={{ cursor: 'pointer', color: 'blue' }}>
// //                   {row.name}
// //                 </td>
// //                 <td>{row.debit ? Number(row.debit).toFixed(2) : ''}</td>
// //                 <td>{row.credit ? Number(row.credit).toFixed(2) : ''}</td>
// //                 <td>
// //                   <button onClick={() => window.location.href = `/journal/${row.id}`}>
// //                     View
// //                   </button>
// //                 </td>
// //               </tr>
// //             ))
// //           )}
// //           <tr style={{ fontWeight: 'bold', background: '#e0e0e0' }}>
// //             <td>Grand Total</td>
// //             <td>{Number(totals.totalDebit).toFixed(2)}</td>
// //             <td>{Number(totals.totalCredit).toFixed(2)}</td>
// //             <td></td>
// //           </tr>
// //         </tbody>
// //       </table>
// //     </div>
// //   );
// // }



// "use client";
// import { useEffect, useState } from "react";
// import axios from "axios";

// const API_URL = "http://localhost:5000";

// export default function TrialBalancePage() {
//   const [data, setData] = useState([]);
//   const [totals, setTotals] = useState({ totalDebit: 0, totalCredit: 0 });
  
//   // Modal ku da!
//   const [selectedLedger, setSelectedLedger] = useState(null);
//   const [vouchers, setVouchers] = useState([]);
//   const [showModal, setShowModal] = useState(false);

//   useEffect(() => {
//     axios.get(`${API_URL}/api/trialbalance`)
//       .then(res => {
//         setData(res.data.data || []);
//         setTotals({ totalDebit: res.data.totalDebit, totalCredit: res.data.totalCredit });
//       });
//   }, []);

//   // ✅ Ledger click panna ithu than work aagum - 404 fix!
//   const handleLedgerClick = async (ledger) => {
//     try {
//       setSelectedLedger(ledger);
//       // Balance sheet la enna route use panni irukka? Athuve than da! Check pannu da!
//       // Rendu possibility irukku, rendu la onnu work aagum
//       const res = await axios.get(`${API_URL}/api/ledgers/${ledger.id}/vouchers`);
//       // Illana intha route try pannu: /api/journal/ledger/${ledger.id}
      
//       setVouchers(res.data.data || res.data || []);
//       setShowModal(true); // Modal ah open pannu da!
//     } catch (err) {
//       console.error(err);
//       alert("Vouchers not found! Backend route check pannu da! Console la 404 path varum");
//     }
//   };

//   return (
//     <div style={{ padding: '20px' }}>
//       <h2>Trial Balance</h2>
//       <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
//         <thead>
//           <tr>
//             <th>Particulars</th>
//             <th>Debit</th>
//             <th>Credit</th>
//           </tr>
//         </thead>
//         <tbody>
//           {data.map(row => (
//             <tr key={row.id}>
//               <td onClick={() => handleLedgerClick(row)} style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>
//                 {row.name}
//               </td>
//               <td>{row.debit ? Number(row.debit).toFixed(2) : ''}</td>
//               <td>{row.credit ? Number(row.credit).toFixed(2) : ''}</td>
//             </tr>
//           ))}
//           <tr style={{ fontWeight: 'bold', background: '#e0e0e0' }}>
//             <td>Grand Total</td>
//             <td>{Number(totals.totalDebit).toFixed(2)}</td>
//             <td>{Number(totals.totalCredit).toFixed(2)}</td>
//           </tr>
//         </tbody>
//       </table>

//       {/* ✅ BALANCE SHEET MAARI MODAL DA! Ithu than nee ketta prompt! */}
//       {showModal && (
//         <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
//           <div style={{ background: 'white', padding: '20px', width: '80%', maxHeight: '80%', overflowY: 'auto' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//               <h3>{selectedLedger?.name} - Vouchers</h3>
//               <button onClick={() => setShowModal(false)} style={{ background: 'red', color: 'white' }}>Close</button>
//             </div>
//             <table border="1" cellPadding="8" style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse' }}>
//               <thead>
//                 <tr style={{ background: '#1a2a4a', color: 'white' }}>
//                   <th>Voucher No</th>
//                   <th>Date</th>
//                   <th>Narration</th>
//                   <th>Debit</th>
//                   <th>Credit</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {vouchers.map(v => (
//                   <tr key={v.id || v.voucher_id}>
//                     <td>{v.voucher_no || v.VoucherNo || v.id}</td>
//                     <td>{v.date ? new Date(v.date).toLocaleDateString() : ''}</td>
//                     <td>{v.narration || v.Narration}</td>
//                     <td>{v.debit || 0}</td>
//                     <td>{v.credit || 0}</td>
//                     <td>
//                       {/* ✅ View button ippa modal kulla! Ithu than correct! */}
//                       <button 
//                         onClick={() => window.location.href = `/journal/${v.voucher_id || v.id}`}
//                         style={{ background: '#00d0c0', padding: '5px 10px' }}
//                       >
//                         View
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



"use client";
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000";

export default function TrialBalancePage() {
  const [data, setData] = useState([]);
  const [totals, setTotals] = useState({ totalDebit: 0, totalCredit: 0 });
  const [selectedLedger, setSelectedLedger] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/api/trialbalance`).then(res => {
      setData(res.data.data || []);
      setTotals({ totalDebit: res.data.totalDebit || 0, totalCredit: res.data.totalCredit || 0 });
    });
  }, []);

  const handleLedgerClick = async (ledger) => {
    try {
      setSelectedLedger(ledger);
      // ✅ CORRECT URL - id than!
      const res = await axios.get(`${API_URL}/api/trialbalance/${ledger.id}/vouchers`);
      const list = res.data.data || res.data.vouchers || [];
      setVouchers(list);
      setShowModal(true);
      if(list.length === 0) console.log(`ID ${ledger.id} ku voucher illa`);
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Trial Balance</h2>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th>Particulars</th><th>Debit</th><th>Credit</th></tr></thead>
        <tbody>
          {data.map(row => (
            <tr key={row.id}>
              <td onClick={() => handleLedgerClick(row)} style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>{row.name}</td>
              <td>{row.debit ? Number(row.debit).toFixed(2) : ''}</td>
              <td>{row.credit ? Number(row.credit).toFixed(2) : ''}</td>
            </tr>
          ))}
          <tr style={{ fontWeight: 'bold', background: '#e0e0e0' }}><td>Grand Total</td><td>{Number(totals.totalDebit).toFixed(2)}</td><td>{Number(totals.totalCredit).toFixed(2)}</td></tr>
        </tbody>
      </table>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '20px', width: '85%', maxHeight: '80%', overflowY: 'auto', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3>{selectedLedger?.name} - Vouchers</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'red', color: 'white' }}>Close</button>
            </div>
            <table border="1" cellPadding="8" style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#1a2a4a', color: 'white' }}><th>Voucher No</th><th>Date</th><th>Narration</th><th>Debit</th><th>Credit</th><th>Action</th></tr></thead>
              <tbody>
                {vouchers.length === 0 ? <tr><td colSpan="6" style={{ textAlign: 'center' }}>No vouchers for this ledger</td></tr> : vouchers.map(v => (
                  <tr key={v.id}>
                    {/* ✅ unga DB la voucher_number, voucher_date than! */}
                    <td>{v.voucher_number || v.voucher_no || v.id}</td>
                    <td>{v.voucher_date ? new Date(v.voucher_date).toLocaleDateString() : (v.date ? new Date(v.date).toLocaleDateString() : '')}</td>
                    <td>{v.narration}</td>
                    <td>{v.debit || 0}</td>
                    <td>{v.credit || 0}</td>
                    <td><button onClick={() => window.location.href = `/journal/${v.voucher_id}`} style={{ background: '#00d0c0', padding: '5px 10px' }}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}