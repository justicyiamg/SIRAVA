import React from 'react';
import { TableData } from '../../types/exam';
import { Table as TableIcon } from 'lucide-react';

interface TableViewProps {
  data: TableData;
  className?: string;
}

export const TableView: React.FC<TableViewProps> = ({ data, className = '' }) => {
  if (!data || !data.headers || data.headers.length === 0) {
    return null;
  }

  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm my-3 ${className}`}>
      {data.title && (
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50/80 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
          <TableIcon className="h-4 w-4 text-indigo-600" />
          <span>{data.title}</span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-100/70 text-xs font-bold uppercase text-slate-600">
            <tr>
              {data.headers.map((header, idx) => (
                <th key={idx} className="px-4 py-3 whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.rows && data.rows.length > 0 ? (
              data.rows.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className={rowIdx % 2 === 0 ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/40 hover:bg-slate-50/80'}
                >
                  {row.map((cell, colIdx) => (
                    <td key={colIdx} className="px-4 py-3 whitespace-nowrap font-medium text-slate-800">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={data.headers.length} className="px-4 py-6 text-center text-xs text-slate-400 italic">
                  Tidak ada baris data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
