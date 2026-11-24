import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createReport } from "../services/reportService";
import { getReferenceData } from "../services/referenceData";

const CATEGORIES = [
  { id: 1, slug: "card-document", name: "ID Card / Documents" },
  { id: 2, slug: "electronics", name: "Electronics" },
  { id: 3, slug: "bags-wallets", name: "Bags / Wallets" },
  { id: 4, slug: "drinkware", name: "Drinkware" },
  { id: 5, slug: "keys", name: "Keys" },
  { id: 6, slug: "clothing", name: "Clothing" },
  { id: 7, slug: "stationery", name: "Stationery" },
  { id: 8, slug: "other", name: "Other" },
];

const LOCATIONS = [
  { id: 1, slug: "gedung-a", name: "Gedung A" },
  { id: 2, slug: "gedung-b", name: "Gedung B" },
  { id: 3, slug: "perpustakaan", name: "Perpustakaan" },
  { id: 4, slug: "kantin", name: "Kantin" },
  { id: 5, slug: "sekretariat", name: "Sekretariat" },
  { id: 6, slug: "pos-satpam", name: "Pos Satpam" },
  { id: 7, slug: "musholla", name: "Musholla" },
  { id: 8, slug: "area-parkir", name: "Area Parkir" },
  { id: 9, slug: "lainnya", name: "Lainnya" },
];

export default function CreateReportPage() {
  const navigate = useNavigate();
  
  // State untuk menyimpan semua isi formulir
  const [reportType, setReportType] = useState("FOUND"); 

  const [categories, setCategories] = useState(CATEGORIES);
  const [locations, setLocations] = useState(LOCATIONS);

  const [itemName, setItemName] = useState("");
  const [category, setcategory] = useState("");
  const [location, setlocation] = useState("");
  const [locationDetail, setLocationDetail] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [publicContactMethod, setPublicContactMethod] = useState("WHATSAPP");
  const [contactValue, setContactValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isFound = reportType === "FOUND";
  const todayStr = new Date().toLocaleDateString("en-CA");

  useEffect(() => {
    getReferenceData().then((ref) => {
      if (ref?.categories?.length) setCategories(ref.categories);
      if (ref?.locations?.length) setLocations(ref.locations);
    });
  }, []);

  // Pemilihan file foto (ukuran file max 5MB, remove, dan drag-and-drop foto)
  const handleFileChange = (file) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      alert("File must PNG, JPG, or WEBP")
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
  
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    handleFileChange(droppedFile);
  };
  
  // Menangani tombol Submit Report (tanggal otomatis terisi hari ini)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    const cleanedContact = 
      publicContactMethod === "INSTAGRAM"
        ? contactValue.trim().replace(/^@+/, "")
        : contactValue.trim();

    const payload = {
      type: reportType,
      itemName: itemName.trim(),
      category,
      location,
      locationDetail: locationDetail.trim() || null,
      eventDate,
      description: description.trim(),
      image: photo || null,
      reporterName: reporterName.trim(),
      publicContactMethod,
      contactWhatsapp: publicContactMethod === "WHATSAPP" ? cleanedContact : null,
      contactInstagram: publicContactMethod === "INSTAGRAM" ? cleanedContact : null,
      contactLine: publicContactMethod === "LINE" ? cleanedContact : null,
      contactEmail: publicContactMethod === "EMAIL" ? cleanedContact : null,
    };

    try {
      setIsSubmitting(true);
      await createReport(payload);
      navigate("/reports");
    } catch (err) {
      alert(err?.message || "Failed to submit report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // CSS konstan
  const box =
    "w-full px-3.5 py-2.5 text-sm bg-white border-2 border-black rounded-xl focus:outline-none focus:bg-gray-100";
  const name =
    "block text-[11px] font-extrabold uppercase tracking-wider mb-1.5"
  
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

          {/* Pilihan Lost or Found */}
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

        {/* Bingkai formulir utama */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border-2 border-black rounded-2xl shadow-[5px_5px_0px_#000] p-6 sm:p-8 space-y-5"
        >
          {/* ITEM NAME */}
          <div>
            <label className={name}>
              Item Name
            </label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={100}
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Black leather wallet"
              className={box}
            />
          </div>

          {/* CATEGORY & DATE */}
          <div>
            <label className={name}>
              Category
            </label>
            <select
              required
              value={category}
              onChange={(e) => setcategory(e.target.value)}
              className={box}
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block-text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
              {isFound ? "Date Found" : "Date Lost"}
            </label>
            <input
              type="date"
              required
              max={todayStr}
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className={box}
            />
          </div>

          {/* LOCATION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={name}>
                {isFound ? "Where was it found?" : "Where was it lost?"}
              </label>
              <select
                required
                value={location}
                onChange={(e) => setlocation(e.target.value)}
                className={box}
                >
                  <option value="" disabled>
                    Select a Location
                  </option>
                  {locations.map((loc) => (
                  <option key={loc.slug} value={loc.slug}>
                    {loc.name}
                  </option>
                ))}
                </select>
              </div>
              <div>
                <label className={name}>
                  Location Details (Optional)
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={locationDetail}
                  onChange={(e) => setLocationDetail(e.target.value)}
                  placeholder="e.g. Ruang A2.06"
                  className={box}
                />
              </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className={name}>
              Description
            </label>
            <textarea
              rows={4}
              required
              minLength={10}
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Colour, brand, marks, what makes it identifiable..."
              className={`${box} resize-none`}
            />
          </div>

          {/* PHOTOS (Drag & Drop atau Browse) */}
          <div>
            <label className={name}>
              Photos
            </label>
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="w-full min-h-30 bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-black rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
            >
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
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
                    PNG, JPG, or WEBP, up to 5 MB each
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

          {/* YOUR NAME & PREFERRED CONTACT METHOD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={name}>
                Your Name
              </label>
              <input
                type="text"
                required
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="Full name"
                className={box}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
                Preferred Contact Method
              </label>
              <select
                required
                value={publicContactMethod}
                onChange={(e) => {
                  setPublicContactMethod(e.target.value);
                  setContactValue("");
                }}
                className={box}
              >
                <option value="WHATSAPP">WhatsApp</option>
                <option value="INSTAGRAM">Instagram</option>
                <option value="LINE">LINE</option>
                <option value="EMAIL">Email</option>
              </select>
            </div>
          </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
                {publicContactMethod === "WHATSAPP" && "WhatsApp Number"}
                {publicContactMethod === "INSTAGRAM" && "Instagram Username"}
                {publicContactMethod === "LINE" && "LINE ID"}
                {publicContactMethod === "EMAIL" && "Email Address"}
              </label>
              <input
                type={publicContactMethod === "EMAIL" ? "email" : "text"}
                required
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder={
                  publicContactMethod === "WHATSAPP"
                    ? "e.g. 08123456789"
                    : publicContactMethod === "INSTAGRAM"
                    ? "username (without @)"
                    : publicContactMethod === "LINE"
                    ? "e.g. line_id"
                    : "e.g. name@example.com"
                }
                className={box}
              />
            </div>
          </div>

          {/* Tombol SUBMIT REPORT & CANCEL */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-black text-white hover:bg-neutral-800 active:translate-x-0.5 active:translate-y-0.5 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer"
            >
              Submit Report
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-white text-black hover:bg-gray-100 active:translate-x-0.5 active:translate-y-0.5 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}