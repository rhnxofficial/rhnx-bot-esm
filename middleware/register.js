import { isNumber } from "../lib/myfunc.js";

function makeid(length) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function register(m, conn) {
  try {
    if (!global.db.data.users) global.db.data.users = {};
    if (!global.db.data.chats) global.db.data.chats = {};
    if (!global.db.data.chanel) global.db.data.chanel = {};
  
    if (!m.sender.endsWith("@newsletter")) {
      if (!global.db.data.users[m.sender]) {
        global.db.data.users[m.sender] = {
          id: m.senderNumber,
          name: m.pushName || "no name",
          email: "",
          date: calender,
          hit: 0,
          serial: makeid(4).toUpperCase(),
          registered: false,
          role: "Beginner",
          premium: false,
          limit: 50,
        };
      }
    }
    
    if (m.isGroup) {
      let chat = global.db.data.chats[m.chat];
      if (!chat) {
        global.db.data.chats[m.chat] = {
          id: m.chat,
          name: m.groupName || "",
          hit: 0,
          add: 0,
          welcome: false,
          antispam: true,
          simi: true,
          type: "group"
        };
      } else {
        if (!("name" in chat)) chat.name = m.groupName || "";
        if (!isNumber(chat.hit)) chat.hit = 0;
      }
    }
    
    if (m.isChannel) {
      let chanel = global.db.data.chanel[m.chat];
      try {
        const metadata = await conn.newsletterMetadata("JID", m.chat);

        if (!chanel) {
          global.db.data.chanel[m.chat] = {
            id: metadata?.id || m.chat,
            name: metadata?.name || "",
            desc: metadata?.thread_metadata?.description?.text || "",
            hit: 0,
            subscribers: metadata?.thread_metadata?.subscribers_count || 0,
            type: metadata?.state?.type || "channel"
          };
        } else {
          if (!("name" in chanel))
            chanel.name = metadata?.thread_metadata?.name?.text || "";
          if (!("desc" in chanel))
            chanel.desc = metadata?.thread_metadata?.description?.text || "";
          if (!("subscribers" in chanel))
            chanel.subscribers = metadata?.thread_metadata?.subscribers_count || 0;
          if (!("type" in chanel))
            chanel.type = metadata?.state?.type || "channel";
        }
      } catch (e) {
        console.error("❌ Gagal ambil metadata channel:", e);
        if (!chanel) {
          global.db.data.chanel[m.chat] = {
            id: m.chat,
            name: m.chat,
            desc: "",
            hit: 0,
            subscribers: 0,
            type: "channel"
          };
        }
      }
    }
    await global.db.write();

  } catch (e) {
    console.error("❌ Error register:", e);
  }
}