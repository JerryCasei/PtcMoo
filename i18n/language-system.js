const dictionary = {
  zh: {
    'panel.title': '控制中心', 'panel.particle': '粒子属性', 'panel.interaction': '交互参数', 'panel.fx': '后期效果',
    'panel.presets': '预设与主题', 'field.shape': '形状', 'field.count': '数量上限', 'field.size': '尺寸范围',
    'field.speed': '速度', 'field.alpha': '透明度', 'field.attract': '吸引半径', 'field.linkDistance': '连线距离',
    'field.spawnRate': '生成速率', 'field.sound': '音量', 'field.bloom': '光晕', 'field.blur': '模糊',
    'field.glitch': '故障', 'field.scanline': '扫描线', 'field.theme': '主题', 'action.save': '保存预设',
    'action.load': '加载预设', 'action.reset': '重置默认', 'action.share': '分享链接', 'footer.slogan': '软萌未来粒子实验室',
  },
  en: {
    'panel.title': 'Control Hub', 'panel.particle': 'Particle', 'panel.interaction': 'Interaction', 'panel.fx': 'Post FX',
    'panel.presets': 'Presets & Theme', 'field.shape': 'Shape', 'field.count': 'Max Count', 'field.size': 'Size',
    'field.speed': 'Speed', 'field.alpha': 'Opacity', 'field.attract': 'Attract Radius', 'field.linkDistance': 'Link Distance',
    'field.spawnRate': 'Spawn Rate', 'field.sound': 'Volume', 'field.bloom': 'Bloom', 'field.blur': 'Blur', 'field.glitch': 'Glitch',
    'field.scanline': 'Scanline', 'field.theme': 'Theme', 'action.save': 'Save Preset', 'action.load': 'Load Preset',
    'action.reset': 'Reset', 'action.share': 'Share Link', 'footer.slogan': 'Soft Future Particle Lab',
  }
};

export class LanguageSystem {
  constructor() { this.lang = localStorage.getItem('ptcmoo-lang') || 'zh'; }
  t(key) { return dictionary[this.lang][key] || key; }
  apply() {
    document.body.dataset.lang = this.lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.animate([{ opacity: 1 }, { opacity: 0.2 }, { opacity: 1 }], { duration: 280, easing: 'ease-out' });
      el.textContent = this.t(el.dataset.i18n);
    });
  }
  toggle() {
    this.lang = this.lang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('ptcmoo-lang', this.lang);
    this.apply();
    return this.lang;
  }
}
