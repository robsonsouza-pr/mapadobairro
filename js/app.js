var pontosTuristicos = [
    {
        Title: 'Santa Coxinha',
        location: {
            lat: -23.589730,
            lng: -46.576083
        }
    },

    {
        Title: 'Aquario de São Paulo',
        location: {
            lat: -23.593020,
            lng: -46.614060
        }
    },

    {
        Title: 'Zoo Safari',
        location: {
            lat:-23.651167,
            lng:-46.617108
        }
    },

    {
        Title: 'Poderoso Timão',
        location: {
            lat:-23.545017, 
            lng:-46.474257
        }
    },
    {
        Title: 'You Move Ipiranga',
        location: {
            lat:-23.586722,  
            lng:-46.607651
        }
    }
];

var map;
var bounds;
var infowindow;

function initMap() {
    
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: -23.550520, lng: -46.633308
        },
        mapTypeControl: false,
        zoom: 12
    });

    infowindow = new google.maps.InfoWindow({
        maxWidth: 150,
        content: ""
    });

    bounds = new google.maps.LatLngBounds();

    window.onresize = function () {
        map.fitBounds(bounds);
    };

    var PontoTuristico = function (data) {
        var self = this;
        this.nome = ko.observable(data.Title);
        this.location = data.location;
        this.marker = "";
        this.chekin = "";
        this.endereco = "";
    };

    function toggleBounce(marker) {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                marker.setAnimation(null);
            }, 700);
        }
    }

    function getContent(pontoTuristico) {
        if (pontoTuristico.nome.length > 0) {
            return '<div id="content">'+
                                    '<div id="siteNotice">'+
                                    '</div>'+
                                    '<h1 id="firstHeading" class="firstHeading">'+pontoTuristico.nome+'</h1>'+
                                    '<div id="bodyContent">'+
                                    '<p> Endereço: '+pontoTuristico.endereco+'</p>'+
                                    '<p> Chekins: '+pontoTuristico.chekin+'</p>'+
                                    '</div>'+
                                    '</div>';
         } else {
            return 'Não foram encontradas informações no FourSquare';
        }
    }

    function ViewModel() {
        var self = this;
         
        this.isNavOpen = ko.observable(false);
        this.navClick = function () {
            self.isNavOpen(!self.isNavOpen());
        };
        
        this.itemClicked = function (pontoTuristico) {
            google.maps.event.trigger(pontoTuristico.marker, "click");
        };

        this.listaPontosTuristicos = ko.observableArray([]);
        pontosTuristicos.forEach(function (item) {
            self.listaPontosTuristicos().push(new PontoTuristico(item));
        });
       
        //itera a observable list para criar os pontos e colocar a ação de clique neles
        self.listaPontosTuristicos().forEach(function (pontoTuristico) {
            var marker = new google.maps.Marker({
                map: map,
                position: pontoTuristico.location,
                animation: google.maps.Animation.DROP
            });
            pontoTuristico.marker = marker;
            bounds.extend(marker.position);
            marker.addListener("click", function (e) {
                map.panTo(this.position);
                infowindow.setContent(getContent(pontoTuristico));
                infowindow.open(map, marker);
                toggleBounce(marker);
            });
        });

        //buscar as informações no foursquare
        this.getFoursquareInfo = ko.computed(function () {
            self.listaPontosTuristicos().forEach(function (pontoTuristico) {
                $.ajax({
                    type: "GET",
                    url:'https://api.foursquare.com/v2/venues/search',
                    dataType: "json",
                    data:'limit=1' +
                    '&ll='+ pontoTuristico.location.lat +','+ pontoTuristico.location.lng +
                    '&client_id= ASGND3R1U0VIJB3NGCHYXVKD0TOPEQNVYX2JSZK5IOGS0ZLI' +
                    '&client_secret= EWIJQM4JTAWZ4I1W10VG00KECP32D0TDIUWG3SSOM20KUNUK' +
                    '&v=20140806' +
                    '&m=foursquare'
                }).done(function (data) {
                        let venue = data.response.venues ? data.response.venues[0] : "";
                       // pontoTuristico.name = venue.name;
                        pontoTuristico.endereco = venue.location.address;
                        pontoTuristico.chekin = venue.stats.checkinsCount;
                    });
            });
        });

        //Observable para o fitro
        self.filter = ko.observable("");
        
        //efetua o filtro
        this.filteredViewList = ko.computed(function () {
            var search = this.filter().toLowerCase();
            if (!search) {
                //returns viewList array as it is if search is empty. 
                return ko.utils.arrayFilter(self.listaPontosTuristicos(), function (item) {
                    item.marker.setVisible(true);
                    return true;
                });
            } else {
                return ko.utils.arrayFilter(this.listaPontosTuristicos(), function (item) {
                    if (item.nome.toLowerCase().indexOf(search) >= 0) {
                        item.marker.setVisible(true);
                        return true;
                    } else {
                        item.marker.setVisible(false);
                        return false;
                    }
                });
            }
        }, this);
    }
    ko.applyBindings(new ViewModel());
}

function ErrorOccurred() {
    document.getElementById('Maperror').style.display = 'block';
}