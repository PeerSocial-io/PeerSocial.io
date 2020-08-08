var win = nw.Window.get();
win.showDevTools();

// win.hide();
// var Gun = require("gun")
setTimeout(function() {
  // Create a new window and get it
  nw.Window.open('docs/index.html', {}, function(new_win) {
    
    
    var Gun = require("gun")
    // And listen to new window's focus event
    // new_win.hide();
    // new_win.showDevTools()
    // win.showDevTools()

  });
  
}, 1000)