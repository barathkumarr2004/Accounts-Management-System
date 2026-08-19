"use client";
import { useState } from "react";
import { useGetChartOfAccountsQuery } from "@/app/store/api/chartOfAccountsApi";

const TreeNode = ({ node, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(level < 1); 
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div 
        style={{ paddingLeft: `${level * 25}px` }}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
        className={`d-flex align-items-center py-1 px-2 ${hasChildren ? 'fw-bold' : ''}`}
        role="button"
      >
        {hasChildren ? (
          <span className="me-2">{isOpen ? '−' : '+'}</span>
        ) : (
          <span className="me-2"> </span>
        )}
        
        <span className={node.type === 'ledger' ? 'text-primary' : 'text-dark'}>
          {node.name}
        </span>
      </div>

      {isOpen && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={`${child.type}-${child.id}`} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function ChartOfAccountsPage() {
  const { data, isLoading, error } = useGetChartOfAccountsQuery();

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-danger">Error: {JSON.stringify(error)}</div>;

  return (
    <div className="p-3 bg-white min-vh-100" style={{fontFamily: 'monospace'}}>
      <div className="border-bottom pb-2 mb-3 d-flex justify-content-between">
        <h4 className="mb-0">CHART OF ACCOUNTS</h4>
        {/* <small className="text-muted">[F12: Configure] [Alt+S: Search]</small> */}
      </div>

      <div>
        {data?.map((nature) => (
          <TreeNode key={nature.id} node={nature} />
        ))}
      </div>

      <div className="mt-3 border-top pt-2 text-muted">
        Total: {data?.length} Natures | Press + to Expand
      </div>
    </div>
  );
}


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const ChartOfAccounts = () => {
//   const [data, setData] = useState([]);
//   const [expanded, setExpanded] = useState({});

//   useEffect(() => {
//     axios.get('http://localhost:5000/api/chartsofaccounts')
//      .then(res => setData(res.data));
//   }, []);

//   const toggle = (id) => {
//     setExpanded(prev => ({...prev, [id]:!prev[id] }));
//   };

//   // Recursive component to render tree
//   const RenderNode = ({ node, level = 0 }) => {
//     const hasChildren = node.children && node.children.length > 0;
    
//     return (
//       <div style={{ marginLeft: level * 20 }}>
//         <div onClick={() => hasChildren && toggle(node.id)} style={{ cursor: hasChildren? 'pointer' : 'default' }}>
//           {hasChildren? (expanded[node.id]? '- ' : '+ ') : ' '}
//           {node.name} {node.code && `(${node.code})`}
//         </div>
        
//         {expanded[node.id] && hasChildren && (
//           node.children.map(child => <RenderNode key={child.id + child.type} node={child} level={level + 1} />)
//         )}
//       </div>
//     );
//   };

//   return (
//     <div>
//       <h2>CHART OF ACCOUNTS</h2>
//       {data.map(nature => <RenderNode key={nature.id} node={nature} />)}
//       <p>Total: {data.length} Natures | Press + to Expand</p>
//     </div>
//   );
// };

// export default ChartOfAccounts;