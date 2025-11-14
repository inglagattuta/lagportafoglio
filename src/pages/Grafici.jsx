import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Grafici() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // esempio temporaneo: valori fittizi
    const mock = [
      { nome: "AAPL", prezzo: 1200 },
      { nome: "NVDA", prezzo: 900 },
      { nome: "MSFT", prezzo: 850 },
      { nome: "GOOG", prezzo: 700 },
      { nome: "SMCI", prezzo: 680 },
      { nome: "BTC", prezzo: 600 },
      { nome: "AMZN", prezzo: 540 },
      { nome: "META", prezzo: 500 },
      { nome: "ORCL", prezzo: 480 },
      { nome: "TSLA", prezzo: 460 }
    ];
    setData(mock);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Grafici</h1>
      <p className="mb-4">Top 10 titoli per prezzo d’acquisto</p>

      <div className="max-w-2xl">
        <Bar
          data={{
            labels: data.map((d) => d.nome),
            datasets: [
              {
                label: "Prezzo Acquisto",
                data: data.map((d) => d.prezzo),
                backgroundColor: "rgba(54, 162, 235, 0.6)"
              }
            ]
          }}
        />
      </div>
    </div>
  );
}
