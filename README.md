
---

<p align="center">
  <img src="https://raw.githubusercontent.com/github/explore/main/topics/whatsapp/whatsapp.png" alt="Logo" width="120">
</p>

<h1 align="center">rhnx-bot — WhatsApp Bot Base (ESM)</h1>

<p align="center">
  <a href="https://github.com/USERNAME/NAMA-REPO/stargazers"><img src="https://img.shields.io/github/stars/USERNAME/NAMA-REPO?style=social" alt="GitHub stars"></a>
  <a href="https://github.com/USERNAME/NAMA-REPO/blob/main/LICENSE"><img src="https://img.shields.io/github/license/USERNAME/NAMA-REPO?color=blue" alt="License"></a>
  <img src="https://img.shields.io/badge/node-%3E=18.x-brightgreen" alt="Node.js Version">
</p>

Base WhatsApp Bot menggunakan [Baileys](https://github.com/WhiskeySockets/Baileys).  
Dibuat dengan **ECMAScript Module (ESM)** sehingga lebih modern dan clean.  
Cocok untuk developer yang ingin membuat bot sendiri dengan sistem **plugin**, **command**, dan **hook**.

---

## ✨ Fitur Utama
- ✅ **Command system** — mudah menambah perintah baru.
- ✅ **Hook system** — jalankan kode sebelum & sesudah setiap pesan/command.
- ✅ **Kategori & subkategori** — menu lebih rapi.
- ✅ Full **ESM support** → gunakan `export default` untuk plugin.
- ✅ Open-source & bebas dikembangkan.

---

## 📦 Instalasi

> **Disarankan** memakai [Termux](https://termux.dev/) di Android atau terminal Linux.

```bash
# Clone repo
git clone https://github.com/rhnxofficial/rhnx-bot.git
cd rhnx-bot

# Install dependency
npm install


---

🚀 Menjalankan Bot

node main.js

Bot akan menampilkan QR code / pairing code di terminal.
Scan atau masukkan kodenya di aplikasi WhatsApp untuk menghubungkan bot.


---

⚙️ Struktur Plugin

Semua fitur bot dibuat dalam bentuk plugin (.js di folder plugins).
Ada 3 tipe utama:

1. Command → Perintah dari user (misal .ping, .case).


2. Hook → Kode otomatis sebelum/ sesudah setiap pesan.


3. Case → Command dengan subkategori & subdeskripsi (menu rapi).




---

1️⃣ Contoh Hook

/plugins/hook/hookExample.js

"use strict";

export default {
  name: "hookExample",
  description: "Contoh plugin hook dengan before & after",
  type: "hook",

  before: async (m, { conn }) => {
    if (m.text?.toLowerCase() === "tess") {
      await conn.sendMessage(m.chat, { text: "✅ Before hook jalan" }, { quoted: m });
    }
  },

  after: async (m, { conn, command }) => {
    if (command) {
      await conn.sendMessage(m.chat, { text: `✅ After hook: *${command}* diproses` }, { quoted: m });
    }
  },
};


---

2️⃣ Contoh Command

/plugins/command/mode.js

"use strict";

export default {
  name: "mode",
  alias: ["public", "self"],
  description: "Ubah mode bot (public/self)",

  run: async (m, { conn, isOwner }) => {
    if (!isOwner) return m.reply("⚠️ Khusus owner!");
    // logika ubah mode
  }
};


---

3️⃣ Contoh Case

/plugins/case/case.js

"use strict";

export default {
  name: "case",
  alias: ["listcase","getcase"],
  description: "Kelola text formatter & case",

  subCategories: {
    getcase: "Owner",
    listcase: "Owner"
  },

  subDescriptions: {
    getcase: "Mengambil fitur case",
    listcase: "Lihat daftar case"
  },

  run: async (m, { conn, command, q, setReply }) => {
    // logic case
  }
};


## 🌐 Sosial & Support

Kalau ada pertanyaan, bug report, atau sekadar ngobrol bareng dev lain, join komunitas:

- 📱 **WhatsApp Group:** [![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?logo=whatsapp&logoColor=white)](https://chat.whatsapp.com/XXXXXXX)
- ▶️ **YouTube Channel:** [![YouTube](https://img.shields.io/badge/YouTube-FF0000?logo=youtube&logoColor=white)](https://youtube.com/@USERNAME)
- 🐦 **Twitter / X:** [![Twitter](https://img.shields.io/badge/Twitter-000000?logo=x&logoColor=white)](https://x.com/USERNAME)
- 💬 **Discord Server:** [![Discord](https://img.shields.io/badge/Discord-5865F2?logo=discord&logoColor=white)](https://discord.gg/XXXXXXX)

> Jangan lupa **subscribe & follow** buat dukung project ini terus berkembang 🙌