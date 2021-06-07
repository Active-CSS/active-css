<p align="center"><a href="https://activecss.org" target="_blank" rel="noopener noreferrer"><img src="https://github.com/Active-CSS/active-css/raw/master/logo/activecss-150.jpg" alt="Active CSS Logo" style="border-radius: 20px;"></a></p>
<p align="center">
  <a href="https://github.com/Active-CSS/active-css/blob/master/LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License"></a>
</p>

# [Active CSS](https://activecss.org/)

Power-up your CSS with actions! Is the CSS of the future a full-on programming language?

Active CSS is a JavaScript plugin that adds event-driven actions to CSS. It acts as a *front-end only* tool. It gives you the power of a reactive framework, but you can use whatever back-end you want. It will work will static or pre-rendered HTML files and has smart ajax SPA routing and tooling built into the front-end for ultra-fast handling of pre-rendered or HTML generated on the server. It can breathe new life into PHP, basic Node or any simple back-end driven website. It is designed to make interactivity on the front-end easier than ever before.

It is not a complete solution - you still need a back-end, even if only a minimal one.

Active CSS commands are *NOT* CSS commands. This is *not* a straight expansion of CSS. They live in their own file - separate to styling. Putting Active CSS into CSS files will only give you browser styling errors. They could be handled on the front-end and extracted by the Active CSS core, but it would still give you CSS errors obviously - so Active CSS commands are intentionally always kept in separate files.

You won't need a computer science degree to write in Active CSS if you already know CSS, HTML and JavaScript well. It looks like CSS and the commands are modelled on JavaScript.

It works dynamically with the contents of the DOM at any given time.

If anyone wants to get involved then there is a discussions section on this repo.

