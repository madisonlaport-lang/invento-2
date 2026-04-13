import { fetchInventoriesByUser, upsertInventory, deleteInventoryById } from '@/lib/inventoryDb';
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Property, Room, Item, Photo, PropertyType } from '@/types';
import { useAuth } from './AuthContext';

interface InventoryContextType {
  properties: Property[];
  isLoading: boolean;
  createProperty: (data: { name: string; address: string; ownerName: string; type: PropertyType }) => Property;
  updateProperty: (id: string, data: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  getProperty: (id: string) => Property | undefined;
  addRoom: (propertyId: string, room: Omit<Room, 'id' | 'propertyId' | 'items' | 'photos'>) => Room;
  deleteRoom: (propertyId: string, roomId: string) => void;
  addItem: (propertyId: string, roomId: string, item: Omit<Item, 'id' | 'roomId' | 'photos'>) => Item;
  updateItem: (propertyId: string, roomId: string, itemId: string, data: Partial<Item>) => void;
  deleteItem: (propertyId: string, roomId: string, itemId: string) => void;
  addPhotoToRoom: (propertyId: string, roomId: string, photo: Omit<Photo, 'id'>) => void;
  addPhotoToItem: (propertyId: string, roomId: string, itemId: string, photo: Omit<Photo, 'id'>) => void;
  markCompleted: (propertyId: string) => void;
}

const InventoryContext = createContext<InventoryContextType | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [properties, setPropertiesState] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Ref always holds the latest properties — no stale closure bugs
  const propertiesRef = useRef<Property[]>([]);

  useEffect(() => {
  if (authLoading) return;

  const loadData = async () => {
    setIsLoading(true);

    try {
      if (user) {
        const userProps = await fetchInventoriesByUser(user.id);
        propertiesRef.current = userProps;
        setPropertiesState(userProps);
      } else {
        propertiesRef.current = [];
        setPropertiesState([]);
      }
    } catch (error) {
      console.error("Erreur chargement inventaires :", error);
      propertiesRef.current = [];
      setPropertiesState([]);
    } finally {
      setIsLoading(false);
    }
  };

  loadData();
}, [user, authLoading]);

  // ✅ persist updates the ref FIRST (sync), then React state (async)
 const persist = async (updated: Property[]) => {
  if (!user) return;

  propertiesRef.current = updated;
  setPropertiesState([...updated]);

  try {
    const updatedIds = new Set(updated.map((p) => p.id));

    for (const property of updated) {
      await upsertInventory(property);
    }

    for (const oldProperty of properties) {
      if (!updatedIds.has(oldProperty.id)) {
        await deleteInventoryById(oldProperty.id);
      }
    }
  } catch (error) {
    console.error("Erreur sauvegarde inventaires :", error);
  }
};

  const createProperty = (data: { name: string; address: string; ownerName: string; type: PropertyType }): Property => {
  const newProp: Property = {
    id: crypto.randomUUID(),
    userId: user!.id,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
    rooms: [],
  };

  void persist([...propertiesRef.current, newProp]);
  return newProp;
};

  const updateProperty = (id: string, data: Partial<Property>) => {
    void persist(propertiesRef.current.map((p) => (p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p)));
  };

  const deleteProperty = (id: string) => {
    void persist(propertiesRef.current.filter((p) => p.id !== id));
  };

  const getProperty = (id: string) => propertiesRef.current.find((p) => p.id === id);

  const addRoom = (propertyId: string, room: Omit<Room, 'id' | 'propertyId' | 'items' | 'photos'>): Room => {
    const newRoom: Room = { id: crypto.randomUUID(), propertyId, ...room, items: [], photos: [] };
    void persist(
      propertiesRef.current.map((p) =>
        p.id === propertyId ? { ...p, rooms: [...p.rooms, newRoom], updatedAt: new Date().toISOString() } : p
      )
    );
    return newRoom;
  };

  const deleteRoom = (propertyId: string, roomId: string) => {
    void persist(
      propertiesRef.current.map((p) =>
        p.id === propertyId
          ? { ...p, rooms: p.rooms.filter((r) => r.id !== roomId), updatedAt: new Date().toISOString() }
          : p
      )
    );
  };

  const addItem = (propertyId: string, roomId: string, item: Omit<Item, 'id' | 'roomId' | 'photos'>): Item => {
    const newItem: Item = { id: crypto.randomUUID(), roomId, ...item, photos: [] };
    void persist(
      propertiesRef.current.map((p) =>
        p.id === propertyId
          ? {
              ...p,
              rooms: p.rooms.map((r) =>
                r.id === roomId ? { ...r, items: [...r.items, newItem] } : r
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
    return newItem;
  };

  const updateItem = (propertyId: string, roomId: string, itemId: string, data: Partial<Item>) => {
     void persist(
      propertiesRef.current.map((p) =>
        p.id === propertyId
          ? {
              ...p,
              rooms: p.rooms.map((r) =>
                r.id === roomId
                  ? { ...r, items: r.items.map((i) => (i.id === itemId ? { ...i, ...data } : i)) }
                  : r
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
  };

  const deleteItem = (propertyId: string, roomId: string, itemId: string) => {
    void persist(
      propertiesRef.current.map((p) =>
        p.id === propertyId
          ? {
              ...p,
              rooms: p.rooms.map((r) =>
                r.id === roomId ? { ...r, items: r.items.filter((i) => i.id !== itemId) } : r
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
  };

  const addPhotoToRoom = (propertyId: string, roomId: string, photoData: Omit<Photo, 'id'>) => {
    const newPhoto: Photo = { id: crypto.randomUUID(), ...photoData };
    void persist(
      propertiesRef.current.map((p) =>
        p.id === propertyId
          ? {
              ...p,
              rooms: p.rooms.map((r) =>
                r.id === roomId ? { ...r, photos: [...r.photos, newPhoto] } : r
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
  };

  const addPhotoToItem = (propertyId: string, roomId: string, itemId: string, photoData: Omit<Photo, 'id'>) => {
    const newPhoto: Photo = { id: crypto.randomUUID(), ...photoData };
    void persist(
      propertiesRef.current.map((p) =>
        p.id === propertyId
          ? {
              ...p,
              rooms: p.rooms.map((r) =>
                r.id === roomId
                  ? {
                      ...r,
                      items: r.items.map((i) =>
                        i.id === itemId ? { ...i, photos: [...i.photos, newPhoto] } : i
                      ),
                    }
                  : r
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
  };

  const markCompleted = (propertyId: string) => {
    void persist(
      propertiesRef.current.map((p) =>
        p.id === propertyId ? { ...p, status: 'completed', updatedAt: new Date().toISOString() } : p
      )
    );
  };

  return (
    <InventoryContext.Provider
      value={{
        properties,
        isLoading,
        createProperty,
        updateProperty,
        deleteProperty,
        getProperty,
        addRoom,
        deleteRoom,
        addItem,
        updateItem,
        deleteItem,
        addPhotoToRoom,
        addPhotoToItem,
        markCompleted,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
}
