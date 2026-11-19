import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { animals, buildings, crops, farmRanks, goods, recipes, xpUnlocks } from '../public/game.mjs';
import { cropFrame, cropGrowthLabels } from '../public/pixel/crop-layout.mjs';
import { livestockAtlas, progressionCropAtlas, progressionLivestockAtlas } from '../public/pixel/frames.mjs';

const root = resolve(import.meta.dirname, '..');
const assetExists = source => existsSync(resolve(root, 'public', source.replace(/^\//, '')));
const errors = [];
const requireCheck = (condition, message) => { if (!condition) errors.push(message); };
function pngInfo(source) {
  const path = resolve(root, 'public', source.replace(/^\//, ''));
  if (!existsSync(path)) return null;
  const png = readFileSync(path);
  if (png.toString('ascii', 1, 4) !== 'PNG' || png.length < 26) return null;
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20), colorType: png[25] };
}

export function validateProgression() {
  errors.length = 0;
  requireCheck(farmRanks.length > 0, 'Farm rank list must not be empty.');
  for (let index = 0; index < farmRanks.length; index++) {
    const current = farmRanks[index], previous = farmRanks[index - 1];
    requireCheck(current.level === index + 1, `Rank at position ${index + 1} must use that level number.`);
    requireCheck(Number.isInteger(current.xp) && current.xp >= 0, `Rank ${current.level} needs a non-negative integer XP threshold.`);
    requireCheck(Boolean(current.name?.trim()), `Rank ${current.level} needs a display title.`);
    if (previous) requireCheck(current.xp > previous.xp, `Rank ${current.level} XP must be higher than rank ${previous.level}.`);
  }

  for (const [key, crop] of Object.entries(crops)) {
    requireCheck(Boolean(cropGrowthLabels[key]), `Crop ${key} is missing its four-stage label.`);
    requireCheck([crop.xp ?? 0, crop.workshop ?? 0].every(Number.isFinite), `Crop ${key} has an invalid unlock gate.`);
    for (let stage = 0; stage < 4; stage++) {
      const frame = cropFrame(key, stage);
      requireCheck(Boolean(frame?.source), `Crop ${key} stage ${stage + 1} needs an authored atlas frame.`);
      if (frame?.source) requireCheck(assetExists(frame.source), `Crop ${key} points to missing atlas ${frame.source}.`);
      requireCheck(Boolean(frame?.bounds?.length === 4 && frame.bounds.every(edge => Number.isInteger(edge) && edge >= 0 && edge <= 48)), `Crop ${key} stage ${stage + 1} bounds must fit its 48x48 cell.`);
    }
  }
  const cropPng = pngInfo(progressionCropAtlas.source);
  const livestockPng = pngInfo(progressionLivestockAtlas.source);
  requireCheck(cropPng?.width === 192 && cropPng?.height === 192 && cropPng.colorType === 6, 'Progression crop atlas must be a 192x192 RGBA PNG.');
  requireCheck(livestockPng?.width === 112 && livestockPng?.height === 48 && livestockPng.colorType === 6, 'Progression livestock atlas must be a 112x48 RGBA PNG.');

  const authoredAnimals = new Set([
    'chicken','duck','pig','cow','goat','sheep','goose','rabbit',
    ...Object.keys(livestockAtlas.frames), ...Object.keys(progressionLivestockAtlas.frames),
  ]);
  for (const [key, animal] of Object.entries(animals)) {
    requireCheck(authoredAnimals.has(key), `Animal ${key} needs an authored sprite frame or an explicit approved mapping.`);
    requireCheck(Number.isInteger(animal.level) && animal.level >= 1, `Animal ${key} needs a coop level gate.`);
    requireCheck(Number.isFinite(animal.xp ?? 0) && (animal.xp ?? 0) >= 0, `Animal ${key} has an invalid XP gate.`);
  }
  for (const [key, recipe] of Object.entries(recipes)) {
    requireCheck(Boolean(goods[key]), `Recipe ${key} needs a matching output item in goods.`);
    for (const item of Object.keys(recipe.ingredients)) requireCheck(Boolean(goods[item]), `Recipe ${key} uses unknown ingredient ${item}.`);
  }
  for (const [key, building] of Object.entries(buildings)) {
    const length = building.costs.length;
    requireCheck(building.xp.length === length, `${key} needs one XP value per upgrade cost.`);
    requireCheck(building.notes.length === length + 1, `${key} needs a benefit note for every level, including its base level.`);
    for (const [level, items] of Object.entries(building.materials ?? {})) {
      for (const item of Object.keys(items)) requireCheck(Boolean(goods[item]), `${key} upgrade ${level} requires unknown material ${item}.`);
    }
  }
  for (const unlock of xpUnlocks) requireCheck(Number.isFinite(unlock.xp) && Boolean(unlock.label), 'Derived XP unlock has incomplete display data.');
  return [...errors];
}

function generateProgressionDoc() {
  const rankRows = farmRanks.map(rank => `| ${rank.level} | ${rank.xp.toLocaleString('vi-VN')} | ${rank.name} |`).join('\n');
  const cropRows = Object.entries(crops).map(([key, crop]) => `| ${goods[key]?.name ?? key} | ${crop.xp ?? 0} XP | ${crop.workshop ? `Xưởng ${crop.workshop}` : '—'} |`).join('\n');
  const animalRows = Object.entries(animals).map(([key, animal]) => `| ${animal.name} | ${animal.xp ?? 0} XP | Chuồng ${animal.level} |`).join('\n');
  const recipeRows = Object.entries(recipes).map(([key, recipe]) => `| ${goods[key]?.name ?? key} | Xưởng ${recipe.level} | ${Object.entries(recipe.ingredients).map(([item, count]) => `${count} ${goods[item]?.name ?? item}`).join(', ')} |`).join('\n');
  const buildingRows = Object.entries(buildings).map(([key, building]) => `| ${building.name} | ${(building.base ?? 1) + building.costs.length} | ${building.notes.at(-1)} |`).join('\n');
  const unlockRows = xpUnlocks.map(unlock => `| ${unlock.xp.toLocaleString('vi-VN')} | ${unlock.label} | ${unlock.requires || '—'} |`).join('\n');
  return `<!-- Generated by: node scripts/progression.mjs --write-docs. Do not hand-edit the generated tables. -->
# Lộ trình cấp độ và nội dung nông trại

## Cấp nông trại

Danh hiệu và mốc XP lấy trực tiếp từ \`public/progression-levels.mjs\`. Thêm một hàng cấp mới vào đó sẽ tự cập nhật danh hiệu đang chơi, mốc kế tiếp và bảng dưới đây.

| Cấp | XP tích lũy | Danh hiệu |
| ---: | ---: | --- |
${rankRows}

XP là tiến trình tổng hợp, không bị trừ khi mở khóa. Các điều kiện xu, cấp công trình và vật liệu vẫn được kiểm tra riêng.

## Cây trồng

| Cây | XP | Xưởng tối thiểu |
| --- | ---: | --- |
${cropRows}

## Vật nuôi

| Vật nuôi | XP | Chuồng tối thiểu |
| --- | ---: | ---: |
${animalRows}

## Chế biến

| Sản phẩm | Cấp xưởng | Nguyên liệu |
| --- | ---: | --- |
${recipeRows}

## Công trình

| Công trình | Cấp tối đa | Lợi ích ở cấp tối đa |
| --- | ---: | --- |
${buildingRows}

## Mốc mở khóa tổng hợp

| XP | Nội dung | Điều kiện bổ sung |
| ---: | --- | --- |
${unlockRows}

## Thêm cấp hoặc nội dung mới

1. Thêm cấp tiếp theo vào \`public/progression-levels.mjs\` với số cấp liên tục, XP tăng nghiêm ngặt và danh hiệu.
2. Khai báo XP, cấp xưởng/chuồng, nguyên liệu, công thức và giá trong định nghĩa gameplay phù hợp. Các mốc XP được gom tự động từ dữ liệu cây, vật nuôi, thủy sản và công trình.
3. Tạo đủ bốn frame cây hoặc sprite vật nuôi trong atlas RGBA có alpha thật; khai báo vùng frame ở \`public/pixel/frames.mjs\`.
4. Chạy \`npm run progression:docs\` để cập nhật tài liệu. Build và test tự kiểm tra tính liên tục của cấp, điều kiện mở khóa, recipe, trần công trình và độ phủ sprite.

## Kiểm tra cân bằng

- Theo dõi thời gian đạt từng cấp trên save mới; không cân bằng chỉ theo người chơi cũ đã tích XP.
- So sánh giá bán với thời gian sinh trưởng, thức ăn tiêu hao và sản lượng vật nuôi.
- Theo dõi số lần kho đầy khi thêm hàng cấp cao; mở rộng kho cần giữ lựa chọn giữa tích trữ và chế biến.
- Khi nội dung tới quá sớm, điều chỉnh XP/cấp công trình/vật liệu tại định nghĩa mở khóa; tránh kéo dài đồng loạt mọi chu kỳ.
`;
}

if (process.argv.includes('--write-docs')) {
  const problems = validateProgression();
  if (problems.length) {
    console.error(problems.map(problem => `- ${problem}`).join('\n'));
    process.exitCode = 1;
  } else {
    writeFileSync(resolve(root, 'docs/GAME_PROGRESSION.md'), generateProgressionDoc(), 'utf8');
    console.log('Generated docs/GAME_PROGRESSION.md');
  }
} else {
  const problems = validateProgression();
  if (problems.length) {
    console.error(problems.map(problem => `- ${problem}`).join('\n'));
    process.exitCode = 1;
  } else console.log(`Progression validated: ${farmRanks.length} ranks, ${Object.keys(crops).length} crops, ${Object.keys(animals).length} animals.`);
}
