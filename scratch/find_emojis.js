const fs = require('fs');
const path = require('path');

const ROOT_DIR = 'c:\\Users\\STT\\Documents\\GitHub\\Mascotas';
const EXCLUDE_DIRS = ['node_modules', '.git', '.agents'];
const FILE_EXTENSIONS = ['.js', '.html'];

// Strict regex for emojis
const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{27BF}]|[\u{1F000}-\u{1F0FF}]|[\u{1F100}-\u{1F1FF}]|[\u{1F200}-\u{1F2FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]/gu;

const results = {};

function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            if (EXCLUDE_DIRS.includes(file)) continue;
            scanDir(fullPath);
        } else if (stat.isFile()) {
            if (!FILE_EXTENSIONS.includes(path.extname(file))) continue;
            scanFile(fullPath);
        }
    }
}

function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    const relativePath = path.relative(ROOT_DIR, filePath);
    
    lines.forEach((line, index) => {
        // Ignore comments
        let cleanLine = line;
        const commentIdx = line.indexOf('//');
        if (commentIdx !== -1) {
            cleanLine = line.substring(0, commentIdx);
        }
        
        const matches = cleanLine.match(emojiRegex);
        if (matches) {
            const uniqueEmojis = Array.from(new Set(matches));
            if (uniqueEmojis.length > 0) {
                if (!results[relativePath]) {
                    results[relativePath] = [];
                }
                results[relativePath].push({
                    line: index + 1,
                    text: line.trim(),
                    emojis: uniqueEmojis
                });
            }
        }
    });
}

scanDir(ROOT_DIR);
fs.writeFileSync(path.join(ROOT_DIR, 'scratch', 'emojis_by_file.json'), JSON.stringify(results, null, 2), 'utf8');
console.log("Saved structured scan to scratch/emojis_by_file.json");
