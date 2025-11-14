import { usePortfolioStore } from "../store/portfolioStore";
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
  const { portfolio } = usePortfolioStore();

  if (portfolio.length === 0) {
    return <p className="p-6">Carica prima il file Excel nella sezione Portfolio.</p>;
  }

  const top10 = [...portfolio]
    .sort((a, b) => b.PrezzoAcquisto - a.PrezzoAcquisto)
    .slice(0, 10);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Grafici</h1>

      <Bar
        data={{
          labels: top10.map((x) => x.Nome),
          datasets: [
            {
              label: "Prezzo Acquisto",
              data: top10.map((x) => x.PrezzoAcquisto),
              backgroundColor: "rgba(75, 192, 192, 0.6)"
            }
          ]
        }}
      />
    </div>
  );
}
