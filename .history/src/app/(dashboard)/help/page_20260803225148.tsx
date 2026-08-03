export default function HelpPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Help</h1>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <h2 className="font-semibold mb-4">How to use AEC Strategy</h2>
        <div className="rounded-lg overflow-hidden border border-zinc-200">
          <iframe
            src="https://alemaancentre.sharepoint.com/:v:/g/IQBhmWhIGNgvQ6NhWhveceuRAbwaE_wR88G5ItZLR4a_imE?e=0dG90W&embed=1"
            className="w-full aspect-video"
            allowFullScreen
            allow="autoplay; encrypted-media"
          />
        </div>
      </div>
    </div>
  );
}
