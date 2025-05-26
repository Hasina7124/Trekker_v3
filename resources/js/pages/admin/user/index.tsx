// import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/admin/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm} from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import  UsersList  from '@/components/Admin/user/user-list';
import {User} from '@/types'

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User',
        href: 'admin/User',
    },
];

type RegisterForm = {
    email : string;
}

const Index = ({ users }: {users:User[]}) => {

    const {data, setData, post, processing, errors, reset, recentlySuccessful} = useForm<Required<RegisterForm>>({
        email: '',
    })

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('invite.post'), {
            onFinish: () => reset('email'),
        });
    };

    return(
        <>
            <Head title="User" />
            <div className='max-w-screen-xl mx-auto px-4'>
                <h1 className="text-3xl font-bold mb-10 mt-10">Invite User</h1>
                <div className="flex flex-col sm:flex-row items-center  sm:items-center gap-6">
                    <form onSubmit={submit}>
                        <div className="w-full sm:w-80">
                            <Input
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="Email"
                            />
                            <div className="mt-2 text-sm text-red-600">
                                <InputError message={errors.email} />
                            </div>
                        </div>
                        
                        <div className="mt-4">
                            <Button type="submit" disabled={processing}>
                                {processing && (
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Invite
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
            {recentlySuccessful && (
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded">
                    Invitation sent !
                </div>
            )}
            <UsersList users={users}/>
        </>
    )
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>
        {page}
    </AppLayout>
)

export default Index;
