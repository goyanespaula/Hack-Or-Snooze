var id = 3;
var token = localStorage.getItem("token");
if (token) {
  var payload = token.split(".")[1] || undefined;
  var parsedPayload = JSON.parse(atob(payload));
  var username = parsedPayload.username;
  var userObject = getUser(username).then(function(user) {
    return user;
  });
}

$(function () {
  var $loginForm = $('#login-form');
  var $createAccountForm = $('#create-account-form');
  var $articlesContainer = $('.articles-container');
  var $submitForm = $('#submit-form');
  var $allArticlesList = $('#all-articles-list');
  var $nav = $('nav');
  var $navLogin = $("#nav-login");
  var $navWelcome = $("#nav-welcome");
  var $navLogOut = $('#nav-logout');
  var $navSubmit = $('#nav-submit');
  var $navFavorites = $('#nav-favorites');
  var $navAll = $('#nav-all');
  var $favoritedArticles = $('#favorited-articles');
  var $filteredArticles = $('#filtered-articles');

  if (username) {
    $navLogin.hide();
    $navWelcome.html('Hi, ' + username);
    $navWelcome.show();
    $navLogOut.show();
  }

  firstTenStories($allArticlesList);

  // CREATING LOGIN EVENT
  $loginForm.on('submit', e => {
    e.preventDefault();
    var username = $('#login-username').val();
    var password = $('#login-password').val();
    getToken(username, password).then(function () {
      return getUser(username);
    }).then(function (user) {
      userObject = user;
      $navWelcome.html(`Hi, ${userObject.data.username}`);
      $navLogin.hide();
      $loginForm.hide();
      $createAccountForm.hide();
      $navWelcome.show();
      $navLogOut.show();
      $allArticlesList.show();
    }).catch(function (error) {
      alert("USERNAME OR PASSWORD INVALID");
    });

    $loginForm.trigger("reset");
  });
  // END LOGIN EVENT

  // CREATING USER EVENT
  $createAccountForm.on('submit', e => {
    e.preventDefault();
    var name = $('#create-account-name').val();
    var username = $('#create-account-username').val();
    var password = $('#create-account-password').val();
    createUser(name, username, password).then(function () {
      getToken(username, password).then(function () {
        return getUser(username)
      }).then(function (user) {
        userObject = user;
        $navWelcome.html(`Hi, ${userObject.data.username}`);
        $navLogin.hide();
        $loginForm.hide();
        $createAccountForm.hide();
        $navWelcome.show();
        $navLogOut.show();
        $allArticlesList.show();
      })
    }).catch(function (error) {
      alert("Woops, this user already exists.  Login instead.");
    });

    $createAccountForm.trigger("reset");
  });
  // END CREATING USER EVENT

  $navLogin.on('click', e => {
    $loginForm.slideDown();
    $createAccountForm.slideDown();
    $submitForm.hide();
    $allArticlesList.hide();
    $filteredArticles.hide();
    $favoritedArticles.hide();
  });

  // CREATE LOGOUT EVENT
  $navLogOut.on('click', function (e) {
    localStorage.clear();
    location.reload();
  });
  // END LOGOUT EVENT

  $navSubmit.on('click', e => {
    if (!token) {
      mustLogin($loginForm, $createAccountForm, $submitForm, $allArticlesList, $filteredArticles, $favoritedArticles);
    } else {
      $favoritedArticles.hide();
      $allArticlesList.show();
      $filteredArticles.hide();
      $loginForm.hide();
      $createAccountForm.hide();
      if ($navAll.is(":visible")) {
        $navAll.hide();
        $navFavorites.show();
      }
      $submitForm.slideToggle();
    }
  });

  $nav.on('click', '#nav-favorites, #nav-all', e => {
    $submitForm.hide();
    $filteredArticles.hide();
    $loginForm.hide();
    $createAccountForm.hide();
    if ($navFavorites.is(':visible')) {
      $navFavorites.hide();
      $navAll.show();
      $allArticlesList.hide();
      generateFaves($favoritedArticles);
      $favoritedArticles.show();
    } else {
      $navFavorites.show();
      $navAll.hide();
      $favoritedArticles.hide();
      $allArticlesList.show();
    }
  });

  $submitForm.on('submit', e => {
    e.preventDefault();
    let title = $('#title').val();
    let url = $('#url').val()
    let hostName = getHostName(url);
    let author = $('#author').val();
    id++;
    let $li = $(`<li id="${id}" class="id-${id}">
      <span class="star">
      <i class="far fa-star"></i>
      </span>
      <a class="article-link" href="${url}" target="a_blank">
        <strong>${title}</strong>
       </a>
      <small class="article-hostname ${hostName}">(${hostName})</small>
      <small class="article-author">by ${author}</small>
      </li>`);
    addStory(title, url, author).then(function() {
      getUser(username).then(function(user) {
        userObject = user;
      })
    });
    $allArticlesList.prepend($li);
    $submitForm.slideUp('slow');
    $submitForm.trigger('reset');
  });

  $articlesContainer.on('click', '.star', e => {
    let $closestLi = $(e.target).closest('li');
    let $liID = $closestLi.attr('id');
    if ($closestLi.hasClass('favorite')) {
      removeFromFavorites($liID, $favoritedArticles);
    } else {
      addtoFavorites($liID, $favoritedArticles);
    }
  });

  $articlesContainer.on('click', '.article-hostname', e => {
    let selectedHost = $(e.target).text();
    $submitForm.hide();
    $allArticlesList.hide();
    $favoritedArticles.hide();
    $navFavorites.hide();
    $navAll.show();
    generateFiltered(selectedHost, $filteredArticles);
    $filteredArticles.show();
  });
});
