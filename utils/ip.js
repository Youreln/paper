/**
 * IP地址工具模块
 * 获取本机局域网IP地址
 */

const os = require('os');

function getLocalIPs() {
    const interfaces = os.networkInterfaces();
    const ips = [];
    
    Object.keys(interfaces).forEach(iface => {
        interfaces[iface].forEach(addr => {
            if (addr.family === 'IPv4' && !addr.internal) {
                ips.push(addr.address);
            }
        });
    });
    
    return ips.length > 0 ? ips : ['127.0.0.1'];
}

function getPrimaryIP() {
    const ips = getLocalIPs();
    return ips[0] || '127.0.0.1';
}

function getAvailablePorts(startPort, count = 10) {
    const net = require('net');
    const ports = [];
    
    return new Promise((resolve) => {
        let checked = 0;
        let currentPort = startPort;
        
        function checkPort(port) {
            const server = net.createServer();
            
            server.once('error', () => {
                checked++;
                checkNext();
            });
            
            server.once('listening', () => {
                server.close();
                ports.push(port);
                checked++;
                checkNext();
            });
            
            server.listen(port);
        }
        
        function checkNext() {
            if (ports.length >= count || checked >= count * 2) {
                resolve(ports);
                return;
            }
            
            currentPort++;
            checkPort(currentPort);
        }
        
        checkPort(startPort);
    });
}

module.exports = {
    getLocalIPs,
    getPrimaryIP,
    getAvailablePorts
};
