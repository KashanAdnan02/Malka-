import { supabase } from "@/lib/supabase";

export const create = async (dataToSend, collectionName) => {
  const { data, error } = await supabase
    .from(collectionName)
    .insert([dataToSend]);

  return { data, error };
};

export const getAll = async (collectionName, filter) => {
  const { data, error } = await supabase.from(collectionName).select(filter);

  return { data, error };
};

export const update = async (dataToSend, id, collectionName) => {
  const { data, error } = await supabase
    .from(collectionName)
    .update(dataToSend)
    .eq("id", id);

  return { data, error };
};

export const deleteData = async (id, collectionName) => {
  const { data, error } = await supabase
    .from(collectionName)
    .delete()
    .eq("id", id);

  return { data, error };
};
