# Reveal Effect library (Fluent Design System)
Apply reveal effect to border and background of elements.


## Fork
This is a forked repository from https://github.com/d2phap/fluent-reveal-effect, currently




## Install
Run the command
```bash
npm i @commandblock2/fluent-reveal-effect@latest
```

## Usage
### Base CSS
```css
.btn {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  padding: 1rem 2rem;
  background-color: #333;
  color: #fff;
  border: 0;

  transition: all 200ms ease;
}
.btn-border {
  display: inline-block;
  margin: 5px;
}
.btn-border .btn {
  display: block;
  margin: 2px;
}
```


### 1. Apply Every Effect
#### HTML
```html
<div class="effect-group-container toolbar-2">
    <div class="btn-border btn">
        <button class="btn">Button 1</button>
    </div>
    <div class="btn-border">
        <button class="btn">Button 2</button>
    </div>
</div>
```
#### JavaScript
```ts
document.querySelectorAll(".effect-group-container").forEach((elem) => {
  if (elem instanceof HTMLElement) {
    applyElementEffect(elem, {
      clickEffect: true,
      lightColor: "rgba(255,255,255,0.6)",
      gradientSize: 80,
      children: {
        borderSelector: ".btn-border",
        elementSelector: ".btn",
        lightColor: "rgba(255,255,255,0.3)",
        gradientSize: 150,
      },
    })
  }
})
```


## Usage notes
- **“Border” elements are wrappers**: the library does not create borders; you provide wrapper elements (e.g., `.btn-border`) and it paints the reveal gradient onto their background. This is how the “border glow” is achieved.
- **Semi-transparency**: prefer `background-color: rgba(...)` for translucency. Using `opacity` on the element makes the reveal gradient and the text/icon fade together.
- **Mandatory Container**: the container listens for `mousemove`, then checks each border element to see if the cursor’s gradient radius intersects it. Matching borders get a `radial-gradient` background; others are reset.
