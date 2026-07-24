// app/signup/page.tsx
export default function SignupPage() {
  return (
    <div className="min-h-screen w-full bg-[#1a1a1a] relative overflow-hidden flex items-center">
      {/* Background Image Layer - use the same image as login */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-80"
        style={{
          backgroundImage: `url('/golden-drops-bg.jpg')`
          // CHANGE THIS to whatever your login file uses.
          // Look in app/login/page.tsx to find the exact file name
        }}
      />

      {/* Dark overlay so text pops */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 px-8 py-12">

        {/* LEFT */}
        <div className="text-white">
          <h1 className="text-6xl font-black leading-[0.9] tracking-tight">
            Your Neighborhood.<br/>
            Your Voice.<br/>
            Your Space.
          </h1>
          <p className="mt-8 text-white/90 leading-relaxed max-w-xl">
            Sweet Social Space is a neighborhood-first community platform. Own your code, own your speech. No algorithms, no shadowbans, no Big Tech filters. Just real neighbors within 10-20 miles of you sharing alerts, free stuff, faith, and what is actually happening near you.
          </p>
          <p className="mt-6 text-sm text-white/70 max-w-xl">
            Chronological feed. Speak Freely vent wall. Local alerts, marketplace, business directory, and emergency updates. Built for your neighborhood, built for you. Speak Freely. Love your neighbor. Ask yourself What would Jesus do?
          </p>
        </div>

        {/* RIGHT CARD - This is the signup form with the teardrop bg behind it */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-white text-center">Sweet Social Space</h2>
          <p className="text-center text-white/70 mt-2">Speak Freely. Love your neighbor.</p>

          <div className="mt-8 space-y-4">
            <div>
              <label className="text-sm text-white/80">Email address</label>
              <input placeholder="Your email address" className="mt-1 w-full rounded-lg px-4 py-3 bg-white text-black" />
            </div>
            <div>
              <label className="text-sm text-white/80">Create a Password</label>
              <input placeholder="Your password" type="password" className="mt-1 w-full rounded-lg px-4 py-3 bg-white text-black" />
            </div>

            <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg mt-2">
              Sign up
            </button>

            <p className="text-center text-sm text-white/70 mt-4">
              Already have an account? <a href="/login" className="text-white underline font-bold">Sign in</a>
            </p>
            <p className="text-center text- text-white/50 mt-4">
              By signing up, you agree to our Terms of Service and Privacy Policy.<br/>We never sell your data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
