import logger from '../utils/logger.js'

/**
 * Middleware de gestion d'erreurs global
 */
export const errorHandler = (err, req, res, next) => {
  // Log de l'erreur
  logger.error('Erreur non gérée:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
    params: req.params,
    query: req.query
  })

  // Déterminer le code de statut
  let statusCode = 500
  let message = 'Erreur interne du serveur'
  let code = 'INTERNAL_ERROR'

  if (err.statusCode) {
    statusCode = err.statusCode
  }

  if (err.code) {
    code = err.code
  }

  // Messages d'erreur selon le type
  switch (err.name) {
    case 'ValidationError':
      statusCode = 400
      message = 'Données invalides'
      code = 'VALIDATION_ERROR'
      break
    
    case 'UnauthorizedError':
      statusCode = 401
      message = 'Non autorisé'
      code = 'UNAUTHORIZED'
      break
    
    case 'NotFoundError':
      statusCode = 404
      message = 'Ressource non trouvée'
      code = 'NOT_FOUND'
      break
    
    case 'ConflictError':
      statusCode = 409
      message = 'Conflit de données'
      code = 'CONFLICT'
      break
    
    case 'RateLimitError':
      statusCode = 429
      message = 'Trop de requêtes'
      code = 'RATE_LIMIT_EXCEEDED'
      break
    
    default:
      // Garder le message original si c'est une erreur métier explicite
      if (err.message && err.message !== 'Internal Server Error') {
        message = err.message
      }
  }

  // En développement, inclure plus de détails
  const errorResponse = {
    success: false,
    error: message,
    code,
    timestamp: new Date().toISOString()
  }

  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = {
      stack: err.stack,
      originalMessage: err.message
    }
  }

  res.status(statusCode).json(errorResponse)
}