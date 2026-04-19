// services/icd11Service.js
require("dotenv").config();

let cachedToken = null;
let tokenExpiryTime = null;

// 1. Function to securely get the OAuth Token from WHO
const getIcdToken = async () => {
  // If we already have a valid token, reuse it to save time!
  if (cachedToken && tokenExpiryTime && Date.now() < tokenExpiryTime) {
    return cachedToken;
  }

  try {
    const params = new URLSearchParams();
    params.append('client_id', process.env.ICD_CLIENT_ID);
    params.append('client_secret', process.env.ICD_CLIENT_SECRET);
    params.append('grant_type', 'client_credentials');
    params.append('scope', 'icdapi_access');

    const response = await fetch('https://icdaccessmanagement.who.int/connect/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const data = await response.json();

    if (data.access_token) {
      cachedToken = data.access_token;
      // Tokens usually expire in 3600 seconds (1 hour). We cache it for 55 minutes to be safe.
      tokenExpiryTime = Date.now() + (data.expires_in - 300) * 1000; 
      return cachedToken;
    } else {
      throw new Error("Failed to get ICD token");
    }
  } catch (error) {
    console.error("WHO API Auth Error:", error.message);
    return null;
  }
};

// 2. Function to verify if the code actually exists in the WHO Database
exports.verifyIcdCode = async (icdCode) => {
  if (!icdCode || icdCode === 'Not Linked' || icdCode === 'undefined') return false;

  const token = await getIcdToken();
  if (!token) return false;

  try {
    // Search the official Morbidity and Mortality (MMS) linearization
    const response = await fetch(`https://id.who.int/icd/release/11/2024-01/mms/search?q=${encodeURIComponent(icdCode)}`, {
      method: 'POST', // WHO Search API expects POST
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Accept-Language': 'en',
        'API-Version': 'v2'
      }
    });

    const data = await response.json();

    // Check if the API returned any results, and if the exact code matches
    if (data.destinationEntities && data.destinationEntities.length > 0) {
      // Loop through results to ensure the AI didn't just guess a word, but an actual CODE
      const exactMatch = data.destinationEntities.find(entity => entity.theCode === icdCode);
      
      if (exactMatch) {
        console.log(`✅ [WHO API] Verified: ${icdCode} is a valid official code!`);
        return { isValid: true, officialTitle: exactMatch.title };
      }
    }

    console.log(`❌ [WHO API] Invalid Code: ${icdCode} does not exist in WHO registry.`);
    return { isValid: false };

  } catch (error) {
    console.error("WHO API Verification Error:", error.message);
    // If the WHO API crashes, we default to false to be safe
    return { isValid: false };
  }
};