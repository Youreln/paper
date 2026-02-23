/**
 * 文件管理工具模块
 * 处理文件列表、删除、格式化等操作
 */

const fs = require('fs');
const path = require('path');

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + units[i];
}

function getFileIcon(filename) {
    const ext = path.extname(filename).toLowerCase();
    
    const iconMap = {
        '.jpg': 'fa-file-image',
        '.jpeg': 'fa-file-image',
        '.png': 'fa-file-image',
        '.gif': 'fa-file-image',
        '.bmp': 'fa-file-image',
        '.svg': 'fa-file-image',
        '.webp': 'fa-file-image',
        '.ico': 'fa-file-image',
        '.pdf': 'fa-file-pdf',
        '.doc': 'fa-file-word',
        '.docx': 'fa-file-word',
        '.xls': 'fa-file-excel',
        '.xlsx': 'fa-file-excel',
        '.ppt': 'fa-file-powerpoint',
        '.pptx': 'fa-file-powerpoint',
        '.txt': 'fa-file-alt',
        '.md': 'fa-file-alt',
        '.json': 'fa-file-code',
        '.js': 'fa-file-code',
        '.ts': 'fa-file-code',
        '.html': 'fa-file-code',
        '.css': 'fa-file-code',
        '.py': 'fa-file-code',
        '.java': 'fa-file-code',
        '.cpp': 'fa-file-code',
        '.c': 'fa-file-code',
        '.h': 'fa-file-code',
        '.php': 'fa-file-code',
        '.rb': 'fa-file-code',
        '.go': 'fa-file-code',
        '.rs': 'fa-file-code',
        '.swift': 'fa-file-code',
        '.kt': 'fa-file-code',
        '.vue': 'fa-file-code',
        '.jsx': 'fa-file-code',
        '.tsx': 'fa-file-code',
        '.zip': 'fa-file-archive',
        '.rar': 'fa-file-archive',
        '.7z': 'fa-file-archive',
        '.tar': 'fa-file-archive',
        '.gz': 'fa-file-archive',
        '.bz2': 'fa-file-archive',
        '.mp3': 'fa-file-audio',
        '.wav': 'fa-file-audio',
        '.flac': 'fa-file-audio',
        '.aac': 'fa-file-audio',
        '.ogg': 'fa-file-audio',
        '.wma': 'fa-file-audio',
        '.m4a': 'fa-file-audio',
        '.mp4': 'fa-file-video',
        '.avi': 'fa-file-video',
        '.mkv': 'fa-file-video',
        '.mov': 'fa-file-video',
        '.wmv': 'fa-file-video',
        '.flv': 'fa-file-video',
        '.webm': 'fa-file-video',
        '.m4v': 'fa-file-video',
        '.exe': 'fa-file',
        '.msi': 'fa-file',
        '.dmg': 'fa-file',
        '.app': 'fa-file',
        '.apk': 'fa-file',
        '.ipa': 'fa-file'
    };
    
    return iconMap[ext] || 'fa-file';
}

function getFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    
    if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.ico'].includes(ext)) {
        return 'image';
    }
    if (['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm', '.m4v'].includes(ext)) {
        return 'video';
    }
    if (['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a'].includes(ext)) {
        return 'audio';
    }
    if (['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'].includes(ext)) {
        return 'archive';
    }
    if (['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.pdf', '.txt', '.md'].includes(ext)) {
        return 'document';
    }
    if (['.js', '.ts', '.html', '.css', '.json', '.py', '.java', '.cpp', '.c', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.vue', '.jsx', '.tsx'].includes(ext)) {
        return 'code';
    }
    
    return 'other';
}

function getFilesList(dir) {
    try {
        if (!fs.existsSync(dir)) {
            return [];
        }
        
        const files = fs.readdirSync(dir);
        const fileList = [];
        
        files.forEach(filename => {
            const filepath = path.join(dir, filename);
            try {
                const stat = fs.statSync(filepath);
                
                if (stat.isFile()) {
                    fileList.push({
                        name: filename,
                        size: stat.size,
                        sizeFormatted: formatFileSize(stat.size),
                        uploadTime: stat.mtime.toISOString(),
                        uploadTimeFormatted: formatTime(stat.mtime),
                        icon: getFileIcon(filename),
                        type: getFileType(filename)
                    });
                }
            } catch (e) {
                console.error(`读取文件信息失败: ${filename}`, e.message);
            }
        });
        
        fileList.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
        
        return fileList;
    } catch (e) {
        console.error('读取文件列表失败:', e.message);
        return [];
    }
}

function formatTime(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hour = String(d.getHours()).padStart(2, '0');
    const minute = String(d.getMinutes()).padStart(2, '0');
    const second = String(d.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function generateUniqueFilename(dir, originalName) {
    let filename = originalName;
    let counter = 1;
    
    while (fs.existsSync(path.join(dir, filename))) {
        const ext = path.extname(originalName);
        const baseName = path.basename(originalName, ext);
        filename = `${baseName} (${counter})${ext}`;
        counter++;
    }
    
    return filename;
}

function deleteFile(dir, filename) {
    try {
        const filepath = path.join(dir, filename);
        
        if (!fs.existsSync(filepath)) {
            return { success: false, message: '文件不存在' };
        }
        
        const stat = fs.statSync(filepath);
        
        if (stat.isDirectory()) {
            return { success: false, message: '不能删除目录' };
        }
        
        fs.unlinkSync(filepath);
        
        return { success: true, message: '文件已删除' };
    } catch (e) {
        return { success: false, message: e.message };
    }
}

function clearAllFiles(dir) {
    try {
        if (!fs.existsSync(dir)) {
            return { success: true, message: '目录不存在', count: 0 };
        }
        
        const files = fs.readdirSync(dir);
        let count = 0;
        
        files.forEach(filename => {
            const filepath = path.join(dir, filename);
            try {
                const stat = fs.statSync(filepath);
                if (stat.isFile()) {
                    fs.unlinkSync(filepath);
                    count++;
                }
            } catch (e) {
                console.error(`删除文件失败: ${filename}`, e.message);
            }
        });
        
        return { success: true, message: `已清空 ${count} 个文件`, count };
    } catch (e) {
        return { success: false, message: e.message, count: 0 };
    }
}

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

module.exports = {
    formatFileSize,
    getFileIcon,
    getFileType,
    getFilesList,
    generateUniqueFilename,
    deleteFile,
    clearAllFiles,
    ensureDir,
    formatTime
};
