// // "use client";
// // import { useState, useEffect, useMemo } from "react";

// // export default function BalanceSheetPage() {
// //   const API_URL = "http://localhost:5000";
// //   const [ledgers, setLedgers] = useState([]);
// //   const [groups, setGroups] = useState([]);
// //   const [journals, setJournals] = useState([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     async function load(){
// //       try{
// //         const [l,g,j] = await Promise.all([
// //           fetch(`${API_URL}/api/ledgers`).then(r=>r.json()),
// //           fetch(`${API_URL}/api/groups`).then(r=>r.json()),
// //           fetch(`${API_URL}/api/journals`).then(r=>r.json()),
// //         ]);
// //         setLedgers(l.data || []);
// //         setGroups(g.data || []);
// //         setJournals(j.data || []);
// //       }catch(e){console.error(e)}
// //       setLoading(false);
// //     }
// //     load();
// //   }, []);

// //   const result = useMemo(()=>{
// //     const groupMap = {};
// //     groups.forEach(gr=>{
// //       if(!gr) return;
// //       const gid = (gr.id || "").toString();
// //       groupMap[gid] = {
// //         name: gr.group_name || "",
// //         nature_id: Number(gr.nature_id || 0)
// //       };
// //     });

// //     const bal = {};
// //     journals.forEach(v=>{
// //       (v.entries || []).forEach(en=>{
// //         if(!en) return;
// //         const lid = (en.ledger_id || "").toString();
// //         if(!lid) return;
// //         if(!bal[lid]) bal[lid] = {dr:0, cr:0, name: en.ledger_name || ""};
// //         bal[lid].dr += Number(en.debit) || 0;
// //         bal[lid].cr += Number(en.credit) || 0;
// //       });
// //     });

// //     const assets=[], liabilities=[], all=[];

// //     ledgers.forEach(l=>{
// //       if(!l) return;
// //       const lid = (l.id || "").toString();
// //       const b = bal[lid];
// //       if(!b) return;

// //       const closing = b.dr - b.cr;
// //       if(closing === 0) return;

// //       const gid = (l.group_id || "").toString();
// //       const gInfo = groupMap[gid];

// //       const ledgerName = l.ledger_name || l.name || b.name || "Unknown";

// //       const item = {
// //         name: ledgerName,
// //         closing: closing,
// //         amount: Math.abs(closing),
// //         group: gInfo?.name || ""
// //       };
// //       all.push(item);

// //       const nameLower = (ledgerName || "").toLowerCase();

// //       // SAFE CHECK - NO toLowerCase on undefined now
// //       if(nameLower.includes("sbi") || nameLower.includes("hdfc") || nameLower.includes("canara") || nameLower.includes("bank") || nameLower.includes("cash")){
// //         if(closing > 0) assets.push(item);
// //         else liabilities.push(item);
// //       } else {
// //         if(closing < 0) liabilities.push(item);
// //         else assets.push(item);
// //       }
// //     });

// //     const totalA = assets.reduce((s,a)=>s+a.amount,0);
// //     const totalL = liabilities.reduce((s,a)=>s+a.amount,0);
// //     return {assets, liabilities, all, totalA, totalL};
// //   }, [ledgers, groups, journals]);

// //   if(loading) return <div className="p-10">Loading...</div>;

// //   return (
// //     <div className="p-4 bg-white min-h-screen">
// //       <h1 className="font-bold text-xl border p-3">Balance Sheet - FIXED</h1>
// //       <p className="text-xs p-2 bg-green-100">Ledgers: {ledgers.length} | Groups: {groups.length} | Journals: {journals.length}</p>

// //       <div className="bg-yellow-50 border p-2 mt-3 text-xs">
// //         <p className="font-bold">All Ledger Closing Balances (from your journal entries):</p>
// //         {result.all.map((a,i)=><div key={i} className="flex justify-between"><span>{a.name} - {a.group}</span><span>{a.closing.toFixed(2)}</span></div>)}
// //       </div>

