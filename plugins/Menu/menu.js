import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pluginsDir = path.join(process.cwd(), "plugins");
const dataGcStore = "./database/store/groupstore.json";

const getGroupStoreIds = () => {
  if (!fs.existsSync(dataGcStore)) return [];
  const dataStoreId = JSON.parse(fs.readFileSync(dataGcStore));
  return dataStoreId.map((group) => group.jid);
};

let groupStoreIds = getGroupStoreIds();

function listFeatures(categories) {
  let text = "";
  for (const cat of Object.keys(categories)) {
    text += `\n▧──··· \`「 ${cat} 」\`\n`;
    for (const p of categories[cat]) {
      text += `◉ ${p.name}\n`;
      text += `> └ ${p.description}\n`;
    }
  }
  return text || "Belum ada fitur.";
}

export default {
  name: "menu",
  alias: ["help", "cmd"],
  description: "Menampilkan daftar command",
  run: async (m, { conn, prefix, isOwner }) => {
    const data = global.db.data.others?.["newinfo"];
    const info = data ? data.info : "";
    const timeInfo = data
      ? clockString(new Date() - data.lastinfo)
      : "tidak ada";

    const categories = {};
    const isGroupStore = m.isGroup && groupStoreIds.includes(m.chat);

    const folders = fs.readdirSync(pluginsDir).filter(f =>
      fs.statSync(path.join(pluginsDir, f)).isDirectory()
    );

    for (const folder of folders) {
      const folderPath = path.join(pluginsDir, folder);
      const files = fs.readdirSync(folderPath).filter(f => f.endsWith(".js"));

      for (const file of files) {
        const pluginPath = path.join(folderPath, file);
        try {
          const { default: plugin } = await import(pathToFileURL(pluginPath).href);

          if (!plugin || !plugin.name) continue;
          if (!m.isGroup && !plugin.access?.private) continue;
          if (isGroupStore && !plugin.access?.groupstore) continue;
          if (
            m.isGroup &&
            !isGroupStore &&
            ["function", "game_hook"].includes(folder.toLowerCase()) &&
            !isOwner
          )
            continue;
          if (!isOwner && ["function", "game_hook"].includes(folder.toLowerCase()))
            continue;

          // === HANDLE SUBCATEGORY ===
          if (plugin.subCategories) {
            for (let alias in plugin.subCategories) {
              const category = plugin.subCategories[alias];
              if (!categories[category]) categories[category] = [];

              categories[category].push({
                name: alias,
                description:
                  plugin.subDescriptions?.[alias] ||
                  plugin.description ||
                  "Tidak ada deskripsi",
              });
            }
            continue;
          }

          if (!categories[folder]) categories[folder] = [];
          categories[folder].push({
            name: plugin.name,
            description: plugin.description || "Tidak ada deskripsi",
          });
        } catch (err) {
          console.error("❌ Gagal load plugin:", file, err.message);
        }
      }
    }

    const jid = m.sender;
    const fitur = listFeatures(categories);
    let menuText = "";

    if (!m.isGroup) {
      menuText = styleSans(`
Hi @${jid.split("@")[0]} 🪸
I am ${bot.name} Assistant, your private WhatsApp helper.

◦ "Database" : 
◦ "Library" : Baileys@6.7.9
◦ "Rest API" : ${bot.api}
◦ *Source*   :  

${fitur}
`);
      return conn.sendMessage(
        m.chat,
        { text: menuText, contextInfo: { mentionedJid: [m.sender] } },
        { quoted: m }
      );
    }

    if (isGroupStore) {
      menuText = styleSans(`
🛍️ Welcome to Store Group, @${jid.split("@")[0]}!
I am ${bot.name} Assistant, here to help manage your store needs.

◦ "Database" : 
◦ "Library" : Baileys@6.7.9
◦ "Rest API" : ${bot.api}
◦ *Source*   :  

${fitur}
`);
      const contextInfo = {
        forwardingScore: 100,
        isForwarded: true,
        containsAutoReply: true,
        mentionedJid: [m.sender],
        businessMessageForwardInfo: { businessOwnerJid: m.botNumber },
        externalAdReply: {
          title: styleSans("@ rhnx - bot wa"),
          body: styleSans(`Runtime ${runTime}`),
          mediaType: 1,
          renderLargerThumbnail: true,
          thumbnailUrl: image.banner,
        },
        sourceUrl: bot.website,
      };
      return conn.sendMessage(m.chat, { text: menuText, contextInfo }, { quoted: m });
    }

    menuText = await global.t(`
👋 Halo @${jid.split("@")[0]}!
Kamu sedang berinteraksi dengan ${bot.name}, sebuah Bot Base WhatsApp open-source.
Pengembang dapat menyesuaikan dan menambahkan perintah mereka sendiri di sini.

◎ "Language" : ${db.data.settings.language || "id"}
◎ "styleText" : ${db?.data?.settings?.style || "sans"}
◎ "Database" : 
◎ "Library" : ${baileys.name} ${baileys.version}
◎ "Rest API" : ${bot.api}
◎ "Source" : ${bot.script}

🆕 *Latest Update :*
◎ ${info}
◎ di update ${timeInfo} yang lalu

 📑 *– List - Menu*
${readmore}
${fitur}
`);

    const tqto = `
▧──···「 *Thanks To* 」
▹ Raihan Fadillah 
𝘗𝘰𝘸𝘦𝘳𝘦𝘥 𝘉𝘺 𝘕𝘰𝘥𝘦𝘫𝘴`;

    m.react("🥏");
    conn.sendMessageModify(m.chat, menuText + tqto, m, {
      title: styleSans("© rhnx - bot wa"),
      body: "",
      largeThumb: true,
      thumbnail: image.banner,
      url: "https://api.rhnx.xyz",
      businessOwnerJid: m.botNumber,
      mentions: [m.sender],
    });

    await conn.sendvn(
      m.chat,
      "https://raw.githubusercontent.com/upload-file-lab/fileupload6/main/uploads/1758729346428.oga",
      m
    );
  },
};