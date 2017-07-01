/**
 * Merge CM13 barebones list, device package list and existing LOSDiet lists
 *
 */
var fs = require('fs');
var _ = require('lodash');
var babyparse = require('babyparse');

// Scraped from CM13 Barebones list found on Archive.org
var remainingCmList = require('./data/original_CM13_barebone_list.json');
// List of packages from phyiscal device
var remainingAdbList = require('./data/adb_package_list.json');
// Existing apkData for template
var losDiet = babyparse.parseFiles('../src/apkData.csv', {header: true, dynamicTyping: true}).data;

// Packages still used in LineagesOS but not currently installed on my device (Moto X Pure/Clark)
var autoAcceptNames = [
  'AntHalService',
  'com.qualcomm.location',
  'FMRadio',
  'Provision',
  'Screencast',
  'SoundRecorder',
  'ThemeChooser',
  'ThemesProvider',
];

var gApps = _.remove(remainingCmList, 'isGoogleApp');
var fullMatch = _.remove(remainingCmList, function(cm){
  return _.includes(autoAcceptNames, cm.name);
});

var losRemaining = [];
var losMatching = [];

var remainingConcated = []
var formattedPackageList = [];

/**
 * Standardize object
 */
var formatApk = function(apk, params) {
  return {
    description: String(apk.description || '').replace('Safe to remove.', ''),
    label: String(apk.label || apk.name).replace('Trebuchet', 'Launcher'),
    packageName: apk.packageName || '',
    name: apk.name || '',
    isGoogleApp:  (params.isGoogleApp === true || apk.isGoogleApp === true),
    removable: (_.isUndefined(apk.removable) || apk.removable === 'yes' || apk.removable === true),
    isCM13Only: (params.isCM13Only === true || apk.isCM13Only === true),
  };
}

//*****************************************************************************

// Remove deveice specific stuff, I want to keep this generic
_.remove(remainingAdbList, function(apk) {
  return apk.packageName.indexOf('motorola.') !== -1;
});
_.remove(losDiet, function(apk) {
  return apk.packageName.indexOf('motorola.') !== -1;
});

remainingCmList = remainingCmList.filter(function(cm) {
  var cmClone;

  var pruned = _.remove(remainingAdbList, function(adb) {
    return (cm.name === 'Browser' &&  adb.name === 'Jelly') ||
          ((cm.name === adb.name || cm.apkName === adb.name)
          && (cm.packageName === adb.packageName
            || cm.packageName.replace('com.', 'org.') === adb.packageName
            || cm.packageName.replace('com.cyanogenmod', 'org.lineageos') === adb.packageName));
  });

  if (!_.isEmpty(pruned)) {
    // Do not filter out Browser
    if (cm.name === 'Browser' && pruned[0].name === 'Jelly') {
      cmClone = _.cloneDeep(cm);
      cmClone.packageName = pruned[0].packageName;
      cmClone.name = pruned[0].name;

      fullMatch = fullMatch.concat([cmClone]);
      return true;
    } else {
      fullMatch = fullMatch.concat(pruned);
    }

    return false;
  }

  return true;
});

// remove Gapps that already exist
_.remove(gApps, function(apk) {
  return _.some(losDiet, ['packageName', apk.packageName]);
});
// remove CM13 apps that already exist
_.remove(remainingCmList, function(apk) {
  return _.some(losDiet, ['packageName', apk.packageName]);
});

remainingConcated = fullMatch.concat(remainingCmList, remainingAdbList, gApps);

losRemaining = losDiet.filter(function(los) {
  var pruned = _.remove(remainingConcated, function(apk) {
    return ((!apk.label || (los.label === apk.label || los.label.replace(/[\/\s]/g, '') === apk.name))
    && (los.packageName === apk.packageName
      || los.packageName.replace('com.', 'org.') === apk.packageName
      || los.packageName.replace('com.cyanogenmod', 'org.lineageos') === apk.packageName)
    && los.name === apk.name);
  });

  if (!_.isEmpty(pruned)) {
    losMatching = losMatching.concat(pruned);
    return false;
  }

   return true;
});

console.log('Remaining from CM13 list (CM13 only): ' + remainingCmList.length);
console.log('Remaining from ADB package list: ' + remainingAdbList.length);
console.log('gApps: ' + gApps.length);
console.log('fullMatch: ' + fullMatch.length);
console.log('los remaining: ' + losRemaining.length);
console.log('los matching: ' + losMatching.length);
// console.log(remainingConcated.length);

formattedPackageList = _.unionWith(losMatching.map(formatApk),
                                   remainingCmList.map(function(apk){
                                      return formatApk(apk, {isCM13Only: true});
                                    }),
                                   gApps.map(function(apk){
                                     return formatApk(apk, {isGoogleApp: true});
                                   }),
                                   fullMatch.map(formatApk),
                                   remainingAdbList.map(formatApk),
                                   losRemaining.map(formatApk),
                                   _.isEqual);

formattedPackageList = _.sortBy(formattedPackageList, function (i) { return String(i.label).toLowerCase(); });

fs.writeFileSync('../src/apkData.csv', babyparse.unparse(formattedPackageList,{quoteChar: '"'}), 'utf-8');
