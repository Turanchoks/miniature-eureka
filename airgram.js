import { Airgram, Auth, prompt, toObject } from "@airgram/web";
const TELEGRAM_API_ID = "";
const TELEGRAM_API_HASH = "";

export const airgramClient = new Airgram({
  apiId: TELEGRAM_API_ID,
  apiHash: TELEGRAM_API_HASH
});
