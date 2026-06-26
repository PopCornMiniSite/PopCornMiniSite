import { useAtmosphereStore } from '@/stores/atmosphereStore'

/* ─── Star field ─── */
function StarField() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {Array.from({ length: 50 }).map((_, i) => {
        const size = 1 + (i % 3)
        const dur = 2.8 + (i % 5) * 1.4
        const hue = (i * 47) % 360
        const warmth = i % 3 === 0 ? '88%,95%' : i % 3 === 1 ? '60%,90%' : '50%,85%'
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${(i * 13.7 + 3) % 100}%`,
              top: `${(i * 29.3 + 7) % 95 + 2}%`,
              width: size,
              height: size,
              background: `hsla(${hue}, ${warmth}, 0.9)`,
              boxShadow: `0 0 ${size * 3}px hsla(${hue}, ${warmth}, 0.5)`,
              animation: `star-twinkle ${dur}s ease-in-out infinite, star-drift ${dur * 3}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s, ${i * 0.35}s`,
              willChange: 'transform, opacity',
            }}
          />
        )
      })}
      <div
        className="absolute rounded-full"
        style={{
          left: '75%', top: '15%',
          width: 2, height: 2,
          background: 'white',
          boxShadow: '0 0 6px white, 0 0 20px rgba(255,255,255,0.4)',
          animation: 'star-meteor 16s ease-in-out infinite',
          animationDelay: '8s',
          willChange: 'transform, opacity',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          left: '30%', top: '8%',
          width: 1.5, height: 1.5,
          background: 'white',
          boxShadow: '0 0 4px white, 0 0 12px rgba(255,200,150,0.3)',
          animation: 'star-meteor 20s ease-in-out infinite',
          animationDelay: '3s',
          willChange: 'transform, opacity',
        }}
      />
    </div>
  )
}

/* ─── Distant flashes ─── */
function DistantFlashes() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {Array.from({ length: 10 }).map((_, i) => {
        const dur = 6 + (i % 4) * 4
        const x = (i * 19.7 + 11) % 93 + 3
        const y = (i * 37.3 + 5) % 90 + 5
        return (
          <div key={i}>
            <div
              className="absolute rounded-full"
              style={{
                left: `${x}%`, top: `${y}%`,
                width: 3 + (i % 3) * 2,
                height: 3 + (i % 3) * 2,
                background: 'white',
                boxShadow: [
                  `0 0 ${6 + (i % 3) * 4}px rgba(255,255,255,0.8)`,
                  `0 0 ${16 + (i % 2) * 10}px rgba(255,220,180,0.4)`,
                  `0 0 ${40 + i * 5}px rgba(255,200,150,0.15)`,
                ].join(', '),
                animation: `flash-pop ${dur}s ease-in-out infinite`,
                animationDelay: `${i * 1.3 + (i % 2) * 0.7}s`,
                willChange: 'transform, opacity, filter',
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                left: `${x}%`, top: `${y}%`,
                width: 80 + (i % 4) * 30,
                height: 80 + (i % 4) * 30,
                transform: 'translate(-50%, -50%)',
                background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
                animation: `flash-glow-pulse ${dur}s ease-in-out infinite`,
                animationDelay: `${i * 1.3 + (i % 2) * 0.7}s`,
                willChange: 'opacity',
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

/* ─── Bokeh discs ─── */
function BokehDiscs() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {Array.from({ length: 6 }).map((_, i) => {
        const size = 120 + (i % 4) * 80
        const hue = (i * 37) % 360
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${10 + (i * 17.3) % 75}%`,
              top: `${5 + (i * 23.7) % 75}%`,
              width: size,
              height: size,
              background: `radial-gradient(circle at 35% 30%, hsla(${hue}, 50%, 70%, 0.06) 0%, hsla(${hue}, 30%, 40%, 0.02) 50%, transparent 70%)`,
              filter: 'blur(40px)',
              animation: `bokeh-drift ${28 + i * 6}s cubic-bezier(0.42, 0, 0.18, 1) infinite`,
              animationDelay: `${i * 1.8}s`,
              willChange: 'transform, opacity',
            }}
          />
        )
      })}
      {Array.from({ length: 3 }).map((_, i) => {
        const size = 200 + i * 60
        return (
          <div
            key={`ring-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${30 + i * 20}%`,
              top: `${20 + i * 15}%`,
              width: size,
              height: size,
              border: '1px solid hsla(0, 0%, 100%, 0.015)',
              boxShadow: '0 0 40px rgba(255,255,255,0.01)',
              filter: 'blur(20px)',
              animation: `bokeh-spin ${50 + i * 20}s linear infinite`,
              animationDelay: `${i * 5}s`,
              willChange: 'transform',
            }}
          />
        )
      })}
    </div>
  )
}

