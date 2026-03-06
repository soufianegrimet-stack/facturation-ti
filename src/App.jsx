import { useState, useEffect } from "react";

// ─── UTILISATEURS ─────────────────────────────────────────────────────────────
const USERS = [
  { id: "soufiane", nom: "Soufiane Grimet", role: "Gérant", password: "MTS2024", color: "#3b82f6", initiales: "SG" },
  { id: "ikram",    nom: "Ikram Lakhdar",   role: "Responsable Facturation", password: "IKRAM2024", color: "#8b5cf6", initiales: "IL" },
];

function LoginScreen({ onLogin }) {
  const [selected, setSelected] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError]       = useState(false);
  const [shake, setShake]       = useState(false);

  const handleSubmit = () => {
    if (!selected) return;
    if (password === selected.password) {
      sessionStorage.setItem("mts_auth", "1");
      sessionStorage.setItem("mts_user", JSON.stringify(selected));
      onLogin(selected);
    } else {
      setError(true); setShake(true); setPassword("");
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif"
    }}>
      <div style={{
        background: "white", borderRadius: 16, padding: "48px 40px", width: 380,
        boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
        animation: shake ? "shake 0.4s ease" : "none"
      }}>
        <style>{`
          @keyframes shake {
            0%,100%{transform:translateX(0)}
            20%{transform:translateX(-10px)}
            40%{transform:translateX(10px)}
            60%{transform:translateX(-8px)}
            80%{transform:translateX(8px)}
          }
        `}</style>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width:64, height:64, background:"#0f172a", borderRadius:12, display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}>
            <span style={{ color:"white", fontWeight:900, fontSize:20, letterSpacing:1 }}>MTS</span>
          </div>
          <div style={{ fontSize:18, fontWeight:700, color:"#0f172a" }}>MAGHREB TRANS SOLUTIONS</div>
          <div style={{ fontSize:13, color:"#64748b", marginTop:4 }}>Système de Facturation</div>
        </div>

        {/* Choix utilisateur */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:13, fontWeight:600, color:"#374151", marginBottom:10 }}>👤 Qui êtes-vous ?</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {USERS.map(u => (
              <div key={u.id} onClick={() => { setSelected(u); setError(false); setPassword(""); }}
                style={{
                  padding:"14px 16px", borderRadius:10, cursor:"pointer", display:"flex", alignItems:"center", gap:12,
                  border: selected?.id === u.id ? `2px solid ${u.color}` : "2px solid #e2e8f0",
                  background: selected?.id === u.id ? `${u.color}10` : "#f8fafc",
                  transition:"all 0.15s"
                }}>
                <div style={{ width:40, height:40, borderRadius:10, background:u.color, color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:14, flexShrink:0 }}>
                  {u.initiales}
                </div>
                <div>
                  <div style={{ fontWeight:700, color:"#0f172a", fontSize:14 }}>{u.nom}</div>
                  <div style={{ fontSize:12, color:"#64748b" }}>{u.role}</div>
                </div>
                {selected?.id === u.id && <span style={{ marginLeft:"auto", color:u.color, fontSize:18 }}>✓</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Mot de passe */}
        {selected && (
          <div style={{ marginBottom:8 }}>
            <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:8 }}>
              🔒 Mot de passe
            </label>
            <input
              type="password" value={password} autoFocus
              onChange={e => { setPassword(e.target.value); setError(false); }}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="Entrez votre mot de passe..."
              style={{
                width:"100%", padding:"12px 16px", fontSize:15, borderRadius:8, boxSizing:"border-box",
                border: error ? "2px solid #ef4444" : `2px solid ${selected.color}`,
                outline:"none", background: error ? "#fef2f2" : "white"
              }}
            />
            {error && <div style={{ color:"#ef4444", fontSize:13, marginTop:6, fontWeight:500 }}>❌ Mot de passe incorrect.</div>}
          </div>
        )}

        <button onClick={handleSubmit} disabled={!selected}
          style={{
            width:"100%", padding:"13px", background: selected ? selected.color : "#94a3b8",
            color:"white", border:"none", borderRadius:8, fontSize:15, fontWeight:700,
            cursor: selected ? "pointer" : "not-allowed", marginTop:16, letterSpacing:0.5
          }}>
          {selected ? `Connexion — ${selected.nom}` : "Sélectionnez un utilisateur"} →
        </button>

        <div style={{ textAlign:"center", marginTop:16, fontSize:11, color:"#94a3b8" }}>Accès réservé aux équipes MTS</div>
      </div>
    </div>
  );
}

// ─── PERSISTENCE ──────────────────────────────────────────────────────────────
const DATA_VERSION = "v2026-01"; // Change this to force reset

function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const versionKey = key + "_version";
      const savedVersion = localStorage.getItem(versionKey);
      // If version changed, reset to fresh data
      if (savedVersion !== DATA_VERSION) {
        localStorage.setItem(versionKey, DATA_VERSION);
        localStorage.removeItem(key);
        return initial;
      }
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initial;
    } catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
  }, [key, state]);
  return [state, setState];
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];
const formatDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";
const DEVISES = { MAD: { symbol: "MAD", locale: "fr-MA" }, EUR: { symbol: "€", locale: "fr-FR" }, USD: { symbol: "$", locale: "en-US" } };
const formatMoney = (n, devise = "MAD") => {
  const d = DEVISES[devise] || DEVISES.MAD;
  return new Intl.NumberFormat(d.locale, { style: "currency", currency: devise }).format(n || 0);
};

const LOGO_B64 = "data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAFZBaADASIAAhEBAxEB/8QAHQABAAAHAQEAAAAAAAAAAAAAAAECAwUGBwgECf/EAGYQAAEDAwICBQcECQwMCwgDAQEAAgMEBQYHERIhCBMxQVEUImFxgZGhMkJS0QkVFiNicpKxwTNDRFNUVYKTorKz0hcYNEVjc3WDlKPC4SQ1NjdGVmV0hJXwJSY4ZIW00+JXw/Gk/8QAHAEBAAEFAQEAAAAAAAAAAAAAAAECAwQFBgcI/8QAQBEAAgECAgYFCgUDAwUBAAAAAAECAwQFEQYSITFRkRNBYaHRFCIyUlNxgbHB4RVCQ2LwByMzFpLxJDRjcqKC/9oADAMBAAIRAxEAPwDspERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAeK93a22S2y3K7V0FFRxDd80zw1o9qxRurmmhAIzSzj1z7LW3TUuboMXsVrY/+6a18r279oYzl8XLlYkk9q1l1fyo1NRI7PBdGKV/aKvUm1m3uy6th3mNWtNj/wBNLN/pAUw1X04PZmdm/wBIC4Lbv4qswHxWK8Wmvyo260JtX+pLu8Du8aq6cn/plZv9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QBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQH/9k=";

const STATUS = {
  draft:   { label: "Brouillon", color: "#94a3b8", bg: "#f1f5f9" },
  sent:    { label: "Envoyée",   color: "#3b82f6", bg: "#eff6ff" },
  paid:    { label: "Payée",     color: "#22c55e", bg: "#f0fdf4" },
  overdue: { label: "En retard", color: "#ef4444", bg: "#fef2f2" },
};

const INIT_CLIENTS = [{"id": "C001", "nom": "IBERFASHION", "email": "", "tel": "", "ville": "Tanger", "rc": ""}, {"id": "C002", "nom": "CHAIMAE CARGO", "email": "", "tel": "", "ville": "Tanger", "rc": ""}, {"id": "C003", "nom": "Meyer & Meyer Mediam S.A.R.L.", "email": "", "tel": "", "ville": "Tanger", "rc": ""}, {"id": "C004", "nom": "HITEK LOGISTIC MOROCCO ZDC", "email": "", "tel": "", "ville": "Tanger", "rc": ""}, {"id": "C005", "nom": "HANADIL", "email": "", "tel": "", "ville": "Tanger", "rc": ""}, {"id": "C006", "nom": "CRC PRODUCTION SARL", "email": "", "tel": "", "ville": "Tanger", "rc": ""}, {"id": "C007", "nom": "CONFECTION SALSABILE", "email": "", "tel": "", "ville": "Tanger", "rc": ""}, {"id": "C008", "nom": "N LINE LOGISTIQUE", "email": "", "tel": "", "ville": "Tanger", "rc": ""}, {"id": "C009", "nom": "BABYSHIRT", "email": "", "tel": "", "ville": "Tanger", "rc": ""}, {"id": "C010", "nom": "GLIMMER", "email": "", "tel": "", "ville": "Tanger", "rc": ""}, {"id": "C011", "nom": "VALERIUS MOROCCO", "email": "", "tel": "", "ville": "Tanger", "rc": ""}, {"id": "C012", "nom": "HCL TRANS", "email": "", "tel": "", "ville": "Tanger", "rc": ""}, {"id": "C013", "nom": "OKAT", "email": "", "tel": "", "ville": "Tanger", "rc": ""}];

