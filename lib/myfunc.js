import axios from "axios";
import fs from "fs";
import chalk from "chalk";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isNumber = (x) => typeof x === "number" && !isNaN(x);

export async function getBuffer(url, options = {}) {
  try {
    const res = await axios({
      method: "get",
      url,
      headers: {
        DNT: 1,
        "Upgrade-Insecure-Requests": 1,
      },
      responseType: "arraybuffer",
      ...options,
    });
    return res.data;
  } catch (err) {
    console.error("getBuffer error:", err);
    return Buffer.alloc(0);
  }
}

export function getGroupAdmins(lala) {
  let admins = [];
  for (let i of lala) {
    if (i.admin !== null) admins.push(i.id);
  }
  return admins;
}

export { isNumber };

let file = __filename;
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.bgCyan(`UPDATE ${file}`));
  import(`${file}?update=${Date.now()}`);
});