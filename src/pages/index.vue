<script setup lang="ts">
import { open } from '@tauri-apps/api/dialog';
import { exists, readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { basename, dirname } from '@tauri-apps/api/path';

type TiptapFile = {
  fullpath: string;
  dirname: string;
  basename: string;
  contents: string;
  originalContents: string;
};

const fileList = ref<TiptapFile[]>([]);
const current = ref<TiptapFile>();

window.addEventListener('keydown', async (e) => {
  if (current.value && e.ctrlKey && e.code == 'KeyS') {
    e.preventDefault();
    await saveFile(current.value);
  }
});

async function saveFile(file: TiptapFile) {
  await writeTextFile(file.fullpath, file.contents);
  file.originalContents = file.contents;
}

async function openFile() {
  const fullpath = await open({ multiple: false });
  if (
    typeof fullpath === 'string' &&
    fileList.value.every((x) => x.fullpath !== fullpath) &&
    (await exists(fullpath))
  ) {
    const [_dirname, _basename, _contents] = await Promise.all([
      dirname(fullpath),
      basename(fullpath),
      readTextFile(fullpath),
    ]);

    const file: TiptapFile = {
      fullpath,
      dirname: _dirname,
      basename: _basename,
      contents: _contents,
      originalContents: _contents,
    };

    fileList.value.push(file);
    current.value = file;
  }
}

async function closeFile(file: TiptapFile) {
  if (file.contents !== file.originalContents) {
    if (window.confirm('save file?')) {
      await saveFile(file);
    }
  }

  fileList.value = fileList.value.filter((x) => x !== file);
  if (file === current.value) {
    // TODO: ひとつ前のファイルか次のファイルを選ぶ
    current.value = undefined;
  }
}
</script>

<template>
  <div class="flex gap-0.5">
    <aside
      class="flex h-screen shrink-0 flex-col overflow-hidden bg-gray-50 align-middle"
      :class="['w-20 items-center justify-between']"
    >
      <div class="flex flex-col items-center gap-6 p-4">
        <Icon icon="twemoji:file-folder" width="48"></Icon>
        <Icon icon="twemoji:magnifying-glass-tilted-right" width="48"></Icon>
      </div>
      <div class="flex flex-col items-center gap-6 p-4">
        <Icon icon="twemoji:gear" width="48"></Icon>
      </div>
    </aside>

    <!-- サイドメニュー フォルダ -->
    <aside
      class="flex h-screen shrink-0 flex-col overflow-hidden bg-gray-50 align-middle"
      :class="['w-80']"
    >
      <hr />
      <button @click="openFile">ファイルを開く</button>
      <hr />
      <div>開いているフォルダ</div>
      <hr />
      <div>お気に入り</div>
      <hr />
      <div>最近開いたファイル</div>
    </aside>

    <div class="flex h-screen grow flex-col">
      <header class="border-separate border-b border-b-gray-300 bg-gray-200">
        <ul class="flex flex-nowrap">
          <li
            v-for="file of fileList"
            :key="file.fullpath"
            class="cursor-pointer bg-gray-200"
            :class="{
              'bg-gray-50': file === current,
            }"
          >
            <a
              @click.stop="current = file"
              class="flex items-center justify-center gap-0.5 p-2"
              :title="file.fullpath"
            >
              <span> {{ file.basename }}</span>
              <div class="rounded px-1.5 py-1" v-show="file.contents !== file.originalContents">
                <Icon icon="twemoji:yellow-circle"></Icon>
              </div>
              <button @click.stop="closeFile(file)" class="rounded p-1 hover:bg-gray-200">
                <Icon icon="twemoji:multiply"></Icon>
              </button>
            </a>
          </li>
        </ul>
      </header>
      <main class="grow overflow-y-scroll bg-gray-50">
        <Editor v-if="current" :key="current.fullpath" editable v-model="current.contents"></Editor>
      </main>
    </div>
  </div>
</template>

<style scoped></style>
