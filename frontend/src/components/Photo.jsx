import { useState } from 'react';

const TINTS = ['bg-yellow', 'bg-green', 'bg-sky', 'bg-rose'];

const tintOf = (value = 0) => {
  const text = String(value);
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) % 997;
  }
  return TINTS[hash % TINTS.length];
};

/** Photo tile: shows `imageUrl` when present, otherwise a tinted label tile. */
export default function Photo({
  index = 0,
  label,
  imageUrl,
  className = '',
  style,
}) {
  const [failed, setFailed] = useState(false);
  const showImage = imageUrl && !failed;

  return (
    <div
      style={style}
      className={`${showImage ? 'bg-white' : tintOf(index)} grid place-items-center overflow-hidden ${className}`}
    >
      {showImage ? (
        <img
          src={imageUrl}
          alt={label || 'Report photo'}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="ui text-[0.6875rem] leading-4 md:text-[0.8125rem]">{label}</span>
      )}
    </div>
  );
}
