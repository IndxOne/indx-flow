import logger from '../utils/logger.js'

/**
 * Middleware de logging des requêtes
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now()
  
  // Capturer les données de la requête
  const requestInfo = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  }

  // Hook sur la fin de la réponse
  const originalSend = res.send
  res.send = function(data) {
    const duration = Date.now() - start
    
    // Log de la réponse
    const responseInfo = {
      ...requestInfo,
      status: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length') || 0
    }

    // Déterminer le niveau de log
    let logLevel = 'info'
    if (res.statusCode >= 500) {
      logLevel = 'error'
    } else if (res.statusCode >= 400) {
      logLevel = 'warn'
    }

    // Message de log
    const message = `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`

    logger.log(logLevel, message, responseInfo)

    // Appeler la méthode originale
    originalSend.call(this, data)
  }

  next()
}