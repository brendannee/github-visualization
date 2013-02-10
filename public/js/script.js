var students
  , batches
  , options = {
    showPopovers: true
  }
  , colors = {
    "ActionScript": "#DDD",
    "Arduino": "#bd79d1",
    "Java": "#b07219",
    "VHDL": "#543978",
    "Scala": "#7dd3b0",
    "Emacs Lisp": "#c065db",
    "Delphi": "#b0ce4e",
    "Ada": "#02f88c",
    "VimL": "#199c4b",
    "Perl": "#0298c3",
    "Lua": "#fa1fa1",
    "Rebol": "#358a5b",
    "Verilog": "#848bf3",
    "Factor": "#636746",
    "Ioke": "#078193",
    "R": "#198ce7",
    "Erlang": "#949e0e",
    "Nu": "#c9df40",
    "AutoHotkey": "#6594b9",
    "Clojure": "#db5855",
    "Shell": "#5861ce",
    "Assembly": "#a67219",
    "Parrot": "#f3ca0a",
    "C#": "#555",
    "Turing": "#45f715",
    "AppleScript": "#3581ba",
    "Eiffel": "#946d57",
    "Common Lisp": "#3fb68b",
    "Dart": "#cccccc",
    "SuperCollider": "#46390b",
    "CoffeeScript": "#244776",
    "XQuery": "#2700e2",
    "Haskell": "#29b544",
    "Racket": "#ae17ff",
    "Elixir": "#6e4a7e",
    "HaXe": "#346d51",
    "Ruby": "#701516",
    "Self": "#0579aa",
    "Fantom": "#dbded5",
    "Groovy": "#e69f56",
    "C": "#555",
    "JavaScript": "#f15501",
    "D": "#fcd46d",
    "ooc": "#b0b77e",
    "C++": "#f34b7d",
    "Dylan": "#3ebc27",
    "Nimrod": "#37775b",
    "Standard ML": "#dc566d",
    "Objective-C": "#f15501",
    "Nemerle": "#0d3c6e",
    "Mirah": "#c7a938",
    "Boo": "#d4bec1",
    "Objective-J": "#ff0c5a",
    "Rust": "#dea584",
    "Prolog": "#74283c",
    "Ecl": "#8a1267",
    "Gosu": "#82937f",
    "FORTRAN": "#4d41b1",
    "ColdFusion": "#ed2cd6",
    "OCaml": "#3be133",
    "Fancy": "#7b9db4",
    "Pure Data": "#f15501",
    "Python": "#3581ba",
    "Tcl": "#e4cc98",
    "Arc": "#ca2afe",
    "Puppet": "#cc5555",
    "Io": "#a9188d",
    "Max": "#ce279c",
    "Go": "#8d04eb",
    "ASP": "#6a40fd",
    "Visual Basic": "#945db7",
    "PHP": "#6e03c1",
    "Scheme": "#1e4aec",
    "Vala": "#3581ba",
    "Smalltalk": "#596706",
    "Matlab": "#bb92ac",
    "Julia": "#DDD",
    "SciLab": "#DDD"
  };


