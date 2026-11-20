import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateReportPage() {
  const navigate = useNavigate();

  // State untuk menyimpan semua isi formulir
  const [reportType, setReportType] = useState("FOUND"); // "LOST" atau "FOUND"
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [contact, setContact] = useState("");

  const isFound = reportType === "FOUND";

  // Menangani pemilihan file foto + validasi max 5MB
  const handleFileChange = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran foto maksimal 5 MB ya!");
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = (e) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    setPhoto(null);
    setPhotoPreview("");
  };

  // Menangani saat user drag-and-drop foto ke kotak biru
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    handleFileChange(droppedFile);
  };

  // Menangani tombol Submit Report
  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      type: reportType,
      itemName,
      category,
      date,
      location,
      description,
      photoName: photo ? photo.name : null,
      reporterName,
      contact,
      onlyVerified,
    };

    console.log("Data Laporan Siap Dikirim ke Backend:", payload);
    alert(`Laporan "${itemName}" berhasil dibuat!`);
    navigate("/reports");
  };

  return (
    <div className="min-h-screen bg-[#FDF6E3] text-black py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Judul & Subjudul Atas */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Report an item
          </h1>
          <p className="text-xs sm:text-sm text-gray-700 max-w-md mx-auto leading-relaxed">
            Share as much detail as you can. Keep private details, like card
            numbers, out of the description.
          </p>

          {/* Pill Toggle: I LOST SOMETHING / I FOUND SOMETHING */}
          <div className="mt-5 inline-flex items-center bg-[#DBEAFE] border-2 border-black rounded-full p-1 gap-1">
            <button
              type="button"
              onClick={() => setReportType("LOST")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all cursor-pointer ${
                !isFound
                  ? "bg-black text-white"
                  : "text-black hover:bg-blue-200/60"
              }`}
            >
              I lost something
            </button>
            <button
              type="button"
              onClick={() => setReportType("FOUND")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all cursor-pointer ${
                isFound
                  ? "bg-black text-white"
                  : "text-black hover:bg-blue-200/60"
              }`}
            >
              I found something
            </button>
          </div>
        </div>

        {/* Kartu Formulir Utama */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border-2 border-black rounded-2xl shadow-[5px_5px_0px_#000] p-6 sm:p-8 space-y-5"
        >
          {/* ITEM NAME */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
              Item Name
            </label>
            <input
              type="text"
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Black leather wallet"
              className="w-full px-3.5 py-2.5 text-sm border-2 border-black rounded-xl focus:outline-none focus:bg-[#FEF9C3]"
            />
          </div>

          {/* CATEGORY & DATE FOUND/LOST (2 Kolom di Desktop, Tumpuk di HP) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border-2 border-black rounded-xl bg-white focus:outline-none focus:bg-[#FEF9C3]"
              >
                <option value="" disabled>
                  Select a category
                </option>
                <option value="Electronics">Electronics / Phone</option>
                <option value="Food/Drink">Food / Drink</option>
                <option value="Documents">ID Card / Documents</option>
                <option value="Keys">Keys</option>
                <option value="Wallet">Wallet</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
                {isFound ? "Date Found" : "Date Lost"}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border-2 border-black rounded-xl bg-white focus:outline-none focus:bg-[#FEF9C3]"
              />
            </div>
          </div>

          {/* WHERE WAS IT FOUND / LOST? */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
              {isFound ? "Where was it found?" : "Where was it lost?"}
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Room number, floor"
              className="w-full px-3.5 py-2.5 text-sm border-2 border-black rounded-xl focus:outline-none focus:bg-[#FEF9C3]"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Colour, brand, marks, what makes it identifiable..."
              className="w-full px-3.5 py-2.5 text-sm border-2 border-black rounded-xl focus:outline-none focus:bg-[#FEF9C3] resize-none"
            />
          </div>

          {/* PHOTOS (Drag & Drop atau Browse) */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
              Photos
            </label>
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="w-full min-h-[120px] bg-[#DBEAFE] hover:bg-[#bfdbfe] border-2 border-dashed border-black rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
            >
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
                className="hidden"
              />

              {photoPreview ? (
                <div className="space-y-2">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="max-h-32 mx-auto rounded-lg border-2 border-black object-cover"
                  />
                  <p className="text-xs font-bold">
                    {photo?.name} (Klik untuk ganti foto)
                  </p>
                </div>
              ) : (
                <>
                  <span className="text-xs font-extrabold uppercase tracking-wide">
                    Drag photos here or browse
                  </span>
                  <span className="text-[11px] text-gray-600 mt-1">
                    PNG or JPG, up to 5 MB each
                  </span>
                </>
              )}
            </label>
            {photoPreview && (
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-3 py-1 bg-[#FCA5A5] hover:bg-[#f87171] border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] text-xs font-bold cursor-pointer"
                >
                  Hapus Foto
                </button>
              </div>
            )}
          </div>

          {/* YOUR NAME & EMAIL OR PHONE (2 Kolom) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
                Your Name
              </label>
              <input
                type="text"
                required
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="Full name"
                className="w-full px-3.5 py-2.5 text-sm border-2 border-black rounded-xl focus:outline-none focus:bg-[#FEF9C3]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
                WA / LINE / INSTAGRAM
              </label>
              <input
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={
                  isFound
                    ? "How should the owner reach you?"
                    : "How should the finder reach you?"
                }
                className="w-full px-3.5 py-2.5 text-sm border-2 border-black rounded-xl focus:outline-none focus:bg-[#FEF9C3]"
              />
            </div>
          </div>

          {/* Tombol SUBMIT REPORT & CANCEL */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-3 bg-[#FF4D79] hover:bg-[#ff3366] active:translate-x-[2px] active:translate-y-[2px] border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer"
            >
              Submit Report
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-white hover:bg-gray-100 active:translate-x-[2px] active:translate-y-[2px] border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}