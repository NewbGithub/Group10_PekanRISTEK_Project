const MOCK_KEY = "reports_mock";

const MOCK_DATA = [
  {
    id: 1,
    type: "LOST",
    itemName: "Kunci Motor",
    category: "Elektronik",
    location: "Gedung A Kampus",
    description: "Kunci motor warna hitam hilang di sekitar parkir Gedung A pada sore hari.",
    imageUrl: null,
    contact: "081234567890",
    createdAt: "2026-11-10T08:30:00Z",
    status: "OPEN",
  },
  {
    id: 2,
    type: "FOUND",
    itemName: "KTM",
    category: "Dokumen/KTM",
    location: "Perpustakaan",
    description: "KTM ditemukan di meja baca perpustakaan lantai 2.",
    imageUrl: null,
    contact: "081234567891",
    createdAt: "2026-11-11T10:15:00Z",
    status: "OPEN",
  },
  {
    id: 3,
    type: "LOST",
    itemName: "Tas Ransel",
    category: "Alat Makan & Minum",
    location: "Kantin",
    description: "Tas ransel biru hilang di area duduk kantin.",
    imageUrl: null,
    contact: "081234567892",
    createdAt: "2026-11-12T12:00:00Z",
    status: "OPEN",
  },
  {
    id: 4,
    type: "FOUND",
    itemName: "Dompet",
    category: "Dokumen/KTM",
    location: "Auditorium",
    description: "Dompet coklat ditemukan di kursi auditorium setelah acara.",
    imageUrl: null,
    contact: "081234567893",
    createdAt: "2026-11-13T14:45:00Z",
    status: "OPEN",
  },
  {
    id: 5,
    type: "LOST",
    itemName: "Headset",
    category: "Elektronik",
    location: "Lab Komputer",
    description: "Headset hitam meninggalkan di komputer laboratorium.",
    imageUrl: null,
    contact: "081234567894",
    createdAt: "2026-11-14T09:00:00Z",
    status: "OPEN",
  },
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const seed = () => {
  const existing = localStorage.getItem(MOCK_KEY);
  if (!existing) {
    localStorage.setItem(MOCK_KEY, JSON.stringify(MOCK_DATA));
  }
};

const readAll = () => JSON.parse(localStorage.getItem(MOCK_KEY) || "[]");
const writeAll = (reports) => localStorage.setItem(MOCK_KEY, JSON.stringify(reports));

export const getReports = async () => {
  seed();
  await delay(300);
  return [...readAll()];
};

export const getReportById = async (id) => {
  seed();
  await delay(300);
  const reports = readAll();
  return reports.find((report) => report.id === Number(id)) || null;
};

export const createReport = async (newReport) => {
  seed();
  await delay(500);
  const reports = readAll();
  const id = reports.length > 0 ? Math.max(...reports.map((r) => r.id)) + 1 : 1;
  const report = {
    ...newReport,
    id,
    createdAt: new Date().toISOString(),
    status: "OPEN",
  };
  writeAll([...reports, report]);
  return report;
};

export const updateReportStatus = async (id, newStatus) => {
  seed();
  await delay(400);
  const reports = readAll();
  const index = reports.findIndex((report) => report.id === Number(id));
  if (index === -1) return null;
  reports[index] = { ...reports[index], status: newStatus };
  writeAll(reports);
  return reports[index];
};
