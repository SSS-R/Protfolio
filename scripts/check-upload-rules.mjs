// Run: node scripts/check-upload-rules.mjs
// Guards the rules that decide what a browser may write straight into Blob.
import assert from 'node:assert/strict';

const { uploadPath, uploadRules, MAX_AUDIO_SIZE, MAX_IMAGE_SIZE } = await import(
  new URL('../src/lib/uploadTypes.ts', import.meta.url).href
);

// A normal track maps to a flat uploads/ key with the extension forced from its type.
assert.equal(uploadPath('123_My Song!.wav', 'audio/mpeg'), 'uploads/123_My_Song_.mp3');
assert.equal(uploadPath('cover.jpeg', 'image/jpeg'), 'uploads/cover.jpg');

// Types that can carry scripts or aren't media are refused up front.
assert.equal(uploadPath('x.svg', 'image/svg+xml'), null);
assert.equal(uploadPath('x.html', 'text/html'), null);

// The token route accepts exactly what uploadPath produces.
const mp3 = uploadRules('uploads/123_My_Song_.mp3');
assert.deepEqual(mp3.allowedContentTypes.sort(), ['audio/mp3', 'audio/mpeg']);
assert.equal(mp3.maximumSizeInBytes, MAX_AUDIO_SIZE);
assert.equal(uploadRules('uploads/cover.png').maximumSizeInBytes, MAX_IMAGE_SIZE);

// A token can never target the content store, another folder, or a bad extension.
for (const bad of [
  'data/creatune.json', 'data/portfolio.json', 'uploads/../data/creatune.json',
  'uploads/sub/x.mp3', 'uploads/x.json', 'uploads/x.html', 'uploads/.png', 'uploads/x', '/uploads/x.mp3',
]) {
  assert.equal(uploadRules(bad), null, `should reject ${bad}`);
}

console.log('upload rules OK');
