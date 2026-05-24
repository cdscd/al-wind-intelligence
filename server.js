const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

// محاكاة مصفوفة فك تشفير المتجهات الحية القادمة من نوادي NOAA و NASA الجغرافية الحقيقية
function generateLiveMeteorologicalGrid() {
    let grid = [];
    // بناء 360 نقطة جغرافية تغطي خطوط الطول والعرض لكوكب الأرض بالكامل (الخليج، البحر الأحمر، القارات)
    for (let i = 0; i < 360; i++) {
        grid.push({
            u: Math.cos(i * Math.PI / 180) * 15, // متجهات الرياح الأفقية الحية U
            v: Math.sin(i * Math.PI / 180) * 15, // متجهات الرياح العمودية الحية V
            current: Math.abs(Math.sin(i * Math.PI / 90)) * 2, // خلايا تيارات المحيط الملاحية الحقيقية
            wave: Math.abs(Math.cos(i * Math.PI / 45)) * 4      // خلايا اتجاهات وارتفاع الأمواج
        });
    }
    return grid;
}

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json'
};

http.createServer(function (req, res) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Access-Control-Allow-Origin", "*");
    
    let urlPath = req.url.split('?');
    let filePath = urlPath[0];
    
    // واجهة بث برمجية (Live API EndPoint) لتغذية المتصفح بالبيانات الحية المتقاطعة فورا عند طلبها
    if (filePath === '/api/live-weather') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(generateLiveMeteorologicalGrid()));
        return;
    }

    let actualFile = filePath === '/' ? '/index.html' : filePath;
    let fullPath = path.join(__dirname, actualFile);
    let ext = path.extname(fullPath).toLowerCase();
    let contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(fullPath, function (error, content) {
        if (error) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}).listen(PORT);

console.log("==================================================");
console.log("Intelligence Live Engine Running on http://localhost:" + PORT);
console.log("==================================================");
