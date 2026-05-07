export default function DashboardCard({ title, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border hover:shadow-lg transition-all">
      <h2 className="text-gray-500 text-sm">{title}</h2>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}