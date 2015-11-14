# Random thoughts while building this app.

- Disabling 3rd party cookies throws a generic error in the preview. A suggestion to enable them would be great.

- Partially loaded previews with errors keep the old instance around, playing videos that I can't stop.

- ~~What is the the signature of `Eager.createElement`?~~ My initial thought is that the install.json property is fed in directly.
Just checked the docs, https://eager.io/developer/docs/writing-your-app/environment
Wish I could get an anchor link to each method.
Docs are pretty, but cramped. I like the drag "dangle" effect.
What `Eager.createElement`'s optional argument `previousElement` for?

- I wish I could set a property in install.json to run the app through Babel.

- I wish I could have element properties without a choice of insertion position.
It'd be like a string property that lets the user click which element is used for reading estimates.

- The initial load vs update flow with `setOptions` feels awkward.
My initial thought is that I'd prefer if `update` received `INSTALL_OPTIONS` as an parameter.

Or better yet something that makes the lifecycle more transparent.

```javascript
// Jumping back and forth between `install.json` and `app.js` is tiresome.
// Is this possible?
export const props {
  element: {
    title: "Location",
    description: "Where would you like the view counter to appear?",
    order: 1, // Order is a mystery integer.
              // EDIT: Just came back from the docs, order refers to the configurator.
              // I get that JS objects are orderless, why isn't props an array then?
    type: "object",
    format: "element",
    default: {
      selector: "body",
      method: "append"
    }
  }
}

// Ideally Eager decides when it's appropriate to execute, `DOMContentLoaded`, `onload`, etc.
export function appWillMount(props = {}) {
  // behind the scenes, `this` provides a namespace without the heft of classes.
  this.state = {
    foo: props.foo
  }
  this.el = Eager.createElement({...})

  // Do stuff.
}

// Ideally I shouldn't have to think about the preview's update cycle.
// I'd prefer if Eager took care of clean up and `appWillMount` executed once more.
// I imagine that's not entirely possible though. So something like this...
export function appWillReceiveProps(nextProps = {}) {
  this.state.foo = nextProps.foo
}
```
