import { useState } from 'react';

/**
 * Photo tile: renders `imageUrl` when present. When a report has no photo
 * nothing is rendered at all, so cards stay clean instead of showing a
 * placeholder tile.
 */
export default function Photo({
  label,
  imageUrl,
  className = '',
  style,
}) {
  const [failed, setFailed] = useState(false);

  if (!imageUrl || failed) return null;

  return (
    <div
      style={style}
      className={`grid place-items-center overflow-hidden bg-white ${className}`}
    >
      <img
        src={imageUrl}
        alt={label || 'Report photo'}
        className="h-full w-full object-cover"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
