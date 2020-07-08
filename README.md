<p align="center"><a href="https://activecss.org" target="_blank" rel="noopener noreferrer"><img src="https://github.com/Active-CSS/active-css/raw/master/logo/activecss-150.jpg" alt="Active CSS Logo" style="border-radius: 20px;"></a></p>
<p align="center">
  <a href="https://github.com/Active-CSS/active-css/blob/master/LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License"></a>
</p>

# [Active CSS](https://activecss.org/)

Power-up your CSS with actions! Is the CSS of the future a full-on programming language?

Active CSS is a JavaScript plugin that adds event-driven actions to CSS.

* **Fast to learn:** Active CSS is quick to learn, as it looks like CSS. Just learn some new commands like "add-class", "remove-class", etc., plus a few new concepts that turn CSS into a proper programming language.
* **Fast, intuitive to write:** Active CSS converts common JavaScript actions to a higher-level one-liner CSS syntax. Around 100 new commands and pseudo-selectors for all common website building tasks.
* **Easy to debug:** Active CSS is easy to debug, even easier than CSS. All declarations are cumulative which means that there are no cascading commands - no heirarchical rules to slow you down trying to get things to work.
* **Supports modern web components:** As well as supporting the regular DOM, you can more easily build web components with shadow DOMs containers or non-shadow DOM areas having private or shared variables. Events can be isolated to any component. Using state is majorly simplified, as Active cSS variables are automatically shared within a specific component area. State isn't a big deal in Active CSS, like it isn't a big deal in CSS.
* **Build SPAs:** Active CSS includes an easy front-end method of single page application routing (with tutorial) to make your site faster, more scalable, and more friendly to use. No more clunk-fest website! Now you can have that radio station on your site that you always wanted without melting your brain trying to work out how to keep it on the page.
* **Extendable:** Write your own Active CSS in native JavaScript on-the-fly in your code. Prototype new commands so you can try out your own styling and action concepts as one-liner commands.
* **Write more stuff:** With your code leaving a smaller footprint, you don't have to worry any more about adding more functionality to websites. You can tweak more to make it look and do awesome things. It's like tweaking CSS.
* **Dynamic CSS & future-proof:** Include your regular CSS in with Active CSS commands. Active CSS is future-proofed so that even if browsers replicated and altered Active CSS commands, your websites will still work as they used to.
* **Truly event-driven:** Active CSS is a pure event-driven programming style. It is the missing language in the browser's object-oriented programming platform that makes things quick and easy to code. Now you can add "methods" to objects directly. All DOM events and CSS selectors are supported.
* **Simple by design:** Easy to install and develop with. Simple architecture of the core for optimal performance. No fush. No compromise.

For best results, start building a website with no plugins or JavaScript and see how far you can get by only using HTML, CSS and Active CSS.

Active CSS works on modern browsers that are [ES6-compliant](http://kangax.github.io/compat-table/es6/) and support shadow DOM.

Active CSS should work fine on desktop Firefox, Chrome, Opera, Safari and the latest Edge; iOs Safari and Chrome, Android Chrome and Firefox. IE support is not planned. There is basic support for the original Edge in the main production core, but the shadow DOM and shadow web component features in Active CSS won't work (being a native implementation). Just avoid using the shadow DOM if you want to support the old Edge.

## Installation

The Active CSS installation instructions are [on the website](https://activecss.org/manual/installation.html).

If you are looking for the core script to download, check out the [dist](https://github.com/Active-CSS/active-css/tree/master/dist) folder and then find the version(s) you need.

The production (live) version will look like this:<br>
activecss-2-2-0.min.js

The development (offline) version (which supports the upcoming DevTools extention) will look like this:<br>
activecss-dev-2-2-0.min.js

## Documentation

You can find comprehensive documentation [on the website](https://activecss.org).

## Examples

There are loads of examples [on the concept examples page](https://activecss.org/manual/concept-examples.html).

Here's a taster:

```
#clickMe:click {
    body {
        add-class: .hello;
    }
}
```

Want to see it work? Go to [the website](https://activecss.org).

You'll notice that the syntax looks like CSS. There are lots of features in Active CSS. It is truly epic!

It puts back the fun in functionality! Yeah, sorry about that.

### License

Active CSS is [MIT licensed](./LICENSE).

Copyright (c) 2020-present, River Zend Dynamics Ltd.
