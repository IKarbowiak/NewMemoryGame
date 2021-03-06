(function(){
    api_url = '/api/decks/';

    angular.module('memo')
        .controller('flipCtrl', ['$scope', '$http', '$interval', function($scope, $http, $interval){
            const choosen_option = parent.document.URL.substring(parent.document.URL.indexOf('?'), parent.document.URL.length);
            $scope.theme_name = choosen_option.split('&')[0].split('=')[1];
            const size = choosen_option.split('=')[2];
            console.log(choosen_option);

            const timeout_for_single_card = {'10': 3000, '16': 3500, '20': 4000};

            const win_gifs = {'Dogs': ['DogWin1.gif', 'DogWin2.gif', 'DogWin3.gif','DogWin4.gif', 'win.gif'],
                                'Cats': ['CatsWin1.gif', 'CatsWin2.gif', 'CatsWin3.gif', 'CatsWin4.gif', 'win.gif'],
                                'WildAnimals': ['win.gif']
            };

            Math.random.seed;

            $scope.winGif = win_gifs[$scope.theme_name][Math.floor(Math.random() * win_gifs[$scope.theme_name].length)]
            console.log($scope.winGif);

            $http.get(`/api/decks/${choosen_option}`).then(function(response){
                $scope.cards = [];
                let row = [];
                let data_with_cards = [].concat(response.data, response.data);
                data_with_cards.sort(function() {
                    return .5 - Math.random();
                });
                let count = 0;
                for (let card of data_with_cards) {
                    let new_card = { id: count, path: card.path, name: card.name, isFlipped: false };
                    row.push(new_card);
                    if (row.length === (size*2/4)){
                        $scope.cards.push(row);
                        row = []
                    }
                    count ++;
                }
            });

            let start_game = false;
            let flipped_cards = [];
            $scope.guesses = 0;
            $scope.time = 0;
            $scope.end = false;

            let flipBack = undefined;

            start_timeout = function (card) {
                flipBack = setTimeout(_ => {
                    card.isFlipped =! card.isFlipped;
                    flipped_cards = [];
                    $scope.guesses ++;
                    console.log($scope.cards);
                    $scope.$apply();
                }, timeout_for_single_card[size]);

            };


            $scope.flipCard = card => {
                if (!card.isFlipped && flipped_cards.length < 2){
//                $('#myModal').modal('show')
                    if (!start_game) {
                        start_game = true;
                        timer = $interval(function () {
                            $scope.time += 1000;
                        }, 1000)
                    }

                    card.isFlipped =! card.isFlipped;
                    flipped_cards.push(card);
                    if (flipped_cards.length === 1){
                        start_timeout(card)
                    }
                    if (flipped_cards.length === 2){
                        clearTimeout(flipBack);
                        $scope.guesses ++;
                        if (flipped_cards[0].name === flipped_cards[1].name) {
                            flipped_cards[0].isGuessed = true;
                            flipped_cards[1].isGuessed = true;
                            flipped_cards = [];
                        }
                        else {
                            setTimeout(_ => {
                            flipped_cards[0].isFlipped = false;
                            flipped_cards[1].isFlipped = false;
                            flipped_cards = [];
                            $scope.$apply();
                            }, 1000)
                        }

                        check_for_end();
                    }
                }

            }


            check_for_end = function () {
//                let deck_cards = $scope.cards.flat();
                let deck_cards = $scope.cards.reduce(function(a, b) {
                    return a.concat(b);
                });
                if (!(deck_cards.some(check))) {
                    $scope.end = true;
                    stop_game();
                    $('#myModal').modal('show')
                    // open_modal()
                }
            };

            check = function(deck_card){
                return deck_card.isFlipped === false;
            };

            stop_game = function(){
                if (angular.isDefined(timer)){
                    $interval.cancel(timer);
                    timer = undefined;

                }
            };

            $scope.showAlert = false;

            $scope.save = function() {
                if ($scope.name) {
                    const data = {
                        'name': $scope.name,
                        'date': new Date(),
                        'time': $scope.time,
                        'score': $scope.guesses,
                        'size': size,
                        'theme': $scope.theme_name
                    };
                    $http.post('/api/game/', data).then(function successCallback(response){
                        console.log(response);
                    }, function errorCallback(response){
                        console.log(response);
                    });
                    $('#myModal').modal('hide')

                }
                else {
                    $scope.showAlert = true;


                }


            };


        }])

})();