$(document).ready(function (){
  //Listen for window resize
  window.onresize = resizeWindow;

  //initial options
  updateOptionsFromForm();
  $.getJSON('/api/batches', function (data){
    batches = data;
    batches.forEach(function (batch){
      var formattedDate = new Date(batch.startDate);
      $('#batchSelect').prepend('<option value="' + batch.batch_id + '">' + batch.batch_id + ' (' + (formattedDate.getMonth() + 1) + '/' + formattedDate.getFullYear() + ')</option>');
    });
  });

  $.getJSON('/api/students', function (data){
    students = data;
    students.forEach(function (student, idx){
      students[idx].nonfork_repos = student.repos.filter(function (repo){
        return !repo.fork;
      }).length;
      students[idx].languages = _.uniq(_.map(_.filter(student.repos, function (repo) { 
        return !repo.fork
      }), function (repo) {
        return repo.language 
      })).sort();
    })

    renderBatch("4");
  });

  //Display options form controls
  $('#batchSelect').change(function (){
    hidePopups();
    renderBatch($(this).val());
  });

  $('#showForks').change(function (){
    hidePopups();
    updateOptionsFromForm()
    showStudent(getStudentFromLogin($('#students .student.active').data('login')));
  });

  $('#topMenu .nav li a').click(function (){
    hidePopups();
    $(this)
      .parent().addClass('active')
      .siblings().removeClass('active');

    return false;
  });

  $('#batches').click(function (){
    hidePopups();
    renderBatch("4");
  });

  $('#random').click(getRandom);

  $('#mostFollowers').click(getMostFollowers);

  $('#mostRepos').click(getMostRepos);

  $('#mostLanguages').click(getMostLanguages);

  $('#oldest').click(oldestAccount);

  $('#summary').click(summary);

  //Click handler for student divs
  $('#students').on('click', '.student', function (){
    hidePopups();
    showStudent(getStudentFromLogin($(this).data('login')));
  });

  $('#studentList').on('click', '.student', function (){
    hidePopups();
    showStudent(getStudentFromLogin($(this).data('login')));
    scrollToActiveStudent();
    $('#batches')
      .parent().addClass('active')
      .siblings().removeClass('active');
  });
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


function hidePopups(){
  //hide popups
  $('#students .student').popover('hide');
  options.showPopovers = false;
}


function renderBatch(batch_id){
  $('#students').empty();
  $('#content').show();
  $('#studentList').hide();

  //select matching from dropdown
  $('#batchSelect').val(batch_id);

  students.forEach(function (student){
    if(student.batch_id == batch_id){
      $('#students').append(formatStudent(student));
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


function formatStudent(student, batch) {
  var displayName = student.name || student.login,
      created_at = new Date(student.created_at),
      displayCreatedAt = created_at.getFullYear() + '-' + (created_at.getMonth() + 1) + '-' + created_at.getDate(),
      company = (student.company) ? 'Company: ' + student.company : '';
  return $('<div>')
    .addClass('student')
    .data('login', student.login)
    .data('batch_id', student.batch_id)
    .html('<img src="' + student.avatar_url + '"><h3>' + bleach.sanitize(displayName) + '</h3>')
    .append($('<div>')
      .addClass('additionalInfo')
      .append($('<div>')
        .addClass('followers')
        .text('Followers: ' + student.followers))
      .append($('<div>')
        .addClass('repos')
        .text('Repos: ' + ((options.forks) ? student.public_repos : student.nonfork_repos)))
      .append($('<div>')
        .addClass('created')
        .text("Since: " + displayCreatedAt))
      .append($('<div>')
        .addClass('githubLink')
        .html('<a href="' + student.html_url + '">' + student.html_url + '</a>'))
      .append($('<div>')
        .addClass('company')
        .text(company)));
}


function showRepoInfo(repo) {
  if(repo) {
    $('#repoInfo').css('visibility', 'visible');

    (repo.fork) ? $('#repoInfo').addClass('isfork') : $('#repoInfo').removeClass('isfork');
    $('#repoInfo h3 a')
      .html(bleach.sanitize(repo.name))
      .attr('href', repo.html_url);
    $('#repoInfo .description').html( bleach.sanitize(repo.description));
    if(repo.homepage){
       $('#repoInfo .description').append(' <a href="' +  bleach.sanitize(repo.homepage) + '" title="Project Website">' +  bleach.sanitize(repo.homepage) + '</a>');
    }
    $('#repoInfo .forks span').html(repo.forks_count);
    $('#repoInfo .watchers span').html(repo.watchers_count);
    $('#repoInfo .languages span')
      .html(repo.language)
      .css('color', fill(repo.language));
    $('#repoInfo .created span').text($.timeago(repo.created_at));
    $('#repoInfo .link a')
      .html(repo.html_url)
      .attr('href', repo.html_url);
  } else {
    $('#repoInfo').css('visibility','hidden');
  }
}

function fill (language) {
  return colors[language] || '#DDD';
}

function drawChart (student){

  var r = Math.min(615, ( $('#content').height() - $('#repoInfo').height() ))
    , format = d3.format(",d");

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
    .filter(function (d) { return !d.children; }))
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
    .on('mouseover', showRepoInfo);

  node.append("title")
    .text(function (d) { return d.name + ": " + d.description });

  node.append("circle")
    .attr("r", function (d) { return d.r; })
    .style("fill", function (d) { return fill(d.language); });

  node.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", ".3em")
    .text(function (d) { return d.name.substring(0, d.r / 3); });

  $('#chart .legendContainer').empty();
  student.languages.forEach(function (language){
    $('<div>')
      .addClass(language + ' legend')
      .html('<div style="background-color:' + fill(language) + '"></div>' + language)
      .appendTo('#chart .legendContainer');
  });

  // Returns a flattened hierarchy containing all leaf nodes under the root.
  function classes(student) {
    var repos = _.filter(student.repos, function (repo) {
      repo.value = repo.size;
      return !repo.fork || options.forks; 
    });
    return {children: repos};
  }
}

function getStudentFromLogin (login) {
  return _.find(students, function (student) { return (student.login == login) });
}


function getRandom () {
  //randomize students
  showStudent(students[Math.floor(Math.random() * students.length)]);
  scrollToActiveStudent();
}


function showStudent (student) {
  //hide stats
  $('#repoInfo').css('visibility','hidden');

  //show batch
  renderBatch(student.batch_id);

  //select student div
  $('.student .additionalInfo')
    .slideUp('fast', function () {
      $(this).parents('.student').removeClass('active');
    });
  $('.student')
    .filter(function (){
      return $(this).data('login') == student.login;
    })
    .addClass('active')
    .find('.additionalInfo').slideDown('fast');

  //get student info for chart
  drawChart(student);

  //randomize repos
  var repos = _.filter(student.repos, function (repo) { return !repo.fork || options.forks ; });
  showRepoInfo(repos[_.random(repos.length - 1)]);
}

function scrollToActiveStudent () {
  //scroll to user
  var index = $('.student').index($('.student.active'));
  $('#students').scrollTop(index * 50 - 25);
}


function getMostFollowers () {
  $('#content').hide();
  $('#studentList').empty().show();
  _.sortBy(students, function (student){
    return -student.followers;
  }).forEach(function (student){
    var studentDiv = formatStudent(student);
    $(studentDiv).addClass('followers');
    //$('.followers', studentDiv).append('<a href="https://github.com/users/follow?target=' + student.login + '" class="btn btn-primary">follow</a>');
    $('#studentList').append(studentDiv);
  })
}


function getMostRepos() {
  $('#content').hide();
  $('#studentList')
    .empty()
    .show();
  _.sortBy(students, function (student){
    return -student.nonfork_repos
  }).forEach(function (student){
    var studentDiv = formatStudent(student);
    $(studentDiv).addClass('repos');
    $('.repos', studentDiv).html('Repos: ' + student.nonfork_repos);
    $('#studentList').append(studentDiv);
  })
}


function getMostLanguages() {
  $('#content').hide();
  $('#studentList').empty().show();
  _.sortBy(students, function (student){
    return -student.languages.length;
  }).forEach(function (student){
    var studentDiv = formatStudent(student);
    $(studentDiv).addClass('languages');
    $('.additionalInfo', studentDiv).text(_.reject(student.languages, function (language) { return language == null; }).join(', '));
    $('#studentList').append(studentDiv);
  })
}


function oldestAccount() {
  $('#content').hide();
  $('#studentList').empty().show();
  _.sortBy(students, function (student){
    return Date.parse(student.created_at);
  }).forEach(function (student){
    var studentDiv = formatStudent(student);
    $(studentDiv).addClass('oldest');
    $('#studentList').append(studentDiv);
  })
}

function summary() {
  $('#content').hide();
  $('#studentList').empty().show();


 $('<div>')
    .addClass('summary')
    .append('<h2>Hacker School Summary</h2>')
    .append($('<div>')
      .addClass('title')
      .text('Batches'))
    .append($('<div>')
      .addClass('value')
      .text(batches.length))
    .append('<br>')
    .append($('<div>')
      .addClass('title')
      .text('Students'))
    .append($('<div>')
      .addClass('value')
      .text(students.length))
    .append('<br>')
    .append($('<div>')
      .addClass('title')
      .text('Repos'))
    .append($('<div>')
      .addClass('value')
      .text(_.reduce(students, function(memo, student){
        return memo + student.repos.length;
      }, 0)))
    .append($('<h2>')
      .text('Language Breakdown'))
    .append($('<div>')
      .attr('id', 'langchart')
      .addClass('chart')
      .append($('<div>')
        .addClass('legendContainer'))
      .append($('<div>')
        .addClass('legendContainer')))
    .appendTo('#studentList');

  var languages = _.clone(colors);
  _.each(languages, function(val, key){
    languages[key] = 0;
  });
  students.forEach(function (student){
    student.repos.forEach(function (repo){
      if(repo.language){
        languages[repo.language]++;
      }
    });
  });
  var data = _.filter(_.map(languages, function(val, key){
    return {label: key, value: val};
  }), function(val){
    return val.value > 0;
  });

  //pie chart
  var w = 500,
      h = 500,
      r = Math.min(w, h) / 2;


  var svg = d3.select("#langchart").append("svg")
      .data([data])
      .attr("width", w)
      .attr("height", h)
      .append("g")
      .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");


  var arc = d3.svg.arc()
      .outerRadius(r - 10)
      .innerRadius(r - 70);
 
  var pie = d3.layout.pie()
      .value(function(d) { return d.value; });
 
  var arcs = svg.selectAll("g.slice")
      .data(pie)
      .enter()
        .append("svg:g")
          .attr("class", "slice");

      arcs.append("svg:path")
        .attr("fill", function (d) {return fill(d.data.label); })
          .attr("d", arc);

      arcs.append("svg:text")
        .attr("transform", function(d) {
          d.innerRadius = 0;
          d.outerRadius = r;
          return "translate(" + arc.centroid(d) + ")";
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(function(d) { if((d.endAngle - d.startAngle) > 0.1) { return d.data.label; }});    


 $('#langchart .legendContainer').empty();
  _.sortBy(data, function(item) { return -item.value; }).forEach(function (item, idx){
    var container = (idx < 18) ? $('#langchart .legendContainer:first-child') : $('#langchart .legendContainer:nth-child(2)');
    $('<div>')
      .addClass('legend')
      .html('<div style="background-color:' + fill(item.label) + '"></div>' + item.label + ' (' + item.value + ')')
      .appendTo(container);
  });
 
}
