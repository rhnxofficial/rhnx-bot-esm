"use strict";

import axios from "axios";
import { fileTypeFromBuffer } from "file-type";

// ===== Fungsi Upload ke GitHub =====
export async function uploadToGithub(media) {
  try {
    const owner = "rhnxofficial";
    const repo = "Uploader";
    const branch = "main";

    const fileInfo = await fileTypeFromBuffer(media);
    const ext = fileInfo ? fileInfo.ext : "bin";
    const fileName = `rhnx-${makeid(4)}.${ext}`;
    const filePath = `uploader/${fileName}`;

    const base64Content = Buffer.from(media).toString("base64");

    await axios.put(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      { message: `Upload file ${fileName}`, content: base64Content, branch },
      { headers: { Authorization: `Bearer ${key.tokenGithub}`, "Content-Type": "application/json" } }
    );

    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
  } catch (error) {
    console.error("Error uploading to GitHub:", error.message);
    throw new Error("Gagal mengunggah file ke GitHub");
  }
}

export default {
  uploadToGithub
};