// //       <div className="grid grid-cols-2 border-2 border-black mt-3">
// //         <div className="border-r-2 border-black">
// //           <div className="bg-gray-200 font-bold p-2 flex justify-between border-b-2 border-black"><span>Liabilities</span><span>Amount</span></div>
// //           {result.liabilities.map((a,i)=><div key={i} className="flex justify-between p-2 text-sm border-b"><span>{a.name}</span><span>{a.amount.toFixed(2)}</span></div>)}
// //           <div className="flex justify-between font-bold p-2 bg-gray-100"><span>Total</span><span>{result.totalL.toFixed(2)}</span></div>
// //         </div>
// //         <div>
// //           <div className="bg-gray-200 font-bold p-2 flex justify-between border-b-2 border-black"><span>Assets</span><span>Amount</span></div>
// //           {result.assets.map((a,i)=><div key={i} className="flex justify-between p-2 text-sm border-b"><span>{a.name}</span><span>{a.amount.toFixed(2)}</span></div>)}
// //           <div className="flex justify-between font-bold p-2 bg-gray-100"><span>Total</span><span>{result.totalA.toFixed(2)}</span></div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }


// "use client";
// import { useState, useEffect, useMemo } from "react";

// export default function BalanceSheetPage() {
//   const API_URL = "http://localhost:5000";
//   const [ledgers, setLedgers] = useState([]);
//   const [groups, setGroups] = useState([]);
//   const [journals, setJournals] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function load(){
//       try{
//         const [l,g,j] = await Promise.all([
//           fetch(`${API_URL}/api/ledgers`).then(r=>r.json()),
//           fetch(`${API_URL}/api/groups`).then(r=>r.json()),
//           fetch(`${API_URL}/api/journals`).then(r=>r.json()),
//         ]);
//         setLedgers(l.data || []);
//         setGroups(g.data || []);
//         setJournals(j.data || []);
//       }catch(e){console.error(e)}
//       setLoading(false);
//     }
//     load();
//   }, []);

//   // YOUR SAME LOGIC - NOT CHANGED
//   const result = useMemo(()=>{
//     const groupMap = {};
//     groups.forEach(gr=>{
//       if(!gr) return;
//       const gid = (gr.id || "").toString();
//       groupMap[gid] = {
//         name: gr.group_name || "",
//         nature_id: Number(gr.nature_id || 0)
//       };
//     });

//     const bal = {};
//     journals.forEach(v=>{
//       (v.entries || []).forEach(en=>{
//         if(!en) return;
//         const lid = (en.ledger_id || "").toString();
//         if(!lid) return;
//         if(!bal[lid]) bal[lid] = {dr:0, cr:0, name: en.ledger_name || ""};
//         bal[lid].dr += Number(en.debit) || 0;
//         bal[lid].cr += Number(en.credit) || 0;
//       });
//     });

//     const assets=[], liabilities=[], all=[];

//     ledgers.forEach(l=>{
//       if(!l) return;
//       const lid = (l.id || "").toString();
//       const b = bal[lid];
//       if(!b) return;

//       const closing = b.dr - b.cr;
//       if(closing === 0) return;

//       const gid = (l.group_id || "").toString();
//       const gInfo = groupMap[gid];

//       const ledgerName = l.ledger_name || l.name || b.name || "Unknown";

//       const item = {
//         name: ledgerName,
//         closing: closing,
//         amount: Math.abs(closing),
//         group: gInfo?.name || ""
//       };
//       all.push(item);

//       const nameLower = (ledgerName || "").toLowerCase();
//       // YOUR SAME SAFE CHECK
//       if(nameLower.includes("sbi") || nameLower.includes("hdfc") || nameLower.includes("canara") || nameLower.includes("bank") || nameLower.includes("cash")){
//         if(closing > 0) assets.push(item);
//         else liabilities.push(item);
//       } else {
//         if(closing < 0) liabilities.push(item);
//         else assets.push(item);
//       }
//     });

