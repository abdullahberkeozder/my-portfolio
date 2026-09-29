import React from 'react';
import styles from './RatingStars.module.css';

export interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
  reviewCount?: number;
  className?: string;
  'aria-label'?: string;
}

export default function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  showScore = false,
  reviewCount,
  className = '',
  'aria-label': customAriaLabel,
}: RatingStarsProps) {
  const normalizedRating = Math.max(0, Math.min(rating, maxRating));
  const fullStars = Math.floor(normalizedRating);
  const hasHalfStar = normalizedRating - fullStars >= 0.4;
  const emptyStars = Math.max(0, maxRating - fullStars - (hasHalfStar ? 1 : 0));

  const ariaLabel = customAriaLabel ?? `${normalizedRating.toFixed(1)} / ${maxRating} yıldız`;

  return (
    <div
      className={[styles.ratingContainer, styles[size], className].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
      role="img"
    >
      <div className={styles.starsRow} aria-hidden="true">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={`full-${i}`} className={`${styles.star} ${styles.starFilled}`}>
            ★
          </span>
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <span className={`${styles.star} ${styles.starHalf}`}>
            ★
            <span className={styles.starHalfFill}>★</span>
          </span>
        )}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={`empty-${i}`} className={styles.star}>
            ★
          </span>
        ))}
      </div>

      {showScore && <span className={styles.scoreText}>{normalizedRating.toFixed(1)}</span>}
      {reviewCount !== undefined && <span className={styles.countText}>({reviewCount})</span>}
    </div>
  );
}
