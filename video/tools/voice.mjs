#!/usr/bin/env node
/**
 * Озвучка сценария и подгонка таймингов под неё.
 *
 *   node tools/voice.mjs scripts/skills.json
 *
 * Что делает: гонит каждую сцену через TTS, меряет длину полученного mp3,
 * записывает её обратно в сценарий и склеивает дорожку целиком. После этого
 * субтитры идут ровно по голосу — отдельное выравнивание не нужно.
 *
 * Провайдер выбирается переменной TTS_PROVIDER:
 *   openai      — нужен OPENAI_API_KEY,     голос в OPENAI_VOICE (по умолчанию onyx)
 *   elevenlabs  — нужен ELEVENLABS_API_KEY, голос в ELEVENLABS_VOICE_ID
 *   files       — ничего не синтезирует, берёт готовые mp3 из voice/<id>/NN.mp3
 *                 (для записи своим голосом)
 *
 * Нужен ffmpeg и ffprobe в PATH.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const PAUSE_BETWEEN_SCENES = 0.22;

const die = (msg) => {
  console.error(msg);
  process.exit(1);
};

/** Убирает разметку `**` и `==`: в звук она попадать не должна. */
const plain = (text) => text.replace(/\*\*/g, '').replace(/==/g, '').replace(/\s+/g, ' ').trim();

const seconds = (file) =>
  Number(
    execFileSync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      file,
    ]).toString().trim(),
  );

const synth = {
  async openai(text, out) {
    const key = process.env.OPENAI_API_KEY || die('Нет OPENAI_API_KEY');
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts',
        voice: process.env.OPENAI_VOICE || 'onyx',
        input: text,
        response_format: 'mp3',
      }),
    });
    if (!res.ok) die(`OpenAI TTS: ${res.status} ${await res.text()}`);
    writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  },

  async elevenlabs(text, out) {
    const key = process.env.ELEVENLABS_API_KEY || die('Нет ELEVENLABS_API_KEY');
    const voice = process.env.ELEVENLABS_VOICE_ID || die('Нет ELEVENLABS_VOICE_ID');
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: 'POST',
      headers: { 'xi-api-key': key, 'content-type': 'application/json' },
      body: JSON.stringify({
        text,
        model_id: process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2',
      }),
    });
    if (!res.ok) die(`ElevenLabs: ${res.status} ${await res.text()}`);
    writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  },

  async files(_text, out) {
    if (!existsSync(out)) die(`Нет файла ${out} — положи запись сцены сюда`);
  },
};

const main = async () => {
  const path = process.argv[2] || die('Укажи сценарий: node tools/voice.mjs scripts/skills.json');
  const provider = process.env.TTS_PROVIDER || 'openai';
  if (!synth[provider]) die(`Неизвестный TTS_PROVIDER: ${provider}`);

  const doc = JSON.parse(readFileSync(path, 'utf8'));
  const script = doc.script ?? doc;
  const root = resolve(dirname(path), '..');
  const partsDir = join(root, 'public', 'voice', script.id);
  mkdirSync(partsDir, { recursive: true });

  const silence = join(partsDir, '_pause.mp3');
  execFileSync('ffmpeg', [
    '-y', '-f', 'lavfi',
    '-i', `anullsrc=r=44100:cl=mono:d=${PAUSE_BETWEEN_SCENES}`,
    '-q:a', '4', silence,
  ], { stdio: 'ignore' });

  const list = [];
  for (const [i, scene] of script.scenes.entries()) {
    const file = join(partsDir, `${String(i).padStart(2, '0')}.mp3`);
    const text = plain(scene.text);
    process.stdout.write(`${i + 1}/${script.scenes.length} ${text.slice(0, 48)}…\n`);

    await synth[provider](text, file);
    scene.durationInSeconds = Number((seconds(file) + PAUSE_BETWEEN_SCENES).toFixed(3));
    list.push(file, silence);
  }

  const listFile = join(partsDir, '_concat.txt');
  writeFileSync(listFile, list.map((f) => `file '${f}'`).join('\n'));
  const track = join(root, 'public', 'voice', `${script.id}.mp3`);
  execFileSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', track], {
    stdio: 'ignore',
  });

  script.audio = `voice/${script.id}.mp3`;
  writeFileSync(path, JSON.stringify(doc, null, 2) + '\n');

  const total = script.scenes.reduce((a, s) => a + s.durationInSeconds, 0);
  console.log(`\nГотово: ${track}`);
  console.log(`Длина ролика: ${total.toFixed(1)} c. Тайминги записаны в ${path}`);
};

main();
