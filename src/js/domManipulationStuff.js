var selectedApks = JSON.parse(localStorage.getItem('LOSdiet.apks')) || [];
var manuallyEnteredApks = JSON.parse(localStorage.getItem('LOSdiet.user_added_apks')) || [];
var apkListContainer = document.querySelector('.apk-containter');
var userApkContainer = document.querySelector('.user-apks-container');
var userApkTextarea = userApkContainer.querySelector('textarea');
var makeZipButton = document.querySelector('input[type=button][value="Make Zip"]');
var filterList = document.querySelector('.filter-list');

var apkData;

userApkTextarea.value = manuallyEnteredApks.join("\n");

/**
 * Disable Make Zip checkbox if no apps are selected
 */
var disableMakeZipButton = function () {
  makeZipButton.disabled = selectedApks.length === 0;
}

var isApkSelected = function(apk) {
  return selectedApks.indexOf(apk.name) !== -1;
};

var filterApkList = function(apk) {
  return isApkSelected(apk)
  || ((!apk.expertOnly || filterList.querySelector('input[name="expertMode"]:checked'))
      && !apk.isGoogleApp && !apk.isCM13Only);
}

var renderApkList = function () {
  var tmpl = ['<div class="row app-list">',
                '<div class="col s12 m6 l4">',
                  '<input type="checkbox" id="<%= apk.name %>" ',
                  '<%=(isSelected ? "checked=true": "")%> ',
                  '/>',
                  '<label for="<%= apk.name %>">',
                    '<div class="apk-label truncate"><%= apk.label %></div>',
                  '</label>',
                  '<div>',
                    '<%-(apk.expertOnly ? \'<span class="chip red">Danger</span>\': "")%> ',
                  '</div>',
                '</div>',
                '<div class="col hide-on-med-and-down l3">',
                  '<div class="truncate">',
                    '<%= apk.packageName %>',
                  '</div>',
                '<div class="truncate">',
                  '<%= apk.name %>.apk</div>',
                '</div>',
                '<div class="col m6 l5">',
                  '<%= apk.description %>',
                '</div>',
              '</div>',
            ].join('');

  // Filter and generate HTML for apk list
  apkListContainer.innerHTML = apkData.filter(filterApkList)
                                      .map(function(apk) {
                                        return ejs.render(tmpl, {
                                          apk: apk,
                                          isSelected: isApkSelected(apk)
                                        });
                                      }).join('');

  // Bind disableMakeZipButton() to checkboxes
  Array.prototype.map.call(apkListContainer.querySelectorAll('input[type=checkbox]'), function (checkbox) {
    checkbox.addEventListener('change', function() {
      var selectedIndex = selectedApks.indexOf(this.id);
      if (selectedIndex > -1) {
        selectedApks.splice(selectedIndex, 1);
      } else {
        selectedApks.push(this.id);
      }
      disableMakeZipButton();
    });
  });

  // initially set Make Zip disabled if need be.
  disableMakeZipButton();

  // Show/Hide User Entered textarea
  if (filterList.querySelector('input[name="expertMode"]:checked') || userApkTextarea.value) {
    userApkTextarea.classList.remove('hide');
  } else {
    userApkTextarea.classList.add('hide');
  }
}

/**
 * AJAX request for apk JSON data
 */
var getApkJson = function() {
  var request = new XMLHttpRequest();

  request.open('GET', './apkData.json', true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      apkData = JSON.parse(request.responseText);
      renderApkList();
    }
  };

  request.send();
};

/**
 * Format manually entered Apks list into array of user
 */
var formatUserApkTextarea = function() {
  manuallyEnteredApks = this.value.split(/\W/).filter(function(x) { return x; });
  this.value = manuallyEnteredApks.join("\n");
};

filterList.querySelector('input[name="expertMode"]').onchange = renderApkList;
userApkTextarea.onblur = formatUserApkTextarea;

// Start reticulating splines
getApkJson();
