// ForkIt Backend - Play Integrity Verification
// Verifies Google Play Integrity tokens from the Android app
//
// STATUS: Stub implementation — returns 501 until real verification is configured.
// See PRODUCTION IMPLEMENTATION GUIDE at bottom of file.

import { runSecurityChecks } from '../lib/security.js';

export default async function handler(req, res) {
  // Run security checks (CORS, origin, rate limiting)
  if (!runSecurityChecks(req, res)) return;

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // Extract integrity token from request body
  const { token } = req.body;

  // Validate required parameter
  if (!token || typeof token !== 'string' || !token.trim()) {
    return res.status(400).json({ error: 'Missing or invalid token.' });
  }

  // Get Google Cloud project number from environment
  const projectNumber = process.env.GOOGLE_CLOUD_PROJECT_NUMBER;
  if (!projectNumber) {
    console.error('GOOGLE_CLOUD_PROJECT_NUMBER not configured');
    return res.status(501).json({
      verified: false,
      error: 'Integrity verification not configured.',
    });
  }

  try {
    // TODO: Implement real token verification using @googleapis/playintegrity
    // Until then, return 501 so callers know verification is not active.
    // The client app is designed to work regardless (integrity is optional).
    return res.status(501).json({
      verified: false,
      error: 'Integrity verification not yet implemented.',
    });
  } catch (error) {
    console.error('Error verifying integrity token:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/*
 * PRODUCTION IMPLEMENTATION GUIDE:
 *
 * 1. Install the Google Play Integrity library:
 *    npm install @googleapis/playintegrity
 *
 * 2. Replace the TODO section above with:
 *
 * import { playintegrity_v1 } from '@googleapis/playintegrity';
 *
 * const client = new playintegrity_v1.Playintegrity({
 *   // Use service account credentials for authentication
 * });
 *
 * const response = await client.v1.decodeIntegrityToken({
 *   packageName: 'com.forkit.app',
 *   parent: `projects/${projectNumber}`,
 *   requestBody: { integrityToken: token },
 * });
 *
 * const verdict = response.data.tokenPayloadExternal;
 * const appRecognized = verdict.appIntegrity?.appRecognitionVerdict === 'PLAY_RECOGNIZED';
 * const deviceTrusted = verdict.deviceIntegrity?.deviceRecognitionVerdict?.includes('MEETS_DEVICE_INTEGRITY');
 *
 * return res.status(200).json({
 *   verified: appRecognized && deviceTrusted,
 *   appIntegrity: verdict.appIntegrity,
 *   deviceIntegrity: verdict.deviceIntegrity,
 * });
 */
