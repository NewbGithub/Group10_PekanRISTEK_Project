// Pemetaan: metode kontak publik -> nama kolom yang menyimpan nilainya.
// Dipakai oleh validator, mapper privasi, dan repository supaya tidak ada duplikasi.
const CONTACT_FIELD_BY_METHOD = {
  WHATSAPP: 'contactWhatsapp',
  INSTAGRAM: 'contactInstagram',
  LINE: 'contactLine',
  EMAIL: 'contactEmail',
};

module.exports = { CONTACT_FIELD_BY_METHOD };
