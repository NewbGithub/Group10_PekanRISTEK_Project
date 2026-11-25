// Demo photos for seeded reports. The API stores `imageUrl: null` for every
// seeded item (Cloudinary is not configured), so the cards are matched here by
// seed id first and by item name as a fallback (in case the ids change).
const DEMO_PHOTOS = [
  {
    id: 'a1b2c3d4-0000-4000-8000-000000000004',
    itemName: 'kunci motor honda',
    src: '/images/KunciMotorHonda.jpg',
  },
  {
    id: 'a1b2c3d4-0000-4000-8000-000000000007',
    itemName: 'dompet kulit cokelat',
    src: '/images/Dompet_Cokelat.jpg',
  },
];

/** Returns the photo to show for a report, or null when there is none. */
export function photoForReport(report) {
  if (!report) return null;

  // Ignore the old Cloudinary demo URLs that were seeded as placeholders.
  const isPlaceholder = /res\.cloudinary\.com\/demo\//i.test(report.imageUrl || '');
  if (report.imageUrl && !isPlaceholder) return report.imageUrl;

  const byId = DEMO_PHOTOS.find((photo) => photo.id === report.id);
  if (byId) return byId.src;

  const name = String(report.itemName || '').toLowerCase();
  const byName = DEMO_PHOTOS.find((photo) => name.includes(photo.itemName));
  return byName ? byName.src : null;
}
