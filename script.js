var token = localStorage.getItem("token");
var payload;
var parsedPayload;
var username;
var userObject;

$(function () {
  var $body = $("body");
  var $loginForm = $("#login-form");
  var $createAccountForm = $("#create-account-form");
  var $articlesContainer = $(".articles-container");
  var $submitForm = $("#submit-form");
  var $allArticlesList = $("#all-articles-list");
  var $nav = $("nav");
  var $navLogin = $("#nav-login");
  var $navWelcome = $("#nav-welcome");
  var $navUserProfile = $('#nav-user-profile');
  var $navLogOut = $("#nav-logout");
  var $navSubmit = $("#nav-submit");
  var $navFavorites = $("#nav-favorites");
  var $navAll = $("#nav-all");
  var $favoritedArticles = $("#favorited-articles");
  var $filteredArticles = $("#filtered-articles");
  var $userProfile = $("#user-profile");
  var $profileName = $("#profile-name");
  var $profileUsername = $("#profile-username");
  var $profileAccountDate = $("#profile-account-date");

  if (token) {
    payload = token.split(".")[1] || undefined;
    parsedPayload = JSON.parse(atob(payload));
    username = parsedPayload.username;
    getUser(username).then(function(user) {
      userObject = user;
      $profileName.text(`Name: ${userObject.data.name}`);
      $profileUsername.text(`Username: ${userObject.data.username}`);
      $profileAccountDate.text(`Account Created: ${userObject.data.createdAt.slice(0, 10)}`);
      firstTenStories($allArticlesList);
    });
  }

  if (username) {
    $navLogin.hide();
    $navUserProfile.html(username);
    $navWelcome.show();
    $navLogOut.show();
  }

  /* SUBMITTING EVENTS */
  $navUserProfile.on("click", e=> {
    $allArticlesList.hide();
    $submitForm.hide();
    $favoritedArticles.hide();
    $filteredArticles.hide();
    $userProfile.show();
  });

  // LOGIN EVENT
  $loginForm.on("submit", e => {
    e.preventDefault();
    var username = $("#login-username").val();
    var password = $("#login-password").val();
    getToken(username, password)
      .then(function () {
        return getUser(username);
      })
      .then(function (user) {
        userObject = user;
        $navUserProfile.html(`${userObject.data.username}`);
        $navLogin.hide();
        $loginForm.hide();
        $createAccountForm.hide();
        $navWelcome.show();
        $navLogOut.show();
        $allArticlesList.show();
      })
      .catch(function (error) {
        alert("USERNAME OR PASSWORD INVALID");
      });

    $loginForm.trigger("reset");
  });
  // END LOGIN EVENT

  // CREATING USER EVENT
  $createAccountForm.on("submit", e => {
    e.preventDefault();
    var name = $("#create-account-name").val();
    var username = $("#create-account-username").val();
    var password = $("#create-account-password").val();
    createUser(name, username, password)
      .then(function () {
        getToken(username, password)
          .then(function () {
            return getUser(username);
          })
          .then(function (user) {
            userObject = user;
            $navWelcome.html(`Hi, ${userObject.data.username}`);
            $navLogin.hide();
            $loginForm.hide();
            $createAccountForm.hide();
            $navWelcome.show();
            $navLogOut.show();
            $allArticlesList.show();
          });
      })
      .catch(function (error) {
        alert("Woops, this user already exists.  Login instead.");
      });

    $createAccountForm.trigger("reset");
  });
  // END CREATING USER EVENT

  // CREATE LOGOUT EVENT
  $navLogOut.on("click", function (e) {
    localStorage.clear();
    location.reload();
  });
  // END LOGOUT EVENT

  // SUBMIT ARTICLE EVENT
  $submitForm.on("submit", e => {
    e.preventDefault();
    let title = $("#title").val();
    let url = $("#url").val();
    let hostName = getHostName(url);
    let author = $("#author").val();
    addStory(title, url, author).then(function (storyObject) {
      let $li = $(`<li id="${storyObject.storyId}">
      <span class="star">
      <i class="far fa-star"></i>
      </span>
      <a class="article-link" href="${url}" target="a_blank">
        <strong>${title}</strong>
       </a>
      <small class="article-hostname ${hostName}">(${hostName})</small>
      <small class="article-author">by ${author}</small>
      </li>`);
      $allArticlesList.prepend($li);
      getUser(username).then(function (user) {
        userObject = user;
      });
    });
    $submitForm.slideUp("slow");
    $submitForm.trigger("reset");
  });
  // END SUBMIT ARTICLE EVENT
  /* END SUBMITTING EVENTS */

  /* GENERATING LISTS*/
  // STARRING FAVORITES EVENT
  $articlesContainer.on("click", ".star", e => {
    if (!token) {
      mustLogin(
        $loginForm,
        $createAccountForm,
        $submitForm,
        $allArticlesList,
        $filteredArticles,
        $favoritedArticles
      )
    } else {
      let $closestLi = $(e.target).closest("li");
      let storyId = $closestLi.attr("id");
      if ($closestLi.hasClass("favorite")) {
        removeFromFavorites(storyId, $favoritedArticles);
        removeFromAPIFavorites(username, storyId).then(function (user) {
          userObject = user;
        })
      } else {
        addToFavorites(storyId, $favoritedArticles);
        addToAPIFavorites(username, storyId).then(function (user) {
          userObject = user;
        })
      }
    }
  });
  // END STARRING FAVORITED EVENT

  // FILTERING ARTICLES EVENT
  $articlesContainer.on("click", ".article-hostname", e => {
    let selectedHost = $(e.target).text();
    $submitForm.hide();
    $allArticlesList.hide();
    $favoritedArticles.hide();
    $navFavorites.hide();
    $navAll.show();
    generateFiltered(selectedHost, $filteredArticles);
    $filteredArticles.show();
  });

  // END FILTERING ARTICLES EVENT
  /* END GENERATING LISTS*/

  /* NAVIGATING */
  // NAVIGATE TO LOGIN
  $navLogin.on("click", e => {
    $loginForm.slideDown();
    $createAccountForm.slideDown();
    $submitForm.hide();
    $allArticlesList.hide();
    $filteredArticles.hide();
    $favoritedArticles.hide();
  });
  // NAVIGATE TO LOGIN END

  // NAVIGATING TO SUBMIT ARTICLE
  $navSubmit.on("click", e => {
    if (!token) {
      mustLogin(
        $loginForm,
        $createAccountForm,
        $submitForm,
        $allArticlesList,
        $filteredArticles,
        $favoritedArticles
      );
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
  // NAVIGATING TO SUBMIT ARTICLE

  // SWITCHING BETWEEN ALL AND FAVORITES
  $body.on("click", "#nav-favorites, #nav-all, #profile-favorites", e => {
    $submitForm.hide();
    $filteredArticles.hide();
    $loginForm.hide();
    $createAccountForm.hide();
    if ($navFavorites.is(":visible")) {
      $navFavorites.hide();
      $navAll.show();
      $allArticlesList.hide();
      generateFaves($favoritedArticles, userObject);
      $favoritedArticles.show();
    } else {
      $navFavorites.show();
      $navAll.hide();
      $favoritedArticles.hide();
      $allArticlesList.show();
    }
  });
  // END SWITCHING BETWEEN ALL AND FAVORITES
});