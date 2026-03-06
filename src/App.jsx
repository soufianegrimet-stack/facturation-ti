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
            <div style={S.invLogo}>TI</div>
            <div style={{ fontWeight:800, fontSize:20, color:"#0f172a" }}>Transport International</div>
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
          Merci de votre confiance — Transport International · RC 123456 · Tanger, Maroc
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
