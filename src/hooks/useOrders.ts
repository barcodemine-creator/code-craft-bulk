import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Order {
  id: string;
  user_id: string;
  pack_id: string | null;
  quantity: number;
  barcode_type: "UPC-A" | "EAN-13";
  start_number: string;
  end_number: string;
  total_amount: number;
  status: "pending" | "paid" | "completed" | "refunded";
  payment_reference: string | null;
  certificate_number: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface OrderBarcode {
  id: string;
  order_id: string;
  barcode_number: string;
  barcode_type: "UPC-A" | "EAN-13";
  created_at: string;
}

export function useOrders() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user,
  });
}

export function useOrderBarcodes(orderId: string | null) {
  return useQuery({
    queryKey: ["order-barcodes", orderId],
    queryFn: async () => {
      if (!orderId) return [];

      const { data, error } = await supabase
        .from("order_barcodes")
        .select("*")
        .eq("order_id", orderId)
        .order("barcode_number", { ascending: true });

      if (error) throw error;
      return data as OrderBarcode[];
    },
    enabled: !!orderId,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (order: Omit<Order, "id" | "created_at" | "completed_at">) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("orders")
        .insert(order)
        .select()
        .single();

      if (error) throw error;
      return data as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", user?.id] });
    },
  });
}
