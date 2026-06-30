import { createClient } from "@/lib/supabase/server";
import type { PartnerRow } from "@/lib/types";

/**
 * Acesso de leitura aos parceiros (carrossel da home).
 * Server Component. RLS libera SELECT para todos; ordena por display_order.
 */

export type PartnerPublic = {
  id: string;
  name: string;
  logoUrl: string | null;
  linkUrl: string | null;
};

type Source = Pick<
  PartnerRow,
  "id" | "name" | "logo_url" | "link_url" | "display_order"
>;

export async function getPartners(): Promise<PartnerPublic[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partners")
    .select("id, name, logo_url, link_url, display_order")
    .order("display_order", { ascending: true });

  const rows = (error || !data ? [] : data) as Source[];

  return rows.map<PartnerPublic>((p) => ({
    id: p.id,
    name: p.name,
    logoUrl: p.logo_url,
    linkUrl: p.link_url,
  }));
}
