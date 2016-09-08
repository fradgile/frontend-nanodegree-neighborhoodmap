"use strict";

// Create handler to toggle the sidebar.
$("#nav-button").click(function() {
  $("#menu-icon").toggleClass("glyphicon-menu-left glyphicon-menu-right");
  $("#sidebar").toggleClass('slide-out-of-view');
});

function hideSidebar() {
  $("#menu-icon").removeClass("glyphicon-menu-left");
  $("#menu-icon").addClass("glyphicon-menu-right");
  $("#sidebar").addClass('slide-out-of-view');
}

function showSidebar() {
  $("#menu-icon").removeClass("glyphicon-menu-right");
  $("#menu-icon").addClass("glyphicon-menu-left");
  $("#sidebar").removeClass('slide-out-of-view');
}

// Hide the sidebar by default on small screens.
$(window).resize(function(){
  map.fitBounds(bounds); // re-center the map
  if ($(window).width() <= 480){
    hideSidebar();
  }
});

// Show the sidebar by default on larger screens.
$(window).resize(function(){
  if ($(window).width() >= 800){
    showSidebar();
  }
});
