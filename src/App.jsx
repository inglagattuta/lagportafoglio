/*
  App.jsx
  React + Vite single-file app for:
  - Portafoglio (nome, prezzo acquisto, prezzo corrente, tipo, dividendi, prelevato, profitto)
  - Score (nome, %12m, rend.%, payback, % port., score)
  - Grafici (Bar chart top 10 by prezzo_acquisto)

  NOTE (setup):
  - Create project with: `npm create vite@latest my-portfolio -- --template react`
  - Install deps: `npm i firebase recharts xlsx lucide-react`
  - Add PWA files in /public (manifest.json, icons) and a service worker using Workbox or vite-plugin-pwa
  - Firebase: enable Firestore and set rules as needed

  This file is a self-contained example. Move firebase config to a separate file in production.
*/

import React, { useEffect, useMemo, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Plus, Upload, Edit2, Trash2, Save, X, BarChart3, Download, RefreshCw } from "lucide-react";

// ---------- FIREBASE CONFIG (move to firebase.js in production) ----------
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBhDoRKmRffrjO-WvVjgX3K7JdfPaM7MGk",
  authDomain: "portafoglio-dashboard.firebaseapp.com",
  projectId: "portafoglio-dashboard",
  storageBucket: "portafoglio-dashboard.firebasestorage.app",
  messagingSenderId: "194509041146",
  appId: "1:194509041146:web:c90a9ffd09dd5bcb110843"
};

let firebaseApp;
let firestoreDb;

try {
  firebaseApp = initializeApp(FIREBASE_CONFIG);
  firestoreDb = getFirestore(firebaseApp);
} catch (e) {
  console.warn("Firebase init failed or running in non-browser environment", e);
}

// ---------- UTIL ----------
const currency = (v) => `€${(Number(v) || 0).toFixed(2)}`;

// Normalizza campi per lettura Excel
const normalizeKey = (k) => k.toString().trim().toLowerCase().replace(/\s+/g, "_");

