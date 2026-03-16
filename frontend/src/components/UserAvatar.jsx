function UserAvatar({ name, size = 50 }) {
    const seed = encodeURIComponent((name || "User").trim() || "User");
    const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${seed}`;

    return (
        <img
            src={avatarUrl}
            alt={`${name || "User"} avatar`}
            className="rounded-full object-cover"
            style={{
                width: `${size}px`,
                height: `${size}px`,
                minWidth: `${size}px`,
                borderRadius: "9999px"
            }}
            loading="lazy"
        />
    );
}

export default UserAvatar;
