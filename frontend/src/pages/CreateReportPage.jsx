import { useState } from "react";
import { useNavigate } from "react-router-dom";

const inputClass =
  "w-full px-3.5 py-2.5 text-sm bg-white border-2 border-black rounded-xl focus:outline-none focus:bg-gray-100";

export default function CreateReportPage() {
  const navigate = useNavigate();

  // State untuk menyimpan semua isi formulir
  const [reportType, setReportType] = useState("FOUND"); // "LOST" atau "FOUND"
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
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
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      alert("File must PNG or JPG")
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Photo must be 5 MB or smaller");
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = (e) => {
    e.preventDefault();
    setPhoto(null);
    setPhotoPreview("");
  };

  // Menangani saat user drag-and-drop foto ke kotak upload
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    handleFileChange(droppedFile);
  };

  // Menangani tombol Submit Report (tanggal otomatis terisi hari ini)
  const handleSubmit = (e) => {
    e.preventDefault();

    const now = new Date();
    const autoDate = now.toLocaleDateString("en-CA");

    const payload = {
      type: reportType,
      itemName,
      category,
      date: autoDate,
      submittedAt: now.toISOString(),
      location,
      description,
      photoName: photo ? photo.name : null,
      reporterName,
      contact,
    };

    console.log("Report data ready to be sent to BackEnd:", payload);
    alert(`Report "${itemName}" submitted successfully`);
    navigate("/reports");
  };

  return (
    <div className="min-h-screen bg-transparent text-black py-10 px-4 sm:px-6">
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
          <div className="mt-5 inline-flex items-center bg-white border-2 border-black rounded-full shadow-[3px_3px_0px_#000] p-1 gap-1">
            <button
              type="button"
              onClick={() => setReportType("LOST")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all cursor-pointer ${!isFound
                  ? "bg-black text-white"
                  : "text-black hover:bg-gray-100"
                }`}
            >
              I lost something
            </button>
            <button
              type="button"
              onClick={() => setReportType("FOUND")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all cursor-pointer ${isFound
                  ? "bg-black text-white"
                  : "text-black hover:bg-gray-100"
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
              className={inputClass}
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
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
              className={inputClass}
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
              className={`${inputClass} resize-none`}
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
              className="w-full min-h-[120px] bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-black rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
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
                    {photo?.name} <br /> (Click to change photo)
                  </p>
                </div>
              ) : (
                <>
                  <span className="text-xs font-extrabold uppercase tracking-wide">
                    Drag photos here
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
                  className="px-3 py-1 bg-white hover:bg-gray-100 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] text-xs font-bold cursor-pointer"
                >
                  Remove Photo
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
                className={inputClass}
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
                placeholder="Your Contact"
                className={inputClass}
              />
            </div>
          </div>

          {/* Tombol SUBMIT REPORT & CANCEL */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-3 bg-black text-white hover:bg-neutral-800 active:translate-x-[2px] active:translate-y-[2px] border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer"
            >
              Submit Report
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-white text-black hover:bg-gray-100 active:translate-x-[2px] active:translate-y-[2px] border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}