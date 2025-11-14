import * as XLSX from "xlsx";


export async function importExcel(file) {
const buffer = await file.arrayBuffer();
const workbook = XLSX.read(buffer);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const json = XLSX.utils.sheet_to_json(sheet);


return json.map((row) => ({
nome: row.Nome || "",
prezzo_acquisto: row["Prezzo acquisto"] || 0,
prezzo_corrente: row["Prezzo corrente"] || 0,
tipo: row.Tipo || "",
dividendi: row.Dividendi || 0,
prelevato: row.Prelevato || 0,
profitto: row.Profitto || 0,
perc_12m: row["% 12m"] || 0,
rendimento: row["Rendimento %"] || 0,
payback: row.Payback || 0,
portafoglio: row["% Port."] || 0,
score: row.Score || 0,
}));
}


export function exportExcel(data) {
const sheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, sheet, "Portafoglio");
XLSX.writeFile(workbook, "portafoglio.xlsx");
}
