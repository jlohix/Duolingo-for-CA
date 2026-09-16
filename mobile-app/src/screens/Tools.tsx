import ResistorDecoder from '../components/ResistorDecoder';
import Mascot from '../components/Mascot';

export default function Tools() {
  return (
    <div className="px-4 py-4 space-y-6">
      <div className="flex items-center gap-3">
        <Mascot mood="bat" size={64} />
        <div>
          <h1 className="text-xl font-extrabold">Toolkit</h1>
          <p className="text-sm text-neutral-400">Handy calculators for lab & tutorials</p>
        </div>
      </div>
      <ResistorDecoder />
    </div>
  );
}
