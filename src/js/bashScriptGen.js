var zipData;

/**
 * Load empty zip file in the background.
 *
 * @param {string} err  Error
 * @param {Object} data Zip file data
 */
JSZipUtils.getBinaryContent('./zips/slug.zip', function (err, data) {
  if (err) {
    throw err;
  }

  zipData = data;
});

/**
 * Package script into zip to be downloaded
 *
 */
var itsGoTime = function () {
  var SCRIPT_FILENAME = 'addon.d/20-LOSdiet.sh';
  var SCRIPT_FILE_OPTIONS = {
    type: 'blob',
    platform: 'UNIX'
  };
  var ZIP_FILENAME = 'LOS_app_remover-' + Date.now() + '.zip';
  var apks;

  /**
   * Generate BASH scripr that will remove unwanted apks
   *
   * @param {string[]} apks Array of APK names to remove
   * @returns {string} BASH script
   */
  function _generateBashScript(apks) {
    var begScript = [
      '#!/sbin/sh',
      '#',
      '# /system/addon.d/20-LOSdiet.sh',
      '# During a LineageOS upgrade this script removes user selected apps',
      'deleteApk() {',
      '    rm -rf /system/app/$1.apk /system/priv-app/$1.apk /system/app/$1 /system/priv-app/$1 && echo "Removed $1"',
      '}',
      'del_files() {',
      'cat <<EOF'
    ];

    var endScript = [
      'EOF',
      '}',
      'if [[ "$1" == "post-restore" ]] || [[ "$1" == "" ]]; then',
      '    del_files | while read FILE; do',
      '        deleteApk "$FILE"',
      '    done',
      'fi'
    ];

    return [].concat(begScript, apks, endScript).join("\n");
  }

  /**
   * Returns id
   * @param       {Object} el checked element
   * @returns     {string} element's id
   */
  function _returnId(el) {
    return el.id;
  }

  // *******************************************************************************

  // Excuse me, I'm looking for "the magic"
  // ** riding crop points ----> **
  apks = Array.prototype.map.call(document.querySelectorAll('.container input:checked'), _returnId);

  // Load zip
  JSZip.loadAsync(zipData).then(function (zip) {
    // Create BASH script, add to the zip
    zip.file(SCRIPT_FILENAME, _generateBashScript(apks.concat(manuallyEnteredApks)))
       .generateAsync(SCRIPT_FILE_OPTIONS)
       .then(function (blob) {
         // Save zip file
         saveAs(blob, ZIP_FILENAME);
         localStorage.setItem('LOSdiet.apks', JSON.stringify(apks));
         localStorage.setItem('LOSdiet.user_added_apks', JSON.stringify(manuallyEnteredApks));
       });
    });
  }
