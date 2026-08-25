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

// //   // YOUR LOGIC - SAME 100%
// //   const result = useMemo(()=>{
// //     const groupMap = {};
// //     groups.forEach(gr=>{
// //       if(!gr) return;
// //       const gid = (gr.id || "").toString();
// //       groupMap[gid] = { name: gr.group_name || "", nature_id: Number(gr.nature_id || 0) };
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
// //       const ledgerName = l.ledger_name || l.name || b.name || "Unknown";
// //       const item = { name: ledgerName, closing: closing, amount: Math.abs(closing), group: groupMap[(l.group_id||"").toString()]?.name || "" };
// //       all.push(item);
// //       const nameLower = (ledgerName || "").toLowerCase();
// //       if(nameLower.includes("sbi") || nameLower.includes("hdfc") || nameLower.includes("canara") || nameLower.includes("bank") || nameLower.includes("cash")){
// //         if(closing > 0) assets.push(item); else liabilities.push(item);
// //       } else {
// //         if(closing < 0) liabilities.push(item); else assets.push(item);
// //       }
// //     });

// //     const totalA = assets.reduce((s,a)=>s+a.amount,0);
// //     const totalL = liabilities.reduce((s,a)=>s+a.amount,0);

// //     // ONLY FOR P&L DISPLAY
// //     const rentItem = all.find(a=> a.name.toLowerCase().includes("rent"));
// //     const profit = rentItem? -rentItem.amount : 0; // -30000 loss

// //     return {assets, liabilities, all, totalA, totalL, profit, rentItem};
// //   }, [ledgers, groups, journals]);

// //   if(loading) return <div className="p-4">Loading...</div>;

// //   return (
// //     <>
// //       <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" />
// //       <div style={{background:"#070b18", minHeight:"100vh", padding:"10px"}}>
// //         <div className="container-fluid">

// //           <div className="p-3 rounded-3 d-flex justify-content-between align-items-center mb-2" style={{background:"linear-gradient(90deg, #000 0%, #0f2a7a 50%, #000 100%)", border:"2px solid #00e5ff"}}>
// //             <h4 className="m-0 text-white fw-bold" style={{fontWeight:900, letterSpacing:"1px"}}>BALANCE SHEET - FIXED</h4>
// //             <span className="badge bg-info text-dark">Total Tallied: {result.totalL.toFixed(2)} = {result.totalA.toFixed(2)}</span>
// //           </div>

// //           <div className="row g-2">
// //             {/* LIABILITIES */}
// //             <div className="col-md-6">
// //               <div className="card" style={{background:"#0f172a", border:"2px solid #2a5bd7", borderRadius:"12px"}}>
// //                 <div className="card-header d-flex justify-content-between" style={{background:"#162a6b"}}>
// //                   <span className="text-white fw-bold">LIABILITIES</span>
// //                   <span className="text-info fw-bold">AMOUNT</span>
// //                 </div>
// //                 <div style={{minHeight:"300px"}}>
// //                   {result.liabilities.map((a,i)=>(
// //                     <div key={i} className="d-flex justify-content-between px-3 py-2 border-bottom border-primary border-opacity-25">
// //                       <span className="text-white">{a.name}</span>
// //                       <span className="text-info fw-bold" style={{minWidth:"110px", textAlign:"right"}}>{a.amount.toFixed(2)}</span>
// //                     </div>
// //                   ))}
// //                 </div>
// //                 <div className="d-flex justify-content-between p-2 px-3" style={{background:"#000", borderTop:"2px solid #2a5bd7", borderRadius:"0 0 10px 10px"}}>
// //                   <span className="text-white fw-bold">Total</span>
// //                   <span className="text-cyan-400 fw-bold" style={{minWidth:"110px", textAlign:"right", color:"#00e5ff"}}>{result.totalL.toFixed(2)}</span>
// //                 </div>
// //               </div>
// //             </div>

