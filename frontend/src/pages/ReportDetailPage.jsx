import { useState } from "react";
import { useParams } from "react-router-dom";

// Data dummy lingkungan Fasilkom UI (contoh id 1 punya 4 foto, id 2 cuma 1 foto)
const DUMMY_REPORTS = [
  {
    id: 1,
    reference: "#LF-20418",
    type: "FOUND",
    itemName: "Black leather wallet",
    category: "Wallet",
    location: "Gedung Baru Fasilkom UI, Lt. 2 Ruang A2.51",
    date: "Mon, 16 November 2026",
    reporterName: "Agus",
    reporterVerification: "Verified Fasilkom student",
    description:
      "Ditemukan di meja baris depan Ruang A2.51 Gedung Baru Fasilkom UI setelah kelas selesai. Dompet kulit warna hitam dengan sedikit goresan di bagian depan. Berisi KTM dan beberapa kartu — detail isinya disimpan supaya pemilik asli bisa memverifikasi.",
    contact: "WA: 0812-3456-7890",
    photos: [
      { id: 1, bgColor: "bg-gray-100", url: "" },
      { id: 2, bgColor: "bg-gray-100", url: "" },
      { id: 3, bgColor: "bg-gray-100", url: "" },
      { id: 4, bgColor: "bg-gray-100", url: "" },
    ],
  },
  {
    id: 2,
    reference: "#LF-20419",
    type: "LOST",
    itemName: "Tumbler Corkcicle Hitam",
    category: "Food/Drink",
    location: "Gedung Lama Fasilkom UI, Perpustakaan Lt. 1",
    date: "Thu, 19 November 2026",
    reporterName: "Budi Santoso",
    reporterVerification: "Verified Fasilkom student",
    description:
      "Tertinggal di meja baca dekat colokan Perpustakaan Fasilkom UI lantai 1. Botol warna hitam doff dengan stiker RISTEK kecil di bagian bawah.",
    contact: "LINE: budi_cs24",
    photos: [{ id: 1, bgColor: "bg-gray-100", url: "" }],
  },
];

