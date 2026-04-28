/**
 * Animated floating orbs that add depth to section backgrounds.
 */
export default function AnimatedOrbs({ variant = 'default', className = '' }) {
  const configs = {
    default: [
      { size: 400, color: 'orb-primary', top: '-10%', right: '-10%', delay: 0 },
      { size: 300, color: 'orb-accent', bottom: '-15%', left: '-8%', delay: -3 },
    ],
    hero: [
      { size: 500, color: 'orb-primary', top: '-15%', right: '-12%', delay: 0 },
      { size: 350, color: 'orb-purple', bottom: '-20%', left: '-10%', delay: -4 },
      { size: 200, color: 'orb-accent', top: '40%', left: '60%', delay: -2 },
    ],
    subtle: [
      { size: 300, color: 'orb-primary', top: '10%', right: '5%', delay: -1 },
    ],
  };

  const orbs = configs[variant] || configs.default;

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {orbs.map((orb, i) => (
        <div
          key={i}
          className={`orb ${orb.color}`}
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            bottom: orb.bottom,
            left: orb.left,
            right: orb.right,
            animationDelay: `${orb.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
