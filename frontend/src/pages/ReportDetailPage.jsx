import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getReportById } from "../services/reportService";

function formatEventDate(dateStr) {
  if (!dateStr) return "-";
  const parsed = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getContactDisplay(contact) {
  if (!contact?.value) return { label: "Contact", value: "-" };

  switch (contact.method) {
    case "WHATSAPP":
      return { label: "WhatsApp", value: contact.value };
    case "INSTAGRAM":
      return {
        label: "Instagram",
        value: `@${contact.value.replace(/^@+/, "")}`,
      };
    case "LINE":
      return { label: "LINE", value: contact.value };
    case "EMAIL":
      return { label: "Email", value: contact.value };
    default:
      return { label: contact.method || "Contact", value: contact.value };
  }
}

export default function ReportDetailPage() {
  const { id } = useParams();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  const [copiedLink, setCopiedLink] = useState(false);
  const [showClaimInfo, setShowClaimInfo] = useState(false);
  const [copiedContact, setCopiedContact] = useState(false);
  const [popOutPhoto, setPopOutPhoto] = useState(false);

  useEffect (() => {
    let isMounted = true;
      
    const fetchReport = async () => {
      setLoading(true);
      setError("");
      setNotFound(false);

      try {
        const data = await getReportById(id);
        if (!isMounted) return;
        
        if (!data) {
          setNotFound(true);
          setReport(null);
        } else {
          setReport(data);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err?.message || "Failed to load report")
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReport();
    return () => {
      isMounted = false;
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white border-2 border-black rounded-xl p-6 text-center space-y-2">
          <p className="font-bold text-red-600">Something went wrong</p>
          <p className="text-xs text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (notFound || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white border-2 border-black rounded-xl p-6 text-center space-y-1">
          <p className="text-xl font-extrabold">404</p>
          <p className="font-bold">Report not found.</p>
        </div>
      </div>
    );
  }

  const isFound = report.type?.toUpperCase() === "FOUND";

  const fullLocation = [report.location?.name, report.locationDetail]
    .filter(Boolean)
    .join(" — ");

  const contactInfo = getContactDisplay(report.contact);

  const handleShareReport = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      alert("Failed to copy the report link.");
    }
  };

  const handleCopyContact = async () => {
    if (!contactInfo.value || contactInfo.value === "-") return;

    try {
      await navigator.clipboard.writeText(contactInfo.value);
      setCopiedContact(true);
      setTimeout(() => setCopiedContact(false), 2000);
    } catch {
      alert("Failed to copy the contact.");
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-black py-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* KOLOM KIRI: Foto & About this item */}
          <div className="lg:col-span-7 space-y-5">
            {/* Foto */}
            <div
              onClick={() => report.imageUrl && setPopOutPhoto(true)}
              className={`w-full h-72 sm:h-96 bg-gray-100 border-2 border-black rounded-xl shadow-[4px_4px_0px_#000] overflow-hidden flex items-center justify-center relative ${
                report.imageUrl ? "cursor-pointer group" : ""
              }`}
            >
              {report.imageUrl ? (
                <img
                  src={report.imageUrl}
                  alt={report.itemName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-black">
                  PHOTO · {report.category?.name || "ITEM"}
                </span>
              )}
            </div>

            {/* Deskripsi Item */}
            <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_#000] p-5 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold mb-2">
                About this item
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                {report.description}
              </p>
            </div>
          </div>

          {/* KOLOM KANAN: Kartu Detail, Tombol Klaim, Share, dan Safety Tip */}
          <div className="lg:col-span-5 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_#000] p-5 sm:p-6 space-y-5">
            <div>
              <span
                className={`inline-block px-3 py-1 text-xs font-bold uppercase border-2 border-black rounded-md ${isFound ? "bg-black text-white" : "bg-white text-black"
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
                <span className="font-bold text-right">{fullLocation || "-"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  {isFound ? "Date found" : "Date lost"}
                </span>
                <span className="font-bold text-right">
                  {formatEventDate(report.eventDate)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Category</span>
                <span className="font-bold text-right">
                  {report.category?.name || "-"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Report ID</span>
                <span className="font-bold text-right font-mono text-xs">
                  {report.id}
                </span>
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
                <p className="text-xs text-gray-500">Reporter</p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={() => setShowClaimInfo(!showClaimInfo)}
                className="w-full py-3 px-4 bg-black text-white hover:bg-neutral-800 active:translate-x-0.5 active:translate-y-0.5 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] font-bold text-sm transition-all cursor-pointer"
              >
                {isFound
                  ? "This is mine — start a claim"
                  : "I found this — contact owner"}
              </button>

              {showClaimInfo && (
                <div className="p-3 bg-gray-100 border-2 border-black rounded-xl flex items-center justify-between gap-2 text-xs sm:text-sm">
                  <span className="font-bold break-all">
                    {contactInfo.label}: {contactInfo.value}
                  </span>
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
                className="w-full py-3 px-4 bg-white text-black hover:bg-gray-100 active:translate-x-0.5 active:translate-y-0.5 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] font-bold text-sm transition-all cursor-pointer"
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

      {popOutPhoto && report.imageUrl && (
        <div
          onClick={() => setPopOutPhoto(false)}
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_#000] overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b-2 border-black">
              <span className="text-xs font-extrabold uppercase tracking-wider">
                {report.itemName}
              </span>
              <button
                type="button"
                onClick={() => setPopOutPhoto(false)}
                className="px-2.5 py-1 bg-white hover:bg-gray-100 border-2 border-black rounded-lg text-xs font-extrabold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="w-full h-80 sm:h-112.5 bg-gray-100 flex items-center justify-center">
              <img
                src={report.imageUrl}
                alt={report.itemName}
                className="w-full h-full object-contain bg-black"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}