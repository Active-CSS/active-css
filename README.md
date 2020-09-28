<p align="center"><a href="https://activecss.org" target="_blank" rel="noopener noreferrer"><img src="https://github.com/Active-CSS/active-css/raw/master/logo/activecss-150.jpg" alt="Active CSS Logo" style="border-radius: 20px;"></a></p>
<p align="center">
  <a href="https://github.com/Active-CSS/active-css/blob/master/LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License"></a>
  [![Build Status](https://travis-ci.com/Active-CSS/active-css.svg?branch=master)](https://travis-ci.com/Active-CSS/active-css)
</p>

# [Active CSS](https://activecss.org/)

Power-up your CSS with actions! Is the CSS of the future a full-on programming language?

Active CSS is a JavaScript plugin that adds event-driven actions to CSS.

* **Easy to install and setup:** Active CSS is just a plugin. You can write your own Active CSS files or use it in inline styles, just like CSS. You can quickly download a regular JavaScript plugin for use in a script tag, or use an NPM version. No pre-processing or complicated setups - Active CSS works in runtime.
* **Fast to learn:** Active CSS is quick to learn, as it looks like CSS. Just learn some new commands like "add-class", "remove-class", etc., plus a few new concepts that turn CSS into a proper programming language.
* **Fast, intuitive to write:** Active CSS converts common JavaScript actions to a higher-level one-liner CSS syntax. Around 100 new commands and pseudo-selectors for all common website building tasks.
* **Easy to debug:** Active CSS is easy to debug, even easier than CSS. All declarations are cumulative which means that there are no cascading commands - no hierarchical rules to slow you down trying to get things to work.
* **A true reactive framework:** Active CSS has the simplest method of automatically updating drawn content based on variable changes. Why suffer with unnecessarily complicated frameworks, when you can set up easy to read CSS-style declarations for components and write your code in one-liners?
* **Sequential commands:** When you code in Active CSS, commands happen one after the other in sequence. But it still looks like CSS.
* **No virtual DOM:** Let's face it, a virtual DOM is an overhead if you don't need it. In Active CSS, only the content that you want to update gets updated on the page - the same as in a virtual DOM framework. Active CSS events work dynamically with the DOM - with whatever is on the page when an event happens - and knows how to locate and target your reactive variables to update them even if the DOM changes by something outside of Active CSS. Active CSS doesn't need to run a diff algorithm to get the changes to be made on the page. It simply detects the change made on the variable, then goes _directly_ to your variable on the page and updates it. So it's fast. Plus, remember your old plugins that were really cool? Yep, you can dig them out and use them again, JQuery plugins, etc. You can even add Active CSS to your WordPress site along with the other 40 plugins that it needs. It should still all just work...
* **Mirrors the DOM:** All Active CSS commands are based on their JavaScript equivalent, so if you know JavaScript already then you can quickly find the command you need (or just request it be supported and we'll add it in). Plus Active CSS sets up actual native browser custom element components and ties into native events such as lifecycle callbacks (and some more handy Active CSS-only events). It supports all standard CSS selectors and native DOM events. Event handling bubbles according to DOM rules despite using event delegation and yes, there is a stop-propagation command, etc. It follows CSS syntax rules as closely as it can. In short - where it can utilize and support native functionality, it does.
* **Supports modern web components:** As well as supporting the regular DOM, you can more easily build web components with shadow DOM containers or non-shadow DOM areas having private variables or shared variables that span multiple areas. Events can be isolated to any component to save on having to use IDs and classes. Using state is majorly simplified, as Active CSS variables are just variables and are automatically shared within a specific component area, so you don't have to use "this" or declare an internal state object or anything like that. (Of note though, coding with components is currently under investigation and upgrade - not to change how it works currently, but to add techniques that have been found to be useful in other frameworks - so stay tuned for new releases with future tutorials and comparisons with other frameworks.)
* **Build SPAs:** Active CSS includes an easy front-end method of single page application routing (with tutorial) to make your site faster, more scalable, and more friendly to use. No more clunk-fest website! Now you can have that radio station on your site that you always wanted without melting your brain trying to work out how to keep it on the page.
* **Extendable:** Write your own Active CSS in native JavaScript on-the-fly in your code. Prototype new commands so you can try out your own styling and action concepts as one-liner commands.
* **Write more stuff:** With your code leaving a smaller footprint, you don't have to worry any more about adding more functionality to websites. You can tweak more to make it look and do awesome things. It's like tweaking CSS.
* **Future-proof:** Active CSS is future-proofed so that even if browsers replicated and altered Active CSS commands, your websites will still work as they used to.
* **Dynamic CSS:** Include regular CSS alongside Active CSS commands, for dynamic event CSS that can additionally benefit from the delay and interval features of Active CSS. 
* **Truly event-driven:** Active CSS is a pure event-driven programming style. It is the missing language in the browser's object-oriented programming platform that makes things quick and easy to code. Now you can add "methods" to objects directly. All DOM events and CSS selectors are supported.
* **Optimized and simple by design:** Simple architecture of the core for optimal performance. Faster start-up than other frameworks. No fush. No compromise. No over-engineering.

For best results, start building a website with no plugins or JavaScript and see how far you can get by only using HTML, CSS and Active CSS.

Active CSS works on modern browsers that are [ES6-compliant](http://kangax.github.io/compat-table/es6/).

Active CSS should work fine on desktop Firefox, Chrome, Opera, Safari and the latest Edge; iOs Safari and Chrome, Android Chrome and Firefox. IE support is not planned. There is basic support for the original Edge in the main production core, but the shadow DOM and shadow web component features in Active CSS won't work (being a native implementation). Just avoid using the shadow DOM if you want to support the old Edge.

## Installation

The Active CSS installation instructions are [on the website](https://activecss.org/manual/installation.html).

If you are looking for the core script to download, check out the [dist](https://github.com/Active-CSS/active-css/tree/master/dist) folder and then find the version(s) you need. There are also npm versions - links on the website.

The production (live) version will look like this:<br>
activecss-2-3-0.min.js

The development (offline) version (which supports the upcoming DevTools extention) will look like this:<br>
activecss-dev-2-3-0.min.js

## Documentation

You can find comprehensive documentation [on the website](https://activecss.org).

## Examples

There are loads of examples [on the concept examples page](https://activecss.org/manual/examples.html).

Here's a taster:

```
#clickMe:click {
    body {
        add-class: .hello;
    }
}
```

Want to see it work? Go to [the website](https://activecss.org).

You'll notice that the syntax looks like CSS. There are lots of features in Active CSS. It is truly epic! You can even use it in-line like CSS, in a style tag!

It puts back the fun in functionality! Yeah, sorry about that.

### License

Active CSS is [MIT licensed](./LICENSE).

Copyright (c) 2020-present, River Zend Dynamics Ltd.
