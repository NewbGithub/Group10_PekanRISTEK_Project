// "Saklar" penyimpanan data: memilih repository berdasarkan env STORAGE.
//   STORAGE=memory -> data di array (Checkpoint 2, tanpa database)
//   STORAGE=prisma -> PostgreSQL lewat Prisma (Checkpoint 3)
// Kedua repository punya fungsi yang SAMA, sehingga service tidak perlu tahu data disimpan di mana.
// require dilakukan di dalam kondisi supaya Prisma hanya dimuat jika benar-benar dipakai.
const config = require('../config');

module.exports =
  config.storage === 'prisma'
    ? require('./reportRepository.prisma')
    : require('./reportRepository.memory');
