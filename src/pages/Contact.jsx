function Contact() {
  return (
    <main className="min-h-screen px-6 py-20">
      <p className="mb-4 text-sm uppercase tracking-widest text-neutral-400">
        Contact
      </p>
      <h1 className="text-6xl font-semibold">Let's Build Something.</h1>

      <form className="mt-12 grid max-w-2xl gap-5">
        <label>
          Name
          <input className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3" />
        </label>

        <label>
          Email
          <input type="email" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3" />
        </label>

        <label>
          Phone
          <input className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3" />
        </label>

        <label>
          Project Type
          <select className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3">
            <option>Residential</option>
            <option>Commercial</option>
            <option>Industrial</option>
            <option>Renovation</option>
          </select>
        </label>

        <label>
          Message
          <textarea rows="5" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3" />
        </label>

        <button
          type="button"
          className="rounded-xl bg-white px-5 py-3 font-medium text-black"
        >
          Send Enquiry
        </button>
      </form>
    </main>
  );
}

export default Contact;