* **Easy to install and setup:** Active CSS is just a plugin. You can write your own Active CSS files or use it in inline styles, just like CSS. You can quickly download a regular JavaScript plugin for use in a script tag, or use an NPM version. No pre-processing or complicated setups - Active CSS works in runtime. The code you write in comparison to regular JavaScript is tiny, so runtime performance is practical even for a large site. You don't have to worry about performance at all. Test it in Lighthouse if you want to compare.
* **Works with plugins out-of-the-box:** The new tinymce \<tinymce-editor>\</tinymce-editor> shadow DOM tag? Works with that. Photoswipe? Works with that. JQuery? Of course. All these amazingly crafted pieces of JS should all work with Active CSS, because Active CSS works dynamically with the DOM at any one time. Change the DOM externally? All the Active CSS events still work. It works dynamically with the DOM at any snapshot in time, just like CSS. It's a benefit of not using a virtual DOM. Just set up your events and commands. Things will just work. No mucking about with event listeners - nothing to maintain.
* **Fast to learn:** Active CSS is quick to learn, as it looks like CSS. Just learn some new commands like "add-class", "remove-class", etc., plus a few new concepts that turn CSS into a proper programming language.
* **Fast, intuitive to write:** Active CSS converts common JavaScript actions to a higher-level one-liner CSS syntax. Around 100 new commands and pseudo-selectors for all common website building tasks.
* **Supports all DOM events:** If the event is available in the browser as a DOM event it should work with Active CSS automatically, even the experimental events that are being worked on right now by the browser developers.
* **Easy to debug:** Active CSS is easy to debug. All declarations are cumulative and there are no hierarchical rules. Every command counts.
* **A true reactive framework:** Active CSS has the simplest method of automatically updating drawn content based on variable changes. Why suffer with unnecessarily complicated frameworks, when you can set up easy to read CSS-style declarations for components and write your code in one-liners?
* **Responsive events:** Because Active CSS supports CSS media queries, you can have different events happening at different screen sizes. How easy is that with other frameworks without things getting messy?
* **Apply CSS variables dynamically:** Active CSS can dynamically apply standard CSS variables to the document, element or shadow DOM scope without fuss.
* **Sequential commands:** When you code in Active CSS, commands happen one after the other in sequence. But it still looks like CSS.
* **No virtual DOM:** Active CSS targets content for replacement directly, without using a virtual DOM. This means that it will work with existing plugins, jQuery, etc. right away. You remember all those amazing plugins that you had to stop using, you know - when things started getting weirdly complex for basic things in web development and everyone had to start using reactive content when they really didn't need to? Well, you can use all those native or jQuery plugins with Active CSS right now out-of-the-box. In Active CSS you can get blazingly-fast without loss of creativity and without the tie-in to a framework, as any plugins that you write will just work with Active CSS just as they would natively. Just don't inadvertently overwrite any reactive content in the DOM that you set up :) In versions prior to 2.4.0, we used DOM placeholders to remember where to update reactive content on the page. Since the 2.4.0 branch, all those placeholders are gone and elements are mapped to reactive variables internally.
* **Mirrors the DOM:** All Active CSS commands are based on their JavaScript equivalent, so if you know JavaScript already then you can quickly find the command you need (or just request it be supported and we'll add it in). Plus Active CSS sets up actual native browser custom element components and ties into native events such as lifecycle callbacks (and some more handy Active CSS-only events). It supports all standard CSS selectors and native DOM events. Event handling bubbles according to DOM rules despite using event delegation and yes, there is a stop-propagation command, etc. It follows CSS syntax rules as closely as it can. In short - where it can utilize and support native functionality, it does.
* **Supports modern web components:** As well as supporting the regular DOM, you can more easily build web components with shadow DOM containers or non-shadow DOM areas having private variables or shared variables that span multiple areas. Events can be isolated to any component to save on having to use IDs and classes. Using state is majorly simplified, as Active CSS variables are just variables and are automatically shared within a specific component area, so you don't have to use "this" or declare an internal state object or anything like that.
* **Build SPAs:** Active CSS includes an easy front-end method of single page application routing (with tutorial) to make your site faster, more scalable, and more friendly to use. No more clunk-fest website! Now you can have that radio station on your site that you always wanted without melting your brain trying to work out how to keep it on the page.
* **Extendable:** Write your own Active CSS in native JavaScript on-the-fly in your code. Prototype new commands so you can try out your own styling and action concepts as one-liner commands.
* **Write more stuff:** With your code leaving a smaller footprint, you don't have to worry any more about adding more functionality to websites. You can tweak more to make it look and do awesome things. Want to quickly add an event to a class? No problem. It's like tweaking CSS - you don't have to think about it.
* **Future-proof:** Active CSS is future-proofed so that even if browsers replicated and altered Active CSS commands, your websites will still work as they used to.
* **Dynamic CSS:** Include regular CSS alongside Active CSS commands, for dynamic event CSS that can additionally benefit from the delay and interval features of Active CSS. 
* **Truly event-driven:** Active CSS is a pure event-driven programming style. It is the missing language in the browser's object-oriented programming platform that makes things quick and easy to code. Now you can add "methods" to objects directly. All DOM events and CSS selectors are supported.
* **A framework that could end up in the browser:** Active CSS could be incorporated natively into the browser without any change to existing future specifications of HTML or CSS. It is the only easy-to-grasp framework that bridges the gaps between HTML, CSS and JavaScript to give you _truly_ higher-level scripting ability. Active CSS has the simplest and most direct method of handling events of all the frameworks, bar none.
* **Optimized and simple by design:** Simple architecture of the core for optimal performance. Fast start-up. No fush. No compromise.

For best results, start building a website with no plugins or JavaScript and see how far you can get by only using HTML, CSS and Active CSS.

Active CSS works on modern browsers that are [ES6-compliant](http://kangax.github.io/compat-table/es6/).

Active CSS should work fine on desktop Firefox, Chrome, Opera, Safari and the latest Edge; iOs Safari and Chrome, Android Chrome and Firefox. IE support is not planned. There is basic support for the original Edge in the main production core, but the shadow DOM and shadow web component features in Active CSS won't work (being a native implementation). Just avoid using the shadow DOM if you want to support the old Edge.

## Installation

The Active CSS installation instructions are [on the website](https://activecss.org/manual/installation.html).

If you are looking for the core script to download, check out the [dist](https://github.com/Active-CSS/active-css/tree/master/dist) folder and then find the version(s) you need. There are also npm versions - links on the website.

The production (live) version will look like this:<br>
activecss-2-6-0.min.js

The development (offline) version (which supports the upcoming DevTools extention) will look like this:<br>
activecss-dev-2-6-0.min.js

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
