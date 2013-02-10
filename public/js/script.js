var students
    , options = {
      showPopovers: true
    }
    , colors = {
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
      "Matlab": "#bb92ac"
    };


$(document).ready(function(){
  //Listen for window resize
  window.onresize = resizeWindow;

  //initial options
  updateOptionsFromForm();
  $.getJSON('/api/batches', populateBatches);

  $.getJSON('/api/students', populateStudents);

  //Display options form controls
  $('#batchSelect').change(function(){
    renderBatch($(this).val());
  });

  $('#showForks').change(function(){
    showStudent(getStudentFromLogin($('#students .student.active').data('login')));
  });

  $('#topMenu .nav li a').click(function(){
    hidePopups();
    updateMenu(this);
    return false;
  });

  $('#batches').click(function(){
    hidePopups();
    renderBatch("0");
  });

  $('#random').click(getRandom);

  $('#mostFollowers').click(getMostFollowers);

  $('#mostRepos').click(getMostRepos);

  $('#oldest').click(oldestAccount);

  //Click handler for student divs
  $('#students').on('click', '.student', function(){
    hidePopups();
    showStudent(getStudentFromLogin($(this).data('login')));
  });

  $('#studentList').on('click', '.student', function (){
    hidePopups();
    showStudent(getStudentFromLogin($(this).data('login')));
  });
});

function updateMenu(item){
   $(item)
    .parent().addClass('active')
    .siblings().removeClass('active');
}


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


function populateBatches(batches){
  batches.forEach(function(batch){
    var formattedDate = new Date(batch.startDate);
    $('#batchSelect').append('<option value="' + batch.batch_id + '">' + batch.batch_id + ' (' + (formattedDate.getMonth() + 1) + '/' + formattedDate.getFullYear() + ')</option>');
  });
}


function populateStudents(data){
  students = data;
  renderBatch("0");
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

  students.forEach(function(student){
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
      displayCreatedAt = created_at.getFullYear() + '-' + (created_at.getMonth() + 1) + '-' + created_at.getDate();
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
        .text('Repos: ' + student.public_repos))
      .append($('<div>')
        .addClass('created')
        .html(displayCreatedAt))
      .append($('<div>')
        .addClass('githubLink')
        .html('<a href="' + student.html_url + '">' + student.html_url + '</a>'))
      .append($('<div>')
        .addClass('company')
        .html('Company: ' + student.company || '')));
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
  $('#repoInfo .forks span').html(repo.forks_count);
  $('#repoInfo .watchers span').html(repo.watchers_count);
  $('#repoInfo .languages span')
    .html(repo.language)
    .css('color', colors[repo.language]);
  $('#repoInfo .created span').text($.timeago(repo.created_at));
  $('#repoInfo .link a')
    .html(repo.html_url)
    .attr('href', repo.html_url);
}

function fill(language) {
    return colors[language] || '#DDD';
}

function drawChart(student){

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
    var repos = []
      , languages = [];

    student.repos.forEach(function(repo) {
      //remove forks, if option is set
      if(!repo.fork || options.forks){
        repo.value = repo.size;
        repos.push(repo);
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
    return {children: repos};
  }
}

function getStudentFromLogin(login) {
  return _.find(students, function(student) { return (student.login == login) });
}


function getRandom() {
  //randomize students
  showStudent(students[Math.floor(Math.random() * students.length)]);
}


function showStudent(student) {
  //hide stats
  $('#repoInfo').css('visibility','hidden');

  //show batch
  renderBatch(student.batch_id);

  //select student div
  $('.student')
    .removeClass('active')
    .children('.additionalInfo').slideUp()
    .end()
    .filter(function(){
      return $(this).data('login') == student.login;
    })
    .addClass('active')
    .children('.additionalInfo').slideDown();

  //update options
  updateOptionsFromForm()

  //get student info for chart
  drawChart(student);

  //randomize repos
  showRepoInfo(student.repos[Math.floor(Math.random() * student.repos.length)]);

  //scroll to user
  var index = $('.student').index($('.student.active'));
  $('#students').scrollTop(index * 50 - 25);
}


function getMostFollowers() {
  $('#content').hide();
  $('#studentList').empty().show();
  hidePopups();
  _.sortBy(students, function(student){
    return -student.followers;
  }).forEach(function(student){
    var studentDiv = formatStudent(student);
    $(studentDiv).addClass('followers');
    $('#studentList').append(studentDiv);
  })
}


function getMostRepos() {
  $('#content').hide();
  $('#studentList')
    .empty()
    .show();
  hidePopups();
  _.sortBy(students, function(student, idx){
    students[idx].nonfork_repos = student.repos.filter(function(repo){
      return !repo.fork;
    }).length;
    return -students[idx].nonfork_repos
  }).forEach(function(student){
    var studentDiv = formatStudent(student);
    $(studentDiv).addClass('repos');
    $('.repos', studentDiv).html('Repos: ' + student.nonfork_repos);
    $('#studentList').append(studentDiv);
  })
}


function oldestAccount() {
  $('#content').hide();
  $('#studentList').empty().show();
  hidePopups();
  _.sortBy(students, function(student){
    var created_at = Date.parse(student.created_at);
    return created_at;
  }).forEach(function(student){
    var studentDiv = formatStudent(student);
    $(studentDiv).addClass('oldest');
    $('#studentList').append(studentDiv);
  })
}
