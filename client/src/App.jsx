import { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { apiRequest } from "./api";
import "./App.css";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/products", label: "Products" },
  { path: "/suppliers", label: "Suppliers" },
  { path: "/inventory", label: "Inventory" },
  { path: "/orders", label: "Orders" },
];

const emptyProduct = {
  name: "",
  sku: "",
  quantity: 0,
  price: 0,
  lowStockThreshold: 10,
  description: "",
  supplierId: "",
};

const emptySupplier = {
  name: "",
  email: "",
  phone: "",
};

function PageIntro({ eyebrow, title, description, aside }) {
  return (
    <div className="page-intro">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
        <p className="panel-copy">{description}</p>
      </div>
      {aside ? <div className="page-intro-aside">{aside}</div> : null}
    </div>
  );
}

function ProtectedRoute({ token }) {
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

function AuthPage({ mode, onSubmit, notice }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    const normalizedForm = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
    };

    if (mode === "signup") {
      if (normalizedForm.password.length < 6) {
        setMessage("Password must be at least 6 characters.");
        return;
      }
      if (normalizedForm.password !== normalizedForm.confirmPassword) {
        setMessage("Confirm password must match password.");
        return;
      }
    }

    setBusy(true);
    setMessage("");
    try {
      await onSubmit(mode, normalizedForm);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-layout">
        <section className="auth-showcase">
          <p className="eyebrow">Inventory OS</p>
          <h1>StockPilot Console</h1>
          <p className="sub">
            Run purchasing, stock movement, and supplier operations from one clean command center.
          </p>
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-dot" aria-hidden="true" />
              <div>
                <h4>Live Inventory Health</h4>
                <p>Track low stock and total value before shortages impact sales.</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-dot" aria-hidden="true" />
              <div>
                <h4>Supplier Control</h4>
                <p>Keep your vendor network organized with direct product mapping.</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-dot" aria-hidden="true" />
              <div>
                <h4>Order Workflow</h4>
                <p>Approve, receive, and close purchase orders in a single flow.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-card">
          <p className="eyebrow">{mode === "login" ? "Welcome back" : "Create workspace access"}</p>
          <h2>{mode === "login" ? "Sign in to continue" : "Create your account"}</h2>
          <p className="sub">Spring Boot API connected frontend</p>
          <form onSubmit={submit} className="grid two">
            {mode === "signup" ? (
              <label>
                Name
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </label>
            ) : null}
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
            </label>
            {mode === "signup" ? (
              <label>
                Confirm Password
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
              </label>
            ) : null}
            <button className="btn primary" disabled={busy}>
              {busy ? "Please wait" : mode === "login" ? "Login" : "Signup"}
            </button>
          </form>
          <div className="row">
            <NavLink className="btn ghost" to={mode === "login" ? "/signup" : "/login"}>
              Switch to {mode === "login" ? "signup" : "login"}
            </NavLink>
            <span className="hint">Default admin: admin@inventory.local / admin123</span>
          </div>
          {message ? <p className="note">{message}</p> : null}
          {!message && notice ? <p className="note">{notice}</p> : null}
        </section>
      </div>
    </div>
  );
}

