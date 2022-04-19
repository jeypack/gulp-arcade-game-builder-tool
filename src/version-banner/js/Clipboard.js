/**
 * Author:   Joerg Pfeifer - @egplusww.com
 * Created:  01.11.2017
 * Modified: 28.02.2019 | 210130 | 210902
 */
(function () {

  'use strict';

  var p,
    content = '',
    obj = {},
    CONTENT_TYPE_PLAIN_TEXT = "text/plain",
    CONTENT_TYPE_HTML_TEXT = "text/html",
    execClipboardCommand = function (content, type) {
      var clipboardListener = function (e) {
        e.clipboardData.setData(type, content);
        e.preventDefault();
      };
      try {
        // try execCommand
        document.addEventListener("copy", clipboardListener);
        document.execCommand('copy');
        document.removeEventListener("copy", clipboardListener);
        /*console.log("+++ copyFlightAdListToClipboard +++");
        console.log(content);
        console.log("+++");*/
      } catch (err) {
        console.warn('Oops, unable to copy');
        return false;
      }
      return true;
    },
    Clipboard = {
      content: '',
      copyText: function copyText(content) {
        this.content = content;
        execClipboardCommand(content, CONTENT_TYPE_PLAIN_TEXT);
        return content;
      }
    };
  //
  // Clipboard Service
  /**
   * Get a well formed list of all latest ads inside campaign
   * @param {object} flight The given flight
   * @param {Array}  ads    The flight ads
   */
  /*obj.copyFlightAds = function (flight, ads) {
      var i, ad, clipboardListener,
          l = ads.length,
          client = flight.client.split('_').join(' ').toUpperCase(),
          folder = flight.folder.split('_').join(' ').toUpperCase();
      content = '<B STYLE="color:#555">' + client + ' - ' + folder + ':</B><BR><UL>';
      for (i = 0; i < l; i++) {
          ad = ads[i];
          //content += ad.format + ' ' + ad.size.raw + ':<br>';
          //content += ad.link.php + '<br><br>';
          content += '<LI STYLE="padding-bottom:6px;text-decoration:underline;">';
          content += '<A HREF="' + ad.link.php + '" TITLE="' + client + ' - ' + folder + ' - ' + ad.size.raw + '">' + ad.format + ' - ' + ad.size.raw + ' - ' + ad.date + ' - ' + ad.version.raw + '</A>';
          content += '</LI>';
      }
      content += '</UL><B STYLE="color:#555">';
      content += 'Overall Links: ' + l + '</B><BR><BR>';
      //
      execClipboardCommand(content, CONTENT_TYPE_HTML_TEXT);
      //
      return content;
  };*/
  window.EGPClipboard = Clipboard;

}());
