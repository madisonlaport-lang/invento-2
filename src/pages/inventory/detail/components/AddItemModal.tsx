import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { Item, ItemCondition, CONDITION_LABELS, CONDITION_COLORS } from '@/types';
import { compressImage } from '@/utils/imageUtils';

interface Props {
  roomId: string;
  onAdd: (item: Omit<Item, 'id' | 'roomId' | 'photos'>, photos: Array<{ url: string; takenAt: string }>) => void;
  onClose: () => void;
}

const CONDITIONS: ItemCondition[] = ['neuf', 'bon', 'use', 'endommage'];

export default function AddItemModal({ onAdd, onClose }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState<ItemCondition>('bon');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [photos, setPhotos] = useState<Array<{ url: string; takenAt: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: FileList | File[]) => {
    setUploading(true);
    const newPhotos = [...photos];
    for (const file of Array.from(files)) {
      try {
        const url = await compressImage(file);
        newPhotos.push({ url, takenAt: new Date().toISOString() });
      } catch { /* skip */ }
    }
    setPhotos(newPhotos);
    setUploading(false);
    if (photoRef.current) photoRef.current.value = '';
  };

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    await processFiles(e.target.files);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (files.length > 0) await processFiles(files);
  };

  const removePhoto = (idx: number) => setPhotos(photos.filter((_, i) => i !== idx));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name: name.trim(), description: description.trim(), condition, estimatedValue: estimatedValue ? parseFloat(estimatedValue) : undefined }, photos);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Ajouter un objet</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer rounded-lg hover:bg-gray-100 transition-colors">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 max-h-[82vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de l&apos;objet <span className="text-red-400">*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Canapé, TV, Table basse..." className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-gray-50" autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Photo de l&apos;objet <span className="ml-1.5 text-xs font-normal text-gray-400">(optionnel)</span></label>
            {photos.length > 0 && (
              <div className="flex gap-2 mb-2 flex-wrap">
                {photos.map((ph, idx) => (
                  <div key={idx} className="relative group">
                    <img src={ph.url} alt="photo" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                    <button type="button" onClick={() => removePhoto(idx)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                      <i className="ri-close-line text-xs"></i>
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => photoRef.current?.click()} disabled={uploading} className="w-20 h-20 border-2 border-dashed border-gray-300 hover:border-emerald-400 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-emerald-500 cursor-pointer transition-colors">
                  <i className="ri-add-line text-xl"></i>
                </button>
              </div>
            )}
            {photos.length === 0 && (
              <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => photoRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${dragOver ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40'}`}>
                {uploading ? <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" /> : (
                  <>
                    <div className="w-10 h-10 flex items-center justify-center bg-emerald-50 rounded-full">
                      <i className="ri-camera-line text-emerald-600 text-xl"></i>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">Prendre ou importer une photo</p>
                      <p className="text-xs text-gray-400 mt-0.5">Glissez une image ou cliquez pour choisir</p>
                    </div>
                  </>
                )}
              </div>
            )}
            <input ref={photoRef} type="file" accept="image/*" multiple capture="environment" className="hidden" onChange={handlePhotoChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">État</label>
            <div className="flex gap-2 flex-wrap">
              {CONDITIONS.map((c) => (
                <button key={c} type="button" onClick={() => setCondition(c)} className={`text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer transition-all ${condition === c ? CONDITION_COLORS[c] + ' ring-2 ring-offset-1 ring-current' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {CONDITION_LABELS[c]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Couleur, dimensions, remarques particulières..." rows={2} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-gray-50 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Valeur estimée</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">€</span>
              <input type="number" value={estimatedValue} onChange={(e) => setEstimatedValue(e.target.value)} placeholder="Optionnel" min="0" step="0.01" className="w-full pl-7 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-gray-50" />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-lg cursor-pointer transition-colors whitespace-nowrap">Annuler</button>
            <button type="submit" disabled={!name.trim() || uploading} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold rounded-lg cursor-pointer transition-colors whitespace-nowrap">
              {uploading ? 'Upload...' : 'Ajouter l\'objet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
