import styles from './Avatar.module.css';

const sizeMap = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80, '2xl': 120 };

export default function Avatar({ src, name, size = 'md', online, className = '', badge }) {
  const px = sizeMap[size] || 40;

  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const colorIndex = name
    ? name.charCodeAt(0) % 8
    : 0;

  return (
    <div
      className={[styles.avatar, styles[size], className].join(' ')}
      style={{ width: px, height: px, minWidth: px }}
      data-color={colorIndex}
    >
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className={styles.img}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ) : (
        <span className={styles.initials} style={{ fontSize: px * 0.36 }}>
          {initials}
        </span>
      )}
      {online !== undefined && (
        <span className={[styles.onlineDot, online ? styles.online : styles.offline].join(' ')} />
      )}
      {badge && <span className={styles.badge}>{badge}</span>}
    </div>
  );
}
