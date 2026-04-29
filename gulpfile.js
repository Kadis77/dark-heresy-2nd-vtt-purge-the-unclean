const gulp = require('gulp');
const prefix = require('gulp-autoprefixer');
const { execFileSync } = require("child_process");
const clean = require("gulp-clean");
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass')(require('sass'));
const fs = require("fs");
const path = require("path");
const zip = require("gulp-zip");

const util = require('util');
if (!util.isDate) {
  util.isDate = (d) => Object.prototype.toString.call(d) === '[object Date]';
}

const SYSTEM = JSON.parse(fs.readFileSync("src/system.json"));
const SYSTEM_SCSS = ["src/scss/**/*.scss"];
const STATIC_FILES = [
  "src/icons/**/*",
  "src/module/**/*",
  "!src/module/foundry-core/**",
  "src/templates/**/*",
  "src/images/**/*",
  "src/*.json",
];
const BUILD_DIR = "build/dark-heresy-2nd";

/* ----------------------------------------- */
/*  Compile Packs
/* ----------------------------------------- */

function compilePacks(cb) {
  try {
    execFileSync(process.execPath, [path.resolve(__dirname, "tools/compile-packs.mjs")], { stdio: "inherit" });
    cb();
  } catch (err) {
    cb(err);
  }
}

/* ----------------------------------------- */
/*  Compile Sass
/* ----------------------------------------- */

// Small error handler helper function.
function handleError(err) {
  console.log(err.toString());
  this.emit('end');
}

function compileScss() {
  // Configure options for sass output. For example, 'expanded' or 'nested'
  let options = {
    outputStyle: 'expanded'
  };
  return gulp.src(SYSTEM_SCSS)
    .pipe(
      sass(options)
        .on('error', handleError)
    )
    .pipe(prefix({
      cascade: false
    }))
    .pipe(gulp.dest(BUILD_DIR + "/css"))
}
const css = gulp.series(compileScss);

/* ----------------------------------------- */
/*  Copy Static
/* ----------------------------------------- */

function copyFiles() {
  return gulp.src(STATIC_FILES, {base: "src",}).pipe(gulp.dest(BUILD_DIR));
}

/* ----------------------------------------- */
/*  Other
/* ----------------------------------------- */

function cleanBuild() {
  return gulp.src(`${BUILD_DIR}`, { allowEmpty: true }, { read: false }).pipe(clean({force: true}));
}

function watchUpdates() {
  return gulp.watch(STATIC_FILES, gulp.series(cleanBuild, compileScss, compilePacks, copyFiles));
}

function watchCopy() {
  return gulp.watch(STATIC_FILES, gulp.series(copyFiles));
}

function createArchive() {
  return gulp.src(`${BUILD_DIR}/**`)
      .pipe(zip(`dark-heresy-2nd-${SYSTEM.version}.zip`))
      .pipe(gulp.dest('./archive'));
}

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

exports.clean = gulp.series(cleanBuild);
exports.scss = gulp.series(compileScss);
exports.packs = gulp.series(compilePacks);
exports.copy = gulp.series(copyFiles, watchCopy);
exports.build = gulp.series(cleanBuild, compileScss, copyFiles, compilePacks, createArchive);
exports.default = gulp.series(cleanBuild, compileScss, copyFiles, compilePacks, watchUpdates);
