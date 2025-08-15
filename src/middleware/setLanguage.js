const { SUPPORTED_LANGUAGES } = require('../utils/translate');

/**
 * Middleware to set the preferred language from request
 * Checks query parameter ?lang=hi or header x-language: bn
 * Sets req.language for use in route handlers
 */
function setLanguage(req, res, next) {
  try {
    // Default language
    let language = 'en';
    
    // Check query parameter first (higher priority)
    if (req.query.lang) {
      const queryLang = req.query.lang.toLowerCase();
      if (SUPPORTED_LANGUAGES[queryLang] || Object.values(SUPPORTED_LANGUAGES).includes(queryLang)) {
        language = SUPPORTED_LANGUAGES[queryLang] || queryLang;
      }
    }
    // Check header if no query parameter
    else if (req.headers['x-language']) {
      const headerLang = req.headers['x-language'].toLowerCase();
      if (SUPPORTED_LANGUAGES[headerLang] || Object.values(SUPPORTED_LANGUAGES).includes(headerLang)) {
        language = SUPPORTED_LANGUAGES[headerLang] || headerLang;
      }
    }
    // Check Accept-Language header as fallback
    else if (req.headers['accept-language']) {
      const acceptLang = req.headers['accept-language'].split(',')[0].split('-')[0].toLowerCase();
      if (SUPPORTED_LANGUAGES[acceptLang] || Object.values(SUPPORTED_LANGUAGES).includes(acceptLang)) {
        language = SUPPORTED_LANGUAGES[acceptLang] || acceptLang;
      }
    }
    
    // Set the language in request object
    req.language = language;
    req.isTranslationNeeded = language !== 'en';
    
    // Add language info to response headers for debugging
    res.setHeader('X-Response-Language', language);
    
    next();
  } catch (error) {
    console.error('Language middleware error:', error);
    // Set default language and continue
    req.language = 'en';
    req.isTranslationNeeded = false;
    next();
  }
}

/**
 * Helper function to get language from Next.js API request
 * For use in Next.js API routes where middleware isn't available
 */
function getLanguageFromRequest(req) {
  try {
    // Check query parameter first
    if (req.query.lang) {
      const queryLang = req.query.lang.toLowerCase();
      if (SUPPORTED_LANGUAGES[queryLang] || Object.values(SUPPORTED_LANGUAGES).includes(queryLang)) {
        return SUPPORTED_LANGUAGES[queryLang] || queryLang;
      }
    }
    
    // Check header
    if (req.headers['x-language']) {
      const headerLang = req.headers['x-language'].toLowerCase();
      if (SUPPORTED_LANGUAGES[headerLang] || Object.values(SUPPORTED_LANGUAGES).includes(headerLang)) {
        return SUPPORTED_LANGUAGES[headerLang] || headerLang;
      }
    }
    
    // Check Accept-Language header
    if (req.headers['accept-language']) {
      const acceptLang = req.headers['accept-language'].split(',')[0].split('-')[0].toLowerCase();
      if (SUPPORTED_LANGUAGES[acceptLang] || Object.values(SUPPORTED_LANGUAGES).includes(acceptLang)) {
        return SUPPORTED_LANGUAGES[acceptLang] || acceptLang;
      }
    }
    
    return 'en'; // Default to English
  } catch (error) {
    console.error('Error getting language from request:', error);
    return 'en';
  }
}

module.exports = {
  setLanguage,
  getLanguageFromRequest
};