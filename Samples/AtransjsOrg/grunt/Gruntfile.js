module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  
  var aryLessFileNames = ['style'];

  var aryLessConfig = {};
  var aryCssminConfig = {};
  aryLessFileNames.forEach(function(val) {
    aryLessConfig[val] = {
      src: '../less/' + val + '.less',
      dest: '../css/' + val + '.min.css'
    };
    aryCssminConfig[val] = {
      src: '../css/' + val + '.min.css',
      dest: '../css/' + val + '.min.css'
    };
  });


  grunt.initConfig({
    less: aryLessConfig,
    cssmin: aryCssminConfig,
    watch: {
      less: {
        files: ['../less/*.less'],
        tasks: ['less', 'cssmin'],
      }
    },
    uglify : {
      build : {
        options : {
          banner : grunt.file.read('right.js'),
        },
        // src : ['../js/atrans.js'],
        // dest : '../js/atrans.min.js',
        src : ['../js/sample.js'],
        dest : '../js/sample.min.js',
      }
    },
  });

  grunt.registerTask('default', ['less', 'watch']);

};