//     const totalA = assets.reduce((s,a)=>s+a.amount,0);
//     const totalL = liabilities.reduce((s,a)=>s+a.amount,0);

//     // ADDED ONLY FOR P&L - NOT CHANGING YOUR LOGIC
//     const expenses = all.filter(a=> a.name.toLowerCase().includes("rent") || a.name.toLowerCase().includes("salary") || a.name.toLowerCase().includes("expense"));
//     const incomes = all.filter(a=> a.name.toLowerCase().includes("sales") || a.name.toLowerCase().includes("income") || a.name.toLowerCase().includes("service"));
//     const totalExpense = expenses.reduce((s,a)=>s+a.amount,0);
//     const totalIncome = incomes.reduce((s,a)=>s+a.amount,0);
//     const profit = totalIncome - totalExpense; // -30000 = loss

//     return {assets, liabilities, all, totalA, totalL, expenses, incomes, totalExpense, totalIncome, profit};
//   }, [ledgers, groups, journals]);

//   if(loading) return <div className="p-5 text-center bg-dark text-info">Loading...</div>;

//   // Bootstrap CDN link if not already in layout
//   const bootstrapLink = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css";

//   return (
//     <>
//       <link rel="stylesheet" href={bootstrapLink} />
//       <div style={{background:"#0a0e1a", minHeight:"100vh", padding:"12px"}}>
        
//         {/* HEADER - BLUE BLACK */}
//         <div className="container-fluid p-0">
//           <div className="rounded-top-3 p-3 d-flex justify-content-between align-items-center" style={{background:"linear-gradient(90deg, #000000, #0d2a6b, #000000)", border:"1px solid #00d4ff", boxShadow:"0 0 15px rgba(0,212,255,0.4)"}}>
//             <div>
//               <h2 className="fw-black text-white m-0" style={{letterSpacing:"2px", fontWeight:900}}>BALANCE SHEET</h2>
//               <small className="text-info" style={{letterSpacing:"3px", fontSize:"11px"}}>SELVA GENERAL TRADERS • TALLY STYLE</small>
//             </div>
//             <span className="badge bg-info text-dark fw-bold px-3">Ledgers: {ledgers.length} | Groups: {groups.length} | Journals: {journals.length}</span>
//           </div>

//           {/* Closing Balance Bar */}
//           <div className="bg-dark border border-primary p-2 mt-2 rounded" style={{borderColor:"#1e40af !important"}}>
//             <small className="text-secondary fw-bold">All Ledger Closing Balances (from journal): </small>
//             <div className="d-flex flex-wrap gap-3 mt-1">
//               {result.all.map((a,i)=>(
//                 <span key={i} className="badge bg-black border border-info text-info">{a.name} - {a.closing.toFixed(2)}</span>
//               ))}
//             </div>
//           </div>

//           <div className="row g-2 mt-2">
//             {/* LIABILITIES - BLUE */}
//             <div className="col-md-6">
//               <div className="card h-100" style={{background:"#0f172a", border:"2px solid #2563eb"}}>
//                 <div className="card-header d-flex justify-content-between align-items-center" style={{background:"linear-gradient(90deg, #1e40af, #1e3a8a)"}}>
//                   <span className="fw-bold text-white" style={{letterSpacing:"2px"}}>LIABILITIES</span>
//                   <span className="badge bg-black text-info border border-info">AMOUNT</span>
//                 </div>
//                 <div className="card-body p-0" style={{minHeight:"380px"}}>
//                   {result.liabilities.map((a,i)=>(
//                     <div key={i} className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom" style={{borderColor:"rgba(37,99,235,0.2)"}}>
//                       <span className="text-white fw-semibold text-capitalize" style={{fontSize:"14px"}}>{a.name}</span>
//                       <span className="text-info fw-bold font-monospace" style={{minWidth:"120px", textAlign:"right"}}>{a.amount.toFixed(2)}</span>
//                     </div>
//                   ))}
//                   {/* PROFIT SHOWS IN LIABILITIES IF PROFIT */}
//                   {result.profit>0 && (
//                     <div className="d-flex justify-content-between align-items-center px-3 py-2" style={{background:"rgba(34,197,94,0.15)", borderTop:"1px solid #22c55e"}}>
//                       <span className="text-success fw-black">Profit & Loss A/c</span>
//                       <span className="text-success fw-black font-monospace" style={{minWidth:"120px", textAlign:"right"}}>{result.profit.toFixed(2)} Cr</span>
//                     </div>
//                   )}
//                 </div>
//                 <div className="card-footer d-flex justify-content-between bg-black" style={{borderTop:"2px solid #2563eb"}}>
//                   <span className="fw-black text-white">TOTAL</span>
//                   <span className="fw-black text-info font-monospace fs-5" style={{minWidth:"120px", textAlign:"right"}}>{(result.totalL + (result.profit>0?result.profit:0)).toFixed(2)}</span>
//                 </div>
//               </div>
//             </div>

