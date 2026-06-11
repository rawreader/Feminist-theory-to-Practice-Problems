# Feminist Theory into Practice

A local website. Name a problem of gender inequality; get back one real thing
people have built, organized, made, or passed to confront it — one at a time.

## Getting it running on your Mac

You need Node.js installed (you already have npm working, so you're set).

1. Unzip this folder wherever you want the project to live, e.g.:

   ```
   cd ~/dhsi/feminist-theory-practice-project
   unzip ~/Downloads/feminist-theory-into-practice.zip
   cd feminist-theory-into-practice
   ```

2. Install the dependencies (one time only):

   ```
   npm install
   ```

3. Start the site:

   ```
   npm run dev
   ```

4. Open http://localhost:4321 in your browser.
   The admin page is at http://localhost:4321/admin

5. To stop the site, press Ctrl+C in the terminal.

## The admin password

The password lives in the `.env` file in this folder. It ships as
`change-me-please` — open `.env` in any text editor and change it:

```
ADMIN_PASSWORD=your-new-password
```

Restart the site (Ctrl+C, then `npm run dev` again) after changing it.

## How the content works

Everything lives in the `data/` folder as plain Markdown files:

- `data/problems/` — one file per problem. The frontmatter holds the name,
  aliases (other things people might type), and tags (themes used for
  matching). The body text is your framing/definition, which is also
  searched when matching.
- `data/solutions/` — one file per response. The frontmatter holds the name,
  type (organization, law, art project, …), link, location, and the list of
  problem slugs it responds to. The body text is the description shown on
  the card.

You can edit these two ways:

1. **The admin page** (http://localhost:4321/admin) — forms for adding
   problems and responses, and delete buttons. Changes appear on the site
   immediately; no restart needed.
2. **Directly in a text editor** — the files are human-readable. Also picked
   up immediately.

Because the catalog is plain files, it travels with the folder: back it up,
put it in git, or share it by zipping the `data/` directory.

## How matching works

A visitor's query is compared against each problem's name, aliases, tags,
and framing text. Solutions linked to the best-matching problems form the
candidate pool, and one is chosen at random. "Show me another" re-rolls
without repeating until the pool is exhausted. The match is thematic but
not magic: if you want a query like "misogynoir" to catch a response, make
sure the response is linked to a problem whose name, aliases, tags, or
framing contain related words.

## Verifying sources

See `SOURCES.md` for the verification status of every seeded link.
