// UserOptionsDropdown.tsx
import { Menu, Transition } from '@headlessui/react';

import { Conversation } from "@/types";
import {
    EllipsisVerticalIcon,
    ShieldCheckIcon,
    LockClosedIcon,
    UserIcon,
    LockOpenIcon,
} from '@heroicons/react/24/solid';
import { Fragment } from 'react';
import axios from 'axios';

interface Props {
    conversation: Conversation;
}

const UserOptionsDropdown = ({ conversation }: Props) => {

    const changeUserRole = () => {
        console.log("change user role");

        if(!conversation.is_user) {
            return;
        }

        axios
            .post(route("user.changeRole", conversation.id))
            .then((res) => {
                console.log(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    const onBlockUser = () => {
        console.log("Blog user");
        if(!conversation.is_user) {
            return;
        }

        axios
            .post(route("user.blockUnblock", conversation.id))
            .then((res) => {
                console.log(res.data);
            })
            .catch((err) =>{
                console.log(err);
            })
    }

    return (
        <div>
            <Menu as="div" className="relative inline-block text-left">
                <div className="">
                    <Menu.Button className="flex justify-center items-center w-8 h-8
                    rounded-full hover:bg-black/40">
                        <EllipsisVerticalIcon className="h-5 w-5" />
                    </Menu.Button>
                </div>
                <Transition
                    as={Fragment}
                    enter="transition ease-ouy duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                >
                    <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md bg-gray-800 shadow-lg z-50">
                        <div className="px-1 py-1">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={onBlockUser}
                                        className={`${
                                            active
                                            ? "bg-black/30 text-white"
                                                : "text-gray-100"
                                        }group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                    >
                                        {conversation.is_user ? (
                                            conversation.blocked_at ? (
                                                <>
                                                    <LockOpenIcon className="w-4 h-4 mr-2" />
                                                    Unblock User
                                                </>
                                            ) : (
                                                <>
                                                    <LockClosedIcon className="w-4 h-4 mr-2" />
                                                    Block User
                                                </>
                                            )
                                        ) : null}
                                    </button>
                                )}
                            </Menu.Item>
                        </div>
                        <div className="px-1 py-1">
                            <Menu.Item>
                                {({active}) => (
                                    <button
                                        onClick={changeUserRole}
                                        className={`${
                                            active
                                            ?"bg-black/30 text-white"
                                                :"text-gray-100"
                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                    >
                                        {conversation.is_user && (
                                            conversation.is_admin ? (
                                                <>
                                                    <UserIcon className="w-4 h-4 mr-2" />
                                                    Make Regular User
                                                </>
                                            ) : (
                                                <>
                                                    <ShieldCheckIcon className="w-4 h-4 mr-2" />
                                                    Make Admin
                                                </>
                                            )
                                        )}
                                    </button>
                                )}
                            </Menu.Item>
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    );
};

export default UserOptionsDropdown;
