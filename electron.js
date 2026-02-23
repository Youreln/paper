/**
 * 飞传 FileFly - Electron 主进程
 * 桌面应用入口
 */

const { app, BrowserWindow, Menu, Tray, shell, dialog, nativeImage } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow = null;
let tray = null;
let serverProcess = null;
let serverPort = 3000;

const isDev = process.env.ELECTRON_DEV === 'true';

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        title: '飞传 FileFly',
        icon: path.join(__dirname, 'assets', 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true
        },
        show: false,
        backgroundColor: '#0f172a'
    });

    const serverUrl = `http://localhost:${serverPort}`;
    mainWindow.loadURL(serverUrl);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        if (isDev) {
            mainWindow.webContents.openDevTools();
        }
    });

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.log('加载失败:', errorDescription);
        setTimeout(() => {
            mainWindow.loadURL(serverUrl);
        }, 1000);
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    createMenu();
}

function createMenu() {
    const template = [
        {
            label: '文件',
            submenu: [
                { label: '刷新', accelerator: 'CmdOrCtrl+R', click: () => mainWindow?.reload() },
                { type: 'separator' },
                { label: '退出', accelerator: 'CmdOrCtrl+Q', click: () => quitApp() }
            ]
        },
        {
            label: '编辑',
            submenu: [
                { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                { label: '重做', accelerator: 'CmdOrCtrl+Shift+Z', role: 'redo' },
                { type: 'separator' },
                { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' }
            ]
        },
        {
            label: '视图',
            submenu: [
                { label: '重新加载', accelerator: 'CmdOrCtrl+Shift+R', role: 'reload' },
                { label: '强制重新加载', accelerator: 'CmdOrCtrl+Shift+F5', role: 'forceReload' },
                { type: 'separator' },
                { label: '实际大小', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
                { label: '放大', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
                { label: '缩小', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
                { type: 'separator' },
                { label: '全屏', accelerator: 'F11', role: 'togglefullscreen' },
                { label: '开发者工具', accelerator: 'F12', role: 'toggleDevTools' }
            ]
        },
        {
            label: '帮助',
            submenu: [
                { 
                    label: 'GitHub 开源地址', 
                    click: () => shell.openExternal('https://github.com/Youreln/FileFly')
                },
                { 
                    label: '检查更新', 
                    click: () => shell.openExternal('https://github.com/Youreln/FileFly/releases')
                },
                { type: 'separator' },
                { 
                    label: '关于', 
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: '关于 飞传 FileFly',
                            message: '飞传 FileFly v1.0.0',
                            detail: '局域网高速文件传输工具\n\n作者: Youreln\n© 2026 Youreln 版权所有\n\nhttps://github.com/Youreln/FileFly'
                        });
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

function createTray() {
    const iconPath = path.join(__dirname, 'assets', 'icon.png');
    const trayIcon = nativeImage.createFromPath(iconPath);
    
    tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));
    
    const contextMenu = Menu.buildFromTemplate([
        { label: '显示主窗口', click: () => mainWindow?.show() },
        { label: '打开设置', click: () => mainWindow?.webContents.send('open-settings') },
        { type: 'separator' },
        { 
            label: 'GitHub', 
            click: () => shell.openExternal('https://github.com/Youreln/FileFly')
        },
        { type: 'separator' },
        { label: '退出', click: () => quitApp() }
    ]);
    
    tray.setToolTip('飞传 FileFly');
    tray.setContextMenu(contextMenu);
    
    tray.on('double-click', () => {
        mainWindow?.show();
    });
}

function startServer() {
    return new Promise((resolve, reject) => {
        const serverPath = path.join(__dirname, 'index.js');
        
        serverProcess = spawn(process.execPath, [serverPath], {
            env: { ...process.env, PORT: serverPort.toString() },
            stdio: ['ignore', 'pipe', 'pipe']
        });

        serverProcess.stdout.on('data', (data) => {
            console.log(`[Server] ${data}`);
            if (data.toString().includes('已启动')) {
                resolve();
            }
        });

        serverProcess.stderr.on('data', (data) => {
            console.error(`[Server Error] ${data}`);
        });

        serverProcess.on('error', (err) => {
            console.error('服务器启动失败:', err);
            reject(err);
        });

        setTimeout(resolve, 2000);
    });
}

function stopServer() {
    if (serverProcess) {
        serverProcess.kill();
        serverProcess = null;
    }
}

function quitApp() {
    app.isQuitting = true;
    stopServer();
    tray?.destroy();
    mainWindow?.close();
    app.quit();
}

app.whenReady().then(async () => {
    try {
        console.log('正在启动服务器...');
        await startServer();
        console.log('服务器已启动');
        
        createWindow();
        createTray();
        
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow();
            } else {
                mainWindow?.show();
            }
        });
    } catch (err) {
        console.error('启动失败:', err);
        dialog.showErrorBox('启动失败', `服务器启动失败: ${err.message}`);
        app.quit();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        quitApp();
    }
});

app.on('before-quit', () => {
    app.isQuitting = true;
    stopServer();
});

process.on('uncaughtException', (err) => {
    console.error('未捕获的异常:', err);
});
