import fs from "fs-extra";
import pkg from "baileys/package.json" with { type: "json" };
import stringSimilarity from "string-similarity";
import { styleText, styleSans } from "./media/text/styleText.js";
import chalk from "chalk";

// FUNCTION CODE
let d = new Date();
let locale = "id";
let currentYear = d.getFullYear();
let gmt = new Date(0).getTime() - new Date(`1 Januari ${currentYear}`).getTime();
let week = d.toLocaleDateString(locale, { weekday: "long" });
const calender = d.toLocaleDateString(locale, {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const sleep = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

async function similarity(one, two) {
  const treshold = stringSimilarity.compareTwoStrings(one, two);
  return treshold.toFixed(2);
}

function makeid(length){
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

// GLOBAL
global.system = {
  sessionName: "session",
  pairingCode: true,
  pairingNumber: "628××××", // nomor bot didie
  runWith: "pterodactyl",
  Intervalmsg: 1000,
};

global.baileys = {
  name: pkg.name,
  version: pkg.version,
  description: pkg.description || "Virtual assistant for WhatsApp",
  author: pkg.author || "Raihan Fadillah",
  license: pkg.license || "MIT",
};

global.owner = {
  lid: "158467297935424@lid",
  contact: "628×××××",
  number: "6281316643491@s.whatsapp.net",
  name: "Raihan Fadillah",
  email: "ehanzdhoanx@gmail.com",
};

global.sosmed = {
  youtube: "https://www.youtube.com/@rhnxofficial",
  whatsapp: "https://chat.whatsapp.com/EcaZKuqXYGk8DL35OUCetp",
  instagram: "https://www.instagram.com/rhnxofficial",
  tiktok: "https://www.tiktok.com/@rhnxofficial",
  github: "https://github.com/rhnxofficial",
  website: "https://rhnx.xyz",
};

global.bot = {
  name: "ʀʜɴx | ʙᴏᴛ-ᴡᴀ",
  number: "6285795718659",
  email: "rhnxofficial@gmail.com",
  website: "https://rhnx.xyz",
  api: "https://api.rhnx.xyz",
  script: "https://script.rhnx.xyz",
};

global.api = {
  rhnx: "https://api.rhnx.xyz",
  github: "https://api.github.com",
};

global.key = {
  rhnx: "rhnx-280624",
  tokenGithub: "YOUR_KEY",
};

global.image = {
  default: "https://d.top4top.io/p_3523ppf6e1.jpg",
  logoTech: "https://c.top4top.io/p_3523cv0wt1.jpg",
  banner: "https://a.top4top.io/p_35237jw2r1.jpg",
};

// style global
global.styleText = (text) =>
  styleText(text, db.data.settings.style || "normal");
global.similarity = (one, two) => similarity(one, two);
global.sleep = sleep;
global.readmore = readmore;
global.week = week;
global.calender = calender;
global.makeid = makeid
global.styleSans = styleSans;

const file = new URL(import.meta.url).pathname;
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.bgRed(`UPDATE ${file}`));
  import(`${import.meta.url}?update=${Date.now()}`);
});