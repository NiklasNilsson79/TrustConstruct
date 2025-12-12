export default function LoginPage() {
  return (
    <div style={{ maxWidth: 420, margin: '80px auto', padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>TrustConstruct</h1>
      <p style={{ marginTop: 0, opacity: 0.7 }}>Sign in to continue</p>

      <form style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        <label>
          Email
          <input
            type="email"
            placeholder="you@company.com"
            style={{ width: '100%', padding: 10, marginTop: 6 }}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            placeholder="••••••••"
            style={{ width: '100%', padding: 10, marginTop: 6 }}
          />
        </label>

        <button type="button" style={{ padding: 10, marginTop: 8 }}>
          Sign in
        </button>
      </form>
    </div>
  );
}
