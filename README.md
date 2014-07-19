# Futose [![Dependencies status](https://david-dm.org/kompot/futose.svg)](https://david-dm.org/kompot/futose) [![Developer dependency status](https://david-dm.org/kompot/futose/dev-status.svg)](https://david-dm.org/kompot/futose#info=devDependencies)

Ready-to-go JS all-around stack to build web sites. These hipster technologies and libraries are being used right now.

- [Gulp](http://gulpjs.com/) to maintain infrastructure
- [NodeJS](http://nodejs.org/) and [Express](http://expressjs.com) to power server side
- [Stylus](http://learnboost.github.io/stylus/) for CSS
  - [Jeet](https://jeet.gs) as a grid system 
  - [Spritesmith](https://github.com/Ensighten/spritesmith) to craft sprites
- [Fb-flo](https://github.com/facebook/fb-flo) to live reload JS/CSS in the browser
- [Webpack](http://webpack.github.io/) to pack it all up for the browser
- [ReactJS](http://facebook.github.io/react/) for both client and server rendering
  - [react-nested-router](https://github.com/rpflorence/react-nested-router) for routing
- [gulp-rev-all](https://github.com/smysnk/gulp-rev-all) is used to version all assets (both client and server side)

See all other goodies in [package.json](./package.json).

Probably some of them (React) might be made optional/replaceable in the future.

# Workflow

- Every source file should reside in `src` folder.
  - Server entry point is at `src/server/js/server/index.js` (most of the paths can be configured in `gulpfile.js`).
  - Webpack output bundles must all be named `bundle*js` (also configurable) to be correctly processed (included into production client folder and excluded from production server folder).  
- `npm install` to get all dependencies.
- `gulp` (or `node_modules/.bin/gulp`) command creates `dev` folder that is updated when you change files in `src`. 
- `gulp build` creates `prod` and `prod-hashed` folders. Hashed folder is ready to be deployed with correct hashes applied to files names.
