# ynvrsty-home

The page served at <https://ynvrsty.com> — the YNVRSTY umbrella brand and an
email signup for the next intake.

The CMF site is a separate repository, [`cmf-team/cmf-landing`][cmf], served at
<https://cmf.ynvrsty.com>. They are split because **a GitHub Pages repository can
only hold one custom domain**.

## Layout

| File | Purpose |
|---|---|
| `index.html` | The whole page. Strict CSP lives in the `<meta>` tag here. |
| `styles.css` | Design tokens copied from the CMF design system so both sites match. |
| `signup.js` | Posts the email to a Google Form. Config constants at the top. |
| `CNAME` | Claims `ynvrsty.com`. Removing it hands the domain back to no one. |

No build step and no dependencies: the repository *is* the artifact. Edit a file,
push to `main`, and `.github/workflows/pages.yml` publishes it.

To work on it locally, any static server will do:

```sh
python3 -m http.server 8000
```

## Signup

`signup.js` posts to a Google Form whose responses collect in a spreadsheet.
Both `FORM_ID` and `ENTRY_ID` come from the form's *pre-filled link*
(Google Forms → ⋮ → **Get pre-filled link**):

```
https://docs.google.com/forms/d/e/FORM_ID/viewform?usp=pp_url&entry.123456789=test
                                  ^^^^^^^                     ^^^^^^^^^^^^^^^^
```

Google sends no CORS headers, so the browser cannot read the response — the page
can only report network-level failures. **The only real proof the form works is a
test submission appearing in the sheet.** If the two constants are left empty the
form renders disabled rather than silently discarding addresses.

[cmf]: https://github.com/cmf-team/cmf-landing
