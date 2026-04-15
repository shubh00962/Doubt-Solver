'use client';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({ rating, max = 5, size = 'md', interactive = false, onChange }: StarRatingProps) {
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' };

  return (
    <div className={`flex gap-0.5 ${sizes[size]}`}>
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(i + 1)}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
        >
          <span className={i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
        </button>
      ))}
    </div>
  );
}
