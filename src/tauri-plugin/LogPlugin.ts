import * as log from 'tauri-plugin-log-api';
import type { App } from 'vue';

type LogPlugin = Omit<typeof log, 'attachConsole'>;
const LogPluginKey = Symbol() as InjectionKey<LogPlugin>;

export default function (app: App) {
  log.attachConsole();
  app.config.globalProperties.$log = log;
  app.provide<LogPlugin>(LogPluginKey, log);
}

export function useLog() {
  return inject<LogPlugin>(LogPluginKey)!;
}

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $log: LogPlugin;
  }
}
