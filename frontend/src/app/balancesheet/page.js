// "use client";
// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const BalanceSheet = () => {
//   const [data, setData] = useState({ liabilities: [], assets: [], totalLiabilities: 0, totalAssets: 0 });

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await axios.get("http://localhost:5000/api/balancesheet");
//         console.log(res.data);
//         setData(res.data);
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     fetchData();
//   }, []);

//   const isTally = Number(data.totalLiabilities) === Number(data.totalAssets) && data.totalLiabilities !== 0;

//   return (
//     <div style={{ minHeight: "100vh", background: "#0b122e", color: "white", padding: "15px", fontFamily: "Arial" }}>
      
//       {/* HEADER - CORRECT TALLY LOGIC */}
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: isTally ? "2px solid #22d3ee" : "2px solid #f87171", borderRadius: "8px", padding: "12px 20px", background: "linear-gradient(90deg, #0b122e, #1e3a8a)", marginBottom: "12px" }}>
//         <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "900" }}>BALANCE SHEET</h1>
//         <span style={{ fontSize: "11px", background: isTally ? "rgba(34,211,238,0.2)" : "rgba(248,113,113,0.2)", color: isTally ? "#67e8f9" : "#fca5a5", padding: "4px 10px", borderRadius: "20px", border: isTally ? "1px solid #22d3ee" : "1px solid #f87171" }}>
//           {isTally ? `Total Tallied: ${data.totalLiabilities}.00 = ${data.totalAssets}.00` : `Not Tallied: ${data.totalLiabilities}.00 ≠ ${data.totalAssets}.00`}
//         </span>
//       </div>

//       <div style={{ display: "flex", gap: "12px" }}>
//         {/* LIABILITIES */}
//         <div style={{ flex: 1, border: "1.5px solid #60a5fa", borderRadius: "12px", overflow: "hidden", background: "#131d42" }}>
//           <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 15px", background: "#1e3a8a", fontWeight: "bold", fontSize: "14px" }}>
//             <span>LIABILITIES</span>
//             <span style={{ color: "#22d3ee" }}>AMOUNT</span>
//           </div>
//           <div style={{ minHeight: "400px" }}>
//             {data.liabilities.length === 0 ? <p style={{ padding: "15px", opacity: 0.6 }}>No Liabilities</p> :
//               data.liabilities.map((l, i) => (
//                 <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 15px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: "14px" }}>
//                   <span>{l.name}</span>
//                   <span style={{ color: "#22d3ee", fontWeight: "bold" }}>{Number(l.amount).toFixed(2)}</span>
//                 </div>
//               ))
//             }
//           </div>
//           <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 15px", background: "rgba(0,0,0,0.6)", borderTop: "1px solid #60a5fa", fontWeight: "bold" }}>
//             <span>Total</span>
//             <span style={{ color: "#6ee7b7" }}>{data.totalLiabilities}.00</span>
//           </div>
//         </div>

//         {/* ASSETS - NO HARDCODED P&L BOX */}
//         <div style={{ flex: 1, border: "1.5px solid #60a5fa", borderRadius: "12px", overflow: "hidden", background: "#131d42" }}>
//           <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 15px", background: "#172554", fontWeight: "bold", fontSize: "14px" }}>
//             <span>ASSETS</span>
//             <span style={{ color: "#22d3ee" }}>AMOUNT</span>
//           </div>
//           <div style={{ minHeight: "400px" }}>
//             {data.assets.length === 0 ? <p style={{ padding: "15px", opacity: 0.6 }}>No Assets</p> :
//               data.assets.map((a, i) => (
//                 <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 15px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: "14px" }}>
//                   <span>{a.name}</span>
//                   <span style={{ color: "#22d3ee", fontWeight: "bold" }}>{Number(a.amount).toFixed(2)}</span>
//                 </div>
//               ))
//             }
//             {/* RENT BOX REMOVED - Neenga sonna maari Expenses Balance Sheet la vara koodathu */}
//           </div>
//           <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 15px", background: "rgba(0,0,0,0.6)", borderTop: "1px solid #60a5fa", fontWeight: "bold" }}>
//             <span>Total</span>
//             <span style={{ color: "#6ee7b7" }}>{data.totalAssets}.00</span>
//           </div>
//         </div>
//       </div>

//       <div style={{ display: "flex", justifyContent: "center", marginTop: "15px" }}>
//         <div style={{ background: isTally ? "#a7f3d0" : "#fecaca", color: isTally ? "#064e3b" : "#7f1d1d", padding: "6px 18px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
//           {isTally ? `Liabilities ${data.totalLiabilities}.00 = Assets ${data.totalAssets}.00 ✓ SAME` : `Liabilities ${data.totalLiabilities}.00 ≠ Assets ${data.totalAssets}.00 ✗ NOT TALLIED - Add Capital`}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BalanceSheet;




"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

