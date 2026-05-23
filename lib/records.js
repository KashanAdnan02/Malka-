import { supabase } from "@/lib/supabase";

export const createRecord = async (dataToSend) => {
  const { data, error } = await supabase.from("records").insert([dataToSend]);

  return { data, error };
};

export const getRecords = async () => {
  const { data, error } = await supabase.from("records").select("*");

  return { data, error };
};

export const updateRecord = async (dataToSend, id) => {
  const { data, error } = await supabase
    .from("Records")
    .update(dataToSend)
    .eq("id", id);

  return { data, error };
};

export const deleteRecord = async (id) => {
  const { data, error } = await supabase.from("records").delete().eq("id", id);

  return { data, error };
};
