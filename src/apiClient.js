import { Airgram } from "@airgram/web";
import assert from "assert";

const TELEGRAM_API_ID = process.env.TELEGRAM_API_ID;
const TELEGRAM_API_HASH = process.env.TELEGRAM_API_HASH;

assert(TELEGRAM_API_ID, "TELEGRAM_API_ID should be set");
assert(TELEGRAM_API_HASH, "TELEGRAM_API_HASH should be set");

export const apiClient = new Airgram({
  apiId: TELEGRAM_API_ID,
  apiHash: TELEGRAM_API_HASH
});

export const downloadFile = (fileId, priority = 1) =>
  apiClient.api.downloadFile({
    fileId: fileId,
    priority,
    synchronous: true
  });

export const needToDownloadSmallPhoto = item =>
  !item.small.local.isDownloadingCompleted &&
  !item.small.local.isDownloadingActive;
