# NPM publish status action

Run your publish actions on every push, no worries! If the version has been bumped to a value that isn't deployed on npm yet, this action will output `'0'` for `outputs.exists` and then you can trigger your publish logic. If the package already exists on npm at the current version, then `outputs.exists` will be `'1'`.

### Requirements

Your npm package must be at the top-level of the repository, so your package.json will be at the root. If you think this is useful, file an issue and I'll consider adjusting it to be able to search in nested directories.

### Example action using this package:

```yml
name: Publish Package to npmjs
on:
  push:
    branches: [master]
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '16.x'
          registry-url: 'https://registry.npmjs.org'

      # Here's the usage:

      - name: Check publish status
        id: check
        uses: tehpsalmist/npm-publish-status-action@v1

      # and here's the value of the output:

      - name: Publish if necessary
        id: publish
        if: ${{ steps.check.outputs.exists == '0' }} # package version doesn't yet exist, ship it!
        run: |
          npm i
          npm run build
          npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      - name: Report publish status
        if: ${{ steps.check.outputs.exists == '1' }}
        run: 'echo "package version already exists on npm registry"'
```
