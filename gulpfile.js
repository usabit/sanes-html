var devFolder = "devApp/";
var excludeFolder = "!devApp/";
var buildFolder = "public/";

var gulp         = require('gulp');
var concat       = require('gulp-concat');
var plumber      = require('gulp-plumber');          // impede o gulp parar sua task de watch caso encontre algum erro
var connect      = require('gulp-connect');

// HTML and Template modules
var jade         = require('gulp-jade');

// CSS modules
var stylus       = require('gulp-stylus');           // pre processador
var jeet         = require('jeet');                  // stylus grid system
var nib          = require('nib');                   // stylus useful mixins
var rupture      = require('rupture');               // stylus media queries mixins
var prefixer     = require('autoprefixer-stylus');   // stylus auto prefixer
// var axis         = require('axis-css');              // http://v1.roots.cx/axis/
var sourcemaps   = require('gulp-sourcemaps');       // sourcemaps (liga o css compilado ao arquivo de desenvolvimento)

// Image optimization modules
var imagemin     = require('gulp-imagemin');         // minifica imagens (jpg e gif)
var pngquant     = require('imagemin-pngquant');     // png não deveria ser minificado por padrão

// Javascript modules
var uglify       = require('gulp-uglify');           // minifica JS
var jshint       = require('gulp-jshint');           // modulo para validar javascript
var stripdebug   = require('gulp-strip-debug');      // remove consoles do js (compilado ou de desenvolvimento)

var notify       = require('gulp-notify');           // modulo para mostrar erros e avisos sobre o que estamos rodando

var map          = require('map-stream');            // --
var events       = require('events');                // -- Esses 3 modulos servem para mostrar o jshint no console
var emmitter     = new events.EventEmitter();        // --

// Utility modules
var del          = require('del');
var sequence     = require('run-sequence');
var useref       = require('gulp-useref');           // compila os arquivos od HTML para 1 único arquivo
var rename       = require('gulp-rename');
var bower        = require('gulp-bower');            // roda bower install por padrão ou algum outro comando do bower pelo gulp




/* *********************************************** */
/* *********************************************** */
/* ******************           ****************** */
/* ******************   TASKS   ****************** */
/* ******************           ****************** */
/* *********************************************** */
/* *********************************************** */

gulp.task('bower', function() {
  // roda bower install no root
  return bower();
});

/* *********************************************** */

gulp.task('html', function() {
  // Vai buscar os arquivos jade dentro de todas as pastas de templates, mas não pega os arquivos dentro de partials.
  return gulp.src([devFolder + 'templates/**/!(_)*.jade', excludeFolder+'templates/_partials/**'])
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest(buildFolder))
    .pipe(connect.reload())
  ;
});

/* *********************************************** */

gulp.task('styles', function() {
  return gulp.src(devFolder + 'assets/css/main.styl')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(stylus({
      use: [nib(), prefixer(), jeet(), rupture()],
      compress:false
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(buildFolder + 'assets/css'))
    .pipe(connect.reload())
  ;
});

/* *********************************************** */

gulp.task('images', function () {
  return gulp.src(devFolder+'assets/img/**')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}, {cleanupIDs: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(buildFolder+'assets/img/'))
    .pipe(connect.reload())
  ;
});

/* *********************************************** */

// Custom linting reporter used for error notify
var jsHintErrorReporter = function(file, cb) {
  return map(function (file, cb) {
    if (!file.jshint.success) {
      file.jshint.results.forEach(function (err) {
        if (err)
          emmitter.emit('error');
      });
    }
    cb(null, file);
  });
};

gulp.task('scripts', function() {
  return gulp.src(devFolder + 'assets/js/**/*.js')
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jsHintErrorReporter())
    .on('error', notify.onError({ Title: 'JSHint', message: 'Errors on javascript.' }))
    .pipe(gulp.dest(buildFolder + 'assets/js'))
    .pipe(connect.reload())
  ;
});

gulp.task('scripts-deploy', ['scripts'], function(){
  return gulp.src(buildFolder + 'assets/js/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest(buildFolder + 'assets/js'))
  ;
});

gulp.task('useref', function(){
  return gulp.src(buildFolder + '*.html')
    .pipe(useref())
    .pipe(gulp.dest(buildFolder))
  ;
});

gulp.task('copy-fonts', function(){

  var fontsFolder = buildFolder+'assets/vendor/font-awesome/fonts/*.{woff2,woff,ttf}';

  return gulp.src(fontsFolder)
    .pipe(gulp.dest(buildFolder + 'assets/fonts'))
  ;
});

gulp.task('del-vendors', ['copy-fonts'], function(){
  return del(buildFolder + 'assets/vendor');
});

gulp.task('del-scripts', function(){
  return del(buildFolder + 'assets/js');
});

/* ******************************************************** */
/* ******************************************************** */
/* ******************                    ****************** */
/* ******************   Night gathers,   ****************** */
/* ******************   and now my       ****************** */
/* ******************   watch begins.    ****************** */
/* ******************                    ****************** */
/* ******************************************************** */
/* ******************************************************** */

gulp.task('clean', function(cb) {
  return del([buildFolder]);
});

gulp.task('sequence', function(callback){
  sequence('clean', 'bower', [ 'html', 'styles', 'scripts', 'images' ], callback);
});

gulp.task('sequence-build', function(callback){
  sequence('clean', 'bower', [ 'html', 'styles', 'scripts-deploy', 'images' ], 'useref', ['del-vendors', 'del-scripts'], callback);
});

gulp.task('default', ['sequence'], function(){
  connect.server({
    root: buildFolder,
    livereload: true
  });

  notify({ Title: 'Server', message: 'Up and running.' }).write('');

  gulp.watch(devFolder+'assets/css/**/*.styl', ['styles']);
  gulp.watch(devFolder+'assets/js/**/*.js', ['scripts']);
  gulp.watch(devFolder+'**/*.jade', ['html']);
  gulp.watch(devFolder+'assets/img/**', ['images']);
});


gulp.task('deploy', ['sequence-build'], function(){
  connect.server({
    root: buildFolder,
    livereload: true
  });

  notify({ Title: 'Server', message: 'Deploy Files running.' }).write('');
});
