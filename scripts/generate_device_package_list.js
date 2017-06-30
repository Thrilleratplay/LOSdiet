var spawn       = require('child_process').spawnSync;
var EOL         = require('os').EOL;
var fs          = require('fs');

var adbCmd = spawn( 'adb', [ 'shell', 'cmd', 'package list packages -s -f'] );
var packages = [];

if(adbCmd.stderr.toString()) {
  throw adbCmd.stderr.toString();
}

adbCmd.stdout.toString().trim().split(EOL).sort().forEach(function (adbOut) {
  var appSplit = adbOut.replace('package:/system/', '')
                       .replace('=', '/')
                       .split('/');
  packages.push({
    //dir: appSplit[0],
    name: (appSplit[0] === 'framework' ? appSplit[1] : appSplit[1].replace('.apk', '')),
  //  apk: appSplit[2],
    packageName: (appSplit[0] === 'framework' ? appSplit[2] : appSplit[3]),
  });
});

fs.writeFileSync('./data/adb_package_list.json', JSON.stringify(packages, null, 2), 'utf-8');
