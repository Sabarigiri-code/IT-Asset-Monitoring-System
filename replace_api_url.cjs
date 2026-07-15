const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    if(content.includes('http://localhost:8080')) {
        content = content.replace(/http:\/\/localhost:8080/g, 'https://it-asset-monitoring-system.onrender.com');
        fs.writeFileSync(filePath, content);
        console.log('Updated', filePath);
    }
}

function walkSync(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            walkSync(filePath);
        } else if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
            replaceInFile(filePath);
        }
    }
}

walkSync('./src');
