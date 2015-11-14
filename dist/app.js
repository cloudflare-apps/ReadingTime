"use strict";

(function () {
  if (!window.addEventListener) return;

  var d = document;

  // NOTE: I'm unclear why this is necessary. Checking docs...
  // Random thought, how does Eager separate INSTALL_OPTIONS for multiple apps?
  var options = INSTALL_OPTIONS;
  var element = undefined;
  var rendering = false;
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
    var scrollPercentage = currentY / element.clientHeight;

    // Consider if the body is scrolled beyond the element.
    return Math.min(scrollPercentage, 1);
  }

  function getScrollBarPosition() {
    // TODO: Clean up calculation for approximate center of Chrome's scrollbar.
    var offset = d.documentElement.clientHeight / d.body.clientHeight * d.documentElement.clientHeight / 4;

    if (offset < element.clientHeight / 4) offset = 0;

    return d.body.scrollTop / d.body.clientHeight * d.documentElement.clientHeight + offset;
  }

  function getTextEstimates(text, percentageRead) {
    var spaces = text.match(/\s+/g);
    var wordCount = spaces ? spaces.length : 0;
    var minutes = wordCount / options.wordsPerMinute * (1 - percentageRead);

    return { minutes: minutes, wordCount: wordCount };
  }

  function render() {
    if (rendering) return;

    rendering = true;
    clearTimeout(opacityTimeout);

    element.style.transform = "translateY(" + getScrollBarPosition() + "px)";
    element.style.opacity = 1;

    opacityTimeout = setTimeout(function () {
      element.style.opacity = 0;
    }, options.visibleDuration);

    var _getTextEstimates = getTextEstimates(target.innerText, getScrollPercentage(target));

    var minutes = _getTextEstimates.minutes;
    var wordCount = _getTextEstimates.wordCount;

    if (minutes === 0) {
      element.innerText = "Finished";
    } else if (wordCount < options.wordsPerMinute || minutes < 1) {
      element.innerText = "A few seconds";
    } else {
      var roundedMinutes = Math.round(minutes);

      element.innerText = roundedMinutes > 1 ? roundedMinutes + " minutes left" : "1 minute left";
    }

    rendering = false;
  }

  function updateElement() {
    if (element && element.parentNode) element.parentNode.removeChild(element);

    element = d.createElement("div");
    element.className = "eager-reading-time";

    d.body.appendChild(element);

    observer && observer.disconnect();
    window.removeEventListener("scroll", render, true);
  }

  function update() {
    updateElement();

    var selector = options.element.selector;

    target = d.querySelector(selector);

    if (!target) {
      // Target is not yet in the DOM and is most likely being rendered with JS.
      observer && observer.disconnect();

      observer = new MutationObserver(function () {
        return d.querySelector(selector) && update();
      });

      return observer.observe(d.body, { childList: true });
    }

    // TODO: Remove after release.
    target.style.outline = "1px dotted red";

    window.addEventListener("scroll", render, true);
  }

  // NOTE: My first thought was that this was confusing.
  // The global `INSTALL_OPTIONS` is now out of date?
  function setOptions(nextOptions) {
    options = nextOptions;
    update();
  }

  // Since we're adding an element to the body, we need to wait until the DOM is
  // ready before inserting our widget.
  d.readyState === "loading" ? d.addEventListener("DOMContentLoaded", update) : update();

  // This is used by the preview to enable live updating of the app while previewing.
  // See the preview.handlers section of the install.json file to see where it's used.
  // NOTE: This being executed in install.json rubs me the wrong way.
  //       I'm not yet familar with what goes on behind the scenes,
  //       but I can imagine this is hard to pull off without globals.
  window.EagerReadingTime = { setOptions: setOptions };
})();