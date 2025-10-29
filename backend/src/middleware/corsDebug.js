// CORS Debug Middleware
// This middleware helps debug CORS issues in development

const corsDebugMiddleware = (req, res, next) => {
  // Only log in development or when DEBUG_CORS is set
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_CORS === 'true') {
    console.log('🌐 CORS Debug Info:');
    console.log(`   Origin: ${req.headers.origin || 'No origin header'}`);
    console.log(`   Method: ${req.method}`);
    console.log(`   Path: ${req.path}`);
    console.log(`   User-Agent: ${req.headers['user-agent'] || 'No user-agent'}`);
    console.log(`   Referer: ${req.headers.referer || 'No referer'}`);
    
    // Log CORS headers being sent
    const corsHeaders = {};
    Object.keys(res.getHeaders()).forEach(header => {
      if (header.toLowerCase().startsWith('access-control-')) {
        corsHeaders[header] = res.getHeader(header);
      }
    });
    
    if (Object.keys(corsHeaders).length > 0) {
      console.log('   CORS Headers:', corsHeaders);
    }
    
    console.log('---');
  }
  
  next();
};

module.exports = corsDebugMiddleware;