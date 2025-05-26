import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import type { User } from "@/types"

interface UserSelectorProps {
  onSelect: (user: User) => void
  excludeUserIds: number[]
}

export function UserSelector({ onSelect, excludeUserIds }: UserSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/users/search?q=" + searchTerm)
        const data = await response.json()
        // Filtrer les utilisateurs déjà dans le projet
        const filteredUsers = data.filter((user: User) => !excludeUserIds.includes(user.id))
        setUsers(filteredUsers)
      } catch (error) {
        console.error("Erreur lors de la recherche d'utilisateurs:", error)
      }
      setLoading(false)
    }

    if (searchTerm.length >= 2) {
      fetchUsers()
    } else {
      setUsers([])
    }
  }, [searchTerm, excludeUserIds])

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher un utilisateur..."
          className="w-full px-4 py-2 pl-10 bg-slate-900 rounded-md border border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#60a5fa]"
        />
        <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
      </div>

      {loading && (
        <div className="mt-2 text-center text-slate-400">
          <p>Chargement...</p>
        </div>
      )}

      {!loading && users.length > 0 && (
        <div className="mt-2 bg-slate-800 rounded-md border border-slate-700 max-h-48 overflow-y-auto">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelect(user)}
              className="w-full px-4 py-2 text-left hover:bg-slate-700 flex items-center gap-3"
            >
              <div className="h-8 w-8 rounded-full bg-[#60a5fa] flex items-center justify-center">
                <span className="font-bold text-white">{user.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-slate-400">{user.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {!loading && searchTerm.length >= 2 && users.length === 0 && (
        <div className="mt-2 text-center text-slate-400">
          <p>Aucun utilisateur trouvé</p>
        </div>
      )}
    </div>
  )
} 