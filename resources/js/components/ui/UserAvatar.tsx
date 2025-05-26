import { User } from  "@/types";

interface UserAvatarProps {
    user : User;
    online?: boolean | null;
    profile?: boolean;
}

const UserAvatar = ({user, online=null, profile=false} : UserAvatarProps) => {
    const onlineClass =
        online === true ? "online" : online === false ? "offline" : "";

    const sizeClass = profile ? "w-40" : "w-8";

    // console.log("avatar ===",user);

    return (
        <>
            {user.avatar ? (
                <div className={`avatar avatar-${onlineClass}`}>
                    <div className={`rounded-full ${sizeClass}`}>
                        <img src={user.avatar} alt={user.name} />
                    </div>
                </div>
            ) : (
                <div className={`avatar avatar-placeholder avatar-${onlineClass}`}>
                    <div className={`bg-neutral text-neutral-content rounded-full ${sizeClass}`}>
                        <span className="text-xl">
                            {user.name.substring(0, 1)}
                        </span>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserAvatar;
