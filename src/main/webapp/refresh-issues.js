/*******************************************************************************
 * Copyright 2023 Open Text.
 * 
 * Licensed under the MIT License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * https://opensource.org/licenses/MIT
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *******************************************************************************/
        var isUpdateEnable = true;
        function updateByUrl(boxId,urlLink,params,spinnerUrl) {
            // first display the "loading..." icon
            if (isUpdateEnable) {
                isUpdateEnable = false;
                var box = document.getElementById(boxId);
                box.innerHTML = '<img src="' + spinnerUrl + '" alt=""/>';
                 // then actually fetch the HTML
                fetch(urlLink, {
                    method: 'POST',
                    headers: crumb.wrap({
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }),
                    body: new URLSearchParams(params)
                })
                .then(response => response.text())
                .then(text => {
                    var issueTable = document.getElementById('issueTable');
                    if (issueTable != null) {
                        issueTable.innerHTML = text;
                    }
                    isUpdateEnable = true;
                })
                .catch((error) => {
                    console.error(error.message);
                });
            }
        }

        function updateList(boxId,folder,nextPage,spinnerUrl) {
            var params = {'folder' : folder, 'page' : nextPage};
            updateByUrl(boxId,contextUrl+"/updateIssueList",params,spinnerUrl);
        }

        function updateListWithSort(boxId,folder,nextPage,sortOrd,spinnerUrl) {
            var params = {'folder' : folder, 'page' : nextPage, 'sort' : sortOrd};
            updateByUrl(boxId,contextUrl+"/updateIssueList",params,spinnerUrl);
        }
        
        function updatePageSize(boxId,aSize,spinnerUrl) {
            var params = {'size' : aSize};
            updateByUrl(boxId,contextUrl+"/setPageSize",params,spinnerUrl);
        }

        function showNew(boxId,spinnerUrl) {
            var params = {'all' : 'no'};
            updateByUrl(boxId,contextUrl+"/showAllNotNew",params,spinnerUrl);
        }

        function showAll(boxId,spinnerUrl) {
            var params = {'all' : 'yes'};
            updateByUrl(boxId,contextUrl+"/showAllNotNew",params,spinnerUrl);
        }

        function showGrouping(boxId,selectedGrouping,spinnerUrl) {
            var params = {'grouping' :  selectedGrouping};
            updateByUrl(boxId,contextUrl+"/selectedGrouping",params, spinnerUrl);
        }

        function scheduleUpdateCheck() {
            fetch(contextUrl + "/checkUpdates?stamp=" + stamp, {
                method: 'POST',
                headers: crumb.wrap({
                    'Content-Type': 'application/x-www-form-urlencoded'
                }),
                body: new URLSearchParams({
                    stamp: stamp,
                })
            }).then(function(rsp) {
                if (rsp.ok) {
                    var update = rsp.headers.get('go');
                    if(update == "go") {
                        stamp = new Date().getTime();
                        reloadStatistics();
                        reloadIssues();
                    }
                    // next update in 10 sec
                    window.setTimeout(scheduleUpdateCheck, 10000);
                }
            })
            .catch((error) => {
                console.error(error.message);
            });
        }

        function reloadStatistics() {
            fetch(contextUrl + "/ajaxStats", {
                method: 'POST',
                headers: crumb.wrap({
                    'Content-Type': 'text/plain'
                })
            })
            .then(response => response.text())
            .then(text => {
                var scanStatistics = document.getElementById('scanStatistics');
                if (scanStatistics != null) {
                    scanStatistics.innerHTML = text;
                }
            })
            .catch((error) => {
                console.error(error.message);
            });
        }

        function reloadIssues() {
            fetch(contextUrl + "/ajaxIssues", {
                method: 'POST',
                headers: crumb.wrap({
                    'Content-Type': 'text/plain'
                })
            })
            .then(response => response.text())
            .then(text => {
                var issueTable = document.getElementById('issueTable');
                if (issueTable != null) {
                    issueTable.innerHTML = text;
                }
            })
            .catch((error) => {
                console.error(error.message);
            });
        }

        function reload(url,box) {
            fetch(url, {
                method: 'POST',
                headers: crumb.wrap({
                    'Content-Type': 'text/plain'
                })
            })
            .then(response => response.text())
            .then(text => {
                var issueTable = document.getElementById(box);
                if (issueTable != null) {
                    issueTable.innerHTML = text;
                }
            })
            .catch((error) => {
                console.error(error.message);
            });
        }

        function loadIssueTable(spinnerUrl) {
           function loadIssues() {
               // first display the "loading..." icon
               var box = document.getElementById('firstTimeSpinF');
               box.innerHTML = '<img src="'+spinnerUrl+'" alt=""/>';
               // then actually fetch the HTML
               fetch(contextUrl + "/ajaxIssues", {
                    method: 'POST',
                    headers: crumb.wrap({
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }),
                    body: new URLSearchParams({
                        firstTime: 'yes',
                    })
                })
                .then(response => response.text())
                .then(text => {
                   var issueTable = document.getElementById('issueTable');
                   issueTable.innerHTML = text;
                   // next update
                   window.setTimeout(scheduleUpdateCheck, 10000);
                })
                .catch((error) => {
                    console.error(error.message);
                });
            }
            window.setTimeout(loadIssues, 0);
        }

        document.addEventListener("DOMContentLoaded", () => {
            window.stamp = new Date().getTime();
            var { contextUrl, imagesUrl } = document.querySelector(".table-action-data-holder").dataset;
            window.contextUrl = contextUrl;
            loadIssueTable(`${imagesUrl}/spinner.gif`);
        });
