## Sync Engine Example

This repo implements a few algorithms that are made to synchronize changes to a SQL database table to an external destination as described in [this blog post](TODO).

This is interesting because you might want to monitor your `users` table for changes and do something as they happen. For example, update them in your data warehouse or Mailchimp.

If you don't want to worry about these kinds of details and just make those use cases happen in a much more fully-featured way, check out [Grouparoo](https://github.com/grouparoo/grouparoo).

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

All of the current approaches do delta-based synchronization based on the `updatedAt` timestamp in the table.

- [simple](https://github.com/grouparoo/sync-engine-example/blob/master/algorithms/simple.js): A naive current-time-based approach with a few failures.
- [dbtime](https://github.com/grouparoo/sync-engine-example/blob/master/algorithms/dbtime.js): Upgrades simple to use the database times, removing race conditions. Might use too much memory.
- [batch](https://github.com/grouparoo/sync-engine-example/blob/master/algorithms/batch.js): Adds batching to save on memory, but introduces failures because of race conditions with offsets.
- [steps](https://github.com/grouparoo/sync-engine-example/blob/master/algorithms/steps.js): A hybrid of batch (most of the time) and dbtime (when there are many rows with the same timestamp).
- [secondary](https://github.com/grouparoo/sync-engine-example/blob/master/algorithms/secondary.js): Adds knowledge of a auto-increment ascending column to batch without the offset issues.

## Contributing

Is there a test (that should work) that makes some of these fail? That would be great!

The same tests are [shared](https://github.com/grouparoo/sync-engine-example/blob/master/__tests__/util/test.js) between all the algorithms. Feel free to add a new one.

The current suite a pretty good set of examples. You can use these methods:

- `create`: Makes a new `id` given the primary key. The `id` has to be ascending within the current suite.
- `update`: Updates a row given the `id` value.
- `stepTime`: There is a global clock and this moves it forward. You can't go backwards!
- `expectSync`: Runs the algorithm. Fails the test if the given array of rows are not processed as expected.

Feel free to write a new algorithm, too. In general, I wrote a failing test for the current algorithm and then a new algorithm that would fix it.

Other things that are useful to know for edge cases:

- There is a batchSize that the algorithm use set to `5` [here](https://github.com/grouparoo/sync-engine-example/blob/master/lib/database.js). Use this in your algorithm.
