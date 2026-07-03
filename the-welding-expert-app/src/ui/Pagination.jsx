import PropTypes from "prop-types";
import styled from "styled-components";
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";

const PaginationBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.2rem;
  padding-top: 1.6rem;
  border-top: 1px solid var(--color-grey-100);
`;

const PaginationInfo = styled.p`
  color: var(--color-grey-500);
  font-size: 1.3rem;
  font-weight: 600;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const PageButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.6rem;
  min-height: 3.6rem;
  border-radius: var(--border-radius-sm);
  border: 1px solid
    ${(props) =>
      props.$active
        ? "var(--color-brand-400)"
        : "var(--color-grey-200)"};
  background: ${(props) =>
    props.$active ? "var(--color-brand-50)" : "var(--color-grey-0)"};
  color: ${(props) =>
    props.$active
      ? "var(--color-brand-800)"
      : "var(--color-grey-700)"};
  font-size: 1.3rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    border-color: var(--color-brand-300);
    background: var(--color-brand-50);
    color: var(--color-brand-800);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  & svg {
    width: 1.6rem;
    height: 1.6rem;
  }
`;

const Ellipsis = styled.span`
  padding: 0 0.4rem;
  color: var(--color-grey-400);
  font-size: 1.3rem;
  font-weight: 700;
`;

function buildPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set([1, total, current]);

  if (current > 1) pages.add(current - 1);
  if (current < total) pages.add(current + 1);

  return Array.from(pages).sort((a, b) => a - b);
}

function Pagination({ page, pageSize, totalCount, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  if (totalPages <= 1) return null;

  const from = Math.min((page - 1) * pageSize + 1, totalCount);
  const to = Math.min(page * pageSize, totalCount);

  const pageNumbers = buildPageNumbers(page, totalPages);

  return (
    <PaginationBar>
      <PaginationInfo>
        {from}–{to} / {totalCount} talep
      </PaginationInfo>

      <PaginationControls>
        <PageButton
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Önceki sayfa"
        >
          <HiOutlineChevronLeft />
        </PageButton>

        {pageNumbers.map((num, idx) => {
          const prev = pageNumbers[idx - 1];
          const showEllipsis = prev !== undefined && num - prev > 1;

          return (
            <span key={num} style={{ display: "contents" }}>
              {showEllipsis && <Ellipsis>…</Ellipsis>}
              <PageButton
                type="button"
                $active={num === page}
                aria-current={num === page ? "page" : undefined}
                onClick={() => onPageChange(num)}
              >
                {num}
              </PageButton>
            </span>
          );
        })}

        <PageButton
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Sonraki sayfa"
        >
          <HiOutlineChevronRight />
        </PageButton>
      </PaginationControls>
    </PaginationBar>
  );
}

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default Pagination;
