import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./AdminLogin.css";

const ADMIN_USER = "e7d9f30c08ff75b134bd6f6d54a22d25e6ceb5ddaa2f1a42721f279665d4c34a"; // "cafecarthage"
const ADMIN_HASH = "6a13f0c7a3ba956bab2bcd38138002f12cd0e5b94a19e3467c1e41b884425765"; // "123456"

async function sha256(text: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const hashed1 = await sha256(username.trim());
      const hashed2 = await sha256(password);

      if (hashed1 === ADMIN_USER && hashed2 === ADMIN_HASH) {
        localStorage.setItem("username", username.trim());
        localStorage.setItem("password", password);
        navigate("/admin");
      } else {
        setError("Identifiants incorrects. Veuillez réessayer.");
      }
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <Link to="/" className="login-back-home">
        ← Retour au menu
      </Link>

      <motion.div 
        className="login-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="login-header">
          <img src="/images/logo.png" alt="Carthage Logo" className="login-logo" />
          <h2>Espace Admin</h2>
          <p className="login-subtitle">Connectez-vous pour gérer le menu</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="login-input-group">
            <span className="input-icon">👤</span>
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="login-input-group">
            <span className="input-icon">🔐</span>
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && <motion.div className="login-error-msg" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>{error}</motion.div>}

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="login-hints">
          <p>💡 <strong>Démo Accès :</strong></p>
          <p>Utilisateur : <code>cafecarthage</code></p>
          <p>Mot de passe : <code>123456</code></p>
        </div>
      </motion.div>
    </div>
  );
}
