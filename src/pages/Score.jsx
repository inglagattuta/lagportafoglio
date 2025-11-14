import { useState } from "react";
import { importExcel } from "../services/excel";


export default function Score() {
const [data, setData] = useState([]);


const handleImport = async (e) => {
const file = e.target.files[0];
const imported = await importExcel(file);
setData(imported);
};


return (
<div>
<h1>Score</h1>
<input type="file" onChange={handleImport} />


<table border="1" cellPadding="6" style={{ marginTop: 20 }}>
<thead>
<tr>
<th>Nome</th>
<th>% 12m</th>
<th>Rendimento %</th>
<th>Payback</th>
<th>% Portafoglio</th>
<th>Score</th>
</tr>
</thead>
<tbody>
{data.map((row, i) => (
<tr key={i}>
<td>{row.nome}</td>
<td>{row.perc_12m}</td>
<td>{row.rendimento}</td>
<td>{row.payback}</td>
<td>{row.portafoglio}</td>
<td>{row.score}</td>
</tr>
))}
</tbody>
</table>
</div>
);
}
