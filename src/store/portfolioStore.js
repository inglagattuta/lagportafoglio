import * as XLSX from "xlsx";
import { usePortfolioStore } from "../store/portfolioStore";
import { useState } from "react";

export default function Portfolio() {
  const { portfolio, setPortfolio } = usePortfolioStore();
  const [error, setError] = useState("");

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        // Salva i dati nello store
        setPortfolio(data);
        setError("");
      } catch (err) {
        setError("Errore durante la lettura del file.");
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Portafoglio</h1>

      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleExcelUpload}
        className="mb-4"
      />

      {error && <p className="text-red-500">{error}</p>}

      {/* Tabella con SOLO i campi richiesti */}
      {portfolio.length > 0 && (
        <table className="min-w-full mt-6 border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Nome</th>
              <th className="p-2 border">Prezzo Acquisto</th>
              <th className="p-2 border">Prezzo Corrente</th>
              <th className="p-2 border">Tipo</th>
              <th className="p-2 border">Dividendi</th>
              <th className="p-2 border">Prelevato</th>
              <th className="p-2 border">Profitto</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map((row, i) => (
              <tr key={i} className="border">
                <td className="p-2 border">{row.Nome}</td>
                <td className="p-2 border">{row.PrezzoAcquisto}</td>
                <td className="p-2 border">{row.PrezzoCorrente}</td>
                <td className="p-2 border">{row.Tipo}</td>
                <td className="p-2 border">{row.Dividendi}</td>
                <td className="p-2 border">{row.Prelevato}</td>
                <td className="p-2 border">{row.Profitto}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
