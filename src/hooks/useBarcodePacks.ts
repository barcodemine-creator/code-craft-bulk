import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BarcodePack {
  id: string;
  name: string;
  quantity: number;
  price: number;
  barcode_type: "UPC-A" | "EAN-13";
  is_active: boolean;
  description: string | null;
  created_at: string;
}

export function useBarcodePacks(type?: "UPC-A" | "EAN-13") {
  return useQuery({
    queryKey: ["barcode-packs", type],
    queryFn: async () => {
      let query = supabase
        .from("barcode_packs")
        .select("*")
        .eq("is_active", true)
        .order("quantity", { ascending: true });

      if (type) {
        query = query.eq("barcode_type", type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as BarcodePack[];
    },
  });
}
