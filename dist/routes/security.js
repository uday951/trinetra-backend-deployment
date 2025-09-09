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
const multer_1 = __importDefault(require("multer"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const router = express_1.default.Router();
const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;
const VIRUSTOTAL_API_URL = 'https://www.virustotal.com/vtapi/v2';
// Configure multer for file uploads
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
// Scan file for malware
router.post('/scan-file', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        // Upload file to VirusTotal
        const fileBuffer = req.file.buffer;
        const response = yield axios_1.default.post(`${VIRUSTOTAL_API_URL}/file/scan`, {
            apikey: VIRUSTOTAL_API_KEY,
            file: fileBuffer
        });
        // Get scan results
        const results = yield axios_1.default.get(`${VIRUSTOTAL_API_URL}/file/report`, {
            params: {
                apikey: VIRUSTOTAL_API_KEY,
                resource: response.data.resource
            }
        });
        res.json({
            scanId: response.data.resource,
            results: results.data.scans,
            positives: results.data.positives,
            total: results.data.total
        });
    }
    catch (error) {
        console.error('Error scanning file:', error);
        res.status(500).json({ error: 'Error scanning file' });
    }
}));
// Check URL safety
router.post('/check-url', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        // Scan URL using VirusTotal
        const scanResponse = yield axios_1.default.post(`${VIRUSTOTAL_API_URL}/url/scan`, {
            apikey: VIRUSTOTAL_API_KEY,
            url: url
        });
        const reportResponse = yield axios_1.default.get(`${VIRUSTOTAL_API_URL}/url/report`, {
            params: {
                apikey: VIRUSTOTAL_API_KEY,
                resource: scanResponse.data.scan_id
            }
        });
        res.json({
            scanId: scanResponse.data.scan_id,
            results: reportResponse.data.scans,
            positives: reportResponse.data.positives,
            total: reportResponse.data.total
        });
    }
    catch (error) {
        console.error('Error checking URL:', error);
        res.status(500).json({ error: 'Error checking URL' });
    }
}));
// Get scan history
router.get('/scan-history', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // In a real implementation, this would fetch from a database
        res.json({
            history: []
        });
    }
    catch (error) {
        console.error('Error fetching scan history:', error);
        res.status(500).json({ error: 'Error fetching scan history' });
    }
}));
exports.default = router;
