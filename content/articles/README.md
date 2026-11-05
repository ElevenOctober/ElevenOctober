# Open engineering articles

Copy `_template.mdx` to a lowercase, hyphenated slug per published article. Fill its `article` object with the fields in `types/article.ts`, then write the article body in MDX. Files beginning with `_` are excluded from the public index and routes.

MDX supports figures and diagrams through React components, GitHub-flavoured tables and footnotes, code blocks, and KaTeX equations. Keep source links and revision history in the exported metadata.
