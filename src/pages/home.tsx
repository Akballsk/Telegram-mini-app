import { useAuth } from "@/lib/auth-context";
import { useGetBalance, getGetBalanceQueryKey } from "@/lib/api-client";
import { PageTransition } from "@/components/page-transition";
import { ArrowDownToLine, ArrowUpFromLine, History } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();
  const { data: balanceData } = useGetBalance(
    { telegramId: user?.telegramId || "" },
    { query: { enabled: !!user?.telegramId, queryKey: getGetBalanceQueryKey({ telegramId: user?.telegramId || "" }) } }
  );

  const balance = balanceData?.balance ?? user?.balance ?? 0;

  return (
    <PageTransition className="flex flex-col p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      {/* Header */}
      <header className="flex items-center gap-4 mb-12">
        <div className="relative flex shrink-0 overflow-hidden rounded-full w-12 h-12 border border-primary/30 shadow-[0_0_15px_rgba(0,240,255,0.15)] bg-secondary">
          {user?.photoUrl ? (
            <img src={user.photoUrl} className="aspect-square h-full w-full object-cover" alt={user.firstName} />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full text-primary font-semibold uppercase text-lg">
              {user?.firstName?.[0] || "?"}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground/90">
            {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mt-0.5">
            ID: {user?.telegramId}
          </p>
        </div>
      </header>

      {/* Balance Section */}
      <section className="flex flex-col justify-center items-center py-12 relative">
        <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
        <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-primary/80 mb-4 drop-shadow-sm">Total Balance</p>
        <h2 className="text-[4rem] leading-none font-light tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 mb-2 drop-shadow-md">
          <span className="text-4xl text-white/40 font-mono align-top leading-tight mr-1">$</span>
          {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </h2>
      </section>

      {/* Action Buttons */}
      <section className="grid grid-cols-3 gap-4 mt-auto mb-6">
        <ActionLink href="/deposit" icon={<ArrowDownToLine size={20} />} label="Deposit" />
        <ActionLink href="/withdrawal" icon={<ArrowUpFromLine size={20} />} label="Withdraw" />
        <ActionLink href="/history" icon={<History size={20} />} label="History" />
      </section>
    </PageTransition>
  );
}

function ActionLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="group relative flex flex-col items-center justify-center gap-3 p-4 rounded-[1.5rem] bg-secondary/30 border border-white/5 hover:border-primary/30 hover:bg-secondary/50 active:scale-[0.96] transition-all overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="w-12 h-12 rounded-full bg-background border border-white/5 text-primary flex items-center justify-center shadow-inner group-hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-shadow">
        {icon}
      </div>
      <span className="text-[11px] font-medium text-foreground/80 tracking-wide uppercase">{label}</span>
    </Link>
  );
}