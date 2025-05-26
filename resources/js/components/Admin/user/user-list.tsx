import {User} from '@/types'
import {columns} from "./columns"
import { TableUser } from './TableUsers'

type UserListProps = {
    users: User[]
}

export default function UsersList({ users}: UserListProps) {
    return(
        <div className="container mx-auto py-10">
            <TableUser columns={columns} data={users} />
        </div>
    )
}