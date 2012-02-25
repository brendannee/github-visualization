// make it safe to use console.log always
(function(a){function b(){}for(var c="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),d;!!(d=c.pop());){a[d]=a[d]||b;}})
(function(){try{console.log();return window.console;}catch(a){return (window.console={});}}());


var githubApi = 'https://api.github.com/'
  , students = []
  , repoCount = 0
  , processCount = 0;
  
var studentList = [
    'davidbalbert'
  ,'zallarak'
  , 'thomasballinger'
  , 'nicholasbs'
  , 'jab'
  , 'cirsteve'
  , 'jconnolly'
  , 'daniellesucher'
  , 'dustineichler'
  , 'stuntgoat'
  , 'myf'
  , 'colinmarc'
  , 'davemckenna01'
  , 'nmichalov'
  , 'brendannee'
  , 'sidnicious'
  , 'jollysonali'
];


$(document).ready(function(){

  //get all repos by username
  studentList.forEach(getData);
  
  
  $('#students').on('click', '.student', function(){
    //hide popover
    $('#students .student:nth-child(2)').popover('hide');
    
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

function getData(userName, index){
  var student;
  $.getJSON(githubApi + 'users/' + userName + '?callback=?', function(data){
    student = data.data;
    $.getJSON(githubApi + 'users/' + userName + '/repos?callback=?', function(data){
      repoCount += data.data.length;
      student.repos = data.data;
      student.preHSLanguages = {};
      student.postHSLanguages = {};
      student.preHSRepos = [];
      student.postHSRepos = [];
      students.push(student);
      if(index == (studentList.length - 1)){
        processRepos();
      }
    });
  });
}

function processRepos(){
  
  var repoCounter = 0
    , batchStartDate = new Date(2012, 2, 13);
    
  students.forEach(function(student, i){      
    student.repos.forEach(function(repo, j){
      $.getJSON(githubApi + 'repos/' + student.login + '/' + repo.name + '/languages?callback=?', function(data){
        students[i].repos[j].languages = data.data;
        
        //Exclude forks
        if(!repo.fork){
          if(Date.parse(repo.created_at) < batchStartDate.getTime()){
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
        
        if(repoCounter == (repoCount-1)){
          //build content
          buildContent();
          
          //remove loading
          $('#loading').fadeOut();
          $('#content').fadeIn();
          $('#students .student:nth-child(2)').popover({placement: 'right', trigger:'manual',  title:"Welcome", content:"Select a Hacker Schooler to begin"});
          $('#students .student:nth-child(2)').popover('show');
        }
        
        //increment loading
        $('#loading .bar').css('width', '' + Math.ceil(repoCounter/repoCount*100) + '%');
        
        repoCounter++;
      });
    });
   
  });
}

function buildContent(){
  students.forEach(function(student){
    var languages = getLanguagePercents(student.preHSLanguages)
      , displayName = (student.name) ? student.name : student.login;
    
    
    $('<div>')
      .addClass('student')
      .attr('data-github', student.login)
      .html('<img src="' + student.avatar_url + '"><h3>' + displayName + '</h3>')
      .append('<div class="additionalInfo"><div class="followers">Followers: ' + student.followers + '<div><div class="repos">Repos: ' + student.public_repos + '</div>' +
        '<div class="languages">Languages: ' + JSON.stringify(languages).replace(',"',', "') + '</div><a href="' + student.html_url + '">' + student.html_url + '</a></div>')
      .appendTo('#students');
  });
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
  var r = 600
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
        .html(d.title)
        .attr('href', d.html_url);
      $('#repoInfo .description').html(d.description);
      if(d.homepage){
         $('#repoInfo .description').append(' <a href="' + d.homepage + '" title="Project Website">' + d.homepage + '</a>');
      }
      
      $('#repoInfo .forks span').html(d.forks);
      $('#repoInfo .watchers span').html(d.watchers);
      $('#repoInfo .languages span').html( JSON.stringify( getLanguagePercents(d.languages) ).replace(',"',', "') );
      $('#repoInfo .link a')
        .html(d.html_url)
        .attr('href', d.html_url);
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
    var classes = [];

    student.repos.forEach(function(repo) {
      //remove forks
      if(!repo.fork){
        classes.push({language: repo.language, title: repo.name, value: repo.size, html_url: repo.html_url, description: repo.description, languages: repo.languages, forks: repo.forks, watchers: repo.watchers, homepage: repo.homepage });
      }
    });
    return {children: classes};
  }
  
}

