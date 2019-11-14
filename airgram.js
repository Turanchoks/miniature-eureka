import { Airgram, Auth, prompt, toObject } from "@airgram/web";
import assert from "assert";

const TELEGRAM_API_ID = "";
const TELEGRAM_API_HASH = "";

assert(TELEGRAM_API_ID, "TELEGRAM_API_ID should be set");
assert(TELEGRAM_API_HASH, "TELEGRAM_API_HASH should be set");

export const airgramClient = new Airgram({
  apiId: TELEGRAM_API_ID,
  apiHash: TELEGRAM_API_HASH
});
