export const THEMES = {
  cute: {
    className: 'theme-cute',
    palette: ['#ff8ecf', '#fff27f', '#89ddff', '#cfa4ff'],
    shape: 'heart',
  },
  cyber: {
    className: 'theme-cyber',
    palette: ['#00ffd0', '#4df4ff', '#ee4dff', '#7b8cff'],
    shape: 'star',
  },
  minimal: {
    className: 'theme-minimal',
    palette: ['#f5f5f5', '#d0d0d0', '#9a9a9a'],
    shape: 'circle',
  },
};

export const DEFAULT_CONFIG = {
  shape: 'circle',
  maxParticles: 260,
  speed: 1.4,
  opacity: 0.75,
  size: 5,
  attractRadius: 130,
  linkDistance: 110,
  spawnRate: 6,
  interactionStrength: 1.2,
  bloom: 0.8,
  motionBlur: 0.25,
  chromatic: 0.3,
  scanline: 0.2,
  fpsMode: true,
  language: 'zh',
  theme: 'cute',
  audioEnabled: true,
  volume: 0.2,
};

export const I18N = {
  zh: {
    title: 'Moonoo 粒子工坊',
    particleProps: '粒子属性',
    interaction: '交互参数',
    postFx: '后期效果',
    reset: '重置默认',
    save: '保存预设',
    load: '加载预设',
    loading: '正在初始化粒子宇宙...',
  },
  en: {
    title: 'Moonoo Particle Lab',
    particleProps: 'Particle Properties',
    interaction: 'Interaction',
    postFx: 'Post Effects',
    reset: 'Reset',
    save: 'Save Preset',
    load: 'Load Preset',
    loading: 'Initializing particle universe...',
  },
};
