import {
 proto,
 jidDecode,
 isJidNewsletter,
 areJidsSameUser,
 getContentType,downloadContentFromMessage 
 } from "baileys";
import util from "util";
import axios from "axios";
import fs from 'fs'
import path from 'path'
import { fileTypeFromBuffer } from "file-type";
import { getBuffer } from "./myfunc.js";

export function Func(sock) {
  const conn = sock;

  conn.sendvn = (id, teks, m) => {
    conn.sendMessage(
      id,
      {
        audio: { url: teks },
        ptt: true,
        waveform: [0, 0, 50, 0, 0, 0, 10, 80, 10, 60, 10, 99, 60, 30, 10, 0, 0, 0],
        mimetype: "audio/mpeg",
      },
      { quoted: m }
    );
  };

  conn.sendMessageModify = async (jid, text = "", quoted = null, opts = {}) => {
    const {
      title = "",
      body = "",
      thumbnail = null,
      url = "https://google.com",
      largeThumb = false,
      ads = false,
      forwardingScore = 100,
      isForwarded = true,
      containsAutoReply = true,
      mentions = [],
      businessOwnerJid = null,
    } = opts;

    let thumbBuffer = null;
    try {
      if (Buffer.isBuffer(thumbnail)) {
        thumbBuffer = thumbnail;
      } else if (typeof thumbnail === "string" && thumbnail.startsWith("http")) {
        const res = await axios.get(thumbnail, { responseType: "arraybuffer" });
        thumbBuffer = Buffer.from(res.data, "binary");
      }
    } catch (e) {
      console.error("Thumbnail error:", e);
      thumbBuffer = null;
    }

    const msg = {
      text: styleText(String(text)),
      contextInfo: {
        forwardingScore,
        isForwarded,
        containsAutoReply,
        mentionedJid: mentions,
        ...(businessOwnerJid
          ? { businessMessageForwardInfo: { businessOwnerJid } }
          : {}),
        externalAdReply: {
          title,
          body,
          mediaType: 1,
          renderLargerThumbnail: !!largeThumb,
          showAdAttribution: !!ads,
          sourceUrl: url,
          thumbnail: thumbBuffer,
        },
      },
    };

    return conn.sendMessage(jid, msg, { quoted });
  };

  conn.cMod = async (jid, copy, text = "", sender = conn.user.id, options = {}) => {
    let mtype = getContentType(copy.message);
    let msg = copy.message[mtype];

    if (typeof msg === "string") copy.message[mtype] = text || msg;
    else if (msg.caption) msg.caption = text || msg.caption;
    else if (msg.text) msg.text = text || msg.text;

    copy.key.remoteJid = jid;
    copy.key.fromMe = areJidsSameUser(sender, conn.user.id);

    return proto.WebMessageInfo.fromObject(copy);
  };

  conn.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (
        (decode.user && decode.server && decode.user + "@" + decode.server) || jid
      ).trim();
    } else return jid.trim();
  };

  conn.getName = async (jid) => {
    if (!jid) return "Tanpa Nama";
    jid = conn.decodeJid(jid);

    let name;

    if (jid.endsWith("@g.us")) {
      let metadata = (conn.chats[jid] || {}).metadata || {};
      if (!metadata.subject) {
        try {
          metadata = await conn.groupMetadata(jid);
          conn.chats[jid] = conn.chats[jid] || {};
          conn.chats[jid].metadata = metadata;
        } catch {}
      }
      name = metadata.subject;
    } else if (jid.endsWith("@newsletter")) {
      let info = conn.chats[jid] || {};
      name = info.name || info.subject || "Channel";
    } else {
      let contact = conn.contacts[jid] || {};
      let chat = conn.chats[jid] || {};
      name =
        contact.name ||
        contact.verifiedName ||
        contact.notify ||
        chat.name ||
        jid.split("@")[0];
    }

    return name || "Tanpa Nama";
  };
  
  
conn.downloadMediaMessage = async (msg, returnType = "buffer") => {
  try {
    const mtype = Object.keys(msg.message)[0]; 
    const stream = await downloadContentFromMessage(msg.message[mtype], mtype.replace(/Message/gi, ""));
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    if (returnType === "buffer") return buffer;
    if (returnType === "base64") return buffer.toString("base64");
    if (returnType === "stream") return stream;
    return buffer;
  } catch (err) {
    console.error("downloadMediaMessage error:", err);
    return null;
  }
};

  return conn;
}

