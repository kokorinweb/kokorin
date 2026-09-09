#!/usr/bin/env node
/**
 * Печатает текст сценария по сценам — под запись голоса.
 *
 *   node tools/text.mjs scripts/skills.json
 *
 * Номер строки совпадает с именем файла записи: сцена 00 -> voice/<id>/00.mp3.
 * Записал все сцены — гони `TTS_PROVIDER=files node tools/voice.mjs <сценарий>`,
 * он измерит длину каждой и подгонит под неё субтитры.
 */
import { readFileSync } from 'node:fs';

const path = process.argv[2];
if (!path) {
  console.error('Укажи сценарий: node tools/text.mjs scripts/skills.json');
  process.exit(1);
}

const doc = JSON.parse(readFileSync(path, 'utf8'));
const script = doc.script ?? doc;
const plain = (t) => t.replace(/\*\*/g, '').replace(/==/g, '').replace(/\s+/g, ' ').trim();

console.log(`${script.title ?? script.id}\n`);
script.scenes.forEach((scene, i) => {
  console.log(`${String(i).padStart(2, '0')}  ${plain(scene.text)}`);
});

const words = script.scenes.reduce((a, s) => a + plain(s.text).split(' ').length, 0);
console.log(`\n${script.scenes.length} сцен, ${words} слов — примерно ${Math.round(words / 2.4)} с речи.`);
