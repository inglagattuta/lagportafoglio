import { useState } from "react";
import { importExcel } from "../services/excel";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";


export default function Grafici() {
const [data, setData] = useState([]);


const handleImport = async (e) => {
const file = e.target.files[0];
const imported = await importExcel(file);


const sorted = [...imported]
.sort((a, b) => Number(b.prezzo_acquisto) - Number(a.prezzo_acquisto))
.slice(0, 10);


setData(sorted);
};


return (
<div>
<h1>Grafici — Top 10 prezzo acquisto</h1>


<input type="file" onChange={handleImport} />


<div style={{ width: "100%", height: 400, marginTop: 20 }}>
<ResponsiveContainer>
<BarChart data={data}>
<XAxis dataKey="nome" />
<YAxis />
<Tooltip />
<Bar dataKey="prezzo_acquisto" fill="#0077ff" />
</BarChart>
</ResponsiveContainer>
</div>
</div>
);
}
