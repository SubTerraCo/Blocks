export default function Custom404() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>404</h1>
        <p>Page not found.</p>
      </div>
    </main>
  );
}
