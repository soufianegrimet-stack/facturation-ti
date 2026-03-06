import { useState, useEffect } from "react";

// ─── PERSISTENCE ──────────────────────────────────────────────────────────────
function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try {
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
const formatMoney = (n) =>
  new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(n || 0);

const STATUS = {
  draft:   { label: "Brouillon", color: "#94a3b8", bg: "#f1f5f9" },
  sent:    { label: "Envoyée",   color: "#3b82f6", bg: "#eff6ff" },
  paid:    { label: "Payée",     color: "#22c55e", bg: "#f0fdf4" },
  overdue: { label: "En retard", color: "#ef4444", bg: "#fef2f2" },
};

const INIT_CLIENTS = [
  { id: "C001", nom: "ONCF", email: "comptabilite@oncf.ma", tel: "+212 537 77 47 47", ville: "Rabat", rc: "RC 12345" },
  { id: "C002", nom: "Marsa Maroc", email: "finance@marsamaroc.ma", tel: "+212 522 43 07 07", ville: "Casablanca", rc: "RC 67890" },
];

const INIT_INVOICES = [
  {
    id: "FAC-2024-001", clientId: "C001", date: "2024-01-15", echeance: "2024-02-15",
    status: "paid", lignes: [{ desc: "Transport Rabat/Casablanca", qte: 3, pu: 4500 }], notes: ""
  },
  {
    id: "FAC-2024-002", clientId: "C002", date: "2024-02-01", echeance: "2024-03-01",
    status: "sent", lignes: [{ desc: "Transport maritime Casablanca/Marseille", qte: 1, pu: 18000 }], notes: ""
  },
];

function calcHT(inv) { return inv.lignes.reduce((s, l) => s + (Number(l.qte)||0) * (Number(l.pu)||0), 0); }
function calcTotal(inv) { return calcHT(inv) * 1.2; }

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
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
    if (invoices.find(i => i.id === inv.id)) {
      setInvoices(invoices.map(i => i.id === inv.id ? inv : i));
      notify("Facture mise à jour ✓");
    } else {
      setInvoices([inv, ...invoices]);
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
    { id: "paiements", icon: "💳", label: "Paiements" },
  ];

  const isFactures = ["factures","invoice-detail"].includes(view);
  const isClients  = ["clients","client-detail"].includes(view);

  return (
    <div style={S.root}>
      {/* SIDEBAR */}
      <aside style={{ ...S.sidebar, width: sidebarOpen ? 230 : 60, transition: "width .2s" }}>
        <div style={S.logoWrap} onClick={() => setSidebarOpen(o => !o)}>
          <div style={S.logoIcon}>TI</div>
          {sidebarOpen && <div><div style={S.logoName}>Transport</div><div style={S.logoSub}>International</div></div>}
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
        {sidebarOpen && (
          <div style={S.sideFooter}>
            <div style={{ color: "#475569", fontSize: 11 }}>Tanger · Maroc</div>
            <div style={{ color: "#334155", fontSize: 10, marginTop: 2 }}>v1.0.0</div>
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
            onNew={() => setEditingInvoice({ id: nextInvoiceId(), clientId: "", date: today(), echeance: "", status: "draft", lignes: [{ desc: "", qte: 1, pu: 0 }], notes: "" })}
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
          />
        )}

        {view === "paiements" && (
          <Paiements invoices={invoices} clients={clients} calcTotal={calcTotal}
            onStatus={(id, s) => { setInvoices(invoices.map(i => i.id === id ? { ...i, status: s } : i)); notify("Paiement enregistré ✓"); }}
          />
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
                  <td style={{ ...S.td, fontWeight:700 }}>{formatMoney(calcTotal(inv))}</td>
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
                  <td style={{ ...S.td, fontWeight:700 }} onClick={() => onSelect(inv)}>{formatMoney(calcTotal(inv))}</td>
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
  const tva = ht * 0.2;
  const ttc = ht + tva;
  const st = STATUS[inv.status];

  return (
    <div style={S.page}>
      <div style={S.pageHdr}>
        <button style={S.backBtn} onClick={onBack}>← Retour</button>
        <div style={{ display:"flex", gap:8 }}>
          <button style={S.secondaryBtn} onClick={onEdit}>✏️ Modifier</button>
          <button style={S.printBtn} onClick={() => window.print()}>🖨️ Imprimer / PDF</button>
          <button style={S.dangerBtn} onClick={onDelete}>🗑️</button>
        </div>
      </div>

      <div id="invoice-print" style={S.invPrint}>
        <div style={S.invHdr}>
          <div>
            <img src="data:image/png;base64,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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//9k=" alt="MTS Logo" style={{ height:70, maxWidth:280, objectFit:"contain", marginBottom:8, background:"#0f172a", borderRadius:8, padding:"6px 12px" }} />
            <div style={{ fontWeight:800, fontSize:18, color:"#0f172a" }}>Mediterranean Trans Solutions</div>
            <div style={{ color:"#64748b", fontSize:13, marginTop:3 }}>Zone Industrielle, Tanger 90000, Maroc</div>
            <div style={{ color:"#64748b", fontSize:13, marginTop:2 }}>Tél: +212 539 XX XX XX | contact@transport-intl.ma</div>
            <div style={{ color:"#64748b", fontSize:13, marginTop:2 }}>RC: 123456 | IF: 12345678 | ICE: 000123456789</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:32, fontWeight:900, color:"#0f172a", letterSpacing:3 }}>FACTURE</div>
            <div style={{ fontSize:18, fontWeight:700, color:"#3b82f6", marginBottom:8 }}>{inv.id}</div>
            <div style={{ color:"#64748b", fontSize:14 }}>Date : {formatDate(inv.date)}</div>
            <div style={{ color:"#64748b", fontSize:14, marginBottom:10 }}>Échéance : {formatDate(inv.echeance)}</div>
            <span style={{ ...S.badge, color:st.color, background:st.bg }}>{st.label}</span>
          </div>
        </div>

        <div style={S.invClientBox}>
          <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>FACTURER À</div>
          <div style={{ fontWeight:700, color:"#0f172a", fontSize:18 }}>{cl.nom || "—"}</div>
          {[cl.ville, cl.email, cl.tel, cl.rc && `RC: ${cl.rc}`].filter(Boolean).map((v,i) => (
            <div key={i} style={{ color:"#64748b", fontSize:13, marginTop:3 }}>{v}</div>
          ))}
        </div>

        <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:20 }}>
          <thead>
            <tr style={{ background:"#0f172a" }}>
              {["Description","Qté","Prix unitaire (MAD)","Total HT (MAD)"].map(h => (
                <th key={h} style={{ padding:"12px 16px", textAlign:"left", color:"#fff", fontSize:13, fontWeight:600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inv.lignes.map((l, i) => (
              <tr key={i} style={{ background: i%2===0 ? "#fff" : "#f8fafc" }}>
                <td style={{ padding:"11px 16px", fontSize:14, color:"#334155", borderBottom:"1px solid #e2e8f0" }}>{l.desc}</td>
                <td style={{ padding:"11px 16px", fontSize:14, color:"#334155", textAlign:"center", borderBottom:"1px solid #e2e8f0" }}>{l.qte}</td>
                <td style={{ padding:"11px 16px", fontSize:14, color:"#334155", textAlign:"right", borderBottom:"1px solid #e2e8f0" }}>{formatMoney(l.pu)}</td>
                <td style={{ padding:"11px 16px", fontSize:14, color:"#334155", textAlign:"right", fontWeight:600, borderBottom:"1px solid #e2e8f0" }}>{formatMoney(l.qte * l.pu)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, marginBottom:20 }}>
          {[["Total HT", ht], ["TVA (20%)", tva]].map(([k,v]) => (
            <div key={k} style={{ display:"flex", gap:80, color:"#64748b", fontSize:14 }}>
              <span>{k}</span><span>{formatMoney(v)}</span>
            </div>
          ))}
          <div style={{ display:"flex", gap:80, color:"#0f172a", fontSize:20, fontWeight:800, borderTop:"2px solid #0f172a", paddingTop:8, marginTop:4 }}>
            <span>Total TTC</span><span>{formatMoney(ttc)}</span>
          </div>
        </div>

        {inv.notes && <div style={{ background:"#f8fafc", borderRadius:8, padding:"12px 16px", fontSize:13, color:"#64748b", marginBottom:20 }}><strong>Notes :</strong> {inv.notes}</div>}
        <div style={{ textAlign:"center", color:"#94a3b8", fontSize:12, borderTop:"1px solid #e2e8f0", paddingTop:16 }}>
          Merci de votre confiance — Mediterranean Trans Solutions (MTS) · Tanger, Maroc
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
                {formatMoney((Number(l.qte)||0)*(Number(l.pu)||0))}
              </span>
              {form.lignes.length > 1 && <button style={S.iconBtn} onClick={() => setForm(f => ({ ...f, lignes: f.lignes.filter((_,j) => j!==i) }))}>✕</button>}
            </div>
          ))}
          <button style={S.addLineBtn} onClick={() => setForm(f => ({ ...f, lignes: [...f.lignes, { desc:"", qte:1, pu:0 }] }))}>+ Ajouter une ligne</button>
          <div style={{ marginTop:16, borderTop:"2px solid #e2e8f0", paddingTop:12 }}>
            {[["Total HT", ht], ["TVA 20%", ht*0.2]].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", color:"#64748b", fontSize:14, marginBottom:4 }}><span>{k}</span><span>{formatMoney(v)}</span></div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:18, fontWeight:800, color:"#0f172a", borderTop:"2px solid #0f172a", paddingTop:8, marginTop:4 }}>
              <span>Total TTC</span><span>{formatMoney(ht*1.2)}</span>
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
function Clients({ clients, invoices, calcTotal, onNew, onSelect, onEdit, onDelete }) {
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
              <div style={{ display:"flex", gap:4 }}>
                <button style={S.iconBtn} onClick={() => onSelect(c)}>👁️</button>
                <button style={S.iconBtn} onClick={() => onEdit(c)}>✏️</button>
                <button style={S.iconBtn} onClick={() => onDelete(c.id)}>🗑️</button>
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
function ClientDetail({ client, invoices, calcTotal, onEdit, onDelete, onBack }) {
  return (
    <div style={S.page}>
      <div style={S.pageHdr}>
        <button style={S.backBtn} onClick={onBack}>← Retour</button>
        <div style={{ display:"flex", gap:8 }}>
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
                      <td style={{ ...S.td, fontWeight:700 }}>{formatMoney(calcTotal(inv))}</td>
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
                  <td style={{ ...S.td, fontWeight:700, color:"#ef4444" }}>{formatMoney(calcTotal(inv))}</td>
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
