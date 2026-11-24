# Compare our UI output against the Momentum website

The user has pasted raw text copied from the Momentum Volleyball website (momentumvolleyball.ca). Compare it against what our app fetches and displays.

## Step 1 — Parse the pasted site data

The user's pasted input is in `$ARGUMENTS`. Extract every session from it:
- Date (convert to YYYY-MM-DD)
- Time (e.g. "7:00 PM")
- Level (e.g. "Intermediate/Intermediate Plus", "Advanced", "Beginner/Early Intermediate")
- Group (e.g. "Co-Ed", "Women's", "Men's")
- Location name
- Whether it shows "Register" (bookable) or some other state (full, starting soon, etc.)

## Step 2 — Fetch our API data

Fetch both drop-in and clinic endpoints using curl:

```bash
curl -s "https://data.mmao.ca/ghlLeagues/aGagGPzv1aS4v8hffakm?age=adult&program_type=drop_in" \
  -H "Origin: https://momentumvolleyball.ca" \
  -H "Referer: https://momentumvolleyball.ca/" \
  -H "User-Agent: Mozilla/5.0"

curl -s "https://data.mmao.ca/ghlLeagues/aGagGPzv1aS4v8hffakm?age=adult&program_type=clinic" \
  -H "Origin: https://momentumvolleyball.ca" \
  -H "Referer: https://momentumvolleyball.ca/" \
  -H "User-Agent: Mozilla/5.0"
```

Extract the same fields from the API response records (after applying our `status !== 'inactive'` filter).

## Step 3 — Read the display logic

Read `src/lib/session-name.ts` to understand how we parse and display session names (level, group, location shortening). Apply the same logic mentally to our API records to determine what our UI would actually render.

## Step 4 — Three-way comparison

Produce a table with three columns:

| Session (date + time + level + group + location) | On Momentum site? | In our API? | Displayed correctly in our UI? |
|---|---|---|---|

Flag any discrepancies:
- **Missing from our API** — session is on the Momentum site but not in our API response (possible filter issue or API lag)
- **Filtered out** — session is in API but our `status !== 'inactive'` filter removes it (note the status value)
- **Display mismatch** — session shows but level/group/location label differs from what the Momentum site shows
- **Extra in our API** — session appears in our data but not on the Momentum site (stale/invalid)

## Step 5 — Summary

Conclude with:
- Total sessions on Momentum site vs total in our API vs total shown in our UI
- List of any action items (e.g. fix a label mapping in session-name.ts, adjust a filter, clear stale cache)

If no arguments are provided, ask the user to paste the Momentum site content first.