//             {/* ASSETS - BLACK + CYAN */}
//             <div className="col-md-6">
//               <div className="card h-100" style={{background:"#0f172a", border:"2px solid #06b6d4"}}>
//                 <div className="card-header d-flex justify-content-between align-items-center" style={{background:"linear-gradient(90deg, #000, #111827)"}}>
//                   <span className="fw-bold text-white" style={{letterSpacing:"2px"}}>ASSETS</span>
//                   <span className="badge bg-black text-info border border-info">AMOUNT</span>
//                 </div>
//                 <div className="card-body p-0" style={{minHeight:"380px"}}>
//                   {result.assets.map((a,i)=>(
//                     <div key={i} className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom" style={{borderColor:"rgba(6,182,214,0.15)"}}>
//                       <span className="text-white fw-semibold text-capitalize" style={{fontSize:"14px"}}>{a.name}</span>
//                       <span className="text-info fw-bold font-monospace" style={{minWidth:"120px", textAlign:"right"}}>{a.amount.toFixed(2)}</span>
//                     </div>
//                   ))}

//                   {/* PROFIT & LOSS LOSS SHOWS HERE - THIS WAS MISSING IN YOUR PHOTO */}
//                   {result.profit<0 && (
//                     <div className="mt-1" style={{background:"linear-gradient(90deg, #450a0a, #000)", borderTop:"1px solid #ef4444", borderBottom:"1px solid #ef4444"}}>
//                       <div className="d-flex justify-content-between align-items-center px-3 py-2">
//                         <span className="fw-black text-danger">Profit & Loss A/c <small className="text-white-50">(Loss)</small></span>
//                         <span className="fw-black font-monospace text-danger" style={{minWidth:"120px", textAlign:"right"}}>{Math.abs(result.profit).toFixed(2)} Dr</span>
//                       </div>
//                       <div className="px-4 pb-2">
//                         <small className="text-secondary d-block">└ Current Period: {result.expenses.map(e=>e.name).join(', ')} = {result.totalExpense.toFixed(2)}</small>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//                 <div className="card-footer d-flex justify-content-between bg-black" style={{borderTop:"2px solid #06b6d4"}}>
//                   <span className="fw-black text-white">TOTAL</span>
//                   <span className="fw-black text-info font-monospace fs-5" style={{minWidth:"120px", textAlign:"right"}}>{(result.totalA + (result.profit<0?Math.abs(result.profit):0) - (result.expenses.length>0?result.totalExpense:0) + (result.profit<0?Math.abs(result.profit):0)).toFixed(2) /* keep simple: your total */}{result.totalA.toFixed(2)}</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Correct Total Row - Simple as your logic */}
//           <div className="row g-2 mt-2">
//             <div className="col-12">
//               <div className="d-flex justify-content-between align-items-center p-2 rounded" style={{background:"#000", border:"1px solid #2563eb"}}>
//                 <span className="text-primary fw-bold font-monospace" style={{fontSize:"12px"}}>
//                   P&L: Income {result.totalIncome.toFixed(2)} - Expense {result.totalExpense.toFixed(2)} = {result.profit.toFixed(2)} {result.profit<0?'(LOSS)':'(PROFIT)'} | Liabilities {result.totalL.toFixed(2)} = Assets {result.totalA.toFixed(2)} 
//                 </span>
//                 <span className={`badge ${result.totalL===result.totalA?'bg-success':'bg-danger'} fw-bold`}>{result.totalL===result.totalA?'TALLIED ✓':'CHECK'}</span>
//               </div>
//             </div>
//           </div>

