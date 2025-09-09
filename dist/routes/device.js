"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const os_1 = __importDefault(require("os"));
const systemInfo_1 = require("../services/systemInfo");
const deviceControl_1 = require("../services/deviceControl");
const location_1 = require("../services/location");
const systeminformation_1 = __importDefault(require("systeminformation"));
const router = express_1.default.Router();
const systemInfoService = new systemInfo_1.SystemInfoService();
const deviceControl = new deviceControl_1.DeviceControl();
const locationTracker = new location_1.LocationTracker();
// Get system information
router.get('/system', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const info = yield systemInfoService.getSystemInfo();
        res.json(info);
    }
    catch (error) {
        console.error('Error getting system info:', error);
        res.status(500).json({ error: 'Failed to get system information' });
    }
}));
// Get device health metrics
router.get('/health', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [cpu, mem, battery, temp] = yield Promise.all([
            systeminformation_1.default.currentLoad(),
            systeminformation_1.default.mem(),
            systeminformation_1.default.battery(),
            systeminformation_1.default.cpuTemperature()
        ]);
        res.json({
            cpuUsage: cpu.currentLoad,
            memoryUsage: (mem.used / mem.total) * 100,
            storageUsage: 0, // TODO: Implement storage usage
            batteryHealth: battery.percent,
            temperature: temp.main,
            recommendations: [
                'Clear cache files',
                'Update system software',
                'Remove unused apps'
            ]
        });
    }
    catch (error) {
        console.error('Error getting device health:', error);
        res.status(500).json({ error: 'Failed to get device health metrics' });
    }
}));
// Optimize device
router.post('/optimize', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // In a real implementation, this would perform actual optimization
        // For now, we'll return mock optimized metrics
        const [cpu, mem, battery, temp] = yield Promise.all([
            systeminformation_1.default.currentLoad(),
            systeminformation_1.default.mem(),
            systeminformation_1.default.battery(),
            systeminformation_1.default.cpuTemperature()
        ]);
        res.json({
            cpuUsage: Math.min(cpu.currentLoad, 30), // Simulate reduced CPU usage
            memoryUsage: Math.min((mem.used / mem.total) * 100, 45), // Simulate reduced memory usage
            storageUsage: 60, // Mock storage usage
            batteryHealth: battery.percent,
            temperature: Math.min(temp.main, 35), // Simulate reduced temperature
            recommendations: ['System optimized successfully']
        });
    }
    catch (error) {
        console.error('Error optimizing device:', error);
        res.status(500).json({ error: 'Failed to optimize device' });
    }
}));
// Get running processes
router.get('/processes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const processes = yield systeminformation_1.default.processes();
        res.json({
            processes: processes.list.map(proc => ({
                pid: proc.pid,
                name: proc.name,
                cpu: proc.cpu,
                memory: proc.mem
            }))
        });
    }
    catch (error) {
        console.error('Error getting processes:', error);
        res.status(500).json({ error: 'Failed to get running processes' });
    }
}));
// Get network information
router.get('/network', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const networkInterfaces = os_1.default.networkInterfaces();
        const formattedInterfaces = Object.entries(networkInterfaces).map(([name, interfaces]) => ({
            name,
            interfaces: (interfaces === null || interfaces === void 0 ? void 0 : interfaces.map(iface => ({
                address: iface.address,
                netmask: iface.netmask,
                family: iface.family,
                mac: iface.mac,
                internal: iface.internal
            }))) || []
        }));
        res.json({
            hostname: os_1.default.hostname(),
            interfaces: formattedInterfaces
        });
    }
    catch (error) {
        console.error('Error getting network info:', error);
        res.status(500).json({ error: 'Failed to get network information' });
    }
}));
// Get location information
router.get('/location', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const location = yield locationTracker.getCurrentLocation();
        res.json(location);
    }
    catch (error) {
        console.error('Error getting location:', error);
        res.status(500).json({ error: 'Failed to get location information' });
    }
}));
// Anti-theft features
let deviceLocation = {
    latitude: null,
    longitude: null,
    lastUpdated: null
};
// Update device location
router.post('/location', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { latitude, longitude } = req.body;
        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }
        deviceLocation = {
            latitude,
            longitude,
            lastUpdated: new Date().toISOString()
        };
        res.json({ status: 'location updated', location: deviceLocation });
    }
    catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ error: 'Failed to update device location' });
    }
}));
// Remote wipe (just a mock implementation - actual implementation would need proper security)
router.post('/remote-wipe', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { confirmationCode } = req.body;
        if (!confirmationCode || confirmationCode !== process.env.REMOTE_WIPE_CODE) {
            return res.status(403).json({ error: 'Invalid confirmation code' });
        }
        // In a real implementation, this would trigger a secure device wipe
        res.json({ status: 'remote wipe initiated' });
    }
    catch (error) {
        console.error('Error initiating remote wipe:', error);
        res.status(500).json({ error: 'Failed to initiate remote wipe' });
    }
}));
// Lock device
router.post('/lock', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pin } = req.body;
        if (!pin) {
            return res.status(400).json({ error: 'PIN is required' });
        }
        yield deviceControl.lockDevice(pin);
        res.json({ message: 'Device locked successfully' });
    }
    catch (error) {
        console.error('Error locking device:', error);
        res.status(500).json({ error: 'Failed to lock device' });
    }
}));
// Wipe device
router.post('/wipe', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { confirmationCode } = req.body;
        if (!confirmationCode) {
            return res.status(400).json({ error: 'Confirmation code is required' });
        }
        yield deviceControl.wipeDevice(confirmationCode);
        res.json({ message: 'Device wiped successfully' });
    }
    catch (error) {
        console.error('Error wiping device:', error);
        res.status(500).json({ error: 'Failed to wipe device' });
    }
}));
// Play alarm sound
router.post('/play-sound', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield deviceControl.playSound();
        res.json({ message: 'Alarm sound played successfully' });
    }
    catch (error) {
        console.error('Error playing alarm sound:', error);
        res.status(500).json({ error: 'Failed to play alarm sound' });
    }
}));
exports.default = router;
