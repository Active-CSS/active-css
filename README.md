<p align="center"><a href="https://activecss.org" target="_blank" rel="noopener noreferrer"><img src="https://github.com/Active-CSS/active-css/raw/master/logo/activecss-150.jpg" alt="Active CSS Logo" style="border-radius: 20px;"></a></p>


# [Active CSS](https://activecss.org/)

A CSS / JavaScript hybrid language.

What if CSS could not only do :hover, but also all the DOM events like :click, :mouseover, etc.?

Quick to code in, low maintenance event handling, dynamic CSS, easy DOM manipulation and lots more.


The language is in continual development, but work now tends to stay offline until in a stable condition to be put on the latest branch. Then it gets tested on a wider scale until it seems stable enough for release. It's cross-browser, so will work on all modern browsers back to ES6.

Please, if you see a bug, do report it so it gets fixed. All bugs are fixed as rapidly as possible.

ACSS is all about manual coding and taking back control of UI with a method that is scalable for complex websites. It has a near instant load-time.

This is event-driven programming, so like any programming language use a good comment structure to label your code.

Here's are a couple of tasters:
```
/***************
 * When the day theme button is clicked, add a "day" property to the "data-theme"
   attribute on the body tag that can be used to set the CSS for the whole page.
**/
#dayTheme:click {
    body {
        set-attribute: data-theme "day";
    }
}
```

```
/***************
 * Expand or contract a card when it is clicked.
**/
.card:click {
    toggle-class: .expand;
}
```

Example of a privately scoped component:
```
button:click {
    render-after-end: "<hello-world></hello-world>";
}

@component hello-world private {
    html {
        <p>Hello world</p>
    }
    p:click {
        alert: "Why are you clicking me, you crazy!";
    }
}
```

Ultra-fast. No pre-processing. No virtual DOM. Runs in real-time in the browser.<br>
All DOM events are supported, plus CSS commands up to level 4 (if browser supported).<br>
Works on chromium browsers (Chrome, Edge, Opera, etc.) and Firefox. (ES6+)

[See the docs](https://activecss.org/)

## Installation

The Active CSS installation instructions are [on the website](https://activecss.org/manual/installation.html).

If you are looking for the core script to download, check out the [dist](https://github.com/Active-CSS/active-css/tree/master/dist) folder and then find the version(s) you need.

The production (live) version will look like this:<br>
activecss-2-15-0.min.js

The development (offline) version will look like this:<br>
activecss-dev-2-15-0.min.js

There are also npm versions - links on the website.

## Documentation

You can find comprehensive documentation [on the website](https://activecss.org).

## Examples

There are loads of examples [on the concept examples page](https://activecss.org/manual/examples.html).

Want to see it work? Go to [the website](https://activecss.org).

### License

Active CSS has a permissive license for web developers, but strict clauses if you want to profit from it or use its ideas. [license](./LICENSE).

Copyright (c) 2023, River Zend Dynamics Ltd.
