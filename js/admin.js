(() => {
  const loginView = document.getElementById("admin-login");
  const dashView = document.getElementById("admin-dash");
  const loginForm = document.getElementById("admin-login-form");
  const loginError = document.getElementById("admin-login-error");
  const logoutBtn = document.getElementById("admin-logout");
  const refreshBtn = document.getElementById("admin-refresh");
  const countEl = document.getElementById("admin-count");
  const tbody = document.getElementById("admin-rows");
  const emptyEl = document.getElementById("admin-empty");
  const statusEl = document.getElementById("admin-status");

  let client;

  try {
    client = window.createStarsSupabase();
  } catch (err) {
    if (loginError) loginError.textContent = err.message || "Could not start admin.";
    return;
  }

  const setStatus = (msg) => {
    if (statusEl) statusEl.textContent = msg || "";
  };

  const showLogin = () => {
    loginView.hidden = false;
    dashView.hidden = true;
  };

  const showDash = () => {
    loginView.hidden = true;
    dashView.hidden = false;
  };

  const formatWhen = (iso) => {
    try {
      return new Intl.DateTimeFormat("en-BW", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const loadRequests = async () => {
    setStatus("Loading…");
    const [{ data: count, error: countErr }, { data: rows, error: listErr }] = await Promise.all([
      client.rpc("get_waitlist_count"),
      client
        .from("waitlist_requests")
        .select("id, full_name, phone, message, status, created_at")
        .order("created_at", { ascending: false }),
    ]);

    if (countErr || listErr) {
      setStatus(countErr?.message || listErr?.message || "Could not load requests.");
      return;
    }

    if (countEl) countEl.textContent = String(count ?? 0);

    if (!rows?.length) {
      tbody.innerHTML = "";
      if (emptyEl) emptyEl.hidden = false;
      setStatus("No requests yet.");
      return;
    }

    if (emptyEl) emptyEl.hidden = true;
    tbody.innerHTML = rows
      .map((row) => {
        const options = ["new", "contacted", "closed"]
          .map(
            (s) =>
              `<option value="${s}" ${row.status === s ? "selected" : ""}>${s}</option>`
          )
          .join("");
        return `<tr data-id="${escapeHtml(row.id)}">
          <td data-label="When">${escapeHtml(formatWhen(row.created_at))}</td>
          <td data-label="Name">${escapeHtml(row.full_name)}</td>
          <td data-label="Phone"><a href="tel:${escapeHtml(row.phone)}">${escapeHtml(row.phone)}</a></td>
          <td data-label="Message">${escapeHtml(row.message)}</td>
          <td data-label="Status">
            <select class="admin-status" aria-label="Update status for ${escapeHtml(row.full_name)}">${options}</select>
          </td>
        </tr>`;
      })
      .join("");

    setStatus(`${rows.length} request${rows.length === 1 ? "" : "s"}`);
  };

  const bootSession = async () => {
    const { data } = await client.auth.getSession();
    const session = data?.session;
    const role = session?.user?.app_metadata?.role;
    if (session && role === "admin") {
      showDash();
      await loadRequests();
    } else {
      if (session) await client.auth.signOut();
      showLogin();
    }
  };

  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (loginError) loginError.textContent = "";
    const email = loginForm.email.value.trim();
    const password = loginForm.password.value;
    const btn = loginForm.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;

    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (btn) btn.disabled = false;

    if (error) {
      if (loginError) loginError.textContent = "Invalid email or password.";
      return;
    }

    if (data.user?.app_metadata?.role !== "admin") {
      await client.auth.signOut();
      if (loginError) loginError.textContent = "This account is not an admin.";
      return;
    }

    loginForm.reset();
    showDash();
    await loadRequests();
  });

  logoutBtn?.addEventListener("click", async () => {
    await client.auth.signOut();
    showLogin();
    setStatus("");
  });

  refreshBtn?.addEventListener("click", () => loadRequests());

  tbody?.addEventListener("change", async (e) => {
    const select = e.target.closest("select.admin-status");
    if (!select) return;
    const row = select.closest("tr");
    const id = row?.dataset.id;
    if (!id) return;
    select.disabled = true;
    const { error } = await client
      .from("waitlist_requests")
      .update({ status: select.value })
      .eq("id", id);
    select.disabled = false;
    if (error) {
      setStatus(error.message);
      await loadRequests();
    } else {
      setStatus("Status updated.");
    }
  });

  client.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") showLogin();
  });

  bootSession();
})();
