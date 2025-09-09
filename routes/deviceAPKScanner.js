const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');
const router = express.Router();

// Simulate APK scanning on device (since we can't access real device from backend)
router.post('/scan-device', async (req, res) => {
  try {
    const { deviceId } = req.body;
    
    // Simulate real APK files that might be on a device
    const simulatedAPKs = [
      {
        name: 'WhatsApp.apk',
        path: '/storage/emulated/0/Download/WhatsApp.apk',
        size: 45234567,
        lastModified: Date.now() - 86400000, // 1 day ago
        source: 'Downloads'
      },
      {
        name: 'Instagram.apk', 
        path: '/storage/emulated/0/Download/Instagram.apk',
        size: 32145678,
        lastModified: Date.now() - 172800000, // 2 days ago
        source: 'Downloads'
      },
      {
        name: 'TikTok_Mod.apk',
        path: '/storage/emulated/0/Download/TikTok_Mod.apk', 
        size: 28567890,
        lastModified: Date.now() - 259200000, // 3 days ago
        source: 'Downloads'
      },
      {
        name: 'Banking_Hack.apk',
        path: '/storage/emulated/0/Download/Banking_Hack.apk',
        size: 15234567,
        lastModified: Date.now() - 345600000, // 4 days ago
        source: 'Downloads'
      },
      {
        name: 'Facebook.apk',
        path: '/storage/emulated/0/Download/Facebook.apk',
        size: 67890123,
        lastModified: Date.now() - 432000000, // 5 days ago
        source: 'Downloads'
      }
    ];

    // Randomly include APKs to simulate real device scanning
    const foundAPKs = simulatedAPKs.filter(() => Math.random() > 0.3); // 70% chance each

    res.json({
      success: true,
      deviceId,
      scanTime: new Date().toISOString(),
      apksFound: foundAPKs.length,
      apks: foundAPKs
    });

  } catch (error) {
    console.error('Device scan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to scan device',
      message: error.message
    });
  }
});

// Analyze APK for security threats
router.post('/analyze-apk', async (req, res) => {
  try {
    const { apkName, apkSize, apkPath } = req.body;
    
    const threats = [];
    let riskScore = 0;
    let riskLevel = 'LOW';

    // Real security analysis
    const suspiciousPatterns = {
      'mod': { threat: 'Modified application detected', score: 40 },
      'hack': { threat: 'Hacking tool identified', score: 80 },
      'crack': { threat: 'Cracked software found', score: 60 },
      'cheat': { threat: 'Cheating application', score: 30 },
      'bypass': { threat: 'Security bypass tool', score: 70 },
      'gb': { threat: 'Unofficial GB modification', score: 35 },
      'plus': { threat: 'Unofficial Plus version', score: 25 },
      'pro': { threat: 'Suspicious Pro version', score: 20 },
      'free': { threat: 'Suspicious free version', score: 15 }
    };

    // Analyze filename
    const fileName = apkName.toLowerCase();
    for (const [pattern, info] of Object.entries(suspiciousPatterns)) {
      if (fileName.includes(pattern)) {
        threats.push(info.threat);
        riskScore += info.score;
      }
    }

    // File size analysis
    if (apkSize < 50000) {
      threats.push('Suspiciously small APK file');
      riskScore += 40;
    } else if (apkSize > 200000000) {
      threats.push('Unusually large APK file');
      riskScore += 15;
    }

    // Critical combinations
    if (fileName.includes('bank') && riskScore > 0) {
      threats.push('CRITICAL: Banking app with modifications');
      riskScore += 100;
    }

    if (fileName.includes('pay') && riskScore > 0) {
      threats.push('WARNING: Payment app with modifications');
      riskScore += 80;
    }

    // VirusTotal check if available
    if (process.env.VIRUSTOTAL_API_KEY) {
      try {
        // Generate hash for VirusTotal (simulated)
        const hash = crypto.createHash('sha256').update(apkName + apkSize).digest('hex');
        
        const vtResponse = await axios.get(
          `https://www.virustotal.com/vtapi/v2/file/report`,
          {
            params: {
              apikey: process.env.VIRUSTOTAL_API_KEY,
              resource: hash
            }
          }
        );

        if (vtResponse.data.positives > 0) {
          threats.push(`VirusTotal: ${vtResponse.data.positives}/${vtResponse.data.total} engines flagged`);
          riskScore += vtResponse.data.positives * 10;
        }
      } catch (error) {
        console.log('VirusTotal check failed:', error.message);
      }
    }

    // Determine risk level
    if (riskScore >= 100) riskLevel = 'CRITICAL';
    else if (riskScore >= 60) riskLevel = 'HIGH';
    else if (riskScore >= 30) riskLevel = 'MEDIUM';
    else riskLevel = 'LOW';

    res.json({
      success: true,
      apkName,
      analysis: {
        threats,
        riskScore,
        riskLevel,
        isSafe: threats.length === 0 && riskScore < 30,
        scanTime: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('APK analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze APK',
      message: error.message
    });
  }
});

// Bulk analyze multiple APKs
router.post('/bulk-analyze', async (req, res) => {
  try {
    const { apks } = req.body;
    
    const results = [];
    
    for (const apk of apks) {
      // Analyze each APK
      const analysisResponse = await analyzeAPKInternal(apk.name, apk.size, apk.path);
      results.push({
        ...apk,
        analysis: analysisResponse
      });
    }

    const safeCount = results.filter(r => r.analysis.isSafe).length;
    const threatCount = results.filter(r => !r.analysis.isSafe).length;
    const criticalCount = results.filter(r => r.analysis.riskLevel === 'CRITICAL').length;

    res.json({
      success: true,
      summary: {
        total: results.length,
        safe: safeCount,
        threats: threatCount,
        critical: criticalCount
      },
      results,
      scanTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('Bulk analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze APKs',
      message: error.message
    });
  }
});

// Internal analysis function
async function analyzeAPKInternal(apkName, apkSize, apkPath) {
  const threats = [];
  let riskScore = 0;

  const suspiciousPatterns = {
    'mod': { threat: 'Modified application', score: 40 },
    'hack': { threat: 'Hacking tool', score: 80 },
    'crack': { threat: 'Cracked software', score: 60 },
    'bank': { threat: 'Banking app modification', score: 100 }
  };

  const fileName = apkName.toLowerCase();
  for (const [pattern, info] of Object.entries(suspiciousPatterns)) {
    if (fileName.includes(pattern)) {
      threats.push(info.threat);
      riskScore += info.score;
    }
  }

  if (apkSize < 50000) {
    threats.push('Suspiciously small file');
    riskScore += 40;
  }

  let riskLevel = 'LOW';
  if (riskScore >= 100) riskLevel = 'CRITICAL';
  else if (riskScore >= 60) riskLevel = 'HIGH';
  else if (riskScore >= 30) riskLevel = 'MEDIUM';

  return {
    threats,
    riskScore,
    riskLevel,
    isSafe: threats.length === 0 && riskScore < 30
  };
}

module.exports = router;