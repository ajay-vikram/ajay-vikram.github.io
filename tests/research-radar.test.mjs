import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateData, scaleMaximum, radarPoint } from '../assets/js/research-radar.js';

const data = JSON.parse(readFileSync(new URL('../assets/data/research-experience.json', import.meta.url)));

test('agreed research snapshot and totals', () => {
  validateData(data);
  assert.equal(data.asOf, '2026-12');
  assert.deepEqual(data.domains.map(d => d.months), [7, 6, 15, 14, 17, 6]);
  assert.deepEqual(data.domains.map(d => d.label), ['Neuromorphic Vision', 'Multimodal Perception',
    'Language Models', 'Robotics & RL', 'Computational Neuroscience', 'Efficient ML']);
  assert.equal(scaleMaximum(data.domains), 20);
});

test('invalid or missing durations are not silently treated as zero', () => {
  for (const months of [undefined, null, -1, NaN, Infinity, '6']) {
    const changed = structuredClone(data);
    changed.domains[0].months = months;
    assert.throws(() => validateData(changed));
  }
});

test('neuromorphic projects are listed separately without changing the total', () => {
  const domain = data.domains.find(d => d.id === 'event-vision');
  assert.deepEqual(domain.projects.map(p => p.title), ['Event-Based Drone Tracking', 'Astronomical tracking', 'HOMI']);
  assert.equal(domain.months, 7);
});

test('neuroscience lists the requested fMRI projects without changing the total', () => {
  const domain = data.domains.find(d => d.id === 'neuroscience');
  assert.deepEqual(domain.projects.map(p => p.title), ['fMRI motion correction', 'fMRI representation learning', 'Structure-function coupling (Data+)']);
  assert.equal(domain.months, 17);
});

test('efficient ML lists ternarization and quantization without changing the total', () => {
  const domain = data.domains.find(d => d.id === 'efficient-ai');
  assert.deepEqual(domain.projects.map(p => p.title), ['Ternarizing CNNs', 'Quantizing CNNs and SSMs']);
  assert.equal(domain.months, 6);
});

test('user simulators have a two-month estimate within the existing language-model total', () => {
  const domain = data.domains.find(d => d.id === 'vision-language');
  assert.deepEqual(domain.projects.map(p => p.title), ['Vision2Code', 'General-purpose user simulators',
    'LLM post-training with verifiable rewards', 'VLM-based failure monitoring in FRAMES']);
  assert.equal(domain.projects.find(p => p.title === 'General-purpose user simulators').months, 2);
  assert.equal(domain.months, 15);
  for (const months of [null, -1, NaN, Infinity, '2']) {
    const changed = structuredClone(data);
    changed.domains.find(d => d.id === 'vision-language').projects[1].months = months;
    assert.throws(() => validateData(changed));
  }
});

test('LLM post-training is listed only under language models', () => {
  const domains = data.domains.filter(d => d.projects.some(p => p.href === 'projects/llm-post-training.html'));
  assert.deepEqual(domains.map(d => d.id), ['vision-language']);
  assert.equal(domains[0].projects.find(p => p.href === 'projects/llm-post-training.html').months, 3);
});

test('rejects duplicate domains, invalid dates, and unsafe links', () => {
  const duplicate = structuredClone(data);
  duplicate.domains[1].id = duplicate.domains[0].id;
  assert.throws(() => validateData(duplicate));
  assert.throws(() => validateData({ ...data, asOf: '2026-13' }));
  const unsafe = structuredClone(data);
  unsafe.domains[0].projects[0].href = 'javascript:alert(1)';
  assert.throws(() => validateData(unsafe));
});

test('scale adapts in five-month increments, including zero', () => {
  assert.equal(scaleMaximum([{ months: 21 }]), 25);
  assert.equal(scaleMaximum([{ months: 25 }]), 25);
  assert.equal(scaleMaximum([{ months: 0 }]), 5);
});

test('radius is proportional to months, not relative proficiency', () => {
  assert.deepEqual(radarPoint(0, 6, 0, 20, 100, 100, 80), { x: 100, y: 100 });
  const top = radarPoint(0, 6, 10, 20, 100, 100, 80);
  assert.ok(Math.abs(top.x - 100) < 1e-9);
  assert.equal(top.y, 60);
  for (let i = 0; i < 6; i++) {
    const point = radarPoint(i, 6, 17, 20, 100, 100, 80);
    assert.ok(Math.abs(Math.hypot(point.x - 100, point.y - 100) - 68) < 1e-9);
  }
});

test('modality references and colors are valid and unambiguous', () => {
  assert.equal(data.modalities.length, 13);
  assert.equal(new Set(data.modalities.map(m => m.color)).size, 13);
  assert.deepEqual(data.modalities.slice(0, 3).map(m => m.label), ['RGB-images', 'Depth maps', 'Neuromorphic events']);
  assert.ok(data.domains.find(d => d.id === 'efficient-ai').modalities.includes('emg'));
  assert.ok(!data.domains.find(d => d.id === 'neuroscience').modalities.includes('emg'));
  assert.deepEqual(data.domains.find(d => d.id === 'neuroscience').modalities, ['fmri', 'dti']);
  assert.deepEqual(data.domains.find(d => d.id === 'efficient-ai').modalities, ['radar', 'audio', 'eeg', 'emg']);
  const bad = structuredClone(data);
  bad.domains[0].modalities.push('unknown-modality');
  assert.throws(() => validateData(bad));
  const unsafeColor = structuredClone(data);
  unsafeColor.modalities[0].color = 'url(https://example.org/image)';
  assert.throws(() => validateData(unsafeColor));
  const duplicate = structuredClone(data);
  duplicate.modalities[1].id = duplicate.modalities[0].id;
  assert.throws(() => validateData(duplicate));
});

test('axis order changes presentation without changing research totals', () => {
  const lookup = new Map(data.domains.map(d => [d.id, d.months]));
  assert.deepEqual(data.axisOrder.map(id => lookup.get(id)), [7, 17, 6, 6, 15, 14]);
  const duplicate = structuredClone(data);
  duplicate.axisOrder[1] = duplicate.axisOrder[0];
  assert.throws(() => validateData(duplicate));
});
