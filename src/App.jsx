import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Plus, Upload, Edit2, Trash2, Save, X, BarChart3, Download, RefreshCw } from "lucide-react";

// 🔥 Configurazione Firebase
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBhDoRKmRffrjO-WvVjgX3K7JdfPaM7MGk",
  authDomain: "portafoglio-dashboard.firebaseapp.com",
  projectId: "portafoglio-dashboard",
  storageBucket: "portafoglio-dashboard.firebasestorage.app",
  messagingSenderId: "194509041146",
  appId: "1:194509041146:web:c90a9ffd09dd5bcb110843"
};

function App() {
  const [dati, setDati] = useState([]);
  const [nuovoTitolo, setNuovoTitolo] = useState({
    nome: "",
    prezzo_acquisto: "",
    prezzo_corrente: "",
    tipologia: "",
    dividendi: "",
    prelevato: "",
    percentuale_12_mesi: "",
    rendimento_percentuale: "",
    payback: "",
    score: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [loading, setLoading] = useState(true);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [db, setDb] = useState(null);

  // Inizializza Firebase
  useEffect(() => {
    const initFirebase = async () => {
      try {
        // Carica Firebase dinamicamente
        const firebase = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js');
        const firestore = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
        
        const app = firebase.initializeApp(FIREBASE_CONFIG);
        const database = firestore.getFirestore(app);
        
        setDb(database);
        setFirebaseReady(true);
        
        // Carica i dati iniziali
        await fetchData(database, firestore);
      } catch (error) {
        console.error("Errore inizializzazione Firebase:", error);
        alert("Errore di connessione a Firebase. I dati saranno salvati solo localmente.");
        setLoading(false);
      }
    };

    initFirebase();
  }, []);

  const fetchData = async (database, firestoreModule) => {
    try {
      setLoading(true);
      const querySnapshot = await firestoreModule.getDocs(
        firestoreModule.collection(database, "portafoglio")
      );
      
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setDati(data);
    } catch (error) {
      console.error("Errore caricamento dati:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    if (!firebaseReady || !db) return;
    
    try {
      const firestore = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
      await fetchData(db, firestore);
    } catch (error) {
      console.error("Errore refresh dati:", error);
    }
  };

  // Gestione PWA installabile
  useEffect(() => {
    let deferredPrompt;
    const installHandler = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      window.deferredPrompt = deferredPrompt;
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", installHandler);
    return () => window.removeEventListener("beforeinstallprompt", installHandler);
  }, []);

  const handleInstallClick = async () => {
    setShowInstallPrompt(false);
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      const { outcome } = await window.deferredPrompt.userChoice;
      console.log("User install choice:", outcome);
      window.deferredPrompt = null;
    }
  };

  const aggiungiTitolo = async () => {
    if (!nuovoTitolo.nome) return alert("Inserisci almeno il nome del titolo");

    const data = {
      nome: nuovoTitolo.nome,
      prezzo_acquisto: parseFloat(nuovoTitolo.prezzo_acquisto) || 0,
      prezzo_corrente: parseFloat(nuovoTitolo.prezzo_corrente) || 0,
      tipologia: nuovoTitolo.tipologia,
      dividendi: parseFloat(nuovoTitolo.dividendi) || 0,
      prelevato: parseFloat(nuovoTitolo.prelevato) || 0,
      percentuale_12_mesi: parseFloat(nuovoTitolo.percentuale_12_mesi) || 0,
      rendimento_percentuale: parseFloat(nuovoTitolo.rendimento_percentuale) || 0,
      payback: parseFloat(nuovoTitolo.payback) || 0,
      score: parseFloat(nuovoTitolo.score) || 0,
    };

    try {
      if (firebaseReady && db) {
        const firestore = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
        await firestore.addDoc(firestore.collection(db, "portafoglio"), data);
        await fetchData(db, firestore);
      } else {
        // Fallback locale
        const newItem = { ...data, id: Date.now().toString() };
        setDati([...dati, newItem]);
      }

      setNuovoTitolo({
        nome: "",
        prezzo_acquisto: "",
        prezzo_corrente: "",
        tipologia: "",
        dividendi: "",
        prelevato: "",
        percentuale_12_mesi: "",
        rendimento_percentuale: "",
        payback: "",
        score: "",
      });
      setShowForm(false);
    } catch (error) {
      console.error("Errore aggiunta titolo:", error);
      alert("Errore durante l'aggiunta del titolo");
    }
  };

  const eliminaTitolo = async (id) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo titolo?")) return;

    try {
      if (firebaseReady && db) {
        const firestore = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
        await firestore.deleteDoc(firestore.doc(db, "portafoglio", id));
        await fetchData(db, firestore);
      } else {
        setDati(dati.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error("Errore eliminazione titolo:", error);
      alert("Errore durante l'eliminazione del titolo");
    }
  };

  const salvaModifica = async (id) => {
    const updatedData = {
      nome: editingData.nome,
      prezzo_acquisto: parseFloat(editingData.prezzo_acquisto) || 0,
      prezzo_corrente: parseFloat(editingData.prezzo_corrente) || 0,
      tipologia: editingData.tipologia,
      dividendi: parseFloat(editingData.dividendi) || 0,
      prelevato: parseFloat(editingData.prelevato) || 0,
      percentuale_12_mesi: parseFloat(editingData.percentuale_12_mesi) || 0,
      rendimento_percentuale: parseFloat(editingData.rendimento_percentuale) || 0,
      payback: parseFloat(editingData.payback) || 0,
      score: parseFloat(editingData.score) || 0,
    };

    try {
      if (firebaseReady && db) {
        const firestore = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
        await firestore.updateDoc(firestore.doc(db, "portafoglio", id), updatedData);
        await fetchData(db, firestore);
      } else {
        setDati(dati.map(item => item.id === id ? { ...updatedData, id } : item));
      }

      setEditingId(null);
      setEditingData({});
    } catch (error) {
      console.error("Errore salvataggio modifica:", error);
      alert("Errore durante il salvataggio della modifica");
    }
  };

  const ordinaColonna = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    const sortedData = [...dati].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setDati(sortedData);
  };

  const totaleAcquisto = dati.reduce((sum, item) => sum + (item.prezzo_acquisto || 0), 0);
  const totaleCorrente = dati.reduce((sum, item) => sum + (item.prezzo_corrente || 0), 0);
  const totaleDividendi = dati.reduce((sum, item) => sum + (item.dividendi || 0), 0);
  const totalePrelevato = dati.reduce((sum, item) => sum + (item.prelevato || 0), 0);
  const profittoTotale = totaleCorrente - totaleAcquisto + totaleDividendi + totalePrelevato;
  const rendimentoPercentuale = totaleAcquisto > 0 ? ((profittoTotale / totaleAcquisto) * 100) : 0;

  const importaDaJSON = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        if (!Array.isArray(jsonData)) {
          alert("Formato JSON non valido. Deve essere un array.");
          return;
        }

        if (firebaseReady && db) {
          const firestore = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
          
          for (const item of jsonData) {
            const data = {
              nome: item.nome,
              prezzo_acquisto: parseFloat(item.prezzo_acquisto) || 0,
              prezzo_corrente: parseFloat(item.prezzo_corrente) || 0,
              tipologia: item.tipologia || "",
              dividendi: parseFloat(item.dividendi) || 0,
              prelevato: parseFloat(item.prelevato) || 0,
              percentuale_12_mesi: parseFloat(item.percentuale_12_mesi) || 0,
              rendimento_percentuale: parseFloat(item.rendimento_percentuale) || 0,
              payback: parseFloat(item.payback) || 0,
              score: parseFloat(item.score) || 0,
            };
            
            await firestore.addDoc(firestore.collection(db, "portafoglio"), data);
          }
          
          await fetchData(db, firestore);
        } else {
          const importedData = jsonData.map(item => ({
            ...item,
            id: Date.now().toString() + Math.random(),
          }));
          setDati([...dati, ...importedData]);
        }
        
        alert("Importazione completata!");
      } catch (error) {
        console.error("Errore importazione:", error);
        alert("Errore durante l'importazione. Verifica il formato del file.");
      }
    };
    reader.readAsText(file);
  };

  const esportaJSON = () => {
    const dataStr = JSON.stringify(dati, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `portafoglio_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}>
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "40px",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
        }}>
          <RefreshCw size={48} style={{ color: "#667eea", animation: "spin 1s linear infinite" }} />
          <h2 style={{ margin: "20px 0 10px 0", color: "#1f2937" }}>Caricamento...</h2>
          <p style={{ margin: 0, color: "#6b7280" }}>Connessione a Firebase in corso</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      {/* PWA Install Banner */}
      {showInstallPrompt && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            padding: "16px 24px",
            borderRadius: "16px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            cursor: "pointer",
            zIndex: 1000,
            maxWidth: "90%",
            textAlign: "center",
            fontSize: "14px",
            fontWeight: "600"
          }}
          onClick={handleInstallClick}
        >
          📲 Installa l'app per un accesso rapido
        </div>
      )}

      {/* Header */}
      <div style={{
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: "24px",
        padding: "32px",
        marginBottom: "24px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ 
              margin: "0 0 8px 0",
              fontSize: "36px",
              fontWeight: "700",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap"
            }}>
              <BarChart3 size={40} />
              Portfolio Dashboard
            </h1>
            <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
              Gestisci il tuo portafoglio investimenti
            </p>
          </div>
          
          {firebaseReady && (
            <button
              onClick={refreshData}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)"
              }}
            >
              <RefreshCw size={18} />
              Aggiorna
            </button>
          )}
        </div>
        
        {firebaseReady && (
          <div style={{
            marginTop: "12px",
            padding: "8px 12px",
            background: "#dcfce7",
            color: "#166534",
            borderRadius: "8px",
            fontSize: "13px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <span style={{ fontSize: "16px" }}>✓</span>
            <span>Connesso a Firebase</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "20px",
        marginBottom: "24px"
      }}>
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          padding: "24px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
        }}>
          <div style={{ color: "#6b7280", fontSize: "14px", marginBottom: "8px" }}>Investimento Totale</div>
          <div style={{ fontSize: "32px", fontWeight: "700", color: "#1f2937" }}>
            €{totaleAcquisto.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          padding: "24px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
        }}>
          <div style={{ color: "#6b7280", fontSize: "14px", marginBottom: "8px" }}>Valore Corrente</div>
          <div style={{ fontSize: "32px", fontWeight: "700", color: "#1f2937" }}>
            €{totaleCorrente.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div style={{
          background: profittoTotale >= 0 
            ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
            : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          borderRadius: "20px",
          padding: "24px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          color: "white"
        }}>
          <div style={{ fontSize: "14px", marginBottom: "8px", opacity: 0.9, display: "flex", alignItems: "center", gap: "8px" }}>
            {profittoTotale >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            Profitto Totale
          </div>
          <div style={{ fontSize: "32px", fontWeight: "700" }}>
            €{profittoTotale.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "14px", marginTop: "8px", opacity: 0.9 }}>
            {rendimentoPercentuale >= 0 ? '+' : ''}{rendimentoPercentuale.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: "20px",
        padding: "24px",
        marginBottom: "24px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        display: "flex",
        gap: "12px",
        flexWrap: "wrap"
      }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "transform 0.2s, box-shadow 0.2s",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.6)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
          }}
        >
          <Plus size={18} />
          {showForm ? "Chiudi Form" : "Nuovo Titolo"}
        </button>

        <label style={{
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white",
          border: "none",
          padding: "12px 24px",
          borderRadius: "12px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "transform 0.2s",
          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)"
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
        onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          <Upload size={18} />
          Importa JSON
          <input
            type="file"
            accept=".json"
            onChange={importaDaJSON}
            style={{ display: "none" }}
          />
        </label>

        <button
          onClick={esportaJSON}
          disabled={dati.length === 0}
          style={{
            background: dati.length === 0 ? "#9ca3af" : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "12px",
            cursor: dati.length === 0 ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "transform 0.2s",
            boxShadow: dati.length === 0 ? "none" : "0 4px 12px rgba(245, 158, 11, 0.4)",
            opacity: dati.length === 0 ? 0.6 : 1
          }}
          onMouseOver={(e) => dati.length > 0 && (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseOut={(e) => dati.length > 0 && (e.currentTarget.style.transform = "translateY(0)")}
        >
          <Download size={18} />
          Esporta JSON
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          padding: "24px",
          marginBottom: "24px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
        }}>
          <h3 style={{ marginTop: 0, color: "#1f2937", marginBottom: "20px" }}>Aggiungi Nuovo Titolo</h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
            marginBottom: "16px"
          }}>
            {Object.keys(nuovoTitolo).map((campo) => (
              <input
                key={campo}
                placeholder={campo.replace(/_/g, ' ').toUpperCase()}
                value={nuovoTitolo[campo]}
                onChange={(e) =>
                  setNuovoTitolo({ ...nuovoTitolo, [campo]: e.target.value })
                }
                style={{
                  padding: "12px 16px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "12px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#667eea"}
                onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
              />
            ))}
          </div>
          <button
            onClick={aggiungiTitolo}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              padding: "14px",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            <Plus size={20} />
            Aggiungi Titolo
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: "20px",
        padding: "24px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        overflowX: "auto"
      }}>
        {dati.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#6b7280" }}>
            <BarChart3 size={64} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
            <h3 style={{ margin: "0 0 8px 0", color: "#1f2937" }}>Nessun titolo nel portafoglio</h3>
            <p style={{ margin: 0, fontSize: "14px" }}>Aggiungi il tuo primo titolo o importa dati esistenti</p>
          </div>
        ) : (
          <table style={{
            borderCollapse: "collapse",
            width: "100%",
            minWidth: "1000px"
          }}>
            <thead>
              <tr style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white"
              }}>
                {[
                  { label: "Nome", key: "nome" },
                  { label: "P. Acquisto", key: "prezzo_acquisto" },
                  { label: "P. Corrente", key: "prezzo_corrente" },
                  { label: "Tipo", key: "tipologia" },
                  { label: "Dividendi", key: "dividendi" },
                  { label: "Prelevato", key: "prelevato" },
                  { label: "% 12m", key: "percentuale_12_mesi" },
                  { label: "Rend.%", key: "rendimento_percentuale" },
                  { label: "Payback", key: "payback" },
                  { label: "% Port.", key: "percentuale_portafoglio" },
                  { label: "Score", key: "score" },
                  { label: "Profitto", key: "profitto" },
                  { label: "Azioni", key: "actions" }
                ].map((col, idx) => (
                  <th
                    key={idx}
                    onClick={() => col.key !== "actions" && ordinaColonna(col.key)}
                    style={{
                      padding: "16px 12px",
                      textAlign: "center",
                      cursor: col.key !== "actions" ? "pointer" : "default",
                      fontSize: "13px",
                      fontWeight: "600",
                      borderBottom: "none",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {col.label}{" "}
                    {sortConfig.key === col.key && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dati.map((item, index) => {
                const profitto = item.prezzo_corrente - item.prezzo_acquisto + item.dividendi + item.prelevato;
                const percPortafoglio = totaleAcquisto > 0 ? ((item.prezzo_acquisto / totaleAcquisto) * 100).toFixed(2) : 0;
                const isEditing = editingId === item.id;

                return (
                  <tr
                    key={item.id}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#f9fafb" : "white",
                      borderBottom: "1px solid #e5e7eb",
                      transition: "background-color 0.2s"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#f9fafb" : "white"}
                  >
                    <td style={{ padding: "16px 12px", textAlign: "center", fontWeight: "600", color: "#1f2937" }}>
                      {isEditing ? (
                        <input
                          value={editingData.nome}
                          onChange={(e) => setEditingData({ ...editingData, nome: e.target.value })}
                          style={{ width: "120px", padding: "6px", borderRadius: "6px", border: "1px solid #d1d5db", textAlign: "center" }}
                        />
                      ) : (
                        item.nome
                      )}
                    </td>
                    <td style={{ padding: "16px 12px", textAlign: "center", fontSize: "14px" }}>
                      {isEditing ? (
                        <input
                          value={editingData.prezzo_acquisto}
                          onChange={(e) => setEditingData({ ...editingData, prezzo_acquisto: e.target.value })}
                          style={{ width: "90px", padding: "6px", borderRadius: "6px", border: "1px solid #d1d5db", textAlign: "center" }}
                        />
                      ) : (
                        `€${item.prezzo_acquisto.toFixed(2)}`
                      )}
                    </td>
                    <td style={{ padding: "16px 12px", textAlign: "center", fontSize: "14px" }}>
                      {isEditing ? (
                        <input
                          value={editingData.prezzo_corrente}
                          onChange={(e) => setEditingData({ ...editingData, prezzo_corrente: e.target.value })}
                          style={{ width: "90px", padding: "6px", borderRadius: "6px", border: "1px solid #d1d5db", textAlign: "center" }}
                        />
                      ) : (
                        `€${item.prezzo_corrente.toFixed(2)}`
                      )}
                    </td>
                    <td style={{ padding: "16px 12px", textAlign: "center", fontSize: "13px", color: "#6b7280" }}>
                      {isEditing ? (
                        <input
                          value={editingData.tipologia}
                          onChange={(e) => setEditingData({ ...editingData, tipologia: e.target.value })}
                          style={{ width: "80px", padding: "6px", borderRadius: "6px", border: "1px solid #d1d5db", textAlign: "center" }}
                        />
                      ) : (
                        item.tipologia
                      )}
                    </td>
                    <td style={{ padding: "16px 12px", textAlign: "center", fontSize: "14px" }}>
                      {isEditing ? (
                        <input
                          value={editingData.dividendi}
                          onChange={(e) => setEditingData({ ...editingData, dividendi: e.target.value })}
                          style={{ width: "80px", padding: "6px", borderRadius: "6px", border: "1px solid #d1d5db", textAlign: "center" }}
                        />
                      ) : (
                        `€${item.dividendi.toFixed(2)}`
                      )}
                    </td>
                    <td style={{ padding: "16px 12px", textAlign: "center", fontSize: "14px" }}>
                      {isEditing ? (
                        <input
                          value={editingData.prelevato}
                          onChange={(e) => setEditingData({ ...editingData, prelevato: e.target.value })}
                          style={{ width: "80px", padding: "6px", borderRadius: "6px", border: "1px solid #d1d5db", textAlign: "center" }}
                        />
                      ) : (
                        `€${item.prelevato.toFixed(2)}`
                      )}
                    </td>
                    <td style={{ padding: "16px 12px", textAlign: "center", fontSize: "14px" }}>
                      {isEditing ? (
                        <input
                          value={editingData.percentuale_12_mesi}
                          onChange={(e) => setEditingData({ ...editingData, percentuale_12_mesi: e.target.value })}
                          style={{ width: "70px", padding: "6px", borderRadius: "6px", border: "1px solid #d1d5db", textAlign: "center" }}
                        />
                      ) : (
                        <span style={{ 
                          color: item.percentuale_12_mesi >= 0 ? "#10b981" : "#ef4444",
                          fontWeight: "600"
                        }}>
                          {(item.percentuale_12_mesi * 100).toFixed(2)}%
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "16px 12px", textAlign: "center", fontSize: "14px" }}>
                      {isEditing ? (
                        <input
                          value={editingData.rendimento_percentuale}
                          onChange={(e) => setEditingData({ ...editingData, rendimento_percentuale: e.target.value })}
                          style={{ width: "70px", padding: "6px", borderRadius: "6px", border: "1px solid #d1d5db", textAlign: "center" }}
                        />
                      ) : (
                        <span style={{ 
                          color: item.rendimento_percentuale >= 0 ? "#10b981" : "#ef4444",
                          fontWeight: "600"
                        }}>
                          {(item.rendimento_percentuale * 100).toFixed(2)}%
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "16px 12px", textAlign: "center", fontSize: "14px" }}>
                      {isEditing ? (
                        <input
                          value={editingData.payback}
                          onChange={(e) => setEditingData({ ...editingData, payback: e.target.value })}
                          style={{ width: "70px", padding: "6px", borderRadius: "6px", border: "1px solid #d1d5db", textAlign: "center" }}
                        />
                      ) : (
                        `${(item.payback * 100).toFixed(2)}%`
                      )}
                    </td>
                    <td style={{ padding: "16px 12px", textAlign: "center", fontSize: "14px", color: "#6b7280" }}>
                      {percPortafoglio}%
                    </td>
                    <td style={{ padding: "16px 12px", textAlign: "center", fontSize: "14px" }}>
                      {isEditing ? (
                        <input
                          value={editingData.score}
                          onChange={(e) => setEditingData({ ...editingData, score: e.target.value })}
                          style={{ width: "60px", padding: "6px", borderRadius: "6px", border: "1px solid #d1d5db", textAlign: "center" }}
                        />
                      ) : (
                        <span style={{
                          background: item.score >= 7 ? "#dcfce7" : item.score >= 5 ? "#fef3c7" : "#fee2e2",
                          color: item.score >= 7 ? "#166534" : item.score >= 5 ? "#92400e" : "#991b1b",
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontWeight: "600",
                          fontSize: "13px"
                        }}>
                          {item.score.toFixed(1)}
                        </span>
                      )}
                    </td>
                    <td style={{ 
                      padding: "16px 12px",
                      textAlign: "center",
                      fontSize: "16px",
                      fontWeight: "700",
                      color: profitto >= 0 ? "#10b981" : "#ef4444"
                    }}>
                      {profitto >= 0 ? '+' : ''}€{profitto.toFixed(2)}
                    </td>
                    <td style={{ padding: "16px 12px", textAlign: "center" }}>
                      {isEditing ? (
                        <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
                          <button
                            onClick={() => salvaModifica(item.id)}
                            style={{
                              background: "#10b981",
                              color: "white",
                              border: "none",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "13px",
                              fontWeight: "600"
                            }}
                          >
                            <Save size={16} />
                            Salva
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditingData({});
                            }}
                            style={{
                              background: "#6b7280",
                              color: "white",
                              border: "none",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "13px",
                              fontWeight: "600"
                            }}
                          >
                            <X size={16} />
                            Annulla
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
                          <button
                            onClick={() => {
                              setEditingId(item.id);
                              setEditingData(item);
                            }}
                            style={{
                              background: "#3b82f6",
                              color: "white",
                              border: "none",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "13px",
                              fontWeight: "600",
                              transition: "background 0.2s"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = "#2563eb"}
                            onMouseOut={(e) => e.currentTarget.style.background = "#3b82f6"}
                          >
                            <Edit2 size={16} />
                            Modifica
                          </button>
                          <button
                            onClick={() => eliminaTitolo(item.id)}
                            style={{
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "13px",
                              fontWeight: "600",
                              transition: "background 0.2s"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = "#dc2626"}
                            onMouseOut={(e) => e.currentTarget.style.background = "#ef4444"}
                          >
                            <Trash2 size={16} />
                            Elimina
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Info */}
      <div style={{
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: "20px",
        padding: "20px",
        marginTop: "24px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        textAlign: "center",
        color: "#6b7280",
        fontSize: "13px"
      }}>
        <p style={{ margin: "0 0 8px 0" }}>
          {firebaseReady ? (
            <>
              🔥 <strong>Firebase attivo:</strong> I dati sono sincronizzati nel cloud
            </>
          ) : (
            <>
              💡 <strong>Modalità offline:</strong> I dati sono salvati solo localmente
            </>
          )}
        </p>
        <p style={{ margin: 0 }}>
          Esporta regolarmente i tuoi dati in formato JSON per avere un backup
        </p>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;
