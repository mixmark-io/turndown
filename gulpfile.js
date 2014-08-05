var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	del = require('del'),
	mainBowerFiles = require('main-bower-files');

gulp.task('clean', function(cb){
	del('dist', cb)
});

gulp.task('build', ['clean'], function(){
	var files = mainBowerFiles();
	files.push('./src/to-markdown.js');
	gulp.src(files)
	.pipe(uglify())
	.pipe(concat('to-markdown.js'))
	.pipe(gulp.dest('dist/'));
})

gulp.task('default', ['build']);