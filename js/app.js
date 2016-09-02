"use strict";

var   lat =  29.889972,     // Coordinates for San Marcos
      lng =  -97.955985,  // Coordinates for San Marcos
      map,
      bounds, // Using fitBounds method to center the map based on the marker locations.
      viewModel,
      infowindow,
      fourSquareClientID =  'OI20O3GA3IJTOUWIXZ0TUUTQ1YM1S3HH4CILNFYBV3TYOYR1',
      fourSquareClientSecret =  'QTMBSIJ3WGETM5ID0O31UZMIMHPQN1XLF5VM2ENND2R5C3UC',
      fourSquareURL = 'https://api.foursquare.com/v2/venues/search?client_id=' +
                fourSquareClientID + '&client_secret=' + fourSquareClientSecret + '&v=20130815' +
                '&ll=' + lat + ',' + lng + '&query=' + 'bar' + '&limit=' + 10 + '&intent=browse&radius=2000';

var data = {
// hard coded locations data
// the idea is to use the hard coded location data if Foursquare is down
      locations: [{
        name: "Tap Room",
        formattedAddress: "129 E Hopkins St, San Marcos, TX 78666",
        formattedPhone: "(512) 392-9824",
        category: "Bar",
        url: "http://www.taproomsanmarcos.com",
        lat: 29.883588020812645,
        lng: -97.94055104255676
      }, {
        name: "Sean Patrick's",
        formattedAddress: "202 E San Antonio St, San Marcos, TX 78666",
        formattedPhone: "(512) 392-7310",
        category: "Bar",
        url: "http://www.seanpatrickstx.com",
        lat: 29.882029986197345,
        lng: -97.9396784650171
      }, {
        name: "Zelicks Icehouse",
        formattedAddress: "336 W Hopkins St, San Marcos, TX 78666",
        formattedPhone: "(512) 757-8787",
        category: "Bar",
        url: "http://www.zelickssmtx.com",
        lat: 29.882807668415165,
        lng: -97.945391887348
      }, {
        name: "Gray Horse",
        formattedAddress: "1904 Old RR 12, Just past Dakota Ranch, San Marcos, TX 78666",
        formattedPhone: "None available",
        category: "Bar",
        url: "https://www.facebook.com/Horseflies",
        lat: 29.898365996642124,
        lng: -97.97096422703781
      }, {
        name: "Treff's Tavern",
        formattedAddress: "804 Chestnut St, San Marcos, TX 78666",
        formattedPhone: "(512) 353-1594",
        category: "Bar",
        url: "http://www.treffstavern.com",
        lat: 29.892824,
        lng: -97.9418009519577
      }]
    };

// Location constructor
var Location = function(data) {
  this.name = data.name;
	this.lat = data.lat;
	this.lng = data.lng;
	this.formattedPhone = data.formattedPhone;
	this.url = data.url;
	this.checkinsCount = data.checkinsCount;
	this.formattedAddress = data.formattedAddress;
  this.category = data.category;
  this.marker =  new google.maps.Marker({
                        map: map,
                        icon: 'images/beer.png',
                        position: {lat: data.lat, lng: data.lng},
                        title: data.name,
                        animation: google.maps.Animation.DROP
                    });

    var content =  '<div id="iw-container">' +
                      '<div class="iw-title">' + data.name + '</div>' +
                      '<p><strong>Category: '+ data.category + '</strong></p>' +
                      '<p>Address: ' + data.formattedAddress + '</p>' +
                      '<p>Phone: ' + data.formattedPhone + '</p><div>' +
                      '<p>Foursquare CheckIns: ' + data.checkinsCount + '</p>';
    if(data.url){
      content = content + '<a href="' + data.url + '" target="_blank">' + data.url + '</a>';
    };

    this.marker.contentString = content;
};

// ViewModel
var MyViewModel = function() {
    // call the Location constructor here in order to push the location items into a ko observable array
    var self = this;
    self.searchString = ko.observable('');
    self.locations = ko.observableArray([]);

    // Populate the locations array
    // Needed to wrap the AJAX call in a computed function to overcome the issue
    // of the API returning data after binding has occurred.
    self.getFourSquareData = ko.computed(function() {
    	$.ajax(fourSquareURL, {
    		dataType: 'json',
    		async: true,
    		type: 'GET'
    	})
      .done(function(reponse){
        //console.log('getFourSquareData: done');
        self.locations.push.apply(self.locations, self.makeLocationData(reponse));
    	})
      .fail(function(){
        //console.log('getFourSquareData: fail');
        // Use the hard coded data as a source.
        data.locations.forEach(function(data){
          self.locations.push(new Location(data));
        });
        alert("Foursquare is not responding but we have a few locations as a backup.")
      })
      .always(function() {
        // Add the marker to the location
        //console.log('getFourSquareData: always');
        self.locations().forEach(function(location){
          location.marker.addListener('click', markerClickHandler);
          bounds.extend(location.marker.position);
        });
        map.fitBounds(bounds);
      })
    });

    // Filter locations based on input search field
    self.filteredLocations = ko.computed(function() {
      var filter = self.searchString().toLowerCase();
      if (!filter) {
        // If the filter is empty display all markers and all locations
        self.locations().forEach(function(location){ location.marker.setVisible(true) });
        return self.locations();
      } else {
          return ko.utils.arrayFilter(self.locations(), function(location) {
            var isIncluded = location.name.toLowerCase().indexOf(filter) !== -1;
            location.marker.setVisible(isIncluded);
            return isIncluded;
          });
        }
    });

    // Clicking on a list item should cause the same effect as clicking on a marker.
    self.listItemClickHandler = function(location){
      google.maps.event.trigger(location.marker, 'click')
    }

    self.makeLocationData = function(response){
      var venues = response.response.venues;
      var dataArray = [];
      for (var venue in venues){
        var joint = venues[venue];
        var data = {};
        data.name = joint.name;
        data.lat = joint.location.lat;
        data.lng = joint.location.lng;
        data.formattedPhone = joint.contact.formattedPhone ? joint.contact.formattedPhone : 'None available';
        data.url = joint.url;
        data.checkinsCount = joint.stats.checkinsCount ?  joint.stats.checkinsCount : '0.0';
        data.formattedAddress = joint.location.formattedAddress;
        data.category = joint.categories[0].name;
        dataArray.push( new Location(data));
      };
      return dataArray;
    }
};

// This function is called when the Google API is finished loading.
function initMap() {
  bounds = new google.maps.LatLngBounds();

  // Create the Google map
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    mapTypeControl: false,
    disableDefaultUI: true,
    mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_CENTER
    },
    zoomControl: true,
    zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER
    },
    scaleControl: true,
    streetViewControl: true,
    streetViewControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER
    },
    fullscreenControl: true
  });

  infowindow = new google.maps.InfoWindow();
  viewModel = new MyViewModel(); // create viewModel instance
  ko.applyBindings(viewModel);  // activate knockout
}


function markerClickHandler(){
  var marker = this;
  // First stop all animations
  viewModel.locations().forEach(function(location){
    location.marker.setAnimation(null)
  });

  // Start animation of marker that was clicked.
  marker.setAnimation(google.maps.Animation.BOUNCE);
  // Stop the animation after 0.75 seconds.
  setTimeout(function(){
    marker.setAnimation(null);
  },750);

  hideSidebar();
  map.setCenter(this.position);
  infowindow.setContent(this.contentString);
  infowindow.open(map, this);
}
