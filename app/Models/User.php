<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Project;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use function Laravel\Prompts\select;

class User extends Authenticatable
{

    // Connexion
    protected $connection = "pgsql";

    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'avatar',
        'name',
        'email',
        'phone',
        'adress',
        'password',
        'is_admin',
        'email_verified_at',
        'wallet',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relationship
    public function createProject(): HasMany
    {
        return $this-hasMany(User::class, 'id_admin');
    }

//    Create new wallet when user is created
    protected static function booted(): void
    {
        static::created(function (User $user) {
            // Crée un wallet vide avec un solde initial de 0
            $user->wallet()->create([
                'balance' => 0,
            ]);
        });
    }

    // Retourner une liste d’utilisateurs sauf l’utilisateur donné 
    public static function getUsersExceptUser(User $user)
    {
        $userId = $user->id;
        $query = User::select(['users.*', 'messages.message as last_message', 'messages.created_at as last_message_date'])
        ->where('users.id', '!=', $userId)
        ->when(!$user->is_admin, function ($query) {
            $query->whereNull('users.blocked_at');
        })
        ->leftJoin('conversations', function ($join) use ($userId) {
            $join->on('conversations.user_id1', '=', 'users.id')
                ->where('conversations.user_id2', '=', $userId)
                ->orWhere(function ($query) use ($userId) {
                    $query->on('conversations.user_id2', '=', 'users.id')
                        ->where('conversations.user_id1', '=', $userId);
                });
        })
        ->leftJoin('messages', 'messages.id', '=', 'conversations.last_message_id')
            ->orderByRaw('COALESCE(users.blocked_at)')
            ->orderBy('messages.created_at', 'desc')
            ->orderBy('users.name')
        ;
        return $query->get();
    }

    // formate l’instance actuelle d’un utilisateur pour la transformer en un tableau
    public function toConversationArray()
    {
        $user = new User();
        $user->id = $this->id;
        $user->name = $this->name;
        $user->email = $this->email;
        $user->avatar = $this->avatar;
        $user->is_group = false;
        $user->is_user = true;
        $user->is_admin = (bool) $this->is_admin;
        $user->created_at = $this->created_at;
        $user->updated_at = $this->updated_at;
        $user->blocked_at = $this->blocked_at;
        $user->last_message = $this->last_message;
        $user->last_message_date = $this->last_message_date;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->avatar,
            'is_group' => false,
            'is_user' => true,
            'is_admin' => (bool) $this->is_admin,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'blocked_at' => $this->blocked_at,
            'last_message' => $this->last_message,
            'last_message_date' => $this->last_message_date,
            'user' => $user,
        ];
    }

    // relation pour un seul portefeuille
    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    // Verfie si l'utilisateur est administrateur
    public function isAdmin()
    {
        return $this->type === 'admin';
    }

    // Vérifie si il est user
    public function isDev()
    {
        return $this->type === 'user';
    }

    // Il pourrait avoir plusieurs projet
    public function projects() // si admin
    {
        return $this->hasMany(Project::class, 'admin_id');
    }

    // Il pourrait participer à plusieurs projet
    public function devProject() // si dev
    {
        return $this->belongsToMany(Project::class, 'admin_id', 'manager_id');
    }
}