const INIT_INVOICES = [{"id": "FAC-2026-0001", "clientId": "C001", "date": "2026-01-01", "echeance": "2026-01-31", "status": "sent", "lignes": [{"desc": "MANAGING TRAILERS IN ALGECIRAS", "qte": 1, "pu": 700.0}, {"desc": "Arrêtée la présente facture à la somme de : SEPT CENT EURO", "qte": 1, "pu": 0}], "notes": "", "tva": false, "devise": "EUR"}, {"id": "FAC-2026-0002", "clientId": "C002", "date": "2026-01-05", "echeance": "2026-02-04", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0003", "clientId": "C003", "date": "2026-01-08", "echeance": "2026-02-22", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0004", "clientId": "C001", "date": "2026-01-09", "echeance": "2026-02-08", "status": "sent", "lignes": [{"desc": "TRANSPORT CUNHA -CASA-TEMARA", "qte": 1, "pu": 1515.0}, {"desc": "TRANSPORT TINTOJAL-TEMARA", "qte": 1, "pu": 1500.0}, {"desc": "TRANSPORT CUNHA- TEMARA", "qte": 1, "pu": 1500.0}, {"desc": "TRANSPORT CUNHA- TEMARA", "qte": 1, "pu": 1500.0}, {"desc": "TRANSPORT NOGUEIRA-SALE", "qte": 1, "pu": 1500.0}], "notes": "", "tva": false, "devise": "EUR"}, {"id": "FAC-2026-0005", "clientId": "C001", "date": "2026-01-09", "echeance": "2026-02-08", "status": "sent", "lignes": [{"desc": "BALEARIA", "qte": 1, "pu": 0}, {"desc": "PARKING", "qte": 1, "pu": 0}, {"desc": "CONTENTIEUX TRYPTIQUE", "qte": 1, "pu": 0}, {"desc": "INFRACTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}], "notes": "", "tva": false, "devise": "EUR"}, {"id": "FAC-2026-0006", "clientId": "C003", "date": "2026-01-12", "echeance": "2026-02-26", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0007", "clientId": "C001", "date": "2026-01-15", "echeance": "2026-03-16", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0008", "clientId": "C004", "date": "2026-01-15", "echeance": "2026-03-16", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0009", "clientId": "C002", "date": "2026-01-15", "echeance": "2026-02-14", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0010", "clientId": "C002", "date": "2026-01-15", "echeance": "2026-02-14", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0011", "clientId": "C002", "date": "2026-01-19", "echeance": "2026-02-18", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0012", "clientId": "C002", "date": "2026-01-19", "echeance": "2026-02-18", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0013", "clientId": "C003", "date": "2026-01-19", "echeance": "2026-03-05", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0014", "clientId": "C003", "date": "2026-01-23", "echeance": "2026-03-09", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0015", "clientId": "C002", "date": "2026-01-26", "echeance": "2026-02-25", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0016", "clientId": "C005", "date": "2026-01-27", "echeance": "2026-02-27", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 2294.25}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 91.77}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0017", "clientId": "C006", "date": "2026-01-27", "echeance": "2026-02-26", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 2244.48}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 89.7792}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0018", "clientId": "C007", "date": "2026-01-27", "echeance": "2026-02-27", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 262.01}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 10.4804}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0019", "clientId": "C005", "date": "2026-01-27", "echeance": "2026-02-27", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 2088.86}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 83.5544}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0020", "clientId": "C005", "date": "2026-01-27", "echeance": "2026-02-27", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 2376.36}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 95.0544}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0021", "clientId": "C005", "date": "2026-01-27", "echeance": "2026-02-27", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 2092.9}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 83.716}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0022", "clientId": "C005", "date": "2026-01-27", "echeance": "2026-02-27", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 2325.76}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 93.0304}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0023", "clientId": "C005", "date": "2026-01-27", "echeance": "2026-02-27", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 2294.25}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 91.77}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0024", "clientId": "C005", "date": "2026-01-27", "echeance": "2026-02-27", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 2294.25}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 91.77}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0025", "clientId": "C005", "date": "2026-01-27", "echeance": "2026-02-27", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 2294.25}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 91.77}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0026", "clientId": "C005", "date": "2026-01-27", "echeance": "2026-02-27", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 1308.66}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 52.3464}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0027", "clientId": "C005", "date": "2026-01-27", "echeance": "2026-02-27", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 2319.85}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 92.794}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0028", "clientId": "C005", "date": "2026-01-27", "echeance": "2026-02-27", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 2294.25}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 91.77}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0029", "clientId": "C003", "date": "2026-01-27", "echeance": "2026-03-13", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0030", "clientId": "C008", "date": "2026-01-29", "echeance": "2026-02-28", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0031", "clientId": "C005", "date": "2026-01-30", "echeance": "2026-02-28", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 1183.13}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 47.3252}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 100.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0032", "clientId": "C009", "date": "2026-01-30", "echeance": "2026-02-28", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 242.97}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 9.7188}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 100.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0033", "clientId": "C010", "date": "2026-01-30", "echeance": "2026-02-28", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 191.15}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 7.646}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 100.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0034", "clientId": "C011", "date": "2026-01-30", "echeance": "2026-02-28", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 196.53}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 7.8612}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 100.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0035", "clientId": "C005", "date": "2026-01-30", "echeance": "2026-02-28", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 2294.25}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 91.77}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0036", "clientId": "C005", "date": "2026-01-30", "echeance": "2026-02-28", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 1991.42}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 79.6568}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0037", "clientId": "C005", "date": "2026-01-30", "echeance": "2026-02-28", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 2294.25}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 91.77}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0038", "clientId": "C001", "date": "2026-01-30", "echeance": "2026-03-01", "status": "sent", "lignes": [{"desc": "TRANSPORT CUNHA-TINTOJAL-TEMARA-CASA x2", "qte": 1, "pu": 1530.0}, {"desc": "TRANSPORT FAFE-MEKNES", "qte": 1, "pu": 1500.0}, {"desc": "TRANSPORT FAFE-MEKNES", "qte": 1, "pu": 1500.0}, {"desc": "TRANSPORT FAFE-MEKNES", "qte": 1, "pu": 1500.0}, {"desc": "TRANSPORT TINTOJAL-TEMARA", "qte": 1, "pu": 1500.0}, {"desc": "TRANSPORT FAFE-MEKNES", "qte": 1, "pu": 1500.0}, {"desc": "TRANSPORT FAFE-MEKNES", "qte": 1, "pu": 1500.0}, {"desc": "TRANSPORT IBERFASHION-TEMARA-CASA", "qte": 1, "pu": 1515.0}, {"desc": "TRANSPORT IBERFASHION- CASA-SALE", "qte": 1, "pu": 1600.0}, {"desc": "TRANSPORT FAFE-MEKNES", "qte": 1, "pu": 1500.0}], "notes": "", "tva": false, "devise": "EUR"}, {"id": "FAC-2026-0039", "clientId": "C001", "date": "2026-01-30", "echeance": "2026-03-01", "status": "sent", "lignes": [{"desc": "BALEARIA", "qte": 1, "pu": 0}, {"desc": "PARKING", "qte": 1, "pu": 0}, {"desc": "CONTENTIEUX TRYPTIQUE", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "Arrêtée la présente facture à la somme de : TROIS MILLE NEUF CENT SIX EURO ET QUARANTE CENTIMES", "qte": 1, "pu": 0}], "notes": "", "tva": false, "devise": "EUR"}, {"id": "FAC-2026-0046", "clientId": "C001", "date": "2026-01-31", "echeance": "2026-03-02", "status": "sent", "lignes": [{"desc": "MANAGING TRAILERS IN ALGECIRAS", "qte": 1, "pu": 700.0}, {"desc": "Arrêtée la présente facture à la somme de : SEPT CENT EURO", "qte": 1, "pu": 0}], "notes": "", "tva": false, "devise": "EUR"}, {"id": "FAC-2026-0041", "clientId": "C005", "date": "2026-01-31", "echeance": "2026-02-28", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 2350.48}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 94.0192}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0042", "clientId": "C003", "date": "2026-01-31", "echeance": "2026-03-17", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0043", "clientId": "C003", "date": "2026-01-31", "echeance": "2026-03-17", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0044", "clientId": "C002", "date": "2026-01-31", "echeance": "2026-02-01", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0045", "clientId": "C002", "date": "2026-01-31", "echeance": "2026-02-02", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0046", "clientId": "C002", "date": "2026-02-06", "echeance": "2026-03-08", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0047", "clientId": "C003", "date": "2026-02-09", "echeance": "2026-03-26", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0048", "clientId": "C003", "date": "2026-02-10", "echeance": "2026-03-27", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0049", "clientId": "C003", "date": "2026-02-10", "echeance": "2026-03-27", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0050", "clientId": "C003", "date": "2026-02-10", "echeance": "2026-03-27", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0051", "clientId": "C001", "date": "2026-02-13", "echeance": "2026-04-14", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0052", "clientId": "C008", "date": "2026-02-13", "echeance": "2026-03-15", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0053", "clientId": "C003", "date": "2026-02-13", "echeance": "2026-03-30", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0054", "clientId": "C001", "date": "2026-02-16", "echeance": "2026-04-17", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0055", "clientId": "C003", "date": "2026-02-17", "echeance": "2026-04-03", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0056", "clientId": "C005", "date": "2026-02-18", "echeance": "2026-03-18", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 2307.12}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 92.2848}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0057", "clientId": "C005", "date": "2026-02-18", "echeance": "2026-03-18", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 2294.25}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 91.77}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0058", "clientId": "C005", "date": "2026-02-18", "echeance": "2026-03-18", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 2294.25}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 91.77}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0059", "clientId": "C003", "date": "2026-02-19", "echeance": "2026-04-05", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0060", "clientId": "C001", "date": "2026-02-20", "echeance": "2026-03-22", "status": "sent", "lignes": [{"desc": "Paiement en faveur de Administration des Douanes et Impôts Indirects", "qte": 1, "pu": 3045.975946}], "notes": "", "tva": false, "devise": "EUR"}, {"id": "FAC-2026-0061", "clientId": "C003", "date": "2026-02-23", "echeance": "2026-04-09", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0062", "clientId": "C012", "date": "2026-02-23", "echeance": "2026-03-25", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0063", "clientId": "C008", "date": "2026-02-13", "echeance": "2026-03-15", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0064", "clientId": "C002", "date": "2026-02-23", "echeance": "2026-03-25", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0065", "clientId": "C003", "date": "2026-02-24", "echeance": "2026-04-10", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0066", "clientId": "C001", "date": "2026-02-25", "echeance": "2026-04-26", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0067", "clientId": "C001", "date": "2026-02-26", "echeance": "2026-04-27", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0068", "clientId": "C003", "date": "2026-02-26", "echeance": "2026-04-12", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0069", "clientId": "C001", "date": "2026-02-28", "echeance": "2026-03-30", "status": "sent", "lignes": [{"desc": "MANAGING TRAILERS IN ALGECIRAS", "qte": 1, "pu": 700.0}, {"desc": "Arrêtée la présente facture à la somme de : SEPT CENT EURO", "qte": 1, "pu": 0}], "notes": "", "tva": false, "devise": "EUR"}, {"id": "FAC-2026-0070", "clientId": "C001", "date": "2026-02-28", "echeance": "2026-03-30", "status": "sent", "lignes": [{"desc": "BALEARIA", "qte": 1, "pu": 0}, {"desc": "PARKING", "qte": 1, "pu": 0}, {"desc": "INFRACTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}, {"desc": "INTERVENTION", "qte": 1, "pu": 0}], "notes": "", "tva": false, "devise": "EUR"}, {"id": "FAC-2026-0071", "clientId": "C001", "date": "2026-02-28", "echeance": "2026-03-30", "status": "sent", "lignes": [{"desc": "TRANSPORT FAFE-MEKNES", "qte": 1, "pu": 1500.0}, {"desc": "TRANSPORT FAFE-MEKNES", "qte": 1, "pu": 1500.0}, {"desc": "TRANSPORT CUNHA-TEMARA", "qte": 1, "pu": 1500.0}, {"desc": "TRANSPORT FAFE-MEKNES", "qte": 1, "pu": 1500.0}, {"desc": "TRANSPORT FAFE-MEKNES", "qte": 1, "pu": 1500.0}, {"desc": "TRANSPORT FAFE-MEKNES", "qte": 1, "pu": 1500.0}, {"desc": "TRANSPORT FAFE-MEKNES", "qte": 1, "pu": 1500.0}], "notes": "", "tva": false, "devise": "EUR"}, {"id": "FAC-2026-0072", "clientId": "C001", "date": "2026-02-28", "echeance": "2026-04-29", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0073", "clientId": "C003", "date": "2026-02-28", "echeance": "2026-04-14", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0074", "clientId": "C005", "date": "2026-02-28", "echeance": "2026-03-30", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 2294.25}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 91.77}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0075", "clientId": "C005", "date": "2026-02-28", "echeance": "2026-03-30", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 2265.52}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 90.6208}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0076", "clientId": "C006", "date": "2026-02-28", "echeance": "2026-03-30", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 1989.63}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 79.5852}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0077", "clientId": "C007", "date": "2026-02-28", "echeance": "2026-03-30", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 527.77}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 21.1108}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0078", "clientId": "C005", "date": "2026-02-28", "echeance": "2026-03-30", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 2294.25}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 91.77}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0079", "clientId": "C005", "date": "2026-02-28", "echeance": "2026-03-30", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 2310.81}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 92.4324}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0080", "clientId": "C005", "date": "2026-02-28", "echeance": "2026-03-30", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 2294.25}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 91.77}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0081", "clientId": "C005", "date": "2026-02-28", "echeance": "2026-03-30", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 2294.25}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 91.77}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0082", "clientId": "C006", "date": "2026-02-28", "echeance": "2026-03-30", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 1618.92}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 64.7568}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0083", "clientId": "C013", "date": "2026-02-28", "echeance": "2026-03-30", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 898.48}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 35.9392}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0084", "clientId": "C005", "date": "2026-02-28", "echeance": "2026-03-02", "status": "sent", "lignes": [{"desc": "TMSA", "qte": 1, "pu": 2294.25}, {"desc": "TAX REGIONAL", "qte": 1, "pu": 91.77}, {"desc": "FRAIS INTERVENTION", "qte": 1, "pu": 200.0}], "notes": "", "tva": true, "devise": "MAD"}, {"id": "FAC-2026-0085", "clientId": "C003", "date": "2026-02-28", "echeance": "2026-04-14", "status": "sent", "lignes": [{"desc": "Prestation de transport", "qte": 1, "pu": 0}], "notes": "", "tva": true, "devise": "MAD"}];

