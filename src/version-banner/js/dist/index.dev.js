"use strict";

/**
 * Hornbach Arcade Style Game SAT PIXI WEBGL
 * Author   : J. Pfeifer joerg.pfeifer@egplusww.com
 * Created  : 06.12.2020
 * Modified : 210130 | 210531 | 210621 | 210706 | 210708 | 210902
 */
(function ($) {
  'use strict'; //Aliases

  var Application,
      AnimatedSprite,
      Container,
      Graphics,
      loader,
      resources,
      Sprite,
      TilingSprite,
      egp = window.EGP,
      game = {
    uiState: ''
  },
      extURL = 'https://mcdo-letzi-quest.info/hornbach-erleben-sie-hornbach-spiel/',
      pixi = {
    spriteJson: "./assets/game-sprite-pixi-3.json"
  },
      gameData = egp.data,
      languageData = egp.language[gameData.language],
      isloaded = false,
      //model
  gameModel,
      //ctrl
  soundCtrl = null,
      playerCtrl = null,
      //DOM references
  $hand = $('#hand-1'),
      $infoBtn = $('#info-btn'),
      $infoGame = $('#info-game'),
      $backBtn = $('#back-btn'),
      $startBtn = $('#start-btn'),
      $playBtn = $('#play-btn'),
      $soundBtn = $('#sound-btn > div'),
      $againBtn = $('#again-btn'),
      $shareBtn = $('#share-btn'),
      $submitBtn = $('#submit-btn'),
      $highscoreBtn = $('#highscore-btn'),
      $copyLinkBtn = $('#copy-link-btn'),
      $socialShareUI = $('#ui-social-share'),
      //$socialShareUIIcons = $socialShareUI.find('.social .icon'),
  $socialShareUIClose = $socialShareUI.find('.close-btn'),
      $loader = $('#loader'),
      //$imagesEnd = $('.image-end'),
  $videoEnd = $(),
      $videoWrapper = $('.video'),
      $groundMoveDummy = $('#ground-move-dummy'),
      $dragTarget = $('#ground-move-dummy .tracker'),
      $highscorePoints = $('#highscore-points'),
      $highscoreAll = $('#highscore-all'),
      $highscoreForm = $('#highscore-form'),
      $highscoreInput = $('#nickname'),
      $score = $('#score'),
      $life = $('#life'),
      $hearts,
      $content = $('#game-wrapper .game-content'),
      $ui = $('#ui'),
      $game = $('#game'),
      $playground = $('#playground'),
      //OS_SYSTEM = 'desktop',
  OS_SYSTEM = lib.GameController.getMobileOperatingSystem(); //

  Function.prototype.bindWithFFX = function (thisArg, ffx) {
    //console.log("");
    //console.log("Function -> bindWithFFX", "this.bind:", this.bind, "thisArg:", thisArg, "ffx:", ffx);
    var that = this; //args = (arguments.length > 1 ? [arguments[0]] : Array.apply(null, arguments));

    return function (e) {
      //console.log("");
      //console.log("Function -> bindWithFFX", "e:", e);
      if (e.currentTarget && typeof ffx === 'function') {
        ffx(e.currentTarget);
      }

      return that.call(thisArg, e);
    };
  };

  function buttonFFXClickThrough(target) {
    //console.log();
    //console.log("buttonFFXClickThrough", "target:", target);
    gsap.to(target, {
      scale: 1.05,
      duration: 0.2,
      ease: 'back.inOut',
      onComplete: function onComplete() {
        gsap.to(target, {
          scale: 0.9,
          duration: 0.25,
          ease: 'back',
          onComplete: function onComplete() {
            gsap.to(target, {
              scale: 1,
              duration: 0.3,
              ease: 'back'
            });
          }
        });
      }
    });
  }

  function resize() {
    /* var mobileDifHeight = 0,
      desktopDifHeight = 0,
      paddingLeftRight = 0,
      innerWidth = window.innerWidth,
      innerHeight = window.innerHeight,
      mobileSafe = innerHeight - mobileDifHeight,
      desktopSafe = innerHeight - desktopDifHeight,
      width = gameModel.rectStage.width,
      height = gameModel.rectStage.height,
      safeZoneHeight = (OS_SYSTEM === 'desktop') ? desktopSafe : mobileSafe,
      //transformOrigin = (OS_SYSTEM === 'desktop' || innerWidth > 767) ? '50% 50%' : '50% 0%',
      factorScale = Math.min(safeZoneHeight / height, 1.5),
      scaledWidth = width * factorScale,
      scaledHeight = height * factorScale,
      stageBounding = $content[0].getBoundingClientRect();
    //
    //gameModel.rectStage.x = Math.floor(stageBounding.x);
    //gameModel.rectStage.y = Math.floor(stageBounding.y);
    console.log("resize:");
    console.log("resize", "stageBounding:", stageBounding);
    console.log("resize", "scaledWidth:", scaledWidth, "scaledHeight:", scaledHeight);
    if (scaledWidth > innerWidth) {
      console.log("resize calculate new factor via width");
      factorScale = (innerWidth - paddingLeftRight) / width;
      scaledHeight = height * factorScale;
      if (scaledHeight > innerHeight - mobileDifHeight) {
        console.log("resize calculate new factor via height");
        factorScale = (innerHeight - mobileDifHeight) / height;
      }
    }
    //
    console.log("resize", "innerWidth:", innerWidth, "innerHeight:", innerHeight);
    console.log("resize", "rectStage.width:", width, "rectStage.height:", height);
    console.log("resize", "scaledWidth:", scaledWidth, "scaledHeight:", scaledHeight);
    console.log("resize", "safeZoneHeight:", safeZoneHeight); */
    //
    //320x640 to 300x600 => 0.9375
    var factorScale = 0.9375; //var factorScale = 1;

    console.log("resize", "factorScale:", factorScale);
    console.log("resize", "$content:", $content);
    /* gsap.set($('#sound-btn'), {
      x: -stageBounding.left,
      y: stageBounding.top
    }); */

    gsap.set($content, {
      scale: factorScale,
      transformOrigin: '0% 0%'
    });
    gameModel.factorScale = factorScale;
  } //@private protected
  // ++++ MEDIATOR GAME OBJECT +++++


  game.getVideo = function (id) {
    return $videoWrapper.find('#' + id);
  };

  game.hideVideo = function (id) {
    return $videoWrapper.find('#' + id);
  };

  game.clearGame = function () {
    //deactivate player ctrl and place
    var i,
        d,
        level,
        levels = gameModel.levels,
        length = levels.length;

    for (i = 0; i < length; i++) {
      level = levels[i];
      pixi.resetLevel(i);

      if (i === 0) {
        pixi.levels.getChildAt(i).y = gameModel.y;
      } else {
        pixi.levels.getChildAt(i).y = gameModel.y - gameModel.levelHeight;
      }
    }

    pixi.activateLevel(0);
    pixi.activateLevel(1);
    playerCtrl.setActive(false);
    gameModel.setX(gameModel.rectStage.width / 2 - gameModel.rectPlayer.width / 2);
    gameModel.setY(gameModel.rectStage.height - gameModel.levelHeight);
    gameModel.currentLevel = 0;
    gameModel.score = 0;
    gameModel.life = 3;
    gameModel.scrollSpeedY = gameModel.SCROLL_SPEED_Y;
    gameModel.collectedItems = [];
    pixi.levels.getChildAt(gameModel.currentLevel).y = gameModel.y;
    pixi.levels.getChildAt(gameModel.getNextLevelIndex()).y = gameModel.y - gameModel.levelHeight;
    pixi.movePlayer();
    $hearts.removeClass('ui-life-lost').addClass('ui-life-full');
    $score.text('00000');
    $submitBtn.addClass('hidden');
    $submitBtn.off('click', game.submitForm);
    $game.hide();
  };

  game.checkRequestPermissionMotionEvent = function () {
    if (typeof OS_SYSTEM === "number" && OS_SYSTEM >= 13 && playerCtrl.name === 'MotionController' && DeviceMotionEvent.requestPermission) {
      DeviceMotionEvent.requestPermission().then(function (response) {
        //$('#consolas-1').html('requestPermission:<br>response: ' + response);
        if (response === 'granted') {
          playerCtrl = new lib.MotionController(gameModel);
        } else {
          //fallback to TouchControllerEuler
          playerCtrl = new lib.TouchControllerEuler(gameModel, $dragTarget);
        }
      }, function (value) {
        //$('#consolas-1').html('requestPermission:<br>failed: ' + value);
        //fallback to TouchControllerEuler
        playerCtrl = new lib.TouchControllerEuler(gameModel, $dragTarget);
      });
    }
  };

  game.load = function () {
    $loader.show(); //game.initGame();

    resize();
    $startBtn.off('click', game.load);
    $startBtn.hide();
    gameModel.state = lib.GameModel.STATE_LOAD; //this is the active user call for AudioContext

    soundCtrl.create(function () {//console.log("soundCtrl", "loaded");
      //$startBtn.off('click', game.load);
      //$startBtn.hide();
    }); //iOS only - works with user click

    game.checkRequestPermissionMotionEvent(); //game.createUI -> game.loadJS -> game.initPixi -> pixi.setup -> game.initialize

    game.loadJS("./js/pixi.min.js", function () {
      game.initPixi();
    });
  };

  game.loadJS = function (src, callback) {
    // Load in JS
    var jsNode = document.createElement('script');
    jsNode.setAttribute("type", "text/javascript");
    jsNode.setAttribute("src", src);
    jsNode.onload = callback;
    document.getElementsByTagName("body")[0].appendChild(jsNode);
  };

  game.loadSounds = function () {
    //console.log("loadSounds");
    if (gameModel.state === lib.GameModel.STATE_INTRO) {
      gameModel.state = lib.GameModel.STATE_LOAD;
      /*if (OS_SYSTEM !== 'desktop') {
          game.toggleFullScreen();
      }*/
      //iOS only - works with user click

      game.checkRequestPermissionMotionEvent(); //

      soundCtrl.create(function () {
        //console.log("loadSounds", "loaded");
        //$startBtn.off('click', game.loadSounds);
        $startBtn.off('click', game.load);
        $startBtn.hide();
        $playBtn.removeClass('hidden');
      });
    }
  };

  game.moveHand = function () {
    $hand.show();
    gsap.to($hand, {
      x: 100,
      opacity: 1,
      onComplete: function onComplete() {
        gsap.to($hand, {
          x: -100,
          onComplete: function onComplete() {
            gsap.to($hand, {
              x: 0,
              opacity: 0,
              onComplete: function onComplete() {
                $hand.hide();
              },
              duration: 0.5
            });
          },
          duration: 0.8,
          ease: 'power1.inOut',
          repeat: 1,
          yoyo: true
        });
      },
      duration: 0.5,
      ease: 'power0'
    });
  };

  game.startGame = function () {
    //console.log("startame");
    //console.log("startGame", "gameModel.state", gameModel.state);
    if (gameModel.state === lib.GameModel.STATE_LOAD || gameModel.state === lib.GameModel.STATE_AGAIN) {
      gameModel.state = lib.GameModel.STATE_START;
      game.resizeGame(); //Autoplay Policy - user must interact

      soundCtrl.play('start');
      $highscoreBtn.hide();
      $infoBtn.hide();
      gsap.delayedCall(0.25, function () {
        $groundMoveDummy.show();
        gsap.to($videoWrapper, {
          scale: 1.5,
          opacity: 0,
          duration: 0.5
        });
        gsap.to($game, {
          duration: 0.6,
          opacity: 1
        });
        gsap.to($playBtn, {
          scale: 0.5,
          opacity: 0,
          duration: 0.5,
          onComplete: function onComplete() {
            var $videoIntro = game.getVideo('video-intro');
            $videoIntro.get(0).pause();
            $videoIntro.get(0).currentTime = 0;
            $videoIntro.css('display', 'none');
            $ui.hide();
            $playBtn.addClass('hidden'); //animate hand

            /* if (OS_SYSTEM !== 'desktop' && playerCtrl.name !== 'MotionController') {
              game.moveHand();
            } */

            game.moveHand();
            gsap.delayedCall(0.9, function () {
              game.runGame();
              soundCtrl.play('hupe');
            });
          },
          ease: 'back.in'
        });
      });
    }
  };

  game.toggleSound = function () {
    if (!gameModel.isSoundOn) {
      $soundBtn.removeClass('ui-sound-off').addClass('ui-sound-on');
      gameModel.isSoundOn = true;
    } else {
      $soundBtn.removeClass('ui-sound-on').addClass('ui-sound-off');
      gameModel.isSoundOn = false;
    }
  };

  game.pauseGame = function () {
    // START | PAUSE | RUN | DEAD | NEXT | HELP | HIGHSCORE
    if (gameModel.state === lib.GameModel.STATE_PAUSE) {
      return;
    }

    gameModel.state = lib.GameModel.STATE_PAUSE;
    pixi.state = pixi.statePause; //pixi.app.ticker.stop();
    //pixi.app.ticker.remove(pixi.gameLoop);
  };

  game.runGame = function () {
    if (gameModel.state === lib.GameModel.STATE_RUN) {
      return;
    }

    gameModel.state = lib.GameModel.STATE_RUN; //Start the game loop by adding the `gameLoop` function to
    //Pixi's `ticker` and providing it with a `delta` argument.
    //pixi.app.ticker.start();

    pixi.state = pixi.stateRun; //pixi.state = pixi.stateDebug;
  };

  game.setScore = function (value) {
    gameModel.score += value;
    var scoreTxt = (gameModel.score + 100000).toString().substr(1);
    $score.text(scoreTxt);
  };

  game.playAgain = function (callback) {
    console.log();
    console.log("game.playAgain", "uiState:", game.uiState, "current state:", gameModel.state);
    game.clearGame(); //window.location.reload();
    //$imagesEnd.css('display', 'none');

    $videoEnd.css('display', 'none');
    game.getVideo('video-lost').css('display', 'none');
    game.getVideo('video-highscore').css('display', 'none');
    $ui.hide();
    $game.show();
    playerCtrl.setActive(true);
    $againBtn.addClass('hidden');
    $highscorePoints.hide();
    $highscoreAll.hide();
    gsap.to($game, {
      duration: 0.6,
      opacity: 1
    }); //STATE_AGAIN

    gameModel.state = lib.GameModel.STATE_AGAIN;
    game.startGame();
  };

  game.showAgain = function (callback) {
    $againBtn.removeClass('hidden');
    gsap.fromTo($againBtn, {
      scale: 0.2,
      opacity: 0
    }, {
      scale: 1,
      opacity: 1,
      ease: 'back',
      delay: 1.0,
      duration: 0.5,
      onComplete: typeof callback === 'function' ? callback : function () {}
    });
  }; //TODO: 05.07.21 skip highscore


  game.submitForm = function () {
    var nickname = $highscoreInput.val(),
        $videoHS = game.getVideo('video-highscore'),
        $videoWin = game.getVideo('video-win');

    if (nickname.length < 2) {
      return;
    } //hide form to prevent double


    $videoWin.css('display', 'none');
    $highscoreForm.hide();
    gameModel.state = lib.GameModel.STATE_HIGHSCORE;
    gameModel.nickname = nickname;
    game.result = JSON.stringify({
      "score": gameModel.score,
      "name": gameModel.nickname
    }); //console.log("submitForm", "score", gameModel.score);
    //console.log("submitForm", "nickname", gameModel.nickname);
    //console.log("submitForm", "$videoHS.get(0):", $videoHS.get(0));
    //$videoHS[0].scrollTo(0, 1);

    $videoHS.css('display', 'inline-block');
    $videoHS.get(0).play();
    gsap.fromTo($videoHS, {
      opacity: 0
    }, {
      opacity: 1,
      duration: 0.5
    });
    $shareBtn.addClass('hidden'); //send highscore data
    //to extern sever: https://mcdo-letzi-quest.info/hornbach-erleben-sie-hornbach-spiel/ -> extURL

    $.ajax({
      type: 'post',
      url: extURL + '_save_highscore.php',
      data: game.result,
      dataType: 'json',
      contentType: "application/json",
      cache: false,
      success: function success(data) {
        console.log("submitForm", "success", "data:", data); //console.log("submitForm", "success", "$highscoreAll.find(.wrapper):", $highscoreAll.find('.wrapper'));
        //$againBtn.addClass('hidden');

        $shareBtn.off('click.share');
        $shareBtn.addClass('hidden');
        gsap.set($againBtn, {
          y: 0
        });
        $againBtn.addClass('hidden');

        if (data.type && data.type === "error") {
          $highscorePoints.hide(); //game.showAgain(game.clearGame);

          game.showAgain();
          return;
        }

        game.fillHighscore(data);
        $highscorePoints.hide();
        gsap.delayedCall(1.5, function () {
          $highscoreAll.show(); //game.showAgain(game.clearGame);

          game.showAgain();
        });
      }
    });
  }; //TODO: 05.07.21 skip highscore


  game.fillHighscore = function (data) {
    console.log("");
    console.log("fillHighscore", "data:", data);
    $highscoreAll.find('.wrapper .item').remove();
    var i,
        item,
        name,
        l = data.highscore.length;

    for (i = 0; i < l; i++) {
      item = data.highscore[i];
      name = item.name.substr(0, 16); //console.log("fillHighscore", item);

      $highscoreAll.find('.wrapper').append($('<div class="item"><div class="item index">' + (i + 1) + '.</div><div class="item name">' + name + '</div><div class="item score">' + item.score + '</div></div>'));
    }
  };

  game.showForm = function () {
    gameModel.state = lib.GameModel.STATE_FORM;
    $highscoreForm.show();
    $highscoreInput.on('focus', function () {
      var $videoWin = game.getVideo('video-win');
      $videoWin.get(0).pause();
      $videoWin.get(0).currentTime = 0;
      $submitBtn.removeClass('hidden');
    });
  };

  game.winGame = function () {
    console.log();
    console.log("game.winGame", "uiState:", game.uiState, "current state:", gameModel.state);
    var $videoWin = game.getVideo('video-win');
    $ui.show();
    $videoWin.css('display', 'inline-block');
    $videoWin.get(0).play();
    gsap.to($game, {
      duration: 0.5,
      opacity: 0
    });
    gsap.to($videoWrapper, {
      scale: 1,
      opacity: 1,
      duration: 0.5,
      delay: 0.65,
      onComplete: function onComplete() {
        $highscorePoints.find('.points').text(gameModel.score);
        gsap.set($highscorePoints, {
          y: 192
        });
        $highscorePoints.show();
        $shareBtn.removeClass('hidden');
        gsap.set($againBtn, {
          y: -28
        });
        game.showAgain();
        $shareBtn.on('click.share', game.toggleSocialShareUI.bindWithFFX(game, buttonFFXClickThrough));
        gsap.delayedCall(1.0, game.showForm);
      }
    });
  };

  game.looseGame = function () {
    var $videoLost = game.getVideo('video-lost');
    $ui.show();
    $videoLost.css('display', 'inline-block');
    $videoLost.get(0).play();
    gsap.to($game, {
      duration: 0.5,
      opacity: 0
    });
    gsap.to($videoWrapper, {
      scale: 1,
      opacity: 1,
      duration: 0.5,
      delay: 0.35
    });
    gsap.set($highscorePoints, {
      y: 380
    });
    $highscorePoints.find('.points').text(gameModel.score);
    game.clearGame();
    game.showAgain(function () {
      $highscorePoints.show();
    });
  };

  game.gameOver = function () {
    $groundMoveDummy.hide();
    game.result = JSON.stringify({
      "score": gameModel.score
    }); //TODO: 05.07.21 skip highscore

    $ui.show(); //Endscreen-Logik: 1 - 999 | 1000 - 1999 | 2000 - 2999 | 3000 - 4999 | 5000 +

    if (gameModel.score < 1000) {
      $videoEnd = game.getVideo('video-result-1'); //$imagesEnd.eq(0).css('display', 'block');
    } else if (gameModel.score < 2000) {
      $videoEnd = game.getVideo('video-result-2'); //$imagesEnd.eq(1).css('display', 'block');
    } else if (gameModel.score < 3000) {
      $videoEnd = game.getVideo('video-result-3'); //$imagesEnd.eq(2).css('display', 'block');
    } else if (gameModel.score < 5000) {
      $videoEnd = game.getVideo('video-result-4'); //$imagesEnd.eq(3).css('display', 'block');
    } else if (gameModel.score >= 5000) {
      $videoEnd = game.getVideo('video-result-5'); //$imagesEnd.eq(4).css('display', 'block');
    }

    $videoEnd.css('display', 'inline-block');
    $videoEnd.get(0).play();
    gsap.to($game, {
      duration: 0.5,
      opacity: 0
    });
    gsap.to($videoWrapper, {
      scale: 1,
      opacity: 1,
      duration: 0.5,
      delay: 0.35,
      onComplete: function onComplete() {
        gsap.set($highscorePoints, {
          y: 290
        });
        $highscorePoints.find('.points').text(gameModel.score);
        game.clearGame();
        $shareBtn.removeClass('hidden');
        gsap.fromTo($shareBtn, {
          opacity: 0,
          scale: 0.5
        }, {
          opacity: 1,
          scale: 1,
          ease: 'back',
          duration: 0.5
        }); //$shareBtn.on('click.share', game.toggleSocialShareUI.bindWithFFX(game, buttonFFXClickThrough));

        game.showAgain(function () {
          $highscorePoints.show();
        });
      }
    });
    /*
    $.ajax({
        type: 'post',
        url: extURL + '_get_highscore_index.php',
        data: game.result,
        dataType: 'json',
        contentType: "application/json",
        cache: false,
        success: function (data) {
            console.log("gameOver", data);
            //"WINNER" oder "LOOSER"
            if (data === "WINNER") {
                game.winGame();
            } else if (data === "LOOSER") {
                game.looseGame();
            } else {
                console.log("ERROR gameOver", data);
            }
        }
    });
    */
  };

  game.setLife = function (value) {
    gameModel.setLife(value);
    var isDead = !gameModel.life; //console.log("+++ setLife IS DEAD +++", 'gameModel.life', gameModel.life, 'isDead', isDead);

    gsap.to($hearts.eq(gameModel.life), {
      scale: 0.15,
      duration: 0.3,
      delay: 0.15,
      ease: 'back.in',
      onComplete: function onComplete() {
        $hearts.eq(gameModel.life).removeClass('ui-life-full').addClass('ui-life-lost');
        gsap.to($hearts.eq(gameModel.life), {
          scale: 1,
          ease: 'back',
          duration: 0.6,
          onComplete: function onComplete() {
            if (isDead) {
              //GAME OVER GET HIGHSCORE
              game.gameOver();
            } else {
              pixi.restartLevel();
            }
          }
        });
      }
    });
  }; //TODO: 05.07.21 skip highscore


  game.toggleHighscore = function () {
    console.log("");
    console.log("game.toggleHighscore", "uiState:", game.uiState, "current state:", gameModel.state);
    var currState = gameModel.state,
        $videoInfo = game.getVideo('video-info'),
        $videoHS = game.getVideo('video-highscore');

    if (game.uiState === 'info') {
      game.toggleInfo();
    }

    game.uiState = 'highscore';

    if ($videoHS.css('display') === 'none') {
      if (currState === lib.GameModel.STATE_RUN) {
        game.pauseGame();
      } else if (currState === lib.GameModel.STATE_INTRO) {
        $startBtn.addClass('hidden');
      } else if (currState === lib.GameModel.STATE_LOAD) {
        $playBtn.addClass('hidden');
      }

      $backBtn.removeClass('hidden');
      $videoInfo.css('display', 'none');
      $videoHS.css('display', 'inline-block');
      $videoHS.get(0).play();
      gsap.fromTo($videoHS, {
        opacity: 0
      }, {
        opacity: 1,
        duration: 0.5
      });
      gsap.to($videoWrapper, {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        onComplete: function onComplete() {
          //headers.append('Access-Control-Allow-Origin', 'http://localhost:3000');
          //headers.append('Access-Control-Allow-Credentials', 'true');
          $.ajax({
            type: 'post',
            url: extURL + '_get_highscore_100.php',
            //data: JSON.stringify({ "score": gameModel.score }),
            dataType: 'json',
            contentType: "application/json",
            cache: false,
            success: function success(data) {
              console.log(" toggleHighscore", data);

              if (game.uiState === 'highscore') {
                game.fillHighscore(data);
                $highscoreAll.show();
              }
            }
          });
        }
      });
    } else {
      if (currState === lib.GameModel.STATE_PAUSE) {
        game.runGame();
      } else if (currState === lib.GameModel.STATE_INTRO) {
        $startBtn.removeClass('hidden'); //$infoBtn.show();
      } else if (currState === lib.GameModel.STATE_LOAD) {
        $playBtn.removeClass('hidden'); //$infoBtn.show();
      }

      $highscoreAll.hide();
      $videoHS.css('display', 'none');
      $backBtn.addClass('hidden');
      game.uiState = '';
      $infoGame.hide();
    }
  };

  game.toggleInfo = function () {
    console.log();
    console.log("game.toggleInfo", "uiState:", game.uiState, "current state:", gameModel.state);
    console.log("game.toggleInfo", "this:", this, "arguments:", arguments);

    if (game.uiState === 'highscore') {
      game.toggleHighscore();
    }

    game.uiState = 'info';
    var $videoInfo = game.getVideo('video-info'),
        $videoHS = game.getVideo('video-highscore');

    if ($videoInfo.css('display') === 'none') {
      if (gameModel.state === lib.GameModel.STATE_INTRO) {
        $startBtn.hide(); //$highscoreBtn.hide();
      }

      if (gameModel.state === lib.GameModel.STATE_LOAD) {
        $playBtn.hide(); //$highscoreBtn.hide();
      }

      $videoHS.css('display', 'none');
      $videoInfo.css('display', 'inline-block');
      $videoInfo.get(0).play();
      gsap.delayedCall(0.3, function () {
        $infoGame.show();
        gsap.fromTo($infoGame, {
          opacity: 0
        }, {
          opacity: 1,
          duration: 0.7
        });
        $backBtn.removeClass('hidden');
      });
    } else {
      if (gameModel.state === lib.GameModel.STATE_INTRO) {
        $startBtn.show(); //$highscoreBtn.show();
      }

      if (gameModel.state === lib.GameModel.STATE_LOAD) {
        $playBtn.show(); //$highscoreBtn.show();
      }

      $videoInfo.css('display', 'none');
      $backBtn.addClass('hidden');
      game.uiState = '';
      gsap.to($infoGame, {
        opacity: 0,
        duration: 0.4,
        onComplete: function onComplete() {
          $infoGame.hide();
        }
      });
    }
  };

  game.handleBackBtn = function () {
    if (game.uiState === 'info') {
      game.toggleInfo();
    } else if (game.uiState === 'highscore') {
      game.toggleHighscore();
    }
  };

  game.toggleSocialShareUI = function () {
    //$socialShareUI, $socialShareUIIcons, $socialShareUIClose
    //console.log();
    //console.log("game.toggleSocialShareUI", "uiState:", game.uiState, "current state:", gameModel.state);
    if (game.uiState !== 'social') {
      game.uiState = 'social';
      $socialShareUI.show();
      $socialShareUIClose.on('click.social', game.toggleSocialShareUI.bindWithFFX(game, buttonFFXClickThrough));
    } else {
      game.uiState = '';
      $socialShareUI.hide();
      $socialShareUIClose.off('click.social');
    }
  };

  game.copyLink = function () {
    //window.EGPClipboard.copyText('https://online.e-graphics-germany.de/clients/hornbach_de/minigame_2020_11/arcade_game_HTML5_PIXI_V08_201128/');
    //window.EGPClipboard.copyText(encodeURIComponent(location.href));
    window.EGPClipboard.copyText(window.location.href);

    if (navigator.share) {
      navigator.share({
        title: game.shareText,
        text: game.shareText,
        url: window.location.href
      }); //.then(() => console.log('Share complete'))
      //.error((error) => console.error('Could not share at this time', error));
    }
  };

  game.registerEvents = function () {
    $highscoreBtn.on('click', game.toggleHighscore.bindWithFFX(game, buttonFFXClickThrough));
    $infoBtn.on('click', game.toggleInfo.bindWithFFX(game, buttonFFXClickThrough));
    $backBtn.on('click', game.handleBackBtn.bindWithFFX(game, buttonFFXClickThrough));
    $startBtn.on('click', game.load.bindWithFFX(game, buttonFFXClickThrough));
    $playBtn.on('click', game.startGame.bindWithFFX(game, buttonFFXClickThrough));
    $soundBtn.on('click', game.toggleSound.bindWithFFX(game, buttonFFXClickThrough));
    $againBtn.on('click', game.playAgain.bindWithFFX(game, buttonFFXClickThrough));
    $submitBtn.on('click', game.submitForm.bindWithFFX(game, buttonFFXClickThrough));
    $copyLinkBtn.on('click', game.copyLink.bindWithFFX(game, buttonFFXClickThrough));
    $shareBtn.on('click.share', game.toggleSocialShareUI.bindWithFFX(game, buttonFFXClickThrough)); //game.toggleSocialShareUI();
    // register keyboard events desktop

    document.addEventListener('keydown', function (event) {
      var key = event.keyCode;

      if (key === 37 || key === 38 || key === 39 || key === 40) {
        event.preventDefault();
      }

      switch (event.code) {
        case 'Space':
          if (gameModel.state === lib.GameModel.STATE_INTRO) {
            game.loadSounds();
          } else if (gameModel.state === lib.GameModel.STATE_LOAD) {
            game.startGame();
          } else if (gameModel.state === lib.GameModel.STATE_AGAIN) {
            game.playAgain();
          } else {
            //DEBUGGING
            if (gameModel.state === lib.GameModel.STATE_PAUSE) {
              game.runGame();
            } else if (gameModel.state === lib.GameModel.STATE_RUN) {
              game.pauseGame();
            }
          }

          break;

        case 'Enter':
          //submit form
          if (gameModel.state === lib.GameModel.STATE_FORM) {
            game.submitForm();
          } //if (gameModel.state === lib.GameModel.STATE_HIGHSCORE) {}


          break;

        case 'KeyZ':
          console.log("keydown", "gameModel:");
          console.log(gameModel); //

          break;
      } //console.log("keydown", "event.code:", event.code);

    });
    /* if (typeof document.hidden !== "undefined") {
        hidden = "hidden", visibilityChange = "visibilitychange", visibilityState = "visibilityState";
    } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden", visibilityChange = "msvisibilitychange", visibilityState = "msVisibilityState";
    }
     var document_hidden = document.hidden;
    document.addEventListener("visibilitychange", function() {
        if (document_hidden != document[hidden]) {
            if (document[hidden]) {
                // Document hidden
            } else {
                // Document shown
            }
            document_hidden = document[hidden];
        }
    }); */
  };

  game.createUI = function (created, done) {
    //console.log("");
    //console.log("createUI", "languageData:", languageData);
    var i,
        item,
        $elem,
        autoplay,
        loop,
        l = languageData.length,
        countVideos = 0,
        onLoadVideos = function onLoadVideos(e) {
      //console.log("createUI", "canplaythrough:", countVideos, e.target.src);
      countVideos--;
      e.target.removeEventListener('canplaythrough', onLoadVideos, false); // = true;

      if (countVideos === 0) {
        isloaded = true;
        done();
      }
    }; //


    for (i = 0; i < l; i++) {
      item = languageData[i]; //console.log("createUI", "+++ id:", item.id);
      //console.log("createUI", "item:", item);

      if (item.id.indexOf('btn') !== -1) {
        $('#' + item.id).css('line-height', item.lineHeight).find('span').text(item.text).css({
          'font-size': item.size,
          'padding-left': '3px'
        });
      } else if (item.id.indexOf('footer') !== -1) {
        $('#' + item.id).attr('href', item.href).attr('title', item.text).text(item.text);
      } else if (item.id === 'hornbach-logo') {
        $('#' + item.id).find('a').attr('href', item.href).attr('title', item.text);
      } else if (item.id === 'social-share') {
        $('#' + item.id).text(item.text);
        game.shareText = item.content;
      } else if (item.id.indexOf('video') !== -1) {
        autoplay = item.id.indexOf('intro') !== -1 ? ' autoplay' : '';
        loop = item.loop ? ' loop' : ''; //console.log("createUI", "item:", item.id, "autoplay:", autoplay);

        $elem = $('<video id="' + item.id + '" width="320" height="569" muted playsinline' + autoplay + loop + ' webkit-playsinline="" disablepictureinpicture="" controlslist="nodownload" poster="' + item.poster + '">'); //$elem.append('<source src="' + item.src + '" type="video/mp4">')

        $videoWrapper.append($elem);
        $elem[0].src = item.src;
        $elem[0].load(); //$elem[0].addEventListener('loadeddata', onLoadVideos, false);
        //$elem[0].addEventListener('canplaythrough', onLoadVideos, false);

        countVideos++;
      }
    } //create Lifes


    l = gameModel.life;

    for (i = 0; i < l; i++) {
      $life.append($('<span class="heart icon ui-life-full"></span>'));
    } //get reference to life


    $hearts = $life.find('.heart'); //$socialShareUI, $socialShareUIIcons, $socialShareUIClose
    //TODO: dynamic share url via game.js -> language
    //initialize sound icon

    if (gameModel.isSoundOn) {
      $soundBtn.removeClass('off').addClass('on');
    } else {
      $soundBtn.removeClass('on').addClass('off');
    }

    created();
    isloaded = true;
    done();
  };

  game.initGame = function () {
    //
    //create model
    gameModel = new lib.GameModel(gameData); //

    gameModel.rectStage.width = 320;
    gameModel.rectStage.height = 640; //gameModel.rectStage.height = 480;
    // setting  rect player gameData.player.height

    gameModel.rectPlayer.width = gameData.player.width;
    gameModel.rectPlayer.height = gameData.player.height;
    gameModel.rectPlayerStart.width = gameData.player.width;
    gameModel.rectPlayerStart.height = gameData.player.heightStart;
    gameModel.rectPlayerMid.y = gameData.player.heightStart;
    gameModel.rectPlayerMid.width = gameData.player.width;
    gameModel.rectPlayerMid.height = gameData.player.heightMid;
    gameModel.rectPlayerEnd.y = gameData.player.heightStart + gameData.player.heightMid;
    gameModel.rectPlayerEnd.width = gameData.player.width;
    gameModel.rectPlayerEnd.height = gameData.player.heightEnd; //
    //set game model
    //gameModel.setGlobals(gameData);

    gameModel.currentLevel = 0;
    gameModel.levelHeight = 1920; //gameModel.levelHeight = 960;

    gameModel.width = gameModel.rectPlayer.width;
    gameModel.height = gameModel.rectPlayer.height; // create sound controller

    soundCtrl = new lib.SoundCtrlAudioContext(gameModel);
    playerCtrl = new lib.TouchControllerVerlet(gameModel, $dragTarget);
    gameModel.update = gameModel.updateVerlet; // create player controller

    /*if (OS_SYSTEM === "desktop") {
      playerCtrl = new lib.KeyController(gameModel);
      gameModel.update = gameModel.updateVerletKey;
      $copyLinkBtn.css('display', 'none');
    } else {
      // V08
      // if (typeof window.DeviceOrientationEvent !== 'undefined') {
      //     playerCtrl = new lib.MotionController(gameModel);
      //     gameModel.update = gameModel.updateVerlet;
      // } else {
      //     playerCtrl = new lib.TouchControllerEuler(gameModel, $dragTarget);
      //     gameModel.update = gameModel.updateEuler;
      // }
      // V07
      //playerCtrl = new lib.TouchControllerEuler(gameModel, $dragTarget);
      //gameModel.update = gameModel.updateEuler;
      // V06
      playerCtrl = new lib.TouchControllerVerlet(gameModel, $dragTarget);
      gameModel.update = gameModel.updateVerlet;
    }*/
    //console.log("");
    //console.log("initGame", "OS_SYSTEM:", OS_SYSTEM);
    //console.log("initGame", "DeviceOrientationEvent:", window.DeviceOrientationEvent);
    //console.log("initGame", "playerCtrl.name:", playerCtrl.name);
    //console.log("initGame", "gameModel.x:", gameModel.x);

    resize(); //game.createUI -> game.loadJS -> game.initPixi -> pixi.setup -> game.initialize

    game.createUI(function created() {
      console.log("createUI", "created");
      gsap.fromTo($startBtn, {
        scale: 2,
        opacity: 0
      }, {
        scale: 1,
        opacity: 1,
        ease: 'back.inOut',
        delay: 0.5,
        duration: 0.6,
        onStart: function onStart() {
          $startBtn.removeClass('hidden');
        }
      });
      game.registerEvents();
    }, function done() {
      console.log("createUI", "done"); //$loader.hide();
    }); //stop scaling on iOS

    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      window.document.addEventListener('touchmove', function (e) {
        if (e.scale !== 1) {
          e.preventDefault();
        }
      }, {
        passive: false
      });
    }
  };

  game.initialize = function () {
    //
    game.resizeGame(); //$('#consolas-1').html($('#consolas-1').html() + '<br>initialize()' + '<br>innerHeight: ' + window.innerHeight + '<br>body height: ' + $('body').height());

    $playBtn.removeClass('hidden');
    gsap.fromTo($playBtn, {
      scale: 2,
      opacity: 0
    }, {
      scale: 1,
      opacity: 1,
      ease: 'back.inOut',
      delay: 0.5,
      duration: 0.6,
      onComplete: function onComplete() {
        $loader.hide();
        pixi.stateRun(1.0);
      }
    });
    setTimeout(function () {
      //console.log("");
      //console.log("initialize", "setTimeout scrollTo");
      window.scrollTo(0, 1);
    }, 1);
    /* if ($startBtn.hasClass('hidden')) {
        $startBtn.removeClass('hidden');
        gsap.fromTo($startBtn, { scale: 2, opacity: 0 }, { scale: 1, opacity: 1, ease: 'back.inOut', delay: 0.5, duration: 0.6 });
        $loader.hide();
        game.registerEvents();
        //render to stage
        pixi.stateRun(1.0);
        setTimeout(function () {
            console.log("");
            console.log("initialize", "setTimeout scrollTo");
            window.scrollTo(0, 1);
        }, 1);
    } */
  };

  game.initPixi = function () {
    resize(); //Aliases

    Application = PIXI.Application;
    Container = PIXI.Container;
    Graphics = PIXI.Graphics; //ParticleContainer = PIXI.ParticleContainer;

    loader = PIXI.Loader.shared;
    resources = loader.resources;
    Sprite = PIXI.Sprite;
    TilingSprite = PIXI.TilingSprite;
    AnimatedSprite = PIXI.AnimatedSprite; //create pixi app

    pixi.app = new Application({
      width: gameModel.rectStage.width,
      height: gameModel.rectStage.height,
      antialias: true,
      transparent: false,
      resolution: 1
    });
    /* pixi.app = {
        renderer: new PIXI.Renderer({
            width: gameModel.rectStage.width,
            height: gameModel.rectStage.height,
            backgroundColor: 0xfcee21
        }),
        stage: new Container(),
        ticker: new PIXI.Ticker()
    }; */
    //Add the canvas that Pixi automatically created for you to the HTML document

    $playground[0].appendChild(pixi.app.view); //$playground[0].appendChild(pixi.app.renderer.view);
    //
    // register the plugin

    gsap.registerPlugin(PixiPlugin); // give the plugin a reference to the PIXI object

    PixiPlugin.registerPIXI(PIXI); //pixi.app.resizeTo = $game[0];

    pixi.app.ticker.add(pixi.gameLoop);
    pixi.app.ticker.start(); //load a JSON file and run the `setup` function when it's done

    loader.add(pixi.spriteJson).load(pixi.setup); //$('#consolas-1').html($('#consolas-1').html() + '<br>initPixi' + '<br>innerHeight: ' + window.innerHeight);
  };

  game.resizeGame = function () {
    //
    //gameModel.playerStageY = gameModel.rectStage.height - Math.floor(gameModel.rectPlayer.height * 1.5);
    //console.log("game.resizeGame", "gameModel:", gameModel);
    //console.log("game.resizeGame", "pixi.movePlayer:", pixi.movePlayer);
    gameModel.playerStageY = 480; //gameModel.playerStageY = 360;
    //gameModel.playerStageY = 290;

    gameModel.setX(gameModel.rectStage.width / 2 - gameModel.rectPlayer.width / 2);
    gameModel.setY(gameModel.rectStage.height - gameModel.levelHeight);

    if (playerCtrl.moveObj) {
      playerCtrl.moveObj.x = gameModel.x;
    } //


    if (pixi.player) {
      pixi.player.x = gameModel.x;
      pixi.player.y = gameModel.playerStageY; //pixi.levels.getChildAt(gameModel.currentLevel).y = gameModel.y;
      //pixi.levels.getChildAt(gameModel.getNextLevelIndex()).y = (gameModel.y - gameModel.levelHeight);

      pixi.movePlayer();
    } //console.log("");
    //console.log("game.resizeGame", "gameModel.x:", gameModel.x);
    //gsap.set($startBtn, { y: 428 });
    //gsap.set($playBtn, { y: 428 });
    //gsap.set($againBtn, { y: 454 });


    $('body').removeClass('desktop mobile').addClass(OS_SYSTEM === 'desktop' ? 'desktop' : 'mobile'); //
    //$('#consolas-1').html($('#consolas-1').html() + '<br>resizeGame' + '<br>innerHeight: ' + window.innerHeight + '<br>stage: ' + gameModel.rectStage.width + ', ' + gameModel.rectStage.height + '<br>game: ' + $game.height());
  };

  game.toggleFullScreen = function () {
    var doc = window.document,
        docEl = doc.documentElement,
        requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen,
        cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen; //

    if (requestFullScreen && !doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
      requestFullScreen.call(docEl);
    } else if (cancelFullScreen) {
      cancelFullScreen.call(doc);
    }
  }; // ++++++++ PIXI +++++++++++

  /**
   * Get an integer between min and max
   * @param {int} min random from min
   * @param {int} max to max int
   */


  pixi.randomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  pixi.gameLoop = function (delta) {
    //Update the current game state:
    pixi.state(delta);
  };

  pixi.activateLevel = function (index) {
    //console.log("activateLevel", "index:", index);
    var i,
        obj,
        level = gameModel.levels[index],
        walls = level.walls,
        items = level.collectableItems,
        l = walls.length;
    level.sprite.visible = true;

    for (i = 0; i < l; i++) {
      obj = walls[i]; //if (obj.y < gameModel.levelHeight) {

      if (obj.tl) {
        obj.tl.play();
      } //}

    }

    l = items.length;

    for (i = 0; i < l; i++) {
      obj = items[i]; //if (obj.y < gameModel.levelHeight) {

      if (obj.tl) {
        obj.tl.play();
      } //}

    }
  };

  pixi.distributeItems = function (index) {
    var i,
        d,
        l,
        length,
        mid,
        hitTest,
        wall,
        item,
        rect,
        level = gameModel.levels[index],
        count = 0,
        minX = 18,
        maxX = 302,
        minY = 120,
        //maxY = level.height - 310,
    maxY = gameModel.levelHeight - 310,
        width = maxX - minX,
        //284
    walls = level.walls,
        items = level.collectableItems,
        testables = [],
        testitems = []; //prepare the searching for intersection of items
    //push mitarbeiter hornbach stapler and walls into testable array

    length = items.length;

    for (i = 0; i < length; i++) {
      item = items[i];

      if (item.name === 'item-mitarbeiter') {
        //rect = new lib.Rectangle(minX, item.y, width, item.height);
        //rect.name = item.name;
        testitems.push(item);
      } else if (item.name === 'item-hornbach') {
        rect = new lib.Rectangle(item.x, item.y, item.width, item.height);
        rect.inflate(20, 20);
        rect.name = item.name;
        testables.push(rect);
      } else {
        testitems.push(item); //console.log("pixi.distributeItems", "testitems item:", item);
      }
    }

    l = walls.length;

    for (i = 0; i < l; i++) {
      wall = walls[i];

      if (wall.name.indexOf('stapler-') !== -1) {
        rect = new lib.Rectangle(minX, wall.y, width, wall.height);
      } else {
        rect = new lib.Rectangle(wall.x, wall.y, wall.width, wall.height);
      }

      rect.inflate(20, 20);
      rect.name = wall.name;
      testables.push(rect);
    } //


    mid = Math.floor(testitems.length / 2); //console.log("pixi.distributeItems");
    //console.log("pixi.distributeItems", "testables:", JSON.parse(JSON.stringify(testables)));

    while (++count <= 300) {
      i = length = testitems.length;

      while (--i >= 0) {
        item = testitems[i]; //find random x/y between min and max x values and level height

        if (item.name === 'item-mitarbeiter') {
          item.x = width;
        } else {
          item.x = pixi.randomInt(Math.ceil(minX + item.width), Math.floor(maxX - item.width));
        }

        item.y = i > length / 2 ? pixi.randomInt(minY, (maxY - minY) / 2) : pixi.randomInt((maxY - minY) / 2, maxY);
        hitTest = false;
        l = testables.length;

        for (d = 0; d < l; d++) {
          rect = testables[d]; //early out if item intersects

          hitTest = item.name === 'item-mitarbeiter' ? rect.intersects(new lib.Rectangle(minX, item.y - 20, width, item.height + 20)) : rect.intersects(item);

          if (hitTest) {
            break;
          }
        }

        if (!hitTest) {
          //console.log("pixi.distributeItems", "item:", item);
          if (item.name === 'item-mitarbeiter') {
            item.sprite.x = item.x;
            rect = new lib.Rectangle(minX, item.y, width, item.height);
            rect.inflate(0, 10);
          } else {
            item.sprite.x = item.x + item.width / 2;
            rect = new lib.Rectangle(item.x, item.y, item.width, item.height);
            rect.inflate(10, 10);
          }

          item.sprite.y = item.y + item.height / 2;
          testitems.splice(i, 1);
          rect.name = item.name;
          testables.push(rect);
        }
      }

      if (testitems.length === 0) {
        break;
      }
    } //console.log("pixi.distributeItems", "level:", level);
    //console.log("pixi.distributeItems", "testables:", testables);

  };

  pixi.resetLevel = function (index) {
    var i,
        obj,
        level = gameModel.levels[index],
        walls = level.walls,
        items = level.collectableItems,
        l = walls.length;
    level.sprite.visible = false;

    for (i = 0; i < l; i++) {
      obj = walls[i]; //if (obj.y < gameModel.levelHeight) {

      if (obj.tl) {
        obj.tl.pause();
      } //}

    }

    l = items.length;

    for (i = 0; i < l; i++) {
      obj = items[i];
      obj.collected = false; //if (obj.y < gameModel.levelHeight) {

      obj.sprite.visible = true;

      if (obj.tl) {
        obj.tl.pause();
      } //}

    } //console.log("resetLevel", "index:", index, "loop:", gameModel.loop);

  };

  pixi.restartLevel = function () {
    gsap.delayedCall(1.0, function () {
      //reset player
      gameModel.setX(gameModel.rectStage.width / 2 - gameModel.rectPlayer.width / 2);
      gameModel.setY(gameModel.rectStage.height - gameModel.levelHeight);
      gameModel.direction = 0; //set start position

      pixi.levels.getChildAt(gameModel.currentLevel).y = gameModel.y;
      pixi.levels.getChildAt(gameModel.getNextLevelIndex()).y = gameModel.y - gameModel.levelHeight;
      pixi.movePlayer();

      if (gameModel.currentWall && gameModel.currentWall.tl) {
        gameModel.currentWall.tl.play();
      }

      game.moveHand();
      gsap.delayedCall(0.2, function () {
        game.runGame();
        soundCtrl.play('hupe');
      });
    });
  };

  pixi.resetPlayerModus = function () {
    //console.log("resetPlayerModus");
    gameModel.playerModus = lib.GameModel.PLAYER_MODUS_NORMAL;
    gsap.killTweensOf(pixi.player);
    gsap.killTweensOf(pixi.player.children);
    pixi.player.alpha = 1;
    gsap.set(pixi.player.children, {
      pixi: {
        alpha: 1
      }
    }); //gsap.set(pixi.trainCountdown.children, { pixi: { alpha: 0, scale: 1 } });
  };

  pixi.wallCollision = function (type) {
    var dur = 0.025; //console.log("wallCollision", 'type:', type);

    if (type === 'front') {
      gsap.set(pixi.trainExplosion, {
        y: 0
      });
    } else if (type === 'mid') {
      gsap.set(pixi.trainExplosion, {
        y: gameModel.rectPlayerStart.height
      });
    } else if (type === 'end') {
      gsap.set(pixi.trainExplosion, {
        y: gameModel.rectPlayerStart.height + gameModel.rectPlayerMid.height
      });
    }

    gsap.to(pixi.trainExplosion.children, {
      pixi: {
        alpha: 1
      },
      duration: dur,
      stagger: dur
    });
    gsap.to(pixi.trainExplosion.children, {
      pixi: {
        alpha: 0
      },
      duration: 1,
      delay: 0.5
    });
    gsap.to(pixi.player, {
      pixi: {
        alpha: 0
      },
      duration: 0.075,
      onComplete: function onComplete() {
        pixi.player.alpha = 1;
      },
      repeat: 3,
      yoyo: true,
      ease: 'power1.inOut',
      stagger: 0.03
    }); //SOUND

    soundCtrl.play('crash');
  };

  pixi.setBeserkModus = function () {
    //console.log("setBeserkModus");
    //change from 'normal' to 'beserk'
    gameModel.playerModus = lib.GameModel.PLAYER_MODUS_BESERK;
    gsap.killTweensOf(pixi.player);
    gsap.killTweensOf(pixi.player.children);
    var i,
        child,
        l = gameModel.BESERK_TIME;

    for (i = 0; i < l; i++) {
      child = pixi.trainCountdown.getChildAt(i);
      gsap.set(child, {
        pixi: {
          alpha: 1,
          scale: 0.5
        },
        delay: i
      });
      gsap.to(child, {
        pixi: {
          alpha: 0,
          scale: 2
        },
        duration: 0.8,
        ease: 'power1.inOut',
        delay: i + 0.15
      });
    }

    gsap.to(pixi.player.children, {
      pixi: {
        alpha: 0.2
      },
      duration: 0.1,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut',
      stagger: 0.02
    });
    gsap.delayedCall(gameModel.BESERK_TIME, pixi.resetPlayerModus);
  };

  pixi.removeCollectable = function (collectable) {
    gsap.set(collectable.sprite, {
      pixi: {
        alpha: 1,
        scale: 1.0,
        rotation: 0,
        x: collectable.x
      }
    });
    collectable.sprite.visible = false;

    if (collectable.tl) {
      collectable.tl.pause();
    }
  };

  pixi.checkCollectableCollision = function () {
    var i,
        collectable,
        level = gameModel.levels[gameModel.currentLevel],
        collectableItems = level.collectableItems,
        l = collectableItems.length,
        rectPlayer = gameModel.rectPlayer; //console.log("checkCollectableCollision", "x", gameModel.x, "y", gameModel.y, "playerStartY", gameModel.playerStartY, "rectPlayer", rectPlayer);

    for (i = 0; i < l; i++) {
      collectable = collectableItems[i]; //console.log("checkCollectableCollision", 'rectPlayer:', rectPlayer, 'collectable:', collectable);

      if (!collectable.collected && rectPlayer.intersects(collectable)) {
        collectable.collected = true;
        game.setScore(collectable.score);

        if (collectable.name === 'item-mitarbeiter') {
          gsap.to(collectable.sprite, {
            pixi: {
              x: '+=100',
              alpha: 0
            },
            ease: 'power2',
            duration: 0.5,
            onComplete: pixi.removeCollectable,
            onCompleteParams: [collectable]
          });
          soundCtrl.play('mitarbeiter');
        } else {
          gsap.to(collectable.sprite, {
            pixi: {
              scale: 5.0,
              alpha: 0,
              rotation: 5
            },
            ease: 'power2',
            duration: 0.7,
            onComplete: pixi.removeCollectable,
            onCompleteParams: [collectable]
          });

          if (collectable.name === 'item-hornbach') {
            pixi.setBeserkModus();
            soundCtrl.play('booster');
          } else {
            soundCtrl.play('items');
          }
        }

        gameModel.collectedItems.push(collectable);
        break;
      }
    }
  }; //


  pixi.createStapler = function (wall) {
    var tl,
        dur = 5.0,
        container = new Container(),
        childLeft = new Sprite(pixi.atlas["item-stapler.png"]),
        childRight = new Sprite(pixi.atlas["item-stapler-mirror.png"]);
    container.x = wall.x;
    container.y = wall.y;
    childLeft.cacheAsBitmap = true;
    childLeft.visible = false;
    container.addChild(childLeft);
    childRight.cacheAsBitmap = true; //childRight.visible = false;

    container.addChild(childRight); //create main timeline

    wall.tl = gsap.timeline({
      defaults: {
        ease: "power1.inOut",
        duration: dur
      },
      repeat: -1,
      onUpdate: function onUpdate() {
        wall.x = container.x; //console.log("createStapler", "container.x:", container.x);
      }
    });
    wall.tl.call(function () {
      childLeft.visible = false;
      childRight.visible = true;
    }, [], 0);
    wall.tl.to(container, {
      x: wall.x + 200
    }, 0);
    wall.tl.call(function () {
      childRight.visible = false;
      childLeft.visible = true;
    }, [], dur);
    wall.tl.to(container, {
      x: wall.x
    }, dur);
    return container;
  };

  pixi.createMitarbeiter = function (item) {
    var dur = 6.5,
        container = new Container(),
        childLeft = new AnimatedSprite(resources[pixi.spriteJson].spritesheet.animations["item-mitarbeiter-left"]),
        childRight = new AnimatedSprite(resources[pixi.spriteJson].spritesheet.animations["item-mitarbeiter-right"]);
    /*childLeft = new Sprite(pixi.atlas["item-mitarbeiter-left-1.png"]),
    childRight = new Sprite(pixi.atlas["item-mitarbeiter-right-1.png"]);*/

    container.x = item.x;
    container.y = item.y;
    childLeft.animationSpeed = 0.1;
    childLeft.visible = false;
    container.addChild(childLeft);
    childRight.animationSpeed = 0.1;
    childRight.visible = false;
    container.addChild(childRight); //create main timeline

    item.tl = gsap.timeline({
      defaults: {
        ease: "power0",
        duration: dur
      },
      repeat: -1,
      onUpdate: function onUpdate() {
        item.x = container.x; //console.log("createMitarbeiter", "container.x:", container.x);
      }
    });
    item.tl.call(function () {
      childLeft.visible = true;
      childLeft.play();
      childRight.stop();
      childRight.visible = false;
    }, [], 0);
    item.tl.to(container, {
      x: item.x - 260
    }, 0);
    item.tl.call(function () {
      childRight.visible = true;
      childRight.play();
      childLeft.stop();
      childLeft.visible = false;
    }, [], dur);
    item.tl.to(container, {
      x: item.x
    }, dur); //item.tl.add(tl);

    return container;
  };

  pixi.createItems = function (items) {
    var i,
        item,
        container = new Container(),
        length = items.length;

    for (i = 0; i < length; i++) {
      item = items[i]; //item.rect = new lib.Rectangle(item.x, item.y, item.width, item.height);
      //console.log("pixi.createItems", "item:", item);

      if (item.name === 'item-mitarbeiter') {
        item.sprite = pixi.createMitarbeiter(item);
      } else {
        item.tl = gsap.timeline();
        item.sprite = new Sprite(pixi.atlas[item.name + ".png"]);
        item.sprite.cacheAsBitmap = true;
        item.sprite.x = item.x + item.width / 2;
        item.sprite.y = item.y + item.height / 2;
        item.sprite.anchor.set(0.5, 0.5); //move items up and down

        item.tl.to(item.sprite, {
          pixi: {
            scale: 1.25
          },
          duration: 0.5,
          delay: "random(0.05, 1.0)",
          repeat: -1,
          yoyo: true,
          repeatDelay: 0.25,
          ease: 'power2.in'
        });
      }

      if (item.y < gameModel.levelHeight) {
        container.addChild(item.sprite);
      }
    }

    return container;
  };

  pixi.createWalls = function (walls) {
    var i,
        wall,
        child,
        container = new Container(),
        length = walls.length;

    for (i = 0; i < length; i++) {
      wall = walls[i]; //wall.rect = new lib.Rectangle(wall.x, wall.y, wall.width, wall.height);

      if (wall.name === 'stapler-0') {
        child = pixi.createStapler(wall);
      } else {
        child = new Sprite(pixi.atlas[wall.name + ".png"]);
        child.cacheAsBitmap = true;
      } //child.name = wall.name;
      //console.log("pixi.createWalls", "wall:", wall);


      child.x = wall.x;
      child.y = wall.y;

      if (wall.y < gameModel.levelHeight) {
        container.addChild(child);
      }
    }

    return container;
  };

  pixi.createLevel = function (index, level) {
    console.log("pixi.createLevel", "index:", index, "level:", level);
    var container = new Container();
    container.name = level.name; //level.sprite = new TilingSprite(pixi.atlas[level.name + ".png"], gameModel.rectStage.width, gameModel.levelHeight);

    level.sprite = new Sprite(pixi.atlas[level.name + ".png"]);
    level.sprite.cacheAsBitmap = true;
    container.addChild(level.sprite);
    container.addChild(pixi.createWalls(level.walls));
    container.addChild(pixi.createItems(level.collectableItems));

    if (index === 0) {
      container.y = gameModel.y;
    } else {
      container.y = gameModel.y - gameModel.levelHeight;
    } //we only show the first and second level at startup


    level.sprite.visible = index < 2;
    return container;
  };

  pixi.createPlayer = function () {
    var i,
        l,
        child,
        container = new Container(),
        //explosion = new Container(5, { alphaAndtint: true, scale: true, uvs: true }),
    explosion = new Container(),
        countdown = new Container(); //

    container.x = gameModel.x;
    container.y = gameModel.playerStageY;
    child = new Sprite(pixi.atlas["train-start.png"]);
    child.name = 'start';
    child.anchor.set(0.5, 0.0);
    child.x = gameModel.rectPlayer.width / 2;
    container.addChild(child);
    child = new Sprite(pixi.atlas["train-mid.png"]);
    child.name = 'mid';
    child.anchor.set(0.5, 0.0);
    child.x = gameModel.rectPlayer.width / 2;
    child.y = gameModel.rectPlayerStart.height;
    container.addChild(child);
    child = new Sprite(pixi.atlas["train-end.png"]);
    child.name = 'end';
    child.anchor.set(0.5, 0.0);
    child.x = gameModel.rectPlayer.width / 2;
    child.y = gameModel.rectPlayerStart.height + gameModel.rectPlayerMid.height;
    container.addChild(child);

    for (i = 0; i < 5; i++) {
      child = new Sprite(pixi.atlas["train-ffx-" + (i + 1) + ".png"]);
      child.alpha = 0;
      child.anchor.set(0.5, 0.0);
      child.x = gameModel.rectPlayer.width / 2;
      explosion.addChild(child);
    } //explosion.visible = false;


    container.addChild(explosion);
    l = gameModel.BESERK_TIME; //

    for (i = l; i > 0; i--) {
      child = new Sprite(pixi.atlas["font-" + i + ".png"]);
      child.alpha = 0;
      child.anchor.set(0.5, 0.5);
      child.x = gameModel.rectPlayer.width / 2;
      child.y = gameModel.rectPlayer.width / 2; //child.width = gameModel.rectPlayer.width;

      countdown.addChild(child);
    }

    container.addChild(countdown);
    explosion.name = 'explosion';
    return container;
  };

  pixi.nextLevel = function () {
    var currIndex = gameModel.currentLevel,
        currentLevelChild = pixi.levels.getChildAt(currIndex),
        nextIndex = gameModel.getNextLevelIndex(),
        //nextLevelChild = pixi.levels.getChildAt(nextIndex),
    secondIndex = gameModel.getNextLevelIndexFrom(nextIndex); //secondLevelChild = pixi.levels.getChildAt(secondIndex);
    //
    //1.
    //game.pauseGame();
    //2.

    gameModel.setY(gameModel.rectStage.height - gameModel.levelHeight); //3.

    currentLevelChild.y = gameModel.y - gameModel.levelHeight; //currentLevelChild.visible = false;
    //4.

    pixi.resetLevel(currIndex); //5.

    gameModel.currentLevel = nextIndex;

    if (nextIndex === 0) {
      gameModel.loop++;
      gameModel.scrollSpeedY = Math.min(gameModel.SCROLL_SPEED_Y_MAX, gameModel.scrollSpeedY + gameModel.SCROLL_SPEED_ACC);
    }

    gameModel.scrollSpeedY = Math.min(gameModel.SCROLL_SPEED_Y_MAX, gameModel.scrollSpeedY + gameModel.SCROLL_SPEED_ACC); //6.

    pixi.activateLevel(nextIndex); //nextLevelChild.visible = true;

    pixi.activateLevel(secondIndex); //secondLevelChild.visible = true;
    //7.

    pixi.distributeItems(currIndex); //game.runGame();
    //console.log("nextLevel", 'scrollSpeedY:', gameModel.scrollSpeedY, 'nextIndex:', nextIndex, 'currIndex:', currIndex, 'gameModel.y:', gameModel.y, 'loop:', gameModel.loop);
  };

  pixi.movePlayer = function () {
    //console.log("movePlayer", "x", gameModel.x, "y", gameModel.y, "playerStartY", gameModel.playerStartY, "playerStageY", gameModel.playerStageY, "direction", gameModel.direction, "offset", offset);
    var x = gameModel.rectPlayer.width / 2;
    pixi.player.x = gameModel.x;

    if (gameModel.direction > 0) {
      //right
      pixi.trainMid.x = x - gameModel.OFFSET_TRAIN;
      pixi.trainEnd.x += (pixi.trainMid.x - pixi.trainEnd.x) * 0.75;
    } else if (gameModel.direction < 0) {
      //left
      pixi.trainMid.x = x + gameModel.OFFSET_TRAIN;
      pixi.trainEnd.x += (pixi.trainMid.x - pixi.trainEnd.x) * 0.75;
    } else {
      //center
      pixi.trainMid.x += (x - pixi.trainMid.x) * 0.25;
      pixi.trainEnd.x += (x - pixi.trainEnd.x) * 0.1;
    }
  };

  pixi.state = function (delta) {};

  pixi.stateDebug = function (delta) {};

  pixi.statePause = function (delta) {
    pixi.movePlayer(); //console.log("statePause", "delta:", delta);

    pixi.app.renderer.render(pixi.app.stage);
  };

  pixi.stateRun = function (delta) {
    // update player model
    gameModel.update(delta); // check for player boundaries

    gameModel.checkPlayerBoundaries(); //first collect

    pixi.checkCollectableCollision(); //then may be wall collision

    if (gameModel.playerModus !== 'beserk') {
      var wallCollisionType = gameModel.checkPlayerWallCollision(); //front mid end

      if (wallCollisionType !== '') {
        game.pauseGame();
        game.setLife(-1);
        pixi.wallCollision(wallCollisionType);
      }
    } // check for ground boundaries


    if (!gameModel.checkGroundBoundaries()) {
      pixi.nextLevel();
    } //pixi.tiling.


    pixi.levels.getChildAt(gameModel.currentLevel).y = gameModel.y;
    pixi.levels.getChildAt(gameModel.getNextLevelIndex()).y = gameModel.y - gameModel.levelHeight;
    pixi.movePlayer(); //console.log("stateRun", "delta:", delta);
    //pixi.app.renderer.render(pixi.app.stage);
  };

  pixi.setup = function (lod, reso) {
    var i,
        level,
        graphics,
        levels = gameModel.levels,
        length = levels.length; //console.log("");
    //console.log("pixi.setup", "lod:", lod);
    //console.log("pixi.setup", "reso:", reso);
    //create texture atlas

    pixi.atlas = resources[pixi.spriteJson].textures; //

    pixi.levels = new Container();
    pixi.app.stage.addChild(pixi.levels);

    for (i = 0; i < length; i++) {
      level = levels[i];
      pixi.levels.addChild(pixi.createLevel(i, level));
    } //and mask them


    graphics = new Graphics();
    graphics.beginFill(0xFF3300);
    graphics.drawRect(0, 0, gameModel.rectStage.width, gameModel.rectStage.height);
    graphics.endFill(); //assign graphics as mask to levels container

    pixi.levels.mask = graphics;
    pixi.player = pixi.createPlayer();
    pixi.trainStart = pixi.player.getChildByName('start');
    pixi.trainMid = pixi.player.getChildByName('mid');
    pixi.trainEnd = pixi.player.getChildByName('end');
    pixi.trainExplosion = pixi.player.getChildAt(3);
    pixi.trainCountdown = pixi.player.getChildAt(4);
    pixi.app.stage.addChild(pixi.player); //
    //console.log("pixi.setup", "pixi.trainExplosion:", pixi.trainExplosion);
    //console.log("pixi.setup", "pixi.trainCountdown:", pixi.trainCountdown);
    //console.log("pixi.setup", "gameModel:", gameModel);

    if (isloaded) {
      game.initialize();
    }
  };
  /**
   * ENTRY POINT *
   * game.createUI -> game.loadJS -> game.initPixi -> pixi.setup -> game.initialize
   */


  window.enterEGPGame = function (version, modified) {
    game.version = version;
    game.modified = modified; //console.log("gameData:", gameData);
    //console.log("languageData:", languageData);
    //

    $('body').removeClass('desktop mobile').addClass(OS_SYSTEM === 'desktop' ? 'desktop' : 'mobile'); //

    window.addEventListener('load', game.initGame, false); //Adform responsive
    //if (dhtml.external && dhtml.external.resize) dhtml.external.resize('100%', '100%');

    /* if (OS_SYSTEM === 'desktop') {
      window.addEventListener("resize", function () {
        setTimeout(function () {
          //console.log("");
          //console.log("OS_SYSTEM", OS_SYSTEM);
          //console.log("gameModel.state", gameModel.state);
          //console.log("the orientation of the device is now " + window.screen.orientation.angle);
          if (gameModel.state === lib.GameModel.STATE_INTRO || gameModel.state === lib.GameModel.STATE_LOAD) {
            resize();
            game.resizeGame();
          }
        });
      });
    } */
  };
})(jQuery);