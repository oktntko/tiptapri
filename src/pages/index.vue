<script setup lang="ts">
import { open } from '@tauri-apps/api/dialog';
import { exists, readTextFile } from '@tauri-apps/api/fs';
import { basename, dirname } from '@tauri-apps/api/path';

type Stock = {
  fullpath: string;
  dirname: string;
  basename: string;
  contents: string;
};

const stockList = ref<Stock[]>([]);
const current = ref<Stock>();
</script>

<template>
  <div class="flex gap-0.5">
    <!-- サイドメニュー アイコン -->
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
      <button
        @click="
          async () => {
            const path = await open({ multiple: false });
            if (
              typeof path === 'string' &&
              stockList.every((x) => x.fullpath !== path) &&
              (await exists(path))
            ) {
              const stock = {
                fullpath: path,
                dirname: await dirname(path),
                basename: await basename(path),
                contents: await readTextFile(path),
              };

              stockList.push(stock);
              current = stock;
            }
          }
        "
      >
        ファイルを開く
      </button>
      <hr />
      <div>開いているファイル</div>
      <hr />
      <div>お気に入り</div>
      <hr />
      <div>最近開いたファイル</div>
    </aside>

    <div class="flex h-screen grow flex-col">
      <header class="border-separate border-b border-b-gray-300 bg-gray-200">
        <ul class="flex flex-nowrap">
          <li
            v-for="stock of stockList"
            :key="stock.fullpath"
            class="bg-gray-200 hover:text-gray-600"
            :class="{ 'bg-gray-50': stock === current }"
          >
            <a @click="current = stock" class="block p-2" :title="stock.fullpath">
              {{ stock.basename }}
            </a>
          </li>
        </ul>
      </header>
      <main class="grow overflow-y-scroll bg-gray-50">
        <Editor v-if="current" editable v-model="current.contents"></Editor>
      </main>
    </div>
  </div>
</template>

<style scoped></style>
