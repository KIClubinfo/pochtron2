(function () {
    // params
    var provider = null;
    var styleTag = null;

    // inject
    angular
        .module('ngMaterialCss', ['ngMaterial'])
        .config(configColors)
        .run(generateCss);

    // retrieve provider
    configColors.$inject = ['$mdThemingProvider'];
    function configColors($mdThemingProvider) {
        // keep the provider, gonna need it later
        provider = $mdThemingProvider;
    }

    // generate
    function generateCss() {
        // const
        var A_LIGHT = [0.87, 0.54, 0.26, 0.12];
        var A_DARK = [1.0, 0.7, 0.3, 0.12];
        // params
        var themes = provider._THEMES;
        var palettes = provider._PALETTES;
        var css0 = '';
        var css1 = '';
        // iterate themes
        for (var themeName in themes) {if (themes.hasOwnProperty(themeName)) {
            var theme = themes[themeName];
            var colors = theme.colors;
            for (var colorName in colors) { if (colors.hasOwnProperty(colorName)) {
                var color = colors[colorName];
                var hues = color.hues;
                var palette = palettes[color.name];
                for (var hueName in hues) {if (hues.hasOwnProperty(hueName)) {
                    var hue = hues[hueName];
                    var value = palette[hue];
                    var contrast = value.contrast;
                    var valueValue = value.value;
                    var colorCode = rgb(value.value);
                    var shade = (contrast[0] + contrast[1] + contrast[2]) < (127 * 3) ? A_DARK : A_LIGHT;
                    var shade0 = rgba(contrast, shade[0]);
                    var shade1 = rgba(contrast, shade[1]);
                    var shade2 = rgba(contrast, shade[2]);
                    var shade3 = rgba(contrast, shade[3]);
                    // selector
                    var bgSelector = '.md-bg';
                    var fgSelector = '.md-fg';
                    if (colorName != 'background') {
                        bgSelector += '-' + colorName;
                    }
                    fgSelector += '-' + colorName;
                    if (hueName != 'default') {
                        fgSelector += '-' + hueName;
                        bgSelector += '-' + hueName;
                    }
                    // style
                    var style = [
                        bgSelector + ' {background-color: ' + colorCode + ' ; color: ' + shade0 + ' ;} ',
                        bgSelector + '.shade1 { color: ' + shade1 + ' ;} ',
                        bgSelector + '.shade2 { color: ' + shade2 + ' ;} ',
                        bgSelector + '.shade3 { color: ' + shade3 + ' ;} ',
                        bgSelector + ' .shade1 { color: ' + shade1 + ' ;} ',
                        bgSelector + ' .shade2 { color: ' + shade2 + ' ;} ',
                        bgSelector + ' .shade3 { color: ' + shade3 + ' ;} ',
                        fgSelector + ' {color: ' + colorCode + ' ;} '
                    ];
                    // default
                    if (themeName == 'default') {
                        css0 += applyPrefix('', style);
                    }
                    css1 += applyPrefix('.md-' + themeName + '-theme ', style);
                    css1 += applyPrefix('.md-' + themeName + '-theme', style);
                }}
            }}
        }}
        // apply
        if (styleTag == null) {
            styleTag = document.createElement("style");
            styleTag.title = 'Angular Material Theme Classes';
            styleTag.innerHTML = css0 + css1;
            document.head.appendChild(styleTag);
        } else {
            styleTag.innerHTML = css0 + css1;
        }
    }

    // functions
    function rgba(contrast, alpha) {
        return 'rgba(' + parseInt(contrast[0]) + ',' + parseInt(contrast[1]) + ',' + parseInt(contrast[2]) + ',' + parseFloat(alpha) + ')';
    }
    function rgb(contrast) {
        return 'rgba(' + parseInt(contrast[0]) + ',' + parseInt(contrast[1]) + ',' + parseInt(contrast[2]) + ',255)';
    }
    function applyPrefix(prefix, value) {
        var tr = '';
        for (var i = 0; i < value.length; i++) {
            tr += prefix + value[i];
        }
        return tr;
    }
}());
