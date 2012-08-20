// make it safe to use console.log always
(function(a){function b(){}for(var c="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),d;!!(d=c.pop());){a[d]=a[d]||b;}})
(function(){try{console.log();return window.console;}catch(a){return (window.console={});}}());

var githubApi = 'https://api.github.com/'
    , students = []
    , processCount = 0
    , options = {
      showPopovers: true
    }
    , HSList = [
    [
        'muffs'
      , 'j2labs'
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
      , 'sidnicious'
      , 'shwaydogg'
      , 'euccastro'
    ],
		[
  			'thomasballinger'
  		, 'nicholasabs'
  		, 'shirmung'
  		, 'cavedweller'
  		, 'davekong'
  		, 'ingrid'
  		, 'S714726'
  		, 'maryrosecook'
  		, 'pepijndevos'
  		, 'oxling'
  		, 'ericfode'
  		, 'dillonforrest'
  		, 'dustingetz'
  		, 'nphoff'
  		, 'akaptur'
  		, 'jamak'
  		, 'JasonLaster'
  		, 'bev-a-tron'
  		, 'davidleibovic'
  		, 'bmacri'
  		, 'vickimo'
  		, 'niftynei'
  		, 'linse'
  		, 'dunvi'
  		, 'grstearns'
  		, 'oskarth'
  		, 'zachallaun'
  		, 'aerenchyma'
  		, 'doda'
  		, 'Sean-Der'
  		, 'lpellis'
  		, 'yaelelmatad'
  		, 'julienfantin'
  		, 'tgebru'
  		, 'marthakelly'
  		, 'smargonz'
  		, 'TreyLawrence'
  		, 'drrckln'
  		, 'govindmanian'
  		, 'dennismartensson'
  		, 'ariamoraine'
  		, 'muhtasib'
  		, 'happy4crazy'
  		, 'sarenji'
  		, 'trucy'
  		, 'vu2srk'
  		, 'bramsey'
  		, 'mil'
  		, 'fiveplusone'
  		, 'jns2'
  		, 'jollysonali'
  		, 'sunahsuh'
  		, 'janewang' 
		]
  ]
    , batchStartDates = [
        new Date(2011, 6, 18)
      , new Date(2011, 8, 29)
      , new Date(2012, 1, 13)
      , new Date(2012, 6, 4)
    ];

$(document).ready(function(){

  //initial options
  updateOptionsFromForm();

  window.onresize = resizeWindow;

  populateBatches();

  if(sessionStorage.getItem('students')){
    //get data out of cache
    students = JSON.parse(sessionStorage.getItem('students'));
    renderBatch(2);
  } else {
    //fetch data for all batches
    fetchContent();
  }

  //Display options form controls
  $('#batchSelect').change(function(){
    hidePopups();
    renderBatch($(this).val());
  });

  $('#showForks').change(processStudent);

  $('#random').click(function(){
    getRandom();
    return false;
  });

  //Click handler for student divs
  $('#students').on('click', '.student', processStudent);
});


function resizeWindow() {
  //make app the height of the window
  var minHeight = 400
    , contentHeight = $(window).height() - $('#topMenu').height() - $('footer').height()
    , studentsHeight = $(window).height() - $('#topMenu').height() - $('footer').height() - $('#displayOptionsContainer').height();

  $('#content').height(Math.max(contentHeight, minHeight));
  $('#students').height(studentsHeight);
}


function updateOptionsFromForm() {
  options.forks = $('#showForks').is(':checked');
}


function populateBatches(){
  batchStartDates.forEach(function(batch, index){
    var formattedDate = new Date(batch);
    $('#batchSelect').prepend('<option value="' + index + '">' + index + ' (' + (batch.getMonth() + 1) + '/' + batch.getFullYear() + ')</option>');
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

function hidePopups(){
  //hide popups
  $('#students .student:nth-child(2)').popover('hide');
  options.showPopovers = false;
}


function processStudent(){

  //update options
  updateOptionsFromForm()

  if($(this).hasClass('student')){
    var div = $(this);
  } else {
    var div = $('.student.active');
  }

  $(div)
    .addClass('active')
    .siblings()
      .removeClass('active')
      .children('.additionalInfo').slideUp();
  $('.additionalInfo', div).slideDown();

  //hide popover
  $('#students .student:nth-child(2)').popover('hide');
  options.showPopovers = false;

  //hide stats
  $('#repoInfo').css('visibility','hidden');


  //get student info for chart
  var studentName = $('.student.active').attr('data-github');
  students.forEach(function(student) {
    if(student.login == studentName) {
      drawChart(student);
    }
  });
}


function lookupBatch(student) {
  for(var i=0; i < HSList.length; i++) {
    if(student.login && HSList[i].indexOf(student.login.toLowerCase()) > -1) {
      return i;
    }
  }
  return false;
}


function processRepos(){
  var repoCounter = 0
    , repoCount = 0;

  students.forEach(function(student, i){
    if(!student.repos){
      return;
    }
    student.repos.forEach(function(repo, j){
      repoCount++;
      var languagesUrl = githubApi + 'repos/' + student.login + '/' + repo.name + '/languages?callback=?';
      $.getJSON(languagesUrl, function(data){
        students[i].repos[j].languages = data.data;

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

        //increment loading
        $('#loading .bar').css('width', '' + Math.ceil(repoCounter/repoCount*100) + '%');
        repoCounter++;

        if(repoCounter == (repoCount-1)){
          //store as local variable, then build content
          sessionStorage.setItem('students', JSON.stringify(students));
          renderBatch(2);
        }
      });
    });
  });
}


function renderBatch(batch){
  //remove loading
  $('#loading').fadeOut();
  $('#students').empty();
  $('#content').fadeIn();
  $('footer').fadeIn();

  //select matching from dropdown
  $('#batchSelect option').filter(function(){
    return $(this).val() == batch;
  }).attr('selected', true)

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
        .append('<div class="additionalInfo">' +
          '<div class="followers">Followers: ' + student.followers + '</div>' +
          '<div class="repos">Repos: ' + student.public_repos + '</div>' +
          '<div class="githubLink"><a href="' + student.html_url + '">' + student.html_url + '</a></div>' +
          '<div>Hacker School</div>' +
          '<div class="preHS">{Pre: {repos:' +  student.preHSRepos.length + ', languages:' + preHSlanguages + '},</div>' +
          '<div class="postHS">Post: {repos:' +  student.postHSRepos.length + ', languages: ' + postHSlanguages + '}}</div></div>')
        .appendTo('#students');
    }
  });
  
  if(options.showPopovers){
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


function showRepoInfo(repo) {
  //show repo info
  $('#repoInfo').css('visibility', 'visible');

  (repo.fork) ? $('#repoInfo').addClass('isfork') : $('#repoInfo').removeClass('isfork');
  $('#repoInfo h3 a')
    .html(bleach.sanitize(repo.name))
    .attr('href', repo.html_url);
  $('#repoInfo .description').html( bleach.sanitize(repo.description));
  if(repo.homepage){
     $('#repoInfo .description').append(' <a href="' +  bleach.sanitize(repo.homepage) + '" title="Project Website">' +  bleach.sanitize(repo.homepage) + '</a>');
  }
  $('#repoInfo .forks span').html(repo.forks);
  $('#repoInfo .watchers span').html(repo.watchers);
  $('#repoInfo .languages span').html( JSON.stringify( getLanguagePercents(repo.languages) ).replace(',"',', "') );
  $('#repoInfo .link a')
    .html(repo.html_url)
    .attr('href', repo.html_url);

  //get collaborators and commit info
  var key = repo.owner.login + '/' + repo.name;
  if(sessionStorage.getItem(key)){
    //get from sessionstorage
    updateRepoInfo(JSON.parse(sessionStorage.getItem(key)));

  } else {
    var collaboratorUrl = githubApi + 'repos/' + repo.owner.login + '/' + repo.name + '/collaborators?callback=?';
    $.getJSON(collaboratorUrl, function(data){
      var repoInfo = { collaborators: data.data };
      var commitUrl = githubApi + 'repos/' + repo.owner.login + '/' + repo.name + '/commits?callback=?';
      $.getJSON(commitUrl, function(data){
        repoInfo.commits = data.data;

        //save to session storage
        sessionStorage.setItem(key, JSON.stringify(repoInfo));

        updateRepoInfo(repoInfo);
      });
    });
  }

  function updateRepoInfo(repoInfo){
    var collaboratorsDiv = '';
    if(!repoInfo.collaborators){
      return;
    }
    repoInfo.collaborators.forEach(function(collaborator){
      collaboratorsDiv += '<a href="' + collaborator.url + '" title="' + collaborator.login + '"><img src="' + collaborator.avatar_url + '"></a>';
    });
    $('#repoInfo .collaborators span').html(collaboratorsDiv);

    var lastCommitDate = new Date(repoInfo.commits[0].commit.committer.date);
    $('#repoInfo .commits span').html('<a href="' + repoInfo.commits[0].url + '" title="' + repoInfo.commits[0].commit.message + '">' + lastCommitDate.toLocaleDateString() + '</a>');
  }

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
    .on('mouseover', showRepoInfo);

  node.append("title")
    .text(function(d) { return d.name + ": " + d.description });

  node.append("circle")
    .attr("r", function(d) { return d.r; })
    .style("fill", function(d) { return fill(d.language); });

  node.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", ".3em")
    .text(function(d) { return d.name.substring(0, d.r / 3); });

  // Returns a flattened hierarchy containing all leaf nodes under the root.
  function classes(student) {
    var classes = []
      , languages = [];

    student.repos.forEach(function(repo) {
      //remove forks, if option is set
      if(!repo.fork || options.forks){
        classes.push({language: repo.language, name: repo.name, value: repo.size, html_url: repo.html_url, description: repo.description, languages: repo.languages, fork: repo.fork, forks: repo.forks, watchers: repo.watchers, homepage: repo.homepage, owner: repo.owner });
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


function getRandom(){
  hidePopups();

  //randomize students
  var randStudent = students[Math.floor(Math.random() * students.length)];

  //show batch
  renderBatch(randStudent.batch);

  //select student div
  $('.student').removeClass('active');
  $('.student[data-github=' + randStudent.login + ']').addClass('active');

  processStudent();

  //randomize repos
  var randRepo = randStudent.repos[Math.floor(Math.random() * randStudent.repos.length)];
  showRepoInfo(randRepo);

  //scroll to user
  var index = $('.student').index($('.student[data-github=' + randStudent.login + ']'));
  $('#students').scrollTop(index * 50);
}