function calcHT(inv) { return inv.lignes.reduce((s, l) => s + (Number(l.qte)||0) * (Number(l.pu)||0), 0); }
function calcTotal(inv) { const ht = calcHT(inv); return inv.tva ? ht * 1.2 : ht; }

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function MainApp({ onLogout, currentUser }) {
  const [clients, setClients] = useLocalStorage("ti_clients", INIT_CLIENTS);
  const [invoices, setInvoices] = useLocalStorage("ti_invoices", INIT_INVOICES);
  const [view, setView] = useState("dashboard");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [notification, setNotification] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const nextInvoiceId = () => {
    const year = new Date().getFullYear();
    const nums = invoices.map(i => parseInt(i.id.split("-")[2]) || 0);
    const next = (Math.max(0, ...nums) + 1).toString().padStart(3, "0");
    return `FAC-${year}-${next}`;
  };

  function saveInvoice(inv) {
    const now = new Date().toISOString();
    const userInfo = currentUser ? { nom: currentUser.nom, initiales: currentUser.initiales, color: currentUser.color } : { nom: "Inconnu", initiales: "?", color: "#94a3b8" };
    if (invoices.find(i => i.id === inv.id)) {
      const updated = { ...inv, modifie: { par: userInfo, le: now } };
      setInvoices(invoices.map(i => i.id === inv.id ? updated : i));
      notify("Facture mise à jour ✓");
    } else {
      const created = { ...inv, cree: { par: userInfo, le: now } };
      setInvoices([created, ...invoices]);
      notify("Facture créée ✓");
    }
    setEditingInvoice(null);
    setView("factures");
  }

  function deleteInvoice(id) {
    if (!window.confirm("Supprimer cette facture ?")) return;
    setInvoices(invoices.filter(i => i.id !== id));
    setSelectedInvoice(null);
    setView("factures");
    notify("Facture supprimée", "error");
  }

  // ─── RELEVÉ CLIENT ──────────────────────────────────────────────────────────
  function handleReleve(client, clientInvoices, format) {
    const dateNow = new Date().toLocaleDateString("fr-FR");
    if (format === "excel") {
      exportReleveExcel(client, clientInvoices, dateNow);
    } else {
      exportRelevePDF(client, clientInvoices, dateNow);
    }
  }

  function exportReleveExcel(client, invs, dateNow) {
    const rows = [
      ["MAGHREB TRANS SOLUTIONS SARL"],
      ["29 Rue Amr Ibn Ass, 3ème Étg N°2, Tanger 90000, Maroc"],
      [""],
      [`RELEVÉ DE COMPTE — ${client.nom}`],
      [`Édité le : ${dateNow}`],
      [""],
      ["N° Facture", "Date", "Échéance", "Désignation", "HT", "TVA", "TTC", "Devise", "Statut"],
    ];
    invs.forEach(inv => {
      const ht = inv.lignes.reduce((s, l) => s + (Number(l.qte)||0) * (Number(l.pu)||0), 0);
      const tva = inv.tva ? ht * 0.2 : 0;
      const ttc = ht + tva;
      const desc = inv.lignes.map(l => l.desc).filter(Boolean).join(" / ").slice(0, 60);
      rows.push([inv.id, inv.date, inv.echeance || "", desc, ht.toFixed(2), tva.toFixed(2), ttc.toFixed(2), inv.devise || "MAD", STATUS[inv.status]?.label || inv.status]);
    });
    const totalHT = invs.reduce((s,i) => s + i.lignes.reduce((a,l) => a + (Number(l.qte)||0)*(Number(l.pu)||0), 0), 0);
    const totalTTC = invs.reduce((s,i) => { const ht = i.lignes.reduce((a,l) => a + (Number(l.qte)||0)*(Number(l.pu)||0), 0); return s + (i.tva ? ht*1.2 : ht); }, 0);
    rows.push(["", "", "", "TOTAL", totalHT.toFixed(2), "", totalTTC.toFixed(2), "", ""]);

    // Convert to CSV with BOM for Excel
    const csv = "﻿" + rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(";")).join("
");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `Releve_${client.nom.replace(/\s+/g,"_")}_${dateNow.replace(/\//g,"-")}.csv`;
    a.click(); URL.revokeObjectURL(url);
    notify("Relevé Excel téléchargé ✓");
  }

  function exportRelevePDF(client, invs, dateNow) {
    const totalHT = invs.reduce((s,i) => s + i.lignes.reduce((a,l) => a + (Number(l.qte)||0)*(Number(l.pu)||0), 0), 0);
    const totalTTC = invs.reduce((s,i) => { const ht = i.lignes.reduce((a,l) => a + (Number(l.qte)||0)*(Number(l.pu)||0), 0); return s + (i.tva ? ht*1.2 : ht); }, 0);
    const paid = invs.filter(i=>i.status==="paid").reduce((s,i) => { const ht = i.lignes.reduce((a,l)=>a+(Number(l.qte)||0)*(Number(l.pu)||0),0); return s+(i.tva?ht*1.2:ht); }, 0);
    const rows = invs.map(inv => {
      const ht = inv.lignes.reduce((s,l) => s + (Number(l.qte)||0)*(Number(l.pu)||0), 0);
      const ttc = inv.tva ? ht * 1.2 : ht;
      const st = STATUS[inv.status];
      const desc = inv.lignes.map(l=>l.desc).filter(Boolean).join(", ").slice(0,45);
      return `<tr style="border-bottom:1px solid #e2e8f0">
        <td style="padding:8px 10px;font-size:12px;color:#0f172a;font-weight:600">${inv.id}</td>
        <td style="padding:8px 10px;font-size:12px;color:#475569">${inv.date ? new Date(inv.date).toLocaleDateString("fr-FR") : ""}</td>
        <td style="padding:8px 10px;font-size:12px;color:#475569">${inv.echeance ? new Date(inv.echeance).toLocaleDateString("fr-FR") : "—"}</td>
        <td style="padding:8px 10px;font-size:11px;color:#64748b;max-width:180px">${desc}</td>
        <td style="padding:8px 10px;font-size:12px;text-align:right;font-weight:700">${ttc.toFixed(2)} ${inv.devise||"MAD"}</td>
        <td style="padding:8px 10px;text-align:center"><span style="background:${st?.bg};color:${st?.color};padding:3px 8px;border-radius:4px;font-size:11px;font-weight:700">${st?.label||inv.status}</span></td>
      </tr>`;
    }).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Relevé — ${client.nom}</title>
    <style>
      @page { size: A4; margin: 12mm; }
      body { font-family: 'Segoe UI', sans-serif; color: #0f172a; margin:0; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    </style></head><body>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #0f172a">
      <div>
        <div style="font-size:22px;font-weight:900;color:#0f172a;letter-spacing:2px">MAGHREB TRANS SOLUTIONS</div>
        <div style="font-size:11px;color:#64748b;margin-top:4px">29 Rue Amr Ibn Ass, 3ème Étg N°2 — Tanger 90000, Maroc</div>
        <div style="font-size:11px;color:#64748b">+212 669 60 86 53 · facturation@maghrebtranssolutions.com</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:26px;font-weight:900;color:#3b82f6;letter-spacing:3px">RELEVÉ</div>
        <div style="font-size:12px;color:#64748b">Édité le ${dateNow}</div>
      </div>
    </div>

    <div style="background:#f0f7ff;border-left:4px solid #3b82f6;border-radius:8px;padding:14px 18px;margin-bottom:20px">
      <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1px">Client</div>
      <div style="font-size:18px;font-weight:800;color:#0f172a">${client.nom}</div>
      ${client.email ? `<div style="font-size:12px;color:#475569">${client.email}</div>` : ""}
      ${client.tel ? `<div style="font-size:12px;color:#475569">${client.tel}</div>` : ""}
      ${client.rc ? `<div style="font-size:12px;color:#475569">RC : ${client.rc}</div>` : ""}
    </div>

    <div style="display:flex;gap:12px;margin-bottom:20px">
      <div style="flex:1;background:#f8fafc;border-radius:8px;padding:12px 16px;text-align:center">
        <div style="font-size:22px;font-weight:900;color:#3b82f6">${invs.length}</div>
        <div style="font-size:11px;color:#64748b">Factures</div>
      </div>
      <div style="flex:1;background:#f8fafc;border-radius:8px;padding:12px 16px;text-align:center">
        <div style="font-size:18px;font-weight:900;color:#0f172a">${totalTTC.toFixed(2)}</div>
        <div style="font-size:11px;color:#64748b">Total TTC</div>
      </div>
      <div style="flex:1;background:#f0fdf4;border-radius:8px;padding:12px 16px;text-align:center">
        <div style="font-size:18px;font-weight:900;color:#22c55e">${paid.toFixed(2)}</div>
        <div style="font-size:11px;color:#64748b">Encaissé</div>
      </div>
      <div style="flex:1;background:#fef2f2;border-radius:8px;padding:12px 16px;text-align:center">
        <div style="font-size:18px;font-weight:900;color:#ef4444">${(totalTTC - paid).toFixed(2)}</div>
        <div style="font-size:11px;color:#64748b">Restant dû</div>
      </div>
    </div>

    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr style="background:#0f172a;color:white">
          <th style="padding:10px;text-align:left;font-size:11px;letter-spacing:1px">N° FACTURE</th>
          <th style="padding:10px;text-align:left;font-size:11px;letter-spacing:1px">DATE</th>
          <th style="padding:10px;text-align:left;font-size:11px;letter-spacing:1px">ÉCHÉANCE</th>
          <th style="padding:10px;text-align:left;font-size:11px;letter-spacing:1px">DÉSIGNATION</th>
          <th style="padding:10px;text-align:right;font-size:11px;letter-spacing:1px">MONTANT</th>
          <th style="padding:10px;text-align:center;font-size:11px;letter-spacing:1px">STATUT</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr style="background:#0f172a;color:white">
          <td colspan="4" style="padding:10px;font-weight:700;font-size:13px">TOTAL GÉNÉRAL</td>
          <td style="padding:10px;text-align:right;font-weight:900;font-size:14px">${totalTTC.toFixed(2)}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>

    <div style="margin-top:20px;display:flex;justify-content:space-between;padding-top:12px;border-top:2px solid #0f172a;font-size:10px;color:#94a3b8">
      <span>MAGHREB TRANS SOLUTIONS SARL · RC 130319 · IF: 12345678 · ICE: 003133212000080</span>
      <span>Tanger, Maroc</span>
    </div>
    <script>window.onload=()=>{window.print();}</script>
    </body></html>`;

    const w = window.open("", "_blank", "width=900,height=1200");
    w.document.write(html);
    w.document.close();
    notify("Relevé PDF généré ✓");
  }

  function saveClient(cl) {
    if (clients.find(c => c.id === cl.id)) {
      setClients(clients.map(c => c.id === cl.id ? cl : c));
      notify("Client mis à jour ✓");
    } else {
      setClients([cl, ...clients]);
      notify("Client ajouté ✓");
    }
    setEditingClient(null);
  }

  function deleteClient(id) {
    if (!window.confirm("Supprimer ce client ?")) return;
    setClients(clients.filter(c => c.id !== id));
    setSelectedClient(null);
    setView("clients");
    notify("Client supprimé", "error");
  }

  const goTo = (v) => { setView(v); setSelectedInvoice(null); setSelectedClient(null); setEditingInvoice(null); setEditingClient(null); };

  const nav = [
    { id: "dashboard", icon: "◈", label: "Tableau de bord" },
    { id: "factures",  icon: "📄", label: "Factures" },
    { id: "clients",   icon: "👥", label: "Clients" },
    { id: "releves",   icon: "📊", label: "Relevés" },
    { id: "paiements", icon: "💳", label: "Paiements" },
  ];

  const isFactures = ["factures","invoice-detail"].includes(view);
  const isClients  = ["clients","client-detail"].includes(view);
  const isReleves  = view === "releves";

  return (
    <div style={S.root}>
      {/* SIDEBAR */}
      <aside style={{ ...S.sidebar, width: sidebarOpen ? 230 : 60, transition: "width .2s" }}>
        <div style={S.logoWrap} onClick={() => setSidebarOpen(o => !o)}>
          <div style={S.logoIcon}>TI</div>
          {sidebarOpen && <div><div style={S.logoName}>Maghreb Trans</div><div style={S.logoSub}>Solutions</div></div>}
        </div>
        <nav style={S.nav}>
          {nav.map(n => {
            const active = n.id === "dashboard" ? view === "dashboard"
              : n.id === "factures" ? isFactures
              : n.id === "clients" ? isClients
              : view === n.id;
            return (
              <button key={n.id} style={{ ...S.navBtn, ...(active ? S.navActive : {}) }} onClick={() => goTo(n.id)} title={n.label}>
                <span style={S.navIcon}>{n.icon}</span>
                {sidebarOpen && <span>{n.label}</span>}
              </button>
            );
          })}
        </nav>
        {sidebarOpen ? (
          <div style={S.sideFooter}>
            {currentUser && (
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10, padding:"8px 10px", background:"#1e293b", borderRadius:8 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:currentUser.color, color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:12, flexShrink:0 }}>
                  {currentUser.initiales}
                </div>
                <div>
                  <div style={{ color:"#e2e8f0", fontSize:12, fontWeight:700 }}>{currentUser.nom}</div>
                  <div style={{ color:"#64748b", fontSize:10 }}>{currentUser.role}</div>
                </div>
              </div>
            )}
            <div style={{ color: "#475569", fontSize: 11 }}>Tanger · Maroc</div>
            <button
              onClick={() => { sessionStorage.removeItem("mts_auth"); sessionStorage.removeItem("mts_user"); onLogout(); }}
              style={{
                marginTop: 8, width: "100%", padding: "7px", background: "#1e293b",
                color: "#94a3b8", border: "1px solid #334155", borderRadius: 6,
                fontSize: 11, cursor: "pointer", fontWeight: 600
              }}
              onMouseOver={e => e.target.style.color="#ef4444"}
              onMouseOut={e => e.target.style.color="#94a3b8"}
            >🔒 Déconnexion</button>
          </div>
        ) : (
          <div style={{ padding: "12px 0", textAlign: "center" }}>
            {currentUser && (
              <div title={currentUser.nom} style={{ width:32, height:32, borderRadius:8, background:currentUser.color, color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:11, margin:"0 auto 8px" }}>
                {currentUser.initiales}
              </div>
            )}
            <button
              onClick={() => { sessionStorage.removeItem("mts_auth"); sessionStorage.removeItem("mts_user"); onLogout(); }}
              title="Déconnexion"
              style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 16 }}
            >🔒</button>
          </div>
        )}
      </aside>

      {/* MAIN */}
      <main style={S.main}>
        {notification && (
          <div style={{ ...S.notif, background: notification.type === "error" ? "#ef4444" : "#22c55e" }}>
            {notification.msg}
          </div>
        )}

        {view === "dashboard" && (
          <Dashboard invoices={invoices} clients={clients} calcTotal={calcTotal}
            onViewInvoice={(inv) => { setSelectedInvoice(inv); setView("invoice-detail"); }}
            onGoto={goTo} />
        )}

        {isFactures && !editingInvoice && view === "factures" && (
          <Factures invoices={invoices} clients={clients} calcTotal={calcTotal}
            onNew={() => setEditingInvoice({ id: nextInvoiceId(), clientId: "", date: today(), echeance: "", status: "draft", lignes: [{ desc: "", qte: 1, pu: 0 }], notes: "", tva: true, devise: "MAD" })}
            onSelect={(inv) => { setSelectedInvoice(inv); setView("invoice-detail"); }}
            onEdit={setEditingInvoice}
            onDelete={deleteInvoice}
            onStatus={(id, s) => { setInvoices(invoices.map(i => i.id === id ? { ...i, status: s } : i)); notify("Statut mis à jour ✓"); }}
          />
        )}

        {editingInvoice && (
          <InvoiceForm inv={editingInvoice} clients={clients}
            onSave={saveInvoice}
            onCancel={() => { setEditingInvoice(null); }} />
        )}

        {view === "invoice-detail" && selectedInvoice && !editingInvoice && (
          <InvoiceDetail inv={selectedInvoice} clients={clients} calcTotal={calcTotal} calcHT={calcHT}
            onEdit={() => setEditingInvoice(selectedInvoice)}
            onDelete={() => deleteInvoice(selectedInvoice.id)}
            onBack={() => { setSelectedInvoice(null); setView("factures"); }}
            onStatus={(s) => {
              const updated = { ...selectedInvoice, status: s };
              setInvoices(invoices.map(i => i.id === selectedInvoice.id ? updated : i));
              setSelectedInvoice(updated);
              notify("Statut mis à jour ✓");
            }}
          />
        )}

        {isClients && !editingClient && view === "clients" && (
          <Clients clients={clients} invoices={invoices} calcTotal={calcTotal}
            onNew={() => setEditingClient({ id: `C${String(clients.length + 1).padStart(3, "0")}`, nom: "", email: "", tel: "", ville: "", rc: "" })}
            onSelect={(c) => { setSelectedClient(c); setView("client-detail"); }}
            onEdit={setEditingClient}
            onDelete={deleteClient}
            onReleve={handleReleve}
          />
        )}

        {editingClient && (
          <ClientForm client={editingClient} onSave={saveClient} onCancel={() => setEditingClient(null)} />
        )}

        {view === "client-detail" && selectedClient && !editingClient && (
          <ClientDetail client={selectedClient}
            invoices={invoices.filter(i => i.clientId === selectedClient.id)}
            calcTotal={calcTotal}
            onEdit={() => setEditingClient(selectedClient)}
            onDelete={() => deleteClient(selectedClient.id)}
            onBack={() => { setSelectedClient(null); setView("clients"); }}
            onReleve={handleReleve}
          />
        )}

        {view === "paiements" && (
          <Paiements invoices={invoices} clients={clients} calcTotal={calcTotal}
            onStatus={(id, s) => { setInvoices(invoices.map(i => i.id === id ? { ...i, status: s } : i)); notify("Paiement enregistré ✓"); }}
          />
        )}

        {view === "releves" && (
          <Releves clients={clients} invoices={invoices} calcTotal={calcTotal} onReleve={handleReleve} />
        )}
      </main>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ invoices, clients, calcTotal, onViewInvoice, onGoto }) {
  const revenu    = invoices.filter(i => i.status === "paid").reduce((s, i) => s + calcTotal(i), 0);
  const attente   = invoices.filter(i => i.status === "sent").reduce((s, i) => s + calcTotal(i), 0);
  const retard    = invoices.filter(i => i.status === "overdue").reduce((s, i) => s + calcTotal(i), 0);
  const recent    = [...invoices].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 6);
  return (
    <div style={S.page}>
      <h1 style={S.pageTitle}>Tableau de bord</h1>
      <div style={S.statGrid}>
        {[
          { label: "Revenus encaissés", value: formatMoney(revenu),  color: "#22c55e" },
          { label: "En attente",        value: formatMoney(attente),  color: "#3b82f6" },
          { label: "En retard",         value: formatMoney(retard),   color: "#ef4444" },
          { label: "Clients actifs",    value: clients.length,        color: "#f59e0b" },
        ].map((s, i) => (
          <div key={i} style={S.statCard}>
            <div style={{ ...S.statVal, color: s.color }}>{s.value}</div>
            <div style={S.statLbl}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", margin:"28px 0 14px" }}>
        <h2 style={{ fontSize:17, fontWeight:700, color:"#0f172a" }}>Factures récentes</h2>
        <button style={S.linkBtn} onClick={() => onGoto("factures")}>Voir tout →</button>
      </div>
      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead><tr>{["N°","Client","Date","Montant TTC","Statut"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {recent.map(inv => {
              const st = STATUS[inv.status];
              const cl = clients.find(c => c.id === inv.clientId);
              return (
                <tr key={inv.id} style={S.tr} onClick={() => onViewInvoice(inv)}>
                  <td style={S.td}><span style={S.invNo}>{inv.id}</span></td>
                  <td style={S.td}>{cl?.nom || "—"}</td>
                  <td style={S.td}>{formatDate(inv.date)}</td>
                  <td style={{ ...S.td, fontWeight:700 }}>{formatMoney(calcTotal(inv), inv.devise)}</td>
                  <td style={S.td}><span style={{ ...S.badge, color:st.color, background:st.bg }}>{st.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── FACTURES ─────────────────────────────────────────────────────────────────
function Factures({ invoices, clients, calcTotal, onNew, onSelect, onEdit, onDelete, onStatus }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const filtered = invoices
    .filter(i => filter === "all" || i.status === filter)
    .filter(i => {
      const cl = clients.find(c => c.id === i.clientId);
      return i.id.toLowerCase().includes(search.toLowerCase()) || (cl?.nom || "").toLowerCase().includes(search.toLowerCase());
    });

  return (
    <div style={S.page}>
      <div style={S.pageHdr}>
        <h1 style={S.pageTitle}>Factures</h1>
        <button style={S.primaryBtn} onClick={onNew}>+ Nouvelle facture</button>
      </div>
      <div style={{ display:"flex", gap:12, marginBottom:18, flexWrap:"wrap", alignItems:"center" }}>
        <input style={{ ...S.input, width:220, marginBottom:0 }} placeholder="🔍 Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display:"flex", gap:6 }}>
          {[["all","Toutes"], ...Object.entries(STATUS).map(([k,v]) => [k, v.label])].map(([k, label]) => (
            <button key={k} style={{ ...S.filterBtn, ...(filter === k ? S.filterActive : {}) }} onClick={() => setFilter(k)}>{label}</button>
          ))}
        </div>
      </div>
      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead><tr>{["N°","Client","Date","Échéance","Montant TTC","Statut","Actions"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(inv => {
              const cl = clients.find(c => c.id === inv.clientId);
              const st = STATUS[inv.status];
              return (
                <tr key={inv.id} style={S.tr}>
                  <td style={S.td} onClick={() => onSelect(inv)}><span style={S.invNo}>{inv.id}</span></td>
                  <td style={S.td} onClick={() => onSelect(inv)}>{cl?.nom || "—"}</td>
                  <td style={S.td} onClick={() => onSelect(inv)}>{formatDate(inv.date)}</td>
                  <td style={S.td} onClick={() => onSelect(inv)}>{formatDate(inv.echeance)}</td>
                  <td style={{ ...S.td, fontWeight:700 }} onClick={() => onSelect(inv)}>{formatMoney(calcTotal(inv), inv.devise)} <span style={{fontSize:10,background:inv.devise==="EUR"?"#fef3c7":inv.devise==="USD"?"#d1fae5":"#eff6ff",color:inv.devise==="EUR"?"#92400e":inv.devise==="USD"?"#065f46":"#1d4ed8",padding:"1px 5px",borderRadius:4,fontWeight:700,marginLeft:2}}>{inv.devise}</span></td>
                  <td style={S.td}>
                    <select style={{ ...S.badge, color:st.color, background:st.bg, border:"none", cursor:"pointer" }}
                      value={inv.status} onChange={e => onStatus(inv.id, e.target.value)}>
                      {Object.entries(STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </td>
                  <td style={S.td}>
                    <button style={S.iconBtn} onClick={() => onEdit(inv)}>✏️</button>
                    <button style={S.iconBtn} onClick={() => onDelete(inv.id)}>🗑️</button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={7} style={{ ...S.td, textAlign:"center", color:"#94a3b8", padding:32 }}>Aucune facture trouvée</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── INVOICE DETAIL ───────────────────────────────────────────────────────────
function InvoiceDetail({ inv, clients, calcTotal, calcHT, onEdit, onDelete, onBack, onStatus }) {
  const cl = clients.find(c => c.id === inv.clientId) || {};
  const ht = calcHT(inv);
  const tva = inv.tva ? ht * 0.2 : 0;
  const ttc = ht + tva;
  const st = STATUS[inv.status];

  function handlePrint() {
    const logoSrc = LOGO_B64;

    // Lignes du tableau
    const lignesHTML = inv.lignes.map((l, i) => {
      const mt = (Number(l.qte)||0)*(Number(l.pu)||0);
      const bg = i%2===0 ? '#ffffff' : '#f8fafc';
      return `<tr style="background:${bg}">
        <td style="padding:9px 14px;border-bottom:1px solid #e9eef5;font-size:11px;color:#1e293b;line-height:1.4">${l.desc||'—'}</td>
        <td style="padding:9px 14px;border-bottom:1px solid #e9eef5;font-size:11px;color:#1e293b;text-align:center">${l.qte}</td>
        <td style="padding:9px 14px;border-bottom:1px solid #e9eef5;font-size:11px;color:#1e293b;text-align:right">${Number(l.pu||0).toLocaleString('fr-FR',{minimumFractionDigits:2})}</td>
        <td style="padding:9px 14px;border-bottom:1px solid #e9eef5;font-size:11px;color:#0f172a;text-align:right;font-weight:700">${mt.toLocaleString('fr-FR',{minimumFractionDigits:2})}</td>
      </tr>`;
    }).join('');

    // TVA conditionnelle
    const tvaRowHTML = inv.tva
      ? `<tr>
          <td style="padding:8px 16px;font-size:11px;color:#64748b;text-align:right">Total HT</td>
          <td style="padding:8px 16px;font-size:11px;font-weight:600;color:#334155;text-align:right;white-space:nowrap">${ht.toLocaleString('fr-FR',{minimumFractionDigits:2})} MAD</td>
        </tr>
        <tr>
          <td style="padding:8px 16px;font-size:11px;color:#64748b;text-align:right">TVA (20%)</td>
          <td style="padding:8px 16px;font-size:11px;font-weight:600;color:#334155;text-align:right;white-space:nowrap">${tva.toLocaleString('fr-FR',{minimumFractionDigits:2})} MAD</td>
        </tr>`
      : `<tr>
          <td colspan="2" style="padding:8px 16px;font-size:10px;color:#94a3b8;text-align:right;font-style:italic">Facture hors taxe (TVA non applicable)</td>
        </tr>`;

    const totalLabel = inv.tva ? 'TOTAL TTC' : 'TOTAL HT';
    const notesHTML = inv.notes
      ? `<div style="border-left:3px solid #3b82f6;background:#eff6ff;padding:10px 14px;margin-bottom:18px;font-size:10px;color:#1e40af;border-radius:0 4px 4px 0">
           <strong>Notes :</strong> ${inv.notes}
         </div>`
      : '';
    const clientInfos = [cl.adresse, cl.ville, cl.email, cl.tel, cl.rc ? 'RC : '+cl.rc : ''].filter(Boolean).map(v=>`<div>${v}</div>`).join('');
    const statusStyle = `background:${st.bg};color:${st.color};padding:4px 14px;border-radius:20px;font-weight:800;font-size:10px;display:inline-block;letter-spacing:0.5px`;

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Facture ${inv.id} — MAGHREB TRANS SOLUTIONS</title>
<style>
  @page {
    size: A4 portrait;
    margin: 10mm 12mm 10mm 12mm;
  }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  html, body {
    margin: 0; padding: 0;
    width: 100%; height: 100%;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11px;
    background: #fff;
    color: #0f172a;
  }
  table { border-collapse: collapse; width: 100%; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none !important; }
  }
  .page-wrapper {
    width: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }
  .content { flex: 1; }
  .footer-spacer { height: 20mm; }
</style>
</head>
<body>

<div class="page-wrapper">
<div class="content">

<!-- ===== EN-TÊTE ===== -->
<div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;border-bottom:3px solid #0f172a;margin-bottom:18px">

  <!-- Logo + coordonnées émetteur -->
  <div style="flex:1">
    <img src="${logoSrc}" alt="MTS" style="height:68px;max-width:260px;object-fit:contain;display:block;margin-bottom:6px">
    <div style="font-size:9.5px;color:#475569;line-height:1.85">
      <div>29 Rue Amr Ibn Ass, 3ème Étg N°2 — Tanger 90000, Maroc</div>
      <div>Tél : +212 669 60 86 53 &nbsp;|&nbsp; facturation@maghrebtranssolutions.com</div>
      <div style="color:#94a3b8;margin-top:1px">RC : 130319 &nbsp;|&nbsp; IF : 12345678 &nbsp;|&nbsp; ICE : 003133212000080</div>
    </div>
  </div>

  <!-- Titre FACTURE + infos -->
  <div style="text-align:right;padding-left:20px;min-width:200px">
    <div style="font-size:36px;font-weight:900;color:#0f172a;letter-spacing:5px;line-height:1;margin-bottom:4px">FACTURE</div>
    <div style="font-size:18px;font-weight:800;color:#3b82f6;margin-bottom:10px">${inv.id}</div>
    <table style="width:auto;margin-left:auto;font-size:10px">
      <tr>
        <td style="color:#64748b;padding-right:10px;padding-bottom:4px;text-align:right">Date d'émission</td>
        <td style="font-weight:700;text-align:right;white-space:nowrap">${formatDate(inv.date)}</td>
      </tr>
      <tr>
        <td style="color:#64748b;padding-right:10px;padding-bottom:4px;text-align:right">Date d'échéance</td>
        <td style="font-weight:700;text-align:right;white-space:nowrap">${formatDate(inv.echeance)||'—'}</td>
      </tr>
      <tr>
        <td style="color:#64748b;padding-right:10px;text-align:right">Statut</td>
        <td style="text-align:right"><span style="${statusStyle}">${st.label}</span></td>
      </tr>
    </table>
  </div>
</div>

<!-- ===== ADRESSES ===== -->
<div style="display:flex;gap:20px;margin-bottom:22px">
  <div style="flex:1;background:#f8fafc;border-radius:6px;padding:14px 16px">
    <div style="font-size:8.5px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px">DE</div>
    <div style="font-weight:800;font-size:12px;color:#0f172a;margin-bottom:4px">MAGHREB TRANS SOLUTIONS SARL</div>
    <div style="font-size:10px;color:#64748b;line-height:1.8">
      <div>29 Rue Amr Ibn Ass, 3ème Étg N°2</div>
      <div>Tanger 90000, Maroc</div>
    </div>
  </div>
  <div style="flex:1;background:#f0f7ff;border-radius:6px;padding:14px 16px;border-left:3px solid #3b82f6">
    <div style="font-size:8.5px;font-weight:800;color:#3b82f6;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px">FACTURER À</div>
    <div style="font-weight:800;font-size:13px;color:#0f172a;margin-bottom:4px">${cl.nom||'—'}</div>
    <div style="font-size:10px;color:#64748b;line-height:1.8">${clientInfos}</div>
  </div>
</div>

<!-- ===== TABLEAU PRESTATIONS ===== -->
<table style="margin-bottom:0;border-radius:6px;overflow:hidden">
  <thead>
    <tr style="background:#0f172a">
      <th style="padding:11px 14px;text-align:left;color:#fff;font-size:10px;font-weight:700;width:48%">DÉSIGNATION / DESCRIPTION</th>
      <th style="padding:11px 14px;text-align:center;color:#fff;font-size:10px;font-weight:700;width:10%">QTÉ</th>
      <th style="padding:11px 14px;text-align:right;color:#fff;font-size:10px;font-weight:700;width:21%">PRIX UNITAIRE (MAD)</th>
      <th style="padding:11px 14px;text-align:right;color:#fff;font-size:10px;font-weight:700;width:21%">MONTANT (MAD)</th>
    </tr>
  </thead>
  <tbody>
    ${lignesHTML}
  </tbody>
</table>

<!-- ===== TOTAUX ===== -->
<div style="display:flex;justify-content:flex-end;margin-top:0;margin-bottom:22px">
  <table style="width:310px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;border-bottom:0">
    ${tvaRowHTML}
    <tr style="background:#0f172a">
      <td style="padding:12px 16px;font-size:13px;font-weight:800;color:#fff;text-align:right;letter-spacing:0.5px">${totalLabel}</td>
      <td style="padding:12px 16px;font-size:16px;font-weight:900;color:#fff;text-align:right;white-space:nowrap">${ttc.toLocaleString('fr-FR',{minimumFractionDigits:2})} MAD</td>
    </tr>
  </table>
</div>

<!-- ===== NOTES ===== -->
${notesHTML}

<!-- ===== CONDITIONS DE RÈGLEMENT ===== -->
<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:5px;padding:10px 14px;margin-bottom:18px;font-size:10px;color:#64748b">
  <strong style="color:#0f172a">Conditions de règlement :</strong>
  Paiement à réception de facture — Virement bancaire ou chèque à l'ordre de MAGHREB TRANS SOLUTIONS SARL.
  Tout retard de paiement entraîne des pénalités au taux légal en vigueur.
</div>

</div><!-- /content -->

<!-- ===== PIED DE PAGE ===== -->
<div style="border-top:2px solid #0f172a;padding-top:10px;display:flex;justify-content:space-between;align-items:center;margin-top:auto">
  <div style="font-size:9px;color:#64748b;line-height:1.8">
    <strong style="color:#0f172a;font-size:10px">MAGHREB TRANS SOLUTIONS SARL</strong><br>
    RC : 130319 &nbsp;|&nbsp; IF : 12345678 &nbsp;|&nbsp; ICE : 003133212000080<br>
    29 Rue Amr Ibn Ass, 3ème Étg N°2, Tanger 90000, Maroc
  </div>
  <div style="text-align:right;font-size:9px;color:#64748b;line-height:1.8">
    <div>Tél : +212 669 60 86 53</div>
    <div>facturation@maghrebtranssolutions.com</div>
    <div style="color:#3b82f6;font-weight:700;margin-top:2px;font-size:10px">Merci de votre confiance !</div>
  </div>
</div>

</div><!-- /page-wrapper -->

<script>
  window.onload = function() {
    setTimeout(function() { window.print(); }, 500);
  };
</script>

</body>
</html>`;

    const w = window.open('', '_blank', 'width=900,height=1300');
    w.document.write(html);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 600);
  }

  return (
    <div style={S.page}>
      <div style={S.pageHdr}>
        <button style={S.backBtn} onClick={onBack}>← Retour</button>
        <div style={{ display:"flex", gap:8 }}>
          <button style={S.secondaryBtn} onClick={onEdit}>✏️ Modifier</button>
          <button style={S.printBtn} onClick={handlePrint}>🖨️ Imprimer / PDF A4</button>
          <button style={S.dangerBtn} onClick={onDelete}>🗑️</button>
        </div>
      </div>

      {/* Aperçu écran */}
      <div id="invoice-print" style={S.invPrint}>
        <div style={S.invHdr}>
          <div>
            <img src={LOGO_B64} alt="MTS" style={{ height:52, maxWidth:200, objectFit:"contain", marginBottom:6, display:"block" }} />
            <div style={{ fontWeight:800, fontSize:15, color:"#0f172a" }}>MAGHREB TRANS SOLUTIONS SARL</div>
            <div style={{ color:"#64748b", fontSize:11, marginTop:2 }}>29 Rue Amr Ibn Ass 3ème Étg N°2, Tanger 90000</div>
            <div style={{ color:"#64748b", fontSize:11, marginTop:1 }}>Tél: +212 669 60 86 53</div>
            <div style={{ color:"#64748b", fontSize:11, marginTop:1 }}>RC: 130319 | IF: 12345678 | ICE: 003133212000080</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:28, fontWeight:900, color:"#0f172a", letterSpacing:3 }}>FACTURE</div>
            <div style={{ fontSize:16, fontWeight:700, color:"#3b82f6", marginBottom:8 }}>{inv.id}</div>
            <div style={{ color:"#64748b", fontSize:12 }}>Date : {formatDate(inv.date)}</div>
            <div style={{ color:"#64748b", fontSize:12, marginBottom:8 }}>Échéance : {formatDate(inv.echeance)}</div>
            <span style={{ ...S.badge, color:st.color, background:st.bg }}>{st.label}</span>
          </div>
        </div>

        <div style={S.invClientBox}>
          <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>FACTURER À</div>
          <div style={{ fontWeight:700, color:"#0f172a", fontSize:16 }}>{cl.nom || "—"}</div>
          {[cl.adresse, cl.ville, cl.email, cl.tel, cl.rc && `RC: ${cl.rc}`].filter(Boolean).map((v,i) => (
            <div key={i} style={{ color:"#64748b", fontSize:12, marginTop:2 }}>{v}</div>
          ))}
        </div>

        <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:16 }}>
          <thead>
            <tr style={{ background:"#0f172a" }}>
              {["Description","Qté","Prix unitaire (MAD)","Total HT (MAD)"].map(h => (
                <th key={h} style={{ padding:"10px 14px", textAlign:"left", color:"#fff", fontSize:12, fontWeight:600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inv.lignes.map((l, i) => (
              <tr key={i} style={{ background: i%2===0 ? "#fff" : "#f8fafc" }}>
                <td style={{ padding:"10px 14px", fontSize:13, color:"#334155", borderBottom:"1px solid #e2e8f0" }}>{l.desc||"—"}</td>
                <td style={{ padding:"10px 14px", fontSize:13, color:"#334155", textAlign:"center", borderBottom:"1px solid #e2e8f0" }}>{l.qte}</td>
                <td style={{ padding:"10px 14px", fontSize:13, color:"#334155", textAlign:"right", borderBottom:"1px solid #e2e8f0" }}>{formatMoney(Number(l.pu)||0, inv.devise)}</td>
                <td style={{ padding:"10px 14px", fontSize:13, color:"#334155", textAlign:"right", fontWeight:700, borderBottom:"1px solid #e2e8f0" }}>{formatMoney((Number(l.qte)||0)*(Number(l.pu)||0), inv.devise)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:5, marginBottom:16 }}>
          <div style={{ display:"flex", gap:60, color:"#64748b", fontSize:13 }}>
            <span>Total HT</span><span>{formatMoney(ht, inv.devise)}</span>
          </div>
          {inv.tva ? (
            <div style={{ display:"flex", gap:60, color:"#64748b", fontSize:13 }}>
              <span>TVA (20%)</span><span>{formatMoney(tva, inv.devise)}</span>
            </div>
          ) : (
            <div style={{ display:"flex", gap:60, color:"#94a3b8", fontSize:12, fontStyle:"italic" }}>
              <span>Exonéré de TVA</span><span>—</span>
            </div>
          )}
          <div style={{ display:"flex", gap:60, color:"#fff", fontSize:16, fontWeight:800, background:"#0f172a", padding:"10px 16px", borderRadius:6, marginTop:4 }}>
            <span>{inv.tva ? "TOTAL TTC" : "TOTAL HT"}</span><span>{formatMoney(ttc, inv.devise)}</span>
          </div>
        </div>

        {inv.notes && <div style={{ background:"#f8fafc", borderRadius:8, padding:"10px 14px", fontSize:12, color:"#64748b", marginBottom:16 }}><strong>Notes :</strong> {inv.notes}</div>}
        
        {/* Traçabilité */}
        <div style={{ display:"flex", gap:12, marginBottom:16, flexWrap:"wrap" }}>
          {inv.cree && (
            <div style={{ display:"flex", alignItems:"center", gap:8, background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:8, padding:"6px 12px", fontSize:12 }}>
              <div style={{ width:24, height:24, borderRadius:6, background:inv.cree.par.color, color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:10 }}>{inv.cree.par.initiales}</div>
              <span style={{ color:"#166534" }}>Créé par <strong>{inv.cree.par.nom}</strong> · {new Date(inv.cree.le).toLocaleDateString("fr-FR", {day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</span>
            </div>
          )}
          {inv.modifie && (
            <div style={{ display:"flex", alignItems:"center", gap:8, background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:8, padding:"6px 12px", fontSize:12 }}>
              <div style={{ width:24, height:24, borderRadius:6, background:inv.modifie.par.color, color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:10 }}>{inv.modifie.par.initiales}</div>
              <span style={{ color:"#1e40af" }}>Modifié par <strong>{inv.modifie.par.nom}</strong> · {new Date(inv.modifie.le).toLocaleDateString("fr-FR", {day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</span>
            </div>
          )}
        </div>

        <div style={{ textAlign:"center", color:"#94a3b8", fontSize:11, borderTop:"1px solid #e2e8f0", paddingTop:14 }}>
          Merci de votre confiance — MAGHREB TRANS SOLUTIONS SARL · RC 130319 · Tanger, Maroc
        </div>
      </div>

      <div style={{ marginTop:20, display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
        <span style={{ color:"#64748b", fontSize:14 }}>Changer le statut :</span>
        {Object.entries(STATUS).map(([k,v]) => (
          <button key={k} style={{ ...S.badge, color:v.color, background:v.bg, border: inv.status===k ? `2px solid ${v.color}` : "2px solid transparent", cursor:"pointer" }}
            onClick={() => onStatus(k)}>{v.label}</button>
        ))}
      </div>
    </div>
  );
}


// ─── INVOICE FORM ─────────────────────────────────────────────────────────────
function InvoiceForm({ inv, clients, onSave, onCancel }) {
  const [form, setForm] = useState({ ...inv, lignes: inv.lignes.map(l => ({ ...l })) });
  const ht  = form.lignes.reduce((s,l) => s + (Number(l.qte)||0)*(Number(l.pu)||0), 0);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setL = (i, k, v) => setForm(f => ({ ...f, lignes: f.lignes.map((l,j) => j===i ? { ...l, [k]:v } : l) }));

  return (
    <div style={S.page}>
      <div style={S.pageHdr}>
        <h1 style={S.pageTitle}>{inv.clientId ? "Modifier la facture" : "Nouvelle facture"}</h1>
        <div style={{ display:"flex", gap:8 }}>
          <button style={S.secondaryBtn} onClick={onCancel}>Annuler</button>
          <button style={S.primaryBtn} onClick={() => onSave(form)}>💾 Enregistrer</button>
        </div>
      </div>
      <div style={S.formGrid}>
        <div style={S.formCard}>
          <h3 style={S.formSec}>Informations</h3>
          {[["id","N° Facture"],["date","Date","date"],["echeance","Échéance","date"]].map(([k,label,type]) => (
            <div key={k}>
              <label style={S.label}>{label}</label>
              <input style={S.input} type={type||"text"} value={form[k]||""} onChange={e => set(k, e.target.value)} />
            </div>
          ))}
          <label style={S.label}>Client</label>
          <select style={S.input} value={form.clientId} onChange={e => set("clientId", e.target.value)}>
            <option value="">— Sélectionner —</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <label style={S.label}>Statut</label>
          <select style={S.input} value={form.status} onChange={e => set("status", e.target.value)}>
            {Object.entries(STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        <div style={S.formCard}>
          <h3 style={S.formSec}>Lignes de facturation</h3>
          {form.lignes.map((l, i) => (
            <div key={i} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"center" }}>
              <input style={{ ...S.input, flex:3 }} placeholder="Description" value={l.desc} onChange={e => setL(i,"desc",e.target.value)} />
              <input style={{ ...S.input, flex:1, textAlign:"center" }} placeholder="Qté" type="number" min="1" value={l.qte} onChange={e => setL(i,"qte",e.target.value)} />
              <input style={{ ...S.input, flex:1, textAlign:"right" }} placeholder="Prix HT" type="number" min="0" value={l.pu} onChange={e => setL(i,"pu",e.target.value)} />
              <span style={{ ...S.input, flex:1, background:"#f1f5f9", textAlign:"right", display:"flex", alignItems:"center", justifyContent:"flex-end", fontSize:13 }}>
                {formatMoney((Number(l.qte)||0)*(Number(l.pu)||0), inv.devise)}
              </span>
              {form.lignes.length > 1 && <button style={S.iconBtn} onClick={() => setForm(f => ({ ...f, lignes: f.lignes.filter((_,j) => j!==i) }))}>✕</button>}
            </div>
          ))}
          <button style={S.addLineBtn} onClick={() => setForm(f => ({ ...f, lignes: [...f.lignes, { desc:"", qte:1, pu:0 }] }))}>+ Ajouter une ligne</button>
          <div style={{ marginTop:16, borderTop:"2px solid #e2e8f0", paddingTop:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, margin:"12px 0 4px", padding:"10px 14px", background:"#f8fafc", borderRadius:8, border:"1.5px solid #e2e8f0" }}>
              <span style={{ fontSize:14, fontWeight:600, color:"#0f172a", flex:1 }}>💱 Devise</span>
              {["MAD","EUR","USD"].map(d => (
                <button key={d} onClick={() => setForm(f => ({ ...f, devise: d }))}
                  style={{ padding:"4px 12px", borderRadius:6, border:"none", background:form.devise===d?"#0f172a":"#e2e8f0", color:form.devise===d?"#fff":"#374151", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                  {d}
                </button>
              ))}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10, margin:"8px 0 4px", padding:"10px 14px", background:form.tva?"#eff6ff":"#f8fafc", borderRadius:8, border:"1.5px solid "+(form.tva?"#3b82f6":"#e2e8f0") }}>
              <span style={{ fontSize:14, fontWeight:600, color:"#0f172a", flex:1 }}>TVA (20%)</span>
              <button onClick={() => setForm(f => ({ ...f, tva: !f.tva }))} style={{ padding:"4px 14px", borderRadius:6, border:"none", background:form.tva?"#3b82f6":"#94a3b8", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                {form.tva ? "Activée ✓" : "Désactivée"}
              </button>
            </div>
            {[["Total HT", ht], ...(form.tva ? [["TVA 20%", ht*0.2]] : [[]])].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", color:"#64748b", fontSize:14, marginBottom:4 }}><span>{k}</span><span>{formatMoney(v)}</span></div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:18, fontWeight:800, color:"#0f172a", borderTop:"2px solid #0f172a", paddingTop:8, marginTop:4 }}>
              <span>{form.tva ? "Total TTC" : "Total HT"}</span><span>{formatMoney(form.tva ? ht*1.2 : ht, form.devise)}</span>
            </div>
          </div>
          <label style={S.label}>Notes</label>
          <textarea style={{ ...S.input, minHeight:70, resize:"vertical" }} value={form.notes} onChange={e => set("notes", e.target.value)} />
        </div>
      </div>
    </div>
  );
}

// ─── CLIENTS ──────────────────────────────────────────────────────────────────
function Clients({ clients, invoices, calcTotal, onNew, onSelect, onEdit, onDelete, onReleve }) {
  const [search, setSearch] = useState("");
  const filtered = clients.filter(c => c.nom.toLowerCase().includes(search.toLowerCase()) || c.ville.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={S.page}>
      <div style={S.pageHdr}>
        <h1 style={S.pageTitle}>Clients</h1>
        <button style={S.primaryBtn} onClick={onNew}>+ Nouveau client</button>
      </div>
      <input style={{ ...S.input, width:260, marginBottom:18 }} placeholder="🔍 Rechercher un client..." value={search} onChange={e => setSearch(e.target.value)} />
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {filtered.map(c => {
          const cInvs = invoices.filter(i => i.clientId === c.id);
          const total = cInvs.reduce((s, i) => s + calcTotal(i), 0);
          return (
            <div key={c.id} style={S.clientCard}>
              <div style={S.clientAvatar}>{c.nom[0]}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, color:"#0f172a", fontSize:16 }}>{c.nom}</div>
                <div style={{ color:"#64748b", fontSize:13, marginTop:2 }}>{c.ville} · {c.email}</div>
                <div style={{ color:"#94a3b8", fontSize:12, marginTop:2 }}>{c.tel}</div>
              </div>
              <div style={{ textAlign:"center", minWidth:80 }}>
                <div style={{ fontWeight:800, fontSize:20, color:"#0f172a" }}>{cInvs.length}</div>
                <div style={{ fontSize:11, color:"#94a3b8" }}>factures</div>
                <div style={{ fontSize:13, fontWeight:600, color:"#3b82f6", marginTop:2 }}>{formatMoney(total)}</div>
              </div>
              <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                <button style={S.iconBtn} onClick={() => onSelect(c)} title="Voir">👁️</button>
                <button style={S.iconBtn} onClick={() => onEdit(c)} title="Modifier">✏️</button>
                <button style={{ ...S.iconBtn, fontSize:12, padding:"4px 8px", background:"#f0fdf4", color:"#166534", fontWeight:700, borderRadius:6 }} onClick={() => onReleve(c, invoices.filter(i=>i.clientId===c.id), "excel")} title="Relevé Excel">📊 Excel</button>
                <button style={{ ...S.iconBtn, fontSize:12, padding:"4px 8px", background:"#fef2f2", color:"#991b1b", fontWeight:700, borderRadius:6 }} onClick={() => onReleve(c, invoices.filter(i=>i.clientId===c.id), "pdf")} title="Relevé PDF">📄 PDF</button>
                <button style={S.iconBtn} onClick={() => onDelete(c.id)} title="Supprimer">🗑️</button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div style={{ textAlign:"center", color:"#94a3b8", padding:40 }}>Aucun client</div>}
      </div>
    </div>
  );
}

// ─── CLIENT DETAIL ────────────────────────────────────────────────────────────
function ClientDetail({ client, invoices, calcTotal, onEdit, onDelete, onBack, onReleve }) {
  return (
    <div style={S.page}>
      <div style={S.pageHdr}>
        <button style={S.backBtn} onClick={onBack}>← Retour</button>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <button style={{ ...S.secondaryBtn, background:"#f0fdf4", color:"#166534", border:"1.5px solid #bbf7d0" }} onClick={() => onReleve(client, invoices, "excel")}>📊 Relevé Excel</button>
          <button style={{ ...S.secondaryBtn, background:"#fef2f2", color:"#991b1b", border:"1.5px solid #fecaca" }} onClick={() => onReleve(client, invoices, "pdf")}>📄 Relevé PDF</button>
          <button style={S.secondaryBtn} onClick={onEdit}>✏️ Modifier</button>
          <button style={S.dangerBtn} onClick={onDelete}>🗑️ Supprimer</button>
        </div>
      </div>
      <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
        <div style={{ ...S.formCard, minWidth:260, maxWidth:300 }}>
          <div style={{ ...S.clientAvatar, margin:"0 auto 16px", fontSize:32, width:64, height:64, lineHeight:"64px" }}>{client.nom[0]}</div>
          <h2 style={{ textAlign:"center", margin:"0 0 4px", color:"#0f172a" }}>{client.nom}</h2>
          <p style={{ textAlign:"center", color:"#64748b", marginBottom:20 }}>{client.ville}</p>
          {[["Email",client.email],["Téléphone",client.tel],["RC",client.rc]].filter(([,v])=>v).map(([k,v])=>(
            <div key={k} style={{ marginBottom:10 }}>
              <div style={{ fontSize:12, color:"#94a3b8", textTransform:"uppercase" }}>{k}</div>
              <div style={{ color:"#0f172a", fontWeight:500 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ flex:1, minWidth:300 }}>
          <div style={S.statGrid}>
            <div style={S.statCard}><div style={{ ...S.statVal, color:"#3b82f6" }}>{invoices.length}</div><div style={S.statLbl}>Factures</div></div>
            <div style={S.statCard}><div style={{ ...S.statVal, color:"#22c55e", fontSize:18 }}>{formatMoney(invoices.reduce((s,i)=>s+calcTotal(i),0))}</div><div style={S.statLbl}>Total TTC</div></div>
          </div>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead><tr>{["N°","Date","Montant TTC","Statut"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {invoices.map(inv => {
                  const st = STATUS[inv.status];
                  return (
                    <tr key={inv.id} style={S.tr}>
                      <td style={S.td}><span style={S.invNo}>{inv.id}</span></td>
                      <td style={S.td}>{formatDate(inv.date)}</td>
                      <td style={{ ...S.td, fontWeight:700 }}>{formatMoney(calcTotal(inv), inv.devise)}</td>
                      <td style={S.td}><span style={{ ...S.badge, color:st.color, background:st.bg }}>{st.label}</span></td>
                    </tr>
                  );
                })}
                {invoices.length === 0 && <tr><td colSpan={4} style={{ ...S.td, textAlign:"center", color:"#94a3b8" }}>Aucune facture</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CLIENT FORM ──────────────────────────────────────────────────────────────
function ClientForm({ client, onSave, onCancel }) {
  const [form, setForm] = useState({ ...client });
  return (
    <div style={S.page}>
      <div style={S.pageHdr}>
        <h1 style={S.pageTitle}>{client.nom ? "Modifier le client" : "Nouveau client"}</h1>
        <div style={{ display:"flex", gap:8 }}>
          <button style={S.secondaryBtn} onClick={onCancel}>Annuler</button>
          <button style={S.primaryBtn} onClick={() => onSave(form)}>💾 Enregistrer</button>
        </div>
      </div>
      <div style={{ ...S.formCard, maxWidth:480 }}>
        {[["nom","Nom / Raison sociale"],["email","Email"],["tel","Téléphone"],["ville","Ville"],["rc","Registre du commerce"]].map(([k,label]) => (
          <div key={k}>
            <label style={S.label}>{label}</label>
            <input style={S.input} value={form[k]||""} onChange={e => setForm(f => ({ ...f, [k]:e.target.value }))} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PAIEMENTS ────────────────────────────────────────────────────────────────
function Paiements({ invoices, clients, calcTotal, onStatus }) {
  const pending = invoices.filter(i => i.status === "sent" || i.status === "overdue");
  const paid    = invoices.filter(i => i.status === "paid");
  return (
    <div style={S.page}>
      <h1 style={S.pageTitle}>Suivi des paiements</h1>
      <div style={S.statGrid}>
        {[
          { label:"À encaisser",    value:pending.length,                                         color:"#ef4444" },
          { label:"Montant dû",     value:formatMoney(pending.reduce((s,i)=>s+calcTotal(i),0)),   color:"#ef4444" },
          { label:"Factures payées",value:paid.length,                                            color:"#22c55e" },
          { label:"Total encaissé", value:formatMoney(paid.reduce((s,i)=>s+calcTotal(i),0)),      color:"#22c55e" },
        ].map((s,i) => (
          <div key={i} style={S.statCard}>
            <div style={{ ...S.statVal, color:s.color }}>{s.value}</div>
            <div style={S.statLbl}>{s.label}</div>
          </div>
        ))}
      </div>
      <h2 style={{ fontSize:17, fontWeight:700, color:"#0f172a", margin:"24px 0 14px" }}>Factures à encaisser</h2>
      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead><tr>{["N°","Client","Échéance","Montant TTC","Statut","Action"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {pending.map(inv => {
              const cl = clients.find(c => c.id === inv.clientId);
              const st = STATUS[inv.status];
              return (
                <tr key={inv.id} style={S.tr}>
                  <td style={S.td}><span style={S.invNo}>{inv.id}</span></td>
                  <td style={S.td}>{cl?.nom || "—"}</td>
                  <td style={S.td}>{formatDate(inv.echeance)}</td>
                  <td style={{ ...S.td, fontWeight:700, color:"#ef4444" }}>{formatMoney(calcTotal(inv), inv.devise)}</td>
                  <td style={S.td}><span style={{ ...S.badge, color:st.color, background:st.bg }}>{st.label}</span></td>
                  <td style={S.td}><button style={S.primaryBtn} onClick={() => onStatus(inv.id, "paid")}>✓ Marquer payée</button></td>
                </tr>
              );
            })}
            {pending.length === 0 && <tr><td colSpan={6} style={{ ...S.td, textAlign:"center", color:"#22c55e", padding:32 }}>✓ Aucun paiement en attente</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── RELEVÉS ──────────────────────────────────────────────────────────────────
function Releves({ clients, invoices, calcTotal, onReleve }) {
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);

  const filtered = clients.filter(c =>
    c.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={S.page}>
      <div style={S.pageHdr}>
        <h1 style={S.pageTitle}>📊 Relevés Clients</h1>
      </div>
      <div style={{ fontSize:14, color:"#64748b", marginBottom:20 }}>
        Sélectionnez un client pour générer son relevé de compte en Excel ou PDF.
      </div>
      <input style={{ ...S.input, width:300, marginBottom:20 }}
        placeholder="🔍 Rechercher un client..."
        value={search} onChange={e => setSearch(e.target.value)} />

      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {filtered.map(c => {
          const cInvs = invoices.filter(i => i.clientId === c.id);
          const total = cInvs.reduce((s, i) => s + calcTotal(i), 0);
          const paid  = cInvs.filter(i => i.status === "paid").reduce((s,i) => s + calcTotal(i), 0);
          const due   = total - paid;
          return (
            <div key={c.id} style={{ background:"white", borderRadius:12, padding:"18px 24px", boxShadow:"0 1px 4px rgba(0,0,0,.07)", display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ ...S.clientAvatar, flexShrink:0 }}>{c.nom[0]}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, color:"#0f172a", fontSize:16 }}>{c.nom}</div>
                <div style={{ color:"#64748b", fontSize:13, marginTop:2 }}>
                  {cInvs.length} facture{cInvs.length > 1 ? "s" : ""} · Total : <strong>{total.toFixed(2)}</strong>
                  {due > 0 && <span style={{ color:"#ef4444", marginLeft:8 }}>· Dû : <strong>{due.toFixed(2)}</strong></span>}
                  {due === 0 && cInvs.length > 0 && <span style={{ color:"#22c55e", marginLeft:8 }}>· ✓ Soldé</span>}
                </div>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button
                  onClick={() => onReleve(c, cInvs, "excel")}
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 18px", borderRadius:8, border:"none", background:"#f0fdf4", color:"#166534", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                  📊 Excel
                </button>
                <button
                  onClick={() => onReleve(c, cInvs, "pdf")}
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 18px", borderRadius:8, border:"none", background:"#fef2f2", color:"#991b1b", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                  📄 PDF
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign:"center", color:"#94a3b8", padding:60, fontSize:15 }}>Aucun client trouvé</div>
        )}
      </div>
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  root:       { display:"flex", height:"100vh", background:"#f8fafc", fontFamily:"'Segoe UI','Helvetica Neue',sans-serif", overflow:"hidden" },
  sidebar:    { background:"#0f172a", display:"flex", flexDirection:"column", flexShrink:0, overflow:"hidden" },
  logoWrap:   { display:"flex", alignItems:"center", gap:12, padding:"22px 14px 22px", borderBottom:"1px solid #1e293b", cursor:"pointer" },
  logoIcon:   { width:38, height:38, borderRadius:9, background:"linear-gradient(135deg,#3b82f6,#1d4ed8)", color:"#fff", fontWeight:900, fontSize:15, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  logoName:   { color:"#fff", fontWeight:700, fontSize:14, lineHeight:1.2 },
  logoSub:    { color:"#64748b", fontSize:10, letterSpacing:1 },
  nav:        { flex:1, padding:"14px 10px", display:"flex", flexDirection:"column", gap:3 },
  navBtn:     { display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:8, border:"none", background:"transparent", color:"#94a3b8", fontSize:13, cursor:"pointer", whiteSpace:"nowrap", overflow:"hidden" },
  navActive:  { background:"#1e293b", color:"#fff" },
  navIcon:    { fontSize:15, width:18, textAlign:"center", flexShrink:0 },
  sideFooter: { padding:"12px 16px", borderTop:"1px solid #1e293b" },
  main:       { flex:1, overflow:"auto", position:"relative" },
  notif:      { position:"fixed", top:20, right:20, color:"#fff", borderRadius:8, padding:"10px 20px", fontWeight:600, zIndex:999, fontSize:14, boxShadow:"0 4px 20px rgba(0,0,0,.2)" },
  page:       { padding:"32px 36px", maxWidth:1100, margin:"0 auto" },
  pageHdr:    { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:26 },
  pageTitle:  { fontSize:24, fontWeight:800, color:"#0f172a", margin:0 },
  statGrid:   { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))", gap:14, marginBottom:24 },
  statCard:   { background:"#fff", borderRadius:12, padding:"20px 18px", boxShadow:"0 1px 4px rgba(0,0,0,.07)", textAlign:"center" },
  statVal:    { fontSize:22, fontWeight:800, marginBottom:4 },
  statLbl:    { fontSize:11, color:"#94a3b8", textTransform:"uppercase", letterSpacing:1 },
  tableWrap:  { background:"#fff", borderRadius:12, boxShadow:"0 1px 4px rgba(0,0,0,.07)", overflow:"hidden" },
  table:      { width:"100%", borderCollapse:"collapse" },
  th:         { padding:"12px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:.5, background:"#f8fafc", borderBottom:"1px solid #e2e8f0" },
  tr:         { borderBottom:"1px solid #f1f5f9", cursor:"pointer" },
  td:         { padding:"12px 14px", fontSize:13, color:"#334155" },
  badge:      { display:"inline-block", padding:"4px 10px", borderRadius:20, fontSize:12, fontWeight:600 },
  invNo:      { fontFamily:"monospace", fontWeight:700, color:"#3b82f6", fontSize:12 },
  filterBtn:  { padding:"7px 14px", borderRadius:20, border:"2px solid #e2e8f0", background:"#fff", color:"#64748b", fontSize:12, cursor:"pointer", fontWeight:500 },
  filterActive:{ border:"2px solid #3b82f6", color:"#3b82f6", background:"#eff6ff" },
  primaryBtn: { padding:"8px 18px", borderRadius:8, border:"none", background:"#3b82f6", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" },
  secondaryBtn:{ padding:"8px 18px", borderRadius:8, border:"1.5px solid #e2e8f0", background:"#fff", color:"#334155", fontSize:13, fontWeight:600, cursor:"pointer" },
  dangerBtn:  { padding:"8px 14px", borderRadius:8, border:"none", background:"#fef2f2", color:"#ef4444", fontSize:13, fontWeight:600, cursor:"pointer" },
  printBtn:   { padding:"8px 18px", borderRadius:8, border:"none", background:"#0f172a", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" },
  backBtn:    { padding:"8px 0", border:"none", background:"none", color:"#3b82f6", fontSize:14, fontWeight:600, cursor:"pointer" },
  linkBtn:    { border:"none", background:"none", color:"#3b82f6", fontSize:13, cursor:"pointer", fontWeight:600 },
  iconBtn:    { border:"none", background:"none", fontSize:15, cursor:"pointer", padding:"4px 6px", borderRadius:6 },
  input:      { width:"100%", padding:"9px 11px", borderRadius:8, border:"1.5px solid #e2e8f0", fontSize:13, color:"#0f172a", background:"#fff", boxSizing:"border-box", outline:"none", marginBottom:2 },
  label:      { display:"block", fontSize:11, fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:.5, marginBottom:4, marginTop:12 },
  formGrid:   { display:"grid", gridTemplateColumns:"1fr 1.6fr", gap:20, alignItems:"start" },
  formCard:   { background:"#fff", borderRadius:12, padding:22, boxShadow:"0 1px 4px rgba(0,0,0,.07)" },
  formSec:    { fontSize:15, fontWeight:700, color:"#0f172a", margin:"0 0 16px" },
  addLineBtn: { marginTop:8, padding:"8px 14px", borderRadius:8, border:"1.5px dashed #cbd5e1", background:"#f8fafc", color:"#64748b", fontSize:12, cursor:"pointer", width:"100%" },
  clientCard: { background:"#fff", borderRadius:12, padding:"16px 20px", boxShadow:"0 1px 4px rgba(0,0,0,.07)", display:"flex", alignItems:"center", gap:16 },
  clientAvatar:{ width:44, height:44, lineHeight:"44px", borderRadius:11, background:"linear-gradient(135deg,#3b82f6,#1d4ed8)", color:"#fff", textAlign:"center", fontWeight:800, fontSize:18, flexShrink:0 },
  invPrint:   { background:"#fff", borderRadius:14, padding:36, boxShadow:"0 2px 16px rgba(0,0,0,.08)", marginTop:8 },
  invHdr:     { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:32 },
  invLogo:    { width:52, height:52, lineHeight:"52px", borderRadius:12, background:"linear-gradient(135deg,#3b82f6,#1d4ed8)", color:"#fff", textAlign:"center", fontWeight:900, fontSize:20, marginBottom:10 },
  invClientBox:{ background:"#f8fafc", borderRadius:10, padding:"16px 20px", marginBottom:24, display:"inline-block", minWidth:240 },
};

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem("mts_auth") === "1");
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("mts_user")) || null; } catch { return null; }
  });
  if (!authenticated) return <LoginScreen onLogin={(user) => { setAuthenticated(true); setCurrentUser(user); }} />;
  return <MainApp onLogout={() => { sessionStorage.removeItem("mts_user"); setAuthenticated(false); setCurrentUser(null); }} currentUser={currentUser} />;
}
