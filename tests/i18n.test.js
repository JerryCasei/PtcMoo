import test from 'node:test';
import assert from 'node:assert/strict';
import { t } from '../js/i18n.js';

test('i18n returns zh string', () => {
  assert.equal(t('zh-CN', 'language'), '语言');
});

test('i18n falls back to en', () => {
  assert.equal(t('de-DE', 'language'), 'Language');
});
