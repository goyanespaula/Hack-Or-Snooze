var token = localStorage.getItem("token");
var payload;
var parsedPayload;
var globalUsername;
var userObject;

$(function () {
  var $body = $("body");
  var $loginForm = $("#login-form");
  var $createAccountForm = $("#create-account-form");
  var $articlesContainer = $(".articles-container");
  var $submitForm = $("#submit-form");
  var $allArticlesList = $("#all-articles-list");
  var $navLogin = $("#nav-login");
  var $navWelcome = $("#nav-welcome");
  var $navUserProfile = $('#nav-user-profile');
  var $navLogOut = $("#nav-logout");
  var $navSubmit = $("#nav-submit");
  var $navAll = $("#nav-all");
  var $navMyFavorites = $("#nav-my-favorites");
  var $favoritedArticles = $("#favorited-articles");
  var $filteredArticles = $("#filtered-articles");
  var $myArticles = $("#my-articles");
  var $userProfile = $("#user-profile");
  var $profileName = $("#profile-name");
  var $profileUsername = $("#profile-username");
  var $profileAccountDate = $("#profile-account-date");

  if (token) {
    payload = token.split(".")[1] || undefined;
    parsedPayload = JSON.parse(atob(payload));
    globalUsername = parsedPayload.username;
    getUser(globalUsername).then(function (user) {
      userObject = user;
      $profileName.text(`Name: ${userObject.data.name}`);
      $profileUsername.text(`Username: ${userObject.data.username}`);
      $profileAccountDate.text(`Account Created: ${userObject.data.createdAt.slice(0, 10)}`);
      $navLogin.hide();
      $navUserProfile.text(globalUsername);
      $navWelcome.show();
      $navLogOut.show();
      $myArticles.hide();
      firstTenStories($allArticlesList);
    });
  } else {
    firstTenStories($allArticlesList);
  }

  /* SUBMITTING EVENTS */
  // LOGIN EVENT
  $loginForm.on("submit", e => {
    e.preventDefault();
    let username = $("#login-username").val();
    let password = $("#login-password").val();
    getToken(username, password)
      .then(function () {
        return getUser(globalUsername);
      })
      .then(function (user) {
        userObject = user;
        $navUserProfile.text(`${userObject.data.username}`);
        $navLogin.hide();
        $loginForm.hide();
        $createAccountForm.hide();
        $navWelcome.show();
        $navLogOut.show();
        $allArticlesList.show();
        $myArticles.hide();
        firstTenStories($allArticlesList);
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
    let name = $("#create-account-name").val();
    let username = $("#create-account-username").val();
    let password = $("#create-account-password").val();
    createUser(name, username, password)
      .then(function () {
        getToken(username, password)
          .then(function () {
            return getUser(username);
          })
          .then(function (user) {
            userObject = user;
            $navWelcome.html(`${userObject.data.username}`);
            $navLogin.hide();
            $loginForm.hide();
            $createAccountForm.hide();
            $navWelcome.show();
            $navLogOut.show();
            $allArticlesList.show();
            $myArticles.hide();
          });
      })
      .catch(function (error) {
        alert("Woops, this user already exists. Login instead.");
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
      let $li = $(`<li id="${storyObject.storyId}" class="id-${storyObject.storyId}">
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
      getUser(globalUsername).then(function (user) {
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
        $favoritedArticles,
      )
    } else {
      let $closestLi = $(e.target).closest("li");
      let storyId = $closestLi.attr("id");
      if ($closestLi.hasClass("favorite")) {
        removeFromAPIFavorites(globalUsername, storyId).then(function (user) {
          userObject = user;
          removeFromFavorites(storyId, $favoritedArticles);
        });
      } else {
        addToAPIFavorites(globalUsername, storyId).then(function (user) {
          userObject = user;
          addToFavorites(storyId, $favoritedArticles);
        })
      }
    }
  });
  // END STARRING FAVORITED EVENT

  // DELETING A STORY
  $myArticles.on("click", ".trash-can", e => {
    let $closestLi = $(e.target).closest("li");
    let storyId = $closestLi.attr("id");
    deleteStory(storyId).then(function () {
      getUser(globalUsername).then(function (user) {
        userObject = user;
        generateMyStories($myArticles);
      })
    });
  });
  // END DELETING A STORY

  // FILTERING ARTICLES EVENT
  $articlesContainer.on("click", ".article-hostname", e => {
    let selectedHost = $(e.target).text();
    $submitForm.hide();
    $allArticlesList.hide();
    $favoritedArticles.hide();
    $myArticles.hide();
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
    $myArticles.hide();
  });
  // NAVIGATE TO LOGIN END

  // NAVIGATE TO USER PROFILE
  $navUserProfile.on("click", e => {
    $allArticlesList.hide();
    $myArticles.hide();
    $favoritedArticles.hide();
    $filteredArticles.hide();
    $submitForm.hide();
    $userProfile.show();
  });
  // END NAVIGATE TO USER PROFILE

  // NAVIGATING TO SUBMIT ARTICLE
  $navSubmit.on("click", e => {
    if (!token) {
      mustLogin(
        $loginForm,
        $createAccountForm,
        $submitForm,
        $allArticlesList,
        $filteredArticles,
        $favoritedArticles,
      );
    } else {
      $favoritedArticles.hide();
      $myArticles.hide();
      $allArticlesList.show();
      $filteredArticles.hide();
      $loginForm.hide();
      $createAccountForm.hide();
      $userProfile.hide();

      $submitForm.slideToggle();
    }
  });
  // NAVIGATING TO SUBMIT ARTICLE

  // NAVIGATING TO FAVORITES
  $body.on("click", "#nav-favorites, #profile-favorites", e => {
    $submitForm.hide();
    $filteredArticles.hide();
    $loginForm.hide();
    $createAccountForm.hide();
    $myArticles.hide();
    if (!token) {
      mustLogin($loginForm, $createAccountForm, $submitForm, $allArticlesList, $filteredArticles, $favoritedArticles);
    } else {
      $userProfile.hide();
      $allArticlesList.hide();
      generateFaves($favoritedArticles, userObject);
      $favoritedArticles.show();
    }
  });
  // END NAVIGATING TO FAVORITES

  // NAVIGATING TO ALL
  $body.on("click", "#nav-all", e => {
    $submitForm.hide();
    $filteredArticles.hide();
    $loginForm.hide();
    $createAccountForm.hide();
    $myArticles.hide();
    $favoritedArticles.hide();
    $userProfile.hide();
    $allArticlesList.show();
    firstTenStories($allArticlesList);
  });
  // END NAVIGATING TO ALL

  // NAVIGATING TO MY STORIES
  $body.on("click", "#profile-my-stories, #nav-my-stories", e => {
    $submitForm.hide();
    $filteredArticles.hide();
    $loginForm.hide();
    $createAccountForm.hide();
    $favoritedArticles.hide();
    $allArticlesList.hide();
    if (!token) {
      mustLogin($loginForm, $createAccountForm, $submitForm, $allArticlesList, $filteredArticles, $favoritedArticles);
    } else {
      $userProfile.hide();
      generateMyStories($myArticles)
      $myArticles.show();
    }
  });
  // END NAVIGATING TO MY STORIES

});