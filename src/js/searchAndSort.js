var listJsOptions = {
  listClass: 'container',
  valueNames: [ 'apk-label' ]
};
var listJsApkList = new List('apkList', listJsOptions);

// initially sort by label
listJsApkList.sort('apk-label');
