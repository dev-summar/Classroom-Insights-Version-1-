import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handleFirst = () => onPageChange(1);
    const handlePrev = () => onPageChange(Math.max(1, currentPage - 1));
    const handleNext = () => onPageChange(Math.min(totalPages, currentPage + 1));
    const handleLast = () => onPageChange(totalPages);

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show current page with context
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, currentPage + 2);

            // Adjust if we're near the beginning or end
            if (currentPage <= 3) {
                end = maxVisible;
            } else if (currentPage >= totalPages - 2) {
                start = totalPages - maxVisible + 1;
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="pagination-wrapper">
            <div className="pagination-controls">
                {/* First Page Button */}
                <button
                    onClick={handleFirst}
                    disabled={currentPage === 1}
                    className="pagination-btn pagination-nav"
                    aria-label="First page"
                    title="First page"
                >
                    <ChevronsLeft size={18} />
                </button>

                {/* Previous Page Button */}
                <button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className="pagination-btn pagination-nav"
                    aria-label="Previous page"
                    title="Previous page"
                >
                    <ChevronLeft size={18} />
                </button>

                {/* Page Number Buttons */}
                <div className="pagination-numbers">
                    {pageNumbers.map((pageNum) => (
                        <button
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
                            className={`pagination-btn pagination-number ${pageNum === currentPage ? 'active' : ''
                                }`}
                            aria-label={`Page ${pageNum}`}
                            aria-current={pageNum === currentPage ? 'page' : undefined}
                        >
                            {pageNum}
                        </button>
                    ))}
                </div>

                {/* Next Page Button */}
                <button
                    onClick={handleNext}
                    disabled={currentPage >= totalPages}
                    className="pagination-btn pagination-nav"
                    aria-label="Next page"
                    title="Next page"
                >
                    <ChevronRight size={18} />
                </button>

                {/* Last Page Button */}
                <button
                    onClick={handleLast}
                    disabled={currentPage >= totalPages}
                    className="pagination-btn pagination-nav"
                    aria-label="Last page"
                    title="Last page"
                >
                    <ChevronsRight size={18} />
                </button>
            </div>

            {/* Page Info */}
            <div className="pagination-info">
                Page <span className="pagination-info-highlight">{currentPage}</span> of{' '}
                <span className="pagination-info-highlight">{totalPages}</span>
            </div>
        </div>
    );
};

export default Pagination;
