import test from 'node:test';
import assert from 'node:assert/strict';
import { exportConfig, importConfig } from '../js/storage.js';

test('export/import config roundtrip', () => {
  const cfg = { size: 3, lang: 'zh-CN' };
  const out = exportConfig(cfg);
  assert.deepEqual(importConfig(out), cfg);
});
