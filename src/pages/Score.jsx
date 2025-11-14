export default function Score() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Score Titoli</h1>

      <p>Qui verranno mostrati i campi:</p>
      <ul className="list-disc ml-6 mt-2">
        <li>Nome</li>
        <li>% 12 mesi</li>
        <li>Rendimento%</li>
        <li>Payback</li>
        <li>% Portafoglio</li>
        <li>Score</li>
      </ul>

      <p className="mt-4 text-gray-500">
        (In seguito inseriamo la tabella collegata al tuo Excel.)
      </p>
    </div>
  );
}
