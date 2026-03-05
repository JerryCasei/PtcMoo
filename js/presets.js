export async function loadPreset(name) {
  const res = await fetch(`presets/${name}.json`);
  if (!res.ok) throw new Error('Preset not found');
  return res.json();
}
