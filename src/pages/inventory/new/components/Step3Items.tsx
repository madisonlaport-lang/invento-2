import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Item, ItemCondition, CONDITION_LABELS, CONDITION_COLORS, Photo } from '@/types';
import { compressImage } from '@/utils/imageUtils';

interface RoomData {
  name: string;
  icon: string;
  items: Array<Omit<Item, 'id' | 'roomId'> & { tempId: string }>;
  photos: Array<Omit<Photo, 'id'>>;
}

interface Props {
  rooms: RoomData[];
  onChange: (rooms: RoomData[]) => void;
}

const CONDITIONS: ItemCondition[] = ['neuf', 'bon', 'use', 'endommage'];

interface NewItemForm {
  name: string;
  description: string;
  condition: ItemCondition;
  estimatedValue: string;
  photos: Array<{ url: string; takenAt: string }>;
}

const emptyForm = (): NewItemForm => ({
  name: '',
  description: '',
  condition: 'bon',
  estimatedValue: '',
  photos: [],
});

export default function Step3Items({ rooms, onChange }: Props) {
  const [activeRoom, setActiveRoom] = useState(0);
  const [form, setForm] = useState<NewItemForm>(emptyForm());
  const [adding, setAdding] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingItemPhoto, setUploadingItemPhoto] = useState(false);
  const [itemPhotoDragOver, setItemPhotoDragOver] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const itemPhotoRef = useRef<HTMLInputElement>(null);

  const room = rooms[activeRoom];

  const updateRoom = (idx: number, data: Partial<RoomData>) => {
    const updated = rooms.map((r, i) => (i === idx ? { ...r, ...data } : r));
    onChange(updated);
  };

  const processItemPhotos = async (files: FileList | File[]) => {
    setUploadingItemPhoto(true);
    const newPhotos = [...form.photos];
    for (const file of Array.from(files)) {
      try {
        const url = await compressImage(file);
        newPhotos.push({ url, takenAt: new Date().toISOString() });
      } catch {
        // skip
      }
    }
    setForm((prev) => ({ ...prev, photos: newPhotos }));
    setUploadingItemPhoto(false);
    if (itemPhotoRef.current) itemPhotoRef.current.value = '';
  };

  const handleItemPhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    await processItemPhotos(e.target.files);
  };

  const handleItemPhotoDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setItemPhotoDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (files.length > 0) await processItemPhotos(files);
  };

  const addItem = () => {
    if (!form.name.trim()) return;
    const newItem = {
      tempId: crypto.randomUUID(),
      name: form.name.trim(),
      description: form.description.trim(),
      condition: form.condition,
      estimatedValue: form.estimatedValue ? parseFloat(form.estimatedValue) : undefined,
      photos: form.photos.map((ph) => ({ ...ph, id: crypto.randomUUID(), linkedId: '', linkedType: 'item' as const })),
    };
    updateRoom(activeRoom, { items: [...room.items, newItem] });
    setForm(emptyForm());
    setAdding(false);
  };

  const removeItem = (tempId: string) => {
    updateRoom(activeRoom, { items: room.items.filter((i) => i.tempId !== tempId) });
  };

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingPhoto(true);
    const photos = [...room.photos];
    for (const file of Array.from(files)) {
      try {
        const compressed = await compressImage(file);
        photos.push({ url: compressed, takenAt: new Date().toISOString(), linkedId: '', linkedType: 'room' });
      } catch {
        // skip failed
      }
    }
    updateRoom(activeRoom, { photos });
    setUploadingPhoto(false);
    if (photoRef.current) photoRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Inventaire par pièce</h2>
        <p className="text-sm text-gray-500">Ajoutez les objets présents dans chaque pièce.</p>
      </div>

      {/* Room tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {rooms.map((r, idx) => (
          <button
            key={r.name}
            type="button"
            onClick={() => { setActiveRoom(idx); setAdding(false); setForm(emptyForm()); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all flex-shrink-0 ${
              activeRoom === idx
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <i className={`${r.icon} text-sm`}></i>
            {r.name}
            {r.items.length > 0 && (
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${activeRoom === idx ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {r.items.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Current room */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className={`${room.icon} text-emerald-600`}></i>
            </div>
            <span className="font-semibold text-gray-800 text-sm">{room.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <input ref={photoRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
            <button
              type="button"
              onClick={() => photoRef.current?.click()}
              disabled={uploadingPhoto}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-emerald-600 bg-white border border-gray-200 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
            >
              <i className="ri-camera-line"></i>
              {uploadingPhoto ? 'Upload...' : `Vue de la pièce${room.photos.length > 0 ? ` (${room.photos.length})` : ''}`}
            </button>
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
            >
              <i className="ri-add-line"></i>
              Objet
            </button>
          </div>
        </div>

        {/* Photo thumbnails */}
        {room.photos.length > 0 && (
          <div className="flex gap-2 p-3 border-b border-gray-100 overflow-x-auto">
            {room.photos.map((ph, idx) => (
              <img key={idx} src={ph.url} alt="photo" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
            ))}
          </div>
        )}

        {/* Items list */}
        <div className="divide-y divide-gray-100">
          {room.items.length === 0 && !adding && (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <i className="ri-archive-line text-gray-400 text-xl"></i>
              </div>
              <p className="text-sm text-gray-500">Aucun objet ajouté</p>
              <p className="text-xs text-gray-400 mt-1">Cliquez sur &quot;Objet&quot; pour commencer</p>
            </div>
          )}
          {room.items.map((item) => (
            <div key={item.tempId} className="flex items-center gap-3 px-4 py-3">
              {item.photos.length > 0 ? (
                <img
                  src={item.photos[0].url}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-lg flex-shrink-0 border border-gray-100"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-image-line text-gray-300 text-lg"></i>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CONDITION_COLORS[item.condition]}`}>
                    {CONDITION_LABELS[item.condition]}
                  </span>
                  {item.estimatedValue !== undefined && (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {item.estimatedValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  )}
                </div>
                {item.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{item.description}</p>}
                {item.photos.length > 1 && (
                  <p className="text-xs text-gray-400 mt-0.5">{item.photos.length} photos</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.tempId)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 cursor-pointer transition-colors flex-shrink-0"
              >
                <i className="ri-delete-bin-line text-sm"></i>
              </button>
            </div>
          ))}

          {/* Add form */}
          {adding && (
            <div className="p-4 bg-emerald-50/50 border-t border-emerald-100">
              <div className="flex flex-col gap-3">
                {/* Nom */}
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nom de l'objet (ex : Canapé, TV...)"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
                  autoFocus
                />

                {/* Zone photo objet */}
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1.5">
                    Photo de l&apos;objet
                    <span className="ml-1 text-gray-400 font-normal">(optionnel)</span>
                  </p>
                  <input
                    ref={itemPhotoRef}
                    type="file"
                    accept="image/*"
                    multiple
                    capture="environment"
                    className="hidden"
                    onChange={handleItemPhotoChange}
                  />
                  {form.photos.length > 0 ? (
                    <div className="flex gap-2 flex-wrap">
                      {form.photos.map((ph, idx) => (
                        <div key={idx} className="relative group">
                          <img src={ph.url} alt="photo" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                          <button
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }))}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <i className="ri-close-line" style={{ fontSize: '10px' }}></i>
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => itemPhotoRef.current?.click()}
                        disabled={uploadingItemPhoto}
                        className="w-16 h-16 border-2 border-dashed border-gray-300 hover:border-emerald-400 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-emerald-500 cursor-pointer transition-colors"
                      >
                        <i className="ri-add-line text-base"></i>
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setItemPhotoDragOver(true); }}
                      onDragLeave={() => setItemPhotoDragOver(false)}
                      onDrop={handleItemPhotoDrop}
                      onClick={() => itemPhotoRef.current?.click()}
                      className={`flex items-center gap-3 px-3 py-2.5 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                        itemPhotoDragOver ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                      }`}
                    >
                      {uploadingItemPhoto ? (
                        <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <div className="w-7 h-7 flex items-center justify-center bg-emerald-50 rounded-lg flex-shrink-0">
                          <i className="ri-camera-line text-emerald-600 text-sm"></i>
                        </div>
                      )}
                      <span className="text-xs text-gray-500">
                        {uploadingItemPhoto ? 'Compression...' : 'Cliquer ou glisser une photo'}
                      </span>
                    </div>
                  )}
                </div>

                {/* État */}
                <div className="flex gap-2 flex-wrap">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, condition: c })}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer transition-all ${
                        form.condition === c ? CONDITION_COLORS[c] + ' ring-2 ring-offset-1 ring-current' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {CONDITION_LABELS[c]}
                    </button>
                  ))}
                </div>

                {/* Description */}
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Description (optionnel)"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
                />

                {/* Valeur */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">€</div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.estimatedValue}
                    onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })}
                    placeholder="Valeur estimée (optionnel)"
                    className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
                  />
                </div>

                {/* Boutons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addItem}
                    disabled={!form.name.trim() || uploadingItemPhoto}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold py-2 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
                  >
                    Ajouter
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAdding(false); setForm(emptyForm()); }}
                    className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
