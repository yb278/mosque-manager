export default function HelpPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Help</h1>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <h2 className="font-semibold mb-4">How to use AEC Strategy</h2>
        <div className="rounded-lg overflow-hidden border border-zinc-200">
          <video
            controls
            className="w-full rounded-lg"
          >
            <source src="/src/AEC Mosque Strategy Website walkthrough.mp4" />
          </video>
        </div>
      </div>
    </div>
  );
}
