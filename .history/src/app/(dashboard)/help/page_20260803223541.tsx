export default function HelpPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Help</h1>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <h2 className="font-semibold mb-4">How to use AEC Strategy</h2>
        <div className="rounded-lg overflow-hidden border border-zinc-200">
          <iframe
            src="https://alemaancentre.sharepoint.com/_layouts/15/stream.aspx?id=%2FShared%20Documents%2FShaffiq%20%26%20Ali%2FMOSQUE%20STRATEGY%2FAEC%20Mosque%20Strategy%20Website%20walkthrough%2Emp4&ga=1&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2Ece2de56b%2Dc8a8%2D47fc%2Da49f%2D2022f1c9494e&embed=1"
            className="w-full aspect-video"
            allowFullScreen
            allow="autoplay; encrypted-media"
          />
        </div>
      </div>
    </div>
  );
}
