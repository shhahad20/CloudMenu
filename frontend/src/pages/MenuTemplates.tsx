import React, { useEffect, useState } from "react";
import "../styles/menuTemplates.scss";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
// import SearchBar from "../components/UI/SearchBar";
import {
  cloneTemplate,
  fetchLibraryTemplates,
  PaginatedResult,
  Template,
} from "../api/templates";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { API_URL } from "../api/api";
import { SortOption } from "../components/UI/SearchBar2";
import { usePagination } from "../hooks/usePagination";
import { ListToolbar } from "../components/UI/ListToolbar";
import { PaginationControls } from "../components/UI/PageSizeSelect";

// import { SortOption, useListControls } from "../hooks/userListControls";
// import ListToolbar from "../components/UI/ListToolbar";
// import Pagination from "../components/UI/Pagination";

// const SORT_OPTIONS: SortOption[] = [
//   { value: "view_count", label: "Most Viewed" },
//   { value: "created_at", label: "Newest" },
//   { value: "price", label: "Price" },
// ];
type MenuSortBy = "view_count" | "created_at" | "price";

const MENU_SORT_OPTIONS: SortOption<MenuSortBy>[] = [
  { value: "view_count", label: "Most Viewed" },
  { value: "created_at", label: "Newest" },
  { value: "price", label: "Price" },
];
const MenuTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const navigate = useNavigate();
  // per-template error & loading states:
  const [cloneErrors, setCloneErrors] = useState<Record<string, string>>({});
  const [cloneLoading, setCloneLoading] = useState<Record<string, boolean>>({});

  // Use the pagination hook
  const {
    state,
    totalPages,
    setTotalPages,
    goToPage,
    toggleOrder,
    setSortBy,
    setQuery,
    setPageSize,
  } = usePagination<MenuSortBy>({
    initialPageSize: 8,
    initialSortBy: "created_at",
    initialOrder: "asc",
  });

  const navigate = useNavigate();

  // CART CONTEXT
  const { addItem } = useCart();

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchLibraryTemplates({
      page: state.page,
      pageSize: state.pageSize,
      sortBy: state.sortBy,
      order: state.order,
      q: state.query,
    })
      .then((res: PaginatedResult<Template>) => {
        setTemplates(res.data);
        setTotalPages(res.pagination.totalPages);
      })
      .catch(() => {
        setError("Failed to load templates.");
      })
      .finally(() => setLoading(false));
  }, [state, setTotalPages]);

  // const handleClone = async (tplId: string) => {
  //   setCloneErrors((errs) => ({ ...errs, [tplId]: "" }));
  //   setCloneLoading((ls) => ({ ...ls, [tplId]: true }));
  //   try {
  //     const newTpl = await cloneTemplate(tplId);
  //     navigate(`/builder/${newTpl.id}`);

  //   } catch (err: unknown) {
  //     console.error(err);
  //     setCloneErrors((errs) => ({
  //       ...errs,
  //       [tplId]:
  //         err instanceof Error ? err.message : "Could not create your copy.",
  //     }));
  //   } finally {
  //     setCloneLoading((ls) => ({ ...ls, [tplId]: false }));
  //   }
  // };
  const handleClone = async (tplId: string) => {
    setCloneErrors((errs) => ({ ...errs, [tplId]: "" }));
    setCloneLoading((ls) => ({ ...ls, [tplId]: true }));
    console.log("Cloning template:", tplId);
    try {
      const newTpl = await cloneTemplate(tplId);

      // ← guard here:
      if (!newTpl || typeof newTpl.id !== "string") {
        console.error("cloneTemplate returned:", newTpl);
        throw new Error("Unexpected response from clone API");
      }

      navigate(`/builder/${newTpl.id}`);
    } catch (err: unknown) {
      console.error("Clone failed:", err);
      setCloneErrors((errs) => ({
        ...errs,
        [tplId]:
          err instanceof Error ? err.message : "Could not create your copy.",
      }));
    } finally {
      setCloneLoading((ls) => ({ ...ls, [tplId]: false }));
    }
  };

  // helper to get numeric price
  const parsePrice = (priceStr: string): number => {
    if (!priceStr || priceStr.toLowerCase() === "free") return 0;
    // strip any non-digits/dot
    const num = parseFloat(priceStr.replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  const handleView = async (id: string) => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`${API_URL}/templates/lib/${id}/view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Failed to record view:", err);
      // not critical—still navigate
    } finally {
      // go to the public menu page
      window.open(`/menus/${id}`, "_blank");
    }
  };
  return (
    <>
      <Navbar />
      <section id="menu-templates-section">
        <div className="templates-container">
          <h2 className="section-title">Menu Templates</h2>

          {/* Search + Sort */}
          <ListToolbar
            searchValue={state.query}
            onSearchChange={setQuery}
            searchPlaceholder="Search menus…"
            sortBy={state.sortBy}
            onSortChange={setSortBy}
            sortOptions={MENU_SORT_OPTIONS}
            order={state.order}
            onOrderToggle={toggleOrder}
            pageSize={state.pageSize}
            onPageSizeChange={setPageSize}
          />

          {loading && <p>Loading templates…</p>}
          {error && <p className="error">{error}</p>}

          {!loading && !error && (
            <>
              <div className="templates-grid">
                <div className="template-card custom-card">
                  <div className="price-tag custom-tag-price">Custom</div>
                  <div className="template-content">
                    <img
                      className="template-image"
                      src="/"
                      alt="Request a Custom Menu"
                    />
                    <h3>Request a Custom Menu</h3>
                    <p>
                      Request a design that matches your unique taste.
                      ersonalize your ideal menu—tell us your preferences, and
                      we’ll handle the rest!
                    </p>
                    <a href="/" className="btn-view">
                      Order a Template ↗
                    </a>
                  </div>
                </div>

                {templates.map((tpl) => (
                  <div key={tpl.id} className="template-card">
                    {/* Price badge */}
                    <div className="price-tag">{tpl.price}</div>

                    {/* Image + content */}
                    <img
                      className="template-image"
                      src={tpl.preview_url}
                      alt="Preview Image"
                    />
                    <div className="template-content">
                      <h3>{tpl.name}</h3>
                      {/* <p>{tpl.description}</p> */}
                      {/* <a href={`/templates/${tpl.id}`} className="btn-view">
                    View Template ↗
                  </a> */}
                      <button
                        onClick={() => handleView(tpl.id)}
                        className="btn-view"
                      >
                        View Template ↗
                      </button>
                      {parsePrice(tpl.price) === 0 ? (
                        // FREE: show “Use this Template” (clone)
                        <>
                          <button
                            className="clone-btn"
                            onClick={() => handleClone(tpl.id)}
                            disabled={!!cloneLoading[tpl.id]}
                          >
                            {cloneLoading[tpl.id]
                              ? "Cloning…"
                              : "Use this Template ↗"}
                          </button>
                          {/* {cloneErrors[tpl.id] && (
                            <p className="clone-error">{cloneErrors[tpl.id]}</p>
                          )} */}
                        </>
                      ) : (
                        // PAID: show “Add to Cart”
                        <button
                          className="btn-add-cart"
                          onClick={() =>
                            addItem({
                              id: tpl.id,
                              name: tpl.name,
                              price: parsePrice(tpl.price),
                              quantity: 1,
                            })
                          }
                        >
                          Add to Cart
                        </button>
                      )}

                      {cloneErrors[tpl.id] && (
                        <p
                          className="clone-error"
                          style={{ color: "red", fontWeight: "500" }}
                        >
                          {cloneErrors[tpl.id]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* simple pagination */}
                <PaginationControls
                  currentPage={state.page}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                />
            </>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default MenuTemplates;