function Layout({ user, onRefresh, onLogout, message }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="orb-stack" aria-hidden="true">
            <span className="orb orb-a" />
            <span className="orb orb-b" />
          </div>
          <div>
            <h2>Inventory Console</h2>
            <p>
              {user.name} ({user.role})
            </p>
          </div>
        </div>
        <div className="topbar-tools">
          <div className="status-pills">
            <span className="pill">Operations hub</span>
            <span className="pill soft">{user.role || "Member"} access</span>
          </div>
          <div className="row">
            <button className="btn" onClick={onRefresh}>
              Refresh
            </button>
            <button className="btn ghost" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="tabs">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `tab ${isActive ? "active" : ""}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {message ? <div className="banner">{message}</div> : null}
      <Outlet />
    </div>
  );
}

function DashboardPage({ dashboard, onLoadLowStock }) {
  const navigate = useNavigate();

  async function handleLowStock() {
    await onLoadLowStock();
    navigate("/products");
  }

  if (!dashboard) {
    return <section className="panel">Loading dashboard...</section>;
  }

  return (
    <section className="dashboard-stack">
      <PageIntro
        eyebrow="Overview"
        title="A softer command center for your inventory"
        description="Track what is in stock, what needs attention, and how your catalog is growing at a glance."
        aside={<span className="pill highlight">Live summary</span>}
      />
      <section className="cards">
        <article className="card accent-a">
          <span className="card-tag">Catalog</span>
          <h3>Total Products</h3>
          <p>{dashboard.totalProducts}</p>
          <span className="card-note">Items currently listed in your system</span>
        </article>
        <article className="card accent-b">
          <span className="card-tag">Partners</span>
          <h3>Total Suppliers</h3>
          <p>{dashboard.totalSuppliers}</p>
          <span className="card-note">Active supplier relationships</span>
        </article>
        <article className="card accent-c">
          <span className="card-tag">Attention</span>
          <h3>Low Stock Items</h3>
          <p>{dashboard.lowStockProducts}</p>
          <span className="card-note">Products close to replenishment</span>
        </article>
        <article className="card accent-d">
          <span className="card-tag">Value</span>
          <h3>Inventory Value</h3>
          <p>Rs {dashboard.inventoryValue}</p>
          <span className="card-note">Estimated stock value snapshot</span>
        </article>
      </section>
      <section className="panel dashboard-spotlight">
        <div>
          <p className="eyebrow">Quick action</p>
          <h3>Need a fast restock check?</h3>
          <p className="panel-copy">
            Jump straight to products that are below their threshold and decide what needs to be purchased next.
          </p>
        </div>
        <button className="btn primary" onClick={handleLowStock}>
          Show Low Stock Products
        </button>
      </section>
    </section>
  );
}

function ProductsPage({
  products,
  search,
  setSearch,
  supplierOptions,
  productForm,
  setProductForm,
  editProductId,
  setEditProductId,
  onSearchProducts,
  reloadProducts,
  saveProduct,
  deleteProduct,
}) {
  return (
    <section className="panel">
      <PageIntro
        eyebrow="Products"
        title="Product management"
        description="Search, create, and refine your catalog with supplier links and stock thresholds."
      />
      <form className="row" onSubmit={onSearchProducts}>
        <input
          placeholder="Search by product name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn">Search</button>
        <button type="button" className="btn ghost" onClick={() => reloadProducts()}>
          Reset
        </button>
      </form>

      <form className="grid three" onSubmit={saveProduct}>
        <input
          placeholder="Name"
          value={productForm.name}
          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
          required
        />
        <input
          placeholder="SKU"
          value={productForm.sku}
          onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Quantity"
          value={productForm.quantity}
          onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Price"
          value={productForm.price}
          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Low stock threshold"
          value={productForm.lowStockThreshold}
          onChange={(e) => setProductForm({ ...productForm, lowStockThreshold: e.target.value })}
          required
        />
        <select
          value={productForm.supplierId}
          onChange={(e) => setProductForm({ ...productForm, supplierId: e.target.value })}
        >
          <option value="">No Supplier</option>
          {supplierOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          className="wide"
          placeholder="Description"
          value={productForm.description}
          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
        />
        <button className="btn primary">{editProductId ? "Update Product" : "Add Product"}</button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>SKU</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Supplier</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.sku}</td>
                <td>{p.quantity}</td>
                <td>{p.price}</td>
                <td>{p.supplier?.name || "-"}</td>
                <td className="row">
                  <button
                    className="btn"
                    onClick={() => {
                      setEditProductId(p.id);
                      setProductForm({
                        name: p.name,
                        sku: p.sku,
                        quantity: p.quantity,
                        price: p.price,
                        lowStockThreshold: p.lowStockThreshold,
                        description: p.description || "",
                        supplierId: p.supplier?.id ? String(p.supplier.id) : "",
                      });
                    }}
                  >
                    Edit
                  </button>
                  <button className="btn ghost" onClick={() => deleteProduct(p.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SuppliersPage({ suppliers, supplierForm, setSupplierForm, editSupplierId, setEditSupplierId, saveSupplier, deleteSupplier }) {
  return (
    <section className="panel">
      <PageIntro
        eyebrow="Suppliers"
        title="Supplier management"
        description="Keep your vendor list clean and easy to maintain so restocking stays frictionless."
      />
      <form className="grid three" onSubmit={saveSupplier}>
        <input
          placeholder="Supplier Name"
          value={supplierForm.name}
          onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={supplierForm.email}
          onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
          required
        />
        <input
          placeholder="Phone"
          value={supplierForm.phone}
          onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
          required
        />
        <button className="btn primary">{editSupplierId ? "Update Supplier" : "Add Supplier"}</button>
      </form>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.phone}</td>
                <td className="row">
                  <button
                    className="btn"
                    onClick={() => {
                      setEditSupplierId(s.id);
                      setSupplierForm({ name: s.name, email: s.email, phone: s.phone });
                    }}
                  >
                    Edit
                  </button>
                  <button className="btn ghost" onClick={() => deleteSupplier(s.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function InventoryPage({ products, stockInForm, setStockInForm, stockOutForm, setStockOutForm, runInventory }) {
  return (
    <section className="panel split">
      <div className="inventory-column">
        <PageIntro
          eyebrow="Inventory"
          title="Stock movements"
          description="Log stock coming in and going out with quick, operational forms."
        />
        <h3>Stock In</h3>
        <form
          className="grid"
          onSubmit={(e) => {
            e.preventDefault();
            runInventory("/api/inventory/stock-in", stockInForm, () =>
              setStockInForm({ productId: "", quantity: 1, notes: "" })
            );
          }}
        >
          <select
            value={stockInForm.productId}
            onChange={(e) => setStockInForm({ ...stockInForm, productId: e.target.value })}
            required
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Qty: {p.quantity})
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            value={stockInForm.quantity}
            onChange={(e) => setStockInForm({ ...stockInForm, quantity: e.target.value })}
            required
          />
          <input
            placeholder="Notes"
            value={stockInForm.notes}
            onChange={(e) => setStockInForm({ ...stockInForm, notes: e.target.value })}
          />
          <button className="btn primary">Apply Stock In</button>
        </form>
      </div>

      <div className="inventory-column">
        <PageIntro
          eyebrow="Dispatch"
          title="Outbound handling"
          description="Record outgoing units with quick notes so your stock ledger stays accurate."
        />
        <h3>Stock Out</h3>
        <form
          className="grid"
          onSubmit={(e) => {
            e.preventDefault();
            runInventory("/api/inventory/stock-out", stockOutForm, () =>
              setStockOutForm({ productId: "", quantity: 1, notes: "" })
            );
          }}
        >
          <select
            value={stockOutForm.productId}
            onChange={(e) => setStockOutForm({ ...stockOutForm, productId: e.target.value })}
            required
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Qty: {p.quantity})
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            value={stockOutForm.quantity}
            onChange={(e) => setStockOutForm({ ...stockOutForm, quantity: e.target.value })}
            required
          />
          <input
            placeholder="Notes"
            value={stockOutForm.notes}
            onChange={(e) => setStockOutForm({ ...stockOutForm, notes: e.target.value })}
          />
          <button className="btn primary">Apply Stock Out</button>
        </form>
      </div>
    </section>
  );
}

function OrdersPage({ products, suppliers, orderForm, setOrderForm, createOrder, orders, updateOrderStatus }) {
  return (
    <section className="panel">
      <PageIntro
        eyebrow="Orders"
        title="Purchase orders"
        description="Create supplier orders and move them from approval to receiving without leaving the workspace."
      />
      <form className="grid three" onSubmit={createOrder}>
        <select
          value={orderForm.productId}
          onChange={(e) => setOrderForm({ ...orderForm, productId: e.target.value })}
          required
        >
          <option value="">Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          value={orderForm.supplierId}
          onChange={(e) => setOrderForm({ ...orderForm, supplierId: e.target.value })}
          required
        >
          <option value="">Supplier</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          value={orderForm.quantity}
          onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
          required
        />
        <button className="btn primary">Create Order</button>
      </form>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Supplier</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.product?.name}</td>
                <td>{o.supplier?.name}</td>
                <td>{o.quantity}</td>
                <td>{o.status}</td>
                <td className="row">
                  <button className="btn" onClick={() => updateOrderStatus(o.id, "APPROVED")}>
                    Approve
                  </button>
                  <button className="btn" onClick={() => updateOrderStatus(o.id, "RECEIVED")}>
                    Receive
                  </button>
                  <button className="btn ghost" onClick={() => updateOrderStatus(o.id, "CANCELLED")}>
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("inventory_token") || "");
  const [user, setUser] = useState({
    name: localStorage.getItem("inventory_name") || "",
    email: localStorage.getItem("inventory_email") || "",
    role: localStorage.getItem("inventory_role") || "",
  });

  const [message, setMessage] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editProductId, setEditProductId] = useState(null);
  const [supplierForm, setSupplierForm] = useState(emptySupplier);
  const [editSupplierId, setEditSupplierId] = useState(null);
  const [stockInForm, setStockInForm] = useState({ productId: "", quantity: 1, notes: "" });
  const [stockOutForm, setStockOutForm] = useState({ productId: "", quantity: 1, notes: "" });
  const [orderForm, setOrderForm] = useState({ productId: "", supplierId: "", quantity: 1 });

  const supplierOptions = useMemo(
    () => suppliers.map((s) => ({ value: String(s.id), label: `${s.name} (#${s.id})` })),
    [suppliers]
  );

  useEffect(() => {
    if (token) {
      loadCoreData();
    } else {
      resetAppData();
    }
  }, [token]);

  function resetAppData() {
    setDashboard(null);
    setProducts([]);
    setSuppliers([]);
    setOrders([]);
  }

  function clearAuth(nextMessage = "") {
    localStorage.removeItem("inventory_token");
    localStorage.removeItem("inventory_name");
    localStorage.removeItem("inventory_email");
    localStorage.removeItem("inventory_role");
    setToken("");
    setUser({ name: "", email: "", role: "" });
    resetAppData();
    setMessage(nextMessage);
  }

  function handleApiError(error, fallbackMessage = "Request failed.") {
    if (error?.status === 401 || error?.status === 403) {
      clearAuth("Your session expired or is no longer authorized. Please sign in again.");
      return;
    }

    setMessage(error?.message || fallbackMessage);
  }

  async function loadCoreData() {
    try {
      const [dash, productsData, suppliersData, ordersData] = await Promise.all([
        apiRequest("/api/dashboard/summary", { token }),
        apiRequest("/api/products", { token }),
        apiRequest("/api/suppliers", { token }),
        apiRequest("/api/orders", { token }),
      ]);
      setDashboard(dash);
      setProducts(productsData || []);
      setSuppliers(suppliersData || []);
      setOrders(ordersData || []);
    } catch (error) {
      handleApiError(error, "Unable to load data.");
    }
  }

  function persistAuth(payload) {
    localStorage.setItem("inventory_token", payload.token);
    localStorage.setItem("inventory_name", payload.name);
    localStorage.setItem("inventory_email", payload.email);
    localStorage.setItem("inventory_role", payload.role);
    setToken(payload.token);
    setUser({ name: payload.name, email: payload.email, role: payload.role });
  }

  async function authenticate(mode, form) {
    const path = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
    const body =
      mode === "login"
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };
    const payload = await apiRequest(path, { method: "POST", body });
    persistAuth(payload);
    setMessage("");
  }

  function logout() {
    clearAuth("");
  }

  async function reloadProducts(q = "") {
    const query = q ? `?q=${encodeURIComponent(q)}` : "";
    const items = await apiRequest(`/api/products${query}`, { token });
    setProducts(items || []);
  }

  async function onSearchProducts(event) {
    event.preventDefault();
    try {
      await reloadProducts(search.trim());
    } catch (error) {
      handleApiError(error);
    }
  }

  async function onLoadLowStock() {
    try {
      const items = await apiRequest("/api/products/low-stock", { token });
      setProducts(items || []);
    } catch (error) {
      handleApiError(error);
    }
  }

  async function saveProduct(event) {
    event.preventDefault();
    setMessage("");
    try {
      const body = {
        ...productForm,
        quantity: Number(productForm.quantity),
        price: Number(productForm.price),
        lowStockThreshold: Number(productForm.lowStockThreshold),
        supplierId: productForm.supplierId ? Number(productForm.supplierId) : null,
      };
      if (editProductId) {
        await apiRequest(`/api/products/${editProductId}`, { method: "PUT", token, body });
      } else {
        await apiRequest("/api/products", { method: "POST", token, body });
      }
      setProductForm(emptyProduct);
      setEditProductId(null);
      await reloadProducts(search.trim());
      setDashboard(await apiRequest("/api/dashboard/summary", { token }));
      setMessage("Product saved.");
    } catch (error) {
      handleApiError(error);
    }
  }

  async function deleteProduct(id) {
    try {
      await apiRequest(`/api/products/${id}`, { method: "DELETE", token });
      await reloadProducts(search.trim());
      setDashboard(await apiRequest("/api/dashboard/summary", { token }));
      setMessage("Product deleted.");
    } catch (error) {
      handleApiError(error);
    }
  }

  async function saveSupplier(event) {
    event.preventDefault();
    try {
      if (editSupplierId) {
        await apiRequest(`/api/suppliers/${editSupplierId}`, { method: "PUT", token, body: supplierForm });
      } else {
        await apiRequest("/api/suppliers", { method: "POST", token, body: supplierForm });
      }
      setSupplierForm(emptySupplier);
      setEditSupplierId(null);
      setSuppliers(await apiRequest("/api/suppliers", { token }));
      setDashboard(await apiRequest("/api/dashboard/summary", { token }));
      setMessage("Supplier saved.");
    } catch (error) {
      handleApiError(error);
    }
  }

  async function deleteSupplier(id) {
    try {
      await apiRequest(`/api/suppliers/${id}`, { method: "DELETE", token });
      setSuppliers(await apiRequest("/api/suppliers", { token }));
      setDashboard(await apiRequest("/api/dashboard/summary", { token }));
      setMessage("Supplier deleted.");
    } catch (error) {
      handleApiError(error);
    }
  }

  async function runInventory(path, form, resetFn) {
    try {
      await apiRequest(path, {
        method: "POST",
        token,
        body: {
          productId: Number(form.productId),
          quantity: Number(form.quantity),
          notes: form.notes,
        },
      });
      await reloadProducts();
      setDashboard(await apiRequest("/api/dashboard/summary", { token }));
      resetFn();
      setMessage("Inventory updated.");
    } catch (error) {
      handleApiError(error);
    }
  }

  async function createOrder(event) {
    event.preventDefault();
    try {
      await apiRequest("/api/orders", {
        method: "POST",
        token,
        body: {
          productId: Number(orderForm.productId),
          supplierId: Number(orderForm.supplierId),
          quantity: Number(orderForm.quantity),
        },
      });
      setOrders(await apiRequest("/api/orders", { token }));
      setOrderForm({ productId: "", supplierId: "", quantity: 1 });
      setMessage("Order created.");
    } catch (error) {
      handleApiError(error);
    }
  }

  async function updateOrderStatus(id, status) {
    try {
      await apiRequest(`/api/orders/${id}/status?status=${status}`, { method: "PATCH", token });
      setOrders(await apiRequest("/api/orders", { token }));
      setMessage("Order status updated.");
    } catch (error) {
      handleApiError(error);
    }
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" onSubmit={authenticate} notice={message} />} />
        <Route path="/signup" element={<AuthPage mode="signup" onSubmit={authenticate} notice={message} />} />

        <Route element={<ProtectedRoute token={token} />}>
          <Route element={<Layout user={user} onRefresh={loadCoreData} onLogout={logout} message={message} />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={<DashboardPage dashboard={dashboard} onLoadLowStock={onLoadLowStock} />}
            />
            <Route
              path="/products"
              element={
                <ProductsPage
                  products={products}
                  search={search}
                  setSearch={setSearch}
                  supplierOptions={supplierOptions}
                  productForm={productForm}
                  setProductForm={setProductForm}
                  editProductId={editProductId}
                  setEditProductId={setEditProductId}
                  onSearchProducts={onSearchProducts}
                  reloadProducts={reloadProducts}
                  saveProduct={saveProduct}
                  deleteProduct={deleteProduct}
                />
              }
            />
            <Route
              path="/suppliers"
              element={
                <SuppliersPage
                  suppliers={suppliers}
                  supplierForm={supplierForm}
                  setSupplierForm={setSupplierForm}
                  editSupplierId={editSupplierId}
                  setEditSupplierId={setEditSupplierId}
                  saveSupplier={saveSupplier}
                  deleteSupplier={deleteSupplier}
                />
              }
            />
            <Route
              path="/inventory"
              element={
                <InventoryPage
                  products={products}
                  stockInForm={stockInForm}
                  setStockInForm={setStockInForm}
                  stockOutForm={stockOutForm}
                  setStockOutForm={setStockOutForm}
                  runInventory={runInventory}
                />
              }
            />
            <Route
              path="/orders"
              element={
                <OrdersPage
                  products={products}
                  suppliers={suppliers}
                  orderForm={orderForm}
                  setOrderForm={setOrderForm}
                  createOrder={createOrder}
                  orders={orders}
                  updateOrderStatus={updateOrderStatus}
                />
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
