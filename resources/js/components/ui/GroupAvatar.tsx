import {UsersIcon} from '@heroicons/react/24/solid';

const GroupAvatar = () => {
    return (
        <>
            <div className="avatar avatar-placeholder">
                <div className={'bg-neutral text-neutral-content rounded-full w-8'}>
                    <span className="text-xl">
                        <UsersIcon className="w-4" />
                    </span>
                </div>
            </div>
        </>
    );
};

export default GroupAvatar;
