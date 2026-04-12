import { supabase } from "./supabase";
import { Property } from "@/types";

export async function fetchInventoriesByUser(userId: string): Promise<Property[]> {
  const { data, error } = await supabase
    .from("inventories")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    address: row.address,
    ownerName: row.owner_name || "",
    type: row.type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status,
    rooms: row.rooms || [],
  }));
}

export async function upsertInventory(property: Property): Promise<void> {
  const { error } = await supabase.from("inventories").upsert({
    id: property.id,
    user_id: property.userId,
    name: property.name,
    address: property.address,
    owner_name: property.ownerName || "",
    type: property.type,
    created_at: property.createdAt,
    updated_at: property.updatedAt,
    status: property.status,
    rooms: property.rooms,
  });

  if (error) throw error;
}

export async function deleteInventoryById(id: string): Promise<void> {
  const { error } = await supabase.from("inventories").delete().eq("id", id);
  if (error) throw error;
}
