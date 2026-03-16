function UserAvatar({ name, size = 50, className = "" }) {
    const seed = encodeURIComponent((name || "User").trim() || "User");
    const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${seed}`;

    return (
        <img
            src={avatarUrl}
            alt={`${name || "User"} avatar`}
            className={`rounded-circle ${className}`.trim()}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                minWidth: `${size}px`,
                objectFit: "cover"
            }}
            loading="lazy"
        />
    );
}

export default UserAvatar;