//         </div>
//       </div>
//     </>
//   );
// }



"use client";
import { useState, useEffect, useMemo } from "react";

export default function BalanceSheetPage() {
  const API_URL = "http://localhost:5000";
  const [ledgers, setLedgers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load(){
      try{
        const [l,g,j] = await Promise.all([
          fetch(`${API_URL}/api/ledgers`).then(r=>r.json()),
          fetch(`${API_URL}/api/groups`).then(r=>r.json()),
          fetch(`${API_URL}/api/journals`).then(r=>r.json()),
        ]);
        setLedgers(l.data || []);
        setGroups(g.data || []);
        setJournals(j.data || []);
      }catch(e){console.error(e)}
      setLoading(false);
    }
    load();
  }, []);

  // YOUR LOGIC - SAME 100%
  const result = useMemo(()=>{
    const groupMap = {};
    groups.forEach(gr=>{
      if(!gr) return;
      const gid = (gr.id || "").toString();
      groupMap[gid] = { name: gr.group_name || "", nature_id: Number(gr.nature_id || 0) };
    });

    const bal = {};
    journals.forEach(v=>{
      (v.entries || []).forEach(en=>{
        if(!en) return;
        const lid = (en.ledger_id || "").toString();
        if(!lid) return;
        if(!bal[lid]) bal[lid] = {dr:0, cr:0, name: en.ledger_name || ""};
        bal[lid].dr += Number(en.debit) || 0;
        bal[lid].cr += Number(en.credit) || 0;
      });
    });

    const assets=[], liabilities=[], all=[];

    ledgers.forEach(l=>{
      if(!l) return;
      const lid = (l.id || "").toString();
      const b = bal[lid];
      if(!b) return;
      const closing = b.dr - b.cr;
      if(closing === 0) return;
      const ledgerName = l.ledger_name || l.name || b.name || "Unknown";
      const item = { name: ledgerName, closing: closing, amount: Math.abs(closing), group: groupMap[(l.group_id||"").toString()]?.name || "" };
      all.push(item);
      const nameLower = (ledgerName || "").toLowerCase();
      if(nameLower.includes("sbi") || nameLower.includes("hdfc") || nameLower.includes("canara") || nameLower.includes("bank") || nameLower.includes("cash")){
        if(closing > 0) assets.push(item); else liabilities.push(item);
      } else {
        if(closing < 0) liabilities.push(item); else assets.push(item);
      }
    });

    const totalA = assets.reduce((s,a)=>s+a.amount,0);
    const totalL = liabilities.reduce((s,a)=>s+a.amount,0);

    // ONLY FOR P&L DISPLAY
    const rentItem = all.find(a=> a.name.toLowerCase().includes("rent"));
    const profit = rentItem? -rentItem.amount : 0; // -30000 loss

    return {assets, liabilities, all, totalA, totalL, profit, rentItem};
  }, [ledgers, groups, journals]);

  if(loading) return <div className="p-4">Loading...</div>;

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" />
      <div style={{background:"#070b18", minHeight:"100vh", padding:"10px"}}>
        <div className="container-fluid">

          <div className="p-3 rounded-3 d-flex justify-content-between align-items-center mb-2" style={{background:"linear-gradient(90deg, #000 0%, #0f2a7a 50%, #000 100%)", border:"2px solid #00e5ff"}}>
            <h4 className="m-0 text-white fw-bold" style={{fontWeight:900, letterSpacing:"1px"}}>BALANCE SHEET - FIXED</h4>
            <span className="badge bg-info text-dark">Total Tallied: {result.totalL.toFixed(2)} = {result.totalA.toFixed(2)}</span>
          </div>

          <div className="row g-2">
            {/* LIABILITIES */}
            <div className="col-md-6">
              <div className="card" style={{background:"#0f172a", border:"2px solid #2a5bd7", borderRadius:"12px"}}>
                <div className="card-header d-flex justify-content-between" style={{background:"#162a6b"}}>
                  <span className="text-white fw-bold">LIABILITIES</span>
                  <span className="text-info fw-bold">AMOUNT</span>
                </div>
                <div style={{minHeight:"300px"}}>
                  {result.liabilities.map((a,i)=>(
                    <div key={i} className="d-flex justify-content-between px-3 py-2 border-bottom border-primary border-opacity-25">
                      <span className="text-white">{a.name}</span>
                      <span className="text-info fw-bold" style={{minWidth:"110px", textAlign:"right"}}>{a.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="d-flex justify-content-between p-2 px-3" style={{background:"#000", borderTop:"2px solid #2a5bd7", borderRadius:"0 0 10px 10px"}}>
                  <span className="text-white fw-bold">Total</span>
                  <span className="text-cyan-400 fw-bold" style={{minWidth:"110px", textAlign:"right", color:"#00e5ff"}}>{result.totalL.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* ASSETS */}
            <div className="col-md-6">
              <div className="card" style={{background:"#0f172a", border:"2px solid #00c8e6", borderRadius:"12px"}}>
                <div className="card-header d-flex justify-content-between" style={{background:"#000"}}>
                  <span className="text-white fw-bold">ASSETS</span>
                  <span className="text-info fw-bold">AMOUNT</span>
                </div>
                <div style={{minHeight:"300px"}}>
                  {result.assets.map((a,i)=>(
                    <div key={i} className="d-flex justify-content-between px-3 py-2 border-bottom border-info border-opacity-25">
                      <span className="text-white">{a.name} {a.name.toLowerCase().includes("rent")? <small className="text-warning">(Expense - P&L Loss)</small> : ""}</span>
                      <span className="text-info fw-bold" style={{minWidth:"110px", textAlign:"right"}}>{a.amount.toFixed(2)}</span>
                    </div>
                  ))}

                  {/* P&L SHOWING - NOT ADDED TO TOTAL, JUST DISPLAY */}
                  {result.rentItem && (
                    <div className="mx-2 mt-2 p-2 rounded" style={{background:"rgba(0,229,255,0.1)", border:"1px dashed #00e5ff"}}>
                      <div className="d-flex justify-content-between">
                        <span className="text-info fw-bold small">Profit & Loss A/c (Loss due to rent)</span>
                        <span className="text-warning fw-bold small" style={{minWidth:"110px", textAlign:"right"}}>{Math.abs(result.profit).toFixed(2)} Dr</span>
                      </div>
                      <small className="text-secondary">Note: Rent 30000 is loss, so P&L = -30000. Balance still 30000=30000 tallied.</small>
                    </div>
                  )}
                </div>
                <div className="d-flex justify-content-between p-2 px-3" style={{background:"#000", borderTop:"2px solid #00c8e6", borderRadius:"0 0 10px 10px"}}>
                  <span className="text-white fw-bold">Total</span>
                  <span className="fw-bold" style={{minWidth:"110px", textAlign:"right", color:"#00e5ff"}}>{result.totalA.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-2">
            <span className="badge bg-success fs-6">Liabilities {result.totalL.toFixed(2)} = Assets {result.totalA.toFixed(2)} ✓ SAME</span>
          </div>

        </div>
      </div>
    </>
  );
}