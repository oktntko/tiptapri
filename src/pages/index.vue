<script setup lang="ts">
import { open, ask, save } from '@tauri-apps/api/dialog';
import { exists, readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { basename, dirname } from '@tauri-apps/api/path';

// TODO: tauri の dialog が YES/NO しか選べない
// 保存なら ①保存する②保存しない③(操作を)やめる の３つほしい

type TiptapFile = {
  fullpath: string;
  dirname: string;
  basename: string;
  contents: string;
  originalContents: string;
  isNew: boolean;
};

const fileList = ref<TiptapFile[]>([]);
const current = ref<TiptapFile>();

window.addEventListener('keydown', async (e) => {
  if (current.value && e.ctrlKey && e.code == 'KeyS') {
    e.preventDefault();
    await saveFile(current.value);
    return;
  }

  if (e.ctrlKey && e.code == 'KeyN') {
    e.preventDefault();
    addFile();
    return;
  }
});

async function saveFile(file: TiptapFile) {
  if (file.isNew) {
    const fullpath = await save();
    if (fullpath) {
      const [_dirname, _basename] = await Promise.all([dirname(fullpath), basename(fullpath)]);
      file.fullpath = fullpath;
      file.dirname = _dirname;
      file.basename = _basename;
      file.isNew = false;
    } else {
      return;
    }
  }

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
      isNew: false,
    };

    fileList.value.push(file);
    current.value = file;
  }
}

function addFile() {
  const file: TiptapFile = {
    fullpath: crypto.randomUUID(),
    dirname: '',
    basename: 'Untitled',
    contents: '',
    originalContents: '',
    isNew: true,
  };

  fileList.value.push(file);
  current.value = file;
}

async function closeFile(file: TiptapFile) {
  if (file.isNew || file.contents !== file.originalContents) {
    if (await ask('save file?')) {
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
        <div title="explorer">
          <Icon icon="twemoji:file-folder" width="48"></Icon>
        </div>
        <div title="search">
          <Icon icon="twemoji:magnifying-glass-tilted-right" width="48"></Icon>
        </div>
      </div>
      <div class="flex flex-col items-center gap-6 p-4">
        <div title="setting">
          <Icon icon="twemoji:gear" width="48"></Icon>
        </div>
      </div>
    </aside>

    <!-- サイドメニュー フォルダ -->
    <aside class="flex h-screen shrink-0 flex-col overflow-hidden bg-gray-50" :class="['w-80']">
      <header class="flex items-center justify-between p-2 uppercase">
        explorer

        <div role="menu" class="flex justify-center gap-2">
          <button
            type="button"
            title="open file"
            class="rounded p-1 hover:bg-gray-200"
            @click="openFile"
          >
            <Icon icon="codicon:go-to-file" class="h-6 w-6"></Icon>
          </button>
          <button
            type="button"
            title="new file"
            class="rounded p-1 hover:bg-gray-200"
            @click="addFile"
          >
            <Icon icon="codicon:new-file" class="h-6 w-6"></Icon>
          </button>
          <button type="button" title="read directory" class="rounded p-1 hover:bg-gray-200">
            <Icon icon="codicon:folder-opened" class="h-6 w-6"></Icon>
          </button>
        </div>
      </header>
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
            :class="{ 'bg-gray-50': file === current }"
          >
            <a
              @click.stop="current = file"
              class="flex items-center justify-center gap-0.5 p-2"
              :title="file.isNew ? 'new file' : file.fullpath"
            >
              <span> {{ file.basename }}</span>
              <div
                class="rounded px-1.5 py-1"
                v-show="file.isNew || file.contents !== file.originalContents"
              >
                <Icon :icon="file.isNew ? 'twemoji:blue-circle' : 'twemoji:yellow-circle'"></Icon>
              </div>
              <button
                type="button"
                class="rounded p-1 hover:bg-gray-200"
                @click.stop="closeFile(file)"
              >
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