// //             {/* ASSETS */}
// //             <div className="col-md-6">
// //               <div className="card" style={{background:"#0f172a", border:"2px solid #00c8e6", borderRadius:"12px"}}>
// //                 <div className="card-header d-flex justify-content-between" style={{background:"#000"}}>
// //                   <span className="text-white fw-bold">ASSETS</span>
// //                   <span className="text-info fw-bold">AMOUNT</span>
// //                 </div>
// //                 <div style={{minHeight:"300px"}}>
// //                   {result.assets.map((a,i)=>(
// //                     <div key={i} className="d-flex justify-content-between px-3 py-2 border-bottom border-info border-opacity-25">
// //                       <span className="text-white">{a.name} {a.name.toLowerCase().includes("rent")? <small className="text-warning">(Expense - P&L Loss)</small> : ""}</span>
// //                       <span className="text-info fw-bold" style={{minWidth:"110px", textAlign:"right"}}>{a.amount.toFixed(2)}</span>
// //                     </div>
// //                   ))}

// //                   {/* P&L SHOWING - NOT ADDED TO TOTAL, JUST DISPLAY */}
// //                   {result.rentItem && (
// //                     <div className="mx-2 mt-2 p-2 rounded" style={{background:"rgba(0,229,255,0.1)", border:"1px dashed #00e5ff"}}>
// //                       <div className="d-flex justify-content-between">
// //                         <span className="text-info fw-bold small">Profit & Loss A/c (Loss due to rent)</span>
// //                         <span className="text-warning fw-bold small" style={{minWidth:"110px", textAlign:"right"}}>{Math.abs(result.profit).toFixed(2)} Dr</span>
// //                       </div>
// //                       <small className="text-secondary">Note: Rent 30000 is loss, so P&L = -30000. Balance still 30000=30000 tallied.</small>
// //                     </div>
// //                   )}
// //                 </div>
// //                 <div className="d-flex justify-content-between p-2 px-3" style={{background:"#000", borderTop:"2px solid #00c8e6", borderRadius:"0 0 10px 10px"}}>
// //                   <span className="text-white fw-bold">Total</span>
// //                   <span className="fw-bold" style={{minWidth:"110px", textAlign:"right", color:"#00e5ff"}}>{result.totalA.toFixed(2)}</span>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>

// //           <div className="text-center mt-2">
// //             <span className="badge bg-success fs-6">Liabilities {result.totalL.toFixed(2)} = Assets {result.totalA.toFixed(2)} ✓ SAME</span>
// //           </div>

// //         </div>
// //       </div>
// //     </>
// //   );
// // }

// "use client";
// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabase";

// export default function BalanceSheet() {
//   const [liab, setLiab] = useState([]);
//   const [assets, setAssets] = useState([]);
//   const [total, setTotal] = useState(0);

//   useEffect(() => { load(); }, []);

//   const load = async () => {
//     const { data: groups } = await supabase.from("groups").select("*");
//     const { data: ledgers } = await supabase.from("ledgers").select("*");
//     const { data: items } = await supabase.from("journal_entry_items").select("*");
//     const { data: natures } = await supabase.from("natures").select("*"); // natures table iruntha

//     const gMap = {};
//     groups.forEach(g => gMap[g.id] = g);

//     const nMap = {};
//     if(natures) natures.forEach(n => nMap[n.id] = n.name.toLowerCase());

//     // *** INTHA FUNCTION THAN MAIN FIX ***
//     const getNatureForGroup = (groupId) => {
//       let current = gMap[groupId];
//       let loop = 0;
//       while (current && loop < 10) { // infinite loop aagama irukka 10 times
//         if (current.nature_id) {
//           // nature_id iruntha direct ah return
//           // natures table la iruntha name edukkalam, illa number ah return pannalam
//           if (nMap[current.nature_id]) return nMap[current.nature_id];
//           return Number(current.nature_id); // 1,2,3,4
//         }
//         // nature_id illa na parent ku po
//         if (current.parent_id || current.parent_group_id || current.under_group) {
//           const parentId = current.parent_id || current.parent_group_id || current.under_group;
//           current = gMap[parentId];
//         } else {
//           break;
//         }
//         loop++;
//       }
//       return null;
//     };

