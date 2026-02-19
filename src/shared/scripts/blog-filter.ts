type Category = "all" | string;
const TITLE_KEY = "title";
const DESCRIPTION_KEY = "description";
const TAGS_KEY = "tags";
const CATEGORY_KEY = "category";
const PAGE_VISIBLE_KEY = "pageVisible";
const TITLE_HIGHLIGHT_SELECTOR = "[data-highlight='title']";
const DESCRIPTION_HIGHLIGHT_SELECTOR = "[data-highlight='description']";

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const normalize = (value: string): string => value.trim().toLowerCase();

const highlightText = (content: string, query: string): string => {
  if (!query) return escapeHtml(content);

  const pattern = new RegExp(escapeRegExp(query), "gi");
  let highlighted = "";
  let lastIndex = 0;
  let matched = false;

  for (const match of content.matchAll(pattern)) {
    if (match.index === undefined) continue;

    matched = true;
    const start = match.index;
    const end = start + match[0].length;

    highlighted += escapeHtml(content.slice(lastIndex, start));
    highlighted += `<mark class="rounded px-1 py-0.5 bg-primary/20 text-text">${escapeHtml(match[0])}</mark>`;
    lastIndex = end;
  }

  if (!matched) return escapeHtml(content);

  highlighted += escapeHtml(content.slice(lastIndex));
  return highlighted;
};

const applyHighlights = (card: HTMLElement, query: string): void => {
  const titleElement = card.querySelector<HTMLElement>(TITLE_HIGHLIGHT_SELECTOR);
  const descriptionElement = card.querySelector<HTMLElement>(DESCRIPTION_HIGHLIGHT_SELECTOR);
  const title = card.dataset[TITLE_KEY] ?? "";
  const description = card.dataset[DESCRIPTION_KEY] ?? "";

  if (titleElement) {
    titleElement.innerHTML = highlightText(title, query);
  }

  if (descriptionElement) {
    descriptionElement.innerHTML = highlightText(description, query);
  }
};

const matchesSearch = (card: HTMLElement, searchText: string): boolean => {
  if (!searchText) return true;

  const title = normalize(card.dataset[TITLE_KEY] ?? "");
  const description = normalize(card.dataset[DESCRIPTION_KEY] ?? "");
  const tags = normalize(card.dataset[TAGS_KEY] ?? "");

  return (
    title.includes(searchText) || description.includes(searchText) || tags.includes(searchText)
  );
};

const matchesCategory = (card: HTMLElement, category: Category): boolean => {
  if (category === "all") return true;
  return (card.dataset[CATEGORY_KEY] ?? "") === category;
};

export function setupBlogFilter(): void {
  const filterContainer = document.getElementById("category-filter-container");
  const searchInput = document.getElementById("post-search") as HTMLInputElement | null;
  const resetButton = document.getElementById("post-search-reset") as HTMLButtonElement | null;
  const resultsInfo = document.getElementById("results-info");
  const emptyState = document.getElementById("blog-filter-empty-state");
  const paginationNav = document.getElementById("blog-pagination-nav");
  const cards = Array.from(document.querySelectorAll<HTMLElement>("article[data-category]"));

  if (!filterContainer || !searchInput || !resultsInfo || cards.length === 0) return;

  let activeCategory: Category = "all";
  let searchText = "";
  let searchQuery = "";

  const updateCurrentCategoryButton = (): void => {
    const buttons = filterContainer.querySelectorAll<HTMLButtonElement>(
      ".category-item[data-category]"
    );

    for (const item of buttons) {
      item.classList.toggle(
        "current-category",
        (item.dataset[CATEGORY_KEY] ?? "") === activeCategory
      );
    }
  };

  const applyFilters = (): void => {
    let visibleCount = 0;
    const isFiltering = activeCategory !== "all" || searchText.length > 0;

    for (const card of cards) {
      const visibleByPage = (card.dataset[PAGE_VISIBLE_KEY] ?? "false") === "true";
      const visible = isFiltering
        ? matchesCategory(card, activeCategory) && matchesSearch(card, searchText)
        : visibleByPage;

      card.classList.toggle("hidden", !visible);
      applyHighlights(card, searchQuery);
      if (visible) visibleCount += 1;
    }

    const totalCount = cards.filter(
      (card) => (card.dataset[PAGE_VISIBLE_KEY] ?? "false") === "true"
    ).length;

    resultsInfo.textContent = isFiltering
      ? `${visibleCount}개의 글이 조건과 일치합니다.`
      : `현재 페이지 ${totalCount}개의 글을 확인할 수 있습니다.`;

    if (emptyState) {
      emptyState.classList.toggle("hidden", visibleCount > 0);
    }

    if (paginationNav) {
      paginationNav.classList.toggle("hidden", isFiltering);
    }
  };

  const resetFilters = (): void => {
    activeCategory = "all";
    searchText = "";
    searchQuery = "";
    searchInput.value = "";
    updateCurrentCategoryButton();
    applyFilters();
  };

  filterContainer.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const button = target.closest<HTMLButtonElement>(".category-item[data-category]");
    if (!button) return;

    activeCategory = button.dataset[CATEGORY_KEY] ?? "all";

    updateCurrentCategoryButton();

    applyFilters();
  });

  searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value.trim();
    searchText = normalize(searchInput.value);
    applyFilters();
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    event.preventDefault();
    resetFilters();
  });

  resetButton?.addEventListener("click", () => {
    resetFilters();
  });

  applyFilters();
}
