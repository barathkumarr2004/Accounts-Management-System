"use client";
import { useState } from "react";
import { useGetChartOfAccountsQuery } from "@/store/api/chartOfAccountsApi";

const TreeNode = ({ node, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
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