//     const tMap = {};
//     ledgers.forEach(l => tMap[l.id] = { ledger: l, dr: 0, cr: 0 });
//     items.forEach(it => {
//       if (tMap[it.ledger_id]) {
//         tMap[it.ledger_id].dr += Number(it.debit || 0);
//         tMap[it.ledger_id].cr += Number(it.credit || 0);
//       }
//     });

//     let bsAssets = [];
//     let bsLiab = [];
//     let plExp = 0;
//     let plInc = 0;

//     Object.values(tMap).forEach(({ ledger, dr, cr }) => {
//       const closing = dr - cr;
//       if (closing === 0) return;

//       const nature = getNatureForGroup(ledger.group_id);
//       const amt = Math.abs(closing);

//       console.log(ledger.name, "-> Group:", gMap[ledger.group_id]?.name, "-> Nature:", nature, "-> Closing:", closing);

//       // Nature check - string ah number ah nu rendu type kum work aagum
//       const isAsset = nature === 1 || nature === 'assets' || nature?.includes('asset');
//       const isLiab = nature === 2 || nature === 'liabilities' || nature?.includes('liab');
//       const isIncome = nature === 3 || nature === 'income';
//       const isExpense = nature === 4 || nature === 'expense';

//       if (isAsset) {
//         if (closing > 0) bsAssets.push({ name: ledger.name, amount: amt });
//         else bsLiab.push({ name: ledger.name, amount: amt });
//       } else if (isLiab) {
//         if (closing < 0) bsLiab.push({ name: ledger.name, amount: amt });
//         else bsAssets.push({ name: ledger.name, amount: amt });
//       } else if (isExpense) {
//         if (closing > 0) plExp += amt; else plInc += amt;
//       } else if (isIncome) {
//         if (closing < 0) plInc += amt; else plExp += amt;
//       }
//     });

//     if (plExp > plInc) {
//       bsAssets.push({ name: "Profit & Loss A/c (Net Loss)", amount: plExp - plInc });
//     } else if (plInc > plExp) {
//       bsLiab.push({ name: "Profit & Loss A/c (Net Profit)", amount: plInc - plExp });
//     }

//     setLiab(bsLiab);
//     setAssets(bsAssets);
//     setTotal(bsLiab.reduce((a, b) => a + b.amount, 0));
//   };

//   return (
//     <div className="p-4 bg-[#f0f0f0] min-h-screen">
//       <div className="max-w-5xl mx-auto bg-white border border-black flex">
//         <div className="w-1/2 border-r border-black">
//           <h2 className="font-bold bg-gray-100 p-2 border-b border-black">Liabilities</h2>
//           {liab.map((l, i) => <div key={i} className="flex justify-between p-2 text-sm"><span>{l.name}</span><span>{l.amount}</span></div>)}
//           <div className="flex justify-between p-2 font-bold border-t border-black"><span>Total</span><span>{total}</span></div>
//         </div>
//         <div className="w-1/2">
//           <h2 className="font-bold bg-gray-100 p-2 border-b border-black">Assets</h2>
//           {assets.map((a, i) => <div key={i} className="flex justify-between p-2 text-sm"><span>{a.name}</span><span>{a.amount}</span></div>)}
//           <div className="flex justify-between p-2 font-bold border-t border-black"><span>Total</span><span>{total}</span></div>
//         </div>
//       </div>
//     </div>
//   );
// }





"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

