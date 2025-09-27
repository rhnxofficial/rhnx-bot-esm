"use strict";

export default {
  name: "fashion",
  alias: ["baju"],
  description: "Menampilkan baju",
  tags: ["tools"],
  access: { groupstore: true },
  run: async (conn, m, args) => {
    try {
      m.reply("belom ready cuy");
    } catch (e) {
      console.error(e);
      m.reply("Terjadi kesalahan.");
    }
  },
};