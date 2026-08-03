export default function HelpPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Help</h1>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <h2 className="font-semibold mb-4">How to use AEC Strategy</h2>
        <div className="rounded-lg overflow-hidden border border-zinc-200">
          <iframe
            src="https://1drv.ms/v/c/17085d02d2c873e8/IQAqpeY9zZ_kSb_GSTtkU-yOAZ3PwVOb-bBYg0DeEhR8p_c?e=z1LP4X&embed=1"
            className="w-full aspect-video"
            allowFullScreen
            allow="autoplay; encrypted-media"
          />
        </div>
      </div>
    </div>
  );
}