export default function App() {
  const [dati, setDati] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firebaseReady, setFirebaseReady] = useState(Boolean(firestoreDb));
  const [section, setSection] = useState("portafoglio"); // 'portafoglio' | 'score' | 'grafici'
  const [showForm, setShowForm] = useState(false);
  const [nuovo, setNuovo] = useState({
    nome: "",
    prezzo_acquisto: "",
    prezzo_corrente: "",
    tipologia: "",
    dividendi: "",
    prelevato: "",
    percentuale_12_mesi: "",
    rendimento_percentuale: "",
    payback: "",
    score: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});

  // Fetch iniziale
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      if (firebaseReady && firestoreDb) {
        try {
          const snap = await getDocs(collection(firestoreDb, "portafoglio"));
          const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          if (mounted) setDati(arr);
        } catch (e) {
          console.error("Errore fetch Firestore", e);
        }
      } else {
        // nessun DB: rimani solo locale
        // possibile caricare da localStorage
        const local = localStorage.getItem("portafoglio_dati");
        if (local) setDati(JSON.parse(local));
      }
      setLoading(false);
    };
    load();
    return () => (mounted = false);
  }, [firebaseReady]);

  // Persist locale quando non connessi
  useEffect(() => {
    if (!firebaseReady) {
      localStorage.setItem("portafoglio_dati", JSON.stringify(dati));
    }
  }, [dati, firebaseReady]);

  // Totali
  const totaleAcquisto = useMemo(() => dati.reduce((s, i) => s + (Number(i.prezzo_acquisto) || 0), 0), [dati]);
  const totaleCorrente = useMemo(() => dati.reduce((s, i) => s + (Number(i.prezzo_corrente) || 0), 0), [dati]);
  const totaleDividendi = useMemo(() => dati.reduce((s, i) => s + (Number(i.dividendi) || 0), 0), [dati]);
  const totalePrelevato = useMemo(() => dati.reduce((s, i) => s + (Number(i.prelevato) || 0), 0), [dati]);
  const profittoTotale = totaleCorrente - totaleAcquisto + totaleDividendi + totalePrelevato;
  const rendimentoPercentuale = totaleAcquisto > 0 ? (profittoTotale / totaleAcquisto) * 100 : 0;

  // CRUD semplificato
  const addLocalOrRemote = async (data) => {
    if (firebaseReady && firestoreDb) {
      await addDoc(collection(firestoreDb, "portafoglio"), data);
      const snap = await getDocs(collection(firestoreDb, "portafoglio"));
      setDati(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } else {
      const newItem = { ...data, id: Date.now().toString() };
      setDati(prev => [...prev, newItem]);
    }
  };

  const updateLocalOrRemote = async (id, data) => {
    if (firebaseReady && firestoreDb) {
      await updateDoc(doc(firestoreDb, "portafoglio", id), data);
      const snap = await getDocs(collection(firestoreDb, "portafoglio"));
      setDati(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } else {
      setDati(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    }
  };

  const deleteLocalOrRemote = async (id) => {
    if (!window.confirm("Sei sicuro di eliminare questo titolo?")) return;
    if (firebaseReady && firestoreDb) {
      await deleteDoc(doc(firestoreDb, "portafoglio", id));
      const snap = await getDocs(collection(firestoreDb, "portafoglio"));
      setDati(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } else {
      setDati(prev => prev.filter(p => p.id !== id));
    }
  };

  // Import Excel con sovrascrittura automatica (no confirm)
  const importaDaExcel = async (file) => {
    if (!file) return;
    try {
      const XLSX = await import('xlsx');
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      // se Firebase pronto -> leggi esistenti
      let existing = [];
      if (firebaseReady && firestoreDb) {
        const snap = await getDocs(collection(firestoreDb, "portafoglio"));
        existing = snap.docs.map(d => ({ id: d.id, nome: (d.data().nome || "").trim().toLowerCase() }));
      } else {
        existing = dati.map(d => ({ id: d.id, nome: (d.nome || "").trim().toLowerCase() }));
      }

      for (const row of json) {
        // normalizzo colonne
        const norm = {};
        for (const k in row) norm[normalizeKey(k)] = row[k];

        const item = {
          nome: (norm.nome || "").toString().trim(),
          prezzo_acquisto: Number(norm.prezzo_acquisto) || 0,
          prezzo_corrente: Number(norm.prezzo_corrente) || 0,
          tipologia: norm.tipologia || "",
          dividendi: Number(norm.dividendi) || 0,
          prelevato: Number(norm.prelevato) || 0,
          percentuale_12_mesi: Number(norm.percentuale_12_mesi) || 0,
          rendimento_percentuale: Number(norm.rendimento_percentuale) || 0,
          payback: Number(norm.payback) || 0,
          score: Number(norm.score) || 0
        };

        const dup = existing.find(e => e.nome === (item.nome || "").trim().toLowerCase());
        if (dup) {
          // sovrascrivo
          if (firebaseReady && firestoreDb) {
            await updateDoc(doc(firestoreDb, "portafoglio", dup.id), item);
          } else {
            await updateLocalOrRemote(dup.id, item);
          }
        } else {
          if (firebaseReady && firestoreDb) {
            await addDoc(collection(firestoreDb, "portafoglio"), item);
          } else {
            await addLocalOrRemote(item);
          }
        }
      }

      // ricarica se remote
      if (firebaseReady && firestoreDb) {
        const snap = await getDocs(collection(firestoreDb, "portafoglio"));
        setDati(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }

      alert("Importazione completata con sovrascrittura automatica.");
    } catch (e) {
      console.error(e);
      alert("Errore importazione Excel");
    }
  };

  // Export Excel (xlsx)
  const esportaExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const dataForExport = dati.map(i => ({
        nome: i.nome,
        prezzo_acquisto: i.prezzo_acquisto,
        prezzo_corrente: i.prezzo_corrente,
        tipologia: i.tipologia,
        dividendi: i.dividendi,
        prelevato: i.prelevato,
        percentuale_12_mesi: i.percentuale_12_mesi,
        rendimento_percentuale: i.rendimento_percentuale,
        payback: i.payback,
        score: i.score
      }));
      const ws = XLSX.utils.json_to_sheet(dataForExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Portafoglio');
      XLSX.writeFile(wb, `portafoglio_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (e) {
      console.error(e);
      alert('Errore esportazione Excel');
    }
  };

  // Export JSON
  const esportaJSON = () => {
    const blob = new Blob([JSON.stringify(dati, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portafoglio_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Grafico top10 per prezzo_acquisto
  const top10ByAcquisto = useMemo(() => [...dati].sort((a, b) => (b.prezzo_acquisto || 0) - (a.prezzo_acquisto || 0)).slice(0, 10).map(d => ({ name: d.nome, value: Number(d.prezzo_acquisto) || 0 })), [dati]);

  // UI small helpers
  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) importaDaExcel(file);
    e.target.value = null;
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <RefreshCw size={48} />
        <div>Caricamento...</div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: 16, fontFamily: 'Inter, system-ui, Arial' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <BarChart3 size={36} />
          <div>
            <h1 style={{ margin: 0 }}>Portfolio Dashboard</h1>
            <small style={{ color: '#666' }}>React + Vite • PWA ready</small>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setSection('portafoglio')} style={section === 'portafoglio' ? { fontWeight: 700 } : {}}>Portafoglio</button>
          <button onClick={() => setSection('score')} style={section === 'score' ? { fontWeight: 700 } : {}}>Score</button>
          <button onClick={() => setSection('grafici')} style={section === 'grafici' ? { fontWeight: 700 } : {}}>Grafici</button>
        </nav>
      </header>

      <div style={{ display: section === 'grafici' ? 'block' : 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        {/* STAT CARDS */}
        <div style={{ background: '#fff', padding: 12, borderRadius: 12, boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 12, color: '#666' }}>Investimento Totale</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{currency(totaleAcquisto)}</div>
        </div>
        <div style={{ background: '#fff', padding: 12, borderRadius: 12, boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 12, color: '#666' }}>Valore Corrente</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{currency(totaleCorrente)}</div>
        </div>
        <div style={{ background: profittoTotale >= 0 ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', padding: 12, borderRadius: 12 }}>
          <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>{profittoTotale >= 0 ? <TrendingUp /> : <TrendingDown />} Profitto</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{currency(profittoTotale)}</div>
          <div style={{ fontSize: 12 }}>{(rendimentoPercentuale >= 0 ? '+' : '') + rendimentoPercentuale.toFixed(2) + '%'}</div>
        </div>
      </div>

      {/* ACTIONS */}
      <div style={{ background: '#fff', padding: 12, borderRadius: 12, marginTop: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => setShowForm(s => !s)} style={{ padding: '8px 12px' }}><Plus size={16} /> {showForm ? 'Chiudi' : 'Nuovo'}</button>

        <label style={{ padding: '8px 12px', background: '#06b6d4', color: '#fff', borderRadius: 8, cursor: 'pointer' }}>
          <Upload size={14} /> Importa Excel
          <input type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) importaDaExcel(f); e.target.value = null; }} />
        </label>

        <button onClick={esportaExcel} style={{ padding: '8px 12px' }}><Download size={14} /> Esporta Excel</button>
        <button onClick={esportaJSON} style={{ padding: '8px 12px' }}><Download size={14} /> Esporta JSON</button>
      </div>

      {/* FORM - Add */}
      {showForm && (
        <div style={{ background: '#fff', padding: 12, borderRadius: 12, marginTop: 12 }}>
          <h3>Aggiungi titolo</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 8 }}>
            {Object.keys(nuovo).map(k => (
              <input key={k} placeholder={k.replace(/_/g,' ')} value={nuovo[k]} onChange={(e) => setNuovo(prev => ({ ...prev, [k]: e.target.value }))} />
            ))}
          </div>
          <div style={{ marginTop: 8 }}>
            <button onClick={async () => { if (!nuovo.nome) return alert('Nome obbligatorio'); const data = { ...nuovo, prezzo_acquisto: Number(nuovo.prezzo_acquisto) || 0, prezzo_corrente: Number(nuovo.prezzo_corrente) || 0, dividendi: Number(nuovo.dividendi) || 0, prelevato: Number(nuovo.prelevato) || 0, percentuale_12_mesi: Number(nuovo.percentuale_12_mesi) || 0, rendimento_percentuale: Number(nuovo.rendimento_percentuale) || 0, payback: Number(nuovo.payback) || 0, score: Number(nuovo.score) || 0 }; await addLocalOrRemote(data); setNuovo({ nome: '', prezzo_acquisto: '', prezzo_corrente: '', tipologia: '', dividendi: '', prelevato: '', percentuale_12_mesi: '', rendimento_percentuale: '', payback: '', score: '' }); setShowForm(false); }}>Aggiungi</button>
          </div>
        </div>
      )}

      {/* SEZIONE: PORTAFOGLIO */}
      {section === 'portafoglio' && (
        <div style={{ marginTop: 12, background: '#fff', padding: 12, borderRadius: 12 }}>
          <h2>Portafoglio</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0ea5b' }}>
                  <th>Nome</th>
                  <th>Prezzo Acquisto</th>
                  <th>Prezzo Corrente</th>
                  <th>Tipo</th>
                  <th>Dividendi</th>
                  <th>Prelevato</th>
                  <th>Profitto</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {dati.map(item => {
                  const profitto = (Number(item.prezzo_corrente) || 0) - (Number(item.prezzo_acquisto) || 0) + (Number(item.dividendi) || 0) + (Number(item.prelevato) || 0);
                  return (
                    <tr key={item.id}>
                      <td>{item.nome}</td>
                      <td style={{ textAlign: 'right' }}>{currency(item.prezzo_acquisto)}</td>
                      <td style={{ textAlign: 'right' }}>{currency(item.prezzo_corrente)}</td>
                      <td style={{ textAlign: 'center' }}>{item.tipologia}</td>
                      <td style={{ textAlign: 'right' }}>{currency(item.dividendi)}</td>
                      <td style={{ textAlign: 'right' }}>{currency(item.prelevato)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: profitto >= 0 ? '#10b981' : '#ef4444' }}>{(profitto >= 0 ? '+' : '') + '€' + profitto.toFixed(2)}</td>
                      <td>
                        <button onClick={() => { setEditingId(item.id); setEditingData(item); }}>Modifica</button>
                        <button onClick={() => deleteLocalOrRemote(item.id)}>Elimina</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Editing modal (inline simple) */}
            {editingId && (
              <div style={{ marginTop: 12, background: '#f3f4f6', padding: 12, borderRadius: 8 }}>
                <h4>Modifica {editingData.nome}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 8 }}>
                  {['nome','prezzo_acquisto','prezzo_corrente','tipologia','dividendi','prelevato','percentuale_12_mesi','rendimento_percentuale','payback','score'].map(k => (
                    <input key={k} value={editingData[k] ?? ''} onChange={(e) => setEditingData(prev => ({ ...prev, [k]: e.target.value }))} />
                  ))}
                </div>
                <div style={{ marginTop: 8 }}>
                  <button onClick={async () => { const id = editingId; const toSave = { ...editingData, prezzo_acquisto: Number(editingData.prezzo_acquisto) || 0, prezzo_corrente: Number(editingData.prezzo_corrente) || 0, dividendi: Number(editingData.dividendi) || 0, prelevato: Number(editingData.prelevato) || 0, percentuale_12_mesi: Number(editingData.percentuale_12_mesi) || 0, rendimento_percentuale: Number(editingData.rendimento_percentuale) || 0, payback: Number(editingData.payback) || 0, score: Number(editingData.score) || 0 }; await updateLocalOrRemote(id, toSave); setEditingId(null); setEditingData({}); }}>Salva</button>
                  <button onClick={() => { setEditingId(null); setEditingData({}); }}>Annulla</button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* SEZIONE: SCORE */}
      {section === 'score' && (
        <div style={{ marginTop: 12, background: '#fff', padding: 12, borderRadius: 12 }}>
          <h2>Score</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>% 12m</th>
                  <th>Rend.%</th>
                  <th>Payback</th>
                  <th>% Port.</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {dati.map(item => {
                  const percPort = totaleAcquisto > 0 ? ((Number(item.prezzo_acquisto) || 0) / totaleAcquisto) * 100 : 0;
                  return (
                    <tr key={item.id}>
                      <td>{item.nome}</td>
                      <td style={{ textAlign: 'right' }}>{((Number(item.percentuale_12_mesi) || 0) * 100).toFixed(2)}%</td>
                      <td style={{ textAlign: 'right' }}>{((Number(item.rendimento_percentuale) || 0) * 100).toFixed(2)}%</td>
                      <td style={{ textAlign: 'right' }}>{((Number(item.payback) || 0) * 100).toFixed(2)}%</td>
                      <td style={{ textAlign: 'right' }}>{percPort.toFixed(2)}%</td>
                      <td style={{ textAlign: 'right' }}>{Number(item.score || 0).toFixed(1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SEZIONE: GRAFICI */}
      {section === 'grafici' && (
        <div style={{ marginTop: 12, background: '#fff', padding: 12, borderRadius: 12 }}>
          <h2>Grafici - Top 10 per Prezzo Acquisto</h2>
          <div style={{ width: '100%', height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top10ByAcquisto} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <footer style={{ marginTop: 16, color: '#666' }}>
        {firebaseReady ? 'Connesso a Firebase' : 'Modalità offline - i dati sono locali'}
      </footer>

    </div>
  );
}
