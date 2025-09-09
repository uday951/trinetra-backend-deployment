const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const router = express.Router();

// Known malware hashes database (simplified)
const MALWARE_HASHES = new Set([
  // Add known malware SHA256 hashes here
  'example_malware_hash_1',
  'example_malware_hash_2'
]);

// Google Play Protect verification
router.post('/verify-app', async (req, res) => {
  try {
    const { packageName, hash } = req.body;

    // Check against Google Play Protect (mock implementation)
    const playProtectResult = {
      isVerified: !MALWARE_HASHES.has(hash),
      packageName,
      scanDate: new Date().toISOString(),
      threats: MALWARE_HASHES.has(hash) ? ['Known malware'] : []
    };

    res.json(playProtectResult);
  } catch (error) {
    console.error('Play Protect verification error:', error);
    res.status(500).json({ 
      error: 'Verification failed',
      isVerified: false,
      threats: ['Verification service unavailable']
    });
  }
});

// VirusTotal hash scan
router.post('/scan-hash', async (req, res) => {
  try {
    const { hash, type } = req.body;
    const apiKey = process.env.VIRUSTOTAL_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'VirusTotal API key not configured',
        malicious: false,
        threats: []
      });
    }

    // Check VirusTotal
    const vtResponse = await axios.get(
      `https://www.virustotal.com/vtapi/v2/file/report`,
      {
        params: {
          apikey: apiKey,
          resource: hash
        }
      }
    );

    const vtData = vtResponse.data;
    const malicious = vtData.positives > 0;
    const threats = malicious ? 
      [`${vtData.positives}/${vtData.total} engines detected threats`] : [];

    res.json({
      malicious,
      threats,
      scanDetails: {
        positives: vtData.positives,
        total: vtData.total,
        scanDate: vtData.scan_date,
        permalink: vtData.permalink
      }
    });

  } catch (error) {
    console.error('VirusTotal scan error:', error);
    res.status(500).json({
      error: 'Scan failed',
      malicious: false,
      threats: ['Scan service unavailable']
    });
  }
});

// Check malware database
router.post('/check-malware', async (req, res) => {
  try {
    const { hash } = req.body;
    
    const isMalware = MALWARE_HASHES.has(hash);
    
    res.json({
      isMalware,
      hash,
      checkDate: new Date().toISOString(),
      source: 'Internal database'
    });

  } catch (error) {
    console.error('Malware check error:', error);
    res.status(500).json({
      error: 'Check failed',
      isMalware: false
    });
  }
});

// Analyze APK permissions
router.post('/analyze-permissions', async (req, res) => {
  try {
    const { permissions } = req.body;
    
    const dangerousPermissions = [
      'android.permission.SEND_SMS',
      'android.permission.CALL_PHONE',
      'android.permission.DEVICE_ADMIN',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.WRITE_SETTINGS',
      'android.permission.INSTALL_PACKAGES',
      'android.permission.READ_SMS',
      'android.permission.RECEIVE_SMS',
      'android.permission.CAMERA',
      'android.permission.RECORD_AUDIO',
      'android.permission.ACCESS_FINE_LOCATION'
    ];

    const foundDangerous = permissions.filter(p => 
      dangerousPermissions.includes(p)
    );

    const riskScore = foundDangerous.length * 10; // Simple scoring
    const riskLevel = riskScore > 50 ? 'high' : riskScore > 20 ? 'medium' : 'low';

    res.json({
      dangerousPermissions: foundDangerous,
      riskScore,
      riskLevel,
      recommendations: foundDangerous.map(p => 
        `Review why app needs: ${p.split('.').pop()}`
      )
    });

  } catch (error) {
    console.error('Permission analysis error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      dangerousPermissions: [],
      riskScore: 0,
      riskLevel: 'unknown'
    });
  }
});

// Report malware
router.post('/report-malware', async (req, res) => {
  try {
    const { hash, packageName, reason } = req.body;
    
    // Add to malware database
    MALWARE_HASHES.add(hash);
    
    console.log(`Malware reported: ${packageName} (${hash}) - ${reason}`);
    
    res.json({
      success: true,
      message: 'Malware report submitted successfully'
    });

  } catch (error) {
    console.error('Malware report error:', error);
    res.status(500).json({
      error: 'Report submission failed'
    });
  }
});

// Get protection stats
router.get('/stats', async (req, res) => {
  try {
    res.json({
      totalMalwareHashes: MALWARE_HASHES.size,
      lastUpdated: new Date().toISOString(),
      protectionLevel: 'Active',
      scanEngines: {
        playProtect: true,
        virusTotal: !!process.env.VIRUSTOTAL_API_KEY,
        internalDatabase: true
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

module.exports = router;