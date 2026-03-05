const dict = {
  'en-US': {
    title: 'Interactive Particle Page',
    subtitle: 'Immersive multi-input particle playground',
    particle_basic: 'Particle Basic',
    visual: 'Visual',
    behavior: 'Behavior',
    effects: 'Effects',
    performance: 'Performance',
    language: 'Language',
    save_share: 'Save & Share',
  },
  'zh-CN': {
    title: '交互式粒子页面',
    subtitle: '沉浸式多输入粒子空间',
    particle_basic: '粒子基础',
    visual: '视觉',
    behavior: '行为',
    effects: '效果',
    performance: '性能',
    language: '语言',
    save_share: '保存与分享',
  },
};

export function t(lang, key) { return dict[lang]?.[key] ?? dict['en-US'][key] ?? key; }

export function applyI18n(lang) {
  document.documentElement.lang = lang;
  document.documentElement.dataset.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(lang, el.dataset.i18n);
  });
}
