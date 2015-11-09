(function(){

  // The INSTALL_OPTIONS constant is inserted by the Eager bundler.  It's value is the
  // value of the options defined in the install.json file.
  var options = INSTALL_OPTIONS;

  // Since we're adding an element to the head, there's no need to wait for the body of the
  // page to be ready before adding our element.
  var style = document.createElement('style');
  document.head.appendChild(style);

  var update = function(){
    // We update the contents of our style tag in a function to allow us to update it
    // as the user changes the color while previewing the app.
    style.innerHTML = 'body { background: ' + options.color + ' !important; }';
  }

  var setOptions = function(opts){
    options = opts;

    update();
  }

  update();

  // This is used by the preview to enable live updating of the app while previewing.
  // See the preview.handlers section of the install.json file to see where it's used.
  window.EagerExampleNoUI = {
    setOptions: setOptions
  };

})()
