# Standalone test suite

These checks are plain TypeScript programs rather than tests managed by a test
framework. They use the project's existing transitive `esbuild` binary to
produce temporary Node-compatible bundles.

## Layout

- `dialogue/` validates the authored dialogue catalog.
- `narrative/` validates narrative data, integration behavior, and LLM beat
  rendering safeguards.
- `simulation/` exercises the headless mansion simulation.
- `stories/` exhaustively walks the legacy story graphs.

## Run all checks

From the repository root:

```sh
find tests -name '*-test.ts' -print | while IFS= read -r test_file; do
  output_file="/private/tmp/$(basename "${test_file%.ts}").mjs"
  node_modules/.bin/esbuild "$test_file" \
    --bundle \
    --platform=node \
    --format=esm \
    --outfile="$output_file" &&
  node "$output_file"
done
```

Run `npm run build` as the primary TypeScript and production-bundle check.

## Known simulation test limitation

`tests/simulation/sim-test.ts` uses `console.assert`. Node prints failed
assertions to stderr but still exits with status 0, so its final success message
and process status are not a reliable green signal. Review its output for
`Assertion failed` lines until those checks are converted to throwing
assertions.
