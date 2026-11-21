import React from 'react';
import {
  CaretLeft,
  CaretRight,
  CaretDoubleLeft,
  CaretDoubleRight,
} from '@phosphor-icons/react';
import '../styles/pagination.css';

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 25,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [25, 50, 100],
  itemLabel = 'klien',
  className = '',
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(safeCurrentPage * pageSize, totalItems);

  // Generate array tombol halaman dengan ellipsis (...)
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (safeCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (safeCurrentPage >= totalPages - 3) {
      return [
        1,
        '...',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      '...',
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
      '...',
      totalPages,
    ];
  };

  const pages = getPageNumbers();

  const handlePageClick = (p) => {
    if (p === '...' || p === safeCurrentPage) return;
    onPageChange && onPageChange(p);
  };

  return (
    <div className={`pagination-container ${className}`}>
      <div className="pagination-info">
        <span>
          Menampilkan <strong>{startItem}</strong> &ndash; <strong>{endItem}</strong> dari{' '}
          <strong>{totalItems.toLocaleString('id-ID')}</strong> {itemLabel}
        </span>
      </div>

      <div className="pagination-controls">
        {onPageSizeChange && (
          <div className="pagination-size-selector">
            <label htmlFor="pageSizeSelect" className="size-label">
              Baris:
            </label>
            <select
              id="pageSizeSelect"
              className="size-select"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / hal
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="pagination-buttons">
          <button
            type="button"
            className="btn-page-nav btn-page-first"
            title="Halaman Pertama"
            disabled={safeCurrentPage <= 1}
            onClick={() => onPageChange && onPageChange(1)}
          >
            <CaretDoubleLeft size={14} weight="bold" />
          </button>

          <button
            type="button"
            className="btn-page-nav btn-page-prev"
            title="Halaman Sebelumnya"
            disabled={safeCurrentPage <= 1}
            onClick={() => onPageChange && onPageChange(safeCurrentPage - 1)}
          >
            <CaretLeft size={14} weight="bold" />
          </button>

          <div className="page-numbers-list">
            {pages.map((p, idx) => {
              if (p === '...') {
                return (
                  <span key={`dots-${idx}`} className="page-ellipsis">
                    &hellip;
                  </span>
                );
              }
              const isActive = p === safeCurrentPage;
              return (
                <button
                  key={`page-${p}`}
                  type="button"
                  className={`btn-page-number ${isActive ? 'active' : ''}`}
                  onClick={() => handlePageClick(p)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="btn-page-nav btn-page-next"
            title="Halaman Berikutnya"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => onPageChange && onPageChange(safeCurrentPage + 1)}
          >
            <CaretRight size={14} weight="bold" />
          </button>

          <button
            type="button"
            className="btn-page-nav btn-page-last"
            title="Halaman Terakhir"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => onPageChange && onPageChange(totalPages)}
          >
            <CaretDoubleRight size={14} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}

