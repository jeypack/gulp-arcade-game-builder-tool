# Gulp Arcade Game Builder Tool



## Getting started
Already a gulp pro? [Go to game instructions at the bottom](#arcade-pixi-game-scroller)!\
Or check out the [official gulpJS Website](https://gulpjs.com/docs/en/getting-started/quick-start) for more Infos how to install and work with gulp.

## Commandline and Gulp

The following commands are availlable from the `CLI`:

```
cd existing_repo
gulp
gulp default
gulp build
gulp clean
gulp banner
gulp bannerbuild
```

### `gulp` and `gulp default`

```
cd existing_repo
gulp
```

Go inside repo and start game development mode via `gulp` or `gulp default`.
The page will reload if you make edits.

### `gulp build`

```
cd existing_repo
gulp build
```

Build game in production mode via `gulp build`.

### `gulp banner`

```
cd existing_repo
gulp banner
```

Enable banner development mode via `gulp banner`.
The page will reload if you make edits.

### `gulp bannerbuild`

```
cd existing_repo
gulp bannerbuild
```

Build banner in production mode via `gulp bannerbuild`.


***


# Arcade Pixi Game Scroller
EG+ Arcade-Pixi Game Scroller Hornbach: 1.2.0\
HTML5 arcade-style game based on 'PixiJS Creation Engine' a flexible and fast 2D WebGL renderer.

## Description
The user interface is completely implemented with HTML5 elements.\
The cutscenes and also the game instructions were implemented with videos.\
Accordingly, there is less text to maintain. However, a video in the desired language must be created for the instructions and also for each cutscene.\
In the course of development, not only the high score but also the cutscenes were removed and the latter replaced by static visual material.

### Version 1.2.0
Delivery status with static images, without cutscenes via video and without highscore.

### Version 2.0.0
TODO.

### Game `data`
Game relevant data is located in the file `game.js` as properties of `window.EGP`.\
All language-related properties for button labels, videos and other texts are addressed via unique `id`.\
```
window.EGP = {
    language: {
      DE: [
        { id: 'start-btn', text: 'Spiel Laden', size: '25px', lineHeight: '39px' },
        ...
```
The property `data` holds, among other things, game constants for the player, the number of lives, but also a property `sounds` with all the sounds needed for the game.\
Some properties may not be changed and are only there for the sake of completeness or become interesting when the graphic elements and their dimensions are adapted.\
[Go to the list of the protected properties below](#protected-properties).
```
window.EGP = {
    language: {
      ...
    },
    data: {
      OFFSET_TRAIN: 7,
      SCROLL_SPEED_Y: 3.25,
      SCROLL_SPEED_Y_MAX: 12.0,
      SCROLL_SPEED_ACC: 0.15,
      SCROLL_SPEED_ACCELERATION: 0.0005,
      FRICTION_DEVICE: 0.5,
      MOVE_SPEED_X: 6,
      DRAG_SPEED_X: 8,
      BESERK_TIME: 6,
      language: 'DE',
      currentLevel: 0
      life: 3,
      isSoundOn: true,
      sounds: {
        start: { src: 'sounds/INTRO_MUSIK_4s.mp3' },
        end: { src: 'sounds/INTRO_MIX_5s.mp3' },
        ...
      },
      player: {
        ...
      },
      ...
```
However, one of the most important properties is certainly `levels`, which, in addition to the names, transformations and values of the objects to be collected, also contains the corresponding values for the obstacles or walls.
```
window.EGP = {
    ...
    data: {
      ...
      levels: [
        {
          name: 'level-1',
          collectableItems: [
            { x: 116, y: 194, width: 25, height: 20, name: 'item-flower', score: 10 },
            { x: 173, y: 272, width: 25, height: 20, name: 'item-flower', score: 10 },
            ...
          ],
          walls: [
            { x: 18, y: 380, width: 112, height: 25, name: 'wall-1' },
            { x: 202, y: 380, width: 100, height: 25, name: 'wall-2' },
            ...
          ],
          width: 320,
          height: 1920,
        },
```

#### `Protected properties`
Let people know what your project can do specifically. Provide context and add a link to any reference visitors might be unfamiliar with. A list of Features or a Background subsection can also be added here. If there are alternatives to your project, this is a good place to list differentiating factors.

### Game `HTML5`
The HTML structure starts with a game-wrapper inside the body.\
All game elements are located within this wrapper.\
Apart from the logo and the info button, there is also the game content with a game and a ui node.\
The ui node contains, among other things, the videos and buttons needed for the game.\
The game node contains the playground, the score, lives and the ui hand for the start sequence.

### Game `Sass SCSS CSS`
Todo

### Game `JS`
Todo

## Visuals
Depending on what you are making, it can be a good idea to include screenshots or even a video (you'll frequently see GIFs rather than actual videos). Tools like ttygif can help, but check out Asciinema for a more sophisticated method.

## Installation
Within a particular ecosystem, there may be a common way of installing things, such as using Yarn, NuGet, or Homebrew. However, consider the possibility that whoever is reading your README is a novice and would like more guidance. Listing specific steps helps remove ambiguity and gets people to using your project as quickly as possible. If it only runs in a specific context like a particular programming language version or operating system or has dependencies that have to be installed manually, also add a Requirements subsection.

## Usage
Use examples liberally, and show the expected output if you can. It's helpful to have inline the smallest example of usage that you can demonstrate, while providing links to more sophisticated examples if they are too long to reasonably include in the README.

## Support
Tell people where they can go to for help. It can be any combination of an issue tracker, a chat room, an email address, etc.

## Roadmap
If you have ideas for releases in the future, it is a good idea to list them in the README.

## Contributing
State if you are open to contributions and what your requirements are for accepting them.

For people who want to make changes to your project, it's helpful to have some documentation on how to get started. Perhaps there is a script that they should run or some environment variables that they need to set. Make these steps explicit. These instructions could also be useful to your future self.

You can also document commands to lint the code or run tests. These steps help to ensure high code quality and reduce the likelihood that the changes inadvertently break something. Having instructions for running tests is especially helpful if it requires external setup, such as starting a Selenium server for testing in a browser.

## Authors and acknowledgment
Show your appreciation to those who have contributed to the project.

## License
[© EG+ 2017 - 2022](https://www.egplusww.de)
