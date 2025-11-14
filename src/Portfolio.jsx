import { useState } from "react";
import { importExcel, exportExcel } from "../services/excel";


export default function Portfolio() {
const [data, setData] = useState([]);


const handleImport = async (e) => {
const file = e.target.files[0];
const imported = await importExcel(file);
setData(imported);
};


return (
<div>
<h1>Portafoglio</h1>
<input type="file" onChange={handleImport} />
<button onClick={() => exportExcel(data)}>Esporta Excel</button>


<table border="1" cellPadding="6" style={{ marginTop: 20 }}>
<thead>
<tr>
<th>Nome</th>
<th>Prezzo acquisto</th>
<th>Prezzo corrente</th>
<th>Tipo</th>
<th>Dividendi</th>
<th>Prelevato</th>
<th>Profitto</th>
</tr>
</thead>
<tbody>
{data.map((row, i) => (
<tr key={i}>
<td>{row.nome}</td>
<td>{row.prezzo_acquisto}</td>
<td>{row.prezzo_corrente}</td>
<td>{row.tipo}</td>
<td>{row.dividendi}</td>
<td>{row.prelevato}</td>
<td>{row.profitto}</td>
</tr>
))}
</tbody>
</table>
</div>
);
}
