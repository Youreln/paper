/**
 * 飞传 FileFly - 主服务入口
 * 局域网高速文件传输工具
 * 作者: Youreln
 * 版权: © 2026 Youreln 版权所有
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const QRCode = require('qrcode');

const { getLocalIPs, getAvailablePorts } = require('./utils/ip');
const { checkAuth, authMiddleware } = require('./utils/auth');
const { 
    getFilesList, 
    deleteFile, 
    clearAllFiles, 
    generateUniqueFilename,
    formatFileSize,
    getFileIcon
} = require('./utils/fileManager');

const app = express();

let config = {
    port: process.env.PORT || 3000,
    password: '',
    allowUpload: true,
    allowDownload: true,
    allowDelete: true,
    autoCleanup: false,
    cleanupDays: 7
};

const configPath = path.join(__dirname, 'config.json');

function loadConfig() {
    try {
        if (fs.existsSync(configPath)) {
            const saved = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            config = { ...config, ...saved };
        }
    } catch (e) {
        console.log('配置加载失败，使用默认配置');
    }
}

function saveConfig() {
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch (e) {
        console.log('配置保存失败');
    }
}

loadConfig();

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const uniqueName = generateUniqueFilename(uploadsDir, originalName);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 1024 * 10
    }
});

app.use(express.json());
app.use(express.static(__dirname));

const accessLogs = [];

function logAccess(req, type) {
    const log = {
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        time: new Date().toISOString(),
        type: type,
        userAgent: req.get('User-Agent') || 'unknown'
    };
    accessLogs.unshift(log);
    if (accessLogs.length > 100) {
        accessLogs.pop();
    }
}

app.use((req, res, next) => {
    if (req.path !== '/api/verify' && req.path.startsWith('/api/')) {
        if (config.password && !req.session?.authenticated) {
            const authHeader = req.headers.authorization;
            if (authHeader !== `Bearer ${config.password}`) {
                return res.status(401).json({ error: '未授权访问' });
            }
        }
    }
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'settings.html'));
});

app.get('/api/config', (req, res) => {
    res.json({
        password: config.password ? '******' : '',
        hasPassword: !!config.password,
        allowUpload: config.allowUpload,
        allowDownload: config.allowDownload,
        allowDelete: config.allowDelete,
        autoCleanup: config.autoCleanup,
        cleanupDays: config.cleanupDays
    });
});

app.post('/api/config', (req, res) => {
    const { password, allowUpload, allowDownload, allowDelete, autoCleanup, cleanupDays } = req.body;
    
    if (password !== undefined) {
        config.password = password;
    }
    if (allowUpload !== undefined) {
        config.allowUpload = allowUpload;
    }
    if (allowDownload !== undefined) {
        config.allowDownload = allowDownload;
    }
    if (allowDelete !== undefined) {
        config.allowDelete = allowDelete;
    }
    if (autoCleanup !== undefined) {
        config.autoCleanup = autoCleanup;
    }
    if (cleanupDays !== undefined) {
        config.cleanupDays = cleanupDays;
    }
    
    saveConfig();
    res.json({ success: true, message: '配置已保存' });
});

app.post('/api/verify', (req, res) => {
    const { password } = req.body;
    if (!config.password || password === config.password) {
        logAccess(req, 'login_success');
        res.json({ success: true, token: config.password });
    } else {
        logAccess(req, 'login_failed');
        res.status(401).json({ success: false, message: '密码错误' });
    }
});

app.get('/api/info', (req, res) => {
    const ips = getLocalIPs();
    const port = config.port;
    const addresses = ips.map(ip => `http://${ip}:${port}`);
    
    const primaryUrl = addresses[0] || `http://localhost:${port}`;
    
    QRCode.toDataURL(primaryUrl, { width: 200 }, (err, qrUrl) => {
        if (err) {
            res.json({
                ips,
                port,
                addresses,
                qrCode: null,
                error: '二维码生成失败'
            });
        } else {
            res.json({
                ips,
                port,
                addresses,
                qrCode: qrUrl
            });
        }
    });
});

app.get('/api/files', (req, res) => {
    logAccess(req, 'list_files');
    const files = getFilesList(uploadsDir);
    res.json(files);
});

app.post('/api/upload', (req, res) => {
    if (!config.allowUpload) {
        return res.status(403).json({ error: '上传功能已禁用' });
    }
    
    logAccess(req, 'upload');
    
    upload.array('files')(req, res, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: '没有文件上传' });
        }
        
        const uploadedFiles = req.files.map(f => ({
            name: f.filename,
            size: f.size
        }));
        
        res.json({
            success: true,
            message: `成功上传 ${req.files.length} 个文件`,
            files: uploadedFiles
        });
    });
});

app.post('/api/upload-folder', (req, res) => {
    if (!config.allowUpload) {
        return res.status(403).json({ error: '上传功能已禁用' });
    }
    
    logAccess(req, 'upload_folder');
    
    upload.array('files')(req, res, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: '没有文件上传' });
        }
        
        res.json({
            success: true,
            message: `成功上传 ${req.files.length} 个文件`,
            count: req.files.length
        });
    });
});

app.get('/api/download/:filename', (req, res) => {
    if (!config.allowDownload) {
        return res.status(403).json({ error: '下载功能已禁用' });
    }
    
    const filename = req.params.filename;
    const filepath = path.join(uploadsDir, filename);
    
    if (!fs.existsSync(filepath)) {
        return res.status(404).json({ error: '文件不存在' });
    }
    
    logAccess(req, 'download');
    
    const stat = fs.statSync(filepath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filepath, { start, end });
        
        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
        });
        
        file.pipe(res);
    } else {
        res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
        });
        
        fs.createReadStream(filepath).pipe(res);
    }
});

app.post('/api/download-zip', (req, res) => {
    if (!config.allowDownload) {
        return res.status(403).json({ error: '下载功能已禁用' });
    }
    
    const { files } = req.body;
    
    if (!files || files.length === 0) {
        return res.status(400).json({ error: '没有选择文件' });
    }
    
    logAccess(req, 'download_zip');
    
    res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent('FileFly_Download_' + Date.now() + '.zip')}`
    });
    
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);
    
    files.forEach(filename => {
        const filepath = path.join(uploadsDir, filename);
        if (fs.existsSync(filepath)) {
            archive.file(filepath, { name: filename });
        }
    });
    
    archive.finalize();
});

app.delete('/api/file/:filename', (req, res) => {
    if (!config.allowDelete) {
        return res.status(403).json({ error: '删除功能已禁用' });
    }
    
    const filename = req.params.filename;
    const result = deleteFile(uploadsDir, filename);
    
    if (result.success) {
        logAccess(req, 'delete');
        res.json(result);
    } else {
        res.status(404).json(result);
    }
});

app.post('/api/clear', (req, res) => {
    if (!config.allowDelete) {
        return res.status(403).json({ error: '删除功能已禁用' });
    }
    
    logAccess(req, 'clear_all');
    const result = clearAllFiles(uploadsDir);
    res.json(result);
});

app.get('/api/logs', (req, res) => {
    res.json(accessLogs.slice(0, 50));
});

app.post('/api/change-port', (req, res) => {
    const { port } = req.body;
    const portNum = parseInt(port, 10);
    
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        return res.status(400).json({ error: '无效的端口号' });
    }
    
    config.port = portNum;
    saveConfig();
    
    res.json({
        success: true,
        message: '端口已修改，请重启服务生效',
        port: portNum
    });
});

function autoCleanup() {
    if (!config.autoCleanup) return;
    
    const now = Date.now();
    const maxAge = config.cleanupDays * 24 * 60 * 60 * 1000;
    
    const files = fs.readdirSync(uploadsDir);
    files.forEach(file => {
        const filepath = path.join(uploadsDir, file);
        const stat = fs.statSync(filepath);
        
        if (now - stat.mtime.getTime() > maxAge) {
            fs.unlinkSync(filepath);
            console.log(`自动清理: ${file}`);
        }
    });
}

setInterval(autoCleanup, 24 * 60 * 60 * 1000);

const server = app.listen(config.port, '0.0.0.0', () => {
    const ips = getLocalIPs();
    console.log('\n=================================');
    console.log('  飞传 FileFly 已启动!');
    console.log('  作者: Youreln');
    console.log('=================================\n');
    console.log('访问地址:');
    console.log(`  本地: http://localhost:${config.port}`);
    ips.forEach(ip => {
        console.log(`  局域网: http://${ip}:${config.port}`);
    });
    console.log('\n扫描二维码连接(访问 /api/info 获取)');
    console.log('---------------------------------\n');
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`端口 ${config.port} 已被占用，请更换端口`);
    } else {
        console.error('服务器错误:', err.message);
    }
});

process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
    });
});

module.exports = { app, config };
