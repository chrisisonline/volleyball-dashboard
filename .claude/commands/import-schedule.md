# Parse pasted schedule text into the friday-schedule.json format and update the file

The user will paste raw schedule text from a league website (e.g., copy-pasted tables, formatted text, or described content from a screenshot). Your job is to:

1. Read the current `src/data/friday-schedule.json` to understand the existing format and season.

2. Parse the pasted input (`$ARGUMENTS`) into an array of `ScheduleItem` objects:

   ```typescript
   interface Game { time: string; court: number; opponent: string }
   interface ScheduleItem { date: string; games: Game[] }
   ```

   - `date` must be `"YYYY-MM-DD"` format
   - `time` must be 12-hour format matching existing entries (e.g., `"7:00 PM"`, `"8:15 PM"`)
   - `court` is a number
   - `opponent` is the team name string

3. Show the user the parsed JSON for review before writing anything. Ask them to confirm or correct it.

4. After confirmation, **merge** the new entries with the existing schedule (do not wipe existing data unless the user explicitly says to replace the whole schedule). Sort entries by date ascending.

5. Write the final result to `src/data/friday-schedule.json`.

If the input is ambiguous (e.g., year not specified, date format unclear, court number missing), ask the user to clarify before parsing.

If no arguments are provided, prompt the user to paste their schedule text.
