<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WalletBalanceUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $wallet;
    /**
     * Create a new event instance.
     */
    public function __construct($wallet)
    {
        // On passe tout le modèle Wallet pour avoir accès à toutes ses propriétés
        $this->wallet = $wallet;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): Channel
    {
        // Channel privé pour le wallet spécifique
        return new Channel('wallet.'.$this->wallet->id);
    }

    /**
     * Nom personnalisé de l'événement pour le frontend
     */
    public function broadcastAs()
    {
        return 'balance.updated';
    }
}
