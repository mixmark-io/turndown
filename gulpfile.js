var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	del = require('del'),
	mainBowerFiles = require('main-bower-files');

gulp.task('clean', function(cb){
	del('dist', cb)
});

gulp.task('build', ['clean'], function(){
	gulp.src('./src/to-markdown.js')
	.pipe(uglify())
	.pipe(gulp.dest('dist/'));
})

gulp.task('default', ['build']);
