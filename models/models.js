var mongoose = require('mongoose');

var Repo = new mongoose.Schema({
      id: Number,
      name: String,
      full_name: String,
      html_url: String,
      description: String,
      fork: Boolean,
      languages_url: String,
      created_at: Date,
      updated_at: Date,
      size: Number,
      watchers_count: Number,
      language: String,
      forks_count: Number
  }, {strict: true});

var User = mongoose.model('user', new mongoose.Schema({
      login_lower: { type: String, index: true },
      login: String,
      batch_id: Number,
      avatar_url: String,
      gravatar_id: String,
      url: String,
      name: String,
      company: String,
      blog: String,
      location: String,
      email: String,
      hireable: Boolean,
      bio: String,
      public_repos: Number,
      public_gists: Number,
      followers: Number,
      following: Number,
      html_url:  String,
      created_at: Date,
      repos: [Repo]
  }, {strict: true}));