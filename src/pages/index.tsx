import { Geist } from "next/font/google";
import { useEffect, useState } from "react";

const geist = Geist({ subsets: ["latin"] });

// ─── Types ────────────────────────────────────────────────────────────────────

type Usuario = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
};

type Livro = {
  id: string;
  titulo: string;
  autor: string;
  genero: string;
  quantidade: number;
  qtdEmprestados: number;
};

type Emprestimo = {
  id: string;
  usuarioId: string;
  livrosIds: string[];
  dataEmprestimo: string;
  dataDevolucao: string | null;
  status: string;
};

type Aba = "livros" | "usuarios" | "emprestimos";

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Home() {
  const [aba, setAba] = useState<Aba>("livros");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [livros, setLivros] = useState<Livro[]>([]);
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [feedback, setFeedback] = useState<{ tipo: "sucesso" | "erro"; msg: string } | null>(null);

  // Formulários
  const [formUsuario, setFormUsuario] = useState({ nome: "", email: "", telefone: "" });
  const [formLivro, setFormLivro] = useState({ titulo: "", autor: "", genero: "", quantidade: "" });
  const [formEmprestimo, setFormEmprestimo] = useState({ usuarioId: "", livrosIds: [] as string[], dataEmprestimo: "" });
  const [formDevolucao, setFormDevolucao] = useState({ emprestimoId: "", livrosIds: [] as string[] });

  // ─── Fetch de dados ──────────────────────────────────────────────────────────

  async function carregarUsuarios() {
    const res = await fetch("/api/list/usuarios");
    const data = await res.json();
    setUsuarios(data.usuarios || []);
  }

  async function carregarLivros() {
    const res = await fetch("/api/list/livros");
    const data = await res.json();
    setLivros(data.livros || []);
  }

  async function carregarEmprestimos() {
    const res = await fetch("/api/list/emprestimos");
    const data = await res.json();
    setEmprestimos(data.emprestimos || []);
  }

  useEffect(() => {
    carregarUsuarios();
    carregarLivros();
    carregarEmprestimos();
  }, []);

  // ─── Feedback ────────────────────────────────────────────────────────────────

  function mostrarFeedback(tipo: "sucesso" | "erro", msg: string) {
    setFeedback({ tipo, msg });
    setTimeout(() => setFeedback(null), 4000);
  }

  // ─── Handlers ────────────────────────────────────────────────────────────────

  async function cadastrarUsuario(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/create/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formUsuario),
    });
    const data = await res.json();
    if (res.ok) {
      mostrarFeedback("sucesso", data.mensagem);
      setFormUsuario({ nome: "", email: "", telefone: "" });
      carregarUsuarios();
    } else {
      mostrarFeedback("erro", data.mensagem);
    }
  }

  async function cadastrarLivro(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/create/livros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formLivro, quantidade: Number(formLivro.quantidade) }),
    });
    const data = await res.json();
    if (res.ok) {
      mostrarFeedback("sucesso", data.mensagem);
      setFormLivro({ titulo: "", autor: "", genero: "", quantidade: "" });
      carregarLivros();
    } else {
      mostrarFeedback("erro", data.mensagem);
    }
  }

  async function realizarEmprestimo(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/emprestar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formEmprestimo),
    });
    const data = await res.json();
    if (res.ok) {
      mostrarFeedback("sucesso", data.mensagem);
      setFormEmprestimo({ usuarioId: "", livrosIds: [], dataEmprestimo: "" });
      carregarLivros();
      carregarEmprestimos();
    } else {
      mostrarFeedback("erro", data.mensagem);
    }
  }

  async function realizarDevolucao(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/devolver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formDevolucao),
    });
    const data = await res.json();
    if (res.ok) {
      mostrarFeedback("sucesso", data.mensagem);
      setFormDevolucao({ emprestimoId: "", livrosIds: [] });
      carregarLivros();
      carregarEmprestimos();
    } else {
      mostrarFeedback("erro", data.mensagem);
    }
  }

  function toggleLivroEmprestimo(id: string) {
    setFormEmprestimo((prev) => ({
      ...prev,
      livrosIds: prev.livrosIds.includes(id)
        ? prev.livrosIds.filter((l) => l !== id)
        : [...prev.livrosIds, id],
    }));
  }

  function toggleLivroDevolucao(id: string) {
    setFormDevolucao((prev) => ({
      ...prev,
      livrosIds: prev.livrosIds.includes(id)
        ? prev.livrosIds.filter((l) => l !== id)
        : [...prev.livrosIds, id],
    }));
  }

  const emprestimoSelecionado = emprestimos.find((e) => e.id === formDevolucao.emprestimoId);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className={geist.className} style={styles.page}>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <h1 style={styles.titulo}>📚 Biblioteca</h1>
            <p style={styles.subtitulo}>Sistema de Gestão</p>
          </div>
          <nav style={styles.nav}>
            {(["livros", "usuarios", "emprestimos"] as Aba[]).map((a) => (
              <button
                key={a}
                onClick={() => setAba(a)}
                style={{ ...styles.navBtn, ...(aba === a ? styles.navBtnAtivo : {}) }}
              >
                {a === "livros" ? "📖 Livros" : a === "usuarios" ? "👤 Usuários" : "🔄 Empréstimos"}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Feedback */}
      {feedback && (
        <div style={{ ...styles.feedback, ...(feedback.tipo === "sucesso" ? styles.feedbackSucesso : styles.feedbackErro) }}>
          {feedback.tipo === "sucesso" ? "✅" : "❌"} {feedback.msg}
        </div>
      )}

      <main style={styles.main}>

        {/* ── ABA LIVROS ─────────────────────────────────────────────────────── */}
        {aba === "livros" && (
          <div style={styles.grid2}>
            <section style={styles.card}>
              <h2 style={styles.cardTitulo}>Cadastrar Livro</h2>
              <form onSubmit={cadastrarLivro} style={styles.form}>
                <label style={styles.label}>Título</label>
                <input style={styles.input} value={formLivro.titulo} onChange={(e) => setFormLivro({ ...formLivro, titulo: e.target.value })} placeholder="Ex: Dom Casmurro" required />
                <label style={styles.label}>Autor</label>
                <input style={styles.input} value={formLivro.autor} onChange={(e) => setFormLivro({ ...formLivro, autor: e.target.value })} placeholder="Ex: Machado de Assis" required />
                <label style={styles.label}>Gênero</label>
                <input style={styles.input} value={formLivro.genero} onChange={(e) => setFormLivro({ ...formLivro, genero: e.target.value })} placeholder="Ex: Romance" required />
                <label style={styles.label}>Quantidade</label>
                <input style={styles.input} type="number" min={1} value={formLivro.quantidade} onChange={(e) => setFormLivro({ ...formLivro, quantidade: e.target.value })} placeholder="Ex: 3" required />
                <button style={styles.btnPrimario} type="submit">Cadastrar</button>
              </form>
            </section>

            <section style={styles.card}>
              <h2 style={styles.cardTitulo}>
                Livros Cadastrados <span style={styles.badge}>{livros.length}</span>
              </h2>
              <div style={styles.lista}>
                {livros.length === 0 && <p style={styles.vazio}>Nenhum livro cadastrado.</p>}
                {livros.map((l) => (
                  <div key={l.id} style={styles.item}>
                    <div style={styles.itemTitulo}>{l.titulo}</div>
                    <div style={styles.itemSub}>{l.autor} · {l.genero}</div>
                    <div style={styles.itemMeta}>
                      <span style={styles.tag}>
                        Disponíveis: {l.quantidade - l.qtdEmprestados}/{l.quantidade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ── ABA USUÁRIOS ───────────────────────────────────────────────────── */}
        {aba === "usuarios" && (
          <div style={styles.grid2}>
            <section style={styles.card}>
              <h2 style={styles.cardTitulo}>Cadastrar Usuário</h2>
              <form onSubmit={cadastrarUsuario} style={styles.form}>
                <label style={styles.label}>Nome</label>
                <input style={styles.input} value={formUsuario.nome} onChange={(e) => setFormUsuario({ ...formUsuario, nome: e.target.value })} placeholder="Ex: Ana Souza" required />
                <label style={styles.label}>E-mail</label>
                <input style={styles.input} type="email" value={formUsuario.email} onChange={(e) => setFormUsuario({ ...formUsuario, email: e.target.value })} placeholder="Ex: ana@email.com" required />
                <label style={styles.label}>Telefone</label>
                <input style={styles.input} value={formUsuario.telefone} onChange={(e) => setFormUsuario({ ...formUsuario, telefone: e.target.value })} placeholder="Ex: 21999990000" required />
                <button style={styles.btnPrimario} type="submit">Cadastrar</button>
              </form>
            </section>

            <section style={styles.card}>
              <h2 style={styles.cardTitulo}>
                Usuários Cadastrados <span style={styles.badge}>{usuarios.length}</span>
              </h2>
              <div style={styles.lista}>
                {usuarios.length === 0 && <p style={styles.vazio}>Nenhum usuário cadastrado.</p>}
                {usuarios.map((u) => (
                  <div key={u.id} style={styles.item}>
                    <div style={styles.itemTitulo}>{u.nome}</div>
                    <div style={styles.itemSub}>{u.email}</div>
                    <div style={styles.itemMeta}>
                      <span style={styles.tag}>{u.telefone}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ── ABA EMPRÉSTIMOS ────────────────────────────────────────────────── */}
        {aba === "emprestimos" && (
          <div style={styles.grid2}>
            <section style={styles.card}>
              <h2 style={styles.cardTitulo}>Realizar Empréstimo</h2>
              <form onSubmit={realizarEmprestimo} style={styles.form}>
                <label style={styles.label}>Usuário</label>
                <select style={styles.input} value={formEmprestimo.usuarioId} onChange={(e) => setFormEmprestimo({ ...formEmprestimo, usuarioId: e.target.value })} required>
                  <option value="">Selecione um usuário</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>{u.nome}</option>
                  ))}
                </select>

                <label style={styles.label}>Data do Empréstimo</label>
                <input style={styles.input} type="date" value={formEmprestimo.dataEmprestimo} onChange={(e) => setFormEmprestimo({ ...formEmprestimo, dataEmprestimo: e.target.value })} required />

                <label style={styles.label}>Livros disponíveis</label>
                <div style={styles.checkList}>
                  {livros.filter((l) => l.quantidade > l.qtdEmprestados).length === 0 && (
                    <p style={styles.vazio}>Nenhum livro disponível.</p>
                  )}
                  {livros.filter((l) => l.quantidade > l.qtdEmprestados).map((l) => (
                    <label key={l.id} style={styles.checkItem}>
                      <input
                        type="checkbox"
                        checked={formEmprestimo.livrosIds.includes(l.id)}
                        onChange={() => toggleLivroEmprestimo(l.id)}
                      />
                      <span>{l.titulo} <small style={styles.small}>({l.quantidade - l.qtdEmprestados} disp.)</small></span>
                    </label>
                  ))}
                </div>

                <button style={styles.btnPrimario} type="submit" disabled={formEmprestimo.livrosIds.length === 0}>
                  Confirmar Empréstimo
                </button>
              </form>

              <h2 style={{ ...styles.cardTitulo, marginTop: 32 }}>Realizar Devolução</h2>
              <form onSubmit={realizarDevolucao} style={styles.form}>
                <label style={styles.label}>Empréstimo Ativo</label>
                <select
                  style={styles.input}
                  value={formDevolucao.emprestimoId}
                  onChange={(e) => setFormDevolucao({ emprestimoId: e.target.value, livrosIds: [] })}
                  required
                >
                  <option value="">Selecione um empréstimo</option>
                  {emprestimos.filter((e) => e.status === "ativo").map((e) => {
                    const usuario = usuarios.find((u) => u.id === e.usuarioId);
                    return (
                      <option key={e.id} value={e.id}>
                        {usuario?.nome ?? e.usuarioId} — {e.dataEmprestimo}
                      </option>
                    );
                  })}
                </select>

                {emprestimoSelecionado && (
                  <>
                    <label style={styles.label}>Livros a devolver</label>
                    <div style={styles.checkList}>
                      {emprestimoSelecionado.livrosIds.map((lid) => {
                        const livro = livros.find((l) => l.id === lid);
                        return (
                          <label key={lid} style={styles.checkItem}>
                            <input
                              type="checkbox"
                              checked={formDevolucao.livrosIds.includes(lid)}
                              onChange={() => toggleLivroDevolucao(lid)}
                            />
                            <span>{livro?.titulo ?? lid}</span>
                          </label>
                        );
                      })}
                    </div>
                  </>
                )}

                <button style={styles.btnSecundario} type="submit" disabled={formDevolucao.livrosIds.length === 0}>
                  Confirmar Devolução
                </button>
              </form>
            </section>

            {/* Histórico */}
            <section style={styles.card}>
              <h2 style={styles.cardTitulo}>
                Histórico <span style={styles.badge}>{emprestimos.length}</span>
              </h2>
              <div style={styles.lista}>
                {emprestimos.length === 0 && <p style={styles.vazio}>Nenhum empréstimo registrado.</p>}
                {[...emprestimos].reverse().map((e) => {
                  const usuario = usuarios.find((u) => u.id === e.usuarioId);
                  const titulosLivros = e.livrosIds.map((lid) => livros.find((l) => l.id === lid)?.titulo ?? lid);
                  return (
                    <div key={e.id} style={styles.item}>
                      <div style={styles.itemTitulo}>{usuario?.nome ?? e.usuarioId}</div>
                      <div style={styles.itemSub}>{titulosLivros.join(", ")}</div>
                      <div style={styles.itemMeta}>
                        <span style={{ ...styles.tag, ...(e.status === "ativo" ? styles.tagAtivo : styles.tagConcluido) }}>
                          {e.status}
                        </span>
                        <span style={styles.tagData}>📅 {e.dataEmprestimo}</span>
                        {e.dataDevolucao && <span style={styles.tagData}>🔄 {e.dataDevolucao}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "var(--background)",
    color: "var(--foreground)",
  },
  header: {
    borderBottom: "1px solid #e5e7eb",
    padding: "16px 24px",
    position: "sticky",
    top: 0,
    background: "var(--background)",
    zIndex: 10,
  },
  headerInner: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  titulo: { margin: 0, fontSize: 22, fontWeight: 700 },
  subtitulo: { margin: 0, fontSize: 13, opacity: 0.5 },
  nav: { display: "flex", gap: 8 },
  navBtn: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    background: "transparent",
    color: "var(--foreground)",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
  },
  navBtnAtivo: {
    background: "#171717",
    color: "#fff",
    border: "1px solid #171717",
  },
  feedback: {
    maxWidth: 1100,
    margin: "16px auto 0",
    padding: "12px 20px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
  },
  feedbackSucesso: { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" },
  feedbackErro: { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" },
  main: { maxWidth: 1100, margin: "32px auto", padding: "0 24px 48px" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 24,
    background: "var(--background)",
  },
  cardTitulo: { margin: "0 0 20px", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 },
  badge: {
    background: "#f3f4f6",
    color: "#6b7280",
    borderRadius: 20,
    padding: "2px 10px",
    fontSize: 12,
    fontWeight: 600,
  },
  form: { display: "flex", flexDirection: "column", gap: 10 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 14,
    background: "var(--background)",
    color: "var(--foreground)",
    outline: "none",
    width: "100%",
  },
  btnPrimario: {
    marginTop: 8,
    padding: "10px 0",
    borderRadius: 8,
    border: "none",
    background: "#171717",
    color: "#fff",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  btnSecundario: {
    marginTop: 8,
    padding: "10px 0",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    background: "transparent",
    color: "var(--foreground)",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  lista: { display: "flex", flexDirection: "column", gap: 12, maxHeight: 520, overflowY: "auto" },
  item: {
    padding: "14px 16px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    background: "var(--background)",
  },
  itemTitulo: { fontWeight: 600, fontSize: 14, marginBottom: 2, color: "var(--foreground)" },
  itemSub: { fontSize: 13, color: "#6b7280", marginBottom: 6 },
  itemMeta: { display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" },
  tag: {
    fontSize: 12,
    padding: "2px 10px",
    borderRadius: 20,
    background: "#f3f4f6",
    color: "#374151",
    fontWeight: 500,
  },
  tagAtivo: { background: "#fef9c3", color: "#854d0e" },
  tagConcluido: { background: "#f0fdf4", color: "#166534" },
  tagData: { fontSize: 12, color: "#9ca3af" },
  checkList: { display: "flex", flexDirection: "column", gap: 8, maxHeight: 180, overflowY: "auto", padding: "4px 0" },
  checkItem: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" },
  small: { color: "#9ca3af", fontSize: 12 },
  vazio: { color: "#9ca3af", fontSize: 13, textAlign: "center", padding: "16px 0" },
};