const BalanceSheet = () => {
  const [data, setData] = useState({ liabilities: [], assets: [], totalLiabilities: 0, totalAssets: 0, pnl: null });

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

  const isTally = Number(data.totalLiabilities) === Number(data.totalAssets) && data.totalLiabilities!== 0;

  return (
    <div style={{ minHeight: "100vh", background: "#0b122e", color: "white", padding: "15px", fontFamily: "Arial" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: isTally? "2px solid #22d3ee" : "2px solid #f87171", borderRadius: "8px", padding: "12px 20px", background: "linear-gradient(90deg, #0b122e, #1e3a8a)", marginBottom: "12px" }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "900" }}>BALANCE SHEET</h1>
        <span style={{ fontSize: "11px", background: isTally? "rgba(34,211,238,0.2)" : "rgba(248,113,113,0.2)", color: isTally? "#67e8f9" : "#fca5a5", padding: "5px 12px", borderRadius: "20px", border: isTally? "1px solid #22d3ee" : "1px solid #f87171" }}>
          {isTally? `Total Tallied: ${data.totalLiabilities}.00 = ${data.totalAssets}.00` : `Not Tallied: ${data.totalLiabilities}.00 ≠ ${data.totalAssets}.00`}
        </span>
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "300px", border: "1.5px solid #60a5fa", borderRadius: "12px", overflow: "hidden", background: "#131d42" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 15px", background: "#1e3a8a", fontWeight: "bold", fontSize: "14px" }}>
            <span>LIABILITIES</span><span style={{ color: "#22d3ee" }}>AMOUNT</span>
          </div>
          <div style={{ minHeight: "420px" }}>
            {data.liabilities.length === 0? <p style={{ padding: "15px", opacity: 0.6 }}>No Liabilities</p> :
              data.liabilities.map((l, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 15px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: "14px", background: l.isPnl? "rgba(34,211,238,0.15)" : "transparent" }}>
                  <span style={{ color: l.isPnl? "#6ee7b7" : "white", fontWeight: l.isPnl? "bold" : "normal" }}>{l.name}</span>
                  <span style={{ color: l.isPnl? "#6ee7b7" : "#22d3ee", fontWeight: "bold" }}>{Number(l.amount).toFixed(2)}</span>
                </div>
              ))
            }
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 15px", background: "rgba(0,0,0,0.6)", borderTop: "1px solid #60a5fa", fontWeight: "bold" }}>
            <span>Total</span><span style={{ color: "#6ee7b7" }}>{Number(data.totalLiabilities).toFixed(2)}</span>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: "300px", border: "1.5px solid #60a5fa", borderRadius: "12px", overflow: "hidden", background: "#131d42" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 15px", background: "#172554", fontWeight: "bold", fontSize: "14px" }}>
            <span>ASSETS</span><span style={{ color: "#22d3ee" }}>AMOUNT</span>
          </div>
          <div style={{ minHeight: "420px" }}>
            {data.assets.length === 0? <p style={{ padding: "15px", opacity: 0.6 }}>No Assets</p> :
              data.assets.map((a, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 15px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: "14px", background: a.isPnl? "rgba(251,146,60,0.12)" : "transparent" }}>
                  <span style={{ color: a.isPnl? "#fb923c" : "white", fontWeight: a.isPnl? "bold" : "normal" }}>
                    {a.name} {a.isPnl? <span style={{fontSize:"11px"}}>({a.type} - {data.pnl?.totalExpense} Exp)</span> : ""}
                  </span>
                  <span style={{ color: a.isPnl? "#fb923c" : "#22d3ee", fontWeight: "bold" }}>{Number(a.amount).toFixed(2)} {a.isPnl? "Dr" : ""}</span>
                </div>
              ))
            }
            {data.pnl && (
              <div style={{ margin: "12px", padding: "10px", border: "1px dashed rgba(34,211,238,0.5)", borderRadius: "8px", background: "rgba(30,47,90,0.6)", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>
                Tally Formula: Net Profit = (Direct+Indirect Income {data.pnl.totalIncome}) - (Direct+Indirect Expense {data.pnl.totalExpense}) = {data.pnl.type} {data.pnl.amount}
              </div>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 15px", background: "rgba(0,0,0,0.6)", borderTop: "1px solid #60a5fa", fontWeight: "bold" }}>
            <span>Total</span><span style={{ color: "#6ee7b7" }}>{Number(data.totalAssets).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: "15px" }}>
        <div style={{ background: isTally? "#a7f3d0" : "#fecaca", color: isTally? "#064e3b" : "#7f1d1d", padding: "6px 18px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
          {isTally? `Liabilities ${data.totalLiabilities}.00 = Assets ${data.totalAssets}.00 ✓ SAME` : `Liabilities ${data.totalLiabilities}.00 ≠ Assets ${data.totalAssets}.00 ✗ NOT TALLIED`}
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;