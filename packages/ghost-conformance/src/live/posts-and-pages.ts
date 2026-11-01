// What posts and pages share in their live tests.

const paragraph = (text: string) => ({
  children: [{ detail: 0, format: 0, mode: "normal", style: "", text, type: "text", version: 1 }],
  direction: "ltr",
  format: "",
  indent: 0,
  type: "paragraph",
  version: 1,
});

/** The content inputs: one per request, each read back as the plaintext Ghost renders from it. */
export const CONTENT = {
  keys: ["html", "lexical", "mobiledoc"],
  lexical: JSON.stringify({
    root: {
      children: [paragraph("From lexical")],
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  }),
  lexicalText: "From lexical",
  mobiledoc: JSON.stringify({
    version: "0.3.1",
    atoms: [],
    cards: [],
    markups: [],
    sections: [[1, "p", [[0, [], 0, "From mobiledoc"]]]],
  }),
  mobiledocText: "From mobiledoc",
};

/** Inputs Ghost honours but never sends back as sent, with the reason. */
export const NOT_SENT_BACK = {
  locale: "Ghost stores it but never sends it back",
  visibility_filter: "Ghost derives it from visibility and tiers, and doesn't send it",
  updated_at: "the edit's collision check; Ghost sets its own",
};

/** Nullable fields no input nulls or sets, with the reason; their nullability rests on Ghost's column. */
export const NOT_SEEDABLE = {
  comment_id: "Ghost sets it to the id on every new post or page",
  updated_at: "Ghost sets it on every write",
  frontmatter: "no input sets it",
  mobiledoc: "null on a lexical post or page; Ghost 6.51 turns a mobiledoc input into lexical",
};

type Fetch = { fetch(): Promise<{ success: boolean; data?: unknown }> };
type Read = Fetch & {
  include(include: { authors?: true; tags?: true; tiers?: true }): Fetch;
  formats(formats: { html?: true; plaintext?: true; lexical?: true }): Fetch;
};

/** Each include or format, and a read that names others: the key comes with it, and not without. */
export const MODIFIERS: { key: string; with: (read: Read) => Fetch; without: (read: Read) => Fetch }[] = [
  // Naming any include replaces Ghost's defaults, which carry tags and tiers.
  {
    key: "tags",
    with: (read) => read.include({ tags: true }),
    without: (read) => read.include({ authors: true }),
  },
  {
    key: "tiers",
    with: (read) => read.include({ tiers: true }),
    without: (read) => read.include({ authors: true }),
  },
  { key: "html", with: (read) => read.formats({ html: true }), without: (read) => read },
  { key: "plaintext", with: (read) => read.formats({ plaintext: true }), without: (read) => read },
  {
    key: "lexical",
    with: (read) => read.formats({ lexical: true }),
    without: (read) => read.formats({ html: true }),
  },
];

/** The data of a successful fetch, or a failure naming the errors. */
export async function fetched(fetcher: Fetch): Promise<Record<string, unknown>> {
  const result = await fetcher.fetch();
  if (!result.success) throw new Error(`Expected success, got ${JSON.stringify(result)}`);
  return result.data as Record<string, unknown>;
}
