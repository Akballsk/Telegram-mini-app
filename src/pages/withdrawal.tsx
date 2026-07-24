import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useCreateWithdrawal, useGetBalance, getGetBalanceQueryKey, getGetHistoryQueryKey } from "@/lib/api-client";
import { PageTransition } from "@/components/page-transition";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Withdrawal() {
  const [amount, setAmount] = useState("");
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const withdraw = useCreateWithdrawal();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: balanceData } = useGetBalance(
    { telegramId: user?.telegramId || "" },
    { query: { enabled: !!user?.telegramId, queryKey: getGetBalanceQueryKey({ telegramId: user?.telegramId || "" }) } }
  );
  
  const currentBalance = balanceData?.balance ?? user?.balance ?? 0;

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0 || numAmount > currentBalance) return;
    
    withdraw.mutate({
      data: { telegramId: user!.telegramId, amount: numAmount, note: "Withdrawal via app" }
    }, {
      onSuccess: () => {
        toast({ title: "Withdrawal Successful", description: `Removed $${numAmount.toLocaleString()} from wallet.` });
        queryClient.invalidateQueries({ queryKey: getGetBalanceQueryKey({ telegramId: user!.telegramId }) });
        queryClient.invalidateQueries({ queryKey: getGetHistoryQueryKey({ telegramId: user!.telegramId }) });
        setLocation("/");
      },
      onError: (err) => {
        toast({ title: "Withdrawal Failed", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <PageTransition className="flex flex-col p-6 bg-background">
      <header className="flex items-center mb-16 mt-2 relative z-10">
        <Link href="/" className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95 transition-all border border-white/5">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="ml-4 text-lg font-medium tracking-tight">Withdraw Funds</h1>
      </header>

      <form onSubmit={handleWithdraw} className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col justify-center items-center -mt-20">
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground mb-6">
            Available: <span className="text-primary">${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </p>
          <div className="relative flex items-center justify-center text-6xl font-light text-white w-full group">
            <span className="text-primary/50 mr-2 group-focus-within:text-primary transition-colors">$</span>
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="bg-transparent outline-none w-[60%] text-left placeholder:text-white/10 font-mono tracking-tighter"
              autoFocus
              step="0.01"
              min="0.01"
              max={currentBalance}
            />
          </div>
          <div className="h-px w-48 bg-gradient-to-r from-transparent via-primary/40 to-transparent mt-6 opacity-50" />
          
          <button 
            type="button" 
            onClick={() => setAmount(String(currentBalance))}
            className="mt-8 px-5 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] active:scale-95 transition-all border border-primary/20 hover:bg-primary/20"
          >
            Use Max
          </button>
        </div>

        <button 
          type="submit" 
          disabled={!amount || Number(amount) <= 0 || Number(amount) > currentBalance || withdraw.isPending}
          className="w-full h-[3.5rem] rounded-[1.25rem] text-[15px] font-semibold bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all mt-auto shadow-[0_0_20px_rgba(0,240,255,0.15)] disabled:shadow-none uppercase tracking-wide"
        >
          {withdraw.isPending ? "Processing..." : "Confirm Withdrawal"}
        </button>
      </form>
    </PageTransition>
  );
}