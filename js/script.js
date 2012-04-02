// make it safe to use console.log always
(function(a){function b(){}for(var c="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),d;!!(d=c.pop());){a[d]=a[d]||b;}})
(function(){try{console.log();return window.console;}catch(a){return (window.console={});}}());

var githubApi = 'https://api.github.com/'
    , students = []
    , processCount = 0
    , showPopovers = true
    , HSList = [
  [
      'muffs'
    , 'j2labs'
    , 'happy4crazy'
    , 'artemtitoulenko'
    , 'kylewpppd'
    , 'workmajj'
  ],
  [
      'gone'
    , 'levberlin'
    , 'omni5cience'
    , 'ramz15'
    , 'talos'
    , 'kristiankristensen'
    , 'jyli7'
    , 'sethmurphy'
    , 'jordanorelli'
    , 'supacliny'
  ],
  [
      'davidbalbert'
    , 'zallarak'
    , 'antoviaque'
    , 'thomasballinger'
    , 'nicholasbs'
    , 'jab'
    , 'lchi'
    , 'cirsteve'
    , 'jconnolly'
    , 'daniellesucher'
    , 'stuntgoat'
    , 'myf'
    , 'colinmarc'
    , 'davemckenna01'
    , 'nmichalov'
    , 'brendannee'
    , 'jollysonali'
    , 'sidnicious'
    , 'shwaydogg'
    , 'euccastro'
  ]
  ]
    , batchStartDates = [
      new Date(2011, 6, 18)
    , new Date(2011, 8, 29)
    , new Date(2012, 1, 13)
  ];

$(document).ready(function(){

  window.onresize = resizeWindow;

  populateBatches();

  if(sessionStorage.getItem('students')){
    //get data out of cache
    students = JSON.parse(sessionStorage.getItem('students'));
    buildContent(2);
  } else {
    //fetch data for all batches
    fetchContent();
  }

  $('#batchSelect select').change(function(){
    var batch = $(this).val();
    $('#students .student:nth-child(2)').popover('hide');
    showPopovers = false;

    buildContent(batch);
  });

  //Click handler for student divs
  $('#students').on('click', '.student', function(){
    //hide popover
    $('#students .student:nth-child(2)').popover('hide');
    showPopovers = false;
    
    //hide stats
    $('#repoInfo').css('visibility','hidden');

    var div = this;
    //get student info for chart
    students.forEach(function(student){
      $(div)
        .addClass('active')
        .siblings()
          .removeClass('active')
          .children('.additionalInfo').slideUp();
      $('.additionalInfo', div).slideDown();
      if(student.login == $(div).attr('data-github')){
        drawChart(student);
      }
    });
  });
});


function resizeWindow(){
  //make app the height of the window
  var minHeight = 400
    , contentHeight = $(window).height() - $('#topMenu').height() - $('footer').height()
    , studentsHeight = $(window).height() - $('#topMenu').height() - $('footer').height() - $('#batchSelectContainer').height();

  $('#content').height(Math.max(contentHeight, minHeight));
  $('#students').height(studentsHeight);
}

function populateBatches(){
  batchStartDates.forEach(function(batch, index){
    var formattedDate = new Date(batch);
    $('#batchSelect select').prepend('<option value="' + index + '">' + index + ' (' + (batch.getMonth() + 1) + '/' + batch.getFullYear() + ')</option>');
  });
}

function fetchContent(){
  var studentCounter = 0
    , studentCount = 0;

  HSList.forEach(function(batch){ studentCount += batch.length; });

  HSList.forEach(function(batch){
    batch.forEach(getData);
  });


  function getData(userName, index){
    var student;

    $.getJSON(githubApi + 'users/' + userName + '?callback=?', function(data){
      student = data.data;
      $.getJSON(githubApi + 'users/' + userName + '/repos?callback=?', function(data){
        student.repos = data.data;
        student.preHSLanguages = {};
        student.postHSLanguages = {};
        student.preHSRepos = [];
        student.postHSRepos = [];

        student.batch = lookupBatch(student);

        students.push(student);

        studentCounter++;
        if(studentCounter == (studentCount - 1)){
          processRepos();
        }
      });
    });
  }
}

function lookupBatch(student){
  for(var i=0; i < HSList.length; i++){
    if(HSList[i].indexOf(student.login.toLowerCase()) > -1){
      return i;
    }
  }
  return false;
}

function processRepos(){

  var repoCounter = 0
    , repoCount = 0;

  students.forEach(function(student, i){
    student.repos.forEach(function(repo, j){
      repoCount++;
      $.getJSON(githubApi + 'repos/' + student.login + '/' + repo.name + '/languages?callback=?', function(data){
        students[i].repos[j].languages = data.data;
        
        //Exclude forks
        if(!repo.fork){
          if(Date.parse(repo.created_at) < batchStartDates[students[i].batch].getTime()){
            students[i].repos[j].preHS =  true;
            students[i].preHSRepos.push(repo.name);

            for(var l in repo.languages){
              if( !students[i].preHSLanguages.hasOwnProperty(l) ){
                students[i].preHSLanguages[l] = 0;
              }
              students[i].preHSLanguages[l] += repo.languages[l];
            }
          
          } else {
            students[i].repos[j].preHS =  false;
            students[i].postHSRepos.push(repo.name);
          
            for(var l in repo.languages){
              if( !students[i].postHSLanguages.hasOwnProperty(l) ){
                students[i].postHSLanguages[l] = 0;
              }
              students[i].postHSLanguages[l] += repo.languages[l];
            }
          }
        }        
        //increment loading
        $('#loading .bar').css('width', '' + Math.ceil(repoCounter/repoCount*100) + '%');
        repoCounter++;

        if(repoCounter == (repoCount-1)){
          //store as local variable
          sessionStorage.setItem('students', JSON.stringify(students));

          //build content
          buildContent(2);
        }

      });
    });
   
  });
}

function buildContent(batch){
  //remove loading
  $('#loading').fadeOut();
  $('#students').empty();
  $('#content').fadeIn();
  $('footer').fadeIn();

  students.forEach(function(student){
    if(student.batch == batch){
      var preHSlanguages = JSON.stringify(getLanguagePercents(student.preHSLanguages)).replace(/,"/g,', "')
        , postHSlanguages = JSON.stringify(getLanguagePercents(student.postHSLanguages)).replace(/,"/g,', "')
        , displayName = (student.name) ? student.name : student.login;
      
      $('<div>')
        .addClass('student')
        .attr('data-github', student.login)
        .attr('batch', batch)
        .html('<img src="' + student.avatar_url + '"><h3>' + bleach.sanitize(displayName) + '</h3>')
        .append('<div class="additionalInfo"><div class="followers">Followers: ' + student.followers + '</div>' +
          '<div class="repos">Repos: ' + student.public_repos + ' (' + (student.preHSRepos.length +student.postHSRepos.length) + ' non-fork)</div>' +
          '<div class="githubLink"><a href="' + student.html_url + '">' + student.html_url + '</a></div>' +
          '<div>Hacker School</div>' +
          '<div class="preHS">{Pre: {repos:' +  student.preHSRepos.length + ', languages:' + preHSlanguages + '},</div>' +
          '<div class="postHS">Post: {repos:' +  student.postHSRepos.length + ', languages: ' + postHSlanguages + '}}</div></div>')
        .appendTo('#students');
    }
  });
  
  if(showPopovers){
    $('#students .student:nth-child(2)')
      .popover({placement: 'right', trigger:'manual',  title:"Welcome", content:"Select a Hacker Schooler to begin"})
      .popover('show');
  }

  //resize window when done
  resizeWindow();
}

function getLanguagePercents(languages){
  var total = 0
    , languagePercents = {};
  for(var language in languages){
    total+= languages[language];
  }
  for(var language in languages){
    languagePercents[language] = Math.round(languages[language] / total * 1000)/10 + '%';
  }
  return languagePercents;
}

function drawChart(student){
  var r = Math.min(615, ( $('#content').height() - $('#repoInfo').height() ))
    , format = d3.format(",d")
    , fill = d3.scale.category20();

  var bubble = d3.layout.pack()
    .sort(null)
    .size([r, r]);
    
    //remove old chart
  d3.select("#chart svg").remove()

  var vis = d3.select("#chart").append("svg")
    .attr("width", r)
    .attr("height", r)
    .attr("class", "bubble");
    
  var node = vis.selectAll("g.node")
    .data(bubble.nodes(classes(student))
    .filter(function(d) { return !d.children; }))
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    .on('mouseover', function(d){
      //show repo info
      $('#repoInfo').css('visibility', 'visible');
      
      $('#repoInfo h3 a')
        .html( bleach.sanitize(d.title))
        .attr('href', d.html_url);
      $('#repoInfo .description').html( bleach.sanitize(d.description));
      if(d.homepage){
         $('#repoInfo .description').append(' <a href="' +  bleach.sanitize(d.homepage) + '" title="Project Website">' +  bleach.sanitize(d.homepage) + '</a>');
      }
      
      $('#repoInfo .forks span').html(d.forks);
      $('#repoInfo .watchers span').html(d.watchers);
      $('#repoInfo .languages span').html( JSON.stringify( getLanguagePercents(d.languages) ).replace(',"',', "') );
      $('#repoInfo .link a')
        .html(d.html_url)
        .attr('href', d.html_url);

      //get collaborators and commit info
      var key = d.login + '/' + d.title;
      if(sessionStorage.getItem(key)){
        //get from sessionstorage
        updateRepoInfo(JSON.parse(sessionStorage.getItem(key)));

      } else {
        $.getJSON(githubApi + 'repos/' + d.login + '/' + d.title + '/collaborators?callback=?', function(data){
          var repoInfo = { collaborators: data.data };
          $.getJSON(githubApi + 'repos/' + d.login + '/' + d.title + '/commits?callback=?', function(data){
            repoInfo.commits = data.data;
            //save to session storage
            sessionStorage.setItem(key, JSON.stringify(repoInfo));

            updateRepoInfo(repoInfo);
          });
        });
      }

      function updateRepoInfo(repoInfo){
        var collaboratorsDiv = '';
        repoInfo.collaborators.forEach(function(collaborator){
          collaboratorsDiv += '<a href="' + collaborator.url + '" title="' + collaborator.login + '"><img src="' + collaborator.avatar_url + '"></a>';
        });
        $('#repoInfo .collaborators span').html(collaboratorsDiv);

        var lastCommitDate = new Date(repoInfo.commits[0].commit.committer.date);
        $('#repoInfo .commits span').html('<a href="' + repoInfo.commits[0].url + '" title="' + repoInfo.commits[0].commit.message + '">' + lastCommitDate.toLocaleDateString() + '</a>');
      }

    });

  node.append("title")
    .text(function(d) { return d.title + ": " + d.description });

  node.append("circle")
    .attr("r", function(d) { return d.r; })
    .style("fill", function(d) { return fill(d.language); });

  node.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", ".3em")
    .text(function(d) { return d.title.substring(0, d.r / 3); });

  // Returns a flattened hierarchy containing all leaf nodes under the root.
  function classes(student) {
    var classes = []
      , languages = [];

    student.repos.forEach(function(repo) {
      //remove forks
      if(!repo.fork){
        classes.push({language: repo.language, title: repo.name, value: repo.size, html_url: repo.html_url, description: repo.description, languages: repo.languages, forks: repo.forks, watchers: repo.watchers, homepage: repo.homepage, login: repo.owner.login });
      }

      //build legend
      if(languages.indexOf(repo.language) == -1){
        languages.push(repo.language);
      }
    });

    $('#legend').empty();
    languages.forEach(function(language){
      $('<div>')
        .addClass(language + ' legend')
        .html('<div style="background-color:' + fill(language) + '"></div>' + language)
        .appendTo('#legend');
    });

    return {children: classes};
  }

}

