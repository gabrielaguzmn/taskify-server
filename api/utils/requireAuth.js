// api/utils/requireAuth.js
const jwt = require("jsonwebtoken");

/**
 * Extrae token del header Authorization (Bearer) o de la cookie authToken.
 */
function getTokenFromReq(req) {
  // Header: Authorization: Bearer <token>
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) {
    return auth.slice(7).trim();
  }
  // Cookie: authToken
  if (req.cookies && req.cookies.authToken) {
    return req.cookies.authToken;
  }
  return null;
}

/**
 * Crea un middleware de autenticación.
 * - Por defecto es "estricto": si no hay token → 401.
 * - Con requireAuth.optional() no falla si no hay token; solo setea req.user si existe.
 *
 * Uso:
 *  const { requireAuth } = require("../utils/requireAuth");
 *  router.get("/privado", requireAuth, handler);
 *  router.get("/mixto", requireAuth.optional(), handler);
 */
function makeRequireAuth({ optional = false } = {}) {
  return function requireAuth(req, res, next) {
    try {
      const token = getTokenFromReq(req);

      if (!token) {
        if (optional) return next();
        return res.status(401).json({ message: "No autenticado" });
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.error("[requireAuth] Falta JWT_SECRET en el .env");
        return res.status(500).json({ message: "Misconfigured server" });
      }

      const decoded = jwt.verify(token, secret);
      // Puedes validar claims extra aquí (roles, issuer, audience, etc.)
      // if (decoded.role !== "admin") return res.status(403).json({ message: "Forbidden" });

      // Normaliza el usuario que se adjunta al request
      req.user = {
        id: decoded.id || decoded._id,
        email: decoded.email,
        // role: decoded.role, // si algún día lo usas
      };

      // Opcional: accesible en vistas o logs
      res.locals.user = req.user;

      return next();
    } catch (err) {
      // Token expirado o inválido
      // err.name puede ser "TokenExpiredError" o "JsonWebTokenError"
      return res.status(401).json({ message: "Token inválido o expirado" });
    }
  };
}

// Versión estricta por defecto
const requireAuth = makeRequireAuth();
// Versión opcional (no falla si no hay token)
requireAuth.optional = () => makeRequireAuth({ optional: true });

module.exports = { requireAuth };
