import "./style.css";
import { applyElementEffect } from "../../src";


document.querySelectorAll(".toolbar > .btn").forEach((elem) => {
  if (elem instanceof HTMLElement) {
    applyElementEffect(elem, {
      clickEffect: true
    })
  }

})

document.querySelectorAll(".effect-group-container").forEach((elem) => {
  if (elem instanceof HTMLElement) {
    applyElementEffect(elem, {
      clickEffect: true,
      lightColor: "rgba(255,255,255,0.6)",
      gradientSize: 80,
      isContainer: true,
      children: {
        borderSelector: ".btn-border",
        elementSelector: ".btn",
        lightColor: "rgba(255,255,255,0.3)",
        gradientSize: 150,
      },
    })
  }

})