/* ─── Anamorphic flare ─── */
function AnamorphicFlare() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
      <div
        className="absolute"
        style={{
          left: '30%', top: '20%',
          width: '220px', height: '3px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,180,100,0.06) 20%, rgba(100,180,255,0.04) 40%, rgba(255,120,50,0.08) 55%, rgba(255,180,100,0.03) 70%, transparent 100%)',
          filter: 'blur(1.5px)',
          animation: 'flare-sweep 14s cubic-bezier(0.42, 0, 0.18, 1) infinite',
          willChange: 'transform, opacity',
        }}
      />
      <div
        className="absolute"
        style={{
          left: '50%', top: '35%',
          width: '150px', height: '1.5px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(50,150,255,0.04) 25%, rgba(255,255,255,0.05) 50%, rgba(50,150,255,0.03) 75%, transparent 100%)',
          filter: 'blur(1px)',
          animation: 'flare-sweep 18s cubic-bezier(0.42, 0, 0.18, 1) infinite',
          animationDelay: '5s',
          willChange: 'transform, opacity',
        }}
      />
      <div
        className="absolute"
        style={{
          left: '40%', top: '28%',
          width: '300px', height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,200,150,0.02) 30%, rgba(100,180,255,0.015) 70%, transparent 100%)',
          filter: 'blur(3px)',
          animation: 'flare-hover 8s ease-in-out infinite',
          willChange: 'transform, opacity',
        }}
      />
    </div>
  )
}

/* ─── Volumetric rays ─── */
function VolumetricRays() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
      <div
        className="absolute"
        style={{
          left: '50%', top: '-10%',
          width: '140%', height: '220%',
          transformOrigin: '50% 10%',
          background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,107,53,0.07) 20deg, transparent 45deg, transparent 300deg, rgba(0,212,170,0.04) 335deg, transparent 360deg)',
          animation: 'ray-spin 40s linear infinite, ray-pulse 7s ease-in-out infinite',
          willChange: 'transform, opacity',
        }}
      />
      <div
        className="absolute"
        style={{
          left: '40%', top: '0%',
          width: '100%', height: '280%',
          transformOrigin: '55% 5%',
          background: 'conic-gradient(from 180deg, transparent 0deg, rgba(0,212,170,0.05) 15deg, transparent 40deg, transparent 280deg, rgba(255,107,53,0.03) 330deg, transparent 360deg)',
          animation: 'ray-spin 55s linear infinite reverse, ray-pulse 9s ease-in-out infinite',
          willChange: 'transform, opacity',
        }}
      />
      <div
        className="absolute"
        style={{
          left: '25%', top: '5%',
          width: '120%', height: '200%',
          transformOrigin: '60% 8%',
          background: 'conic-gradient(from 90deg, transparent 0deg, rgba(255,255,255,0.03) 12deg, transparent 30deg, transparent 270deg, rgba(0,212,170,0.025) 320deg, transparent 360deg)',
          animation: 'ray-spin 70s linear infinite, ray-pulse 11s ease-in-out infinite 2s',
          willChange: 'transform, opacity',
        }}
      />
    </div>
  )
}

