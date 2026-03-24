# Cross-check the local friday-schedule.json against the Momentum Volleyball API to find mismatches

Steps:

1. Read `src/data/friday-schedule.json` to get the local schedule.

2. Read `src/lib/dropin-api.ts` to understand the API endpoint and required headers.

3. Fetch the Momentum API for drop-in sessions using the Bash tool:

   ```bash
   curl -s "https://data.mmao.ca/ghlLeagues/aGagGPzv1aS4v8hffakm?age=adult&program_type=drop_in" \
     -H "Origin: https://momentumvolleyball.ca" \
     -H "Referer: https://momentumvolleyball.ca/" \
     -H "User-Agent: Mozilla/5.0"
   ```

4. Parse the API response (`records` array) and extract all upcoming sessions. For each session, note:
   - Date (`session_start_date`)
   - Time (`session_start_hour`, `session_start_minute`)
   - Session name (level/group)
   - Location
   - Status and capacity

5. Compare against the local schedule:
   - Flag any local schedule dates/times that do NOT appear in the API data (possibly invalid/cancelled)
   - Flag any API sessions on days we have local games (potential schedule conflict)
   - Note sessions in the API that look like they belong to the user's league (Intermediate level, Friday evening, matching location)

6. Present a clear summary:
   - Confirmed matches (local game date matches API session)
   - Potential mismatches or cancellations (local date has no corresponding API session)
   - Conflicts (drop-in sessions overlapping with league game times)
   - Any API sessions that look like unrecorded league games

Ask the user if they want to update `friday-schedule.json` based on the findings.
