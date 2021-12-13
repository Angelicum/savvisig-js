const mix = require('laravel-mix');

mix.scripts([
        'src/js/jSignature.min.js', 
        'src/js/savvisig.js'
    ], 'dist/js/savvisig.min.js');

mix.sass('src/scss/savvisig.scss', 'dist/css/savvisig.min.css');