/* ─── Light motes ─── */
function LightMotes() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 3 }}>
      {Array.from({ length: 24 }).map((_, i) => {
        const size = 2 + (i % 4)
        const dur = 12 + (i % 6) * 4
        const hue = (i * 27) % 360
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${4 + (i * 7.3) % 92}%`,
              bottom: `${3 + (i * 11) % 45}%`,
              width: size,
              height: size,
              background: `radial-gradient(circle at 30% 30%, hsla(${hue}, 80%, 80%, 0.9), hsla(${hue}, 70%, 50%, 0.3))`,
              boxShadow: [
                `0 0 ${size * 1.5}px hsla(${hue}, 80%, 70%, 0.4)`,
                `0 0 ${size * 4}px hsla(${hue}, 70%, 50%, 0.15)`,
              ].join(', '),
              animation: `mote-float ${dur}s cubic-bezier(0.42, 0, 0.18, 1) infinite, mote-drift ${dur * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.6}s, ${i * 0.8}s`,
              willChange: 'transform, opacity',
            }}
          />
        )
      })}
    </div>
  )
}

/* ─── Micro dust ─── */
function MicroDust() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {Array.from({ length: 20 }).map((_, i) => {
        const dur = 20 + (i % 4) * 8
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${(i * 11.3 + 5) % 95}%`,
              top: `${40 + (i * 7.7) % 50}%`,
              width: 1, height: 1,
              background: 'hsla(0, 0%, 70%, 0.3)',
              animation: `dust-float ${dur}s cubic-bezier(0.42, 0, 0.18, 1) infinite`,
              animationDelay: `${i * 1.5}s`,
              willChange: 'transform, opacity',
            }}
          />
        )
      })}
    </div>
  )
}

/* ─── Film grain ─── */
function FilmGrain() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        zIndex: 4,
        opacity: 0.04,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '160px 160px',
        animation: 'grain-shift 7s cubic-bezier(0.42, 0, 0.18, 1) infinite',
        willChange: 'transform, opacity',
      }}
    />
  )
}

/* ─── Light wrap ─── */
function LightWrap() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        zIndex: 1,
        background: 'radial-gradient(ellipse 80% 35% at 50% 10%, rgba(255,255,255,0.04) 0%, transparent 55%)',
        animation: 'breath-fast 5s ease-in-out infinite',
        '--bo': '1',
        willChange: 'opacity',
      } as React.CSSProperties}
    />
  )
}

/* ─── Main atmosphere component ─── */
export function CinematicAtmosphere() {
  const { posterUrl, backdropUrl } = useAtmosphereStore()

  if (!posterUrl || !backdropUrl) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">

      {/* 1. Poster colour wash */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${posterUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(100px) saturate(3.5) brightness(1.3)',
          transform: 'scale(2)',
          opacity: 0.35,
          maskImage: 'linear-gradient(to bottom, black 0%, black 18%, rgba(0,0,0,0.5) 42%, rgba(0,0,0,0.1) 78%, rgba(0,0,0,0.03) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 18%, rgba(0,0,0,0.5) 42%, rgba(0,0,0,0.1) 78%, rgba(0,0,0,0.03) 100%)',
          animation: 'breath-slow 6.5s ease-in-out infinite',
          willChange: 'opacity, filter',
        }}
      />

      {/* 2. Backdrop ambient fill */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${backdropUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(70px) saturate(2) brightness(0.9)',
          transform: 'scale(1.6)',
          opacity: 0.22,
          maskImage: 'linear-gradient(to bottom, black 0%, black 12%, rgba(0,0,0,0.4) 38%, rgba(0,0,0,0.08) 72%, rgba(0,0,0,0.02) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 12%, rgba(0,0,0,0.4) 38%, rgba(0,0,0,0.08) 72%, rgba(0,0,0,0.02) 100%)',
          animation: 'breath-medium 8s ease-in-out infinite',
          willChange: 'opacity, filter',
        }}
      />

      {/* 3. Light bloom */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 65% 28% at 50% 12%, rgba(255,255,255,0.12) 0%, transparent 65%)',
          animation: 'breath-fast 4.5s ease-in-out infinite',
          '--bo': '1',
          willChange: 'opacity',
        } as React.CSSProperties}
      />

      {/* 4. Light wrap */}
      <LightWrap />

      {/* 5. Star field */}
      <StarField />

      {/* 6. Distant flashes */}
      <DistantFlashes />

      {/* 7. Bokeh discs */}
      <BokehDiscs />

      {/* 8. Anamorphic flare */}
      <AnamorphicFlare />

      {/* 9. Volumetric rays */}
      <VolumetricRays />

      {/* 10. Light motes */}
      <LightMotes />

      {/* 11. Micro dust */}
      <MicroDust />

      {/* 12. Film grain */}
      <FilmGrain />

      {/* 13. Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 5,
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)',
        }}
      />

    </div>
  )
}

export default CinematicAtmosphere