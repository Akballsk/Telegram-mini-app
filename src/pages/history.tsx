import { useAuth } from "@/lib/auth-context";
import { useGetHistory, getGetHistoryQueryKey } from "@/lib/api-client";
import { PageTransition } from "@/components/page-transition";
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine, Clock } from "lucide-react";
import { Link } from "wouter";

export default function HistoryPage() {
  const { user } = useAuth();
  const { data, isLoading } = useGetHistory(
    { telegramId: user?.telegramId || "" },
    { query: { enabled: !!user?.telegramId, queryKey: getGetHistoryQueryKey({ telegramId: user?.telegramId || "" }) } }
  );

  return (
    <PageTransition className="flex flex-col bg-background h-[100dvh]">
      <header className="flex items-center p-6 pb-4 shrink-0 bg-background/80 backdrop-blur-2xl z-20 border-b border-white/5">
        <Link href="/" className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95 transition-all border border-white/5">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="ml-4 text-lg font-medium tracking-tight">Transactions</h1>
      </header>

      <div className="flex-1 p-6 overflow-y-auto space-y-3 relative z-10 pb-12">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[76px] rounded-[1.25rem] bg-secondary/30 animate-pulse border border-white/5" />
          ))
        ) : !data?.transactions || data.transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Clock size={48} className="mb-4 opacity-20 stroke-[1.5]" />
            <p className="text-sm font-medium tracking-wide">No transactions yet</p>
          </div>
        ) : (
          data.transactions.map(tx => (
            <TransactionItem key={tx.id} tx={tx} />
          ))
        )}
      </div>
    </PageTransition>
  );
}

function TransactionItem({ tx }: { tx: any }) {
  const isDeposit = tx.type === "deposit";
  const date = new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  
  return (
    <div className="group flex items-center justify-between p-4 rounded-[1.25rem] bg-secondary/20 border border-white/5 hover:bg-secondary/40 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center border ${
          isDeposit 
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]" 
            : "bg-white/5 text-white/60 border-white/10"
        }`}>
          {isDeposit ? <ArrowDownToLine size={20} className="stroke-[2]" /> : <ArrowUpFromLine size={20} className="stroke-[2]" />}
        </div>
        <div>
          <p className="font-medium text-foreground/90 capitalize tracking-wide text-[15px]">{tx.type}</p>
          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-mono text-lg tracking-tight ${isDeposit ? "text-emerald-400" : "text-foreground"}`}>
          {isDeposit ? "+" : "-"}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <div className={`inline-flex items-center mt-1.5 text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-sm ${
          tx.status === 'completed' ? "bg-emerald-500/10 text-emerald-500" :
          tx.status === 'pending' ? "bg-amber-500/10 text-amber-500" :
          "bg-destructive/10 text-destructive"
        }`}>
          {tx.status}
        </div>
      </div>
    </div>
  );
}