<p align="center"><a href="https://activecss.org" target="_blank" rel="noopener noreferrer"><img src="https://github.com/Active-CSS/active-css/raw/master/logo/activecss-150.jpg" alt="Active CSS Logo" style="border-radius: 20px;"></a></p>


# [Active CSS](https://activecss.org/)

The smartest DOM tool in the world.

Here's a taster:
```
#clickMe:click {
    body {
        add-class: .hello;
    }
}
```

Example of a component:
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
activecss-2-13-0.min.js

The development (offline) version will look like this:<br>
activecss-dev-2-13-0.min.js

There are also npm versions - links on the website.

## Documentation

You can find comprehensive documentation [on the website](https://activecss.org).

## Examples

There are loads of examples [on the concept examples page](https://activecss.org/manual/examples.html).

Want to see it work? Go to [the website](https://activecss.org).

### License

Active CSS has basically an MIT license for your average web developer, and a bit more for others trying to profit from it or steal the credit. [license](./LICENSE).

Copyright (c) 2023, River Zend Dynamics Ltd.
