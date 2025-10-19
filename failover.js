/**
 * The Oven Vibe - Failover System
 * Automatically redirects to Netlify if available, falls back to GitHub Pages
 * 
 * Features:
 * - Non-blocking failover check
 * - Prevents infinite redirect loops
 * - Cross-browser compatible
 * - Minimal performance impact
 * - Graceful error handling
 */

(function() {
  'use strict';
  
  // Configuration
  const CONFIG = {
    primaryUrl: 'https://theovenvibe.netlify.app',
    fallbackUrl: window.location.origin,
    timeout: 3000, // 3 seconds timeout
    maxRetries: 1,
    checkInterval: 1000, // Check every 1 second
    redirectDelay: 100 // Small delay to prevent flash
  };
  
  // State management
  let hasRedirected = false;
  let isChecking = false;
  let retryCount = 0;
  
  // Check if we're already on the primary domain to prevent loops
  if (window.location.hostname === 'theovenvibe.netlify.app') {
    console.log('✅ Already on primary domain (Netlify), skipping failover check');
    return;
  }
  
  // Check if we're on GitHub Pages
  if (!window.location.hostname.includes('github.io')) {
    console.log('ℹ️ Not on GitHub Pages, skipping failover check');
    return;
  }
  
  /**
   * Check if Netlify is reachable
   * @returns {Promise<boolean>} True if reachable, false otherwise
   */
  async function checkNetlifyAvailability() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);
      
      const response = await fetch(CONFIG.primaryUrl, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // For no-cors requests, we can't check status, but if no error is thrown, it's likely available
      console.log('✅ Netlify is reachable');
      return true;
      
    } catch (error) {
      console.warn('⚠️ Netlify check failed:', error.message);
      return false;
    }
  }
  
  /**
   * Perform the redirect to Netlify
   */
  function redirectToNetlify() {
    if (hasRedirected) return;
    
    hasRedirected = true;
    const targetUrl = CONFIG.primaryUrl + window.location.pathname + window.location.search + window.location.hash;
    
    console.log('🔄 Redirecting to Netlify:', targetUrl);
    
    // Small delay to prevent flash
    setTimeout(() => {
      try {
        window.location.replace(targetUrl);
      } catch (error) {
        console.error('❌ Redirect failed:', error);
        showFallbackMessage();
      }
    }, CONFIG.redirectDelay);
  }
  
  /**
   * Show fallback message if redirect fails
   */
  function showFallbackMessage() {
    const fallbackBanner = document.createElement('div');
    fallbackBanner.id = 'failover-banner';
    fallbackBanner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #ad210a;
      color: white;
      padding: 8px 16px;
      text-align: center;
      font-size: 14px;
      z-index: 10000;
      font-family: Inter, system-ui, -apple-system, sans-serif;
    `;
    fallbackBanner.innerHTML = '🍕 You\'re on our backup site. <a href="https://theovenvibe.netlify.app" style="color: #fff; text-decoration: underline;">Try our main site</a>';
    
    document.body.insertBefore(fallbackBanner, document.body.firstChild);
    
    // Adjust body padding to account for banner
    document.body.style.paddingTop = '40px';
  }
  
  /**
   * Main failover check function
   */
  async function performFailoverCheck() {
    if (isChecking || hasRedirected) return;
    
    isChecking = true;
    console.log('🔍 Checking Netlify availability...');
    
    const isAvailable = await checkNetlifyAvailability();
    
    if (isAvailable) {
      redirectToNetlify();
    } else {
      console.log('📱 Staying on GitHub Pages (fallback)');
      
      // Show fallback message after a short delay
      setTimeout(() => {
        showFallbackMessage();
      }, 500);
    }
    
    isChecking = false;
  }
  
  /**
   * Retry mechanism with exponential backoff
   */
  function retryCheck() {
    if (retryCount >= CONFIG.maxRetries || hasRedirected) return;
    
    retryCount++;
    console.log(`🔄 Retry attempt ${retryCount}/${CONFIG.maxRetries}`);
    
    setTimeout(() => {
      performFailoverCheck();
    }, CONFIG.checkInterval * retryCount);
  }
  
  /**
   * Initialize the failover system
   */
  function init() {
    // Prevent multiple initializations
    if (window.failoverInitialized) return;
    window.failoverInitialized = true;
    
    console.log('🚀 Initializing failover system...');
    
    // Run immediately
    performFailoverCheck();
    
    // Set up retry mechanism
    if (CONFIG.maxRetries > 0) {
      retryCheck();
    }
  }
  
  // Start the failover check as soon as possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Also run on window load as a fallback
  window.addEventListener('load', () => {
    if (!hasRedirected && !isChecking) {
      console.log('🔄 Window load fallback check');
      performFailoverCheck();
    }
  });
  
})();
