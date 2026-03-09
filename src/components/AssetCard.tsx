type Asset = {
  id: number;
  name: string;
  serialNo: string;
  status: string;
};
 
export default function AssetCard({ asset }: { asset: Asset }) {
  return (
    <div className="border p-4 rounded-lg shadow-sm bg-white">
      <h2 className="text-lg font-semibold">{asset.name}</h2>
 
      <p className="text-sm text-gray-600">
        Serial: {asset.serialNo || "N/A"}
      </p>
 
      <p className="text-sm mt-1">
        Status: <span className="font-medium">{asset.status}</span>
      </p>
    </div>
  );
}
