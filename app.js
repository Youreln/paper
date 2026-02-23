/**
 * 飞传 FileFly - 前端逻辑
 * 所有交互真实可运行
 */

class FileFly {
    constructor() {
        this.authToken = localStorage.getItem('filefly_token') || '';
        this.selectedFiles = new Set();
        this.uploadQueue = [];
        this.isUploading = false;
        this.config = {};
        
        this.init();
    }
    
    async init() {
        this.createParticles();
        this.initTheme();
        this.bindEvents();
        await this.loadConfig();
        await this.checkAuth();
        await this.loadConnectionInfo();
        await this.loadFiles();
    }
    
    createParticles() {
        const container = document.getElementById('particles');
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = (15 + Math.random() * 10) + 's';
            container.appendChild(particle);
        }
    }
    
    initTheme() {
        const savedTheme = localStorage.getItem('filefly_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }
    
    updateThemeIcon(theme) {
        const icon = document.querySelector('#themeToggle i');
        icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('filefly_theme', newTheme);
        this.updateThemeIcon(newTheme);
    }
    
    bindEvents() {
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('refreshBtn').addEventListener('click', () => this.refresh());
        
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        uploadArea.addEventListener('click', (e) => {
            if (e.target === uploadArea || e.target.closest('.upload-icon') || e.target.closest('.upload-text')) {
                document.getElementById('fileInput').click();
            }
        });
        
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileSelect(e));
        document.getElementById('folderInput').addEventListener('change', (e) => this.handleFolderSelect(e));
        
        document.addEventListener('paste', (e) => this.handlePaste(e));
        
        document.getElementById('selectAllBtn').addEventListener('click', () => this.toggleSelectAll());
        document.getElementById('downloadSelectedBtn').addEventListener('click', () => this.downloadSelected());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAllFiles());
        
        document.getElementById('passwordSubmit').addEventListener('click', () => this.submitPassword());
        document.getElementById('passwordInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitPassword();
        });
    }
    
    async loadConfig() {
        try {
            const res = await this.fetch('/api/config');
            this.config = await res.json();
        } catch (e) {
            console.error('加载配置失败:', e);
        }
    }
    
    async checkAuth() {
        if (this.config.hasPassword && !this.authToken) {
            this.showPasswordModal();
            return false;
        }
        return true;
    }
    
    showPasswordModal() {
        document.getElementById('passwordModal').classList.remove('hidden');
        document.getElementById('passwordInput').focus();
    }
    
    hidePasswordModal() {
        document.getElementById('passwordModal').classList.add('hidden');
        document.getElementById('passwordError').classList.add('hidden');
    }
    
    async submitPassword() {
        const password = document.getElementById('passwordInput').value;
        if (!password) return;
        
        try {
            const res = await fetch('/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            
            const data = await res.json();
            
            if (data.success) {
                this.authToken = data.token || password;
                localStorage.setItem('filefly_token', this.authToken);
                this.hidePasswordModal();
                this.showToast('验证成功', 'success');
                await this.loadFiles();
            } else {
                document.getElementById('passwordError').classList.remove('hidden');
                document.getElementById('passwordInput').value = '';
            }
        } catch (e) {
            this.showToast('验证失败', 'error');
        }
    }
    
    async fetch(url, options = {}) {
        const headers = options.headers || {};
        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';
        
        return fetch(url, { ...options, headers });
    }
    
    async loadConnectionInfo() {
        try {
            const res = await this.fetch('/api/info');
            const data = await res.json();
            
            if (data.qrCode) {
                document.getElementById('qrPlaceholder').classList.add('hidden');
                const qrImg = document.getElementById('qrCode');
                qrImg.src = data.qrCode;
                qrImg.classList.remove('hidden');
            }
            
            document.getElementById('localAddress').textContent = `http://localhost:${data.port}`;
            
            if (data.addresses && data.addresses.length > 0) {
                document.getElementById('lanAddress').textContent = data.addresses[0];
                
                const addressList = document.getElementById('addressList');
                addressList.innerHTML = data.addresses.map(addr => 
                    `<li><i class="fas fa-link"></i> <code onclick="fileFly.copyToClipboard('${addr}')">${addr}</code></li>`
                ).join('');
                
                if (data.addresses.length > 1) {
                    document.getElementById('allAddresses').classList.remove('hidden');
                }
            }
        } catch (e) {
            console.error('加载连接信息失败:', e);
        }
    }
    
    async loadFiles() {
        try {
            const res = await this.fetch('/api/files');
            const files = await res.json();
            this.renderFiles(files);
        } catch (e) {
            console.error('加载文件列表失败:', e);
        }
    }
    
    renderFiles(files) {
        const container = document.getElementById('filesList');
        const countEl = document.getElementById('fileCount');
        const sizeEl = document.getElementById('totalSize');
        
        countEl.textContent = files.length;
        
        let totalSize = 0;
        files.forEach(f => totalSize += f.size);
        sizeEl.textContent = this.formatSize(totalSize);
        
        if (files.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox fa-3x"></i>
                    <p>暂无文件</p>
                    <span>上传文件后将显示在这里</span>
                </div>
            `;
            return;
        }
        
        container.innerHTML = files.map(file => `
            <div class="file-item ${this.selectedFiles.has(file.name) ? 'selected' : ''}" 
                 data-name="${this.escapeHtml(file.name)}" onclick="fileFly.toggleFileSelect('${this.escapeHtml(file.name)}', event)">
                <div class="file-checkbox">
                    <i class="fas fa-check"></i>
                </div>
                <div class="file-icon">
                    <i class="fas ${file.icon}"></i>
                </div>
                <div class="file-info">
                    <div class="file-name" title="${this.escapeHtml(file.name)}">${this.escapeHtml(file.name)}</div>
                    <div class="file-meta">
                        <span>${file.sizeFormatted}</span>
                        <span>${file.uploadTimeFormatted}</span>
                    </div>
                </div>
                <div class="file-actions" onclick="event.stopPropagation()">
                    <button class="file-action-btn" onclick="fileFly.downloadFile('${this.escapeHtml(file.name)}')" title="下载">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="file-action-btn delete" onclick="fileFly.deleteFile('${this.escapeHtml(file.name)}')" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        this.updateSelectedCount();
    }
    
    toggleFileSelect(filename, event) {
        if (event.target.closest('.file-actions')) return;
        
        if (this.selectedFiles.has(filename)) {
            this.selectedFiles.delete(filename);
        } else {
            this.selectedFiles.add(filename);
        }
        
        const item = document.querySelector(`.file-item[data-name="${filename}"]`);
        if (item) {
            item.classList.toggle('selected');
        }
        
        this.updateSelectedCount();
    }
    
    toggleSelectAll() {
        const items = document.querySelectorAll('.file-item');
        const allSelected = this.selectedFiles.size === items.length;
        
        items.forEach(item => {
            const name = item.dataset.name;
            if (allSelected) {
                this.selectedFiles.delete(name);
                item.classList.remove('selected');
            } else {
                this.selectedFiles.add(name);
                item.classList.add('selected');
            }
        });
        
        this.updateSelectedCount();
    }
    
    updateSelectedCount() {
        const btn = document.getElementById('downloadSelectedBtn');
        if (this.selectedFiles.size > 0) {
            btn.classList.remove('hidden');
            btn.innerHTML = `<i class="fas fa-download"></i> 下载选中 (${this.selectedFiles.size})`;
        } else {
            btn.classList.add('hidden');
        }
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadArea').classList.add('drag-over');
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadArea').classList.remove('drag-over');
    }
    
    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadArea').classList.remove('drag-over');
        
        const items = e.dataTransfer.items;
        const files = [];
        
        if (items) {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.kind === 'file') {
                    const file = item.getAsFile();
                    if (file) files.push(file);
                }
            }
        } else {
            for (let i = 0; i < e.dataTransfer.files.length; i++) {
                files.push(e.dataTransfer.files[i]);
            }
        }
        
        if (files.length > 0) {
            this.uploadFiles(files);
        }
    }
    
    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            this.uploadFiles(files);
        }
        e.target.value = '';
    }
    
    handleFolderSelect(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            this.uploadFiles(files);
        }
        e.target.value = '';
    }
    
    handlePaste(e) {
        const items = e.clipboardData?.items;
        if (!items) return;
        
        const files = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file) {
                    const timestamp = Date.now();
                    const newFile = new File([file], `screenshot_${timestamp}.png`, { type: file.type || 'image/png' });
                    files.push(newFile);
                }
            }
        }
        
        if (files.length > 0) {
            this.uploadFiles(files);
            this.showToast('检测到截图粘贴', 'info');
        }
    }
    
    async uploadFiles(files) {
        if (!this.config.allowUpload) {
            this.showToast('上传功能已禁用', 'error');
            return;
        }
        
        if (this.isUploading) {
            this.showToast('正在上传中，请稍候', 'warning');
            return;
        }
        
        this.isUploading = true;
        const totalSize = files.reduce((sum, f) => sum + f.size, 0);
        let uploadedSize = 0;
        let uploadedCount = 0;
        
        const progressEl = document.getElementById('uploadProgress');
        const progressFill = document.getElementById('progressFill');
        const progressPercent = document.getElementById('progressPercent');
        const uploadFileName = document.getElementById('uploadFileName');
        const uploadSpeed = document.getElementById('uploadSpeed');
        
        progressEl.classList.remove('hidden');
        
        const startTime = Date.now();
        
        for (const file of files) {
            uploadFileName.textContent = `上传: ${file.name}`;
            
            try {
                await this.uploadSingleFile(file, (loaded) => {
                    const currentUploaded = uploadedSize + loaded;
                    const percent = Math.round((currentUploaded / totalSize) * 100);
                    progressFill.style.width = percent + '%';
                    progressPercent.textContent = percent + '%';
                    
                    const elapsed = (Date.now() - startTime) / 1000;
                    const speed = currentUploaded / elapsed;
                    uploadSpeed.textContent = this.formatSize(speed) + '/s';
                });
                
                uploadedSize += file.size;
                uploadedCount++;
            } catch (e) {
                console.error('上传失败:', file.name, e);
                this.showToast(`${file.name} 上传失败`, 'error');
            }
        }
        
        progressEl.classList.add('hidden');
        this.isUploading = false;
        
        this.showToast(`成功上传 ${uploadedCount} 个文件`, 'success');
        await this.loadFiles();
    }
    
    uploadSingleFile(file, onProgress) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('files', file);
            
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable && onProgress) {
                    onProgress(e.loaded);
                }
            };
            
            xhr.onload = () => {
                if (xhr.status === 200) {
                    resolve();
                } else {
                    reject(new Error(xhr.statusText));
                }
            };
            
            xhr.onerror = () => reject(new Error('网络错误'));
            
            xhr.open('POST', '/api/upload');
            if (this.authToken) {
                xhr.setRequestHeader('Authorization', `Bearer ${this.authToken}`);
            }
            xhr.send(formData);
        });
    }
    
    downloadFile(filename) {
        if (!this.config.allowDownload) {
            this.showToast('下载功能已禁用', 'error');
            return;
        }
        
        const link = document.createElement('a');
        link.href = `/api/download/${encodeURIComponent(filename)}`;
        if (this.authToken) {
            link.href += `?token=${encodeURIComponent(this.authToken)}`;
        }
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast('开始下载', 'info');
    }
    
    async downloadSelected() {
        if (!this.config.allowDownload) {
            this.showToast('下载功能已禁用', 'error');
            return;
        }
        
        if (this.selectedFiles.size === 0) {
            this.showToast('请先选择文件', 'warning');
            return;
        }
        
        this.showToast('正在打包下载...', 'info');
        
        try {
            const res = await this.fetch('/api/download-zip', {
                method: 'POST',
                body: JSON.stringify({ files: Array.from(this.selectedFiles) })
            });
            
            if (!res.ok) throw new Error('下载失败');
            
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `FileFly_${Date.now()}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            this.showToast('下载完成', 'success');
        } catch (e) {
            this.showToast('下载失败', 'error');
        }
    }
    
    async deleteFile(filename) {
        if (!this.config.allowDelete) {
            this.showToast('删除功能已禁用', 'error');
            return;
        }
        
        if (!confirm(`确定要删除 "${filename}" 吗？`)) return;
        
        try {
            const res = await this.fetch(`/api/file/${encodeURIComponent(filename)}`, {
                method: 'DELETE'
            });
            
            const data = await res.json();
            
            if (data.success) {
                this.showToast('文件已删除', 'success');
                this.selectedFiles.delete(filename);
                await this.loadFiles();
            } else {
                this.showToast(data.message || '删除失败', 'error');
            }
        } catch (e) {
            this.showToast('删除失败', 'error');
        }
    }
    
    async clearAllFiles() {
        if (!this.config.allowDelete) {
            this.showToast('删除功能已禁用', 'error');
            return;
        }
        
        if (!confirm('确定要清空所有文件吗？此操作不可恢复！')) return;
        
        try {
            const res = await this.fetch('/api/clear', { method: 'POST' });
            const data = await res.json();
            
            if (data.success) {
                this.showToast(`已清空 ${data.count} 个文件`, 'success');
                this.selectedFiles.clear();
                await this.loadFiles();
            } else {
                this.showToast(data.message || '清空失败', 'error');
            }
        } catch (e) {
            this.showToast('清空失败', 'error');
        }
    }
    
    async refresh() {
        const btn = document.getElementById('refreshBtn');
        btn.querySelector('i').classList.add('fa-spin');
        
        await Promise.all([
            this.loadConnectionInfo(),
            this.loadFiles()
        ]);
        
        setTimeout(() => {
            btn.querySelector('i').classList.remove('fa-spin');
        }, 500);
        
        this.showToast('已刷新', 'info');
    }
    
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('已复制到剪贴板', 'success');
        }).catch(() => {
            this.showToast('复制失败', 'error');
        });
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span>${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + units[i];
    }
    
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

const fileFly = new FileFly();
