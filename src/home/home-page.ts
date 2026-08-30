import { loadAllGenres } from "@lib/data-loader.ts";
import { coverageOf, checkPublishability } from "@lib/aspect-model.ts";
import {
  CATEGORY_DEFINITIONS,
  aspectsFor,
} from "@lib/category-definitions.ts";
import { selectFeatured } from "@lib/home-model.ts";
import type { FeaturedProduct } from "@lib/home-model.ts";
import type { JoinedProduct } from "@lib/types.ts";
import { renderAiDisclosure } from "../ai-disclosure.ts";
import { renderProductSearch } from "./product-search.ts";
import "../styles/home.css";

export function renderHomePage(container: HTMLElement) {
  container.innerHTML = "";
  const genres = loadAllGenres();

  const allProducts: JoinedProduct[] = genres.flatMap((g) => g.joined);

  renderHeaderSection(container);
  renderProductSearch(container, allProducts);

  const genresSection = document.createElement("section");
  genresSection.className = "home-genres";

  for (const genre of genres) {
    const category = CATEGORY_DEFINITIONS[genre.categoryId];
    if (!category) continue;

    const definitions = aspectsFor(genre.categoryId);
    const coverage = coverageOf(genre.totalProducts, genre.aspectProducts);
    const publishability = checkPublishability(genre.aspectProducts, definitions);
    const featured = selectFeatured(genre.joined, definitions);

    renderGenreCard(genresSection, {
      categoryId: genre.categoryId,
      label: category.label,
      coverage,
      publishable: publishability.publishable,
      blockers: publishability.blockers,
      featured,
    });
  }

  container.appendChild(genresSection);
}

function renderHeaderSection(container: HTMLElement) {
  const header = document.createElement("header");
  header.className = "home-header";

  const h1 = document.createElement("h1");
  h1.className = "home-header__title";
  h1.textContent = "レビュー比較";
  header.appendChild(h1);

  const tagline = document.createElement("p");
  tagline.className = "home-header__tagline";
  tagline.textContent = "購入者レビューを観点ごとに数えて、商品を比較";
  header.appendChild(tagline);

  container.appendChild(header);
}

function renderGenreCard(
  container: HTMLElement,
  opts: {
    categoryId: string;
    label: string;
    coverage: { total: number; analysed: number; reviewsRead: number };
    publishable: boolean;
    blockers: string[];
    featured: FeaturedProduct[];
  },
) {
  const div = document.createElement("div");
  div.className = "home-genre";

  const headerDiv = document.createElement("header");
  headerDiv.className = "home-genre__header";

  const title = document.createElement("h2");
  title.className = "home-genre__title";
  title.textContent = opts.label;
  headerDiv.appendChild(title);

  if (opts.publishable) {
    const link = document.createElement("a");
    link.className = "home-genre__link";
    link.href = `/compare/${opts.categoryId}`;
    link.textContent = "比較する →";
    headerDiv.appendChild(link);
  }
  div.appendChild(headerDiv);

  if (!opts.publishable && opts.blockers.length > 0) {
    const notice = document.createElement("p");
    notice.className = "home-genre__notice";
    notice.textContent = `比較が利用できません: ${opts.blockers.join("、")}`;
    div.appendChild(notice);
  }

  const coverageP = document.createElement("p");
  coverageP.className = "home-genre__coverage";
  coverageP.textContent = `${opts.coverage.total}件中${opts.coverage.analysed}件のレビューを読めています（のべ${opts.coverage.reviewsRead}件）`;
  div.appendChild(coverageP);

  renderAiDisclosure(div);

  if (opts.featured.length > 0) {
    const featuredTitle = document.createElement("h3");
    featuredTitle.className = "home-genre__featured-title";
    featuredTitle.textContent = "よく語られている商品";
    div.appendChild(featuredTitle);

    const list = document.createElement("ul");
    list.className = "home-featured";

    for (const f of opts.featured) {
      list.appendChild(renderFeaturedItem(f));
    }

    div.appendChild(list);
  }

  container.appendChild(div);
}

function renderFeaturedItem(f: FeaturedProduct): HTMLElement {
  const li = document.createElement("li");
  li.className = "home-featured__item";

  const link = document.createElement("a");
  link.className = "home-featured__link";
  link.href = `/reviews/${f.product.productId}`;

  if (f.product.imageUrl) {
    const img = document.createElement("img");
    img.className = "home-featured__image";
    img.src = f.product.imageUrl;
    img.alt = f.product.name;
    img.width = 56;
    img.height = 56;
    link.appendChild(img);
  }

  const info = document.createElement("div");
  info.className = "home-featured__info";

  const name = document.createElement("span");
  name.className = "home-featured__name";
  name.textContent = f.product.name;
  info.appendChild(name);

  const meta = document.createElement("span");
  meta.className = "home-featured__meta";
  meta.textContent = `${f.product.brand}  ¥${f.product.price.toLocaleString()}`;
  info.appendChild(meta);

  link.appendChild(info);

  const verdictDiv = document.createElement("div");
  verdictDiv.className = "home-featured__verdict";

  const praisedDiv = document.createElement("div");
  praisedDiv.className = "home-featured__praised";
  if (f.praised.length > 0) {
    for (const p of f.praised) {
      const span = document.createElement("span");
      span.className = "home-featured__aspect home-featured__aspect--pos";
      span.textContent = `○ ${p.label} +${p.positive}件`;
      praisedDiv.appendChild(span);
    }
  } else {
    const span = document.createElement("span");
    span.className = "home-featured__aspect home-featured__aspect--none";
    span.textContent = "褒められた点なし";
    praisedDiv.appendChild(span);
  }
  verdictDiv.appendChild(praisedDiv);

  const blamedDiv = document.createElement("div");
  blamedDiv.className = "home-featured__blamed";
  if (f.blamed.length > 0) {
    for (const b of f.blamed) {
      const span = document.createElement("span");
      span.className = "home-featured__aspect home-featured__aspect--neg";
      span.textContent = `△ ${b.label} -${b.negative}件`;
      blamedDiv.appendChild(span);
    }
  } else {
    const span = document.createElement("span");
    span.className = "home-featured__aspect home-featured__aspect--none";
    span.textContent = "不満の言及なし";
    blamedDiv.appendChild(span);
  }
  verdictDiv.appendChild(blamedDiv);

  const denom = document.createElement("span");
  denom.className = "home-featured__denom";
  denom.textContent = `（${f.reviewsRead}件中）`;
  verdictDiv.appendChild(denom);

  link.appendChild(verdictDiv);
  li.appendChild(link);
  return li;
}
