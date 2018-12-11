$(function () {
    var model = {
        currentLocations: [],

        locations: [
            "Santa Coxinha", 
            "Bar do Vito Avenida Zelina", 
            "Chocofesta Avenida Zelina", 
            "Droga 20 Vila Zelina",
            "Padaria A Praça  Vila Zelina" 
        ]

    };

    var octopus = {
        init: function () {
            model.currentLocations = model.locations;
            mapView.init();
        },

        getLocations: function(){
            return model.currentLocations;
        },

        filterLocation: function(location){
            model.currentLocations = [];
            console.log(model.locations);
            if (location === 'Selecione:')
                model.currentLocations = model.locations;
            else
                model.currentLocations.push(location);

            mapView.render();
        }

    };

    var mapView = {
        init: function () {
            $locationsList = $('#locations');
            $selectLocation = $('#selectLocation');
            $filterLocationButton = $('#filterLocation');

            map;   
            markers = [];

            mapOptions = {
                disableDefaultUI: true,
                center: { lat: -23.550520, lng: -46.633308 }
            };

            this.render();

            window.addEventListener('resize', function (e) {
                map.fitBounds(mapBounds);
            });

            octopus.getLocations().forEach(function(item, index, locations){
                $selectLocation.append('<option>'+item+'</option>');
            });

            $filterLocationButton.on('click', function(){
                $('#selectLocation option:selected').text();
                octopus.filterLocation( $('#selectLocation option:selected').text());
            });
        },

        render: function () {

            if (markers.length)
                this.clearMarkers();

            $locationsList.empty();

            octopus.getLocations().forEach(function(item, index, locations){
                $locationsList.append('<li>'+item+'</li>');
            });

            this.initializeMap();

            this.pinPoster(this.locationFinder());
        },

        initializeMap: function () {
            //o mapa deve ter uma div
            map = new google.maps.Map(document.querySelector('#map'), mapOptions);

            window.mapBounds = new google.maps.LatLngBounds();
        },

        pinPoster: function (locations) {
            //serviõ do google para procurar locais
            var service = new google.maps.places.PlacesService(map);

            // itera os array de locais e utiliza o serviço para encontrar os locais
            locations.forEach(function (place) {
                // o local a ser pesquisado
                var request = {
                    query: place
                };

                service.textSearch(request, function (results, status) {
                    if (status == google.maps.places.PlacesServiceStatus.OK) {
                        placeData = results[0];
                        
                        var lat = placeData.geometry.location.lat();  // latitude from the place service
                        var lon = placeData.geometry.location.lng();  // longitude from the place service
                        var name = placeData.formatted_address;   
                        var bounds = window.mapBounds; 

                        var marker = new google.maps.Marker({
                            map: map,
                            position: placeData.geometry.location,
                            title: name
                        });

                        markers.push(marker);



                       
                        google.maps.event.addListener(marker, 'click', function () {
                            $.ajax({
                                url:'https://api.foursquare.com/v2/venues/search',
                                dataType: 'json',
                                 data: 'limit=1' +
                                 '&ll='+ lat +','+ lon +
                                 '&client_id= ASGND3R1U0VIJB3NGCHYXVKD0TOPEQNVYX2JSZK5IOGS0ZLI' +
                                 '&client_secret= EWIJQM4JTAWZ4I1W10VG00KECP32D0TDIUWG3SSOM20KUNUK' +
                                 '&v=20140806' +
                                 '&m=foursquare',
                                async: true,
                                success: function(data){
                                    console.log(data);
                                    var result = data.response.venues[0];
                                    var contentString = '<div id="content">'+
                                    '<div id="siteNotice">'+
                                    '</div>'+
                                    '<h1 id="firstHeading" class="firstHeading">'+result.name+'</h1>'+
                                    '<div id="bodyContent">'+
                                    '<p> Endereço: '+result.location.address+'</p>'+
                                    '<p> Chekins: '+result.stats.checkinsCount+'</p>'+
                                    '</div>'+
                                    '</div>';
                                    var infoWindow = new google.maps.InfoWindow({
                                        content: contentString
                                    });
                                    infoWindow.open(map, marker);
                                },

                                error: function(e){
                                    var infoWindow = new google.maps.InfoWindow({
                                        content: "<h1> Não foram encontrados dados sobre o local </h1>"
                                    });
                                    infoWindow.open(map, marker);
                                }

                            });
                        });

                        bounds.extend(new google.maps.LatLng(lat, lon));
                        map.fitBounds(bounds);
                        map.setCenter(bounds.getCenter());
                    }
                });
            });
        },

        locationFinder: function () {
            return octopus.getLocations();
        },

        clearMarkers: function(){
            markers.forEach(function(item, index, array){
                item.map = null;
            });
            markers=[];
        }
    };

    octopus.init();
})
