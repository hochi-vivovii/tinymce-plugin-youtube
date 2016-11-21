/*
 # -- BEGIN LICENSE BLOCK ----------------------------------
 #
 # This file is part of tinyMCE.
 # YouTube for tinyMCE 4.x.x
 # Copyright (C) 2011 - 2016  Gerits Aurelien <aurelien[at]magix-dev[dot]be> - <contact[at]aurelien-gerits[dot]be>
 # This program is free software: you can redistribute it and/or modify
 # it under the terms of the GNU General Public License as published by
 # the Free Software Foundation, either version 3 of the License, or
 # (at your option) any later version.
 #
 # This program is distributed in the hope that it will be useful,
 # but WITHOUT ANY WARRANTY; without even the implied warranty of
 # MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 # GNU General Public License for more details.

 # You should have received a copy of the GNU General Public License
 # along with this program.  If not, see <http://www.gnu.org/licenses/>.
 #
 # -- END LICENSE BLOCK -----------------------------------
 * https://developers.google.com/youtube/player_parameters
 */
(function ($) {
    var timer;

    /*
     * Return youtube id
     * @param url {string}
     * @return {string|boolean}
     */
    function youtubeId(url) {
        var match = url.match((/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/));
        return match && match[2].length === 11 ? match[2] : false;
    }

    /**
     * Return YouTube convertUrl URL
     * @param url {string}
     * @param iframe {bool} embed or iframe
     * @returns {string}
     */
    function convertUrl() {
        var url = '';
        var id = youtubeId($('#youtubeID').val());
        var options = "?rel=0&showinfo=0&disablekb=1&autohide=0";
        var start = $("#youtubeStart").val();
        var end = $("#youtubeEnd").val();
        // Youtube Autoplay
        if (start) {
            options += "&start=" + parseTime(start);
        }
        if (end) {
            options += "&end=" + parseTime(end);
        }
        if (id) {
            //url = "https://www.youtube.com/" + (iframe ? "embed/" : "v/") + youtubeId(url);
            url = "https://www.youtube.com/" + "embed/" + id + options;
        }
        return url;
    }

    /**
     * Format HTML
     * @param iframe {boolean}
     * @param data {string}
     * @returns {string}
     */
    function dataToHtml(data) {
        var dim;
        if (data) {
            return '<div class="mceNonEditable" style="width:100%;height:0;position:relative;padding-bottom:56.25%"><iframe src="'+data+'" frameborder="0" webkit-playsinline class="embed-responsive-item" style="width:100%;height:100%;position:absolute;">&nbsp;</iframe></div>';
        }
    }

    /**
     * Insert content when the window form is submitted
     * @returns {string}
     */
    function insert() {
        var result,
        newYouTubeUrl = convertUrl();

        if (newYouTubeUrl) {
            // Insert the contents from the input into the document
            //result = dataToHtml(html5State, width, height, newYouTubeUrl + (html5State ? "" : options));
            result = dataToHtml(newYouTubeUrl);
        }
        return result;
    }

    function preview() {
        $("#preview").html(
            dataToHtml(convertUrl())
        );
    }

    /**
     * Update Timer with keypress
     * @param ts {number} (optional)
     */
    function updateTimer(ts) {
        clearTimeout(timer);
        if(!validateTime()) {
            $("#insert-btn").prop('disabled', true);
            $("#preview").html('');
            return;
        }
        $("#insert-btn").prop('disabled', false);
        timer = setTimeout(preview, ts || 1000);
    }
    function validateTime(){
        var start = parseTime($('#youtubeStart').val());
        var end = parseTime($('#youtubeEnd').val());
        return (
            (start !== false) &&
            (end !== false) &&
            (
                (end === 0) ||
                end > start
            )
        );
    }
    function parseTime(t) {
        if(!t)
            return 0;
        var a = t.split(':');
        if(a.length != 3) return false;
        var h = parseInt(a[0]);
        var m = parseInt(a[1]);
        var s = parseInt(a[2]);
        return (
            !isNaN(h) && !isNaN(m) && !isNaN(s) &&
            h >= 0 && m >= 0 && s >= 0 &&
            m < 60 && s < 60
        )? h * 3600 + m * 60 + s : false;
    }
    /**
     * Execute insert
     */
    function run() {
        var data = insert();
        if (data) {
            parent.tinymce.activeEditor.insertContent(data);
        }
        parent.tinymce.activeEditor.windowManager.close();
    }

    /**
     * Execute preview
     */
    function runPreview() {
        if ($("#preview").length) {
            $('#youtubeID').keypress(function () {
                updateTimer();
            }).change(function () {
                updateTimer(500);
            });
            $('#youtubeStart, #youtubeEnd').keypress(function () {
                updateTimer();
            }).change(function () {
                updateTimer(500);
            });
        }
    }

    /**
     * Execute namespace youtube
     */
    $(function () {
        // Init templatewith mustach
        var data = {
            youtubeurl: "Youtube URL",
            youtubeID: "Youtube ID",
            cancel: "cancel",
            Insert: "Insert"
        };

        //Use jQuery's get method to retrieve the contents of our template file, then render the template.
        $.get("view/forms.html", function (template) {
            $("#template-container").append(template);
            runPreview();

            $("#insert-btn").on("click", function(){
                if(validateTime())
                    run();
            });
            $("#close-btn").on("click", function(){
                parent.tinymce.activeEditor.windowManager.close();
            });
        });
    });
}(jQuery));
