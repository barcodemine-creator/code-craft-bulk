import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GepirEntry {
  id: string;
  barcode_number: string;
  barcode_type: "UPC-A" | "EAN-13";
  company_name: string;
  company_contact: string | null;
  country: string | null;
  registration_date: string;
  is_public: boolean;
  user_id: string | null;
  order_id: string | null;
}

export function useGepirSearch(searchTerm: string) {
  return useQuery({
    queryKey: ["gepir-search", searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 5) return [];

      const { data, error } = await supabase
        .from("gepir_registry")
        .select("*")
        .eq("is_public", true)
        .ilike("barcode_number", `${searchTerm}%`)
        .limit(20);

      if (error) throw error;
      return data as GepirEntry[];
    },
    enabled: searchTerm.length >= 5,
  });
}

export function useGepirLookup(barcodeNumber: string) {
  return useQuery({
    queryKey: ["gepir-lookup", barcodeNumber],
    queryFn: async () => {
      if (!barcodeNumber) return null;

      const { data, error } = await supabase
        .from("gepir_registry")
        .select("*")
        .eq("barcode_number", barcodeNumber)
        .eq("is_public", true)
        .maybeSingle();

      if (error) throw error;
      return data as GepirEntry | null;
    },
    enabled: !!barcodeNumber,
  });
}
