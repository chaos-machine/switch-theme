# Switch Theme

This plugin looks at all symbols, layer styles and text styles in a selected artboard and fetches their equivalent dark theme versions. Then it places them in a new artboard, keeping their size, position and layer hierarchy

## Usage

You need to have external libraries linked to Sketch for this to work.
The plugin only works on artboards.

It works with:
 - external libraries, with any names
 - symbols, nested symbols and all types of overrides
 - must select an artboard to switch themes
 - changes shapes, text and layer styles
 - multiple artboard switching
 - 
 - give it time, it takes a while for large libraries


Install the dependencies

```bash
npm install
```

Once the installation is done, you can run some commands inside the project folder:

```bash
npm run build
```

To watch for changes:

```bash
npm run watch
```

Additionally, if you wish to run the plugin every time it is built:

```bash
npm run start
```

## Debugging

To view the output of your `console.log`, you have a few different options:

- Use the [`sketch-dev-tools`](https://github.com/skpm/sketch-dev-tools)
- Open `Console.app` and look for the sketch logs
- Look at the `~/Library/Logs/com.bohemiancoding.sketch3/Plugin Output.log` file

Skpm provides a convenient way to do the latter:

```bash
skpm log
```

The `-f` option causes `skpm log` to not stop when the end of logs is reached, but rather to wait for additional data to be appended to the input
