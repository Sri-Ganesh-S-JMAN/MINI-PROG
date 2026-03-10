type Asset = {
  id: number;
  name: string;
  serialNo: string;
  status: string;
};
 
export default function AssetCard({ asset }: { asset: Asset }) {
  const STATUS_COLORS: Record<string, string> = {
    AVAILABLE: "bg-white border border-gray-200 text-gray-900",
    ALLOCATED: "bg-gray-900 text-white",
    IN_REPAIR: "bg-gray-100 border border-gray-200 text-gray-900",
    RETIRED: "bg-gray-50 border border-gray-200 text-gray-500",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-gray-900">{asset.name}</h2>
          <p className="text-sm text-gray-500 mt-1">SN: <span className="font-medium text-gray-700">{asset.serialNo || "N/A"}</span></p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[asset.status] || "bg-gray-100 text-gray-800"}`}>
          {asset.status.replace("_", " ")}
        </span>
      </div>
    </div>
  );
}
