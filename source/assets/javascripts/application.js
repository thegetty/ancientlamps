//= require_tree .
L.Icon.Default.imagePath = '<%= baseurl %>/assets/stylesheets/vendor/leaflet/images';

// Make this available globally
var RegionMap;

$(document).ready(function() {
  // set up UI
  uiSetup();

  // smoothState init
  $("#main").smoothState({
    onStart: {
      duration: 400,
      render: function($container) {
        $container.velocity('fadeOut', { duration: 200 });
      }
    },
    onReady: {
      duration: 400,
      render: function($container, $newContent) {
        $container.html($newContent);
        $container.velocity('fadeIn', { duration: 100 });
      }
    },
    onAfter: function($container, $newContent) {
      uiSetup();
    }
  });
});
