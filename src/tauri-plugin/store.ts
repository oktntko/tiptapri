import { Store } from 'tauri-plugin-store-api';

export const store = new Store('.tiptapri-store');

export default {
  getRecentlyOpenedFileList,
  saveRecentlyOpenedFileList,
  removeRecentlyOpenedFileList,
};

export type RecentlyOpenedFile = {
  fullpath: string;
  dirname: string;
  basename: string;
};

const KEY_RECENTLY_OPENED_FILE_LIST = 'KEY_RECENTLY_OPENED_FILE_LIST';
async function getRecentlyOpenedFileList() {
  return (await store.get<RecentlyOpenedFile[]>(KEY_RECENTLY_OPENED_FILE_LIST)) ?? [];
}
async function saveRecentlyOpenedFileList(file: RecentlyOpenedFile) {
  const files = await getRecentlyOpenedFileList();
  if (files.every((x) => x.fullpath !== file.fullpath)) {
    files.push(file);
    await store.set(KEY_RECENTLY_OPENED_FILE_LIST, files);
    await store.save();
  }

  return files;
}
async function removeRecentlyOpenedFileList(file: RecentlyOpenedFile) {
  const files = (await getRecentlyOpenedFileList()).filter((x) => x.fullpath !== file.fullpath);
  await store.set(KEY_RECENTLY_OPENED_FILE_LIST, files);
  await store.save();

  return files;
}
