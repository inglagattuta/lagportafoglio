import { usePortfolioStore } from "../store/portfolioStore";

export default function Score() {
  const { portfolio } = usePortfolioStore();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Score</h1>

      {portfolio.length === 0 ? (
        <p>Carica prima il file Excel nella sezione Portfolio.</p>
      ) : (
        <table className="min-w-full mt-4 border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Nome</th>
              <th className="p-2 border">% 12m</th>
              <th className="p-2 border">Rend%</th>
              <th className="p-2 border">Payback</th>
              <th className="p-2 border">% Port.</th>
              <th className="p-2 border">Score</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map((row, i) => (
              <tr key={i} className="border">
                <td className="p-2 border">{row.Nome}</td>
                <td className="p-2 border">{row["12m"]}</td>
                <td className="p-2 border">{row.Rendimento}</td>
                <td className="p-2 border">{row.Payback}</td>
                <td className="p-2 border">{row.PercentualePortafoglio}</td>
                <td className="p-2 border">{row.Score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