export async function smsg(conn, m) {
  if (!m) return m;
  m = proto.WebMessageInfo.create(m)
  
  if (m.key) {
    m.id = m.key.id;
    m.isBaileys =
      (m.id && m.id.length === 22) ||
      (m.id.startsWith("3EB0") && m.id.length === 22) ||
      false;

    m.chat = conn.decodeJid(
      m.key.remoteJid ||
      m.message?.senderKeyDistributionMessage?.groupId ||
      ""
    );

    m.now = m.messageTimestamp;
m.isGroup = m.chat.endsWith("@g.us");
m.isChannel = isJidNewsletter(m.chat); 
m.sender = conn.decodeJid(
  (m.key.fromMe && conn.user.id) ||
  m.participant ||
  m.key.participant ||
  m.chat ||
  ""
);

    m.fromMe = m.key?.fromMe || areJidsSameUser(m.sender, conn.user?.id);
    m.from = m.key?.remoteJid || "";
  }

  if (m.isGroup) {
    try {
  m.groupMetadata = (await conn.groupMetadata(m.chat).catch(() => ({}))) || {};

      m.groupId = m.groupMetadata.id || "";
      m.groupName = m.groupMetadata.subject || "";
      m.groupDesc = m.groupMetadata.desc || "";
      m.groupOwner = m.groupMetadata.owner || m.groupMetadata.subjectOwner || "";
   m.isGroup = m.groupId.endsWith("@g.us") && !m.groupMetadata.parent
      m.isCommunity = m.groupId.endsWith("@g.us") && m.groupMetadata.isCommunity
      m.groupParticipants = m.groupMetadata.participants || [];

      if (m.groupMetadata.addressingMode && ["lid", "lid-update"].includes(m.groupMetadata.addressingMode)) {
        m.groupMembers =
          m.groupMetadata.addressingMode === "lid"
            ? m.groupMetadata.participants.map(p => ({
                lid: p.id,
                id: p?.jid || p?.phone || p?.phoneNumber,
                admin: p.admin,
              }))
            : m.groupMetadata.participants;

        if (m.sender.endsWith("@lid")) {
          m.sender = m.groupMembers.find(p => p.lid === m.sender)?.id || m.sender;
        }
      } else {
        m.groupMembers = m.groupParticipants;
      }

      m.user = m.groupMembers.find(u => conn.decodeJid(u.id) === m.sender) || {};
      m.bot = m.groupMembers.find(u => conn.decodeJid(u.id) === conn.decodeJid(conn.user.id)) || {};
 
m.botNumber = conn.user.id
      ? conn.user.id.split(":")[0] + "@s.whatsapp.net"
      : conn.user.jid
        
      m.isRAdmin = (m.user && m.user.admin === "superadmin") || false;
      m.isAdmin = m.isRAdmin || (m.user && m.user.admin === "admin") || false;
      m.isBotAdmin = m.bot ? ["admin", "superadmin"].includes(m.bot.admin) : false;

    } catch (err) {
      console.error("Error fetching group metadata:", err);
    }
  }
if (m.isChannel) {
  try {
    const metadata = await conn.parseNewsletterCreateResponse("id", m.chat).catch(() => ({})) || {}

    m.channelMetadata    = metadata
    m.channelName        = metadata?.thread_metadata?.name?.text || ""
    m.channelDesc        = metadata?.thread_metadata?.description?.text || ""
    m.channelSubscribers = metadata?.thread_metadata?.subscribers_count || 0
    m.channelInvite      = metadata?.thread_metadata?.invite || ""
    m.channelVerified    = metadata?.thread_metadata?.verification || "none"
    m.channelCreatedAt   = metadata?.thread_metadata?.creation_time
      ? new Date(metadata.thread_metadata.creation_time * 1000).toLocaleString()
      : ""
  } catch {
    m.channelMetadata    = {}
    m.channelName        = ""
    m.channelDesc        = ""
    m.channelSubscribers = 0
    m.channelInvite      = ""
    m.channelVerified    = "none"
    m.channelCreatedAt   = ""
  }
}

  if (m.message) {
    if (m?.message?.messageContextInfo) delete m.message.messageContextInfo;
    if (m?.message?.senderKeyDistributionMessage) delete m.message.senderKeyDistributionMessage;

    m.message =
      m.message.viewOnceMessageV2?.message ||
      m.message.documentWithCaptionMessage?.message ||
      m.message.editedMessage?.message?.protocolMessage?.editedMessage ||
      m.message;

    const mtype = Object.keys(m.message);
    m.mtype =
      (!["senderKeyDistributionMessage", "messageContextInfo"].includes(mtype[0]) && mtype[0]) ||
      (mtype.length >= 3 && mtype[1] !== "messageContextInfo" && mtype[1]) ||
      mtype[mtype.length - 1];

    m.type = getContentType(m.message);

    m.budy =
      m.type === "conversation"
        ? m.message.conversation
        : m.type === "extendedTextMessage"
          ? m.message.extendedTextMessage.text
          : m.type === "imageMessage"
            ? m.message.imageMessage.caption || "<Gambar>"
            : m.type === "videoMessage"
              ? m.message.videoMessage.caption || "<Video>"
              : m.type === "audioMessage"
                ? "<Audio>"
                : m.type === "stickerMessage"
                  ? "<Sticker>"
                  : m.type === "documentMessage"
                    ? m.message.documentMessage.caption || "<Dokumen>"
                    : m.type === "contactMessage"
                      ? "<Kontak>"
                      : m.type === "locationMessage"
                        ? "<Lokasi>"
                        : "";
 
    m.text = m.budy || "";
    m.body = m.text;
    m.args = (typeof m.body === "string" ? m.body.trim() : "").split(/ +/).slice(1);
    
      m.download = async () => {
  if (["imageMessage", "videoMessage", "audioMessage", "documentMessage", "stickerMessage"].includes(m.type)) {
    return await conn.downloadMediaMessage(m, "buffer");
  }
  return null;
};

m.downloadAndSave = async (filename) => {
  try {
    const buffer = await m.download();
    if (!buffer) return null;
    const type = (await fileTypeFromBuffer(buffer)) || { ext: "bin" };
    const tempDir = "./temp";
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const trueFileName = path.join(tempDir, filename || `${Date.now()}.${type.ext}`);
    fs.writeFileSync(trueFileName, buffer);
    return trueFileName;
  } catch (e) {
    console.error("m.downloadAndSave error:", e);
    return null;
  }
};
    const contextInfo = m.message[m.mtype]?.contextInfo;
    const quotedMsg = contextInfo?.quotedMessage;

    if (quotedMsg) {
      m.quoted = {
        message: quotedMsg,
        type: getContentType(quotedMsg),
        id: contextInfo.stanzaId,
        sender: conn.decodeJid(contextInfo.participant),
        fromMe: contextInfo.participant === conn.user.id,
        text: (() => {
          const msg = quotedMsg;
          if (msg.conversation) return msg.conversation;
          if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text;
          if (msg.imageMessage?.caption) return msg.imageMessage.caption;
          if (msg.videoMessage?.caption) return msg.videoMessage.caption;
          if (msg.audioMessage?.caption) return msg.audioMessage.caption;
          if (msg.documentMessage?.caption) return msg.documentMessage.caption;
          return "<Media>";
        })(),
        delete: async () =>
          conn.sendMessage(m.chat, {
            delete: { id: contextInfo.stanzaId, remoteJid: m.chat },
          }),
        copy: async () =>
          exports.smsg(conn, {
            key: { remoteJid: m.chat, id: contextInfo.stanzaId },
            message: quotedMsg,
          }),
        download: async () => {
        const type = getContentType(quotedMsg);
        if (["imageMessage", "videoMessage", "audioMessage", "documentMessage", "stickerMessage"].includes(type)) {
          return await conn.downloadMediaMessage(
            { key: { remoteJid: m.chat, id: contextInfo.stanzaId }, message: quotedMsg },
            "buffer"
          );
        }
        return null;
      },
downloadAndSave: async (filename) => { 
  try {
    const buffer = await m.quoted.download();
    if (!buffer) return null;
    const type = (await fileTypeFromBuffer(buffer)) || { ext: "bin" };
    const tempDir = "./temp";
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const trueFileName = path.join(tempDir, filename || `${Date.now()}.${type.ext}`);
    fs.writeFileSync(trueFileName, buffer);
    return trueFileName;
  } catch (e) {
    console.error("m.quoted.downloadAndSave error:", e);
    return null;
  }
        },
        reply: (text, options = {}) =>
          conn.sendMessage(m.chat, { text }, { quoted: m, ...options }),
      };

      m.mentionByReply = {
        sender: contextInfo.participant.endsWith("@lid")
          ? m.groupMembers?.find(x => x.lid === contextInfo.participant)?.id || contextInfo.participant
          : contextInfo.participant,
        type: Object.keys(quotedMsg)[0],
        isText: ["conversation", "extendedTextMessage"].includes(Object.keys(quotedMsg)[0]),
        isSticker: Object.keys(quotedMsg)[0] === "stickerMessage",
        isAudio: Object.keys(quotedMsg)[0] === "audioMessage",
        message: quotedMsg,
      };
    } else {
      m.mentionByReply = null;
    }

    m.reply = (text, chatId, options) => 
    conn.sendMessage(
      chatId || m.chat, 
      { text: styleText(String(text)) }, 
      { quoted: m, ...options }
    );

    m.react = (emoji) =>
      conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
  }

  return m;
};

export function decodeJid(jid) {
  if (!jid) return jid;
  if (/:\d+@/gi.test(jid)) {
    let decode = jidDecode(jid) || {};
    return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
  } else return jid;
}

export function protoType() {
  Buffer.prototype.toArrayBuffer = function () {
    return this.buffer.slice(this.byteOffset, this.byteOffset + this.byteLength);
  };

  ArrayBuffer.prototype.toBuffer = function () {
    return Buffer.from(new Uint8Array(this));
  };

  String.prototype.isNumber = function () {
    const int = parseInt(this);
    return typeof int === "number" && !isNaN(int);
  };

  String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  };
}