export default function ReportDetailPage() {
  const { id } = useParams();
  const [copiedLink, setCopiedLink] = useState(false);
  const [showClaimInfo, setShowClaimInfo] = useState(false);
  const [copiedContact, setCopiedContact] = useState(false);
  const [popOutPhoto, setPopOutPhoto] = useState(null);

  const report =
    DUMMY_REPORTS.find((item) => String(item.id) === String(id)) ||
    DUMMY_REPORTS[0];

  const isFound = report.type?.toUpperCase() === "FOUND";

  const photos = report.photos || [];
  const mainPhoto = photos[0];
  const extraPhotos = photos.slice(1);

  const handleShareReport = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      alert("Gagal menyalin link laporan.");
    }
  };

  const handleCopyContact = async () => {
    if (!report.contact) return;
    const contactValue = report.contact.includes(":")
      ? report.contact.split(":").slice(1).join(":").trim()
      : report.contact.trim();

    try {
      await navigator.clipboard.writeText(contactValue);
      setCopiedContact(true);
      setTimeout(() => setCopiedContact(false), 2000);
    } catch {
      alert("Gagal menyalin kontak.");
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-black py-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* KOLOM KIRI: Foto Utama + Foto Tambahan + About this item */}
          <div className="lg:col-span-7 space-y-5">
            {/* Kotak Foto Utama */}
            <div
              onClick={() =>
                mainPhoto &&
                setPopOutPhoto({ ...mainPhoto, title: "PHOTO 1" })
              }
              className="w-full h-72 sm:h-96 bg-gray-100 border-2 border-black rounded-xl shadow-[4px_4px_0px_#000] overflow-hidden flex items-center justify-center cursor-pointer group relative"
            >
              {mainPhoto?.url ? (
                <img
                  src={mainPhoto.url}
                  alt={report.itemName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-black">
                  PHOTO · {report.category}
                </span>
              )}
            </div>

            {/* Foto Tambahan: HANYA muncul kalau total foto >= 2 (label: PHOTO 2, PHOTO 3, dst.) */}
            {extraPhotos.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {extraPhotos.map((item, idx) => {
                  const photoTitle = `PHOTO ${idx + 2}`;
                  return (
                    <button
                      key={item.id || idx}
                      type="button"
                      onClick={() =>
                        setPopOutPhoto({ ...item, title: photoTitle })
                      }
                      className={`w-20 h-20 sm:w-24 sm:h-24 ${
                        item.bgColor || "bg-gray-100"
                      } border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] overflow-hidden flex items-center justify-center transition-all cursor-pointer`}
                    >
                      {item.url ? (
                        <img
                          src={item.url}
                          alt={photoTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wide">
                          {photoTitle}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Kotak Deskripsi: About this item */}
            <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_#000] p-5 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold mb-2">
                About this item
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                {report.description}
              </p>
            </div>
          </div>

          {/* KOLOM KANAN: Kartu Detail, Tombol Klaim, Share, & Safety Tip */}
          <div className="lg:col-span-5 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_#000] p-5 sm:p-6 space-y-5">
            <div>
              <span
                className={`inline-block px-3 py-1 text-xs font-bold uppercase border-2 border-black rounded-md ${
                  isFound ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                {report.type}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {report.itemName}
            </h1>

            <div className="space-y-2.5 text-sm border-b border-gray-200 pb-4">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Location</span>
                <span className="font-bold text-right">{report.location}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  {isFound ? "Date found" : "Date lost"}
                </span>
                <span className="font-bold text-right">{report.date}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Category</span>
                <span className="font-bold text-right">{report.category}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Reference</span>
                <span className="font-bold text-right">{report.reference}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-black flex items-center justify-center font-bold text-sm shrink-0">
                {report.reporterName?.charAt(0).toUpperCase() || "A"}
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">
                  {report.reporterName}
                </p>
                <p className="text-xs text-gray-500">
                  {report.reporterVerification}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={() => setShowClaimInfo(!showClaimInfo)}
                className="w-full py-3 px-4 bg-black text-white hover:bg-neutral-800 active:translate-x-[2px] active:translate-y-[2px] border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] font-bold text-sm transition-all cursor-pointer"
              >
                {isFound
                  ? "This is mine — start a claim"
                  : "I found this — contact owner"}
              </button>

              {showClaimInfo && (
                <div className="p-3 bg-gray-100 border-2 border-black rounded-xl flex items-center justify-between gap-2 text-xs sm:text-sm">
                  <span className="font-bold break-all">{report.contact}</span>
                  <button
                    type="button"
                    onClick={handleCopyContact}
                    className="shrink-0 px-2.5 py-1 bg-white border-2 border-black rounded-lg font-bold text-xs hover:bg-gray-200 cursor-pointer"
                  >
                    {copiedContact ? "Copied!" : "Copy"}
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleShareReport}
                className="w-full py-3 px-4 bg-white text-black hover:bg-gray-100 active:translate-x-[2px] active:translate-y-[2px] border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] font-bold text-sm transition-all cursor-pointer"
              >
                {copiedLink ? "Report link copied!" : "Share this report"}
              </button>
            </div>

            <div className="bg-gray-50 border-2 border-black rounded-xl p-3.5 text-xs space-y-1">
              <p className="font-bold text-black">Safety tip</p>
              <p className="text-gray-800 leading-relaxed">
                Meet in a public place and verify ownership before handing
                anything over.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL POP-OUT FOTO */}
      {popOutPhoto && (
        <div
          onClick={() => setPopOutPhoto(null)}
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_#000] overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b-2 border-black">
              <span className="text-xs font-extrabold uppercase tracking-wider">
                {popOutPhoto.title}
              </span>
              <button
                type="button"
                onClick={() => setPopOutPhoto(null)}
                className="px-2.5 py-1 bg-white hover:bg-gray-100 border-2 border-black rounded-lg text-xs font-extrabold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div
              className={`w-full h-80 sm:h-[450px] ${
                popOutPhoto.bgColor || "bg-gray-100"
              } flex items-center justify-center`}
            >
              {popOutPhoto.url ? (
                <img
                  src={popOutPhoto.url}
                  alt={popOutPhoto.title}
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <span className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-black">
                  {popOutPhoto.title}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}