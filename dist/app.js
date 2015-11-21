"use strict";

(function () {
  if (!window.addEventListener) return;

  var d = document;
  var wordsPerMinute = 250;

  var options = INSTALL_OPTIONS;
  var element = undefined;
  var textContainer = undefined;
  var observer = undefined;
  var opacityTimeout = undefined;
  var target = undefined;

  function getOffsetTop(element) {
    var offsetTop = 0;

    do {
      if (!isNaN(element.offsetTop)) offsetTop += element.offsetTop;
    } while (element = element.offsetParent); // eslint-disable-line no-cond-assign

    return offsetTop;
  }

  function getScrollPercentage(element) {
    // Consider the element's offset from the body and the portion visible from the viewport.
    var offsetTop = getOffsetTop(element) - d.documentElement.clientHeight;
    // Consider if the element is beyond the viewport.
    var currentY = Math.max(d.body.scrollTop - offsetTop, 0);
    var scrollPercentage = currentY / (element.scrollHeight || element.clientHeight);

    // Consider if the body is scrolled beyond the element.
    return Math.min(scrollPercentage, 1);
  }

  function getTextEstimates(text, percentageRead) {
    var spaces = text.match(/\s+/g);
    var wordCount = spaces ? spaces.length : 0;
    var minutes = wordCount / wordsPerMinute * (1 - percentageRead);

    return { minutes: minutes, wordCount: wordCount };
  }

  function render() {
    clearTimeout(opacityTimeout);

    element.style.opacity = 1;

    if (options.visibleDuration !== "-1") {
      opacityTimeout = setTimeout(function () {
        element.style.opacity = 0;
      }, +options.visibleDuration);
    }

    var _getTextEstimates = getTextEstimates(target.textContent, getScrollPercentage(target));

    var minutes = _getTextEstimates.minutes;
    var wordCount = _getTextEstimates.wordCount;
    var _options = options;
    var strings = _options.strings;

    if (!strings || !options.localize) {
      strings = {
        finished: "",
        lessThanAMinute: "A few seconds left",
        oneMinute: "1 minute left",
        manyMinutes: "$MINUTES minutes left"
      };
    }

    var roundedMinutes = Math.round(minutes);
    var template = undefined;

    if (minutes === 0) {
      template = strings.finished;
    } else if (wordCount < wordsPerMinute || minutes < 1) {
      template = strings.lessThanAMinute;
    } else {
      template = roundedMinutes === 1 ? strings.oneMinute : strings.manyMinutes;
    }

    if (template) {
      textContainer.innerHTML = template.replace(/\$MINUTES/g, roundedMinutes);
    } else {
      element.style.opacity = 0;
    }
  }

  function updateElement() {
    if (element && element.parentNode) element.parentNode.removeChild(element);

    element = d.createElement("eager-app");
    element.className = "eager-reading-time";
    element.setAttribute("data-position", options.position);

    textContainer = d.createElement("div");
    element.appendChild(textContainer);

    if (options.showBackground) textContainer.style.backgroundColor = options.backgroundColor;

    d.body.appendChild(element);

    observer && observer.disconnect();
    window.removeEventListener("scroll", render);
    window.removeEventListener("resize", render);
  }

  function update() {
    updateElement();

    var selector = options.advancedOptions && options.advancedOptions.element;

    if (selector && options.advancedOptionsToggle) {
      target = d.querySelector(selector);

      if (!target) {
        // Target is not yet in the DOM and is most likely being rendered with JS.
        observer && observer.disconnect();

        observer = new MutationObserver(function () {
          return d.querySelector(selector) && update();
        });

        return observer.observe(d.body, { childList: true });
      }
    } else {
      target = document.body;
    }

    window.addEventListener("scroll", render);
    window.addEventListener("resize", render);
  }

  function setOptions(nextOptions) {
    options = nextOptions;
    update();
  }

  // Since we're adding an element to the body, we need to wait until the DOM is
  // ready before inserting our widget.
  d.readyState === "loading" ? d.addEventListener("DOMContentLoaded", update) : update();

  // This is used by the preview to enable live updating of the app while previewing.
  // See the preview.handlers section of the install.json file to see where it's used.
  window.EagerReadingTime = { setOptions: setOptions };
})();