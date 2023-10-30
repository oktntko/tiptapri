<script setup lang="ts">
import { save, open } from '@tauri-apps/api/dialog';
import { writeTextFile, readTextFile } from '@tauri-apps/api/fs';
import * as log from 'tauri-plugin-log-api';

const example = ref('');
</script>

<template>
  <div>
    <button
      @click="
        async () => {
          const path = await open({ multiple: false });
          if (typeof path === 'string') {
            log.info(path);
            example = await readTextFile(path);
          }
        }
      "
    >
      read
    </button>
    <button
      @click="
        async () => {
          const path = await save({});
          if (typeof path === 'string') {
            log.info(path);
            await writeTextFile(path, example);
          }
        }
      "
    >
      save
    </button>
    <Editor v-model="example" editable />
  </div>
</template>

<style scoped></style>
