<?php

namespace App\Http\Controllers;

use App\Events\WalletBalanceUpdated;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class WalletController extends Controller
{
    public function index()
    {
        $wallet = auth()->user()->wallet()->with('transactions')->first();
//        dd($wallet);
        return Inertia::render('wallet/index', [
            'wallet' => $wallet,
        ]);
    }

    public function deposit(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:100000',
        ]);

        $user = Auth::user();
        abort_unless(!$user->isAdmin(), 403);

        $wallet = $user->wallet;
        $wallet->balance += $request->amount;
        $wallet->save();

        $wallet->transactions()->create([
            'amount' => $request->amount,
            'type' => 'deposit',
        ]);

        // Après une opération sur le wallet
        $wallet->refresh(); // S'assure d'avoir les dernières données
        event(new WalletBalanceUpdated($wallet));

        return redirect()->back()->with('success', 'Deposit successful');
    }

    public function withdraw(Request $request)
    {
        $user = auth()->user();
        $request->validate(['amount' => 'required|numeric|min:100000']);

        $wallet = $user->wallet;
        if ($wallet->balance < $request->amount) {
            return response()->json(['error' => 'Insufficient funds.'], 400);
        }

        $wallet->balance -= $request->amount;
        $wallet->save();

        $wallet->transactions()->create([
            'amount' => $request->amount,
            'type' => 'withdrawal',
        ]);

        return redirect()->back()->with('success', 'Withdrawal successful');
    }


    public function balance()
    {
        return response()->json([
            'balance' => Auth::user()->wallet->balance
        ]);
    }
}
