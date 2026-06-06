const fs = require('fs');
const path = require('path');

const jsonPath = 'c:\\Users\\STT\\Documents\\GitHub\\Mascotas\\scratch\\emojis_by_file.json';
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const emojiCounts = {};
const fileCounts = {};

for (const [file, items] of Object.entries(data)) {
    items.forEach(item => {
        item.emojis.forEach(emoji => {
            emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1;
            if (!fileCounts[emoji]) fileCounts[emoji] = new Set();
            fileCounts[emoji].add(file);
        });
    });
}

console.log("=== UNIQUE EMOJIS FOUND ===");
const sorted = Object.entries(emojiCounts).sort((a, b) => b[1] - a[1]);
for (const [emoji, count] of sorted) {
    const files = Array.from(fileCounts[emoji]).join(', ');
    console.log(`${emoji}: ${count} times (Files: ${files})`);
}
