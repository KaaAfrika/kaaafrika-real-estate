export function HeroBanner() {
  return (
    <div className="relative bg-[#4E008E] rounded-3xl overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="house-pattern"
              x="0"
              y="0"
              width="200"
              height="200"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 80 L 50 120 M 30 120 L 70 120 M 30 120 L 30 100 L 50 80 L 70 100 L 70 120"
                stroke="white"
                strokeWidth="2"
                fill="none"
                strokeDasharray="5,5"
              />
              <circle
                cx="50"
                cy="60"
                r="15"
                stroke="white"
                strokeWidth="2"
                fill="none"
                strokeDasharray="5,5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#house-pattern)" />
        </svg>
      </div>
      <div className="relative py-16 px-8 text-center">
        <h1
          className="text-4xl md:text-5xl font-bold text-white mb-3 text-balance"
          style={{ fontFamily: "Chantilly Serial" }}
        >
          KaaAfrika Live
        </h1>
        <p className="text-xl text-white/90">Find Your Perfect Property</p>
      </div>
    </div>
  );
}
