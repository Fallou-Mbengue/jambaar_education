'use client';

import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useState } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  actions?: (item: T) => React.ReactNode;
  filters?: React.ReactNode;
  loading?: boolean;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  total,
  page,
  pageSize,
  onPageChange,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Rechercher...',
  actions,
  filters,
  loading,
}: DataTableProps<T>) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="card">
      {(onSearchChange || filters) && (
        <div className="p-4 border-b flex flex-wrap gap-3 items-center">
          {onSearchChange && (
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchValue || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="input-field pl-9"
              />
            </div>
          )}
          {filters}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              {columns.map((col) => (
                <th key={col.key} className="text-left px-4 py-3 font-medium text-gray-600">
                  {col.header}
                </th>
              ))}
              {actions && <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-8 text-gray-400">
                  Chargement...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-8 text-gray-400">
                  Aucun résultat
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">{actions(item)}</div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-4 py-3 border-t flex items-center justify-between text-sm text-gray-600">
          <span>{total} résultat{total > 1 ? 's' : ''}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
              aria-label="Page précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {page} / {totalPages}</span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
              aria-label="Page suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PUBLISHED: 'badge-green',
    ACTIVE: 'badge-green',
    SUCCESS: 'badge-green',
    DRAFT: 'badge-yellow',
    PENDING: 'badge-yellow',
    PAST_DUE: 'badge-yellow',
    ARCHIVED: 'badge-gray',
    EXPIRED: 'badge-gray',
    CANCELED: 'badge-red',
    SUSPENDED: 'badge-red',
    FAIL: 'badge-red',
  };

  return <span className={map[status] || 'badge-gray'}>{status}</span>;
}

export function PremiumBadge({ isPremium }: { isPremium: boolean }) {
  return isPremium ? <span className="badge-blue">Premium</span> : <span className="badge-gray">Free</span>;
}
