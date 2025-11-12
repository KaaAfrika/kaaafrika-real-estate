"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  creditBalance,
  convertCredit,
  getCreditsHistory,
} from "@/services/propertyService";
import {
  PlusCircle,
  MinusCircle,
  Eye,
  Loader2,
  X as XIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Balances = {
  credit: number | null;
  wallet: number | null;
};

type UserInfo = {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
};

type CreditTx = {
  id: number;
  user_id?: number;
  wallet_id?: number;
  type: string;
  amount: string;
  balance_before?: string;
  balance_after?: string;
  property_id?: number | null;
  description?: string | null;
  reference?: string;
  created_at?: string;
  updated_at?: string;
  property?: {
    id: number;
    title?: string;
    price?: string;
    is_favorite?: boolean;
  } | null;
};

type CreditsPage = {
  current_page: number;
  data: CreditTx[];
  next_page_url?: string | null;
  last_page?: number;
  total?: number;
};

export default function ProfilePage() {
  const router = useRouter();
  const [balances, setBalances] = useState<Balances>({ credit: null, wallet: null });
  const [loadingBalances, setLoadingBalances] = useState<boolean>(true);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  const [showConvert, setShowConvert] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>("");
  const [converting, setConverting] = useState<boolean>(false);
  const [convertError, setConvertError] = useState<string | null>(null);
  const [convertResponse, setConvertResponse] = useState<any>(null);

  const [user, setUser] = useState<UserInfo>({});

  // credit history state
  const [history, setHistory] = useState<CreditTx[]>([]);
  const [historyMeta, setHistoryMeta] = useState<CreditsPage | null>(null);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // modal state
  const [selectedTx, setSelectedTx] = useState<CreditTx | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("kaa_token") : null;
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const raw = localStorage.getItem("kaa_user");
      if (raw) {
        const parsed: any = JSON.parse(raw);
        const u = parsed?.user || parsed?.data?.user || parsed?.data;
        const firstName = u?.first_name || u?.firstName;
        const lastName = u?.last_name || u?.lastName;
        let avatarUrl: string | undefined;
        const medias = u?.medias;
        if (Array.isArray(medias)) {
          const m = medias.find((m: any) => m?.media_for === "profile_image");
          avatarUrl = m?.url || m?.media_url || m?.path;
        } else if (medias && typeof medias === "object") {
          if (medias?.media_for === "profile_image") {
            avatarUrl = medias?.url || medias?.media_url || medias?.path;
          }
        }
        const email = typeof window !== "undefined" ? sessionStorage.getItem("kaa_email") || u?.email : u?.email;
        const phone = typeof window !== "undefined" ? sessionStorage.getItem("kaa_phone") || u?.phone_number : u?.phone_number;
        setUser({ firstName, lastName, avatarUrl, email: email || undefined, phone: phone || undefined });
      }
    } catch {}
  }, [router]);

  async function loadBalances() {
    setLoadingBalances(true);
    setBalanceError(null);
    try {
      const res = await creditBalance();
      const payload: any = res?.data ?? res;
      const credit = payload?.data?.credit_balance ?? payload?.credit_balance ?? null;
      const wallet = payload?.data?.wallet_balance ?? payload?.wallet_balance ?? null;
      setBalances({ credit, wallet });
    } catch (err: any) {
      setBalanceError(err?.message || "Failed to load balances");
    } finally {
      setLoadingBalances(false);
    }
  }

  useEffect(() => {
    loadBalances();
    loadHistory(1); // initial history load (page 1)
  }, []);

  // IMPORTANT: this version ALWAYS replaces the table data with the requested page.
  async function loadHistory(page = 1) {
    setLoadingHistory(true);
    setHistoryError(null);
    try {
      const res = await getCreditsHistory(page);
      const payload: any = res?.data ?? res;

      const pageData: CreditsPage = {
        current_page: payload?.data?.current_page ?? payload?.current_page ?? 1,
        data: payload?.data?.data ?? payload?.data ?? payload?.data ?? [],
        next_page_url: payload?.data?.next_page_url ?? payload?.next_page_url ?? null,
        last_page: payload?.data?.last_page ?? payload?.last_page ?? undefined,
        total: payload?.data?.total ?? payload?.total ?? undefined,
      };

      // always replace history with the new page (no append)
      setHistory(pageData.data || []);
      setHistoryMeta(pageData);
    } catch (err: any) {
      console.error("loadHistory error", err);
      setHistoryError(err?.message || "Failed to load credit history");
      setHistory([]); // clear on error to avoid stale UI
      setHistoryMeta(null);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function onConvertSubmit(e: React.FormEvent) {
    e.preventDefault();
    setConvertError(null);
    setConvertResponse(null);
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      setConvertError("Enter a valid amount greater than 0");
      return;
    }
    try {
      setConverting(true);
      const res = await convertCredit(value);
      const payload: any = res?.data ?? res;
      const body: any = payload?.data ?? payload;
      const summary = {
        success: true,
        wallet_amount_deducted: body?.wallet_amount_deducted ?? body?.walletAmountDeducted ?? null,
        credits_added: body?.credits_added ?? body?.creditsAdded ?? null,
        new_wallet_balance: body?.new_wallet_balance ?? body?.newWalletBalance ?? null,
        new_credit_balance: body?.new_credit_balance ?? body?.newCreditBalance ?? null,
        conversion_rate: body?.conversion_rate ?? body?.conversionRate ?? null,
      };
      setConvertResponse(summary);
      await loadBalances();
      await loadHistory(1); // reload first page after conversion
    } catch (err: any) {
      const raw = err?.response?.data;
      if (raw) {
        try {
          setConvertError(typeof raw === "string" ? raw : JSON.stringify(raw));
        } catch {
          setConvertError("Conversion failed");
        }
      } else {
        setConvertError(err?.message || "Conversion failed");
      }
    } finally {
      setConverting(false);
    }
  }

  const fullName = useMemo(() => {
    const f = user.firstName?.trim() || "";
    const l = user.lastName?.trim() || "";
    return `${f} ${l}`.trim() || "User";
  }, [user.firstName, user.lastName]);

  // helpers
  const fmtCurrency = (v: string | number | null | undefined) => {
    if (v == null) return "-";
    const n = Number(v);
    if (Number.isNaN(n)) return String(v);
    return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  };

  const fmtDate = (d?: string | null) => {
    if (!d) return "-";
    try {
      const dt = new Date(d);
      return dt.toLocaleString();
    } catch {
      return d;
    }
  };

  const isDebitType = (t: string | undefined) => {
    if (!t) return false;
    const low = t.toLowerCase();
    return low.includes("deduct") || low.includes("debit") || low.includes("charge");
  };

  const handleLoadPage = (page: number) => {
    if (!historyMeta) return;
    if (page < 1 || (historyMeta.last_page && page > historyMeta.last_page)) return;
    loadHistory(page);
    const el = document.querySelector("#credits-table");
    if (el) (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // close modal on Escape and allow backdrop click
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedTx(null);
    };
    if (selectedTx) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedTx]);

  // pagination pages window
  const paginationPages = useMemo(() => {
    const pages: number[] = [];
    if (!historyMeta || !historyMeta.last_page) return pages;
    const current = historyMeta.current_page || 1;
    const last = historyMeta.last_page || 1;
    const windowSize = 5;
    let start = Math.max(1, current - Math.floor(windowSize / 2));
    let end = Math.min(last, start + windowSize - 1);
    if (end - start + 1 < windowSize) start = Math.max(1, end - windowSize + 1);
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }, [historyMeta]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col items-center gap-4">
          <img src={user.avatarUrl || "/placeholder-user.jpg"} alt="Profile" className="h-36 w-36 rounded-full object-cover border" />
          <div className="text-center">
            <h1 className="text-2xl font-semibold">{fullName}</h1>
            <p className="text-muted-foreground">Your profile and credits</p>
            {user.email && <div className="text-sm text-foreground mt-2">Email: {user.email}</div>}
            {user.phone && <div className="text-sm text-foreground">Phone: {user.phone}</div>}
          </div>
        </div>

        <section className="space-y-2">
          {loadingBalances && <div>Loading balances...</div>}
          {balanceError && <div className="text-red-600">{balanceError}</div>}
          {!loadingBalances && !balanceError && (
            <>
              <div className="text-foreground">Credit Balance: <span className="font-semibold">{balances.credit == null ? "-" : fmtCurrency(balances.credit)}</span></div>
              <div className="text-foreground">Wallet Balance: <span className="font-semibold">{balances.wallet == null ? "-" : fmtCurrency(balances.wallet)}</span></div>
            </>
          )}
        </section>

        <section className="space-y-3">
          {!showConvert && <Button onClick={() => setShowConvert(true)}>Convert Credit</Button>}
          {showConvert && (
            <form onSubmit={onConvertSubmit} className="flex flex-col sm:flex-row items-start gap-3 max-w-md">
              <Input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount to convert" className="w-full sm:w-64" />
              <div className="flex gap-2">
                <Button type="submit" disabled={converting}>{converting ? "Converting..." : "Convert"}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowConvert(false); setAmount(""); setConvertError(null); }}>Cancel</Button>
              </div>
            </form>
          )}
          {convertError && <div className="text-red-600">{convertError}</div>}
        </section>

        {convertResponse && (
          <section className="space-y-3 w-full max-w-2xl">
            <h2 className="text-lg font-semibold">Conversion Summary</h2>
            <div className="bg-card rounded-xl border shadow-sm p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="text-muted-foreground">Wallet Deducted</div>
                <div className="font-medium">{fmtCurrency(convertResponse.wallet_amount_deducted)}</div>
                <div className="text-muted-foreground">Credits Added</div>
                <div className="font-medium">{fmtCurrency(convertResponse.credits_added)}</div>
                <div className="text-muted-foreground">New Wallet Balance</div>
                <div className="font-medium">{fmtCurrency(convertResponse.new_wallet_balance)}</div>
                <div className="text-muted-foreground">New Credit Balance</div>
                <div className="font-medium">{fmtCurrency(convertResponse.new_credit_balance)}</div>
                <div className="text-muted-foreground">Conversion Rate</div>
                <div className="font-medium">{convertResponse.conversion_rate == null ? "-" : new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(Number(convertResponse.conversion_rate))}</div>
              </div>
            </div>
          </section>
        )}

        {/* ------------------ Credit History Table ------------------ */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Credit History</h2>
            <div>{loadingHistory && <span className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="animate-spin h-4 w-4" /> Loading</span>}</div>
          </div>

          {historyError && <div className="text-red-600">{historyError}</div>}

          <div id="credits-table" className="overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="min-w-full table-fixed divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="w-3/12 px-4 py-3 text-left text-sm font-medium">Reference</th>
                  <th className="w-3/12 px-4 py-3 text-left text-sm font-medium">Type</th>
                  <th className="w-2/12 px-4 py-3 text-right text-sm font-medium">Amount</th>
                  <th className="w-2/12 px-4 py-3 text-left text-sm font-medium">Balance</th>
                  <th className="w-2/12 px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th className="w-1/12 px-4 py-3 text-center text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {history.length === 0 && !loadingHistory ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-muted-foreground">No credit transactions found.</td>
                  </tr>
                ) : (
                  history.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3 text-sm break-words truncate max-w-[220px]" title={tx.reference ?? ""}>{tx.reference ?? "-"}</td>
                      <td className="px-4 py-3 text-sm flex items-center gap-2">
                        {isDebitType(tx.type) ? <MinusCircle className="h-5 w-5 text-red-500" /> : <PlusCircle className="h-5 w-5 text-green-500" />}
                        <span className="capitalize text-sm">{tx.type.replace(/_/g, " ")}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">{fmtCurrency(tx.amount)}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-col">
                          <span className="text-sm">Before: <span className="font-medium">{fmtCurrency(tx.balance_before)}</span></span>
                          <span className="text-xs text-muted-foreground">After: <span className="font-semibold">{fmtCurrency(tx.balance_after)}</span></span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{fmtDate(tx.updated_at ?? tx.created_at)}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => setSelectedTx(tx)} className="inline-flex items-center justify-center p-2 rounded-md hover:bg-muted transition-colors" aria-label={`View transaction ${tx.reference ?? tx.id}`}>
                          <Eye className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {historyMeta && historyMeta.last_page && historyMeta.last_page > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => handleLoadPage((historyMeta.current_page || 1) - 1)} disabled={loadingHistory || (historyMeta.current_page || 1) <= 1} className="inline-flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>

              <div className="flex items-center gap-1">
                {paginationPages.map((p) => (
                  <button key={p} onClick={() => handleLoadPage(p)} className={`px-3 py-1 rounded-md border ${p === (historyMeta.current_page || 1) ? "bg-primary text-white border-primary" : "bg-white text-foreground"}`} aria-current={p === (historyMeta.current_page || 1) ? "page" : undefined}>
                    {p}
                  </button>
                ))}
              </div>

              <Button variant="outline" size="sm" onClick={() => handleLoadPage((historyMeta.current_page || 1) + 1)} disabled={loadingHistory || (historyMeta.current_page || 1) >= (historyMeta.last_page || 1)} className="inline-flex items-center gap-2">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </section>

        {/* ------------------ Modal ------------------ */}
        {selectedTx && (
          <div role="dialog" aria-modal="true" className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={(e) => { if (e.target === e.currentTarget) setSelectedTx(null); }}>
            <div className="bg-white rounded-xl w-full max-w-2xl p-6 relative max-h-[85vh] overflow-auto shadow-lg">
              <button onClick={() => setSelectedTx(null)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted" aria-label="Close">
                <XIcon className="h-5 w-5" />
              </button>

              <h3 className="text-lg font-semibold mb-2">Transaction Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div>
                  <div className="text-xs text-muted-foreground">Reference</div>
                  <div className="font-medium break-words">{selectedTx.reference}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Type</div>
                  <div className="font-medium">{selectedTx.type}</div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Amount</div>
                  <div className="font-medium">{fmtCurrency(selectedTx.amount)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Date</div>
                  <div className="font-medium">{fmtDate(selectedTx.updated_at ?? selectedTx.created_at)}</div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Balance Before</div>
                  <div className="font-medium">{fmtCurrency(selectedTx.balance_before)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Balance After</div>
                  <div className="font-medium">{fmtCurrency(selectedTx.balance_after)}</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs text-muted-foreground">Description</div>
                <div className="text-sm break-words">{selectedTx.description ?? "-"}</div>
              </div>

              {selectedTx.property && (
                <div className="mb-4">
                  <div className="text-xs text-muted-foreground">Property</div>
                  <div className="text-sm font-medium">
                    <a href={`/property/${selectedTx.property.id}`} className="text-primary hover:underline">{selectedTx.property.title ?? `Property #${selectedTx.property.id}`}</a>
                  </div>
                </div>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedTx(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
