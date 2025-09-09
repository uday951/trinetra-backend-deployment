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
const ws_1 = __importDefault(require("ws"));
const router = express_1.default.Router();
// In-memory store for alerts (in production, use a database)
const alerts = [];
const alertSubscribers = new Set();
// Helper function to send alert to all subscribers
const broadcastAlert = (alert) => {
    alertSubscribers.forEach(client => {
        if (client.readyState === ws_1.default.OPEN) {
            client.send(JSON.stringify(alert));
        }
    });
};
// Create a new alert
router.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, severity, message, source, timestamp } = req.body;
        if (!type || !severity || !message) {
            return res.status(400).json({ error: 'Type, severity, and message are required' });
        }
        const alert = {
            id: Date.now().toString(),
            type,
            severity,
            message,
            source,
            timestamp: timestamp || new Date().toISOString(),
            status: 'new'
        };
        alerts.push(alert);
        broadcastAlert(alert);
        res.json({
            status: 'alert created',
            alert
        });
    }
    catch (error) {
        console.error('Error creating alert:', error);
        res.status(500).json({ error: 'Failed to create alert' });
    }
}));
// Get all alerts
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, severity, type } = req.query;
        let filteredAlerts = [...alerts];
        if (status) {
            filteredAlerts = filteredAlerts.filter(alert => alert.status === status);
        }
        if (severity) {
            filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
        }
        if (type) {
            filteredAlerts = filteredAlerts.filter(alert => alert.type === type);
        }
        res.json({
            alerts: filteredAlerts
        });
    }
    catch (error) {
        console.error('Error getting alerts:', error);
        res.status(500).json({ error: 'Failed to get alerts' });
    }
}));
// Update alert status
router.patch('/:alertId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { alertId } = req.params;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }
        const alert = alerts.find(a => a.id === alertId);
        if (!alert) {
            return res.status(404).json({ error: 'Alert not found' });
        }
        alert.status = status;
        alert.updatedAt = new Date().toISOString();
        broadcastAlert(Object.assign(Object.assign({}, alert), { type: 'alert_update' }));
        res.json({
            status: 'alert updated',
            alert
        });
    }
    catch (error) {
        console.error('Error updating alert:', error);
        res.status(500).json({ error: 'Failed to update alert' });
    }
}));
// Delete alert
router.delete('/:alertId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { alertId } = req.params;
        const alertIndex = alerts.findIndex(a => a.id === alertId);
        if (alertIndex === -1) {
            return res.status(404).json({ error: 'Alert not found' });
        }
        const [deletedAlert] = alerts.splice(alertIndex, 1);
        broadcastAlert(Object.assign(Object.assign({}, deletedAlert), { type: 'alert_deleted' }));
        res.json({
            status: 'alert deleted',
            alert: deletedAlert
        });
    }
    catch (error) {
        console.error('Error deleting alert:', error);
        res.status(500).json({ error: 'Failed to delete alert' });
    }
}));
// Subscribe to real-time alerts
router.get('/subscribe', (req, res) => {
    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    res.writeHead(200, headers);
    const clientId = Date.now();
    const newClient = {
        id: clientId,
        res
    };
    req.on('close', () => {
        alertSubscribers.delete(newClient);
    });
    alertSubscribers.add(newClient);
});
// Get alert statistics
router.get('/stats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = {
            total: alerts.length,
            bySeverity: alerts.reduce((acc, alert) => {
                acc[alert.severity] = (acc[alert.severity] || 0) + 1;
                return acc;
            }, {}),
            byStatus: alerts.reduce((acc, alert) => {
                acc[alert.status] = (acc[alert.status] || 0) + 1;
                return acc;
            }, {}),
            byType: alerts.reduce((acc, alert) => {
                acc[alert.type] = (acc[alert.type] || 0) + 1;
                return acc;
            }, {})
        };
        res.json(stats);
    }
    catch (error) {
        console.error('Error getting alert stats:', error);
        res.status(500).json({ error: 'Failed to get alert statistics' });
    }
}));
exports.default = router;
