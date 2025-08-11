[![Tests](https://github.com/OMICRONEnergyOSS/oscd-editor-template-generator/actions/workflows/test.yml/badge.svg)](https://github.com/OMICRONEnergyOSS/oscd-editor-template-generator/actions/workflows/test.yml) ![NPM Version](https://img.shields.io/npm/v/@omicronenergy/oscd-editor-template-generator)

# \<oscd-editor-template-generator>

# IMPORTANT!!

This module is using the ace-custom-element which fails to load themes and workers because of how it resolves paths. Basically, the editor
will appear, but without XML formatting or the solarized theme. Until we can find an elegant fix for this, in order to have the styling correct for the editor, you need to include the following in your rollup.config.js to copy these resources into a /ace/ directory:

```typescript
copy({
    targets: [
        {
            src: [
                'node_modules/ace-custom-element/dist/ace/worker-xml.js',
                'node_modules/ace-custom-element/dist/ace/mode-xml.js',
                'node_modules/ace-custom-element/dist/ace/theme-solarized_light.js',
                'node_modules/ace-custom-element/dist/ace/theme-solarized_dark.js',
                ],
            dest: 'dist/ace/',
        },
    ],
    verbose: true,
    flatten: true,
}),
```

## What is this?

This is a basic menu plugin for [OpenSCD](https://openscd.org) which adds a menu item allowing users to safe files from the OpenSCD Editor. Start up a demo server with `npm run start` and see for yourself!

## Linting and formatting

To scan the project for linting and formatting errors, run

```bash
npm run lint
```

To automatically fix linting and formatting errors, run

```bash
npm run format
```

## Testing with Web Test Runner

> This demo plugin does nothing much that could be tested as it relies exclusively on built-in browser components to do its job. We therefore currently have no tests. If you find something that could be tested, please feel free!

To execute a single test run:

```bash
npm run test
```

To run the tests in interactive watch mode run:

```bash
npm run test:watch
```

## Tooling configs

For most of the tools, the configuration is in the `package.json` to reduce the amount of files in your project.

If you customize the configuration a lot, you can consider moving them to individual files.

## Local Demo with `web-dev-server`

```bash
npm run start
```

To run a local development server that serves the basic demo located in `demo/index.html`

&copy; 2025 OMICRON electronics GmbH

## License

[Apache-2.0](LICENSE)
