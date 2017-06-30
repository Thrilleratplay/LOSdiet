var tabletojson = require('tabletojson');
var fs = require('fs');

tabletojson.convertUrl(
  'http://web.archive.org/web/20161224222405/https://wiki.cyanogenmod.org/w/Template:Barebones_cm13',
  { useFirstRowForHeadings: true },
  function(tablesAsJson) {
    var rawApkData = tablesAsJson[3].concat(tablesAsJson[4]);

    // Remove headers as entries and rekey the objects
    var formattedApk = rawApkData.reduce(function(results, apk) {
      var tmpApk = {};

      tmpApk.apkName = apk['APK name'] || apk['APK name_2'];
      tmpApk.name = tmpApk.apkName.replace('.apk', '');
      tmpApk.isGoogleApp = ((apk['APK name_2'] || '').length > 0);
      tmpApk.packageName = apk['Package name'] || apk['Package name_2'];
      tmpApk.label = apk['Label'] || apk['Label_2'];
      tmpApk.removable = apk['Removable'] || apk['Removable_2'];
      tmpApk.description = apk['Description'] || apk['Description_2'];
      tmpApk.version = apk['Version'] || apk['Version_2'];

      if (tmpApk.apkName !== 'APK name') {
        results.push(tmpApk);
      }

      return results;
    }, []);

    fs.writeFileSync('./data/original_CM13_barebone_list.json', JSON.stringify(formattedApk, null, 2), 'utf-8');
  }
);
