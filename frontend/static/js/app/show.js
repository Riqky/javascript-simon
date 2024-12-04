define(['jquery'], function($) {
	'use strict';

    const socket = io();

	var Simon = {
		sequence: [],
		copy: [],
		round: 0,
		active: true,
		mode: 'normal',

		init: function() {
			var that = this;
			$('[data-action=start]').on('click', function() {
			    socket.emit("start");
				//that.startGame();
			});
			$('input[name=mode]').on('change', function(e) {
				that.changeMode(e);
			});
		},

		startGame: function(seq) {
			this.sequence = seq;
			this.copy = [];
			this.round = 0;
			this.active = true;
			$('p[data-action="lose"]').hide();
			$('.game-info button').prop( "disabled", true);
			this.newRound();
		},

		// add a new color to the sequence and animate it to the user
		newRound: function() {
		    this.round++;
			$('[data-round]').text(this.round);
			this.copy = this.sequence.slice(0, this.round);
			this.animate(this.copy);
		},

		// the game is controlled primarily through this function, along with checkLose().
		// Since the player can never actually "win", we just listen for clicks as the user
		// plays the sequence and each time, check if they lost
		registerClick: function(e) {
			var desiredResponse = this.copy.shift();
			var actualResponse = $(e.target).data('tile');
			this.active = (desiredResponse === actualResponse);
			this.checkLose();
		},

		// three possible situations:
		// 1. The user clicked the wrong color (end the game)
		// 2. The user entered the right color, but is not finished with the sequence (do nothing)
		// 3. The user entered the right color and just completed the sequence (start a new round)
		checkLose: function() {
			// copy array will be empty when user has successfully completed sequence
			if (this.copy.length === 0 && this.active) {
			    if(this.round >= 5){
                    socket.emit("win");
                    this.deactivateSimonBoard();
                    this.endGame(true);
			    }else{
                    this.deactivateSimonBoard();
                    //this.newRound();
                    socket.emit("new_round");
				}

			} else if (!this.active) { // user lost
				this.deactivateSimonBoard();
				this.endGame();
				socket.emit("fail");
			}
		},

		endGame: function(won=false) {
		    $('.game-info button').prop( "disabled", false);
		    if(won){
		        //show won modal
		    }else{
                // notify the user that they lost and change the "round" text to zero
                $('p[data-action=lose]').show();
                $($('[data-round]').get(0)).text('0');
			}
		},

		changeMode: function(e) {
			this.mode = e.target.value;
		},

		/*----------------- Helper functions -------------------*/

		// prevent user from interacting until sequence is done animating
		deactivateSimonBoard: function() {
			if (this.mode !== 'free-board') {
				$('.simon')
					.off('click', '[data-tile]')
					.off('mousedown', '[data-tile]')
					.off('mouseup', '[data-tile]');

				$('[data-tile]').removeClass('hoverable');
			}
		},

		animate: function(sequence) {
			var i = 0;
			var that = this;
			var interval = setInterval(function() {
				that.playSound(sequence[i]);
				that.lightUp(sequence[i]);

				i++;
				if (i >= sequence.length) {
					clearInterval(interval);
				}
			}, 600);
		},

		lightUp: function(tile) {
			if (this.mode !== 'sound-only') {
				var $tile = $('[data-tile=' + tile + ']').addClass('lit');
				window.setTimeout(function() {
					$tile.removeClass('lit');
				}, 300);
			}

		},

		// we are embedding the sound file on the fly for the following benefits:
		// 1. ability to play multiple sounds in a row without waiting for the first to complete,
		// 2. <audio> tag provides our fallbacks (ogg, mp3).
		playSound: function(tile) {
			if (this.mode !== 'light-only') {
				var audio = $('<audio autoplay></audio>');
				audio.append('<source src="/static/sounds/' + tile + '.ogg" type="audio/ogg" />');
				audio.append('<source src="static/sounds/' + tile + '.mp3" type="audio/mp3" />');
				$('[data-action=sound]').html(audio);
			}
		},

		randomNumber: function() {
			// between 1 and 4
			return Math.floor((Math.random()*4)+1);
		}
	};

     socket.on("connect", () => {
        console.log("connected");
     });

     socket.on("disconnect", () => {
        console.log("disconnected");
        alert("disconnected")
     });

     // Events sent by Server
     socket.on("start", function(msg) {
        console.log("start")
        console.log(msg)
        Simon.startGame(msg);
     });

     socket.on("fail", function(msg) {
        Simon.endGame();
     });

     socket.on("win", function(msg) {
        Simon.endGame(true);
        $(".banner").text("Gefeliciteerd! \n De code is " + msg);
        $(".banner").attr("hidden",false);
        setTimeout(function(){
            $(".banner").attr("hidden",true);
        }, 5000);
     });

     socket.on("new_round", function(){
        Simon.newRound();
     });


	return Simon;
});