const BalanceSheet = () => {
  const [data, setData] = useState({ liabilities: [], assets: [], totalLiabilities: 0, totalAssets: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/balancesheet");
        console.log(res.data);
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const isTally = Number(data.totalLiabilities) === Number(data.totalAssets) && data.totalLiabilities !== 0;

  return (
    <div style={{ minHeight: "100vh", background: "#0b122e", color: "white", padding: "15px", fontFamily: "Arial" }}>
      
      {/* HEADER - CORRECT TALLY LOGIC */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: isTally ? "2px solid #22d3ee" : "2px solid #f87171", borderRadius: "8px", padding: "12px 20px", background: "linear-gradient(90deg, #0b122e, #1e3a8a)", marginBottom: "12px" }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "900" }}>BALANCE SHEET</h1>
        <span style={{ fontSize: "11px", background: isTally ? "rgba(34,211,238,0.2)" : "rgba(248,113,113,0.2)", color: isTally ? "#67e8f9" : "#fca5a5", padding: "4px 10px", borderRadius: "20px", border: isTally ? "1px solid #22d3ee" : "1px solid #f87171" }}>
          {isTally ? `Total Tallied: ${data.totalLiabilities}.00 = ${data.totalAssets}.00` : `Not Tallied: ${data.totalLiabilities}.00 ≠ ${data.totalAssets}.00`}
        </span>
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        {/* LIABILITIES */}
        <div style={{ flex: 1, border: "1.5px solid #60a5fa", borderRadius: "12px", overflow: "hidden", background: "#131d42" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 15px", background: "#1e3a8a", fontWeight: "bold", fontSize: "14px" }}>
            <span>LIABILITIES</span>
            <span style={{ color: "#22d3ee" }}>AMOUNT</span>
          </div>
          <div style={{ minHeight: "400px" }}>
            {data.liabilities.length === 0 ? <p style={{ padding: "15px", opacity: 0.6 }}>No Liabilities</p> :
              data.liabilities.map((l, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 15px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: "14px" }}>
                  <span>{l.name}</span>
                  <span style={{ color: "#22d3ee", fontWeight: "bold" }}>{Number(l.amount).toFixed(2)}</span>
                </div>
              ))
            }
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 15px", background: "rgba(0,0,0,0.6)", borderTop: "1px solid #60a5fa", fontWeight: "bold" }}>
            <span>Total</span>
            <span style={{ color: "#6ee7b7" }}>{data.totalLiabilities}.00</span>
          </div>
        </div>

        {/* ASSETS - NO HARDCODED P&L BOX */}
        <div style={{ flex: 1, border: "1.5px solid #60a5fa", borderRadius: "12px", overflow: "hidden", background: "#131d42" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 15px", background: "#172554", fontWeight: "bold", fontSize: "14px" }}>
            <span>ASSETS</span>
            <span style={{ color: "#22d3ee" }}>AMOUNT</span>
          </div>
          <div style={{ minHeight: "400px" }}>
            {data.assets.length === 0 ? <p style={{ padding: "15px", opacity: 0.6 }}>No Assets</p> :
              data.assets.map((a, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 15px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: "14px" }}>
                  <span>{a.name}</span>
                  <span style={{ color: "#22d3ee", fontWeight: "bold" }}>{Number(a.amount).toFixed(2)}</span>
                </div>
              ))
            }
            {/* RENT BOX REMOVED - Neenga sonna maari Expenses Balance Sheet la vara koodathu */}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 15px", background: "rgba(0,0,0,0.6)", borderTop: "1px solid #60a5fa", fontWeight: "bold" }}>
            <span>Total</span>
            <span style={{ color: "#6ee7b7" }}>{data.totalAssets}.00</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: "15px" }}>
        <div style={{ background: isTally ? "#a7f3d0" : "#fecaca", color: isTally ? "#064e3b" : "#7f1d1d", padding: "6px 18px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
          {isTally ? `Liabilities ${data.totalLiabilities}.00 = Assets ${data.totalAssets}.00 ✓ SAME` : `Liabilities ${data.totalLiabilities}.00 ≠ Assets ${data.totalAssets}.00 ✗ NOT TALLIED - Add Capital`}
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;