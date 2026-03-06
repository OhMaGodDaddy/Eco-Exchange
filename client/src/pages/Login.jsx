import { FaGoogle } from 'react-icons/fa';
import logoImage from '../assets/ecoexchange-logo.svg';

function Login() {
  const handleGoogleLogin = () => {
    window.open('https://eco-exchange-api.onrender.com/auth/google', '_self');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e2e8e2] to-[#f8faf8] text-slate-900">
      <nav className="sticky top-0 z-20 border-b border-[#ccdacc]/60 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 lg:px-12">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 overflow-hidden rounded-xl shadow-sm ring-1 ring-[#4d6a4d]/20">
              <img src={logoImage} alt="EcoExchange logo" className="h-full w-full object-cover" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#2d3a2d]">EcoExchange</span>
          </div>

          <div className="hidden items-center gap-10 md:flex">
            <span className="font-semibold text-[#3f553f]">About</span>
            <span className="font-semibold text-[#3f553f]">How it works</span>
            <span className="font-semibold text-[#3f553f]">Impact</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="rounded-full bg-[#4d6a4d] px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#3f553f]"
          >
            Get Started
          </button>
        </div>
      </nav>

      <main className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-7xl grid-cols-1 items-center gap-14 px-6 py-10 lg:grid-cols-2 lg:px-12">
        <section className="flex flex-col gap-7">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#ccdacc]/70 px-4 py-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#3f553f]">Local Bartering Platform</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-[#2d3a2d] xl:text-6xl">
              Exchange more, <br />
              <span className="text-[#628462]">waste less</span>
            </h1>
            <p className="max-w-xl text-lg font-medium leading-relaxed text-[#4d6a4d]">
              Join your neighborhood&apos;s greenest community. Share items, swap skills, and reduce your footprint
              through proximity-based bartering.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[#4d6a4d] px-8 py-4 text-base font-extrabold text-white shadow-xl shadow-[#4d6a4d]/20 transition hover:bg-[#3f553f]"
            >
              <FaGoogle /> Continue with Google
            </button>
            <button
              type="button"
              className="rounded-2xl border-2 border-[#a8c1a8] px-8 py-4 text-base font-extrabold text-[#3f553f] transition hover:bg-white/70"
            >
              Learn More
            </button>
          </div>

          <div className="flex items-center gap-5 pt-2">
            <div className="flex -space-x-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-[#e5ece5] text-xs font-bold text-[#3f553f]">
                A
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-[#ccdacc] text-xs font-bold text-[#3f553f]">
                M
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-[#a8c1a8] text-xs font-bold text-[#2d3a2d]">
                S
              </div>
            </div>
            <div className="h-9 w-px bg-[#a8c1a8]" />
            <span className="text-sm font-semibold italic text-[#4d6a4d]">Join 2,000+ neighbors today</span>
          </div>
        </section>

        <section className="relative hidden lg:block">
          <div className="relative z-10 aspect-square overflow-hidden rounded-3xl border-8 border-white bg-white shadow-2xl">
            <img src={logoImage} alt="EcoExchange visual" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2d3a2d]/45 to-transparent" />
            <div className="absolute bottom-7 left-7 right-7 rounded-2xl border border-white/60 bg-white/90 p-5 shadow-lg backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#628462] text-white">♻</div>
                <div>
                  <p className="text-sm font-bold text-[#2d3a2d]">Recent Exchange</p>
                  <p className="text-xs text-[#4d6a4d]">A ladder exchanged for a mini planter set</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-[#ccdacc] opacity-70 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-[#a8c1a8] opacity-70 blur-3xl" />
        </section>
      </main>
    </div>
  );
}

export default Login;