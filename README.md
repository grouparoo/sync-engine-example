## Sync Engine Example

This repo implements a few algorithms that are made to synchronize changes to a SQL database table to an external destination as described in [this blog post](TODO).

Maybe you want to monitor your `users` table for changes and do something as they happen. For example, update them in your data warehouse or Mailchimp.

All of the current approaches do delta-based synchronization based on the `updatedAt` timestamp in the table.

## Run it

Yo can run all these tests:

```bash
$ npm install
$ npm run all

Test Suites: 2 failed, 3 passed, 5 total
Tests:       4 failed, 36 passed, 40 total
Snapshots:   0 total
Time:        2.238 s
```

Or run just one algorithm's tests:

```bash
$ npm install
$ npm run dbtime

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
Snapshots:   0 total
Time:        0.818 s, estimated 1 s
```

There are some expected failures because some of the algorithms are not complete enough.

## Algorithms

- simple: A naive current-time-based approach with a few failures.
- dbtime: Upgrades simple to use the database times, removing race conditions. Might use too much memory.
- batch: Adds batching to save on memory, but introduces failures because of race conditions with offsets.
- steps: A hybrid of batch (most of the time) and dbtime (when there are many rows with the same timestamp).
- secondary: Adds knowledge of a auto-increment ascending column to batch without the offset issues.
